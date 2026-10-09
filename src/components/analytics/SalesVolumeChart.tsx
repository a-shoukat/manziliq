import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { SalesTimeSeriesPoint } from '../../services/analyticsService';
import { TrendingUp, BarChart2, DollarSign } from 'lucide-react';

interface SalesVolumeChartProps {
  data: SalesTimeSeriesPoint[];
  onExportCSV?: () => void;
}

export const SalesVolumeChart: React.FC<SalesVolumeChartProps> = ({ data, onExportCSV }) => {
  const [viewMetric, setViewMetric] = useState<'volume' | 'units'>('volume');

  const formatPKRMillions = (val: number) => {
    return `PKR ${(val / 1000000).toFixed(1)}M`;
  };

  return (
    <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Total Platform Sales Volume Over Time
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Monthly & Quarterly gross merchandise volume (GMV) and transaction velocity.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
            <button
              onClick={() => setViewMetric('volume')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1 ${
                viewMetric === 'volume' 
                  ? 'bg-white text-indigo-900 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Volume (PKR)</span>
            </button>
            <button
              onClick={() => setViewMetric('units')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1 ${
                viewMetric === 'units' 
                  ? 'bg-white text-indigo-900 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Units Sold</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recharts Area Chart */}
      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="salesVolumeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="tokenAdvanceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="unitsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis 
              dataKey="period" 
              tick={{ fill: '#64748b', fontSize: 11 }} 
              axisLine={{ stroke: '#cbd5e1' }}
              tickLine={false}
            />
            <YAxis 
              tick={{ fill: '#64748b', fontSize: 11 }} 
              axisLine={{ stroke: '#cbd5e1' }}
              tickLine={false}
              tickFormatter={viewMetric === 'volume' ? formatPKRMillions : (val) => `${val} units`}
            />
            <Tooltip 
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload as SalesTimeSeriesPoint;
                  return (
                    <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-xl border border-slate-700 text-xs space-y-1.5">
                      <div className="font-bold text-slate-200 border-b border-slate-800 pb-1 flex items-center justify-between gap-4">
                        <span>{label}</span>
                        <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded-full text-indigo-300 font-mono">{d.quarter}</span>
                      </div>
                      <div className="text-emerald-400 font-extrabold text-sm">
                        Gross Volume: PKR {(d.volumePKR).toLocaleString()}
                      </div>
                      <div className="text-slate-300 flex items-center justify-between gap-3 text-[11px]">
                        <span>Units Sold:</span>
                        <strong className="text-white">{d.unitsSold} plots/units</strong>
                      </div>
                      <div className="text-slate-300 flex items-center justify-between gap-3 text-[11px]">
                        <span>Avg Ticket Size:</span>
                        <strong className="text-indigo-300">PKR {d.avgPricePKR.toLocaleString()}</strong>
                      </div>
                      <div className="text-slate-300 flex items-center justify-between gap-3 text-[11px]">
                        <span>Token Advances:</span>
                        <strong className="text-cyan-300">PKR {d.tokenAdvancePKR.toLocaleString()}</strong>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend 
              wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
            />
            {viewMetric === 'volume' ? (
              <>
                <Area 
                  type="monotone" 
                  dataKey="volumePKR" 
                  name="Gross Sales Volume (PKR)" 
                  stroke="#4f46e5" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#salesVolumeGradient)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="tokenAdvancePKR" 
                  name="Token Advance Volume (PKR)" 
                  stroke="#06b6d4" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#tokenAdvanceGradient)" 
                />
              </>
            ) : (
              <Area 
                type="monotone" 
                dataKey="unitsSold" 
                name="Total Units Sold" 
                stroke="#10b981" 
                strokeWidth={2.5}
                fillOpacity={1} 
                fill="url(#unitsGradient)" 
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Quick Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 text-xs">
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
          <span className="text-[10px] text-slate-500 font-semibold block">Total Period Volume</span>
          <span className="text-sm font-extrabold text-slate-900">
            PKR {(data.reduce((a, c) => a + c.volumePKR, 0) / 1000000).toFixed(1)}M
          </span>
        </div>
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
          <span className="text-[10px] text-slate-500 font-semibold block">Total Units Sold</span>
          <span className="text-sm font-extrabold text-emerald-700">
            {data.reduce((a, c) => a + c.unitsSold, 0)} Units
          </span>
        </div>
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
          <span className="text-[10px] text-slate-500 font-semibold block">Avg Monthly Run Rate</span>
          <span className="text-sm font-extrabold text-indigo-700">
            PKR {(data.reduce((a, c) => a + c.volumePKR, 0) / (data.length || 1) / 1000000).toFixed(1)}M/mo
          </span>
        </div>
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
          <span className="text-[10px] text-slate-500 font-semibold block">Growth Rate (QoQ)</span>
          <span className="text-sm font-extrabold text-teal-700">
            +18.6% Appreciating
          </span>
        </div>
      </div>

    </div>
  );
};
