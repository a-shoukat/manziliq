import React, { useState, useEffect, useMemo } from 'react';
import { User, Booking } from '../../types';
import { 
  Users, 
  Phone, 
  MessageSquare, 
  Calendar, 
  Clock, 
  DollarSign, 
  CheckCircle2, 
  Plus, 
  ArrowRight,
  UserCheck,
  Kanban,
  Table as TableIcon,
  Bell,
  AlertTriangle,
  Car,
  FileText,
  Briefcase,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Filter,
  Volume2,
  X
} from 'lucide-react';
import { DealPipelineKanban } from '../../components/common/DealPipelineKanban';
import { DealerTask, LeadItem, TaskType, TaskPriority, LeadStage } from '../../types/crm';
import { DealerTaskModal } from '../../components/dealer/DealerTaskModal';
import { DealerTaskCompletionModal } from '../../components/dealer/DealerTaskCompletionModal';
import { DealerTaskScheduleTab } from '../../components/dealer/DealerTaskScheduleTab';
import { LeadDetailModal } from '../../components/dealer/LeadDetailModal';
import { notificationService } from '../../services/notificationService';
import { taskOverdueAutomationService } from '../../services/taskOverdueAutomationService';

interface DealerLeadsCrmViewProps {
  bookings?: Booking[];
  currentUser?: User;
  onAdvancePipeline?: (id: string) => void;
  onMoveBackPipeline?: (id: string) => void;
  onCancelBooking?: (id: string, reason: string, penaltyPKR: number) => void;
}

export const DealerLeadsCrmView: React.FC<DealerLeadsCrmViewProps> = ({
  bookings = [],
  currentUser,
  onAdvancePipeline,
  onMoveBackPipeline,
  onCancelBooking
}) => {
  const [viewMode, setViewMode] = useState<'kanban' | 'leads' | 'tasks'>('tasks');

  // Leads state
  const [leads, setLeads] = useState<LeadItem[]>([
    {
      id: 'lead-1',
      name: 'Muhammad Farooq',
      phone: '+92 300 8472910',
      email: 'm.farooq@outlook.com',
      city: 'Narowal',
      propertyInterest: 'Plot 42-A (5 Marla Executive)',
      budgetPKR: 2600000,
      stage: 'visit_scheduled',
      notes: 'Wants physical site inspection at 4:00 PM today. Prepared to sign token advance if boundary demarcations match.',
      lastContact: 'Today, 10:15 AM',
      preferredContactMethod: 'phone'
    },
    {
      id: 'lead-2',
      name: 'Dr. Kamran Akmal',
      phone: '+92 321 4455667',
      email: 'dr.kamran@hospital.pk',
      city: 'Lahore',
      propertyInterest: '10 Marla Corner Commercial',
      budgetPKR: 6500000,
      stage: 'negotiation',
      notes: 'Offered PKR 6.2M. Discussing payment milestone split with society director.',
      lastContact: 'Yesterday',
      preferredContactMethod: 'whatsapp'
    },
    {
      id: 'lead-3',
      name: 'Chaudhry Waqas',
      phone: '+92 333 9988776',
      email: 'waqas.chaudhry@gmail.com',
      city: 'Sialkot',
      propertyInterest: '3 Marla Sector B Villa',
      budgetPKR: 3800000,
      stage: 'won',
      notes: 'Deal closed! Token advance of PKR 100k received, down payment cleared.',
      lastContact: 'Aug 14',
      preferredContactMethod: 'in_person'
    },
    {
      id: 'lead-4',
      name: 'Sardar Tahir',
      phone: '+92 302 1122334',
      email: 'sardar.tahir@export.pk',
      city: 'Narowal',
      propertyInterest: '7 Marla Shakargarh Road File',
      budgetPKR: 2100000,
      stage: 'new',
      notes: 'Inquired through web marketplace. Looking for 36-month flexible installment plan.',
      lastContact: '2 hours ago',
      preferredContactMethod: 'phone'
    }
  ]);

  // Tasks state
  const todayStr = useMemo(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  const yesterdayStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  const [tasks, setTasks] = useState<DealerTask[]>([
    {
      id: 'task-1',
      dealerId: currentUser?.id || 'dealer-01',
      leadId: 'lead-1',
      leadName: 'Muhammad Farooq',
      leadPhone: '+92 300 8472910',
      propertyInterest: 'Plot 42-A (5 Marla Executive)',
      title: 'Physical Site Tour & Boundary Demarcation',
      type: 'site_visit',
      dueDate: todayStr,
      dueTime: '16:00',
      priority: 'urgent',
      status: 'pending',
      location: 'Gate 2, Al-Rehman Garden Phase 7',
      notes: 'Bring official society map brochure and token advance receipt voucher book.',
      reminderTiming: '15_min_before',
      createdAt: '2026-08-28T09:00:00Z'
    },
    {
      id: 'task-2',
      dealerId: currentUser?.id || 'dealer-01',
      leadId: 'lead-2',
      leadName: 'Dr. Kamran Akmal',
      leadPhone: '+92 321 4455667',
      propertyInterest: '10 Marla Corner Commercial',
      title: 'Follow-up Call: Finalize 4-Stage Payment Milestone',
      type: 'call',
      dueDate: todayStr,
      dueTime: '14:30',
      priority: 'high',
      status: 'pending',
      location: 'Direct Phone (+92 321 4455667)',
      notes: 'Confirm if client agrees to PKR 1.5M down payment with 4 quarterly balloon installments.',
      reminderTiming: 'due_time',
      createdAt: '2026-08-28T11:00:00Z'
    },
    {
      id: 'task-3',
      dealerId: currentUser?.id || 'dealer-01',
      leadId: 'lead-4',
      leadName: 'Sardar Tahir',
      leadPhone: '+92 302 1122334',
      propertyInterest: '7 Marla Shakargarh Road File',
      title: 'Introductory Call & Installment Schedule Share',
      type: 'call',
      dueDate: yesterdayStr,
      dueTime: '11:00',
      priority: 'high',
      status: 'pending',
      location: 'Direct Phone Call',
      notes: 'Client requested installment comparison between 36-month and 48-month options.',
      reminderTiming: '1_hour_before',
      createdAt: '2026-08-27T10:00:00Z'
    },
    {
      id: 'task-4',
      dealerId: currentUser?.id || 'dealer-01',
      leadId: 'lead-3',
      leadName: 'Chaudhry Waqas',
      leadPhone: '+92 333 9988776',
      propertyInterest: '3 Marla Sector B Villa',
      title: 'Token Advance Deposit & Application Signing',
      type: 'token_advance',
      dueDate: '2026-08-14',
      dueTime: '12:00',
      priority: 'urgent',
      status: 'completed',
      location: 'Dealer Head Office',
      notes: 'Token advance received in cash. Receipt Ref: TKN-9921 issued.',
      reminderTiming: 'due_time',
      completedAt: 'Aug 14, 1:15 PM',
      completionNotes: 'Client deposited PKR 100,000 token. Transferred file to society allotment desk.',
      outcome: 'token_received',
      createdAt: '2026-08-13T14:00:00Z'
    },
    {
      id: 'task-5',
      dealerId: currentUser?.id || 'dealer-01',
      leadId: 'lead-1',
      leadName: 'Muhammad Farooq',
      leadPhone: '+92 300 8472910',
      propertyInterest: 'Plot 42-A (5 Marla Executive)',
      title: 'Review Registry & Sub-Registrar NOC Documents',
      type: 'document_followup',
      dueDate: tomorrowStr,
      dueTime: '11:30',
      priority: 'medium',
      status: 'pending',
      location: 'Society Administrative Office',
      notes: 'Hand over copy of computerized Fard and approved master plan NOC.',
      reminderTiming: '1_day_before',
      createdAt: '2026-08-29T08:00:00Z'
    },
    {
      id: 'task-6',
      dealerId: currentUser?.id || 'dealer-01',
      leadId: 'lead-4',
      leadName: 'Sardar Tahir',
      leadPhone: '+92 302 1122334',
      propertyInterest: '7 Marla Shakargarh Road File',
      title: 'Send Society Video Walkthrough & Masterplan PDF',
      type: 'document_followup',
      dueDate: tomorrowStr,
      dueTime: '17:00',
      priority: 'low',
      status: 'pending',
      location: 'WhatsApp Document Share',
      notes: 'Send high-res masterplan layout and amenities video tour via WhatsApp.',
      reminderTiming: '1_hour_before',
      createdAt: '2026-08-30T10:00:00Z'
    },
    {
      id: 'task-7',
      dealerId: currentUser?.id || 'dealer-01',
      leadId: 'lead-5',
      leadName: 'Bilal Hassan',
      leadPhone: '+92 301 5566778',
      propertyInterest: '5 Marla Commercial Boulevard',
      title: 'Quarterly Price Appreciation Update',
      type: 'call',
      dueDate: tomorrowStr,
      dueTime: '18:30',
      priority: 'low',
      status: 'pending',
      location: 'Phone Call',
      notes: 'Inform client of 12% quarterly gain in commercial boulevard sector.',
      reminderTiming: '1_hour_before',
      createdAt: '2026-08-30T11:00:00Z'
    }
  ]);

  // Modal States
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleModalLeadId, setScheduleModalLeadId] = useState<string | undefined>(undefined);
  const [scheduleModalTaskType, setScheduleModalTaskType] = useState<TaskType>('call');
  const [editingTask, setEditingTask] = useState<DealerTask | null>(null);
  
  const [completingTask, setCompletingTask] = useState<DealerTask | null>(null);
  const [selectedLeadForDetail, setSelectedLeadForDetail] = useState<LeadItem | null>(null);

  // New Lead Inline Form
  const [newLeadName, setNewLeadName] = useState('');
  const [newLeadPhone, setNewLeadPhone] = useState('');
  const [newLeadInterest, setNewLeadInterest] = useState('');
  const [newLeadBudget, setNewLeadBudget] = useState(2500000);
  const [showAddForm, setShowAddForm] = useState(false);

  // Alert banner state
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [liveAlertToast, setLiveAlertToast] = useState<{ title: string; message: string; type: string } | null>(null);

  // Sound chime helper
  const playAlertChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch {
      // audio context blocked by browser policy until interaction
    }
  };

  // Check for due tasks & dispatch notification
  const overdueTasks = useMemo(() => {
    return tasks.filter(t => t.status === 'pending' && t.dueDate < todayStr);
  }, [tasks, todayStr]);

  const dueTodayTasks = useMemo(() => {
    return tasks.filter(t => t.status === 'pending' && t.dueDate === todayStr);
  }, [tasks, todayStr]);

  // Automated continuous overdue tasks monitor & alert trigger system
  useEffect(() => {
    const cleanupMonitor = taskOverdueAutomationService.startAutoMonitor(
      () => tasks,
      (updatedTasks) => {
        setTasks(updatedTasks);
      },
      (log) => {
        playAlertChime();
        setLiveAlertToast({
          title: `🚨 Overdue Task Alert Triggered`,
          message: `Task "${log.taskTitle}" for ${log.leadName} passed its due date. Email sent to ${log.emailRecipient} & Push notification dispatched.`,
          type: 'overdue'
        });
        setTimeout(() => {
          setLiveAlertToast(null);
        }, 7000);
      },
      currentUser
    );

    return () => {
      cleanupMonitor();
    };
  }, [currentUser]);

  // Handler: Add New Lead
  const handleAddLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadName) return;

    const newLead: LeadItem = {
      id: `lead-${Date.now()}`,
      name: newLeadName,
      phone: newLeadPhone || '+92 300 0000000',
      propertyInterest: newLeadInterest || '5 Marla Residential Plot',
      budgetPKR: newLeadBudget,
      stage: 'new',
      notes: 'Created manually by dealer in CRM',
      lastContact: 'Just now',
      preferredContactMethod: 'phone'
    };

    setLeads([newLead, ...leads]);
    setNewLeadName('');
    setNewLeadPhone('');
    setNewLeadInterest('');
    setShowAddForm(false);
  };

  // Handler: Move Lead Stage
  const moveStage = (leadId: string, newStage: LeadStage) => {
    setLeads(leads.map(l => l.id === leadId ? { ...l, stage: newStage } : l));
  };

  // Handler: Save Task (Create or Update)
  const handleSaveTask = (taskData: Omit<DealerTask, 'id' | 'createdAt'> & { id?: string }) => {
    if (taskData.id) {
      // Update existing
      setTasks(tasks.map(t => t.id === taskData.id ? { ...t, ...taskData, updatedAt: new Date().toISOString() } : t));
    } else {
      // Create new
      const newTask: DealerTask = {
        ...taskData,
        id: `task-${Date.now()}`,
        dealerId: currentUser?.id || 'dealer-01',
        createdAt: new Date().toISOString()
      };

      setTasks([newTask, ...tasks]);

      // If it's a site visit, advance lead stage to visit_scheduled if currently new
      if (newTask.type === 'site_visit') {
        const targetLead = leads.find(l => l.id === newTask.leadId);
        if (targetLead && targetLead.stage === 'new') {
          moveStage(targetLead.id, 'visit_scheduled');
        }

        // Dispatch site visit confirmation notification
        notificationService.dispatchWorkflowNotification(
          'DEALER_SITE_VISIT_REMINDER',
          {
            taskTitle: newTask.title,
            customerName: newTask.leadName,
            customerPhone: newTask.leadPhone,
            plotNumber: newTask.propertyInterest,
            dueTime: `${newTask.dueDate} at ${newTask.dueTime}`,
            location: newTask.location,
            dealerName: currentUser?.name || 'Authorized Dealer',
            taskId: newTask.id
          },
          {
            userId: currentUser?.id || 'dealer-01',
            role: 'dealer'
          },
          {
            channels: ['in_app', 'push', 'sms']
          }
        );
      }
    }
  };

  // Handler: Complete Task
  const handleCompleteTask = (
    taskId: string, 
    outcome: DealerTask['outcome'], 
    completionNotes: string, 
    newLeadStage?: LeadStage
  ) => {
    const task = tasks.find(t => t.id === taskId);
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setTasks(tasks.map(t => t.id === taskId ? {
      ...t,
      status: 'completed',
      outcome,
      completionNotes,
      completedAt: `Today, ${nowStr}`
    } : t));

    if (task && newLeadStage) {
      moveStage(task.leadId, newLeadStage);
    }
  };

  // Handler: Reschedule Task
  const handleRescheduleTask = (taskId: string, newDate: string, newTime: string) => {
    setTasks(tasks.map(t => t.id === taskId ? {
      ...t,
      dueDate: newDate,
      dueTime: newTime,
      status: 'pending',
      updatedAt: new Date().toISOString()
    } : t));
  };

  // Handler: Change Task Priority (Low, Medium, High)
  const handleUpdateTaskPriority = (taskId: string, newPriority: TaskPriority) => {
    setTasks(tasks.map(t => t.id === taskId ? {
      ...t,
      priority: newPriority,
      updatedAt: new Date().toISOString()
    } : t));
  };

  // Handler: Delete Task
  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  // Handler: Test Real-time Alert
  const handleTriggerTestAlert = (task: DealerTask) => {
    playAlertChime();
    setLiveAlertToast({
      title: `⏰ Reminder: ${task.title}`,
      message: `Due today at ${task.dueTime} with ${task.leadName} (${task.leadPhone}). Location: ${task.location || 'Direct'}`,
      type: task.type
    });

    notificationService.dispatchWorkflowNotification(
      'DEALER_TASK_DUE_ALERT',
      {
        taskTitle: task.title,
        customerName: task.leadName,
        customerPhone: task.leadPhone,
        plotNumber: task.propertyInterest,
        dueTime: `${task.dueDate} at ${task.dueTime}`,
        location: task.location,
        dealerName: currentUser?.name || 'Authorized Dealer',
        taskId: task.id
      },
      {
        userId: currentUser?.id || 'dealer-01',
        role: 'dealer',
        name: currentUser?.name || 'Authorized Dealer'
      },
      {
        channels: ['in_app', 'push', 'sms']
      }
    );

    setTimeout(() => {
      setLiveAlertToast(null);
    }, 6000);
  };

  // Open modal helper
  const openScheduleModal = (leadId?: string, taskType: TaskType = 'call') => {
    setEditingTask(null);
    setScheduleModalLeadId(leadId);
    setScheduleModalTaskType(taskType);
    setIsScheduleModalOpen(true);
  };

  const openEditModal = (task: DealerTask) => {
    setEditingTask(task);
    setScheduleModalLeadId(task.leadId);
    setScheduleModalTaskType(task.type);
    setIsScheduleModalOpen(true);
  };

  // Next task per lead lookup
  const getNextTaskForLead = (leadId: string) => {
    return tasks
      .filter(t => t.leadId === leadId && t.status === 'pending')
      .sort((a, b) => `${a.dueDate} ${a.dueTime}`.localeCompare(`${b.dueDate} ${b.dueTime}`))[0];
  };

  return (
    <div className="space-y-6">
      
      {/* Live Toast Prompt if triggered */}
      {liveAlertToast && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-teal-500/50 max-w-sm animate-bounce-in flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
            <Bell className="w-4 h-4 animate-pulse" />
          </div>
          <div className="flex-1 text-xs">
            <div className="font-bold text-teal-300">{liveAlertToast.title}</div>
            <p className="text-slate-300 mt-0.5 leading-relaxed">{liveAlertToast.message}</p>
          </div>
          <button
            onClick={() => setLiveAlertToast(null)}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Real-time Proactive Due Task Notification Alert Banner */}
      {!bannerDismissed && (overdueTasks.length > 0 || dueTodayTasks.length > 0) && (
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 p-4 sm:p-5 rounded-2xl text-white shadow-md border border-teal-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/30 text-amber-400 flex items-center justify-center shrink-0">
              {overdueTasks.length > 0 ? (
                <AlertTriangle className="w-5 h-5 animate-pulse text-rose-400" />
              ) : (
                <Clock className="w-5 h-5 text-amber-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                  {overdueTasks.length > 0 ? '⚠️ Action Required: Overdue Follow-ups' : '🔔 Scheduled Tasks Due Today'}
                </span>
                <span className="px-2 py-0.5 bg-white/10 rounded-full text-[10px] font-bold text-teal-200">
                  {overdueTasks.length} Overdue • {dueTodayTasks.length} Due Today
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {overdueTasks.length > 0 
                  ? `Task "${overdueTasks[0].title}" for ${overdueTasks[0].leadName} requires immediate dealer contact.`
                  : `You have ${dueTodayTasks.length} client follow-up call(s) or site visit(s) scheduled for today.`
                }
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <button
              onClick={() => {
                setViewMode('tasks');
                playAlertChime();
              }}
              className="px-3.5 py-1.5 bg-teal-500 hover:bg-teal-400 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>View Agenda</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setBannerDismissed(true)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
              title="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main CRM Navigation Header & Tab Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          
          {/* Tab: Tasks & Follow-up Scheduler */}
          <button
            onClick={() => setViewMode('tasks')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
              viewMode === 'tasks'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-teal-300" />
            <span>Follow-up & Task Scheduler</span>
            {(overdueTasks.length > 0 || dueTodayTasks.length > 0) && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                overdueTasks.length > 0 ? 'bg-rose-500 text-white animate-pulse' : 'bg-amber-400 text-slate-900'
              }`}>
                {overdueTasks.length + dueTodayTasks.length}
              </span>
            )}
          </button>

          {/* Tab: CRM Leads & Inquiries */}
          <button
            onClick={() => setViewMode('leads')}
            className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
              viewMode === 'leads'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Client Inquiries & CRM Leads ({leads.length})</span>
          </button>

          {/* Tab: 6-Stage Deal Pipeline (Kanban) */}
          <button
            onClick={() => setViewMode('kanban')}
            className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
              viewMode === 'kanban'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Kanban className="w-3.5 h-3.5" />
            <span>6-Stage Deal Pipeline</span>
          </button>

        </div>

        {/* Global Quick Action */}
        <div className="flex items-center gap-2">
          {viewMode === 'leads' && (
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Client Lead</span>
            </button>
          )}

          {viewMode === 'tasks' && (
            <button
              onClick={() => openScheduleModal(undefined, 'call')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Schedule New Task</span>
            </button>
          )}
        </div>

      </div>

      {/* Render View Modes */}
      
      {/* 1. TASKS & SCHEDULER VIEW */}
      {viewMode === 'tasks' && (
        <DealerTaskScheduleTab
          tasks={tasks}
          leads={leads}
          onOpenScheduleModal={openScheduleModal}
          onEditTask={openEditModal}
          onDeleteTask={handleDeleteTask}
          onOpenCompleteModal={(task) => setCompletingTask(task)}
          onRescheduleTask={handleRescheduleTask}
          onChangePriority={handleUpdateTaskPriority}
          onTriggerTestAlert={handleTriggerTestAlert}
          onSelectLead={(lead) => setSelectedLeadForDetail(lead)}
          onTasksUpdated={setTasks}
          currentUser={currentUser}
          onTriggerToast={(toast) => {
            playAlertChime();
            setLiveAlertToast(toast as any);
            setTimeout(() => {
              setLiveAlertToast(null);
            }, 7000);
          }}
        />
      )}

      {/* 2. LEADS CRM LIST VIEW */}
      {viewMode === 'leads' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Add Lead Form */}
          {showAddForm && (
            <div className="bg-white p-5 rounded-2xl border border-teal-200 shadow-sm space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Add New Client Inquiry / Lead</h3>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <form onSubmit={handleAddLead} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <input
                  type="text"
                  placeholder="Client Full Name *"
                  required
                  value={newLeadName}
                  onChange={(e) => setNewLeadName(e.target.value)}
                  className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500"
                />
                <input
                  type="text"
                  placeholder="Mobile (+92 300 0000000)"
                  value={newLeadPhone}
                  onChange={(e) => setNewLeadPhone(e.target.value)}
                  className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500"
                />
                <input
                  type="text"
                  placeholder="Interested Plot / Society"
                  value={newLeadInterest}
                  onChange={(e) => setNewLeadInterest(e.target.value)}
                  className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500"
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Budget (PKR)"
                    value={newLeadBudget}
                    onChange={(e) => setNewLeadBudget(Number(e.target.value))}
                    className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 flex-1"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl"
                  >
                    Save Lead
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Leads Grid with Task Integration */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {leads.map((lead) => {
              const nextTask = getNextTaskForLead(lead.id);
              const leadTasksCount = tasks.filter(t => t.leadId === lead.id).length;

              return (
                <div
                  key={lead.id}
                  className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3.5 text-xs hover:border-teal-300 transition flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <button
                          onClick={() => setSelectedLeadForDetail(lead)}
                          className="font-bold text-slate-900 text-sm hover:text-teal-700 transition text-left cursor-pointer flex items-center gap-1.5"
                        >
                          <span>{lead.name}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                        </button>
                        <p className="text-slate-500 font-mono text-[11px] mt-0.5">{lead.phone}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        lead.stage === 'won' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                        lead.stage === 'negotiation' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                        lead.stage === 'visit_scheduled' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                        'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {lead.stage.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>

                    {/* Interest & Budget */}
                    <div className="bg-slate-50 p-2.5 rounded-xl space-y-1">
                      <div className="text-slate-700 font-semibold">{lead.propertyInterest}</div>
                      <div className="font-mono text-emerald-800 font-bold">
                        Budget: PKR {(lead.budgetPKR / 100000).toFixed(1)} Lakh
                      </div>
                    </div>

                    {/* Next Scheduled Task Pill */}
                    {nextTask ? (
                      <div className="bg-teal-50/70 p-2 rounded-xl border border-teal-200/80 text-[11px] space-y-1">
                        <div className="flex items-center justify-between text-teal-950 font-bold">
                          <span className="flex items-center gap-1">
                            {nextTask.type === 'site_visit' ? <Car className="w-3.5 h-3.5 text-blue-600" /> : <Phone className="w-3.5 h-3.5 text-teal-600" />}
                            <span>Next: {nextTask.title}</span>
                          </span>
                          <span className="text-[10px] font-mono bg-teal-200/60 px-1.5 py-0.5 rounded">
                            {nextTask.dueDate === todayStr ? 'Today' : nextTask.dueDate} {nextTask.dueTime}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-50 p-2 rounded-xl border border-dashed border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
                        <span>No upcoming follow-up scheduled</span>
                        <button
                          onClick={() => openScheduleModal(lead.id, 'call')}
                          className="text-teal-700 hover:text-teal-900 font-bold underline cursor-pointer"
                        >
                          + Schedule
                        </button>
                      </div>
                    )}

                    <p className="text-[11px] text-slate-500 italic line-clamp-2">"{lead.notes}"</p>

                  </div>

                  {/* Actions footer */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5 flex-wrap">
                    
                    <div className="flex items-center gap-1">
                      <a
                        href={`tel:${lead.phone}`}
                        className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-bold"
                        title="Call"
                      >
                        <Phone className="w-3 h-3 text-teal-600" />
                      </a>
                      <a
                        href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Assalam-o-Alaikum ${lead.name}, regarding ${lead.propertyInterest}.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-bold"
                        title="WhatsApp"
                      >
                        <MessageSquare className="w-3 h-3 text-emerald-600" />
                      </a>
                      <button
                        onClick={() => openScheduleModal(lead.id, 'site_visit')}
                        className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-lg text-[10px] font-bold"
                        title="Schedule Site Visit"
                      >
                        <Car className="w-3 h-3 text-blue-600 inline mr-0.5" />
                        <span>Visit</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setSelectedLeadForDetail(lead)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold cursor-pointer"
                      >
                        Tasks ({leadTasksCount})
                      </button>

                      {lead.stage !== 'won' && (
                        <button
                          onClick={() => moveStage(lead.id, 'won')}
                          className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold"
                        >
                          Won
                        </button>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. KANBAN PIPELINE VIEW */}
      {viewMode === 'kanban' && (
        <DealPipelineKanban
          bookings={bookings}
          currentUser={currentUser}
          onAdvancePipeline={onAdvancePipeline}
          onMoveBackPipeline={onMoveBackPipeline}
          onCancelBooking={onCancelBooking}
          roleAccent="teal"
        />
      )}

      {/* Schedule Task Modal */}
      <DealerTaskModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onSave={handleSaveTask}
        leads={leads}
        initialLeadId={scheduleModalLeadId}
        initialTask={editingTask}
        defaultType={scheduleModalTaskType}
      />

      {/* Complete Task Modal */}
      <DealerTaskCompletionModal
        isOpen={!!completingTask}
        onClose={() => setCompletingTask(null)}
        task={completingTask}
        onComplete={handleCompleteTask}
        onScheduleNext={(leadId) => openScheduleModal(leadId, 'call')}
      />

      {/* Lead Detail & History Drawer */}
      <LeadDetailModal
        isOpen={!!selectedLeadForDetail}
        onClose={() => setSelectedLeadForDetail(null)}
        lead={selectedLeadForDetail}
        tasks={tasks}
        onOpenScheduleModal={(leadId, type) => openScheduleModal(leadId, type || 'call')}
        onAdvanceStage={moveStage}
        onOpenCompleteModal={(task) => setCompletingTask(task)}
      />

    </div>
  );
};
