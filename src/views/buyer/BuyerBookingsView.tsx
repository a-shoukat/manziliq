import React, { useState } from 'react';
import { Booking, User } from '../../types';
import { 
  Layers, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Download, 
  Building2, 
  Phone, 
  ShieldCheck,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { generatePDFDocument } from '../../utils/pdfGenerator';

interface BuyerBookingsViewProps {
  currentUser: User;
  bookings: Booking[];
  onNavigate: (route: string) => void;
}

export const BuyerBookingsView: React.FC<BuyerBookingsViewProps> = ({
  currentUser,
  bookings,
  onNavigate
}) => {
  const userBookings = bookings.filter(b => 
    b.buyerId === currentUser.id || 
    (currentUser.email && b.buyerEmail?.toLowerCase() === currentUser.email.toLowerCase()) ||
    (currentUser.role === 'buyer' && (!b.buyerId || b.buyerId === 'u-buyer-1' || b.buyerId === 'u-buyer-alias'))
  );
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(userBookings[0] || bookings[0] || null);

  const handleDownloadAllotment = (booking: Booking) => {
    generatePDFDocument({
      docType: 'allotment_letter',
      buyerName: booking.buyerName,
      buyerPhone: booking.buyerPhone,
      buyerCNIC: booking.buyerCnic,
      plotNumber: booking.plotNumber,
      sector: booking.sector,
      societyName: booking.societyName,
      totalPricePKR: booking.totalPricePKR,
      downPaymentPKR: booking.downPaymentPKR,
      allotmentNumber: booking.allotmentLetterNumber || 'AR-2026-0841',
      date: booking.bookingDate
    });
  };

  const handleDownloadAgreement = (booking: Booking) => {
    generatePDFDocument({
      docType: 'booking_agreement',
      buyerName: booking.buyerName,
      buyerPhone: booking.buyerPhone,
      buyerCNIC: booking.buyerCnic,
      plotNumber: booking.plotNumber,
      sector: booking.sector,
      societyName: booking.societyName,
      totalPricePKR: booking.totalPricePKR,
      downPaymentPKR: booking.downPaymentPKR,
      allotmentNumber: booking.allotmentLetterNumber,
      date: booking.bookingDate
    });
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Housing Society Bookings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tracking 6-stage lifecycle progress from initial token reservation to final registry transfer.
          </p>
        </div>

        <button
          onClick={() => onNavigate('/marketplace')}
          className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
        >
          + Book New Plot
        </button>
      </div>

      {userBookings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 space-y-4">
          <Layers className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No active plot bookings found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Browse the marketplace or society masterplans to reserve your first residential or commercial unit.
          </p>
          <button
            onClick={() => onNavigate('/marketplace')}
            className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer"
          >
            Explore Available Plots
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Booking Cards List (Left) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Your Registered Lots ({userBookings.length})
            </div>

            {userBookings.map((b) => {
              const isSelected = selectedBooking?.id === b.id;
              return (
                <div
                  key={b.id}
                  onClick={() => setSelectedBooking(b)}
                  className={`p-5 rounded-3xl border transition cursor-pointer space-y-3 ${
                    isSelected 
                      ? 'bg-emerald-50/50 border-emerald-300 shadow-md ring-1 ring-emerald-400' 
                      : 'bg-white border-slate-200 hover:bg-slate-50 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-900 text-white">
                      {b.plotNumber}
                    </span>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      b.pipelineStage >= 4 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                    }`}>
                      Stage {b.pipelineStage} of 6
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900">{b.societyName}</h3>
                    <p className="text-xs text-slate-500">{b.sector} • Booking Date: {b.bookingDate}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400">Total Price:</span>
                      <strong className="text-slate-900 ml-1">PKR {b.totalPricePKR.toLocaleString('en-PK')}</strong>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Booking Deep Inspection & 6-Stage Timeline (Right) */}
          {selectedBooking && (
            <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                    Booking Detail & Digital Records
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 mt-0.5">
                    {selectedBooking.plotNumber} ({selectedBooking.sector})
                  </h2>
                  <p className="text-xs text-slate-500">
                    {selectedBooking.societyName} • Ref: <span className="font-mono font-bold text-slate-700">{selectedBooking.id}</span>
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleDownloadAllotment(selectedBooking)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Allotment Letter (PDF)</span>
                  </button>
                  <button
                    onClick={() => handleDownloadAgreement(selectedBooking)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Agreement (PDF)</span>
                  </button>
                </div>
              </div>

              {/* 6-Stage Pipeline Timeline */}
              <div className="space-y-4">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  6-Stage Official Transaction Lifecycle
                </div>

                <div className="space-y-3">
                  {selectedBooking.timeline.map((stageItem) => (
                    <div
                      key={stageItem.stage}
                      className={`p-4 rounded-2xl border transition flex items-start gap-3.5 ${
                        stageItem.completed
                          ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                          : stageItem.stage === selectedBooking.pipelineStage + 1
                          ? 'bg-amber-50/60 border-amber-300 text-amber-950 ring-1 ring-amber-300'
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        stageItem.completed ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {stageItem.completed ? '✓' : stageItem.stage}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between text-xs">
                          <h4 className="font-bold">{stageItem.label}</h4>
                          <span className="text-[11px] font-mono opacity-80">{stageItem.timestamp}</span>
                        </div>
                        {stageItem.note && (
                          <p className="text-xs opacity-90 mt-1">{stageItem.note}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions Row */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-500">
                  Authorized Dealer: <strong>{selectedBooking.dealerName || 'Chaudhry Tariq Real Estate'}</strong>
                </div>
                <button
                  onClick={() => onNavigate('/buyer/installments')}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  View Installment Schedule &rarr;
                </button>
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
};
