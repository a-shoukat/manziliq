import React, { useState } from 'react';
import { SocietyPerformanceMetric } from '../../services/analyticsService';
import { Building2, Award, Clock, ArrowUpRight, Download, Search } from 'lucide-react';

interface SocietyPerformanceTableProps {
  societies: SocietyPerformanceMetric[];
  onExportCSV?: () => void;
}

export const SocietyPerformanceTable: React.FC<SocietyPerformanceTableProps> = ({
  societies,
  onExportCSV
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSociety, setSelectedSociety] = useState<SocietyPerformanceMetric | null>(null);

  const filtered = societies.filter(s => 
    s.societyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
      
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-700" />
            <span>Society Sell-Through & Velocity Breakdown</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Inventory absorption metrics, average turnaround time to closing, and dealer production.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search society or city..."
              className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-indigo-600"
            />
          </div>

          {onExportCSV && (
            <button
              onClick={onExportCSV}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Table</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <th className="p-3 font-bold">Housing Society</th>
              <th className="p-3 font-bold">Location</th>
              <th className="p-3 font-bold">Plots Sold / Total</th>
              <th className="p-3 font-bold">Sell-Through (%)</th>
              <th className="p-3 font-bold">Total Sales Volume</th>
              <th className="p-3 font-bold">Avg Time-to-Sale</th>
              <th className="p-3 font-bold">Top Dealer</th>
              <th className="p-3 font-bold text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((s) => {
              const topDealer = s.topDealers[0];
              return (
                <tr key={s.societyId} className="hover:bg-slate-50/70 transition">
                  <td className="p-3 font-bold text-slate-900">
                    {s.societyName}
                  </td>
                  <td className="p-3 text-slate-600">
                    {s.city}
                  </td>
                  <td className="p-3 font-mono">
                    <span className="font-bold text-emerald-700">{s.soldPlots}</span>
                    <span className="text-slate-400"> / {s.totalPlots}</span>
                  </td>
                  <td className="p-3">
                    <div className="space-y-1 w-28">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-indigo-900">{s.sellThroughRatePercent}%</span>
                        <span className="text-slate-400">{s.availablePlots} left</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-indigo-600 h-1.5 rounded-full" 
                          style={{ width: `${Math.min(s.sellThroughRatePercent, 100)}%` }} 
                        />
                      </div>
                    </div>
                  </td>
                  <td className="p-3 font-mono font-bold text-slate-900">
                    PKR {(s.totalSalesVolumePKR / 1000000).toFixed(1)}M
                  </td>
                  <td className="p-3">
                    <span className="inline-flex items-center gap-1 text-slate-700 font-semibold">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{s.avgTimeToSaleDays} days</span>
                    </span>
                  </td>
                  <td className="p-3">
                    {topDealer ? (
                      <div className="flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <div>
                          <div className="font-semibold text-slate-900">{topDealer.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">({topDealer.salesCount} deals • PKR {(topDealer.volumePKR / 1000000).toFixed(1)}M)</div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-400">Direct Society</span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => setSelectedSociety(s)}
                      className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[11px] font-bold transition cursor-pointer"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Society Detail Modal */}
      {selectedSociety && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-slate-200 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">Society Performance Brief</span>
                <h3 className="text-base font-bold text-slate-900">{selectedSociety.societyName}</h3>
                <span className="text-slate-500 text-[11px]">{selectedSociety.city}</span>
              </div>
              <button 
                onClick={() => setSelectedSociety(null)} 
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <div>
                <span className="text-slate-500 block text-[10px]">Total Masterplan Plots:</span>
                <strong className="text-slate-900 text-sm">{selectedSociety.totalPlots} Plots</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Total Closed Sales:</span>
                <strong className="text-emerald-700 text-sm">{selectedSociety.soldPlots} Units ({selectedSociety.sellThroughRatePercent}%)</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Available Inventory:</span>
                <strong className="text-slate-700 text-sm">{selectedSociety.availablePlots} Plots</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Avg Days to Closing:</span>
                <strong className="text-indigo-700 text-sm">{selectedSociety.avgTimeToSaleDays} Days</strong>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Authorized Dealer Leaderboard for this Society</span>
              </h4>
              <div className="space-y-1.5">
                {selectedSociety.topDealers.map((d, i) => (
                  <div key={i} className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 block">{d.name}</span>
                      <span className="text-[10px] text-slate-500">{d.salesCount} Verified Customer Closings</span>
                    </div>
                    <span className="font-mono font-bold text-emerald-800 text-xs">
                      PKR {(d.volumePKR / 1000000).toFixed(1)}M
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedSociety(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
