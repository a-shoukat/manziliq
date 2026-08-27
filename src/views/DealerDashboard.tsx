import React, { useState } from 'react';
import { DealerLead, User } from '../types';
import { Users, Plus, Phone, Mail, Clock, CheckCircle2, ArrowRight, MessageSquare, X } from 'lucide-react';

interface DealerDashboardProps {
  currentUser: User;
  leads: DealerLead[];
  onAddLead: (lead: Omit<DealerLead, 'id'>) => void;
  onUpdateLeadStage: (leadId: string, stage: DealerLead['status']) => void;
}

const STAGES: { id: DealerLead['status']; label: string; color: string }[] = [
  { id: 'inquiry', label: '1. Initial Inquiry', color: 'bg-blue-100 text-blue-900 border-blue-200' },
  { id: 'site_visit', label: '2. Site Visit Scheduled', color: 'bg-indigo-100 text-indigo-900 border-indigo-200' },
  { id: 'token', label: '3. Token Advance', color: 'bg-amber-100 text-amber-900 border-amber-200' },
  { id: 'agreement', label: '4. Agreement Drafted', color: 'bg-teal-100 text-teal-900 border-teal-200' },
  { id: 'payment', label: '5. Down Payment Clearance', color: 'bg-purple-100 text-purple-900 border-purple-200' },
  { id: 'transfer', label: '6. Registry Transfer Closed', color: 'bg-emerald-100 text-emerald-900 border-emerald-200' }
];

export const DealerDashboard: React.FC<DealerDashboardProps> = ({
  currentUser,
  leads,
  onAddLead,
  onUpdateLeadStage
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('+92 300 ');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [propertyInterested, setPropertyInterested] = useState('5 Marla Executive Plot (Al-Rehman)');
  const [budgetPKR, setBudgetPKR] = useState(3000000);
  const [notes, setNotes] = useState('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddLead({
      dealerId: currentUser.id,
      buyerName,
      buyerPhone,
      buyerEmail: buyerEmail || 'lead@gmail.com',
      propertyInterested,
      budgetPKR,
      status: 'inquiry',
      notes: notes || 'New lead recorded from phone call.',
      lastActivity: new Date().toISOString().split('T')[0]
    });
    setShowAddModal(false);
    setBuyerName('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 text-slate-900 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-800 font-bold text-xs px-2.5 py-0.5 rounded border border-emerald-200">
                Dealer & Agent CRM
              </span>
              <span className="text-slate-500 text-xs">{currentUser.name}</span>
            </div>
            <h2 className="text-2xl font-black font-[Outfit] text-slate-900 mt-1">Lead Pipeline Kanban Board</h2>
            <p className="text-xs text-slate-500">Track customer site visits, deal stages, and booking progress for assigned properties.</p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Buyer Lead</span>
          </button>
        </div>

        {/* Pipeline Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-1">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-slate-500 block font-bold text-[10px]">Total Active Leads</span>
            <span className="text-lg font-black text-slate-900 font-[Outfit]">{leads.length} Leads</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-slate-500 block font-bold text-[10px]">Site Visits Scheduled</span>
            <span className="text-lg font-black text-amber-700 font-[Outfit]">
              {leads.filter(l => l.status === 'site_visit').length} Scheduled
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-slate-500 block font-bold text-[10px]">Closed Deals</span>
            <span className="text-lg font-black text-emerald-700 font-[Outfit]">
              {leads.filter(l => l.status === 'closed' || l.status === 'booked').length} Closed
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-slate-500 block font-bold text-[10px]">Total Pipeline Value</span>
            <span className="text-lg font-black text-amber-800 font-[Outfit]">
              PKR {(leads.reduce((sum, l) => sum + l.budgetPKR, 0) / 1000000).toFixed(1)}M
            </span>
          </div>
        </div>
      </div>

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 overflow-x-auto pb-4">
        {STAGES.map(stage => {
          const stageLeads = leads.filter(l => l.status === stage.id);

          return (
            <div key={stage.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex flex-col min-w-[210px]">
              
              <div className={`p-2 rounded-xl border font-extrabold text-xs flex items-center justify-between mb-3 ${stage.color}`}>
                <span>{stage.label}</span>
                <span className="bg-white px-1.5 py-0.2 rounded text-[10px] shadow-xs">
                  {stageLeads.length}
                </span>
              </div>

              {/* Cards inside column */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {stageLeads.map(lead => (
                  <div 
                    key={lead.id}
                    className="bg-white border border-slate-200 rounded-xl p-3 text-slate-900 space-y-2 text-xs shadow-xs hover:border-amber-400 transition-all"
                  >
                    <div className="font-bold text-amber-800 text-sm">{lead.buyerName}</div>

                    <div className="text-slate-600 text-[11px] space-y-0.5">
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{lead.buyerPhone}</span>
                      </div>
                      <div className="font-semibold text-slate-800 truncate">{lead.propertyInterested}</div>
                      <div className="text-emerald-700 font-mono font-bold">
                        Budget: PKR {(lead.budgetPKR / 100000).toFixed(1)} Lakh
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-600 italic bg-slate-50 p-1.5 rounded border border-slate-200">
                      "{lead.notes}"
                    </p>

                    {/* Stage Selector Dropdown */}
                    <div className="pt-1">
                      <select
                        value={lead.status}
                        onChange={e => onUpdateLeadStage(lead.id, e.target.value as any)}
                        className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-[10px] text-slate-900 font-bold focus:outline-none"
                      >
                        {STAGES.map(s => (
                          <option key={s.id} value={s.id}>Move to: {s.label}</option>
                        ))}
                      </select>
                    </div>

                  </div>
                ))}
              </div>

            </div>
          );
        })}
      </div>

      {/* Add Lead Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 text-slate-900 shadow-2xl relative">
            <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-100 p-1 rounded-lg">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold font-[Outfit] text-slate-900 mb-3">Record New Buyer Lead</h3>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Buyer Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Salman"
                  value={buyerName}
                  onChange={e => setBuyerName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  value={buyerPhone}
                  onChange={e => setBuyerPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Property Interested</label>
                <input
                  type="text"
                  required
                  value={propertyInterested}
                  onChange={e => setPropertyInterested(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Budget (PKR)</label>
                <input
                  type="number"
                  required
                  value={budgetPKR}
                  onChange={e => setBudgetPKR(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes / Follow-up Details</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold py-2.5 rounded-xl shadow-md transition-all mt-2"
              >
                Add Lead to CRM Pipeline
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
