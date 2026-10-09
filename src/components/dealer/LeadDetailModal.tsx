import React from 'react';
import { 
  X, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Plus, 
  MessageSquare, 
  Car, 
  DollarSign, 
  ArrowRight,
  TrendingUp,
  FileText
} from 'lucide-react';
import { LeadItem, DealerTask, LeadStage, TaskType } from '../../types/crm';

interface LeadDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: LeadItem | null;
  tasks: DealerTask[];
  onOpenScheduleModal: (leadId: string, type?: TaskType) => void;
  onAdvanceStage: (leadId: string, newStage: LeadStage) => void;
  onOpenCompleteModal: (task: DealerTask) => void;
}

export const LeadDetailModal: React.FC<LeadDetailModalProps> = ({
  isOpen,
  onClose,
  lead,
  tasks,
  onOpenScheduleModal,
  onAdvanceStage,
  onOpenCompleteModal
}) => {
  if (!isOpen || !lead) return null;

  const leadTasks = tasks.filter(t => t.leadId === lead.id);
  const pendingTasks = leadTasks.filter(t => t.status === 'pending');
  const completedTasks = leadTasks.filter(t => t.status === 'completed');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300 font-bold text-lg">
              {lead.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">{lead.name}</h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  lead.stage === 'won' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' :
                  lead.stage === 'negotiation' ? 'bg-amber-500/20 text-amber-300 border-amber-400/30' :
                  lead.stage === 'visit_scheduled' ? 'bg-blue-500/20 text-blue-300 border-blue-400/30' :
                  'bg-white/10 text-slate-200 border-white/20'
                }`}>
                  {lead.stage.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-teal-200/80 font-mono">
                {lead.phone} {lead.city ? `• ${lead.city}` : ''}
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

        {/* Content */}
        <div className="p-6 space-y-6 text-xs max-h-[75vh] overflow-y-auto">
          
          {/* Top Quick Actions Bar */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <a
                href={`tel:${lead.phone}`}
                className="px-3 py-1.5 bg-white hover:bg-teal-50 text-teal-800 border border-slate-200 hover:border-teal-300 rounded-xl font-bold transition inline-flex items-center gap-1.5 shadow-2xs"
              >
                <Phone className="w-3.5 h-3.5 text-teal-600" />
                <span>Call Client</span>
              </a>

              <a
                href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Assalam-o-Alaikum ${lead.name}, regarding your interest in ${lead.propertyInterest} on MANZILIQ.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-white hover:bg-emerald-50 text-emerald-800 border border-slate-200 hover:border-emerald-300 rounded-xl font-bold transition inline-flex items-center gap-1.5 shadow-2xs"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp</span>
              </a>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenScheduleModal(lead.id, 'site_visit')}
                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-xl font-bold transition inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Car className="w-3.5 h-3.5 text-blue-600" />
                <span>Schedule Visit</span>
              </button>

              <button
                onClick={() => onOpenScheduleModal(lead.id, 'call')}
                className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold transition shadow-xs inline-flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Schedule Follow-up</span>
              </button>
            </div>
          </div>

          {/* Lead Summary Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 font-semibold uppercase">Interested Property</span>
              <div className="text-sm font-bold text-slate-900 mt-0.5">{lead.propertyInterest}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 font-semibold uppercase">Estimated Budget</span>
              <div className="text-sm font-bold text-emerald-700 mt-0.5">
                PKR {(lead.budgetPKR / 100000).toFixed(1)} Lakh (PKR {lead.budgetPKR.toLocaleString()})
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 font-semibold uppercase">Last Contact Date</span>
              <div className="text-sm font-bold text-slate-700 mt-0.5">{lead.lastContact}</div>
            </div>
          </div>

          {/* Pipeline Stage Movement */}
          <div className="p-4 bg-teal-50/50 rounded-2xl border border-teal-200/80 space-y-2">
            <label className="block font-bold text-teal-950 text-xs">
              Move Deal Stage
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
              {[
                { id: 'new', label: '1. New Inquiry' },
                { id: 'visit_scheduled', label: '2. Visit Booked' },
                { id: 'negotiation', label: '3. Negotiation' },
                { id: 'won', label: '4. Deal Won 🎉' },
                { id: 'lost', label: '5. Lost' },
              ].map(stage => (
                <button
                  key={stage.id}
                  onClick={() => onAdvanceStage(lead.id, stage.id as LeadStage)}
                  className={`p-2 rounded-xl text-center font-bold text-[11px] transition cursor-pointer border ${
                    lead.stage === stage.id
                      ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-teal-100/50'
                  }`}
                >
                  {stage.label}
                </button>
              ))}
            </div>
          </div>

          {/* Lead Notes */}
          <div className="space-y-1">
            <h4 className="font-bold text-slate-800 text-xs">Lead Background & Notes</h4>
            <p className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 italic">
              "{lead.notes}"
            </p>
          </div>

          {/* Scheduled & Completed Follow-ups Timeline */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-teal-600" />
                <span>Scheduled Follow-ups & Visits ({leadTasks.length})</span>
              </h4>
              <button
                onClick={() => onOpenScheduleModal(lead.id)}
                className="text-xs text-teal-700 hover:text-teal-900 font-bold inline-flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Task</span>
              </button>
            </div>

            {leadTasks.length === 0 ? (
              <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center space-y-2">
                <p className="text-slate-500">No scheduled tasks or site visits for this lead yet.</p>
                <button
                  onClick={() => onOpenScheduleModal(lead.id, 'call')}
                  className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold transition shadow-2xs"
                >
                  Schedule Initial Follow-up Call
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {leadTasks.map((t) => {
                  const isHigh = t.priority === 'high' || t.priority === 'urgent';
                  const isMedium = t.priority === 'medium';
                  const priorityClass = isHigh
                    ? 'border-l-4 border-l-rose-500 bg-rose-50/20'
                    : isMedium
                    ? 'border-l-4 border-l-amber-500 bg-amber-50/20'
                    : 'border-l-4 border-l-emerald-500 bg-emerald-50/20';

                  const badgeClass = isHigh
                    ? 'bg-rose-100 text-rose-800 border-rose-200'
                    : isMedium
                    ? 'bg-amber-100 text-amber-900 border-amber-200'
                    : 'bg-emerald-100 text-emerald-800 border-emerald-200';

                  return (
                    <div
                      key={t.id}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                        t.status === 'completed' 
                          ? 'bg-slate-50/60 border-slate-200 opacity-75' 
                          : `bg-white border-slate-200 shadow-2xs ${priorityClass}`
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                          t.type === 'site_visit' ? 'bg-blue-50 border-blue-200 text-blue-600' :
                          t.type === 'call' ? 'bg-teal-50 border-teal-200 text-teal-600' :
                          'bg-slate-50 border-slate-200 text-slate-600'
                        }`}>
                          {t.type === 'site_visit' ? <Car className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{t.title}</span>
                            <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold border ${badgeClass}`}>
                              {isHigh ? '🔴 High' : isMedium ? '🟡 Medium' : '🟢 Low'}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                            <span>📅 {t.dueDate} at {t.dueTime}</span>
                            <span>•</span>
                            <span>📍 {t.location || 'Direct Call'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {t.status === 'pending' ? (
                          <button
                            onClick={() => onOpenCompleteModal(t)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                          >
                            Mark Done
                          </button>
                        ) : (
                          <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Completed</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
