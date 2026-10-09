import React, { useState, useEffect } from 'react';
import { 
  X, 
  Bell, 
  Mail, 
  Smartphone, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  RefreshCw, 
  ShieldCheck, 
  Send, 
  Trash2, 
  Sliders, 
  Info,
  ExternalLink,
  Volume2
} from 'lucide-react';
import { 
  taskOverdueAutomationService, 
  TaskOverdueSettings, 
  OverdueAlertLog 
} from '../../services/taskOverdueAutomationService';
import { DealerTask } from '../../types/crm';

interface TaskOverdueAutomationModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: DealerTask[];
  onTasksUpdated: (tasks: DealerTask[]) => void;
  currentUser?: { id?: string; name?: string; email?: string; phone?: string };
  onTriggerToast: (toast: { title: string; message: string; type?: string }) => void;
}

export const TaskOverdueAutomationModal: React.FC<TaskOverdueAutomationModalProps> = ({
  isOpen,
  onClose,
  tasks,
  onTasksUpdated,
  currentUser,
  onTriggerToast
}) => {
  const [settings, setSettings] = useState<TaskOverdueSettings>(taskOverdueAutomationService.getSettings());
  const [logs, setLogs] = useState<OverdueAlertLog[]>(taskOverdueAutomationService.getLogs());
  const [isScanning, setIsScanning] = useState(false);
  const [activeTab, setActiveTab] = useState<'settings' | 'logs' | 'preview'>('settings');
  const [browserPermission, setBrowserPermission] = useState<string>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported'
  );

  useEffect(() => {
    if (isOpen) {
      setSettings(taskOverdueAutomationService.getSettings());
      setLogs(taskOverdueAutomationService.getLogs());
      if (typeof window !== 'undefined' && 'Notification' in window) {
        setBrowserPermission(Notification.permission);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggle = (key: keyof TaskOverdueSettings) => {
    const updated = taskOverdueAutomationService.saveSettings({
      [key]: !settings[key]
    });
    setSettings(updated);
  };

  const handleInputChange = (key: keyof TaskOverdueSettings, value: any) => {
    const updated = taskOverdueAutomationService.saveSettings({
      [key]: value
    });
    setSettings(updated);
  };

  const handleRequestPermission = async () => {
    const result = await taskOverdueAutomationService.requestBrowserPushPermission();
    setBrowserPermission(result);
    if (result === 'granted') {
      onTriggerToast({
        title: '📲 Push Notifications Enabled',
        message: 'Browser push notifications are now authorized for overdue task reminders.',
        type: 'call'
      });
    }
  };

  const handleRunManualSweep = async () => {
    setIsScanning(true);
    try {
      const result = await taskOverdueAutomationService.evaluateAndTriggerOverdue(
        tasks,
        currentUser,
        { forceAllOverdue: true }
      );
      if (result.triggeredCount > 0) {
        onTasksUpdated(result.updatedTasks);
      }
      setLogs(taskOverdueAutomationService.getLogs());
      onTriggerToast({
        title: result.triggeredCount > 0 ? '🚨 Overdue Alerts Dispatched' : '✅ Overdue Check Complete',
        message: result.summary,
        type: result.triggeredCount > 0 ? 'overdue' : 'task'
      });
    } catch (err: any) {
      console.error('Sweep error:', err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleTestSpecificAlert = async () => {
    const targetTask = tasks.find(t => t.status !== 'completed') || tasks[0];
    if (!targetTask) {
      alert('No tasks available to test alert.');
      return;
    }

    setIsScanning(true);
    try {
      const result = await taskOverdueAutomationService.evaluateAndTriggerOverdue(
        tasks,
        currentUser,
        { testSpecificTaskId: targetTask.id }
      );
      if (result.triggeredCount > 0) {
        onTasksUpdated(result.updatedTasks);
      }
      setLogs(taskOverdueAutomationService.getLogs());
      onTriggerToast({
        title: '📧 Overdue Test Alert Dispatched',
        message: `Triggered simulated overdue Email & Push notice for "${targetTask.title}". Sent to ${settings.dealerEmail}.`,
        type: 'overdue'
      });
    } catch (err) {
      console.error('Test alert error:', err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleClearLogs = () => {
    if (confirm('Are you sure you want to clear all overdue trigger history logs?')) {
      taskOverdueAutomationService.clearLogs();
      setLogs([]);
    }
  };

  const overdueIncompleteTasks = tasks.filter(t => taskOverdueAutomationService.isTaskPastDue(t));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-slate-900 text-white px-6 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Clock className="w-5 h-5 text-rose-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-white">Automated Overdue Task Trigger System</h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  settings.enabled 
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' 
                    : 'bg-slate-500/20 text-slate-300 border-slate-400/30'
                }`}>
                  {settings.enabled ? 'ACTIVE' : 'PAUSED'}
                </span>
              </div>
              <p className="text-xs text-rose-200/80 mt-0.5">
                Automatically dispatches Email & Push notifications whenever tasks pass their due date
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-nav tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 shrink-0">
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'settings'
                ? 'border-rose-600 text-rose-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Automation Controls & Channels</span>
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'logs'
                ? 'border-rose-600 text-rose-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Dispatched Alerts Log ({logs.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'preview'
                ? 'border-rose-600 text-rose-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email & Push Payload Preview</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Quick Summary Pill Bar */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3">
              <div className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">Overdue Tasks Now</div>
              <div className="text-2xl font-black text-rose-900 mt-0.5">{overdueIncompleteTasks.length}</div>
              <div className="text-[10px] text-rose-600">Pending completion</div>
            </div>
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-3">
              <div className="text-[11px] font-bold text-teal-700 uppercase tracking-wider">Scan Frequency</div>
              <div className="text-2xl font-black text-teal-900 mt-0.5">{settings.intervalSeconds}s</div>
              <div className="text-[10px] text-teal-600">Background monitor loop</div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Alerts Dispatched</div>
              <div className="text-2xl font-black text-slate-900 mt-0.5">{logs.length}</div>
              <div className="text-[10px] text-slate-500">Historical telemetry</div>
            </div>
          </div>

          {activeTab === 'settings' && (
            <div className="space-y-5">
              {/* Master Toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50/70">
                <div className="space-y-0.5">
                  <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <span>Automated Overdue Task Scanner</span>
                    {settings.enabled ? (
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                    ) : null}
                  </div>
                  <p className="text-xs text-slate-500">
                    Runs in the background every {settings.intervalSeconds}s to detect uncompleted tasks past due date.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle('enabled')}
                  className={`w-12 h-6 rounded-full transition-colors p-1 cursor-pointer flex items-center ${
                    settings.enabled ? 'bg-emerald-600 justify-end' : 'bg-slate-300 justify-start'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-xs" />
                </button>
              </div>

              {/* Notification Channels Configuration */}
              <div className="border border-slate-200 rounded-xl p-4 space-y-4">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-rose-600" />
                  <span>Target Notification Channels (Automated Trigger)</span>
                </h4>

                {/* Email Channel */}
                <div className="flex items-start justify-between gap-4 p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900">Email Notification Alert</div>
                      <div className="text-[11px] text-slate-500">
                        Sends a high-priority branded HTML email alert with full task summary, client phone, and direct resolution links.
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <label className="text-[11px] font-bold text-slate-600">Send to:</label>
                        <input
                          type="email"
                          value={settings.dealerEmail}
                          onChange={(e) => handleInputChange('dealerEmail', e.target.value)}
                          className="px-2.5 py-1 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-rose-500 focus:outline-hidden w-64 bg-white"
                          placeholder="dealer@manziliq.pk"
                        />
                      </div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.sendEmail}
                    onChange={() => handleToggle('sendEmail')}
                    className="w-4 h-4 text-rose-600 rounded-md mt-1 cursor-pointer"
                  />
                </div>

                {/* Push Notification Channel */}
                <div className="flex items-start justify-between gap-4 p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900">Push Notifications (FCM / Web Push)</div>
                      <div className="text-[11px] text-slate-500">
                        Pushes instantaneous lock-screen and browser desktop notifications when tasks go past their due time.
                      </div>
                      <div className="mt-2 flex items-center gap-3">
                        <span className="text-[11px] text-slate-500">
                          Browser Permission: <strong className="text-slate-800 uppercase">{browserPermission}</strong>
                        </span>
                        {browserPermission !== 'granted' && (
                          <button
                            type="button"
                            onClick={handleRequestPermission}
                            className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-[11px] font-bold cursor-pointer transition"
                          >
                            Authorize Browser Push
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.sendPush}
                    onChange={() => handleToggle('sendPush')}
                    className="w-4 h-4 text-rose-600 rounded-md mt-1 cursor-pointer"
                  />
                </div>

                {/* In-App Channel */}
                <div className="flex items-start justify-between gap-4 p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900">In-App Floating Alert & Chime</div>
                      <div className="text-[11px] text-slate-500">
                        Plays audio alert tone and displays real-time actionable banner within the CRM console.
                      </div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.sendInApp}
                    onChange={() => handleToggle('sendInApp')}
                    className="w-4 h-4 text-rose-600 rounded-md mt-1 cursor-pointer"
                  />
                </div>
              </div>

              {/* Scan Interval Setting */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white">
                <div className="space-y-0.5">
                  <div className="font-bold text-xs text-slate-900">Automatic Scan Frequency</div>
                  <div className="text-[11px] text-slate-500">Time interval between background checks for past-due tasks</div>
                </div>
                <select
                  value={settings.intervalSeconds}
                  onChange={(e) => handleInputChange('intervalSeconds', Number(e.target.value))}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 bg-white focus:ring-1 focus:ring-rose-500 focus:outline-hidden cursor-pointer"
                >
                  <option value={15}>Every 15 seconds (High Frequency)</option>
                  <option value={30}>Every 30 seconds</option>
                  <option value={60}>Every 60 seconds (Standard)</option>
                  <option value={300}>Every 5 minutes</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleRunManualSweep}
                  disabled={isScanning}
                  className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                  <span>{isScanning ? 'Scanning Tasks...' : 'Run Automated Check Now'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleTestSpecificAlert}
                  disabled={isScanning}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer border border-slate-300"
                >
                  <Send className="w-3.5 h-3.5 text-rose-600" />
                  <span>Send Test Email & Push Alert</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-500">
                  Showing recorded trigger events for tasks past their due date:
                </span>
                {logs.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearLogs}
                    className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1 font-bold cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear Logs</span>
                  </button>
                )}
              </div>

              {logs.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 space-y-2">
                  <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500" />
                  <p className="text-sm font-medium text-slate-600">No Overdue Alerts Dispatched Yet</p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    The background watcher is active. When any task passes its scheduled due date, trigger events will be logged here.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/30 flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-rose-900">{log.taskTitle}</span>
                          <span className="px-1.5 py-0.2 bg-rose-100 text-rose-800 rounded-md text-[10px] font-bold border border-rose-200">
                            OVERDUE
                          </span>
                        </div>
                        <div className="text-slate-600 flex items-center gap-2 text-[11px]">
                          <span>👤 {log.leadName}</span>
                          <span>•</span>
                          <span>📅 Due: {log.dueDate} at {log.dueTime}</span>
                        </div>
                        <div className="text-slate-500 text-[10px] flex items-center gap-2">
                          <span>Sent to: {log.emailRecipient}</span>
                          <span>•</span>
                          <span>Channels: {log.channelsSent.join(', ')}</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-slate-400 block">
                          {new Date(log.triggeredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 mt-1">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                          <span>Dispatched</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'preview' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-500">
                Below is the rendered template that is dispatched automatically to the dealer's email when an overdue task is detected:
              </div>

              {/* Email Mock Preview */}
              <div className="border border-rose-200 rounded-xl overflow-hidden shadow-xs bg-white">
                <div className="bg-rose-700 text-white px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold">
                    <Mail className="w-4 h-4 text-rose-200" />
                    <span>Subject: 🚨 Action Required: Overdue Task "[Task Title]" - Lead: [Lead Name]</span>
                  </div>
                  <span className="text-[10px] bg-rose-800/60 px-2 py-0.5 rounded text-rose-100 font-bold">
                    From: notifications@manziliq.pk
                  </span>
                </div>
                <div className="p-4 text-xs space-y-3 bg-white text-slate-800">
                  <p>Dear <strong>{settings.dealerName}</strong>,</p>
                  <p className="text-slate-600">
                    An automated scan detected that the following CRM task has <strong>passed its scheduled due date</strong> without being marked as complete:
                  </p>
                  <div className="p-3.5 bg-rose-50 border-l-4 border-rose-600 rounded-r-lg space-y-1.5">
                    <div className="font-bold text-rose-900 text-sm">Follow-up Call: Finalize 4-Stage Payment Milestone</div>
                    <div className="text-slate-700">👤 <strong>Lead:</strong> Dr. Kamran Akmal (+92 321 4455667)</div>
                    <div className="text-slate-700">🏡 <strong>Property:</strong> 10 Marla Corner Commercial</div>
                    <div className="text-rose-700 font-bold">⏰ <strong>Scheduled Due Date:</strong> 2026-08-28 at 14:30 (EXPIRED)</div>
                    <div className="text-slate-600">⚡ <strong>Priority:</strong> HIGH</div>
                  </div>
                  <p className="text-slate-600">
                    Timely follow-ups are critical for maintaining buyer trust. Please open your CRM console to mark complete or reschedule.
                  </p>
                  <div className="pt-2">
                    <span className="inline-block bg-rose-700 text-white font-bold px-4 py-2 rounded-lg text-xs">
                      Open CRM to Complete / Reschedule Task →
                    </span>
                  </div>
                </div>
              </div>

              {/* Push Notification Mock Preview */}
              <div className="p-3.5 rounded-xl border border-purple-200 bg-purple-50/40 space-y-1.5">
                <div className="flex items-center gap-2 text-purple-900 font-bold text-xs">
                  <Smartphone className="w-3.5 h-3.5 text-purple-700" />
                  <span>Push Notification Alert Preview (Mobile / Desktop Lock Screen)</span>
                </div>
                <div className="p-3 bg-white rounded-lg border border-purple-200 shadow-2xs">
                  <div className="font-bold text-xs text-slate-900">🚨 Overdue CRM Task: Physical Site Tour</div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    Lead Muhammad Farooq (Plot 42-A). Past due date. Tap to open CRM and log outcome.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Info className="w-3.5 h-3.5 text-rose-600" />
            <span>Duplicate events are prevented via unique task event keys.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
