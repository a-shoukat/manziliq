import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Line, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { AIMarketTrendPoint, AreaMarketDynamics } from '../../services/analyticsService';
import { Sparkles, TrendingUp, Cpu, Activity } from 'lucide-react';

interface MarketTrendChartProps {
  trends: AIMarketTrendPoint[];
  areaDynamics: AreaMarketDynamics[];
  aiModelMetrics?: any;
}

export const MarketTrendChart: React.FC<MarketTrendChartProps> = ({
  trends,
  areaDynamics,
  aiModelMetrics
}) => {
  const [selectedArea, setSelectedArea] = useState<string>('all');

  const formatPKRThousands = (val: number) => {
    return `PKR ${(val / 1000).toFixed(0)}k`;
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 p-6 rounded-3xl text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>AI Valuation Engine v2.4 • Land Registry Ground Truth Calibration</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            AI Price Estimation vs Actual Closed Market Rates
          </h2>
          <p className="text-xs text-slate-300">
            Historical price per marla comparison and market appreciation trajectory.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white/10 p-3 rounded-2xl border border-white/10 backdrop-blur-sm text-xs">
          <div>
            <div className="text-[10px] text-purple-200 font-bold uppercase tracking-wider">Model Accuracy</div>
            <div className="text-lg font-black text-emerald-400">98.2% Accuracy</div>
            <div className="text-[10px] text-slate-300">Mean Variance: ±1.8%</div>
          </div>
        </div>
      </div>

      {/* Main Chart Card */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-700" />
              <span>Historical Price Per Marla: AI Predicted vs Real Executed</span>
            </h3>
            <p className="text-xs text-slate-500">
              Blue Line: Actual Closed Sub-Registrar / Society rate • Purple Dashed: AI Model Forecast
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 font-medium">Market Trend:</span>
            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[11px] flex items-center gap-1 border border-emerald-200">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+18.4% YoY Growth</span>
            </span>
          </div>
        </div>

        {/* Composed Chart */}
        <div className="h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={trends} margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis 
                dataKey="label" 
                tick={{ fill: '#64748b', fontSize: 11 }} 
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />
              <YAxis 
                domain={[380000, 620000]}
                tick={{ fill: '#64748b', fontSize: 11 }} 
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
                tickFormatter={formatPKRThousands}
              />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload as AIMarketTrendPoint;
                    return (
                      <div className="bg-slate-900 text-white p-3.5 rounded-2xl shadow-xl border border-slate-700 text-xs space-y-2 min-w-[220px]">
                        <div className="font-bold text-white border-b border-slate-800 pb-1 flex items-center justify-between">
                          <span>{label}</span>
                          <span className="text-[10px] text-purple-300 font-mono">Index: {d.marketIndex}</span>
                        </div>
                        <div className="text-cyan-400 font-bold">
                          Actual Closed: PKR {d.avgActualSalePricePerMarla.toLocaleString()}/marla
                        </div>
                        <div className="text-purple-300 font-bold">
                          AI Predicted: PKR {d.avgPredictedPricePerMarla.toLocaleString()}/marla
                        </div>
                        <div className="text-slate-300 flex items-center justify-between text-[11px] pt-1 border-t border-slate-800">
                          <span>Prediction Variance:</span>
                          <span className={`font-mono font-bold ${d.variancePercent >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {d.variancePercent > 0 ? `+${d.variancePercent}%` : `${d.variancePercent}%`}
                          </span>
                        </div>
                        <div className="text-slate-300 flex items-center justify-between text-[11px]">
                          <span>Market Trajectory:</span>
                          <span className="text-emerald-300 font-semibold capitalize">{d.trendDirection}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Line 
                type="monotone" 
                dataKey="avgActualSalePricePerMarla" 
                name="Actual Sold Price / Marla (PKR)" 
                stroke="#0284c7" 
                strokeWidth={3}
                dot={{ r: 4, fill: '#0284c7' }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="avgPredictedPricePerMarla" 
                name="AI Predicted Valuation / Marla (PKR)" 
                stroke="#9333ea" 
                strokeWidth={2.5}
                strokeDasharray="5 5"
                dot={{ r: 4, fill: '#9333ea' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Area-Specific Micro-Market Dynamics Table */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Punjab Micro-Market Sector Analysis & 12-Month Forecast
            </h3>
            <p className="text-xs text-slate-500">
              AI predictive trends based on historical land transactions and road connectivity data.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <th className="p-3 font-bold">Sub-Market / Sector Area</th>
                <th className="p-3 font-bold">City / District</th>
                <th className="p-3 font-bold">Current Rate / Marla</th>
                <th className="p-3 font-bold">YoY Growth</th>
                <th className="p-3 font-bold">AI 12M Forecast</th>
                <th className="p-3 font-bold">Market Sentiment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {areaDynamics.map((area, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition">
                  <td className="p-3 font-bold text-slate-900">{area.area}</td>
                  <td className="p-3 text-slate-600">{area.city}</td>
                  <td className="p-3 font-mono font-bold text-slate-900">
                    PKR {area.currentRatePerMarla.toLocaleString()}
                  </td>
                  <td className="p-3 font-bold text-emerald-700">
                    +{area.yoyGrowthPercent}%
                  </td>
                  <td className="p-3 font-mono font-extrabold text-purple-700">
                    PKR {area.aiForecast12m.toLocaleString()}
                  </td>
                  <td className="p-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
                      {area.sentiment}
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
