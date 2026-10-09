import React from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { RevenueInstallmentReport } from '../../services/analyticsService';
import { DollarSign, AlertCircle, Clock, CheckCircle2, TrendingDown } from 'lucide-react';

interface RevenueCollectionCardsProps {
  report: RevenueInstallmentReport;
}

export const RevenueCollectionCards: React.FC<RevenueCollectionCardsProps> = ({ report }) => {
  return (
    <div className="space-y-6">
      
      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gross Booking Receivables</div>
            <div className="text-2xl font-black text-slate-900 mt-1">
              PKR {(report.totalGrossBookingsPKR / 1000000).toFixed(1)}M
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Total contracted portfolio value</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Revenue Collected</div>
            <div className="text-2xl font-black text-emerald-800 mt-1">
              PKR {(report.totalRevenueCollectedPKR / 1000000).toFixed(1)}M
            </div>
            <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
              {report.collectionRatePercent}% Collection Efficiency
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Overdue Installments</div>
            <div className="text-2xl font-black text-rose-800 mt-1">
              PKR {(report.totalOverdueAmountPKR / 1000000).toFixed(1)}M
            </div>
            <div className="text-[11px] text-rose-700 font-semibold mt-0.5">
              {report.overallDefaulterRatePercent}% Defaulter Rate
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg Collection Turnaround</div>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {report.avgCollectionDays} Days
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Average payment velocity</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* 2-Column Section: Defaulter Trend Chart + Overdue Aging Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Defaulter Rate Trend Chart */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-emerald-600" />
                <span>Defaulter Rate Trend Over Time</span>
              </h3>
              <p className="text-xs text-slate-500">
                Monthly overdue rate percentage across all active installment accounts.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Declining (Healthy)
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={report.defaulterTrendHistory} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} />
                <YAxis domain={[3, 8]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} tickFormatter={(v) => `${v}%`} />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-xl border border-slate-700 text-xs space-y-1">
                          <div className="font-bold border-b border-slate-800 pb-1">{label}</div>
                          <div className="text-rose-400 font-bold">Defaulter Rate: {d.defaulterRate}%</div>
                          <div className="text-slate-300 text-[11px]">Total Overdue: PKR {(d.overdueAmountPKR / 1000000).toFixed(1)}M</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="defaulterRate" 
                  name="Defaulter Rate (%)" 
                  stroke="#ef4444" 
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#ef4444' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Overdue Aging Risk Matrix */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Overdue Installment Aging Buckets</span>
              </h3>
              <p className="text-xs text-slate-500">
                Aging classification for delinquent installment schedules.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {report.overdueAgingBreakdown.map((b, i) => {
              const bgBadge = 
                b.riskLevel === 'low' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                b.riskLevel === 'medium' ? 'bg-orange-50 text-orange-800 border-orange-200' :
                b.riskLevel === 'high' ? 'bg-rose-50 text-rose-800 border-rose-200' :
                'bg-red-100 text-red-900 border-red-300';
              return (
                <div key={i} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="font-bold text-slate-900">{b.bucket}</div>
                    <div className="text-[11px] text-slate-500">{b.count} delinquent installment accounts</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-slate-900 text-sm">
                      PKR {(b.amountPKR / 1000000).toFixed(1)}M
                    </div>
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border mt-0.5 ${bgBadge}`}>
                      {b.riskLevel.toUpperCase()} RISK
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Society Overdue Table */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Overdue Installments & Collection Rates by Society
            </h3>
            <p className="text-xs text-slate-500">
              Reconciled ledger metrics per housing developer authority.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <th className="p-3 font-bold">Society Name</th>
                <th className="p-3 font-bold">Total Expected (PKR)</th>
                <th className="p-3 font-bold">Collected (PKR)</th>
                <th className="p-3 font-bold">Overdue Amount (PKR)</th>
                <th className="p-3 font-bold">Defaulter Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {report.societyOverdueList.map((s, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition">
                  <td className="p-3 font-bold text-slate-900">{s.societyName}</td>
                  <td className="p-3 font-mono font-semibold">PKR {(s.totalDuePKR / 1000000).toFixed(1)}M</td>
                  <td className="p-3 font-mono font-bold text-emerald-700">PKR {(s.collectedPKR / 1000000).toFixed(1)}M</td>
                  <td className="p-3 font-mono font-bold text-rose-700">PKR {(s.overduePKR / 1000000).toFixed(1)}M</td>
                  <td className="p-3 font-bold text-slate-800">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] ${s.defaulterRate > 5.5 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
                      {s.defaulterRate}%
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
