export type NotificationChannel = 'in_app' | 'push' | 'sms' | 'email';

export type NotificationType = 
  | 'booking' 
  | 'payment' 
  | 'installment' 
  | 'document' 
  | 'deal_stage' 
  | 'lot_assignment' 
  | 'dispute' 
  | 'verification' 
  | 'system' 
  | 'inquiry'
  | 'task'
  | 'site_visit';

export type NotificationStatus = 'pending' | 'sent' | 'failed' | 'read';

export type ReferenceType = 
  | 'booking' 
  | 'payment' 
  | 'installment' 
  | 'document' 
  | 'lot' 
  | 'property' 
  | 'user' 
  | 'dispute' 
  | 'lead' 
  | 'inquiry'
  | 'task';

export interface NotificationDeliveryLog {
  id: string;
  notificationId: string;
  channel: NotificationChannel;
  recipient: string;
  status: 'sent' | 'failed' | 'delivered';
  providerResponse?: string;
  errorMessage?: string;
  timestamp: string;
  durationMs?: number;
}

export interface NotificationItem {
  id: string;
  userId: string;
  user_id?: string;
  role?: string;
  recipientRole?: string;
  recipientName?: string;
  recipientEmail?: string;
  recipientPhone?: string;
  type: NotificationType;
  title: string;
  message: string;
  channel: NotificationChannel | 'all';
  channelsSent?: NotificationChannel[];
  referenceType?: ReferenceType;
  reference_type?: ReferenceType;
  referenceId?: string;
  reference_id?: string;
  read: boolean;
  is_read?: boolean;
  status: NotificationStatus;
  createdAt: string;
  created_at?: string;
  sentAt?: string;
  sent_at?: string;
  date?: string; // Compatibility alias
  eventKey?: string; // Deduplication event key (e.g., "installment:inst-1:due_3_days")
  deepLinkRoute?: string; // Routing target screen
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

export interface NotificationPreferences {
  userId: string;
  pushNotifications: boolean;
  smsNotifications: boolean;
  emailNotifications: boolean;
  inAppNotifications: boolean;
  installmentReminders: boolean;
  marketingUpdates: boolean;
  dealUpdates: boolean;
  documentAlerts: boolean;
  securityAlerts: boolean; // Immutable true for critical transactions
  updatedAt?: string;
}

export interface DeviceTokenRegistration {
  id: string;
  userId: string;
  token: string;
  platform: 'web' | 'android' | 'ios';
  deviceModel?: string;
  registeredAt: string;
  lastActiveAt: string;
  isValid: boolean;
}

export interface SchedulerRunResult {
  runId: string;
  timestamp: string;
  installmentsChecked: number;
  remindersSent: number;
  overdueSent: number;
  lotsChecked: number;
  lotAlertsSent: number;
  duplicatePreventedCount: number;
  errors: string[];
}
