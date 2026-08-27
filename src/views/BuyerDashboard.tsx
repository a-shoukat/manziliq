import React from 'react';
import { User, Booking, Installment, Property, DocumentItem } from '../types';
import { generatePDFDocument } from '../utils/pdfGenerator';
import { 
  Building2, 
  CreditCard, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Download, 
  FileText, 
  ArrowRight,
  ShieldCheck,
  Heart
} from 'lucide-react';

interface BuyerDashboardProps {
  currentUser: User;
  bookings: Booking[];
  installments: Installment[];
  wishlist: Property[];
  onOpenPaymentModal: (booking: Booking, installment?: Installment) => void;
}

export const BuyerDashboard: React.FC<BuyerDashboardProps> = ({
  currentUser,
  bookings,
  installments,
  wishlist,
  onOpenPaymentModal
}) => {
  const userBookings = bookings.filter(b => b.buyerId === currentUser.id || true); // fallback to all for demo
  const activeBooking = userBookings[0];

  const bookingInstallments = installments.filter(i => i.bookingId === activeBooking?.id);
  const paidCount = bookingInstallments.filter(i => i.status === 'paid').length;
  const totalPaidPKR = bookingInstallments
    .filter(i => i.status === 'paid')
    .reduce((sum, i) => sum + i.amountPKR, 0) + (activeBooking?.downPaymentPKR || 0);

  const nextDueInstallment = bookingInstallments.find(i => i.status === 'due' || i.status === 'overdue');

  const handleDownloadAllotment = () => {
    if (!activeBooking) return;
    generatePDFDocument({
      docType: 'allotment_letter',
      buyerName: activeBooking.buyerName,
      buyerPhone: activeBooking.buyerPhone,
      plotNumber: activeBooking.plotNumber,
      sector: activeBooking.sector,
      societyName: activeBooking.societyName,
      totalPricePKR: activeBooking.totalPricePKR,
      downPaymentPKR: activeBooking.downPaymentPKR,
      date: activeBooking.bookingDate
    });
  };

  const handleDownloadAgreement = () => {
    if (!activeBooking) return;
    generatePDFDocument({
      docType: 'booking_agreement',
      buyerName: activeBooking.buyerName,
      buyerPhone: activeBooking.buyerPhone,
      plotNumber: activeBooking.plotNumber,
      sector: activeBooking.sector,
      societyName: activeBooking.societyName,
      totalPricePKR: activeBooking.totalPricePKR,
      downPaymentPKR: activeBooking.downPaymentPKR,
      date: activeBooking.bookingDate
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Welcome & Stats Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 text-slate-900 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-100 text-amber-800 font-bold text-xs px-2.5 py-0.5 rounded border border-amber-300">
                Buyer Portal
              </span>
              <span className="text-slate-500 text-xs">Logged in as {currentUser.name}</span>
            </div>
            <h2 className="text-2xl font-black font-[Outfit] text-slate-900 mt-1">My Property Bookings & Ledger</h2>
            <p className="text-xs text-slate-500">Track monthly plot installments, download official allotment deeds, and pay via mobile wallets.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadAllotment}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Allotment Letter (PDF)</span>
            </button>

            <button
              onClick={handleDownloadAgreement}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-3.5 py-2 rounded-xl text-xs border border-slate-200 flex items-center gap-1.5 transition-all"
            >
              <FileText className="w-4 h-4 text-teal-600" />
              <span>Booking Agreement</span>
            </button>
          </div>
        </div>

        {/* Overview Stat Cards */}
        {activeBooking && (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs pt-1">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-slate-500 text-[10px] block font-bold">Active Plot Booking</span>
              <span className="text-base font-extrabold text-slate-900 block mt-0.5 font-[Outfit]">
                Plot {activeBooking.plotNumber} ({activeBooking.sector})
              </span>
              <span className="text-teal-700 text-[11px] font-semibold">{activeBooking.societyName}</span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-slate-500 text-[10px] block font-bold">Total Plot Cost</span>
              <span className="text-base font-extrabold text-amber-700 block mt-0.5 font-[Outfit]">
                PKR {activeBooking.totalPricePKR.toLocaleString('en-PK')}
              </span>
              <span className="text-slate-500 text-[11px]">Down payment: PKR {activeBooking.downPaymentPKR.toLocaleString('en-PK')}</span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-slate-500 text-[10px] block font-bold">Total Paid to Date</span>
              <span className="text-base font-extrabold text-emerald-700 block mt-0.5 font-[Outfit]">
                PKR {totalPaidPKR.toLocaleString('en-PK')}
              </span>
              <span className="text-emerald-700 text-[11px] font-semibold">{paidCount} Installments Cleared</span>
            </div>

            <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200 flex flex-col justify-between">
              <div>
                <span className="text-slate-600 text-[10px] block font-bold">Next Due Installment</span>
                <span className="text-sm font-extrabold text-slate-900 block">
                  {nextDueInstallment ? `PKR ${nextDueInstallment.amountPKR.toLocaleString('en-PK')}` : 'All Paid'}
                </span>
                <span className="text-amber-800 text-[10px] font-semibold">Due Date: {nextDueInstallment?.dueDate || 'N/A'}</span>
              </div>

              {nextDueInstallment && (
                <button
                  onClick={() => onOpenPaymentModal(activeBooking, nextDueInstallment)}
                  className="mt-2 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-1.5 rounded-lg text-[11px] shadow-xs transition-all"
                >
                  Pay PKR {nextDueInstallment.amountPKR.toLocaleString('en-PK')} Online
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Installment Schedule Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-lg font-[Outfit] text-slate-900">Official Installment Schedule</h3>
            <p className="text-xs text-slate-500">Auto-generated payment ledger synced with Al-Rehman Garden Society Admin</p>
          </div>

          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">
            48 Months Tenure Plan
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                <th className="p-3">Inst #</th>
                <th className="p-3">Due Date</th>
                <th className="p-3">Amount (PKR)</th>
                <th className="p-3">Status</th>
                <th className="p-3">Paid Date</th>
                <th className="p-3">Payment Method</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {bookingInstallments.map(inst => (
                <tr key={inst.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-bold text-slate-900">#{inst.installmentNumber}</td>
                  <td className="p-3 text-slate-600">{inst.dueDate}</td>
                  <td className="p-3 font-mono font-bold text-slate-900">
                    PKR {inst.amountPKR.toLocaleString('en-PK')}
                  </td>
                  <td className="p-3">
                    {inst.status === 'paid' && (
                      <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full text-[10px] flex items-center gap-1 w-fit">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Paid
                      </span>
                    )}
                    {inst.status === 'due' && (
                      <span className="bg-amber-100 text-amber-800 font-bold px-2.5 py-0.5 rounded-full text-[10px] flex items-center gap-1 w-fit">
                        <Clock className="w-3 h-3 text-amber-600" />
                        Due Soon
                      </span>
                    )}
                    {inst.status === 'overdue' && (
                      <span className="bg-rose-100 text-rose-800 font-bold px-2.5 py-0.5 rounded-full text-[10px] flex items-center gap-1 w-fit">
                        <AlertCircle className="w-3 h-3 text-rose-600" />
                        Overdue
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-slate-500">{inst.paidDate || '—'}</td>
                  <td className="p-3 text-slate-600 font-semibold">{inst.paymentMethod || '—'}</td>
                  <td className="p-3 text-right">
                    {inst.status === 'paid' ? (
                      <button
                        onClick={() => generatePDFDocument({
                          docType: 'receipt',
                          buyerName: activeBooking.buyerName,
                          buyerPhone: activeBooking.buyerPhone,
                          plotNumber: activeBooking.plotNumber,
                          sector: activeBooking.sector,
                          societyName: activeBooking.societyName,
                          totalPricePKR: activeBooking.totalPricePKR,
                          paidAmountPKR: inst.amountPKR,
                          installmentNo: inst.installmentNumber,
                          transactionId: inst.transactionId || 'JC-882910',
                          paymentMethod: inst.paymentMethod,
                          date: inst.paidDate || '2026-06-10'
                        })}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 ml-auto"
                      >
                        <Download className="w-3 h-3" />
                        <span>Receipt</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onOpenPaymentModal(activeBooking, inst)}
                        className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold px-3 py-1.5 rounded-lg text-[11px] shadow"
                      >
                        Pay Online
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
