import React, { useState, useMemo } from 'react';
import { Booking, BookingPipelineStage, User } from '../../types';
import { 
  Kanban, 
  Plus, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  User as UserIcon, 
  MapPin, 
  ShieldCheck, 
  FileText, 
  Search, 
  X, 
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Download,
  Phone,
  FileCheck
} from 'lucide-react';
import { calculateCancellationPenalty } from '../../utils/paymentCalculators';
import { generatePDFDocument } from '../../utils/pdfGenerator';

export interface DealPipelineKanbanProps {
  bookings: Booking[];
  currentUser?: User;
  onAdvancePipeline?: (bookingId: string) => void;
  onMoveBackPipeline?: (bookingId: string) => void;
  onCancelBooking?: (bookingId: string, reason: string, penaltyPKR: number) => void;
  onSelectBooking?: (booking: Booking) => void;
  roleAccent?: 'indigo' | 'emerald' | 'teal' | 'amber';
}

const STAGES: { stage: BookingPipelineStage; title: string; subtitle: string; color: string; badgeBg: string }[] = [
  {
    stage: 1,
    title: '1. Inquiry',
    subtitle: 'Lead expressed interest & inquiry logged',
    color: 'border-blue-300 bg-blue-50/50 text-blue-900',
    badgeBg: 'bg-blue-100 text-blue-800'
  },
  {
    stage: 2,
    title: '2. Site Visit',
    subtitle: 'Physical site walkthrough conducted',
    color: 'border-indigo-300 bg-indigo-50/50 text-indigo-900',
    badgeBg: 'bg-indigo-100 text-indigo-800'
  },
  {
    stage: 3,
    title: '3. Token',
    subtitle: 'Token advance received & plot auto-locked',
    color: 'border-amber-300 bg-amber-50/50 text-amber-900',
    badgeBg: 'bg-amber-100 text-amber-800'
  },
  {
    stage: 4,
    title: '4. Agreement',
    subtitle: 'Sale agreement signed & CNIC verified',
    color: 'border-purple-300 bg-purple-50/50 text-purple-900',
    badgeBg: 'bg-purple-100 text-purple-800'
  },
  {
    stage: 5,
    title: '5. Payment',
    subtitle: 'Down payment cleared & installments active',
    color: 'border-teal-300 bg-teal-50/50 text-teal-900',
    badgeBg: 'bg-teal-100 text-teal-800'
  },
  {
    stage: 6,
    title: '6. Transfer',
    subtitle: 'Possession & Absolute Title Deed issued',
    color: 'border-emerald-300 bg-emerald-50/50 text-emerald-900',
    badgeBg: 'bg-emerald-100 text-emerald-800'
  }
];

export const DealPipelineKanban: React.FC<DealPipelineKanbanProps> = ({
  bookings = [],
  currentUser,
  onAdvancePipeline,
  onMoveBackPipeline,
  onCancelBooking,
  onSelectBooking,
  roleAccent = 'teal'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [societyFilter, setSocietyFilter] = useState('all');
  const [dealerFilter, setDealerFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('Mutual surrender / buyer changed requirements');

  // Filter deals
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      if (b.status === 'cancelled') return false;
      if (societyFilter !== 'all' && b.societyName !== societyFilter) return false;
      if (dealerFilter !== 'all') {
        if (dealerFilter === 'direct' && b.dealerId) return false;
        if (dealerFilter !== 'direct' && b.dealerId !== dealerFilter) return false;
      }
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesBuyer = (b.buyerName || '').toLowerCase().includes(q);
        const matchesPlot = (b.plotNumber || '').toLowerCase().includes(q);
        const matchesSociety = (b.societyName || '').toLowerCase().includes(q);
        const matchesRef = (b.bookingReference || b.id || '').toLowerCase().includes(q);
        if (!matchesBuyer && !matchesPlot && !matchesSociety && !matchesRef) return false;
      }
      return true;
    });
  }, [bookings, societyFilter, dealerFilter, searchTerm]);

  // Group by stage
  const dealsByStage = useMemo(() => {
    const map: Record<BookingPipelineStage, Booking[]> = {
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: []
    };
    filteredBookings.forEach(b => {
      const stage = (b.pipelineStage || 1) as BookingPipelineStage;
      if (map[stage]) {
        map[stage].push(b);
      } else {
        map[1].push(b);
      }
    });
    return map;
  }, [filteredBookings]);

  // Total Pipeline Value
  const totalPipelinePKR = filteredBookings.reduce((sum, b) => sum + (b.totalPricePKR || 0), 0);

  const formatLakhCrore = (num: number) => {
    if (num >= 10000000) {
      return `PKR ${(num / 10000000).toFixed(2)} Crore`;
    }
    return `PKR ${(num / 100000).toFixed(1)} Lakh`;
  };

  const handleDownloadDoc = (type: 'allotment_letter' | 'booking_agreement' | 'transfer_deed' | 'token_receipt') => {
    if (!selectedBooking) return;
    generatePDFDocument({
      docType: type,
      buyerName: selectedBooking.buyerName,
      buyerPhone: selectedBooking.buyerPhone,
      buyerCNIC: selectedBooking.buyerCnic,
      plotNumber: selectedBooking.plotNumber,
      sector: selectedBooking.sector,
      societyName: selectedBooking.societyName,
      totalPricePKR: selectedBooking.totalPricePKR,
      downPaymentPKR: selectedBooking.downPaymentPKR,
      bookingReference: selectedBooking.bookingReference,
      allotmentNumber: selectedBooking.allotmentLetterNumber,
      dealerName: selectedBooking.dealerName,
      date: selectedBooking.bookingDate
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Top Controls & Metrics */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Kanban className="w-5 h-5 text-emerald-800" />
            <span>6-Stage Deal Pipeline CRM</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Module 6 Lifecycle: 1. Inquiry &rarr; 2. Site Visit &rarr; 3. Token & Auto-Lock &rarr; 4. Agreement &rarr; 5. Payment &rarr; 6. Transfer
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
            <span className="text-slate-500 font-medium">Active Deals: </span>
            <strong className="text-slate-900 font-bold">{filteredBookings.length}</strong>
          </div>

          <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs">
            <span className="text-emerald-800 font-medium">Pipeline Value: </span>
            <strong className="text-emerald-950 font-bold font-mono">{formatLakhCrore(totalPipelinePKR)}</strong>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by buyer, plot, ref..."
              className="text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 w-52"
            />
          </div>
        </div>
      </div>

      {/* 6 Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 overflow-x-auto pb-4">
        {STAGES.map((stg) => {
          const stageDeals = dealsByStage[stg.stage] || [];
          const stageTotal = stageDeals.reduce((sum, b) => sum + (b.totalPricePKR || 0), 0);

          return (
            <div
              key={stg.stage}
              className="bg-slate-50/80 rounded-2xl border border-slate-200 p-3 flex flex-col min-h-[520px] space-y-3"
            >
              {/* Column Header */}
              <div className={`p-2.5 rounded-xl border ${stg.color} space-y-1`}>
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold truncate">{stg.title}</h4>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-2xs ${stg.badgeBg}`}>
                    {stageDeals.length}
                  </span>
                </div>
                <div className="text-[10px] opacity-80 truncate">{stg.subtitle}</div>
                <div className="text-[10px] font-mono font-bold pt-1 border-t border-black/10">
                  {formatLakhCrore(stageTotal)}
                </div>
              </div>

              {/* Deal Cards Container */}
              <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[620px] pr-0.5">
                {stageDeals.length === 0 ? (
                  <div className="h-32 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center p-3 text-center text-slate-400 text-xs">
                    No deals in this stage
                  </div>
                ) : (
                  stageDeals.map((deal) => {
                    return (
                      <div
                        key={deal.id}
                        onClick={() => {
                          setSelectedBooking(deal);
                          if (onSelectBooking) onSelectBooking(deal);
                        }}
                        className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs hover:border-emerald-500 transition-all space-y-2.5 cursor-pointer text-xs"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <div>
                            <span className="font-bold text-slate-900 block truncate">
                              {deal.plotNumber}
                            </span>
                            <span className="text-[10px] text-slate-500">{deal.sector || 'Sector A'}</span>
                          </div>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 shrink-0">
                            {deal.bookingReference || deal.id.slice(-6)}
                          </span>
                        </div>

                        <div className="space-y-1 text-slate-600 text-[11px]">
                          <div className="flex items-center gap-1.5">
                            <UserIcon className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate font-medium">{deal.buyerName}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{deal.societyName}</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <div>
                            <span className="text-[9px] text-slate-400 uppercase font-bold">Total Demand</span>
                            <div className="font-mono font-bold text-emerald-800 text-[11px]">
                              PKR {(deal.totalPricePKR / 100000).toFixed(1)}L
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-[9px] text-slate-400 uppercase font-bold">Token Paid</span>
                            <div className="font-mono font-semibold text-slate-700 text-[11px]">
                              PKR {((deal.tokenAdvancePKR || 50000) / 1000).toFixed(0)}k
                            </div>
                          </div>
                        </div>

                        {/* Stage Controls */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1" onClick={e => e.stopPropagation()}>
                          {stg.stage > 1 && onMoveBackPipeline ? (
                            <button
                              onClick={() => onMoveBackPipeline(deal.id)}
                              className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-900 transition"
                              title="Move back 1 stage"
                            >
                              <ArrowLeft className="w-3 h-3" />
                            </button>
                          ) : <div />}

                          {stg.stage < 6 && onAdvancePipeline ? (
                            <button
                              onClick={() => onAdvancePipeline(deal.id)}
                              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[10px] font-bold flex items-center gap-1 transition ml-auto"
                            >
                              <span>Advance</span>
                              <ArrowRight className="w-2.5 h-2.5" />
                            </button>
                          ) : (
                            <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-0.5 ml-auto">
                              <CheckCircle2 className="w-3 h-3" /> Demarcated
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Deal Detail & Document Action Modal */}
      {selectedBooking && !showCancelModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 border border-slate-200 shadow-2xl space-y-4 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                  Deal Pipeline File #{selectedBooking.bookingReference || selectedBooking.id}
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  {selectedBooking.plotNumber} ({selectedBooking.sector}) • {selectedBooking.societyName}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedBooking(null)} 
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Buyer & Property Specs */}
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-500 block text-[10px] font-medium">Allottee Name</span>
                <strong className="text-slate-900">{selectedBooking.buyerName}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] font-medium">NADRA CNIC</span>
                <span className="font-mono text-slate-900">{selectedBooking.buyerCnic || '34501-8472910-3'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] font-medium">Phone & WhatsApp</span>
                <span className="font-mono text-slate-900">{selectedBooking.buyerPhone}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] font-medium">Facilitating Dealer</span>
                <span className="text-slate-900">{selectedBooking.dealerName || 'Direct Society Booking'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] font-medium">Agreed Property Price</span>
                <strong className="text-emerald-800 font-mono text-xs">PKR {selectedBooking.totalPricePKR.toLocaleString('en-PK')}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] font-medium">Token Advance Paid</span>
                <span className="font-mono font-bold text-slate-900">PKR {(selectedBooking.tokenAdvancePKR || 50000).toLocaleString('en-PK')}</span>
              </div>
            </div>

            {/* Pipeline Stage Timeline */}
            <div className="space-y-2 pt-1">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-800" />
                <span>6-Stage Lifecycle Progress</span>
              </h4>
              <div className="space-y-2 border-l-2 border-emerald-300 ml-2 pl-3">
                {STAGES.map((s) => {
                  const currentStage = selectedBooking.pipelineStage || 1;
                  const isCompleted = currentStage >= s.stage;
                  const isCurrent = currentStage === s.stage;

                  return (
                    <div key={s.stage} className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${isCompleted ? 'bg-emerald-600' : 'bg-slate-300'}`} />
                        <span className={isCurrent ? 'font-bold text-emerald-950' : isCompleted ? 'text-slate-700 font-medium' : 'text-slate-400'}>
                          {s.title}: {s.subtitle}
                        </span>
                      </div>
                      {isCompleted && (
                        <span className="text-[10px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Cleared
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Instant Document Generation Actions */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5 text-emerald-800" />
                <span>Issue & Download Certified Documents</span>
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadDoc('token_receipt')}
                  className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left font-semibold text-slate-700 flex items-center justify-between transition cursor-pointer"
                >
                  <span>1. Token Money Receipt</span>
                  <Download className="w-3.5 h-3.5 text-slate-400" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadDoc('booking_agreement')}
                  className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left font-semibold text-slate-700 flex items-center justify-between transition cursor-pointer"
                >
                  <span>2. Sale Agreement</span>
                  <Download className="w-3.5 h-3.5 text-slate-400" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadDoc('allotment_letter')}
                  className="p-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-left font-semibold text-emerald-950 flex items-center justify-between transition cursor-pointer"
                >
                  <span>3. Official Allotment Letter</span>
                  <Download className="w-3.5 h-3.5 text-emerald-700" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadDoc('transfer_deed')}
                  className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left font-semibold text-slate-700 flex items-center justify-between transition cursor-pointer"
                >
                  <span>4. Absolute Transfer Deed</span>
                  <Download className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Footer Action Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              {onCancelBooking && (
                <button
                  type="button"
                  onClick={() => setShowCancelModal(true)}
                  className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 rounded-xl font-semibold transition cursor-pointer"
                >
                  Cancel Booking (10% Penalty)
                </button>
              )}

              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => setSelectedBooking(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold text-slate-700 cursor-pointer"
                >
                  Close
                </button>
                {onAdvancePipeline && (selectedBooking.pipelineStage || 1) < 6 && (
                  <button
                    type="button"
                    onClick={() => {
                      onAdvancePipeline(selectedBooking.id);
                      setSelectedBooking(null);
                    }}
                    className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                  >
                    Advance to Stage {(selectedBooking.pipelineStage || 1) + 1} &rarr;
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Penalty Modal */}
      {selectedBooking && showCancelModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center font-bold">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Cancel Plot Booking</h3>
                <p className="text-[11px] text-slate-500">Statutory Section 8 Surrender Notice</p>
              </div>
            </div>

            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-1.5 text-slate-700">
              {(() => {
                const penalty = calculateCancellationPenalty({
                  totalPricePKR: selectedBooking.totalPricePKR,
                  paidAmountPKR: selectedBooking.downPaymentPKR || selectedBooking.tokenAdvancePKR || 100000,
                  penaltyPercent: 10
                });
                return (
                  <>
                    <div className="flex justify-between">
                      <span>Total Agreed Price:</span>
                      <span className="font-bold">PKR {selectedBooking.totalPricePKR.toLocaleString('en-PK')}</span>
                    </div>
                    <div className="flex justify-between text-rose-700 font-semibold">
                      <span>Standard 10% Deduction Penalty:</span>
                      <span>- PKR {penalty.penaltyPKR.toLocaleString('en-PK')}</span>
                    </div>
                    <div className="flex justify-between text-emerald-800 font-bold border-t border-rose-200 pt-1">
                      <span>Net Refund Payable to Buyer:</span>
                      <span>PKR {penalty.refundPKR.toLocaleString('en-PK')}</span>
                    </div>
                  </>
                );
              })()}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Reason for Cancellation</label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold text-slate-700"
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onCancelBooking) {
                    const penalty = calculateCancellationPenalty({
                      totalPricePKR: selectedBooking.totalPricePKR,
                      paidAmountPKR: selectedBooking.downPaymentPKR || selectedBooking.tokenAdvancePKR || 100000,
                      penaltyPercent: 10
                    });
                    onCancelBooking(selectedBooking.id, cancelReason, penalty.penaltyPKR);
                  }
                  setShowCancelModal(false);
                  setSelectedBooking(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-xs cursor-pointer"
              >
                Confirm Cancellation & Issue Notice
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
