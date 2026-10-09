import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  Phone, 
  Car, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Search, 
  Filter, 
  ArrowRight,
  MessageSquare, 
  MapPin, 
  MoreVertical, 
  DollarSign, 
  FileText, 
  Briefcase, 
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Bell,
  Check,
  ChevronRight,
  ExternalLink,
  Volume2,
  Palette,
  Layers,
  LayoutGrid,
  ListFilter,
  ChevronDown,
  Mail,
  ShieldCheck,
  Sliders,
  RefreshCw,
  Smartphone
} from 'lucide-react';
import { DealerTask, LeadItem, TaskPriority, TaskType, TaskStatus } from '../../types/crm';
import { taskOverdueAutomationService } from '../../services/taskOverdueAutomationService';
import { TaskOverdueAutomationModal } from './TaskOverdueAutomationModal';

interface DealerTaskScheduleTabProps {
  tasks: DealerTask[];
  leads: LeadItem[];
  onOpenScheduleModal: (leadId?: string, taskType?: TaskType) => void;
  onEditTask: (task: DealerTask) => void;
  onDeleteTask: (taskId: string) => void;
  onOpenCompleteModal: (task: DealerTask) => void;
  onRescheduleTask: (taskId: string, newDate: string, newTime: string) => void;
  onChangePriority?: (taskId: string, newPriority: TaskPriority) => void;
  onTriggerTestAlert?: (task: DealerTask) => void;
  onSelectLead?: (lead: LeadItem) => void;
  onTasksUpdated?: (tasks: DealerTask[]) => void;
  currentUser?: any;
  onTriggerToast?: (toast: { title: string; message: string; type?: string }) => void;
}

export const DealerTaskScheduleTab: React.FC<DealerTaskScheduleTabProps> = ({
  tasks,
  leads,
  onOpenScheduleModal,
  onEditTask,
  onDeleteTask,
  onOpenCompleteModal,
  onRescheduleTask,
  onChangePriority,
  onTriggerTestAlert,
  onSelectLead,
  onTasksUpdated,
  currentUser,
  onTriggerToast
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'due_today' | 'overdue' | 'site_visits' | 'calls' | 'completed'>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [colorCodeMode, setColorCodeMode] = useState<boolean>(true); // Color-code by priority (default ON)
  const [groupByPriority, setGroupByPriority] = useState<boolean>(false);
  const [activeRescheduleId, setActiveRescheduleId] = useState<string | null>(null);
  const [activePriorityMenuId, setActivePriorityMenuId] = useState<string | null>(null);
  const [isAutomationModalOpen, setIsAutomationModalOpen] = useState<boolean>(false);
  const [isCheckingOverdue, setIsCheckingOverdue] = useState<boolean>(false);

  // Overdue Check Handler
  const handleRunOverdueCheck = async () => {
    setIsCheckingOverdue(true);
    try {
      const result = await taskOverdueAutomationService.evaluateAndTriggerOverdue(
        tasks,
        currentUser,
        { forceAllOverdue: false }
      );
      if (result.triggeredCount > 0 && onTasksUpdated) {
        onTasksUpdated(result.updatedTasks);
      }
      if (onTriggerToast) {
        onTriggerToast({
          title: result.triggeredCount > 0 ? '🚨 Overdue Alerts Triggered' : '✅ Overdue Scan Clean',
          message: result.summary,
          type: result.triggeredCount > 0 ? 'overdue' : 'task'
        });
      }
    } catch (e) {
      console.error('Overdue check failed:', e);
    } finally {
      setIsCheckingOverdue(false);
    }
  };

  // Trigger individual overdue alert
  const handleSingleTaskOverdueAlert = async (task: DealerTask) => {
    setIsCheckingOverdue(true);
    try {
      const result = await taskOverdueAutomationService.evaluateAndTriggerOverdue(
        tasks,
        currentUser,
        { testSpecificTaskId: task.id }
      );
      if (result.triggeredCount > 0 && onTasksUpdated) {
        onTasksUpdated(result.updatedTasks);
      }
      if (onTriggerToast) {
        onTriggerToast({
          title: '📧 Overdue Alert Dispatched',
          message: `Automated Email & Push notification sent for overdue task: "${task.title}".`,
          type: 'overdue'
        });
      }
    } catch (e) {
      console.error('Single task alert failed:', e);
    } finally {
      setIsCheckingOverdue(false);
    }
  };

  // Close menus on outside click
  useEffect(() => {
    const handleOutsideClick = () => {
      setActivePriorityMenuId(null);
      setActiveRescheduleId(null);
    };
    if (activePriorityMenuId || activeRescheduleId) {
      window.addEventListener('click', handleOutsideClick);
      return () => window.removeEventListener('click', handleOutsideClick);
    }
  }, [activePriorityMenuId, activeRescheduleId]);

  // Priority metadata & color configurations
  const getPriorityMeta = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent':
      case 'high':
        return {
          id: 'high' as const,
          label: priority === 'urgent' ? 'URGENT' : 'HIGH',
          displayLabel: 'High Priority',
          badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 font-bold',
          cardBorderClass: 'border-l-[6px] border-l-rose-500 border-rose-200 bg-gradient-to-br from-rose-50/40 via-white to-white shadow-2xs',
          tableRowClass: 'border-l-4 border-l-rose-500 hover:bg-rose-50/30',
          dotColor: 'bg-rose-500',
          textColor: 'text-rose-700',
          colorName: 'Rose / Red'
        };
      case 'medium':
        return {
          id: 'medium' as const,
          label: 'MEDIUM',
          displayLabel: 'Medium Priority',
          badgeClass: 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
          cardBorderClass: 'border-l-[6px] border-l-amber-500 border-amber-200 bg-gradient-to-br from-amber-50/35 via-white to-white shadow-2xs',
          tableRowClass: 'border-l-4 border-l-amber-500 hover:bg-amber-50/30',
          dotColor: 'bg-amber-500',
          textColor: 'text-amber-800',
          colorName: 'Amber / Yellow'
        };
      case 'low':
      default:
        return {
          id: 'low' as const,
          label: 'LOW',
          displayLabel: 'Low Priority',
          badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold',
          cardBorderClass: 'border-l-[6px] border-l-emerald-500 border-emerald-200 bg-gradient-to-br from-emerald-50/30 via-white to-white shadow-2xs',
          tableRowClass: 'border-l-4 border-l-emerald-500 hover:bg-emerald-50/25',
          dotColor: 'bg-emerald-500',
          textColor: 'text-emerald-700',
          colorName: 'Emerald / Green'
        };
    }
  };

  // Helper to determine date relative status
  const getTaskDateStatus = (dueDate: string, dueTime: string, status: TaskStatus) => {
    if (status === 'completed') return { label: 'COMPLETED', color: 'emerald', isOverdue: false, isToday: false };
    if (status === 'cancelled') return { label: 'CANCELLED', color: 'slate', isOverdue: false, isToday: false };

    const todayStr = new Date().toISOString().split('T')[0];
    const taskDate = new Date(`${dueDate}T${dueTime || '00:00'}`);
    const now = new Date();

    if (dueDate < todayStr) {
      return { label: 'OVERDUE', color: 'rose', isOverdue: true, isToday: false };
    }
    if (dueDate === todayStr) {
      if (taskDate < now) {
        return { label: 'OVERDUE TODAY', color: 'rose', isOverdue: true, isToday: true };
      }
      return { label: 'DUE TODAY', color: 'amber', isOverdue: false, isToday: true };
    }
    return { label: `DUE IN ${Math.ceil((taskDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))} DAYS`, color: 'teal', isOverdue: false, isToday: false };
  };

  // Metrics
  const todayStr = new Date().toISOString().split('T')[0];
  const overdueCount = tasks.filter(t => t.status === 'pending' && t.dueDate < todayStr).length;
  const dueTodayCount = tasks.filter(t => t.status === 'pending' && t.dueDate === todayStr).length;
  const siteVisitsCount = tasks.filter(t => t.status === 'pending' && t.type === 'site_visit').length;
  const callsCount = tasks.filter(t => t.status === 'pending' && t.type === 'call').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;

  // Priority Metrics
  const highPriorityCount = tasks.filter(t => t.priority === 'high' || t.priority === 'urgent').length;
  const mediumPriorityCount = tasks.filter(t => t.priority === 'medium').length;
  const lowPriorityCount = tasks.filter(t => t.priority === 'low').length;

  // Filtered list
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const dateStatus = getTaskDateStatus(t.dueDate, t.dueTime, t.status);

      if (filterStatus === 'due_today' && !dateStatus.isToday && !dateStatus.isOverdue) return false;
      if (filterStatus === 'overdue' && !dateStatus.isOverdue) return false;
      if (filterStatus === 'site_visits' && t.type !== 'site_visit') return false;
      if (filterStatus === 'calls' && t.type !== 'call') return false;
      if (filterStatus === 'completed' && t.status !== 'completed') return false;
      if (filterStatus !== 'completed' && filterStatus !== 'all' && t.status === 'completed') return false;

      // Priority Filter
      if (filterPriority === 'high' && t.priority !== 'high' && t.priority !== 'urgent') return false;
      if (filterPriority === 'medium' && t.priority !== 'medium') return false;
      if (filterPriority === 'low' && t.priority !== 'low') return false;
      if (filterPriority !== 'all' && filterPriority !== 'high' && filterPriority !== 'medium' && filterPriority !== 'low' && t.priority !== filterPriority) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = t.leadName.toLowerCase().includes(q);
        const matchPhone = t.leadPhone.toLowerCase().includes(q);
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchProperty = t.propertyInterest.toLowerCase().includes(q);
        const matchNotes = (t.notes || '').toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchTitle && !matchProperty && !matchNotes) return false;
      }

      return true;
    }).sort((a, b) => {
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (b.status === 'completed' && a.status !== 'completed') return -1;
      return `${a.dueDate} ${a.dueTime}`.localeCompare(`${b.dueDate} ${b.dueTime}`);
    });
  }, [tasks, filterStatus, filterPriority, searchQuery]);

  const getTypeIcon = (type: TaskType) => {
    switch (type) {
      case 'site_visit': return <Car className="w-4 h-4 text-blue-600" />;
      case 'call': return <Phone className="w-4 h-4 text-teal-600" />;
      case 'token_advance': return <DollarSign className="w-4 h-4 text-emerald-600" />;
      case 'document_followup': return <FileText className="w-4 h-4 text-amber-600" />;
      default: return <Briefcase className="w-4 h-4 text-purple-600" />;
    }
  };

  const handleQuickReschedule = (taskId: string, daysToAdd: number) => {
    const targetTask = tasks.find(t => t.id === taskId);
    if (!targetTask) return;
    
    const d = new Date();
    d.setDate(d.getDate() + daysToAdd);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    onRescheduleTask(taskId, `${yyyy}-${mm}-${dd}`, targetTask.dueTime || '15:00');
    setActiveRescheduleId(null);
  };

  // Interactive Quick Priority Selector Component
  const PriorityQuickSelector: React.FC<{ task: DealerTask }> = ({ task }) => {
    const meta = getPriorityMeta(task.priority);
    const isOpen = activePriorityMenuId === task.id;

    return (
      <div className="relative inline-block">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setActivePriorityMenuId(isOpen ? null : task.id);
          }}
          className={`px-2 py-0.5 rounded-full text-[10px] transition cursor-pointer border flex items-center gap-1 hover:shadow-xs active:scale-95 ${meta.badgeClass}`}
          title="Click to change task priority level"
        >
          <span className={`w-1.5 h-1.5 rounded-full ${meta.dotColor}`}></span>
          <span>{meta.label}</span>
          <ChevronDown className="w-2.5 h-2.5 opacity-70" />
        </button>

        {isOpen && (
          <div 
            onClick={(e) => e.stopPropagation()}
            className="absolute top-full left-0 sm:right-0 sm:left-auto mt-1 w-44 bg-white rounded-xl shadow-xl border border-slate-200 p-1.5 z-30 space-y-1 text-xs"
          >
            <div className="text-[10px] font-bold text-slate-400 px-2 py-0.5 uppercase tracking-wider">
              Set Priority
            </div>
            {[
              { id: 'high' as TaskPriority, label: 'High Priority', dot: 'bg-rose-500', text: 'text-rose-800 hover:bg-rose-50' },
              { id: 'medium' as TaskPriority, label: 'Medium Priority', dot: 'bg-amber-500', text: 'text-amber-800 hover:bg-amber-50' },
              { id: 'low' as TaskPriority, label: 'Low Priority', dot: 'bg-emerald-500', text: 'text-emerald-800 hover:bg-emerald-50' },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  if (onChangePriority) {
                    onChangePriority(task.id, opt.id);
                  }
                  setActivePriorityMenuId(null);
                }}
                className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition cursor-pointer ${opt.text}`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${opt.dot}`}></span>
                  <span>{opt.label}</span>
                </div>
                {meta.id === opt.id && <Check className="w-3.5 h-3.5 text-teal-600" />}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Render individual task card
  const renderTaskCard = (task: DealerTask) => {
    const dateStatus = getTaskDateStatus(task.dueDate, task.dueTime, task.status);
    const meta = getPriorityMeta(task.priority);
    const linkedLead = leads.find(l => l.id === task.leadId);

    // Apply priority color coding if enabled; otherwise default to date status styling
    const cardBorderClasses = colorCodeMode
      ? meta.cardBorderClass
      : dateStatus.isOverdue 
        ? 'border-rose-300 bg-rose-50/20' 
        : dateStatus.isToday
        ? 'border-amber-300 bg-amber-50/15'
        : task.status === 'completed'
        ? 'border-emerald-200 bg-slate-50/40 opacity-80'
        : 'border-slate-200 bg-white';

    return (
      <div
        key={task.id}
        className={`rounded-2xl border transition-all duration-200 overflow-hidden shadow-2xs hover:shadow-md flex flex-col justify-between ${cardBorderClasses}`}
      >
        {/* Card Header */}
        <div className="p-4 space-y-3">
          
          <div className="flex items-start justify-between gap-2">
            
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                task.type === 'site_visit' ? 'bg-blue-50 border-blue-200' :
                task.type === 'call' ? 'bg-teal-50 border-teal-200' :
                task.type === 'token_advance' ? 'bg-emerald-50 border-emerald-200' :
                'bg-slate-50 border-slate-200'
              }`}>
                {getTypeIcon(task.type)}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1">
                  {task.title}
                </h4>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                  <span>{task.type.replace('_', ' ').toUpperCase()}</span>
                  <span>•</span>
                  <span className="font-mono text-slate-700">{task.dueDate} at {task.dueTime}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
              {/* Interactive Priority Selector Badge */}
              <PriorityQuickSelector task={task} />

              {/* Overdue alert indicator badge */}
              {task.overdueAlertSent && (
                <span 
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1"
                  title={`Automated Email & Push alert was dispatched on ${task.overdueAlertSentAt ? new Date(task.overdueAlertSentAt).toLocaleTimeString() : 'record'}`}
                >
                  <Mail className="w-2.5 h-2.5 text-rose-700" />
                  <span>Alert Sent</span>
                </span>
              )}

              {/* Due Date Status Badge */}
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                dateStatus.color === 'rose' ? 'bg-rose-50 text-rose-800 border-rose-300 animate-pulse' :
                dateStatus.color === 'amber' ? 'bg-amber-50 text-amber-800 border-amber-300' :
                dateStatus.color === 'emerald' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                'bg-teal-50 text-teal-800 border-teal-200'
              }`}>
                {dateStatus.label}
              </span>
            </div>

          </div>

          {/* Lead Info Pill & Meeting Location */}
          <div className="bg-slate-50/90 p-2.5 rounded-xl border border-slate-200/80 space-y-1.5 text-xs">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-800">{task.leadName}</span>
                {linkedLead && onSelectLead && (
                  <button
                    onClick={() => onSelectLead(linkedLead)}
                    className="text-[10px] text-teal-700 hover:text-teal-900 underline font-semibold cursor-pointer"
                  >
                    View Lead Profile
                  </button>
                )}
              </div>
              <span className="font-mono text-slate-600 text-[11px]">{task.leadPhone}</span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-600">
              <span className="truncate max-w-[200px]">📍 {task.location || 'Direct Call'}</span>
              <span className="font-medium text-emerald-800">Plot: {task.propertyInterest}</span>
            </div>

          </div>

          {/* Notes / Agenda */}
          {task.notes && (
            <p className="text-[11px] text-slate-600 bg-white/70 p-2 rounded-lg border border-slate-200/80 line-clamp-2">
              <span className="font-bold text-slate-900">Agenda: </span>
              {task.notes}
            </p>
          )}

          {/* Completion Details if finished */}
          {task.status === 'completed' && task.completionNotes && (
            <div className="text-[11px] text-emerald-900 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
              <span className="font-bold">Outcome: </span>
              {task.completionNotes} ({task.completedAt})
            </div>
          )}

        </div>

        {/* Card Action Footer */}
        <div className="px-4 py-2.5 bg-slate-50/90 border-t border-slate-100 flex items-center justify-between gap-2 text-xs flex-wrap">
          
          {/* Direct Contact triggers */}
          <div className="flex items-center gap-1.5">
            <a
              href={`tel:${task.leadPhone}`}
              className="px-2.5 py-1 bg-white hover:bg-teal-50 text-teal-800 border border-slate-200 hover:border-teal-300 rounded-lg font-bold text-[11px] transition inline-flex items-center gap-1 shadow-2xs"
              title="Call Lead Phone"
            >
              <Phone className="w-3 h-3 text-teal-600" />
              <span>Call</span>
            </a>

            <a
              href={`https://wa.me/${task.leadPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Assalam-o-Alaikum ${task.leadName}, this is regarding your interest in ${task.propertyInterest} on MANZILIQ.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-800 border border-slate-200 hover:border-emerald-300 rounded-lg font-bold text-[11px] transition inline-flex items-center gap-1 shadow-2xs"
              title="Send WhatsApp Message"
            >
              <MessageSquare className="w-3 h-3 text-emerald-600" />
              <span>WhatsApp</span>
            </a>

            {dateStatus.isOverdue && task.status !== 'completed' && (
              <button
                onClick={() => handleSingleTaskOverdueAlert(task)}
                disabled={isCheckingOverdue}
                className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-lg text-[10px] font-bold transition inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                title="Trigger automated overdue Email & Push notice immediately for this task"
              >
                <Mail className="w-3 h-3 text-rose-600" />
                <span>Trigger Overdue Alert</span>
              </button>
            )}

            {onTriggerTestAlert && task.status === 'pending' && (
              <button
                onClick={() => onTriggerTestAlert(task)}
                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-semibold transition inline-flex items-center gap-1 cursor-pointer"
                title="Simulate Due Alert Notification"
              >
                <Bell className="w-3 h-3 text-amber-600" />
                <span>Test Alert</span>
              </button>
            )}
          </div>

          {/* Operational controls */}
          <div className="flex items-center gap-1.5 ml-auto">
            {task.status !== 'completed' ? (
              <>
                {/* Quick Reschedule Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setActiveRescheduleId(activeRescheduleId === task.id ? null : task.id)}
                    className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-semibold transition cursor-pointer"
                  >
                    Reschedule
                  </button>
                  
                  {activeRescheduleId === task.id && (
                    <div className="absolute bottom-full right-0 mb-1 w-40 bg-white rounded-xl shadow-xl border border-slate-200 p-1.5 z-20 space-y-1 text-[11px]">
                      <div className="font-bold text-slate-500 px-2 py-0.5 text-[10px]">Quick Shift</div>
                      <button
                        onClick={() => handleQuickReschedule(task.id, 1)}
                        className="w-full text-left px-2 py-1 hover:bg-teal-50 text-slate-700 rounded-lg transition cursor-pointer"
                      >
                        ⏩ +1 Day Tomorrow
                      </button>
                      <button
                        onClick={() => handleQuickReschedule(task.id, 3)}
                        className="w-full text-left px-2 py-1 hover:bg-teal-50 text-slate-700 rounded-lg transition cursor-pointer"
                      >
                        ⏩ +3 Days
                      </button>
                      <button
                        onClick={() => {
                          setActiveRescheduleId(null);
                          onEditTask(task);
                        }}
                        className="w-full text-left px-2 py-1 hover:bg-teal-50 text-slate-700 rounded-lg transition font-semibold cursor-pointer"
                      >
                        📅 Custom Date / Time...
                      </button>
                    </div>
                  )}
                </div>

                {/* Mark Complete */}
                <button
                  onClick={() => onOpenCompleteModal(task)}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition shadow-xs inline-flex items-center gap-1 cursor-pointer active:scale-95"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Complete</span>
                </button>
              </>
            ) : (
              <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Resolved</span>
              </span>
            )}

            <button
              onClick={() => onDeleteTask(task.id)}
              className="p-1 text-slate-400 hover:text-rose-600 transition rounded-md cursor-pointer"
              title="Delete Task"
            >
              ×
            </button>
          </div>

        </div>

      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        
        {/* Total Tasks */}
        <div 
          onClick={() => setFilterStatus('all')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            filterStatus === 'all' 
              ? 'bg-slate-900 text-white border-slate-800 shadow-md' 
              : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-[11px] font-medium opacity-80 flex items-center justify-between">
            <span>All Tasks</span>
            <Calendar className="w-3.5 h-3.5" />
          </div>
          <div className="text-xl font-black mt-1">{tasks.length}</div>
          <div className="text-[10px] opacity-70 mt-0.5">Active & historical</div>
        </div>

        {/* Overdue Alert Card */}
        <div 
          onClick={() => setFilterStatus('overdue')}
          className={`p-4 rounded-2xl border transition cursor-pointer relative overflow-hidden ${
            overdueCount > 0 
              ? 'bg-rose-50/90 text-rose-950 border-rose-300 shadow-xs' 
              : 'bg-white text-slate-800 border-slate-200'
          } ${filterStatus === 'overdue' ? 'ring-2 ring-rose-500' : ''}`}
        >
          {overdueCount > 0 && (
            <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
            </span>
          )}
          <div className="text-[11px] font-bold text-rose-700 flex items-center justify-between">
            <span>Overdue</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <div className="text-xl font-black text-rose-900 mt-1">{overdueCount}</div>
          <div className="text-[10px] text-rose-600 mt-0.5">Immediate action required</div>
        </div>

        {/* Due Today */}
        <div 
          onClick={() => setFilterStatus('due_today')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            filterStatus === 'due_today'
              ? 'bg-amber-500 text-white border-amber-600 shadow-md'
              : 'bg-amber-50/60 text-amber-950 border-amber-200 hover:border-amber-300'
          }`}
        >
          <div className="text-[11px] font-bold flex items-center justify-between">
            <span>Due Today</span>
            <Clock className="w-3.5 h-3.5" />
          </div>
          <div className="text-xl font-black mt-1">{dueTodayCount}</div>
          <div className="text-[10px] opacity-80 mt-0.5">Follow-ups scheduled</div>
        </div>

        {/* Site Visits */}
        <div 
          onClick={() => setFilterStatus('site_visits')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            filterStatus === 'site_visits'
              ? 'bg-blue-600 text-white border-blue-700 shadow-md'
              : 'bg-blue-50/60 text-blue-950 border-blue-200 hover:border-blue-300'
          }`}
        >
          <div className="text-[11px] font-bold flex items-center justify-between">
            <span>Site Visits</span>
            <Car className="w-3.5 h-3.5" />
          </div>
          <div className="text-xl font-black mt-1">{siteVisitsCount}</div>
          <div className="text-[10px] opacity-80 mt-0.5">Physical plot tours</div>
        </div>

        {/* Completed */}
        <div 
          onClick={() => setFilterStatus('completed')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            filterStatus === 'completed'
              ? 'bg-emerald-600 text-white border-emerald-700 shadow-md'
              : 'bg-emerald-50/60 text-emerald-950 border-emerald-200 hover:border-emerald-300'
          }`}
        >
          <div className="text-[11px] font-bold flex items-center justify-between">
            <span>Completed</span>
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <div className="text-xl font-black mt-1">{completedCount}</div>
          <div className="text-[10px] opacity-80 mt-0.5">Resolved interactions</div>
        </div>

      </div>

      {/* Automated CRM Overdue Alert System Banner */}
      <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-rose-900 rounded-2xl p-4 sm:p-5 text-white shadow-md border border-rose-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-400/30 text-rose-300 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-rose-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black uppercase tracking-wider text-rose-300">
                Automated Overdue Notification Engine
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>MONITORING (60s loop)</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-rose-100 border border-white/15">
                Channels: Email & Push
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Triggers high-priority Email & Push alerts immediately whenever any CRM follow-up or site visit passes its due date without being marked as complete.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end md:self-center shrink-0 flex-wrap">
          <button
            type="button"
            onClick={handleRunOverdueCheck}
            disabled={isCheckingOverdue}
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Scan all tasks for overdue timestamps now"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isCheckingOverdue ? 'animate-spin' : ''}`} />
            <span>{isCheckingOverdue ? 'Scanning...' : 'Check Overdue Now'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAutomationModalOpen(true)}
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            title="Configure channels, email destination, and view dispatched alerts log"
          >
            <Sliders className="w-3.5 h-3.5 text-rose-300" />
            <span>Automation Settings & Logs</span>
          </button>
        </div>
      </div>

      {/* Action, Filter and Color-Coding Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3.5">
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Search Field */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tasks by lead name, phone, plot, or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-teal-500 focus:bg-white transition"
            />
          </div>

          {/* Action Buttons & View Toggles */}
          <div className="flex items-center gap-2 flex-wrap">
            
            {/* Color-Coding by Priority Toggle */}
            <button
              onClick={() => setColorCodeMode(!colorCodeMode)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                colorCodeMode 
                  ? 'bg-teal-50 border-teal-300 text-teal-900 shadow-2xs' 
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
              title="Toggle priority color-coding on task cards and table rows"
            >
              <Palette className="w-3.5 h-3.5 text-teal-600" />
              <span>Color-Code by Priority: </span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] font-black ${
                colorCodeMode ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                {colorCodeMode ? 'ON' : 'OFF'}
              </span>
            </button>

            {/* Group by Priority Toggle */}
            <button
              onClick={() => setGroupByPriority(!groupByPriority)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                groupByPriority 
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs' 
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
              title="Group tasks into High, Medium, and Low Priority clusters"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{groupByPriority ? 'Grouped by Priority' : 'Group by Priority'}</span>
            </button>

            {/* Cards vs Table View Toggle */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                  viewMode === 'cards' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Cards Grid View"
              >
                <LayoutGrid className="w-3 h-3" />
                <span>Cards</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                  viewMode === 'table' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Tabular List View"
              >
                <ListFilter className="w-3 h-3" />
                <span>Table</span>
              </button>
            </div>

            <button
              onClick={() => onOpenScheduleModal(undefined, 'site_visit')}
              className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Car className="w-3.5 h-3.5 text-blue-600" />
              <span>Schedule Visit</span>
            </button>

            <button
              onClick={() => onOpenScheduleModal(undefined, 'call')}
              className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Task</span>
            </button>

          </div>

        </div>

        {/* Priority Legend & Quick Priority Filters */}
        <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
          
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-slate-700 flex items-center gap-1 text-[11px]">
              <Palette className="w-3.5 h-3.5 text-teal-600" />
              <span>Workflow Priority Levels:</span>
            </span>

            {/* All Priorities Chip */}
            <button
              onClick={() => setFilterPriority('all')}
              className={`px-2 py-0.5 rounded-full text-[11px] font-bold border transition cursor-pointer ${
                filterPriority === 'all' 
                  ? 'bg-slate-800 text-white border-slate-800' 
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              All ({tasks.length})
            </button>

            {/* High Priority Filter & Legend */}
            <button
              onClick={() => setFilterPriority(filterPriority === 'high' ? 'all' : 'high')}
              className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] transition cursor-pointer ${
                filterPriority === 'high' 
                  ? 'bg-rose-100 text-rose-900 border-rose-300 ring-2 ring-rose-400 font-extrabold' 
                  : 'bg-rose-50/80 text-rose-800 border-rose-200 hover:bg-rose-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              <span className="font-bold">High Priority ({highPriorityCount})</span>
              <span className="text-[10px] text-rose-600 hidden md:inline">• Serious Buyers & Site Visits</span>
            </button>

            {/* Medium Priority Filter & Legend */}
            <button
              onClick={() => setFilterPriority(filterPriority === 'medium' ? 'all' : 'medium')}
              className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] transition cursor-pointer ${
                filterPriority === 'medium' 
                  ? 'bg-amber-100 text-amber-950 border-amber-300 ring-2 ring-amber-400 font-extrabold' 
                  : 'bg-amber-50/80 text-amber-800 border-amber-200 hover:bg-amber-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span className="font-bold">Medium Priority ({mediumPriorityCount})</span>
              <span className="text-[10px] text-amber-600 hidden md:inline">• Follow-ups & Reviews</span>
            </button>

            {/* Low Priority Filter & Legend */}
            <button
              onClick={() => setFilterPriority(filterPriority === 'low' ? 'all' : 'low')}
              className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] transition cursor-pointer ${
                filterPriority === 'low' 
                  ? 'bg-emerald-100 text-emerald-950 border-emerald-300 ring-2 ring-emerald-400 font-extrabold' 
                  : 'bg-emerald-50/80 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="font-bold">Low Priority ({lowPriorityCount})</span>
              <span className="text-[10px] text-emerald-600 hidden md:inline">• Routine Check-ins</span>
            </button>
          </div>

          <span className="text-[10px] text-slate-500 font-medium">
            💡 Click priority badge on any card to update level instantly
          </span>

        </div>

        {/* Status Filter Chips Bar */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-100 flex-wrap gap-2 text-xs">
          
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-slate-500 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" />
              Status:
            </span>

            {[
              { id: 'all', label: 'All' },
              { id: 'due_today', label: `Due Today (${dueTodayCount})` },
              { id: 'overdue', label: `Overdue (${overdueCount})` },
              { id: 'site_visits', label: `Site Visits (${siteVisitsCount})` },
              { id: 'calls', label: `Calls (${callsCount})` },
              { id: 'completed', label: `Completed (${completedCount})` },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id as any)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  filterStatus === tab.id
                    ? 'bg-teal-700 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

        </div>

      </div>

      {/* Task Content: Empty State or Cards / Table View */}
      {filteredTasks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-800">No scheduled tasks match this filter</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Organize dealer follow-ups by setting priority levels (Low, Medium, High), physical plot site tours, and token advance collection tasks.
          </p>
          <button
            onClick={() => onOpenScheduleModal()}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Follow-up Now</span>
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Priority & Task</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Client / Lead</th>
                  <th className="py-3 px-4">Property / Location</th>
                  <th className="py-3 px-4">Due Schedule</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTasks.map((task) => {
                  const dateStatus = getTaskDateStatus(task.dueDate, task.dueTime, task.status);
                  const meta = getPriorityMeta(task.priority);

                  return (
                    <tr
                      key={task.id}
                      className={`transition ${colorCodeMode ? meta.tableRowClass : 'hover:bg-slate-50/70'}`}
                    >
                      {/* Priority & Title */}
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <PriorityQuickSelector task={task} />
                            <span className="font-bold text-slate-900 text-xs">{task.title}</span>
                          </div>
                          {task.notes && (
                            <p className="text-[11px] text-slate-500 line-clamp-1">{task.notes}</p>
                          )}
                        </div>
                      </td>

                      {/* Type */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700">
                          {getTypeIcon(task.type)}
                          <span className="text-[11px] capitalize">{task.type.replace('_', ' ')}</span>
                        </span>
                      </td>

                      {/* Client */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800">{task.leadName}</div>
                        <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500 mt-0.5">
                          <span>{task.leadPhone}</span>
                          <a
                            href={`https://wa.me/${task.leadPhone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 hover:text-emerald-700"
                            title="WhatsApp"
                          >
                            <MessageSquare className="w-3 h-3" />
                          </a>
                        </div>
                      </td>

                      {/* Property */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-emerald-900 text-[11px]">{task.propertyInterest}</div>
                        <div className="text-[10px] text-slate-500 truncate max-w-[160px]">📍 {task.location || 'Direct Call'}</div>
                      </td>

                      {/* Due Schedule */}
                      <td className="py-3 px-4">
                        <div className="font-mono text-slate-800 text-[11px] font-bold">
                          {task.dueDate} at {task.dueTime}
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-bold border ${
                            dateStatus.color === 'rose' ? 'bg-rose-50 text-rose-800 border-rose-300 animate-pulse' :
                            dateStatus.color === 'amber' ? 'bg-amber-50 text-amber-800 border-amber-300' :
                            dateStatus.color === 'emerald' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                            'bg-teal-50 text-teal-800 border-teal-200'
                          }`}>
                            {dateStatus.label}
                          </span>
                          {task.overdueAlertSent && (
                            <span 
                              className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-100 text-rose-800 border border-rose-300"
                              title="Automated Email & Push alert was dispatched"
                            >
                              <Mail className="w-2 h-2 text-rose-600" />
                              <span>Sent</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {dateStatus.isOverdue && task.status !== 'completed' && (
                            <button
                              onClick={() => handleSingleTaskOverdueAlert(task)}
                              disabled={isCheckingOverdue}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg border border-rose-200 cursor-pointer disabled:opacity-50"
                              title="Trigger Automated Overdue Email & Push Alert Now"
                            >
                              <Mail className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <a
                            href={`tel:${task.leadPhone}`}
                            className="p-1.5 bg-slate-100 hover:bg-teal-50 text-teal-800 rounded-lg"
                            title="Call Lead"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>

                          {task.status !== 'completed' ? (
                            <button
                              onClick={() => onOpenCompleteModal(task)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                            >
                              Done
                            </button>
                          ) : (
                            <span className="text-[10px] font-bold text-emerald-700">✓ Done</span>
                          )}

                          <button
                            onClick={() => onEditTask(task)}
                            className="p-1 text-slate-400 hover:text-slate-600 rounded"
                            title="Edit"
                          >
                            ✎
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : groupByPriority ? (
        /* GROUPED BY PRIORITY VIEW */
        <div className="space-y-6">
          {[
            { 
              id: 'high', 
              label: 'High Priority Tasks', 
              desc: 'Immediate customer attention, physical site tours & token closures',
              dot: 'bg-rose-500',
              border: 'border-rose-300',
              badge: 'bg-rose-100 text-rose-800 border-rose-200',
              tasks: filteredTasks.filter(t => t.priority === 'high' || t.priority === 'urgent')
            },
            { 
              id: 'medium', 
              label: 'Medium Priority Tasks', 
              desc: 'Active follow-up calls, installment proposals & document reviews',
              dot: 'bg-amber-500',
              border: 'border-amber-300',
              badge: 'bg-amber-100 text-amber-900 border-amber-200',
              tasks: filteredTasks.filter(t => t.priority === 'medium')
            },
            { 
              id: 'low', 
              label: 'Low Priority Tasks', 
              desc: 'Routine outreach, market updates & cold lead check-ins',
              dot: 'bg-emerald-500',
              border: 'border-emerald-300',
              badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
              tasks: filteredTasks.filter(t => t.priority === 'low')
            },
          ].map((group) => (
            <div key={group.id} className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${group.dot}`}></span>
                  <h3 className="font-bold text-slate-900 text-sm">{group.label}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${group.badge}`}>
                    {group.tasks.length}
                  </span>
                </div>
                <span className="text-xs text-slate-500 hidden sm:inline">{group.desc}</span>
              </div>

              {group.tasks.length === 0 ? (
                <div className="p-4 bg-slate-50/60 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-500">
                  No tasks currently categorized in this priority bucket.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {group.tasks.map(renderTaskCard)}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* STANDARD CARDS GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTasks.map(renderTaskCard)}
        </div>
      )}

      {/* Overdue Task Automation Modal */}
      <TaskOverdueAutomationModal
        isOpen={isAutomationModalOpen}
        onClose={() => setIsAutomationModalOpen(false)}
        tasks={tasks}
        onTasksUpdated={(updated) => {
          if (onTasksUpdated) onTasksUpdated(updated);
        }}
        currentUser={currentUser}
        onTriggerToast={(toast) => {
          if (onTriggerToast) onTriggerToast(toast);
        }}
      />

    </div>
  );
};
