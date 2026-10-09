/**
 * Centralized Notification Orchestrator
 * Coordinates multi-channel dispatches (In-App, FCM Push, SMS, Email),
 * handles deduplication via eventKey, enforces user notification preferences,
 * logs detailed delivery telemetry, and executes background reminder sweeps.
 */

import { sendSmsNotification, SmsSendResult } from './smsService';
import { sendEmailNotification, EmailSendResult } from './emailService';
import { sendFcmPushNotification, FcmSendResult } from './fcmService';

export interface NotificationDeliveryLog {
  id: string;
  notificationId: string;
  channel: 'in_app' | 'push' | 'sms' | 'email';
  recipient: string;
  status: 'sent' | 'failed' | 'delivered';
  providerResponse?: string;
  errorMessage?: string;
  timestamp: string;
  durationMs?: number;
}

export interface NotificationRecord {
  id: string;
  userId: string;
  role?: string;
  recipientRole?: string;
  recipientName?: string;
  recipientEmail?: string;
  recipientPhone?: string;
  type: 'booking' | 'payment' | 'installment' | 'document' | 'deal_stage' | 'lot_assignment' | 'dispute' | 'verification' | 'system' | 'inquiry' | 'task' | 'site_visit';
  title: string;
  message: string;
  channel: 'in_app' | 'push' | 'sms' | 'email' | 'all';
  channelsSent?: ('in_app' | 'push' | 'sms' | 'email')[];
  referenceType?: string;
  referenceId?: string;
  read: boolean;
  status: 'pending' | 'sent' | 'failed' | 'read';
  createdAt: string;
  sentAt?: string;
  eventKey?: string;
  deepLinkRoute?: string;
  smsPreview?: string;
  emailPreview?: {
    subject: string;
    body: string;
  };
  fcmPayload?: {
    title: string;
    body: string;
    data?: Record<string, string>;
  };
  deliveryLogs?: NotificationDeliveryLog[];
  retryCount?: number;
  lastError?: string;
}

export interface UserPreferences {
  userId: string;
  pushNotifications: boolean;
  smsNotifications: boolean;
  emailNotifications: boolean;
  inAppNotifications: boolean;
  installmentReminders: boolean;
  marketingUpdates: boolean;
  dealUpdates: boolean;
  documentAlerts: boolean;
  securityAlerts: boolean;
  updatedAt?: string;
}

// In-Memory Notification Store with Initial Seed Data
const notificationsStore: NotificationRecord[] = [
  {
    id: 'notif-1',
    userId: 'u-buyer-1',
    role: 'buyer',
    recipientRole: 'buyer',
    recipientName: 'Muhammad Farooq',
    recipientPhone: '+92 300 8472910',
    recipientEmail: 'farooq.buyer@manziliq.pk',
    title: 'Installment Overdue Alert',
    message: 'Installment #3 of PKR 45,833 for Plot A-01 (Al-Rehman Garden) is 9 days overdue. Late fee of PKR 1,145 applied.',
    createdAt: '2026-08-19 09:30 AM',
    sentAt: '2026-08-19 09:30 AM',
    type: 'payment',
    channel: 'all',
    channelsSent: ['in_app', 'push', 'sms', 'email'],
    read: false,
    status: 'sent',
    referenceType: 'installment',
    referenceId: 'inst-3',
    eventKey: 'installment:inst-3:overdue:9days',
    deepLinkRoute: '/buyer/installments',
    smsPreview: '[MANZILIQ] Dear Muhammad Farooq, your installment for Plot A-01 is overdue. Amount: PKR 46,978 (inc. late fee). Pay via JazzCash/EasyPaisa: https://manziliq.pk/buyer/installments',
    emailPreview: {
      subject: 'Urgent: Overdue Installment Reminder - Plot A-01 Al-Rehman Garden',
      body: 'Dear Muhammad Farooq,\n\nPlease note that your 3rd installment for Plot A-01 has passed its due date (Aug 10, 2026). In accordance with society regulations, a 2.5% surcharge of PKR 1,145 has been added.\n\nYou may clear your dues securely online through the MANZILIQ Buyer Portal.\n\nRegards,\nAl-Rehman Garden Finance Dept.'
    },
    deliveryLogs: [
      { id: 'log-1a', notificationId: 'notif-1', channel: 'in_app', recipient: 'u-buyer-1', status: 'delivered', providerResponse: 'IN_APP_DISPATCH_OK', timestamp: '2026-08-19T09:30:00Z', durationMs: 5 },
      { id: 'log-1b', notificationId: 'notif-1', channel: 'push', recipient: 'u-buyer-1 (2 devices)', status: 'delivered', providerResponse: 'FCM_DELIVERED', timestamp: '2026-08-19T09:30:01Z', durationMs: 45 },
      { id: 'log-1c', notificationId: 'notif-1', channel: 'sms', recipient: '+92 300 8472910', status: 'delivered', providerResponse: 'TELCO_QUEUED_OK', timestamp: '2026-08-19T09:30:02Z', durationMs: 65 },
      { id: 'log-1d', notificationId: 'notif-1', channel: 'email', recipient: 'farooq.buyer@manziliq.pk', status: 'delivered', providerResponse: 'SMTP_250_ACCEPTED', timestamp: '2026-08-19T09:30:03Z', durationMs: 80 }
    ]
  },
  {
    id: 'notif-2',
    userId: 'u-buyer-1',
    role: 'buyer',
    recipientRole: 'buyer',
    recipientName: 'Muhammad Farooq',
    recipientPhone: '+92 300 8472910',
    recipientEmail: 'farooq.buyer@manziliq.pk',
    title: 'Allotment Letter Ready for Download',
    message: 'Your official verified Allotment Letter for Plot A-01 has been sealed and added to your secure Document Locker.',
    createdAt: '2026-08-15 02:15 PM',
    sentAt: '2026-08-15 02:15 PM',
    type: 'document',
    channel: 'all',
    channelsSent: ['in_app', 'push', 'sms', 'email'],
    read: true,
    status: 'read',
    referenceType: 'document',
    referenceId: 'doc-1',
    eventKey: 'doc:doc-1:allotment_letter',
    deepLinkRoute: '/buyer/documents',
    smsPreview: '[MANZILIQ] Congratulations! Your Allotment Letter #AR-2026-0841 for Plot A-01 is ready. Access your Document Locker to download.',
    emailPreview: {
      subject: 'Official Allotment Letter Issued - MANZILIQ',
      body: 'Dear Muhammad Farooq,\n\nWe are pleased to inform you that your Allotment Letter #AR-2026-0841 has been issued by Al-Rehman Garden. Download your copy from your secure document vault.'
    }
  },
  {
    id: 'notif-3',
    userId: 'u-dealer-1',
    role: 'dealer',
    recipientRole: 'dealer',
    recipientName: 'Chaudhry Tariq Mehmood',
    recipientPhone: '+92 300 4567890',
    recipientEmail: 'tariq.dealer@manziliq.pk',
    title: 'New Site Visit Scheduled',
    message: 'Sufyan Ali scheduled a physical inspection for 5 Marla Executive Villa on Saturday Aug 22 at 04:00 PM.',
    createdAt: '2026-08-18 11:50 AM',
    sentAt: '2026-08-18 11:50 AM',
    type: 'inquiry',
    channel: 'all',
    channelsSent: ['in_app', 'push', 'sms', 'email'],
    read: false,
    status: 'sent',
    referenceType: 'lead',
    referenceId: 'inq-101',
    eventKey: 'lead:inq-101:site_visit',
    deepLinkRoute: '/dealer/leads',
    smsPreview: '[MANZILIQ Agent] New Site Visit: Sufyan Ali requested inspection for Villa (prop-1) on Aug 22, 4:00 PM. Call buyer: +92 312 9988776',
    emailPreview: {
      subject: 'New Lead Site Inspection - Sufyan Ali',
      body: 'Hello Chaudhry Tariq,\n\nA prospective buyer has confirmed a physical site walkthrough. Please ensure property access is coordinated with society reception.'
    }
  },
  {
    id: 'notif-4',
    userId: 'u-society-1',
    role: 'society_admin',
    recipientRole: 'society_admin',
    recipientName: 'Al-Rehman Admin Desk',
    recipientPhone: '+92 42 35789012',
    recipientEmail: 'admin@alrehmangarden.pk',
    title: 'New Online Booking Application',
    message: 'Buyer Muhammad Farooq has submitted an online token application for Plot A-03 (Executive Block).',
    createdAt: '2026-08-07 04:10 PM',
    sentAt: '2026-08-07 04:10 PM',
    type: 'booking',
    channel: 'all',
    channelsSent: ['in_app', 'push', 'sms', 'email'],
    read: false,
    status: 'sent',
    referenceType: 'booking',
    referenceId: 'book-1002',
    eventKey: 'booking:book-1002:token_submitted',
    deepLinkRoute: '/society/approvals',
    smsPreview: '[MANZILIQ Society] Booking Alert: Plot A-03 token submitted by Muhammad Farooq. Review & approve in society booking desk.',
    emailPreview: {
      subject: 'New Booking Request - Plot A-03',
      body: 'Al-Rehman Garden Admin,\n\nA new token application for Plot A-03 has been submitted online through authorized dealer Chaudhry Tariq. Kindly review applicant CNIC and approve.'
    }
  },
  {
    id: 'notif-5',
    userId: 'u-admin-1',
    role: 'super_admin',
    recipientRole: 'super_admin',
    recipientName: 'Super Administrator',
    recipientPhone: '+92 300 0000000',
    recipientEmail: 'superadmin@manziliq.pk',
    title: 'Security Dispute Logged',
    message: 'Dispute #DSP-901 filed on Plot A-08. Plot status automatically frozen until verification committee mediation.',
    createdAt: '2026-08-17 01:20 PM',
    sentAt: '2026-08-17 01:20 PM',
    type: 'dispute',
    channel: 'all',
    channelsSent: ['in_app', 'push', 'sms', 'email'],
    read: false,
    status: 'sent',
    referenceType: 'dispute',
    referenceId: 'DSP-901',
    eventKey: 'dispute:DSP-901:logged',
    deepLinkRoute: '/admin/disputes',
    smsPreview: '[MANZILIQ SuperAdmin] Dispute Alert: Plot A-08 locked due to title contention. Open Admin Dispute Queue to arbitrate.',
    emailPreview: {
      subject: 'System Action: Plot A-08 Frozen Under Dispute #DSP-901',
      body: 'Super Admin Notice,\n\nConflicting transaction flags detected for Plot A-08 Al-Rehman Garden. The system has automatically restricted further reservations until resolved.'
    }
  }
];

// Delivery logs store
const deliveryLogsStore: NotificationDeliveryLog[] = [
  ...notificationsStore.flatMap(n => n.deliveryLogs || [])
];

// Sent event keys for duplicate prevention
const dispatchedEventKeys = new Set<string>(
  notificationsStore.map(n => n.eventKey).filter(Boolean) as string[]
);

// User preferences store
const userPreferencesStore: Record<string, UserPreferences> = {
  'u-buyer-1': {
    userId: 'u-buyer-1',
    pushNotifications: true,
    smsNotifications: true,
    emailNotifications: true,
    inAppNotifications: true,
    installmentReminders: true,
    marketingUpdates: false,
    dealUpdates: true,
    documentAlerts: true,
    securityAlerts: true,
    updatedAt: '2026-08-24T00:00:00Z'
  },
  'u-dealer-1': {
    userId: 'u-dealer-1',
    pushNotifications: true,
    smsNotifications: true,
    emailNotifications: true,
    inAppNotifications: true,
    installmentReminders: true,
    marketingUpdates: true,
    dealUpdates: true,
    documentAlerts: true,
    securityAlerts: true,
    updatedAt: '2026-08-24T00:00:00Z'
  },
  'u-society-1': {
    userId: 'u-society-1',
    pushNotifications: true,
    smsNotifications: true,
    emailNotifications: true,
    inAppNotifications: true,
    installmentReminders: true,
    marketingUpdates: false,
    dealUpdates: true,
    documentAlerts: true,
    securityAlerts: true,
    updatedAt: '2026-08-24T00:00:00Z'
  },
  'u-admin-1': {
    userId: 'u-admin-1',
    pushNotifications: true,
    smsNotifications: true,
    emailNotifications: true,
    inAppNotifications: true,
    installmentReminders: true,
    marketingUpdates: false,
    dealUpdates: true,
    documentAlerts: true,
    securityAlerts: true,
    updatedAt: '2026-08-24T00:00:00Z'
  }
};

export interface DispatchNotificationParams {
  userId: string;
  role?: string;
  recipientName?: string;
  recipientPhone?: string;
  recipientEmail?: string;
  type: NotificationRecord['type'];
  title: string;
  message: string;
  channels?: ('in_app' | 'push' | 'sms' | 'email')[];
  referenceType?: string;
  referenceId?: string;
  eventKey?: string;
  deepLinkRoute?: string;
  smsMessage?: string;
  emailSubject?: string;
  emailBody?: string;
  emailHtml?: string;
  fcmTitle?: string;
  fcmBody?: string;
  fcmData?: Record<string, string>;
  isCritical?: boolean;
}

export async function dispatchNotification(
  params: DispatchNotificationParams
): Promise<{ success: boolean; notification: NotificationRecord; duplicateSkipped?: boolean }> {
  // 1. Duplicate Prevention check
  if (params.eventKey && dispatchedEventKeys.has(params.eventKey)) {
    console.log(`[Notification Orchestrator] Duplicate event prevented: "${params.eventKey}".`);
    const existing = notificationsStore.find(n => n.eventKey === params.eventKey);
    return {
      success: true,
      notification: existing || ({} as NotificationRecord),
      duplicateSkipped: true
    };
  }

  // 2. Load recipient preferences
  const prefs = userPreferencesStore[params.userId] || {
    userId: params.userId,
    pushNotifications: true,
    smsNotifications: true,
    emailNotifications: true,
    inAppNotifications: true,
    installmentReminders: true,
    marketingUpdates: true,
    dealUpdates: true,
    documentAlerts: true,
    securityAlerts: true
  };

  const requestedChannels: ('in_app' | 'push' | 'sms' | 'email')[] = params.channels && params.channels.length > 0
    ? params.channels
    : ['in_app', 'push', 'sms', 'email'];

  // Determine active channels based on preferences (security/critical always bypass)
  const activeChannels: ('in_app' | 'push' | 'sms' | 'email')[] = [];
  for (const ch of requestedChannels) {
    if (params.isCritical) {
      activeChannels.push(ch);
      continue;
    }
    if (ch === 'in_app' && prefs.inAppNotifications !== false) activeChannels.push(ch);
    if (ch === 'push' && prefs.pushNotifications !== false) activeChannels.push(ch);
    if (ch === 'sms' && prefs.smsNotifications !== false) activeChannels.push(ch);
    if (ch === 'email' && prefs.emailNotifications !== false) activeChannels.push(ch);
  }

  // Always at minimum ensure in_app is recorded
  if (!activeChannels.includes('in_app')) {
    activeChannels.push('in_app');
  }

  const notificationId = `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const nowStr = `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  const deliveryLogs: NotificationDeliveryLog[] = [];
  const channelsSent: ('in_app' | 'push' | 'sms' | 'email')[] = [];

  // 3. Dispatch across active channels

  // In-App channel
  if (activeChannels.includes('in_app')) {
    const log: NotificationDeliveryLog = {
      id: `log-${Date.now()}-inapp`,
      notificationId,
      channel: 'in_app',
      recipient: params.userId,
      status: 'delivered',
      providerResponse: 'IN_APP_INBOX_STORED',
      timestamp: new Date().toISOString(),
      durationMs: 2
    };
    deliveryLogs.push(log);
    deliveryLogsStore.push(log);
    channelsSent.push('in_app');
  }

  // Push (FCM) channel
  if (activeChannels.includes('push')) {
    const fcmRes: FcmSendResult = await sendFcmPushNotification({
      userId: params.userId,
      title: params.fcmTitle || params.title,
      body: params.fcmBody || params.message,
      dataPayload: {
        ...(params.fcmData || {}),
        route: params.deepLinkRoute || '/buyer/notifications',
        notificationId
      },
      referenceId: params.referenceId
    });

    const log: NotificationDeliveryLog = {
      id: `log-${Date.now()}-fcm`,
      notificationId,
      channel: 'push',
      recipient: fcmRes.recipient,
      status: fcmRes.success ? 'delivered' : 'failed',
      providerResponse: fcmRes.providerResponse,
      errorMessage: fcmRes.error,
      timestamp: fcmRes.timestamp,
      durationMs: fcmRes.durationMs
    };
    deliveryLogs.push(log);
    deliveryLogsStore.push(log);
    if (fcmRes.success) channelsSent.push('push');
  }

  // SMS channel
  if (activeChannels.includes('sms') && params.recipientPhone) {
    const smsRes: SmsSendResult = await sendSmsNotification({
      recipientPhone: params.recipientPhone,
      message: params.smsMessage || `[MANZILIQ] ${params.title}: ${params.message}`,
      referenceId: params.referenceId
    });

    const log: NotificationDeliveryLog = {
      id: `log-${Date.now()}-sms`,
      notificationId,
      channel: 'sms',
      recipient: smsRes.recipient,
      status: smsRes.success ? 'delivered' : 'failed',
      providerResponse: smsRes.providerResponse,
      errorMessage: smsRes.error,
      timestamp: smsRes.timestamp,
      durationMs: smsRes.durationMs
    };
    deliveryLogs.push(log);
    deliveryLogsStore.push(log);
    if (smsRes.success) channelsSent.push('sms');
  }

  // Email channel
  if (activeChannels.includes('email') && params.recipientEmail) {
    const emailRes: EmailSendResult = await sendEmailNotification({
      recipientEmail: params.recipientEmail,
      recipientName: params.recipientName,
      subject: params.emailSubject || params.title,
      bodyText: params.emailBody || params.message,
      bodyHtml: params.emailHtml,
      referenceId: params.referenceId
    });

    const log: NotificationDeliveryLog = {
      id: `log-${Date.now()}-email`,
      notificationId,
      channel: 'email',
      recipient: emailRes.recipient,
      status: emailRes.success ? 'delivered' : 'failed',
      providerResponse: emailRes.providerResponse,
      errorMessage: emailRes.error,
      timestamp: emailRes.timestamp,
      durationMs: emailRes.durationMs
    };
    deliveryLogs.push(log);
    deliveryLogsStore.push(log);
    if (emailRes.success) channelsSent.push('email');
  }

  // 4. Save notification record
  const newRecord: NotificationRecord = {
    id: notificationId,
    userId: params.userId,
    role: params.role || 'buyer',
    recipientRole: params.role || 'buyer',
    recipientName: params.recipientName,
    recipientEmail: params.recipientEmail,
    recipientPhone: params.recipientPhone,
    type: params.type,
    title: params.title,
    message: params.message,
    channel: (requestedChannels.length > 1 ? 'all' : (requestedChannels[0] || 'in_app')) as 'in_app' | 'push' | 'sms' | 'email' | 'all',
    channelsSent,
    referenceType: params.referenceType,
    referenceId: params.referenceId,
    read: false,
    status: channelsSent.length > 0 ? 'sent' : 'failed',
    createdAt: nowStr,
    sentAt: nowStr,
    eventKey: params.eventKey,
    deepLinkRoute: params.deepLinkRoute || '/buyer/notifications',
    smsPreview: params.smsMessage,
    emailPreview: params.emailSubject ? {
      subject: params.emailSubject,
      body: params.emailBody || params.message
    } : undefined,
    fcmPayload: {
      title: params.fcmTitle || params.title,
      body: params.fcmBody || params.message,
      data: params.fcmData
    },
    deliveryLogs,
    retryCount: 0
  };

  notificationsStore.unshift(newRecord);

  if (params.eventKey) {
    dispatchedEventKeys.add(params.eventKey);
  }

  return { success: true, notification: newRecord };
}

export function getAllNotifications(userId?: string, role?: string): NotificationRecord[] {
  let list = [...notificationsStore];
  if (userId) {
    list = list.filter(n => n.userId === userId);
  } else if (role && role !== 'super_admin') {
    list = list.filter(n => n.role === role || n.recipientRole === role);
  }
  return list;
}

export function markNotificationAsRead(id: string): boolean {
  const notif = notificationsStore.find(n => n.id === id);
  if (notif) {
    notif.read = true;
    notif.status = 'read';
    return true;
  }
  return false;
}

export function markAllNotificationsAsRead(userId?: string): number {
  let count = 0;
  for (const notif of notificationsStore) {
    if (!userId || notif.userId === userId) {
      if (!notif.read) {
        notif.read = true;
        notif.status = 'read';
        count++;
      }
    }
  }
  return count;
}

export function getUserPreferences(userId: string): UserPreferences {
  if (!userPreferencesStore[userId]) {
    userPreferencesStore[userId] = {
      userId,
      pushNotifications: true,
      smsNotifications: true,
      emailNotifications: true,
      inAppNotifications: true,
      installmentReminders: true,
      marketingUpdates: false,
      dealUpdates: true,
      documentAlerts: true,
      securityAlerts: true,
      updatedAt: new Date().toISOString()
    };
  }
  return userPreferencesStore[userId];
}

export function updateUserPreferences(userId: string, updates: Partial<UserPreferences>): UserPreferences {
  const current = getUserPreferences(userId);
  userPreferencesStore[userId] = {
    ...current,
    ...updates,
    securityAlerts: true, // Security alerts are mandatory
    updatedAt: new Date().toISOString()
  };
  return userPreferencesStore[userId];
}

export function getAllDeliveryLogs(): NotificationDeliveryLog[] {
  return [...deliveryLogsStore];
}

export async function retryNotificationDispatch(notificationId: string): Promise<{ success: boolean; notification?: NotificationRecord; message: string }> {
  const notif = notificationsStore.find(n => n.id === notificationId);
  if (!notif) {
    return { success: false, message: 'Notification not found' };
  }

  notif.retryCount = (notif.retryCount || 0) + 1;
  const newLogs: NotificationDeliveryLog[] = [];

  // Retry SMS if phone present
  if (notif.recipientPhone) {
    const smsRes = await sendSmsNotification({
      recipientPhone: notif.recipientPhone,
      message: notif.smsPreview || notif.message,
      referenceId: notif.referenceId
    });
    const log: NotificationDeliveryLog = {
      id: `log-retry-${Date.now()}-sms`,
      notificationId: notif.id,
      channel: 'sms',
      recipient: smsRes.recipient,
      status: smsRes.success ? 'delivered' : 'failed',
      providerResponse: `RETRY #${notif.retryCount}: ${smsRes.providerResponse}`,
      errorMessage: smsRes.error,
      timestamp: new Date().toISOString(),
      durationMs: smsRes.durationMs
    };
    newLogs.push(log);
    deliveryLogsStore.push(log);
  }

  // Retry Email if email present
  if (notif.recipientEmail) {
    const emailRes = await sendEmailNotification({
      recipientEmail: notif.recipientEmail,
      recipientName: notif.recipientName,
      subject: notif.emailPreview?.subject || notif.title,
      bodyText: notif.emailPreview?.body || notif.message,
      referenceId: notif.referenceId
    });
    const log: NotificationDeliveryLog = {
      id: `log-retry-${Date.now()}-email`,
      notificationId: notif.id,
      channel: 'email',
      recipient: emailRes.recipient,
      status: emailRes.success ? 'delivered' : 'failed',
      providerResponse: `RETRY #${notif.retryCount}: ${emailRes.providerResponse}`,
      errorMessage: emailRes.error,
      timestamp: new Date().toISOString(),
      durationMs: emailRes.durationMs
    };
    newLogs.push(log);
    deliveryLogsStore.push(log);
  }

  notif.deliveryLogs = [...(notif.deliveryLogs || []), ...newLogs];
  notif.status = 'sent';

  return {
    success: true,
    notification: notif,
    message: `Notification dispatch retried across channels (Attempt #${notif.retryCount}).`
  };
}

/**
 * Scheduled Jobs Engine
 * Evaluates installments due in 3 days, overdue payments, and expiring dealer lots.
 */
export async function runAutomatedScheduledJobs(data?: {
  installments?: any[];
  lots?: any[];
  currentDate?: string;
}): Promise<{
  remindersSent: number;
  overdueSent: number;
  lotAlertsSent: number;
  duplicatePreventedCount: number;
  runSummary: string;
}> {
  const today = data?.currentDate ? new Date(data.currentDate) : new Date();
  let remindersSent = 0;
  let overdueSent = 0;
  let lotAlertsSent = 0;
  let duplicatePreventedCount = 0;

  // 1. Process Installments
  const installments = data?.installments || [];
  for (const inst of installments) {
    if (inst.status === 'paid') continue;

    const dueDate = new Date(inst.dueDate);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // A. 3-day Reminder: due in 3 days (1 to 3 days window)
    if (diffDays >= 1 && diffDays <= 3) {
      const eventKey = `installment:${inst.id}:due_3_days`;
      if (dispatchedEventKeys.has(eventKey)) {
        duplicatePreventedCount++;
      } else {
        const amountStr = `PKR ${inst.amountPKR?.toLocaleString('en-PK') || 0}`;
        const plotNo = inst.plotNumber || 'Plot A-01';
        const society = inst.societyName || 'Housing Society';

        await dispatchNotification({
          userId: inst.buyerId || 'u-buyer-1',
          role: 'buyer',
          recipientName: inst.buyerName || 'Valued Buyer',
          recipientPhone: inst.buyerPhone || '+92 300 8472910',
          recipientEmail: inst.buyerEmail || 'customer@manziliq.pk',
          type: 'installment',
          title: `Installment Due in ${diffDays} Days - ${plotNo}`,
          message: `Reminder: Your installment #${inst.installmentNumber} of ${amountStr} for ${plotNo} (${society}) is due on ${inst.dueDate}.`,
          channels: ['in_app', 'push', 'sms', 'email'],
          referenceType: 'installment',
          referenceId: inst.id,
          eventKey,
          deepLinkRoute: '/buyer/installments',
          smsMessage: `[MANZILIQ REMINDER] Dear Customer, your installment #${inst.installmentNumber} of ${amountStr} for ${plotNo} is due on ${inst.dueDate}. Pay online: https://manziliq.pk/buyer/installments`,
          emailSubject: `Reminder: Installment #${inst.installmentNumber} Due in ${diffDays} Days - ${plotNo}`,
          emailBody: `Dear Customer,\n\nYour upcoming installment #${inst.installmentNumber} for ${plotNo} at ${society} is due on ${inst.dueDate}.\nAmount: ${amountStr}\n\nPlease clear your installment via online banking or JazzCash/EasyPaisa.`
        });
        remindersSent++;
      }
    }

    // B. Overdue Installment (diffDays < 0)
    if (diffDays < 0 || inst.status === 'overdue') {
      const daysOver = Math.abs(diffDays);
      const eventKey = `installment:${inst.id}:overdue_month_${today.getMonth() + 1}_${today.getFullYear()}`;
      if (dispatchedEventKeys.has(eventKey)) {
        duplicatePreventedCount++;
      } else {
        const lateFee = inst.lateFeePKR || Math.round(inst.amountPKR * 0.025);
        const total = inst.amountPKR + lateFee;
        const totalStr = `PKR ${total.toLocaleString('en-PK')}`;
        const amountStr = `PKR ${inst.amountPKR.toLocaleString('en-PK')}`;
        const lateFeeStr = `PKR ${lateFee.toLocaleString('en-PK')}`;
        const plotNo = inst.plotNumber || 'Plot A-01';

        await dispatchNotification({
          userId: inst.buyerId || 'u-buyer-1',
          role: 'buyer',
          recipientName: inst.buyerName || 'Valued Buyer',
          recipientPhone: inst.buyerPhone || '+92 300 8472910',
          recipientEmail: inst.buyerEmail || 'customer@manziliq.pk',
          type: 'installment',
          title: `⚠️ Overdue Notice - ${plotNo}`,
          message: `Installment #${inst.installmentNumber} for ${plotNo} is overdue by ${daysOver} days. Original: ${amountStr}, Late Surcharge: ${lateFeeStr}. Total: ${totalStr}.`,
          channels: ['in_app', 'push', 'sms', 'email'],
          referenceType: 'installment',
          referenceId: inst.id,
          eventKey,
          deepLinkRoute: '/buyer/installments',
          smsMessage: `[MANZILIQ OVERDUE] URGENT: Installment #${inst.installmentNumber} for ${plotNo} is overdue. Total with surcharge: ${totalStr}. Pay now: https://manziliq.pk/buyer/installments`,
          emailSubject: `URGENT: Overdue Notice - Installment #${inst.installmentNumber} for ${plotNo}`,
          emailBody: `Dear Customer,\n\nYour Installment #${inst.installmentNumber} for ${plotNo} was due on ${inst.dueDate} and is now overdue.\n\nOriginal: ${amountStr}\nLate Fee (2.5%): ${lateFeeStr}\nTotal Outstanding: ${totalStr}\n\nPlease settle your balance immediately.`
        });
        overdueSent++;
      }
    }
  }

  // 2. Process Lots (Lot Expiry reminders)
  const lots = data?.lots || [];
  for (const lot of lots) {
    if (lot.status === 'expired' || lot.status === 'released') continue;
    const expiryDate = new Date(lot.expiryDate);
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 7 && diffDays > 0) {
      const eventKey = `lot:${lot.id}:expiry_warning_7days`;
      if (dispatchedEventKeys.has(eventKey)) {
        duplicatePreventedCount++;
      } else {
        await dispatchNotification({
          userId: lot.dealerId || 'u-dealer-1',
          role: 'dealer',
          recipientName: lot.dealerName || 'Authorized Dealer',
          recipientPhone: lot.dealerPhone || '+92 300 4567890',
          recipientEmail: lot.dealerEmail || 'dealer@manziliq.pk',
          type: 'lot_assignment',
          title: `Lot Expiry Warning - Lot ${lot.lotNumber}`,
          message: `Your assigned Lot ${lot.lotNumber} (${lot.societyName}) will expire in ${diffDays} days (${lot.expiryDate}). Unsold plots will be returned to society master pool.`,
          channels: ['in_app', 'push', 'sms', 'email'],
          referenceType: 'lot',
          referenceId: lot.id,
          eventKey,
          deepLinkRoute: '/dealer/lots',
          smsMessage: `[MANZILIQ Agent] Warning: Lot ${lot.lotNumber} expires in ${diffDays} days (${lot.expiryDate}). Request extension: https://manziliq.pk/dealer/lots`,
          emailSubject: `Lot Expiry Approaching: Lot ${lot.lotNumber} - ${lot.societyName}`,
          emailBody: `Dear Dealer,\n\nLot ${lot.lotNumber} assigned to your agency at ${lot.societyName} will expire on ${lot.expiryDate} (${diffDays} days remaining).\n\nPlease review your active lot listings.`
        });
        lotAlertsSent++;
      }
    }
  }

  // 3. Process CRM Tasks for Overdue Status
  let tasksOverdueSent = 0;
  const tasks = (data as any)?.tasks || [];
  if (tasks.length > 0) {
    const overdueResult = await checkAndDispatchOverdueTasks({
      tasks,
      currentDate: data?.currentDate
    });
    tasksOverdueSent = overdueResult.alertsDispatchedCount;
    duplicatePreventedCount += overdueResult.duplicatePreventedCount;
  }

  const summary = `Scheduled run complete: ${remindersSent} 3-day installment reminders dispatched, ${overdueSent} overdue notices sent, ${lotAlertsSent} lot expiry alerts issued, ${tasksOverdueSent} overdue CRM task alerts triggered. ${duplicatePreventedCount} duplicate notices prevented.`;
  console.log(`[Notification Scheduler] ${summary}`);

  return {
    remindersSent,
    overdueSent,
    lotAlertsSent,
    duplicatePreventedCount,
    runSummary: summary
  };
}

/**
 * Automated CRM Task Overdue Watcher Engine
 * Scans tasks, checks if past scheduled due date/time without completion,
 * and triggers automated Email and Push notifications to the assigned dealer.
 */
export async function checkAndDispatchOverdueTasks(params: {
  tasks: any[];
  dealerId?: string;
  dealerName?: string;
  dealerEmail?: string;
  dealerPhone?: string;
  channels?: ('in_app' | 'push' | 'sms' | 'email')[];
  forceTrigger?: boolean;
  currentDate?: string;
}): Promise<{
  success: boolean;
  tasksOverdueCount: number;
  alertsDispatchedCount: number;
  duplicatePreventedCount: number;
  processedTaskIds: string[];
  dispatchedAlerts: any[];
  summary: string;
}> {
  const now = params.currentDate ? new Date(params.currentDate) : new Date();
  const todayStr = now.toISOString().split('T')[0];

  let tasksOverdueCount = 0;
  let alertsDispatchedCount = 0;
  let duplicatePreventedCount = 0;
  const processedTaskIds: string[] = [];
  const dispatchedAlerts: any[] = [];

  const tasks = params.tasks || [];

  for (const task of tasks) {
    // Only check incomplete tasks
    if (task.status === 'completed' || task.status === 'cancelled') {
      continue;
    }

    // Determine overdue status
    const taskDueDate = task.dueDate || todayStr;
    const taskDueTime = task.dueTime || '18:00';
    let isPastDue = false;

    if (taskDueDate < todayStr) {
      isPastDue = true;
    } else if (taskDueDate === todayStr) {
      const taskDateTime = new Date(`${taskDueDate}T${taskDueTime}:00`);
      if (taskDateTime.getTime() < now.getTime()) {
        isPastDue = true;
      }
    }

    if (!isPastDue) {
      continue;
    }

    tasksOverdueCount++;

    // Deduplication event key: one alert per overdue cycle per task unless forceTriggered
    const eventKey = params.forceTrigger
      ? undefined
      : `task:${task.id}:overdue:${taskDueDate}`;

    if (eventKey && dispatchedEventKeys.has(eventKey)) {
      duplicatePreventedCount++;
      continue;
    }

    const recipientUserId = task.dealerId || params.dealerId || 'u-dealer-1';
    const recipientName = params.dealerName || 'Authorized Dealer';
    const recipientEmail = params.dealerEmail || 'dealer@manziliq.pk';
    const recipientPhone = params.dealerPhone || '+92 300 4567890';
    const clientName = task.leadName || 'Prospective Lead';
    const clientPhone = task.leadPhone || '';
    const propertyInterest = task.propertyInterest || 'Narowal Housing Plot';
    const taskTitle = task.title || 'CRM Follow-up Task';

    // Dispatches via Email, Push, and In-App
    const targetChannels: ('in_app' | 'push' | 'sms' | 'email')[] = params.channels || ['email', 'push', 'in_app'];

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; color: #1e293b; border: 1px solid #fecaca; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 14px rgba(225, 29, 72, 0.08);">
        <div style="background-color: #be123c; color: white; padding: 24px;">
          <span style="display: inline-block; background: rgba(255,255,255,0.22); padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: bold; text-transform: uppercase; margin-bottom: 8px;">
            Automated CRM Notification
          </span>
          <h2 style="margin: 0; font-size: 21px; font-weight: bold;">🚨 Overdue Task Alert</h2>
          <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.92;">Scheduled Due Date Passed Without Completion</p>
        </div>
        <div style="padding: 24px; line-height: 1.6;">
          <p style="margin-top: 0;">Dear <strong>${recipientName}</strong>,</p>
          <p>This automated notification is triggered because the following CRM task is <strong>past its due date</strong> and remains uncompleted:</p>
          
          <div style="background: #fff1f2; border-left: 4px solid #e11d48; padding: 16px 20px; margin: 18px 0; border-radius: 6px;">
            <p style="margin: 0 0 8px; font-size: 16px; font-weight: bold; color: #9f1239;">${taskTitle}</p>
            <p style="margin: 0 0 6px; font-size: 13px; color: #334155;">👤 <strong>Lead:</strong> ${clientName} ${clientPhone ? `(${clientPhone})` : ''}</p>
            <p style="margin: 0 0 6px; font-size: 13px; color: #334155;">🏡 <strong>Property:</strong> ${propertyInterest}</p>
            <p style="margin: 0 0 6px; font-size: 13px; color: #e11d48; font-weight: bold;">⏰ <strong>Scheduled Due Date:</strong> ${taskDueDate} at ${taskDueTime}</p>
            <p style="margin: 0 0 6px; font-size: 13px; color: #64748b;">📍 <strong>Meeting/Channel:</strong> ${task.location || 'Direct Phone Call'}</p>
            <p style="margin: 0; font-size: 13px; color: #b91c1c;">⚡ <strong>Priority:</strong> ${(task.priority || 'high').toUpperCase()}</p>
          </div>

          <p style="font-size: 14px; color: #475569;">
            Timely follow-ups are critical for maintaining buyer trust and securing bookings. Please access your CRM console to record completion notes or reschedule.
          </p>

          <div style="margin-top: 24px;">
            <a href="https://manziliq.pk/dealer/leads" style="display: inline-block; background-color: #be123c; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; box-shadow: 0 2px 6px rgba(190, 18, 60, 0.3);">
              Open CRM to Complete / Reschedule →
            </a>
          </div>

          <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
          <p style="margin: 0; font-size: 11px; color: #94a3b8;">
            Automated Alert System • MANZILIQ Real Estate CRM • Narowal, Punjab
          </p>
        </div>
      </div>
    `;

    const dispatchResult = await dispatchNotification({
      userId: recipientUserId,
      role: 'dealer',
      recipientName,
      recipientPhone,
      recipientEmail,
      type: 'task',
      title: `🚨 Overdue Task Alert: "${taskTitle}"`,
      message: `Task "${taskTitle}" for lead ${clientName} (${propertyInterest}) was due on ${taskDueDate} at ${taskDueTime} and has not been marked as complete.`,
      channels: targetChannels,
      referenceType: 'task',
      referenceId: task.id,
      eventKey,
      deepLinkRoute: '/dealer/leads',
      fcmTitle: `🚨 Overdue CRM Task: ${taskTitle}`,
      fcmBody: `Lead ${clientName}. Due was ${taskDueDate} at ${taskDueTime}. Tap to review & complete.`,
      fcmData: {
        type: 'task',
        id: task.id,
        route: '/dealer/leads',
        isOverdue: 'true',
        leadName: clientName,
        priority: task.priority || 'high'
      },
      smsMessage: `[MANZILIQ CRM] OVERDUE: Task "${taskTitle}" for ${clientName} is past due date (${taskDueDate} ${taskDueTime}). Open CRM to resolve: https://manziliq.pk/dealer/leads`,
      emailSubject: `🚨 Action Required: Overdue Task "${taskTitle}" - Lead: ${clientName}`,
      emailBody: `Dear ${recipientName},\n\nWARNING: The following CRM task has gone past its due date without being marked as complete:\n\nTask: ${taskTitle}\nClient: ${clientName} (${clientPhone})\nProperty: ${propertyInterest}\nDue Date: ${taskDueDate} at ${taskDueTime}\nPriority: ${(task.priority || 'HIGH').toUpperCase()}\n\nPlease open your CRM workspace to record completion or reschedule:\nhttps://manziliq.pk/dealer/leads\n\nMANZILIQ Automated CRM Task Engine`,
      emailHtml,
      isCritical: task.priority === 'urgent' || task.priority === 'high'
    });

    if (dispatchResult.success) {
      alertsDispatchedCount++;
      processedTaskIds.push(task.id);
      dispatchedAlerts.push({
        taskId: task.id,
        taskTitle,
        leadName: clientName,
        dueDate: taskDueDate,
        notificationId: dispatchResult.notification?.id,
        channelsSent: dispatchResult.notification?.channelsSent || targetChannels,
        emailRecipient: recipientEmail,
        timestamp: new Date().toISOString()
      });
    }
  }

  const summary = `Overdue Task Sweep complete: Found ${tasksOverdueCount} overdue task(s). Triggered ${alertsDispatchedCount} Email & Push notification(s). Prevented ${duplicatePreventedCount} duplicate alert(s).`;
  console.log(`[Task Overdue Engine] ${summary}`);

  return {
    success: true,
    tasksOverdueCount,
    alertsDispatchedCount,
    duplicatePreventedCount,
    processedTaskIds,
    dispatchedAlerts,
    summary
  };
}
