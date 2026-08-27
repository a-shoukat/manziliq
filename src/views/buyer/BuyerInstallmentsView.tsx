import React, { useState } from 'react';
import { Installment, Booking, User } from '../../types';
import { 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Download, 
  DollarSign, 
  Calendar, 
  ShieldCheck, 
  FileText 
} from 'lucide-react';
import { generatePDFDocument } from '../../utils/pdfGenerator';

interface BuyerInstallmentsViewProps {
  currentUser: User;
  installments: Installment[];
  booking?: Booking;
  onOpenPayment: (installment: Installment) => void;
}

export const BuyerInstallmentsView: React.FC<BuyerInstallmentsViewProps> = ({
  currentUser,
  installments,
  booking,
  onOpenPayment
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'due' | 'overdue'>('all');

  const filteredInstallments = installments.filter(inst => {
    if (filterStatus === 'all') return true;
    return inst.status === filterStatus;
  });

  const totalPaid = installments
    .filter(i => i.status === 'paid')
    .reduce((sum, i) => sum + i.amountPKR, 0);

  const totalRemaining = installments
    .filter(i => i.status !== 'paid')
    .reduce((sum, i) => sum + i.amountPKR, 0);

  const handleDownloadReceipt = (inst: Installment) => {
    generatePDFDocument({
      docType: 'payment_receipt',
      buyerName: currentUser.name,
      buyerPhone: currentUser.phone || '+92 300 8472910',
      buyerCNIC: currentUser.cnic,
      plotNumber: inst.plotNumber || 'Plot 42-A',
      societyName: inst.societyName || 'Al-Rehman Garden Housing Society',
      totalPricePKR: 2600000,
      downPaymentPKR: 520000,
      paidAmountPKR: inst.amountPKR,
      installmentNo: inst.installmentNumber,
      transactionId: inst.transactionId || `TXN-PK-2026-${inst.installmentNumber}`,
      paymentMethod: (inst.paymentMethod as string) || '1Link Online Transfer',
      date: inst.paidDate || '2026-08-19'
    });
  };

  return (
    <div className="space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Installment Schedule & Ledger
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Official payment milestones for Plot {installments[0]?.plotNumber || 'Plot 42-A'} ({installments[0]?.societyName || 'Al-Rehman Garden'}).
          </p>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl text-xs font-bold">
          {(['all', 'paid', 'due', 'overdue'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-xl capitalize transition cursor-pointer ${
                filterStatus === s ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cleared Installments</div>
          <div className="text-2xl font-black text-emerald-800 mt-1">
            PKR {totalPaid.toLocaleString('en-PK')}
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
            {installments.filter(i => i.status === 'paid').length} of {installments.length} Installments Paid
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Remaining Balance</div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            PKR {totalRemaining.toLocaleString('en-PK')}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Spread across remaining tenure
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Late Surcharge Policy</div>
          <div className="text-xl font-black text-amber-700 mt-1">
            2.5% Flat / Month
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Applied automatically 7 days post due date
          </div>
        </div>
      </div>

      {/* Installments Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
                <th className="p-4">Installment #</th>
                <th className="p-4">Due Date</th>
                <th className="p-4">Base Amount</th>
                <th className="p-4">Late Surcharge</th>
                <th className="p-4">Total Payable</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action / Receipt</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredInstallments.map((inst) => {
                const totalPayable = inst.amountPKR + (inst.lateFeePKR || 0);

                return (
                  <tr key={inst.id} className="hover:bg-slate-50/50 transition">
                    <td className="p-4 font-bold text-slate-900">
                      Installment #{inst.installmentNumber}
                    </td>

                    <td className="p-4 text-slate-600 font-mono">
                      {inst.dueDate}
                    </td>

                    <td className="p-4 font-semibold text-slate-900">
                      PKR {inst.amountPKR.toLocaleString('en-PK')}
                    </td>

                    <td className="p-4">
                      {inst.lateFeePKR && inst.lateFeePKR > 0 ? (
                        <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                          + PKR {inst.lateFeePKR.toLocaleString('en-PK')} ({inst.daysOverdue}d overdue)
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    <td className="p-4 font-extrabold text-slate-900">
                      PKR {totalPayable.toLocaleString('en-PK')}
                    </td>

                    <td className="p-4">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase ${
                        inst.status === 'paid' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : inst.status === 'overdue' 
                          ? 'bg-rose-100 text-rose-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {inst.status}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      {inst.status === 'paid' ? (
                        <button
                          onClick={() => handleDownloadReceipt(inst)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Receipt (PDF)</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => onOpenPayment(inst)}
                          className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Pay Now</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
