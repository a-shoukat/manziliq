import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend,
  Cell
} from 'recharts';
import { SocietySalesPoint } from '../../services/analyticsService';
import { Building2, Layers } from 'lucide-react';

interface SocietyRevenueBarChartProps {
  data: SocietySalesPoint[];
}

const BAR_COLORS = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6'];

export const SocietyRevenueBarChart: React.FC<SocietyRevenueBarChartProps> = ({ data }) => {
  const [metric, setMetric] = useState<'volume' | 'units'>('volume');

  const formatPKRMillions = (val: number) => {
    return `PKR ${(val / 1000000).toFixed(1)}M`;
  };

  return (
    <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <Building2 className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Sales Volume by Housing Society
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Comparative performance across Punjab housing developments.
          </p>
        </div>

        <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200 self-start sm:self-auto">
          <button
            onClick={() => setMetric('volume')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
              metric === 'volume' 
                ? 'bg-white text-emerald-900 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Volume (PKR)
          </button>
          <button
            onClick={() => setMetric('units')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
              metric === 'units' 
                ? 'bg-white text-emerald-900 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Units Sold
          </button>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={data} 
            layout="vertical"
            margin={{ top: 10, right: 20, left: 40, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
            <XAxis 
              type="number" 
              tick={{ fill: '#64748b', fontSize: 11 }} 
              axisLine={{ stroke: '#cbd5e1' }}
              tickLine={false}
              tickFormatter={metric === 'volume' ? formatPKRMillions : (v) => `${v}`}
            />
            <YAxis 
              dataKey="societyName" 
              type="category" 
              width={140}
              tick={{ fill: '#334155', fontSize: 10.5, fontWeight: 600 }} 
              axisLine={{ stroke: '#cbd5e1' }}
              tickLine={false}
              tickFormatter={(name) => name.length > 20 ? name.slice(0, 18) + '...' : name}
            />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload as SocietySalesPoint;
                  return (
                    <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-xl border border-slate-700 text-xs space-y-1.5 min-w-[200px]">
                      <div className="font-bold text-white border-b border-slate-800 pb-1">
                        {d.societyName}
                      </div>
                      <div className="text-emerald-400 font-extrabold text-sm">
                        Gross Volume: PKR {d.volumePKR.toLocaleString()}
                      </div>
                      <div className="text-slate-300 flex items-center justify-between text-[11px]">
                        <span>City / Area:</span>
                        <span className="text-white font-semibold">{d.city}</span>
                      </div>
                      <div className="text-slate-300 flex items-center justify-between text-[11px]">
                        <span>Units Sold:</span>
                        <span className="text-emerald-300 font-semibold">{d.unitsSold} plots</span>
                      </div>
                      <div className="text-slate-300 flex items-center justify-between text-[11px]">
                        <span>Platform Market Share:</span>
                        <span className="text-cyan-300 font-bold">{d.sharePercent}%</span>
                      </div>
                      <div className="text-slate-300 flex items-center justify-between text-[11px]">
                        <span>Avg Ticket Size:</span>
                        <span className="text-indigo-300 font-semibold">PKR {d.avgTicketPKR.toLocaleString()}</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar 
              dataKey={metric === 'volume' ? 'volumePKR' : 'unitsSold'} 
              radius={[0, 8, 8, 0]}
              barSize={20}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Society Mini Badges */}
      <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
        {data.map((s, idx) => (
          <div 
            key={s.societyId}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-700"
          >
            <span 
              className="w-2.5 h-2.5 rounded-full shrink-0" 
              style={{ backgroundColor: BAR_COLORS[idx % BAR_COLORS.length] }} 
            />
            <span className="font-semibold">{s.societyName.split(' ')[0]}</span>
            <span className="text-slate-400 font-mono">({s.sharePercent}%)</span>
          </div>
        ))}
      </div>

    </div>
  );
};
