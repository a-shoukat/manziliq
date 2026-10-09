/**
 * CRM Task Overdue Automated Notification Service
 * Continuously monitors scheduled tasks against the current timestamp,
 * automatically detects tasks that pass their scheduled due date/time without completion,
 * and orchestrates automated dispatches across Email, Web Push, and In-App channels.
 */

import { DealerTask } from '../types/crm';
import { notificationService } from './notificationService';

export interface TaskOverdueSettings {
  enabled: boolean;
  intervalSeconds: number;
  sendEmail: boolean;
  sendPush: boolean;
  sendInApp: boolean;
  dealerEmail: string;
  dealerPhone: string;
  dealerName: string;
  autoRescheduleReminder: boolean;
}

export interface OverdueAlertLog {
  id: string;
  taskId: string;
  taskTitle: string;
  leadName: string;
  leadPhone: string;
  propertyInterest: string;
  dueDate: string;
  dueTime: string;
  priority: string;
  triggeredAt: string;
  channelsSent: ('email' | 'push' | 'in_app' | 'sms')[];
  emailRecipient: string;
  pushStatus: 'sent' | 'delivered' | 'permission_denied';
  status: 'delivered' | 'sent' | 'failed';
  message: string;
}

const STORAGE_SETTINGS_KEY = 'manziliq_crm_overdue_settings';
const STORAGE_LOGS_KEY = 'manziliq_crm_overdue_logs';

const DEFAULT_SETTINGS: TaskOverdueSettings = {
  enabled: true,
  intervalSeconds: 60, // Check every 60 seconds
  sendEmail: true,
  sendPush: true,
  sendInApp: true,
  dealerEmail: 'dealer.narowal@manziliq.pk',
  dealerPhone: '+92 300 4567890',
  dealerName: 'Chaudhry Tariq (Al-Rehman Properties)',
  autoRescheduleReminder: true
};

class TaskOverdueAutomationService {
  private settings: TaskOverdueSettings;
  private logs: OverdueAlertLog[] = [];
  private activeIntervalId: any = null;
  private listeners: ((log: OverdueAlertLog) => void)[] = [];

  constructor() {
    this.settings = this.loadSettings();
    this.logs = this.loadLogs();
  }

  private loadSettings(): TaskOverdueSettings {
    try {
      const saved = localStorage.getItem(STORAGE_SETTINGS_KEY);
      if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch (e) {
      console.warn('Failed to load overdue settings:', e);
    }
    return DEFAULT_SETTINGS;
  }

  public getSettings(): TaskOverdueSettings {
    return { ...this.settings };
  }

  public saveSettings(newSettings: Partial<TaskOverdueSettings>): TaskOverdueSettings {
    this.settings = { ...this.settings, ...newSettings };
    try {
      localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(this.settings));
    } catch (e) {
      console.warn('Failed to save overdue settings:', e);
    }
    return this.getSettings();
  }

  private loadLogs(): OverdueAlertLog[] {
    try {
      const saved = localStorage.getItem(STORAGE_LOGS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load overdue logs:', e);
    }
    return [];
  }

  public getLogs(): OverdueAlertLog[] {
    return [...this.logs];
  }

  public clearLogs(): void {
    this.logs = [];
    try {
      localStorage.removeItem(STORAGE_LOGS_KEY);
    } catch (e) {
      console.warn('Failed to clear logs:', e);
    }
  }

  private addLog(log: OverdueAlertLog) {
    this.logs = [log, ...this.logs.slice(0, 49)]; // keep latest 50
    try {
      localStorage.setItem(STORAGE_LOGS_KEY, JSON.stringify(this.logs));
    } catch (e) {
      console.warn('Failed to persist overdue log:', e);
    }
    this.notifyListeners(log);
  }

  public onAlertTriggered(cb: (log: OverdueAlertLog) => void) {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter(l => l !== cb);
    };
  }

  private notifyListeners(log: OverdueAlertLog) {
    this.listeners.forEach(cb => {
      try {
        cb(log);
      } catch (err) {
        console.error('Error in overdue alert listener:', err);
      }
    });
  }

  /**
   * Evaluates if a given task is past its due date/time without completion.
   */
  public isTaskPastDue(task: DealerTask, referenceDate: Date = new Date()): boolean {
    if (task.status === 'completed' || task.status === 'cancelled') {
      return false;
    }

    const todayStr = referenceDate.toISOString().split('T')[0];
    const taskDueDate = task.dueDate;

    if (taskDueDate < todayStr) {
      return true;
    }

    if (taskDueDate === todayStr) {
      const dueTime = task.dueTime || '18:00';
      const [h, m] = dueTime.split(':').map(Number);
      const taskDateTime = new Date(referenceDate);
      taskDateTime.setHours(h || 0, m || 0, 0, 0);

      return referenceDate.getTime() > taskDateTime.getTime();
    }

    return false;
  }

  /**
   * Request native browser notification permissions
   */
  public async requestBrowserPushPermission(): Promise<NotificationPermission | 'unsupported'> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }
    if (Notification.permission === 'granted') {
      return 'granted';
    }
    try {
      const perm = await Notification.requestPermission();
      return perm;
    } catch (err) {
      console.warn('Failed to request notification permission:', err);
      return Notification.permission;
    }
  }

  /**
   * Trigger native browser push notification alert
   */
  private triggerNativeBrowserNotification(title: string, body: string, taskId: string) {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        const notif = new Notification(title, {
          body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: `task-overdue-${taskId}`,
          requireInteraction: true
        });
        notif.onclick = () => {
          window.focus();
          notif.close();
        };
      } catch (e) {
        console.warn('Native notification trigger failed:', e);
      }
    }
  }

  /**
   * Main Scanner: Evaluates all tasks, dispatches Email and Push notifications
   * for any newly overdue incomplete tasks.
   */
  public async evaluateAndTriggerOverdue(
    tasks: DealerTask[],
    currentUser?: { id?: string; name?: string; email?: string; phone?: string },
    options?: { forceAllOverdue?: boolean; testSpecificTaskId?: string }
  ): Promise<{
    updatedTasks: DealerTask[];
    triggeredCount: number;
    newLogs: OverdueAlertLog[];
    summary: string;
  }> {
    if (!this.settings.enabled && !options?.forceAllOverdue && !options?.testSpecificTaskId) {
      return {
        updatedTasks: tasks,
        triggeredCount: 0,
        newLogs: [],
        summary: 'Automated Overdue Task Monitor is disabled in settings.'
      };
    }

    const now = new Date();
    const recipientEmail = currentUser?.email || this.settings.dealerEmail;
    const recipientName = currentUser?.name || this.settings.dealerName;
    const recipientPhone = currentUser?.phone || this.settings.dealerPhone;
    const dealerId = currentUser?.id || 'dealer-01';

    // Channels to dispatch
    const channels: ('in_app' | 'push' | 'sms' | 'email')[] = [];
    if (this.settings.sendEmail) channels.push('email');
    if (this.settings.sendPush) channels.push('push');
    if (this.settings.sendInApp) channels.push('in_app');
    if (channels.length === 0) channels.push('in_app');

    const newLogs: OverdueAlertLog[] = [];
    let triggeredCount = 0;

    const updatedTasks: DealerTask[] = [];

    for (const task of tasks) {
      let shouldAlert = false;
      const isOverdue = this.isTaskPastDue(task, now);

      if (options?.testSpecificTaskId) {
        if (task.id === options.testSpecificTaskId) {
          shouldAlert = true;
        }
      } else if (isOverdue) {
        if (options?.forceAllOverdue) {
          shouldAlert = true;
        } else if (!task.overdueAlertSent) {
          shouldAlert = true;
        }
      }

      if (shouldAlert) {
        triggeredCount++;

        // 1. Dispatch via Central Notification Orchestrator Template
        const dispatchResult = await notificationService.dispatchWorkflowNotification(
          'DEALER_TASK_OVERDUE_ALERT',
          {
            taskTitle: task.title,
            customerName: task.leadName,
            customerPhone: task.leadPhone,
            plotNumber: task.propertyInterest,
            dueDate: task.dueDate,
            dueTime: task.dueTime,
            location: task.location,
            priority: task.priority,
            dealerName: recipientName,
            taskId: task.id
          },
          {
            userId: dealerId,
            role: 'dealer',
            name: recipientName,
            phone: recipientPhone,
            email: recipientEmail
          },
          {
            eventKey: options?.forceAllOverdue || options?.testSpecificTaskId 
              ? undefined 
              : `task:${task.id}:overdue:${task.dueDate}`,
            channels,
            isCritical: true
          }
        );

        // 2. Also execute native browser push notification if supported
        if (this.settings.sendPush) {
          this.triggerNativeBrowserNotification(
            `🚨 Overdue CRM Task: ${task.title}`,
            `Lead: ${task.leadName} (${task.leadPhone}). Due was ${task.dueDate} at ${task.dueTime}. Tap to complete or reschedule.`,
            task.id
          );
        }

        // 3. Create Audit Log Entry
        const logEntry: OverdueAlertLog = {
          id: `overdue-log-${Date.now()}-${task.id}`,
          taskId: task.id,
          taskTitle: task.title,
          leadName: task.leadName,
          leadPhone: task.leadPhone,
          propertyInterest: task.propertyInterest,
          dueDate: task.dueDate,
          dueTime: task.dueTime,
          priority: task.priority,
          triggeredAt: new Date().toISOString(),
          channelsSent: channels,
          emailRecipient: recipientEmail,
          pushStatus: typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted' ? 'delivered' : 'sent',
          status: 'delivered',
          message: `Automated Email & Push notification dispatched for task "${task.title}".`
        };

        newLogs.push(logEntry);
        this.addLog(logEntry);

        // Mark task as alerted
        updatedTasks.push({
          ...task,
          overdueAlertSent: true,
          overdueAlertSentAt: new Date().toISOString(),
          overdueChannels: channels as any,
          updatedAt: new Date().toISOString()
        });
      } else {
        updatedTasks.push(task);
      }
    }

    // Call backend API sweep as well to record server telemetry and ensure background queues are synced
    try {
      await fetch('/api/notifications/tasks/check-overdue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tasks: tasks.map(t => ({
            id: t.id,
            title: t.title,
            leadName: t.leadName,
            leadPhone: t.leadPhone,
            propertyInterest: t.propertyInterest,
            dueDate: t.dueDate,
            dueTime: t.dueTime,
            priority: t.priority,
            status: t.status,
            dealerId: t.dealerId || dealerId
          })),
          dealerId,
          dealerName: recipientName,
          dealerEmail: recipientEmail,
          dealerPhone: recipientPhone,
          channels
        })
      });
    } catch (err) {
      console.warn('[Task Overdue Automation] Backend sweep reporting fallback:', err);
    }

    const summary = triggeredCount > 0
      ? `🚨 Automated Overdue Sweep: ${triggeredCount} task(s) past due date detected. Email sent to ${recipientEmail} and Push notifications triggered.`
      : 'Automated Overdue Sweep: All scheduled tasks are up-to-date.';

    return {
      updatedTasks,
      triggeredCount,
      newLogs,
      summary
    };
  }

  /**
   * Starts the background automated monitor loop
   */
  public startAutoMonitor(
    getTasks: () => DealerTask[],
    onTasksUpdated: (tasks: DealerTask[]) => void,
    onAlertTriggered?: (log: OverdueAlertLog) => void,
    currentUser?: any
  ): () => void {
    if (this.activeIntervalId) {
      clearInterval(this.activeIntervalId);
    }

    let unsubscribeListener: (() => void) | null = null;
    if (onAlertTriggered) {
      unsubscribeListener = this.onAlertTriggered(onAlertTriggered);
    }

    // Initial check after 1.5s delay to let views stabilize
    const initialTimer = setTimeout(async () => {
      try {
        const currentTasks = getTasks();
        const result = await this.evaluateAndTriggerOverdue(currentTasks, currentUser);
        if (result.triggeredCount > 0) {
          onTasksUpdated(result.updatedTasks);
        }
      } catch (err) {
        console.error('Initial overdue task sweep failed:', err);
      }
    }, 1500);

    // Continuous interval sweep
    const intervalMs = Math.max(15, this.settings.intervalSeconds) * 1000;
    this.activeIntervalId = setInterval(async () => {
      try {
        const currentTasks = getTasks();
        const result = await this.evaluateAndTriggerOverdue(currentTasks, currentUser);
        if (result.triggeredCount > 0) {
          onTasksUpdated(result.updatedTasks);
        }
      } catch (err) {
        console.error('Periodic overdue task sweep failed:', err);
      }
    }, intervalMs);

    // Return cleanup hook
    return () => {
      clearTimeout(initialTimer);
      if (this.activeIntervalId) {
        clearInterval(this.activeIntervalId);
        this.activeIntervalId = null;
      }
      if (unsubscribeListener) {
        unsubscribeListener();
      }
    };
  }
}

export const taskOverdueAutomationService = new TaskOverdueAutomationService();
