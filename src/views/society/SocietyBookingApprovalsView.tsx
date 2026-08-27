import React, { useState } from 'react';
import { Booking, Society, User } from '../../types';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Download, 
  FileText, 
  ShieldCheck, 
  XCircle, 
  ArrowRight,
  Calculator
} from 'lucide-react';
import { generatePDFDocument } from '../../utils/pdfGenerator';

interface SocietyBookingApprovalsViewProps {
  society: Society;
  bookings: Booking[];
  onAdvancePipeline: (bookingId: string) => void;
  onCancelBooking: (bookingId: string, reason: string, penaltyPKR: number) => void;
}

export const SocietyBookingApprovalsView: React.FC<SocietyBookingApprovalsViewProps> = ({
  society,
  bookings,
  onAdvancePipeline,
  onCancelBooking
}) => {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(bookings[0] || null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Buyer requested cancellation due to personal relocation.');

  const societyBookings = bookings.filter(b => b.societyName.includes(society.name.split(' ')[0]));

  const handleIssueAllotmentPDF = (b: Booking) => {
    generatePDFDocument({
      docType: 'allotment_letter',
      buyerName: b.buyerName,
      buyerPhone: b.buyerPhone,
      buyerCNIC: b.buyerCnic,
      plotNumber: b.plotNumber,
      sector: b.sector,
      societyName: b.societyName,
      totalPricePKR: b.totalPricePKR,
      downPaymentPKR: b.downPaymentPKR,
      allotmentNumber: b.allotmentLetterNumber || 'AR-2026-0841',
      date: '2026-08-19'
    });
  };

  const handleConfirmCancel = () => {
    if (!selectedBooking) return;
    // Standard 10% penalty on total price
    const penalty = Math.round(selectedBooking.totalPricePKR * 0.10);
    onCancelBooking(selectedBooking.id, cancelReason, penalty);
    setCancelModalOpen(false);
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <CheckCircle2 className="w-7 h-7 text-emerald-800" />
            <span>Booking Verification & Allotment Queue</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review token advances, approve NADRA CNIC submissions, issue stamped Allotment Letters, or process legal cancellations.
          </p>
        </div>

        <div className="text-xs font-bold text-slate-600 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
          Pending Approvals: <strong className="text-emerald-800">{societyBookings.length} Applications</strong>
        </div>
      </div>

      {/* Grid: List (Left) vs Deep Approval Inspector (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Booking Cards (Left) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Incoming Applications
          </div>

          {societyBookings.map((b) => {
            const isSelected = selectedBooking?.id === b.id;
            return (
              <div
                key={b.id}
                onClick={() => setSelectedBooking(b)}
                className={`p-5 rounded-3xl border transition cursor-pointer space-y-2.5 ${
                  isSelected
                    ? 'bg-emerald-50/60 border-emerald-300 ring-2 ring-emerald-400 shadow-sm'
                    : 'bg-white border-slate-200 hover:bg-slate-50 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 text-sm">{b.plotNumber}</span>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900">
                    Stage {b.pipelineStage} of 6
                  </span>
                </div>

                <div>
                  <div className="font-semibold text-slate-800 text-xs">{b.buyerName}</div>
                  <div className="text-slate-500 text-[11px]">CNIC: {b.buyerCnic} • Ref: {b.id}</div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-emerald-800 font-extrabold">PKR {b.totalPricePKR.toLocaleString('en-PK')}</span>
                  <span className="text-[11px] text-slate-400">Date: {b.bookingDate}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Deep Approval Inspector (Right) */}
        {selectedBooking && (
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Reviewing Application
                </span>
                <h2 className="text-2xl font-black text-slate-900 mt-0.5">
                  {selectedBooking.plotNumber} ({selectedBooking.sector})
                </h2>
                <p className="text-xs text-slate-500">
                  Allottee: <strong>{selectedBooking.buyerName}</strong> • Phone: {selectedBooking.buyerPhone}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleIssueAllotmentPDF(selectedBooking)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Preview Allotment Letter (PDF)</span>
                </button>
              </div>
            </div>

            {/* Stage Progress Bar */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-700">Official 6-Stage Pipeline Timeline</div>
              <div className="space-y-2 text-xs">
                {selectedBooking.timeline.map((s) => (
                  <div
                    key={s.stage}
                    className={`p-3 rounded-2xl border flex items-center justify-between ${
                      s.completed
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950 font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                        s.completed ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {s.completed ? '✓' : s.stage}
                      </span>
                      <span>{s.label}</span>
                    </div>
                    <span className="font-mono text-[11px]">{s.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Details */}
            <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
              <div>
                <div className="text-slate-400 font-semibold">Total Price</div>
                <div className="font-bold text-slate-900 mt-0.5">PKR {selectedBooking.totalPricePKR.toLocaleString('en-PK')}</div>
              </div>
              <div>
                <div className="text-slate-400 font-semibold">Token Advance</div>
                <div className="font-bold text-emerald-700 mt-0.5">PKR {selectedBooking.tokenAdvancePKR?.toLocaleString('en-PK')}</div>
              </div>
              <div>
                <div className="text-slate-400 font-semibold">20% Downpayment</div>
                <div className="font-bold text-slate-900 mt-0.5">PKR {selectedBooking.downPaymentPKR?.toLocaleString('en-PK')}</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                onClick={() => setCancelModalOpen(true)}
                className="w-full sm:w-auto px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
                <span>Cancel Booking & Impose 10% Penalty</span>
              </button>

              {selectedBooking.pipelineStage < 6 ? (
                <button
                  onClick={() => onAdvancePipeline(selectedBooking.id)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Approve & Advance to Stage {selectedBooking.pipelineStage + 1}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl">
                  ✓ Fully Allotted & Transferred
                </span>
              )}
            </div>

          </div>
        )}

      </div>

      {/* Cancellation Penalty Modal */}
      {cancelModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center gap-2 text-rose-700 font-bold text-base">
              <AlertTriangle className="w-5 h-5" />
              <span>Confirm Booking Cancellation</span>
            </div>

            <p className="text-slate-600">
              Under Punjab Housing Authority bylaws, cancelling <strong>Plot {selectedBooking.plotNumber}</strong> will release the plot back to available inventory and apply a <strong>10% contract cancellation penalty</strong>:
            </p>

            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl space-y-1">
              <div className="flex justify-between">
                <span>Total Unit Price:</span>
                <span className="font-bold">PKR {selectedBooking.totalPricePKR.toLocaleString('en-PK')}</span>
              </div>
              <div className="flex justify-between text-rose-800 font-bold">
                <span>10% Statutory Penalty:</span>
                <span>PKR {Math.round(selectedBooking.totalPricePKR * 0.10).toLocaleString('en-PK')}</span>
              </div>
              <div className="flex justify-between text-slate-700 pt-1 border-t border-rose-200">
                <span>Refund to Allottee:</span>
                <span className="font-bold">PKR {Math.max(0, (selectedBooking.downPaymentPKR || 0) - Math.round(selectedBooking.totalPricePKR * 0.10)).toLocaleString('en-PK')}</span>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Cancellation Legal Justification</label>
              <textarea
                rows={2}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setCancelModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={handleConfirmCancel}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition shadow-xs cursor-pointer"
              >
                Confirm Cancellation & Issue Deed
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
