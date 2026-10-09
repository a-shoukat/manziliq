import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  Calendar, 
  Phone, 
  Car, 
  DollarSign, 
  ArrowRight,
  TrendingUp,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { DealerTask, LeadStage } from '../../types/crm';

interface DealerTaskCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: DealerTask | null;
  onComplete: (taskId: string, outcome: DealerTask['outcome'], completionNotes: string, newLeadStage?: LeadStage) => void;
  onScheduleNext?: (leadId: string) => void;
}

export const DealerTaskCompletionModal: React.FC<DealerTaskCompletionModalProps> = ({
  isOpen,
  onClose,
  task,
  onComplete,
  onScheduleNext
}) => {
  const [outcome, setOutcome] = useState<DealerTask['outcome']>('deal_advanced');
  const [completionNotes, setCompletionNotes] = useState('');
  const [advanceStage, setAdvanceStage] = useState<LeadStage | 'no_change'>('negotiation');

  if (!isOpen || !task) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(
      task.id, 
      outcome, 
      completionNotes || 'Task completed successfully by dealer.',
      advanceStage === 'no_change' ? undefined : advanceStage
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-950 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Complete Task & Log Outcome</h3>
              <p className="text-[11px] text-emerald-200/80">
                Lead: {task.leadName} • {task.type.replace('_', ' ').toUpperCase()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          
          {/* Task Summary Banner */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
            <div className="font-bold text-slate-800 text-sm">{task.title}</div>
            <div className="text-slate-500 flex items-center gap-2 text-[11px]">
              <span>Lead: {task.leadName} ({task.leadPhone})</span>
              <span>•</span>
              <span>Plot: {task.propertyInterest}</span>
            </div>
          </div>

          {/* Outcome Category */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Interaction Result / Outcome
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { id: 'deal_advanced', label: '🤝 Positive / Deal Advanced', desc: 'Buyer interested, progressing' },
                { id: 'token_received', label: '💰 Token Advance Received', desc: 'Down payment / token paid' },
                { id: 'followup_needed', label: '📞 Further Follow-up Required', desc: 'Buyer asked to call back' },
                { id: 'lost', label: '❌ Lead Not Interested', desc: 'Budget mismatch or drop' }
              ].map(o => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => {
                    setOutcome(o.id as DealerTask['outcome']);
                    if (o.id === 'token_received') setAdvanceStage('won');
                    else if (o.id === 'deal_advanced') setAdvanceStage('negotiation');
                    else if (o.id === 'lost') setAdvanceStage('lost');
                  }}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                    outcome === o.id
                      ? 'bg-emerald-50 text-emerald-950 border-emerald-500 font-bold shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-[11px] font-bold">{o.label}</div>
                  <div className="text-[10px] text-slate-500 font-normal">{o.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Advance Lead Pipeline Stage */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>Update Lead CRM Stage</span>
              <span className="text-[10px] text-slate-500 font-normal">Optional pipeline advancement</span>
            </label>
            <select
              value={advanceStage}
              onChange={(e) => setAdvanceStage(e.target.value as any)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 outline-none focus:border-teal-500"
            >
              <option value="no_change">Do not change stage</option>
              <option value="visit_scheduled">Set to: Visit Scheduled</option>
              <option value="negotiation">Set to: In Negotiation</option>
              <option value="won">Set to: Deal Won / Token Received</option>
              <option value="lost">Set to: Deal Lost</option>
            </select>
          </div>

          {/* Completion Notes */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Call / Visit Resolution Notes
            </label>
            <textarea
              rows={3}
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              placeholder="e.g. Conducted site tour. Client liked the corner orientation and asked for 24-month payment breakdown. Promised token on Friday."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-emerald-500 focus:bg-white transition"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            {onScheduleNext && (
              <button
                type="button"
                onClick={() => {
                  onComplete(task.id, outcome, completionNotes || 'Completed', advanceStage === 'no_change' ? undefined : advanceStage);
                  onClose();
                  onScheduleNext(task.leadId);
                }}
                className="text-teal-700 hover:text-teal-900 font-bold inline-flex items-center gap-1 text-xs cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Save & Schedule Next Task</span>
              </button>
            )}
            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Mark Completed</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
