import React, { useState } from 'react';
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
  Table as TableIcon
} from 'lucide-react';
import { DealPipelineKanban } from '../../components/common/DealPipelineKanban';

interface LeadItem {
  id: string;
  name: string;
  phone: string;
  propertyInterest: string;
  budgetPKR: number;
  stage: 'new' | 'visit_scheduled' | 'negotiation' | 'won' | 'lost';
  notes: string;
  lastContact: string;
}

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
  const [viewMode, setViewMode] = useState<'kanban' | 'leads'>('kanban');

  const [leads, setLeads] = useState<LeadItem[]>([
    {
      id: 'lead-1',
      name: 'Muhammad Farooq',
      phone: '+92 300 8472910',
      propertyInterest: 'Plot 42-A (5 Marla Executive)',
      budgetPKR: 2600000,
      stage: 'visit_scheduled',
      notes: 'Wants physical site inspection at 4:00 PM today. Prepared to sign token advance if boundary demarcations match.',
      lastContact: 'Today, 10:15 AM'
    },
    {
      id: 'lead-2',
      name: 'Dr. Kamran Akmal',
      phone: '+92 321 4455667',
      propertyInterest: '10 Marla Corner Commercial',
      budgetPKR: 6500000,
      stage: 'negotiation',
      notes: 'Offered PKR 6.2M. Discussing payment milestone split with society director.',
      lastContact: 'Yesterday'
    },
    {
      id: 'lead-3',
      name: 'Chaudhry Waqas',
      phone: '+92 333 9988776',
      propertyInterest: '3 Marla Sector B Villa',
      budgetPKR: 3800000,
      stage: 'won',
      notes: 'Deal closed! Token advance of PKR 100k received, down payment cleared.',
      lastContact: 'Aug 14'
    },
    {
      id: 'lead-4',
      name: 'Sardar Tahir',
      phone: '+92 302 1122334',
      propertyInterest: '7 Marla Shakargarh Road File',
      budgetPKR: 2100000,
      stage: 'new',
      notes: 'Inquired through web marketplace. Looking for 36-month flexible installment plan.',
      lastContact: '2 hours ago'
    }
  ]);

  const [newLeadName, setNewLeadName] = useState('');
  const [newLeadPhone, setNewLeadPhone] = useState('');
  const [newLeadInterest, setNewLeadInterest] = useState('');
  const [newLeadBudget, setNewLeadBudget] = useState(2500000);
  const [showAddForm, setShowAddForm] = useState(false);

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
      notes: 'Created manually by dealer',
      lastContact: 'Just now'
    };

    setLeads([newLead, ...leads]);
    setNewLeadName('');
    setNewLeadPhone('');
    setNewLeadInterest('');
    setShowAddForm(false);
  };

  const moveStage = (leadId: string, newStage: LeadItem['stage']) => {
    setLeads(leads.map(l => l.id === leadId ? { ...l, stage: newStage } : l));
  };

  return (
    <div className="space-y-6">
      
      {/* Tab Controls */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('kanban')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              viewMode === 'kanban'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Kanban className="w-3.5 h-3.5" />
            <span>6-Stage Deal Pipeline (Kanban)</span>
          </button>

          <button
            onClick={() => setViewMode('leads')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              viewMode === 'leads'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Client Inquiries & CRM Leads ({leads.length})</span>
          </button>
        </div>

        {viewMode === 'leads' && (
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Client Lead</span>
          </button>
        )}
      </div>

      {/* Render Active View */}
      {viewMode === 'kanban' ? (
        <DealPipelineKanban
          bookings={bookings}
          currentUser={currentUser}
          onAdvancePipeline={onAdvancePipeline}
          onMoveBackPipeline={onMoveBackPipeline}
          onCancelBooking={onCancelBooking}
          roleAccent="teal"
        />
      ) : (
        <div className="space-y-6">
          {/* Add Lead Modal */}
          {showAddForm && (
            <div className="bg-white p-5 rounded-2xl border border-teal-200 shadow-sm space-y-4 text-xs">
              <h3 className="text-sm font-bold text-slate-900">Add New Client Inquiry / Lead</h3>
              <form onSubmit={handleAddLead} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <input
                  type="text"
                  placeholder="Client Full Name"
                  required
                  value={newLeadName}
                  onChange={(e) => setNewLeadName(e.target.value)}
                  className="p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
                <input
                  type="text"
                  placeholder="Mobile (+92 300 0000000)"
                  value={newLeadPhone}
                  onChange={(e) => setNewLeadPhone(e.target.value)}
                  className="p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
                <input
                  type="text"
                  placeholder="Interested Plot / Society"
                  value={newLeadInterest}
                  onChange={(e) => setNewLeadInterest(e.target.value)}
                  className="p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Budget (PKR)"
                    value={newLeadBudget}
                    onChange={(e) => setNewLeadBudget(Number(e.target.value))}
                    className="p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none flex-1"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Leads Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {leads.map((lead) => (
              <div
                key={lead.id}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3 text-xs"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{lead.name}</h4>
                    <p className="text-slate-500 font-mono text-[11px]">{lead.phone}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    lead.stage === 'won' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                    lead.stage === 'negotiation' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                    'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    {lead.stage.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg space-y-1">
                  <div className="text-slate-600 font-medium">{lead.propertyInterest}</div>
                  <div className="font-mono text-emerald-800 font-bold">
                    Budget: PKR {(lead.budgetPKR / 100000).toFixed(1)} Lakh
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 italic">"{lead.notes}"</p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">Last contact: {lead.lastContact}</span>
                  <div className="flex gap-1">
                    {lead.stage !== 'won' && (
                      <button
                        onClick={() => moveStage(lead.id, 'won')}
                        className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded text-[10px] font-bold border border-emerald-200"
                      >
                        Convert to Deal
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
