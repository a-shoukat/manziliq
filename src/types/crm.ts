export type TaskType = 'call' | 'site_visit' | 'meeting' | 'document_followup' | 'token_advance';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'rescheduled';

export type TaskReminderTiming = 'due_time' | '15_min_before' | '1_hour_before' | '1_day_before';

export type LeadStage = 'new' | 'visit_scheduled' | 'negotiation' | 'won' | 'lost';

export interface DealerTask {
  id: string;
  dealerId?: string;
  leadId: string;
  leadName: string;
  leadPhone: string;
  propertyInterest: string;
  title: string;
  type: TaskType;
  dueDate: string; // YYYY-MM-DD
  dueTime: string; // HH:mm (24h or 12h)
  priority: TaskPriority;
  status: TaskStatus;
  location?: string; // e.g. "Al-Rehman Garden Phase 7 Gate 2" or "Direct Phone Call"
  notes?: string;
  reminderTiming: TaskReminderTiming;
  alertSent?: boolean;
  overdueAlertSent?: boolean;
  overdueAlertSentAt?: string;
  overdueChannels?: ('email' | 'push' | 'in_app')[];
  completedAt?: string;
  completionNotes?: string;
  outcome?: 'deal_advanced' | 'token_received' | 'rescheduled' | 'followup_needed' | 'lost' | 'general_progress';
  createdAt: string;
  updatedAt?: string;
}

export interface LeadItem {
  id: string;
  name: string;
  phone: string;
  email?: string;
  city?: string;
  propertyInterest: string;
  budgetPKR: number;
  stage: LeadStage;
  notes: string;
  lastContact: string;
  preferredContactMethod?: 'phone' | 'whatsapp' | 'in_person';
  assignedDealerId?: string;
  source?: string;
  tasksCount?: number;
  createdAt?: string;
}
