import React, { useState, useMemo } from 'react';
import { 
  Plot, 
  Society, 
  User, 
  LotAssignment, 
  DealerSocietyRelation, 
  DealerLotRequest, 
  LotAuditTrailEntry 
} from '../../types';
import { 
  Users, 
  ShieldCheck, 
  Search, 
  Building2, 
  Layers, 
  CheckCircle2, 
  UserPlus, 
  AlertCircle,
  Award,
  Calendar,
  Clock,
  Check,
  X,
  Plus,
  ArrowRight,
  FileText,
  AlertTriangle,
  RotateCcw,
  Percent,
  Phone,
  Mail,
  CreditCard,
  Shield,
  FileSpreadsheet,
  ChevronRight,
  CheckCircle,
  XCircle,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

interface SocietyDealerAssignmentViewProps {
  society: Society;
  plots: Plot[];
  dealerRelations?: DealerSocietyRelation[];
  lotAssignments?: LotAssignment[];
  dealerLotRequests?: DealerLotRequest[];
  lotAuditTrail?: LotAuditTrailEntry[];
  onAssignDealer?: (plotId: string, dealerId: string, dealerName: string) => void;
  onCreateLotAssignment?: (lot: LotAssignment, affectedPlots: Plot[]) => void;
  onUpdateLotAssignment?: (updatedLot: LotAssignment) => void;
  onRevokeLotAssignment?: (lotId: string) => void;
  onReviewDealerRelation?: (relationId: string, status: 'approved' | 'rejected', commissionPercent?: number, reason?: string) => void;
  onReviewLotRequest?: (requestId: string, status: 'approved' | 'rejected', note?: string) => void;
}

export const SocietyDealerAssignmentView: React.FC<SocietyDealerAssignmentViewProps> = ({
  society,
  plots,
  dealerRelations = [],
  lotAssignments = [],
  dealerLotRequests = [],
  lotAuditTrail = [],
  onAssignDealer,
  onCreateLotAssignment,
  onUpdateLotAssignment,
  onRevokeLotAssignment,
  onReviewDealerRelation,
  onReviewLotRequest
}) => {
  const [activeTab, setActiveTab] = useState<'lots' | 'dealers' | 'requests' | 'audit'>('lots');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Lot creation wizard modal
  const [showCreateLotModal, setShowCreateLotModal] = useState(false);
  const [selectedBlockForLot, setSelectedBlockForLot] = useState<string>('Executive Block');
  const [selectedDealerId, setSelectedDealerId] = useState<string>('');
  const [selectedPlotIdsForLot, setSelectedPlotIdsForLot] = useState<string[]>([]);
  const [lotDurationDays, setLotDurationDays] = useState<number>(90);
  const [customLotNumber, setCustomLotNumber] = useState<string>('');
  const [lotCommission, setLotCommission] = useState<number>(2.0);
  const [lotRenewalTerms, setLotRenewalTerms] = useState<string>('Quarterly review with minimum 35% conversion threshold.');
  const [lotNotes, setLotNotes] = useState<string>('');
  const [lotModalError, setLotModalError] = useState<string | null>(null);

  // Dealer join request modal
  const [reviewingRelation, setReviewingRelation] = useState<DealerSocietyRelation | null>(null);
  const [configuredCommission, setConfiguredCommission] = useState<number>(2.0);
  const [rejectionReason, setRejectionReason] = useState<string>('');

  // Dealer lot request modal
  const [reviewingLotRequest, setReviewingLotRequest] = useState<DealerLotRequest | null>(null);
  const [lotRequestNote, setLotRequestNote] = useState<string>('');

  // Toast
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 5000);
  };

  // Society Specific Data
  const societyPlots = useMemo(() => plots.filter(p => p.societyId === society.id), [plots, society.id]);
  
  const societyRelations = useMemo(() => {
    return dealerRelations.filter(r => r.societyId === society.id);
  }, [dealerRelations, society.id]);

  const approvedDealers = useMemo(() => {
    return societyRelations.filter(r => r.status === 'approved');
  }, [societyRelations]);

  const pendingDealerRequests = useMemo(() => {
    return societyRelations.filter(r => r.status === 'pending');
  }, [societyRelations]);

  const societyLots = useMemo(() => {
    return lotAssignments.filter(l => l.societyId === society.id);
  }, [lotAssignments, society.id]);

  const societyRequests = useMemo(() => {
    return dealerLotRequests.filter(r => r.societyId === society.id);
  }, [dealerLotRequests, society.id]);

  const societyAuditTrail = useMemo(() => {
    return lotAuditTrail.filter(a => a.societyId === society.id);
  }, [lotAuditTrail, society.id]);

  // Plots available for new lot creation (enforce single-broker rule: plot must be Available with no current dealer)
  const availablePlotsInSelectedBlock = useMemo(() => {
    return societyPlots.filter(p => {
      const matchBlock = selectedBlockForLot === 'all' || p.block === selectedBlockForLot;
      // Single Broker Rule: Must be Available and unassigned
      const isUnassigned = (p.status === 'available' || !p.status) && (!p.dealerId || p.dealerId === '');
      return matchBlock && isUnassigned;
    });
  }, [societyPlots, selectedBlockForLot]);

  // Handle Toggle Plot in Lot Selection
  const togglePlotInLot = (plotId: string) => {
    if (selectedPlotIdsForLot.includes(plotId)) {
      setSelectedPlotIdsForLot(selectedPlotIdsForLot.filter(id => id !== plotId));
    } else {
      setSelectedPlotIdsForLot([...selectedPlotIdsForLot, plotId]);
    }
  };

  // Initialize auto lot number when opening modal
  const openCreateLotModal = () => {
    const blockCode = (selectedBlockForLot || 'EXEC').substring(0, 4).toUpperCase().replace(/[^A-Z]/g, '');
    const rand = Math.floor(Math.random() * 90) + 10;
    setCustomLotNumber(`LOT-${society.name.substring(0, 3).toUpperCase()}-${blockCode}-${rand}`);
    if (approvedDealers.length > 0 && !selectedDealerId) {
      setSelectedDealerId(approvedDealers[0].dealerId);
      setLotCommission(approvedDealers[0].commissionPercent || 2.0);
    }
    setSelectedPlotIdsForLot([]);
    setLotModalError(null);
    setShowCreateLotModal(true);
  };

  // Handle Submit Create Lot Assignment
  const handleCreateLotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLotModalError(null);

    if (!selectedDealerId) {
      setLotModalError('Please select an authorized approved dealer.');
      return;
    }

    if (selectedPlotIdsForLot.length === 0) {
      setLotModalError('Please select at least 1 available plot to include in this lot allocation.');
      return;
    }

    const dealerObj = approvedDealers.find(d => d.dealerId === selectedDealerId);
    if (!dealerObj) {
      setLotModalError('Selected dealer record not found.');
      return;
    }

    // Double Check Single-Broker Rule: Ensure none of the chosen plots already have a dealer
    const conflictingPlots = societyPlots.filter(
      p => selectedPlotIdsForLot.includes(p.id) && p.dealerId && p.dealerId !== ''
    );

    if (conflictingPlots.length > 0) {
      setLotModalError(`Single Broker Conflict: Plot(s) ${conflictingPlots.map(p => p.plotNumber).join(', ')} already assigned to another broker!`);
      return;
    }

    const assignedPlots = societyPlots.filter(p => selectedPlotIdsForLot.includes(p.id));
    const plotNumbers = assignedPlots.map(p => p.plotNumber);

    const now = new Date();
    const expiryDate = new Date();
    expiryDate.setDate(now.getDate() + Number(lotDurationDays));

    const newLot: LotAssignment = {
      id: `lot-asg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      lotNumber: customLotNumber.trim() || `LOT-${Date.now().toString().slice(-4)}`,
      societyId: society.id,
      societyName: society.name,
      block: selectedBlockForLot,
      dealerId: dealerObj.dealerId,
      dealerName: dealerObj.dealerName,
      dealerLicense: dealerObj.dealerLicense,
      dealerCnic: dealerObj.dealerCnic,
      dealerPhone: dealerObj.dealerPhone,
      plotIds: selectedPlotIdsForLot,
      plotNumbers: plotNumbers,
      assignedDate: now.toISOString().split('T')[0],
      expiryDate: expiryDate.toISOString().split('T')[0],
      status: 'active',
      commissionPercent: Number(lotCommission),
      assignedBy: `${society.name} Management`,
      renewalTerms: lotRenewalTerms,
      notes: lotNotes || `Exclusive broker quota for ${selectedBlockForLot}.`
    };

    if (onCreateLotAssignment) {
      onCreateLotAssignment(newLot, assignedPlots);
    } else if (onAssignDealer) {
      assignedPlots.forEach(p => onAssignDealer(p.id, dealerObj.dealerId, dealerObj.dealerName));
    }

    setShowCreateLotModal(false);
    showToast(`Lot ${newLot.lotNumber} (${assignedPlots.length} plots) successfully assigned to ${dealerObj.dealerName}!`);
  };

  // Handle Revoke / Release Lot
  const handleRevokeLot = (lot: LotAssignment) => {
    if (confirm(`Are you sure you want to release Lot #${lot.lotNumber}? Unsold plots will return to ${society.name}'s open inventory pool.`)) {
      if (onRevokeLotAssignment) {
        onRevokeLotAssignment(lot.id);
      }
      showToast(`Lot #${lot.lotNumber} has been revoked and plots released back to available status.`);
    }
  };

  // Handle Approve / Reject Dealer Relation
  const handleReviewRelationSubmit = (action: 'approved' | 'rejected') => {
    if (!reviewingRelation || !onReviewDealerRelation) return;
    onReviewDealerRelation(
      reviewingRelation.id, 
      action, 
      action === 'approved' ? configuredCommission : undefined, 
      action === 'rejected' ? rejectionReason : undefined
    );
    setReviewingRelation(null);
    showToast(`Dealer registration for ${reviewingRelation.dealerName} was ${action}.`);
  };

  // Handle Approve / Reject Dealer Lot Request
  const handleReviewLotRequestSubmit = (action: 'approved' | 'rejected') => {
    if (!reviewingLotRequest || !onReviewLotRequest) return;
    onReviewLotRequest(reviewingLotRequest.id, action, lotRequestNote);
    setReviewingLotRequest(null);
    showToast(`Lot request #${reviewingLotRequest.id} has been ${action}.`);
  };

  return (
    <div className="space-y-8">
      
      {/* Toast */}
      {toastMessage && (
        <div className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-bold shadow-md transition-all ${
          toastMessage.type === 'success' ? 'bg-emerald-50 border-emerald-300 text-emerald-950' : 'bg-rose-50 border-rose-300 text-rose-950'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage.text}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" />
            <span>{society.name} • Module 4 Dealer Suite</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users className="w-7 h-7 text-emerald-800" />
            <span>Dealer Management & Lot Assignment System</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Enforce anti-poaching single-broker exclusivity, allocate batch plot lots with auto-expiry terms, and inspect immutable audit trails.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={openCreateLotModal}
            disabled={approvedDealers.length === 0}
            className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create & Assign Plot Lot</span>
          </button>
        </div>
      </div>

      {/* Top Stat Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Authorized Dealers</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{approvedDealers.length} Registered</div>
          <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">{pendingDealerRequests.length} pending approval</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Assigned Lots</div>
          <div className="text-2xl font-black text-teal-900 mt-1">{societyLots.filter(l => l.status === 'active').length} Lots</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Under broker contracts</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Plots in Broker Custody</div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {societyPlots.filter(p => p.dealerId && p.dealerId !== '').length} Plots
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Enforced 1-to-1 broker binding</div>
        </div>

        <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200 shadow-xs">
          <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Pending Lot Requests</div>
          <div className="text-2xl font-black text-amber-900 mt-1">
            {societyRequests.filter(r => r.status === 'pending').length} Requests
          </div>
          <div className="text-[10px] text-amber-700 mt-0.5">Expansion & release queue</div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 space-x-1 sm:space-x-4 text-xs font-bold">
        <button
          onClick={() => setActiveTab('lots')}
          className={`pb-3 px-3 border-b-2 transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'lots'
              ? 'border-emerald-800 text-emerald-950'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4 text-emerald-700" />
          <span>Active Assigned Lots ({societyLots.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('dealers')}
          className={`pb-3 px-3 border-b-2 transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'dealers'
              ? 'border-emerald-800 text-emerald-950'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4 text-emerald-700" />
          <span>Dealer Roster & Join Requests ({societyRelations.length})</span>
          {pendingDealerRequests.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          className={`pb-3 px-3 border-b-2 transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'requests'
              ? 'border-emerald-800 text-emerald-950'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4 text-emerald-700" />
          <span>Dealer Lot Requests ({societyRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 px-3 border-b-2 transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'audit'
              ? 'border-emerald-800 text-emerald-950'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>Immutable Lot Audit Trail ({societyAuditTrail.length})</span>
        </button>
      </div>

      {/* TAB 1: ACTIVE ASSIGNED LOTS */}
      {activeTab === 'lots' && (
        <div className="space-y-4">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="text-xs text-slate-600">
              Allocated plot lots enforce <strong>exclusive selling rights</strong>. A plot cannot be co-assigned to multiple real estate agencies.
            </div>

            <button
              onClick={openCreateLotModal}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Lot</span>
            </button>
          </div>

          {societyLots.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 text-slate-400 space-y-3">
              <Layers className="w-12 h-12 mx-auto text-slate-300" />
              <p className="text-sm font-bold text-slate-600">No active plot lots allocated yet</p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Click "+ Create & Assign Plot Lot" to bundle available plots and grant exclusive marketing quota to an authorized dealer.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {societyLots.map(lot => {
                const isExpiring = lot.status === 'expiring';
                const isExpired = lot.status === 'expired';

                return (
                  <div key={lot.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4 hover:shadow-md transition">
                    
                    {/* Header */}
                    <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-slate-900 text-sm">{lot.lotNumber}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            lot.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                            lot.status === 'expiring' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {lot.status}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 font-medium mt-0.5">
                          {lot.block || 'Executive Block'} • {lot.societyName}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-extrabold text-emerald-950">{lot.commissionPercent}% Commission</div>
                        <div className="text-[10px] text-slate-400">Assigned {lot.assignedDate}</div>
                      </div>
                    </div>

                    {/* Dealer Details */}
                    <div className="p-3 bg-slate-50 rounded-2xl text-xs space-y-1.5 border border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Assigned Agency:</span>
                        <strong className="text-slate-900 font-bold">{lot.dealerName}</strong>
                      </div>
                      {lot.dealerLicense && (
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500">Excise Reg License:</span>
                          <span className="font-mono text-slate-700 font-semibold">{lot.dealerLicense}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Contract Expiry:</span>
                        <span className={`font-bold ${isExpiring ? 'text-amber-800' : 'text-slate-800'}`}>
                          {lot.expiryDate}
                        </span>
                      </div>
                    </div>

                    {/* Allocated Plots List */}
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                        <span>Assigned Plot Numbers ({lot.plotNumbers.length})</span>
                        <span className="text-slate-400 font-normal">Strict 1-Broker Binding</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {lot.plotNumbers.map((num, i) => (
                          <span key={i} className="px-2.5 py-1 bg-emerald-50 text-emerald-950 border border-emerald-200 rounded-lg text-xs font-mono font-bold">
                            {num}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Renewal / Notes */}
                    {lot.renewalTerms && (
                      <div className="text-[11px] text-slate-500 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                        <strong className="text-slate-700">Terms:</strong> {lot.renewalTerms}
                      </div>
                    )}

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <div className="text-[11px] text-slate-400">
                        Assigned by {lot.assignedBy}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRevokeLot(lot)}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition cursor-pointer"
                        >
                          Revoke / Release Lot
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* TAB 2: DEALER ROSTER & JOIN REQUESTS */}
      {activeTab === 'dealers' && (
        <div className="space-y-6">
          
          {/* Pending Requests Banner */}
          {pendingDealerRequests.length > 0 && (
            <div className="bg-amber-50 p-5 rounded-3xl border border-amber-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-xs text-amber-950">
                  <AlertTriangle className="w-4 h-4 text-amber-700" />
                  <span>{pendingDealerRequests.length} Pending Dealer Registration Request(s)</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {pendingDealerRequests.map(req => (
                  <div key={req.id} className="bg-white p-4 rounded-2xl border border-amber-200 shadow-2xs space-y-3">
                    <div>
                      <div className="font-black text-slate-900 text-sm">{req.dealerName}</div>
                      <div className="text-xs text-slate-500 mt-0.5">CNIC: {req.dealerCnic} • Reg: {req.dealerLicense}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{req.dealerPhone} • {req.dealerEmail}</div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <span className="text-[11px] text-slate-500">Applied on {req.appliedAt}</span>
                      <button
                        onClick={() => {
                          setReviewingRelation(req);
                          setConfiguredCommission(req.commissionPercent || 2.0);
                        }}
                        className="px-4 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                      >
                        Review & Approve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Approved Authorized Dealers Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-black text-sm text-slate-900">Authorized Real Estate Agencies</h3>
                <p className="text-xs text-slate-500">Dealers registered and certified to represent {society.name}</p>
              </div>
              <div className="text-xs font-bold text-slate-500">
                {approvedDealers.length} Active Partners
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-4">Agency Name & Principal</th>
                    <th className="p-4">CNIC & License</th>
                    <th className="p-4">Contact Info</th>
                    <th className="p-4">Approved Commission</th>
                    <th className="p-4">Active Lots</th>
                    <th className="p-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {approvedDealers.map(dealer => {
                    const assignedLotsCount = societyLots.filter(l => l.dealerId === dealer.dealerId && l.status === 'active').length;

                    return (
                      <tr key={dealer.id} className="hover:bg-slate-50 transition">
                        <td className="p-4">
                          <div className="font-bold text-slate-900 text-sm">{dealer.dealerName}</div>
                          <div className="text-[11px] text-emerald-800 font-semibold">Authorized Partner</div>
                        </td>

                        <td className="p-4">
                          <div className="font-mono text-slate-800">{dealer.dealerCnic}</div>
                          <div className="text-slate-400 text-[11px]">{dealer.dealerLicense}</div>
                        </td>

                        <td className="p-4">
                          <div>{dealer.dealerPhone}</div>
                          <div className="text-slate-400 text-[11px]">{dealer.dealerEmail}</div>
                        </td>

                        <td className="p-4">
                          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-950 border border-emerald-200 rounded-lg font-black text-xs">
                            {dealer.commissionPercent || 2.0}%
                          </span>
                        </td>

                        <td className="p-4 font-bold text-slate-900">
                          {assignedLotsCount} Active Lot(s)
                        </td>

                        <td className="p-4 text-right">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Approved</span>
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: DEALER LOT REQUESTS */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          <div className="text-xs text-slate-500 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            Dealers can submit requests from their portal to either expand their lot allocation or release unsold plots early.
          </div>

          {societyRequests.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 text-slate-400">
              No dealer lot expansion or release requests submitted.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {societyRequests.map(req => (
                <div key={req.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        req.type === 'additional_lot' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {req.type === 'additional_lot' ? 'Request Additional Quota' : 'Release Unused Plots'}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 mt-1">{req.dealerName}</h4>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      req.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                      req.status === 'rejected' ? 'bg-rose-100 text-rose-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {req.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <div><strong className="text-slate-800">Target Block:</strong> {req.requestedBlock}</div>
                    <div><strong className="text-slate-800">Requested Plot Count:</strong> {req.plotCount} Plot(s)</div>
                    {req.plotNumbers && req.plotNumbers.length > 0 && (
                      <div><strong className="text-slate-800">Plots to Release:</strong> {req.plotNumbers.join(', ')}</div>
                    )}
                    {req.message && (
                      <div className="text-[11px] text-slate-500 italic mt-1">"{req.message}"</div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <span className="text-[11px] text-slate-400">{req.submittedAt}</span>

                    {req.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setReviewingLotRequest(req);
                            setLotRequestNote('');
                          }}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer"
                        >
                          Review Request
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: IMMUTABLE AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50">
            <h3 className="font-black text-sm text-slate-900">Lot Assignment & Broker Custody Audit Log</h3>
            <p className="text-xs text-slate-500">Tamper-proof record of every plot assignment, reservation, and release</p>
          </div>

          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider sticky top-0">
                <tr>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Plot & Block</th>
                  <th className="p-4">Broker / Dealer</th>
                  <th className="p-4">Status Shift</th>
                  <th className="p-4">Assigned By & Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {societyAuditTrail.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      No audit events recorded for this society.
                    </td>
                  </tr>
                ) : (
                  societyAuditTrail.map(entry => (
                    <tr key={entry.id} className="hover:bg-slate-50 transition">
                      <td className="p-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {entry.timestamp}
                      </td>

                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                          entry.action === 'ASSIGNED' ? 'bg-teal-100 text-teal-800' :
                          entry.action === 'RESERVED' ? 'bg-amber-100 text-amber-800' :
                          entry.action === 'SOLD' ? 'bg-blue-100 text-blue-800' :
                          entry.action === 'RELEASED' ? 'bg-slate-100 text-slate-700' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {entry.action}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="font-bold text-slate-900">{entry.plotNumber}</div>
                        <div className="text-slate-400 text-[11px]">{entry.block}</div>
                      </td>

                      <td className="p-4 font-semibold text-slate-800">
                        {entry.dealerName}
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">{entry.previousStatus}</span>
                          <span className="text-slate-400">&rarr;</span>
                          <span className="px-1.5 py-0.5 bg-emerald-100 font-bold text-emerald-800 rounded">{entry.newStatus}</span>
                        </div>
                      </td>

                      <td className="p-4 text-slate-600 text-[11px]">
                        <div><strong>By:</strong> {entry.assignedBy}</div>
                        {entry.notes && <div className="text-slate-400 italic">{entry.notes}</div>}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: CREATE PLOT LOT WIZARD */}
      {showCreateLotModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Create & Assign Dealer Plot Lot</h3>
                  <p className="text-xs text-slate-300">Enforce exclusive 1-to-1 broker binding for {society.name}</p>
                </div>
              </div>

              <button
                onClick={() => setShowCreateLotModal(false)}
                className="p-2 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLotSubmit} className="p-6 overflow-y-auto flex-1 space-y-5 text-xs">
              
              {lotModalError && (
                <div className="p-4 bg-rose-50 border border-rose-300 rounded-2xl text-rose-950 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span className="font-bold">{lotModalError}</span>
                </div>
              )}

              {/* Step 1: Dealer & Lot Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Select Authorized Dealer *</label>
                  <select
                    value={selectedDealerId}
                    onChange={(e) => {
                      setSelectedDealerId(e.target.value);
                      const d = approvedDealers.find(item => item.dealerId === e.target.value);
                      if (d) setLotCommission(d.commissionPercent || 2.0);
                    }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-600 font-bold"
                  >
                    {approvedDealers.map(d => (
                      <option key={d.dealerId} value={d.dealerId}>
                        {d.dealerName} ({d.dealerLicense})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Lot Identifier Code *</label>
                  <input
                    type="text"
                    required
                    value={customLotNumber}
                    onChange={(e) => setCustomLotNumber(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
                  />
                </div>
              </div>

              {/* Step 2: Block & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Block *</label>
                  <select
                    value={selectedBlockForLot}
                    onChange={(e) => {
                      setSelectedBlockForLot(e.target.value);
                      setSelectedPlotIdsForLot([]);
                    }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="Executive Block">Executive Block</option>
                    <option value="Rose Block">Rose Block</option>
                    <option value="Commercial Block">Commercial Block</option>
                    <option value="Overseas Block">Overseas Block</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Contract Expiry Duration *</label>
                  <select
                    value={lotDurationDays}
                    onChange={(e) => setLotDurationDays(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value={30}>30 Days (Promotional)</option>
                    <option value={90}>90 Days (Quarterly Standard)</option>
                    <option value={180}>180 Days (Semi-Annual)</option>
                    <option value={365}>365 Days (Annual Contract)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Commission %</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.5"
                    max="10"
                    value={lotCommission}
                    onChange={(e) => setLotCommission(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
              </div>

              {/* Step 3: Select Available Plots (Single-Broker Constraint) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Select Available Plots to Assign in {selectedBlockForLot} ({selectedPlotIdsForLot.length} Selected)</span>
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Only unassigned 'Available' plots shown
                  </span>
                </div>

                {availablePlotsInSelectedBlock.length === 0 ? (
                  <div className="p-4 bg-slate-50 rounded-2xl text-center text-slate-400 border border-slate-200">
                    No available unassigned plots in {selectedBlockForLot}. Please select another block or create new plots.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    {availablePlotsInSelectedBlock.map(plot => {
                      const isSelected = selectedPlotIdsForLot.includes(plot.id);
                      return (
                        <div
                          key={plot.id}
                          onClick={() => togglePlotInLot(plot.id)}
                          className={`p-3 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                              : 'bg-white text-slate-800 border-slate-200 hover:border-emerald-400'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-black text-sm">{plot.plotNumber}</span>
                            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${
                              isSelected ? 'bg-white text-emerald-950 font-black' : 'border border-slate-300'
                            }`}>
                              {isSelected ? '✓' : ''}
                            </span>
                          </div>
                          <div className={`text-[10px] mt-1 ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                            {plot.sizeMarla} Marla • PKR {(plot.pricePKR / 100000).toFixed(1)}L
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Step 4: Renewal Terms & Notes */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Renewal Terms & Conversion Targets</label>
                <input
                  type="text"
                  value={lotRenewalTerms}
                  onChange={(e) => setLotRenewalTerms(e.target.value)}
                  placeholder="e.g. Requires 40% sales conversion before 90-day expiry for auto-renewal"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateLotModal(false)}
                  className="px-4 py-2 font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={selectedPlotIdsForLot.length === 0}
                  className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-xl font-bold transition shadow-xs cursor-pointer flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm & Assign Lot ({selectedPlotIdsForLot.length} Plots)</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* MODAL: REVIEW DEALER JOIN REQUEST */}
      {reviewingRelation && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Review Real Estate Agency Registration</h3>
              <button onClick={() => setReviewingRelation(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="font-bold text-sm text-slate-900">{reviewingRelation.dealerName}</div>
                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <div><strong>CNIC:</strong> {reviewingRelation.dealerCnic}</div>
                  <div><strong>License:</strong> {reviewingRelation.dealerLicense}</div>
                  <div><strong>Phone:</strong> {reviewingRelation.dealerPhone}</div>
                  <div><strong>Email:</strong> {reviewingRelation.dealerEmail}</div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Approve with Commission Percentage (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.5"
                  max="10"
                  value={configuredCommission}
                  onChange={(e) => setConfiguredCommission(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Rejection Reason (If rejecting)</label>
                <input
                  type="text"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Incomplete tax compliance documentation"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleReviewRelationSubmit('rejected')}
                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl font-bold cursor-pointer"
                >
                  Reject Application
                </button>

                <button
                  type="button"
                  onClick={() => handleReviewRelationSubmit('approved')}
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Approve Dealer</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REVIEW LOT REQUEST */}
      {reviewingLotRequest && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Review Dealer Lot Request</h3>
              <button onClick={() => setReviewingLotRequest(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                <div className="font-bold text-sm text-slate-900">{reviewingLotRequest.dealerName}</div>
                <div><strong>Type:</strong> {reviewingLotRequest.type === 'additional_lot' ? 'Additional Quota Request' : 'Early Lot Release Request'}</div>
                <div><strong>Block:</strong> {reviewingLotRequest.requestedBlock} ({reviewingLotRequest.plotCount} plots)</div>
                {reviewingLotRequest.message && (
                  <div className="text-slate-500 italic mt-1">"{reviewingLotRequest.message}"</div>
                )}
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Society Admin Review Note</label>
                <input
                  type="text"
                  value={lotRequestNote}
                  onChange={(e) => setLotRequestNote(e.target.value)}
                  placeholder="e.g. Approved for Executive Block Sector A allocation"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleReviewLotRequestSubmit('rejected')}
                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl font-bold cursor-pointer"
                >
                  Reject Request
                </button>

                <button
                  type="button"
                  onClick={() => handleReviewLotRequestSubmit('approved')}
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Approve Request</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
