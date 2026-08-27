import React from 'react';
import { DollarSign, CheckCircle2, Clock, TrendingUp, Download, Building2 } from 'lucide-react';
import { generatePDFDocument } from '../../utils/pdfGenerator';

export const DealerCommissionView: React.FC = () => {
  const deals = [
    {
      id: 'com-1',
      dealRef: 'DL-2026-081',
      plotNumber: 'Plot 18-B (Sector B, Royal Orchard)',
      buyerName: 'Muhammad Farooq',
      dealValuePKR: 4800000,
      commissionPercent: 2.0,
      commissionAmountPKR: 96000,
      status: 'Paid into BOP Account',
      date: '2026-08-14'
    },
    {
      id: 'com-2',
      dealRef: 'DL-2026-074',
      plotNumber: 'Plot 42-A (Sector A, Al-Rehman Garden)',
      buyerName: 'Chaudhry Waqas',
      dealValuePKR: 2600000,
      commissionPercent: 2.0,
      commissionAmountPKR: 52000,
      status: 'Paid into BOP Account',
      date: '2026-08-02'
    },
    {
      id: 'com-3',
      dealRef: 'DL-2026-068',
      plotNumber: 'Plot 07-C (Model Town Greens)',
      buyerName: 'Dr. Kamran Akmal',
      dealValuePKR: 7400000,
      commissionPercent: 2.0,
      commissionAmountPKR: 148000,
      status: 'Pending Escrow Release',
      date: '2026-07-20'
    }
  ];

  const totalEarned = deals.reduce((sum, d) => sum + d.commissionAmountPKR, 0);
  const paidOut = deals.filter(d => d.status.includes('Paid')).reduce((sum, d) => sum + d.commissionAmountPKR, 0);

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <DollarSign className="w-7 h-7 text-emerald-800" />
            <span>Realtor Commission Ledger & Payouts</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Automated 2.0% standard broker commission calculation on closed society token reservations.
          </p>
        </div>

        <div className="text-xs font-semibold text-slate-500 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
          Payout Channel: <strong>Bank of Punjab — Acct: 0094-1182740-1</strong>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Commission Earned</div>
          <div className="text-2xl font-black text-emerald-900 mt-1">
            PKR {totalEarned.toLocaleString('en-PK')}
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">Across 3 verified transactions</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cleared & Deposited</div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            PKR {paidOut.toLocaleString('en-PK')}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Transferred via RTGS / 1Link</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Society Escrow</div>
          <div className="text-2xl font-black text-amber-700 mt-1">
            PKR {(totalEarned - paidOut).toLocaleString('en-PK')}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Releases upon buyer downpayment clear</div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
                <th className="p-4">Deal Reference</th>
                <th className="p-4">Property / Lot</th>
                <th className="p-4">Buyer Name</th>
                <th className="p-4">Transaction Value</th>
                <th className="p-4">Rate (%)</th>
                <th className="p-4">Commission Payout</th>
                <th className="p-4">Payout Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-slate-700">
              {deals.map((deal) => (
                <tr key={deal.id} className="hover:bg-slate-50/50 transition">
                  <td className="p-4 font-mono font-bold text-slate-900">{deal.dealRef}</td>
                  <td className="p-4 font-semibold text-slate-800">{deal.plotNumber}</td>
                  <td className="p-4 text-slate-700">{deal.buyerName}</td>
                  <td className="p-4 font-semibold text-slate-900">PKR {deal.dealValuePKR.toLocaleString('en-PK')}</td>
                  <td className="p-4 font-bold text-emerald-800">{deal.commissionPercent}%</td>
                  <td className="p-4 font-extrabold text-emerald-900">PKR {deal.commissionAmountPKR.toLocaleString('en-PK')}</td>
                  <td className="p-4">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                      deal.status.includes('Paid') ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {deal.status}
                    </span>
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
