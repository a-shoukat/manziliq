import React, { useState } from 'react';
import { Plot, User, Society, LotAssignment, DealerLotRequest } from '../../types';
import { 
  Layers, 
  ShieldCheck, 
  Search, 
  Filter, 
  Building2, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  DollarSign,
  Download,
  Plus,
  RotateCcw,
  X,
  FileText,
  Percent,
  Lock,
  Calendar,
  Send,
  Map as MapIcon,
  LayoutGrid
} from 'lucide-react';
import { generatePDFDocument } from '../../utils/pdfGenerator';
import { DualLayerPlotMap } from '../../components/society/DualLayerPlotMap';

interface DealerAssignedLotsViewProps {
  currentUser: User;
  plots: Plot[];
  societies: Society[];
  lotAssignments?: LotAssignment[];
  dealerLotRequests?: DealerLotRequest[];
  onUpdatePlotStatus: (plotId: string, newStatus: 'available' | 'assigned' | 'reserved' | 'sold') => void;
  onSubmitLotRequest?: (request: Partial<DealerLotRequest>) => void;
}

export const DealerAssignedLotsView: React.FC<DealerAssignedLotsViewProps> = ({
  currentUser,
  plots,
  societies,
  lotAssignments = [],
  dealerLotRequests = [],
  onUpdatePlotStatus,
  onSubmitLotRequest
}) => {
  const [selectedSociety, setSelectedSociety] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  
  // Modals
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestType, setRequestType] = useState<'additional_lot' | 'release_lot'>('additional_lot');
  const [reqSocietyId, setReqSocietyId] = useState(societies[0]?.id || 'soc-1');
  const [reqBlock, setReqBlock] = useState('Executive Block');
  const [reqPlotCount, setReqPlotCount] = useState(2);
  const [reqPlotIds, setReqPlotIds] = useState<string[]>([]);
  const [reqMessage, setReqMessage] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filter plots assigned specifically to this dealer
  const myAssignedPlots = plots.filter(p => p.dealerId === currentUser.id);
  const myAssignedLots = lotAssignments.filter(l => l.dealerId === currentUser.id);

  const filteredPlots = myAssignedPlots.filter(p => {
    const matchesSearch = p.plotNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.sector.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (p.block && p.block.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSociety = selectedSociety === 'all' || p.societyId === selectedSociety;
    const matchesStatus = selectedStatus === 'all' || p.status === selectedStatus;
    return matchesSearch && matchesSociety && matchesStatus;
  });

  const handleDownloadLotReport = () => {
    const activeLot = myAssignedLots[0];
    generatePDFDocument({
      docType: 'dealer_lot_certificate',
      societyName: activeLot?.societyName || societies[0]?.name || 'Al-Rehman Garden',
      lotNumber: activeLot?.lotNumber || `LOT-EXCLUSIVE-${Date.now().toString().slice(-4)}`,
      block: activeLot?.block || 'Executive Block',
      dealerName: currentUser.name,
      assignedPlots: myAssignedPlots.map(p => `${p.plotNumber} (${p.sizeMarla} Marla)`).join(', ') || 'Plots Allocated by Scheme',
      commissionPercent: activeLot?.commissionPercent || 2.0,
      expiryDate: activeLot?.expiryDate || '2026-12-31',
      date: new Date().toLocaleDateString('en-PK'),
      allotmentNumber: activeLot?.lotNumber || `LOT-CERT-${Date.now().toString().slice(-6)}`
    });
  };

  const handleFormSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const targetSoc = societies.find(s => s.id === reqSocietyId);

    const newRequest: Partial<DealerLotRequest> = {
      id: `req-lot-${Date.now()}`,
      dealerId: currentUser.id,
      dealerName: currentUser.name,
      societyId: reqSocietyId,
      societyName: targetSoc?.name || 'Al-Rehman Garden',
      type: requestType,
      requestedBlock: reqBlock,
      plotCount: Number(reqPlotCount),
      plotIds: reqPlotIds,
      plotNumbers: myAssignedPlots.filter(p => reqPlotIds.includes(p.id)).map(p => p.plotNumber),
      message: reqMessage,
      status: 'pending',
      submittedAt: new Date().toLocaleString()
    };

    if (onSubmitLotRequest) {
      onSubmitLotRequest(newRequest);
    }

    setShowRequestModal(false);
    setToastMessage(`Your ${requestType === 'additional_lot' ? 'additional lot expansion' : 'lot release'} request has been submitted to Society Management.`);
    setTimeout(() => setToastMessage(null), 5000);
  };

  return (
    <div className="space-y-8">
      
      {/* Toast */}
      {toastMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-950 text-xs font-bold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Module 4 • Broker Custody & Exclusive Allocation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Layers className="w-7 h-7 text-emerald-800" />
            <span>Assigned Society Plot Inventory</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Exclusive plot allocations mandated by housing societies under the Single-Broker Binding Rule.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              setRequestType('additional_lot');
              setShowRequestModal(true);
            }}
            className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Request Additional Lot</span>
          </button>

          <button
            onClick={() => {
              setRequestType('release_lot');
              setShowRequestModal(true);
            }}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4 text-slate-500" />
            <span>Request Release of Plots</span>
          </button>

          <button
            onClick={handleDownloadLotReport}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>Download Lot Certificate (PDF)</span>
          </button>
        </div>
      </div>

      {/* Lot Contracts Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {myAssignedLots.map(lot => (
          <div key={lot.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono font-black text-slate-900 text-sm">{lot.lotNumber}</span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
                {lot.status}
              </span>
            </div>

            <div className="text-xs space-y-1 text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <div><strong className="text-slate-800">Society:</strong> {lot.societyName}</div>
              <div><strong className="text-slate-800">Block:</strong> {lot.block} ({lot.plotNumbers.length} Plots)</div>
              <div><strong className="text-slate-800">Commission:</strong> {lot.commissionPercent}%</div>
              <div><strong className="text-slate-800">Valid Until:</strong> <span className="font-bold text-emerald-800">{lot.expiryDate}</span></div>
            </div>

            <div className="flex flex-wrap gap-1">
              {lot.plotNumbers.map((num, i) => (
                <span key={i} className="px-2 py-0.5 bg-slate-100 rounded-md text-[11px] font-mono font-bold text-slate-800">
                  {num}
                </span>
              ))}
            </div>
          </div>
        ))}

        {myAssignedLots.length === 0 && (
          <div className="col-span-3 bg-slate-50 p-8 rounded-3xl text-center text-slate-400 text-xs border border-slate-200">
            No lot batch contracts active. You have {myAssignedPlots.length} individually allocated plots.
          </div>
        )}
      </div>

      {/* Filter Bar & View Toggle */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1 w-full">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search plot number, block, sector..."
              className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          <select
            value={selectedSociety}
            onChange={(e) => setSelectedSociety(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-1 focus:ring-emerald-600"
          >
            <option value="all">All Housing Societies</option>
            {societies.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-1 focus:ring-emerald-600"
          >
            <option value="all">All Statuses</option>
            <option value="available">Available / Assigned</option>
            <option value="reserved">Reserved (Token In Process)</option>
            <option value="sold">Sold Out</option>
          </select>
        </div>

        {/* View Mode Toggle Buttons */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 self-end md:self-auto shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Cards</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              viewMode === 'map'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Interactive Map</span>
          </button>
        </div>
      </div>

      {/* VIEW: INTERACTIVE MAP (DEALER RESTRICTED VIEW) */}
      {viewMode === 'map' ? (
        <div className="space-y-4">
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-900">
            <div className="flex items-center gap-2 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Dealer Security Mode Active: Masterplan visibility strictly isolated to your allocated lots only.</span>
            </div>
            <span className="font-mono text-[11px] font-bold bg-emerald-100 px-2.5 py-0.5 rounded-full text-emerald-800">
              {myAssignedPlots.length} Plots Authorized
            </span>
          </div>

          <DualLayerPlotMap
            society={societies.find(s => s.id === (selectedSociety === 'all' ? societies[0]?.id : selectedSociety)) || societies[0]}
            plots={plots}
            currentUser={currentUser}
            isDealerView={true}
            assignedPlotIds={myAssignedPlots.map(p => p.id)}
            initialLayer="svg_masterplan"
          />
        </div>
      ) : (
        /* VIEW: PLOT CARDS GRID */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlots.map((plot) => (
            <div key={plot.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4 hover:shadow-md transition">
              
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded-md uppercase">
                    {plot.block || 'Executive Block'}
                  </span>
                  <h3 className="text-xl font-black text-slate-900 mt-1">{plot.plotNumber}</h3>
                  <p className="text-xs text-slate-400">{plot.societyName}</p>
                </div>

                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                  plot.status === 'available' || plot.status === 'assigned' ? 'bg-emerald-100 text-emerald-800' :
                  plot.status === 'reserved' ? 'bg-amber-100 text-amber-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {plot.status}
                </span>
              </div>

              {/* Spec Details */}
              <div className="p-3.5 bg-slate-50 rounded-2xl text-xs space-y-1.5 border border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-500">Size:</span>
                  <span className="font-bold text-slate-900">{plot.sizeMarla} Marla ({plot.sizeSqFt || plot.sizeMarla * 225} Sq Ft)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Price:</span>
                  <span className="font-extrabold text-emerald-950">PKR {plot.pricePKR.toLocaleString('en-PK')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">20% Downpayment:</span>
                  <span className="font-medium text-slate-700">PKR {(plot.downPaymentPKR || Math.round(plot.pricePKR * 0.20)).toLocaleString('en-PK')}</span>
                </div>
                {plot.features && plot.features.length > 0 && (
                  <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-200">
                    {plot.features.slice(0, 2).join(' • ')}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div className="text-[10px] text-emerald-800 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Exclusive Rights</span>
                </div>

                {/* Status transition to reserved */}
                <select
                  value={plot.status}
                  onChange={(e) => onUpdatePlotStatus(plot.id, e.target.value as any)}
                  className="text-[11px] font-bold bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 outline-none focus:ring-1 focus:ring-emerald-600 cursor-pointer"
                >
                  <option value="available">Available</option>
                  <option value="reserved">Reserved (Token Paid)</option>
                  <option value="sold">Sold</option>
                </select>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* MODAL: SUBMIT LOT EXPANSION / RELEASE REQUEST */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            
            <div className="p-6 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">
                    {requestType === 'additional_lot' ? 'Request Additional Lot Quota' : 'Request Early Lot Release'}
                  </h3>
                  <p className="text-xs text-slate-300">Submit operational quota request to Housing Society Admin</p>
                </div>
              </div>

              <button onClick={() => setShowRequestModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmitRequest} className="p-6 space-y-4 text-xs">
              
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Target Housing Society *</label>
                <select
                  value={reqSocietyId}
                  onChange={(e) => setReqSocietyId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  {societies.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Target Block *</label>
                  <select
                    value={reqBlock}
                    onChange={(e) => setReqBlock(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="Executive Block">Executive Block</option>
                    <option value="Rose Block">Rose Block</option>
                    <option value="Commercial Block">Commercial Block</option>
                    <option value="Overseas Block">Overseas Block</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">
                    {requestType === 'additional_lot' ? 'Number of Plots *' : 'Plots to Release'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    required
                    value={reqPlotCount}
                    onChange={(e) => setReqPlotCount(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Business Justification / Buyer Pipeline Note *</label>
                <textarea
                  required
                  rows={3}
                  value={reqMessage}
                  onChange={(e) => setReqMessage(e.target.value)}
                  placeholder="e.g. We have 3 pre-qualified buyers interested in 5 Marla plots in Executive Block with ready token deposits..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="px-4 py-2 font-bold text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit to Society</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
