import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  Phone, 
  MapPin, 
  AlertCircle, 
  CheckCircle2, 
  User, 
  Briefcase, 
  FileText, 
  Bell, 
  Sparkles,
  Car,
  DollarSign
} from 'lucide-react';
import { DealerTask, LeadItem, TaskType, TaskPriority, TaskReminderTiming } from '../../types/crm';

interface DealerTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Omit<DealerTask, 'id' | 'createdAt'> & { id?: string }) => void;
  leads: LeadItem[];
  initialLeadId?: string;
  initialTask?: DealerTask | null;
  defaultType?: TaskType;
}

const PRESETS = [
  {
    label: '📞 Follow-up Call',
    title: 'Follow-up Call: Budget & Installment Options',
    type: 'call' as TaskType,
    priority: 'medium' as TaskPriority,
    notes: 'Review flexible 36-month installment plan and inquire about down payment availability.'
  },
  {
    label: '🚗 On-Site Plot Tour',
    title: 'Physical Site Visit & Plot Demarcation Inspection',
    type: 'site_visit' as TaskType,
    priority: 'high' as TaskPriority,
    notes: 'Meet at society main gate. Inspect corner plot boundaries, sewerage line, and park-facing view.'
  },
  {
    label: '💰 Token Advance Discussion',
    title: 'Token Advance & Deal Finalization Meeting',
    type: 'token_advance' as TaskType,
    priority: 'high' as TaskPriority,
    notes: 'Client prepared to give token advance of PKR 100,000. Prepare receipt voucher and CNIC copies.'
  },
  {
    label: '📄 NOC & Registry Verification',
    title: 'Verify Society Allotment & Sub-Registrar NOC',
    type: 'document_followup' as TaskType,
    priority: 'medium' as TaskPriority,
    notes: 'Share approved TMA/LDA NOC documentation and computerized Fard extract with buyer.'
  },
  {
    label: '🟢 General Check-in',
    title: 'Routine Inquiry Follow-up & Market Update',
    type: 'call' as TaskType,
    priority: 'low' as TaskPriority,
    notes: 'Check if client has reviewed updated price schedule or has other society preferences.'
  }
];

export const DealerTaskModal: React.FC<DealerTaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  leads,
  initialLeadId,
  initialTask,
  defaultType = 'call'
}) => {
  const [selectedLeadId, setSelectedLeadId] = useState<string>(initialLeadId || (leads[0]?.id ?? ''));
  const [title, setTitle] = useState('');
  const [type, setType] = useState<TaskType>(defaultType);
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('15:00');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [reminderTiming, setReminderTiming] = useState<TaskReminderTiming>('15_min_before');
  const [advanceLeadStage, setAdvanceLeadStage] = useState(true);

  // Initialize today's date in YYYY-MM-DD
  useEffect(() => {
    if (initialTask) {
      setSelectedLeadId(initialTask.leadId);
      setTitle(initialTask.title);
      setType(initialTask.type);
      setDueDate(initialTask.dueDate);
      setDueTime(initialTask.dueTime);
      setPriority(initialTask.priority);
      setLocation(initialTask.location || '');
      setNotes(initialTask.notes || '');
      setReminderTiming(initialTask.reminderTiming);
    } else {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      setDueDate(`${yyyy}-${mm}-${dd}`);
      
      if (initialLeadId) {
        setSelectedLeadId(initialLeadId);
        const lead = leads.find(l => l.id === initialLeadId);
        if (lead) {
          setLocation(defaultType === 'site_visit' ? `${lead.propertyInterest} Site` : lead.phone);
          setTitle(defaultType === 'site_visit' ? `Site Visit with ${lead.name}` : `Follow-up Call with ${lead.name}`);
        }
      } else {
        setTitle('Lead Follow-up Call');
        setLocation('Direct Phone Call');
      }
      setType(defaultType);
    }
  }, [initialTask, initialLeadId, defaultType, isOpen, leads]);

  if (!isOpen) return null;

  const currentLead = leads.find(l => l.id === selectedLeadId);

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setTitle(currentLead ? `${preset.title} - ${currentLead.name}` : preset.title);
    setType(preset.type);
    setPriority(preset.priority);
    setNotes(preset.notes);
    if (preset.type === 'site_visit') {
      setLocation(currentLead ? `${currentLead.propertyInterest} (Main Gate Entrance)` : 'Society Site Office');
    } else if (preset.type === 'call') {
      setLocation(currentLead ? currentLead.phone : 'Phone Call');
    }
  };

  const handleQuickSchedule = (daysFromNow: number, timeStr: string) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    setDueDate(`${yyyy}-${mm}-${dd}`);
    setDueTime(timeStr);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadId || !title.trim() || !dueDate) return;

    const lead = leads.find(l => l.id === selectedLeadId);

    onSave({
      ...(initialTask ? { id: initialTask.id } : {}),
      leadId: selectedLeadId,
      leadName: lead?.name || 'Valued Lead',
      leadPhone: lead?.phone || '',
      propertyInterest: lead?.propertyInterest || 'Residential Plot',
      title: title.trim(),
      type,
      dueDate,
      dueTime,
      priority,
      status: initialTask?.status || 'pending',
      location: location.trim() || (type === 'call' ? lead?.phone : 'Society Office'),
      notes: notes.trim(),
      reminderTiming,
      alertSent: false,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-800 to-slate-900 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300">
              {type === 'site_visit' ? <Car className="w-5 h-5" /> :
               type === 'call' ? <Phone className="w-5 h-5" /> :
               type === 'token_advance' ? <DollarSign className="w-5 h-5" /> :
               <Calendar className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-lg font-bold">
                {initialTask ? 'Edit Scheduled Task' : 'Schedule Follow-up or Site Visit'}
              </h3>
              <p className="text-xs text-teal-200/80">
                Dealer Lead CRM • Automated Follow-up & Due Notifications
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Presets Bar */}
        <div className="bg-teal-50/60 border-b border-teal-100 px-6 py-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
            <span className="text-[11px] font-bold text-teal-900 flex items-center gap-1 shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              Presets:
            </span>
            {PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(p)}
                className="px-2.5 py-1 bg-white hover:bg-teal-100/60 text-slate-700 hover:text-teal-900 border border-teal-200/80 rounded-lg text-[11px] font-semibold transition shrink-0 cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Target Lead Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>Select Client Lead <span className="text-rose-500">*</span></span>
              {currentLead && (
                <span className="text-[11px] text-teal-700 font-normal">
                  Budget: PKR {(currentLead.budgetPKR / 100000).toFixed(1)} Lakh • {currentLead.propertyInterest}
                </span>
              )}
            </label>
            <select
              value={selectedLeadId}
              onChange={(e) => {
                const newId = e.target.value;
                setSelectedLeadId(newId);
                const lead = leads.find(l => l.id === newId);
                if (lead && !title) {
                  setTitle(`Follow-up with ${lead.name}`);
                }
              }}
              required
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 outline-none focus:border-teal-500 focus:bg-white transition"
            >
              {leads.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} — {l.phone} ({l.propertyInterest})
                </option>
              ))}
            </select>
          </div>

          {/* Task Type Grid */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Task Category <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
              {[
                { id: 'call', label: 'Phone Call', icon: Phone, color: 'hover:border-teal-400 hover:bg-teal-50/50' },
                { id: 'site_visit', label: 'Site Visit', icon: Car, color: 'hover:border-blue-400 hover:bg-blue-50/50' },
                { id: 'meeting', label: 'Meeting', icon: Briefcase, color: 'hover:border-indigo-400 hover:bg-indigo-50/50' },
                { id: 'token_advance', label: 'Token Advance', icon: DollarSign, color: 'hover:border-emerald-400 hover:bg-emerald-50/50' },
                { id: 'document_followup', label: 'Documents', icon: FileText, color: 'hover:border-amber-400 hover:bg-amber-50/50' },
              ].map(t => {
                const Icon = t.icon;
                const active = type === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setType(t.id as TaskType);
                      if (t.id === 'site_visit' && currentLead) {
                        setLocation(`${currentLead.propertyInterest} Site`);
                      }
                    }}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition text-center cursor-pointer ${
                      active 
                        ? 'bg-teal-600 text-white border-teal-600 shadow-xs font-bold' 
                        : `bg-slate-50 text-slate-700 border-slate-200 font-medium ${t.color}`
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[11px] leading-tight">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Task Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Task Title / Purpose <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Physical Plot Boundary Inspection with Buyer"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-teal-500 focus:bg-white transition font-medium"
            />
          </div>

          {/* Date & Time Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Due Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Due Date <span className="text-rose-500">*</span></span>
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-teal-500 focus:bg-white transition font-medium"
              />
              <div className="flex gap-1 mt-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickSchedule(0, '15:00')}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-teal-100 text-slate-600 hover:text-teal-900 rounded text-[10px] font-semibold cursor-pointer"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSchedule(1, '11:00')}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-teal-100 text-slate-600 hover:text-teal-900 rounded text-[10px] font-semibold cursor-pointer"
                >
                  Tomorrow
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSchedule(2, '16:00')}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-teal-100 text-slate-600 hover:text-teal-900 rounded text-[10px] font-semibold cursor-pointer"
                >
                  In 2 Days
                </button>
              </div>
            </div>

            {/* Due Time */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Due Time <span className="text-rose-500">*</span></span>
              </label>
              <input
                type="time"
                required
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-teal-500 focus:bg-white transition font-medium"
              />
              <div className="flex gap-1 mt-1.5">
                <button
                  type="button"
                  onClick={() => setDueTime('11:00')}
                  className="px-1.5 py-0.5 bg-slate-100 hover:bg-teal-100 text-slate-600 rounded text-[10px] cursor-pointer"
                >
                  11 AM
                </button>
                <button
                  type="button"
                  onClick={() => setDueTime('15:00')}
                  className="px-1.5 py-0.5 bg-slate-100 hover:bg-teal-100 text-slate-600 rounded text-[10px] cursor-pointer"
                >
                  3 PM
                </button>
                <button
                  type="button"
                  onClick={() => setDueTime('17:00')}
                  className="px-1.5 py-0.5 bg-slate-100 hover:bg-teal-100 text-slate-600 rounded text-[10px] cursor-pointer"
                >
                  5 PM
                </button>
              </div>
            </div>

          </div>

          {/* Priority Level Selection (Low, Medium, High) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
                <span>Priority Level <span className="text-rose-500">*</span></span>
              </label>
              <span className="text-[11px] text-slate-500">Determines color-coding across task lists</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              {[
                { 
                  id: 'low' as TaskPriority, 
                  label: 'Low', 
                  desc: 'Routine follow-up / general query',
                  dot: 'bg-emerald-500',
                  activeBorder: 'border-emerald-500 bg-emerald-50/70 text-emerald-950 ring-2 ring-emerald-400',
                  idleBorder: 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-emerald-50/30 hover:border-emerald-300'
                },
                { 
                  id: 'medium' as TaskPriority, 
                  label: 'Medium', 
                  desc: 'Active negotiation / payment terms',
                  dot: 'bg-amber-500',
                  activeBorder: 'border-amber-500 bg-amber-50/70 text-amber-950 ring-2 ring-amber-400',
                  idleBorder: 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-amber-50/30 hover:border-amber-300'
                },
                { 
                  id: 'high' as TaskPriority, 
                  label: 'High', 
                  desc: 'Serious buyer / site tour / token',
                  dot: 'bg-rose-500',
                  activeBorder: 'border-rose-500 bg-rose-50/70 text-rose-950 ring-2 ring-rose-400',
                  idleBorder: 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-rose-50/30 hover:border-rose-300'
                },
              ].map(p => {
                const isSelected = priority === p.id || (p.id === 'high' && priority === 'urgent');
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPriority(p.id)}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      isSelected ? p.activeBorder : p.idleBorder
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs flex items-center gap-1.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${p.dot}`}></span>
                        {p.label}
                      </span>
                      {isSelected && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 leading-tight mt-1">
                      {p.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Location & Reminder Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>Meeting Point / Channel</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={type === 'site_visit' ? 'e.g. Gate 1, Al-Rehman Garden Phase 7' : 'e.g. WhatsApp / Phone (+92 300 ...)'}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-teal-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <Bell className="w-3.5 h-3.5 text-slate-500" />
                <span>Due Alert Notification Setting</span>
              </label>
              <select
                value={reminderTiming}
                onChange={(e) => setReminderTiming(e.target.value as TaskReminderTiming)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 outline-none focus:border-teal-500 focus:bg-white transition"
              >
                <option value="due_time">🔔 Notify at exact due time</option>
                <option value="15_min_before">⏰ Notify 15 minutes before</option>
                <option value="1_hour_before">⏳ Notify 1 hour before</option>
                <option value="1_day_before">📅 Notify 1 day before</option>
              </select>
            </div>

          </div>

          {/* Notes & Agenda */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Agenda & Dealer Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Bring society masterplan brochure and prepare breakdown of 36-month quarterly installment schedule..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-teal-500 focus:bg-white transition"
            />
          </div>

          {/* Auto-advance lead stage option */}
          {type === 'site_visit' && currentLead && currentLead.stage === 'new' && (
            <div className="p-3 bg-teal-50/80 rounded-xl border border-teal-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span className="text-teal-900 font-medium">
                  Automatically advance lead stage from <strong>NEW</strong> to <strong>VISIT SCHEDULED</strong>?
                </span>
              </div>
              <input
                type="checkbox"
                checked={advanceLeadStage}
                onChange={(e) => setAdvanceLeadStage(e.target.checked)}
                className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
              />
            </div>
          )}

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{initialTask ? 'Save Changes' : 'Schedule Task'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
