import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend 
} from 'recharts';
import { PropertyTypeSalesPoint, RegionalSalesPoint } from '../../services/analyticsService';
import { PieChart as PieIcon, MapPin } from 'lucide-react';

interface PropertyTypePieChartProps {
  propertyTypeData: PropertyTypeSalesPoint[];
  regionalData: RegionalSalesPoint[];
}

const REGION_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

export const PropertyTypePieChart: React.FC<PropertyTypePieChartProps> = ({
  propertyTypeData,
  regionalData
}) => {
  const [activeTab, setActiveTab] = useState<'propertyType' | 'region'>('propertyType');

  return (
    <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-50 text-purple-700">
              <PieIcon className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Product & Regional Sales Mix
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Portfolio distribution by property categorization and geographic districts.
          </p>
        </div>

        <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('propertyType')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
              activeTab === 'propertyType' 
                ? 'bg-white text-purple-900 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Property Type
          </button>
          <button
            onClick={() => setActiveTab('region')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
              activeTab === 'region' 
                ? 'bg-white text-purple-900 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            City / Region
          </button>
        </div>
      </div>

      {/* Donut / Pie Chart */}
      <div className="h-72 w-full pt-1 flex flex-col sm:flex-row items-center">
        <div className="h-full w-full sm:w-3/5">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    const name = activeTab === 'propertyType' ? data.type : data.region;
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-xl border border-slate-700 text-xs space-y-1">
                        <div className="font-bold text-slate-200 border-b border-slate-800 pb-1">
                          {name}
                        </div>
                        <div className="text-purple-300 font-extrabold text-sm">
                          Volume: PKR {(data.volumePKR).toLocaleString()}
                        </div>
                        <div className="text-slate-300 flex items-center justify-between gap-4 text-[11px]">
                          <span>Units Sold:</span>
                          <span className="text-white font-bold">{data.unitsSold}</span>
                        </div>
                        <div className="text-slate-300 flex items-center justify-between gap-4 text-[11px]">
                          <span>Share:</span>
                          <span className="text-emerald-400 font-bold">{data.sharePercent}%</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {activeTab === 'propertyType' ? (
                <Pie
                  data={propertyTypeData}
                  dataKey="volumePKR"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={3}
                >
                  {propertyTypeData.map((entry, index) => (
                    <Cell key={`cell-prop-${index}`} fill={entry.fill || REGION_COLORS[index % REGION_COLORS.length]} />
                  ))}
                </Pie>
              ) : (
                <Pie
                  data={regionalData}
                  dataKey="volumePKR"
                  nameKey="region"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={3}
                >
                  {regionalData.map((entry, index) => (
                    <Cell key={`cell-reg-${index}`} fill={REGION_COLORS[index % REGION_COLORS.length]} />
                  ))}
                </Pie>
              )}
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Custom Legend List */}
        <div className="w-full sm:w-2/5 space-y-2 text-xs pt-2 sm:pt-0">
          {activeTab === 'propertyType' ? (
            propertyTypeData.map((item, idx) => (
              <div 
                key={item.type} 
                className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 transition"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span 
                    className="w-2.5 h-2.5 rounded-full shrink-0" 
                    style={{ backgroundColor: item.fill || REGION_COLORS[idx % REGION_COLORS.length] }} 
                  />
                  <span className="truncate text-slate-800 font-medium text-[11px]">{item.type}</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-bold text-slate-900 text-xs">{item.sharePercent}%</span>
                  <span className="text-[10px] text-slate-400 block">{item.unitsSold} units</span>
                </div>
              </div>
            ))
          ) : (
            regionalData.map((item, idx) => (
              <div 
                key={item.region} 
                className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 transition"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span 
                    className="w-2.5 h-2.5 rounded-full shrink-0" 
                    style={{ backgroundColor: REGION_COLORS[idx % REGION_COLORS.length] }} 
                  />
                  <span className="truncate text-slate-800 font-medium text-[11px]">{item.region}</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-bold text-slate-900 text-xs">{item.sharePercent}%</span>
                  <span className="text-[10px] text-slate-400 block">{item.unitsSold} units</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};
