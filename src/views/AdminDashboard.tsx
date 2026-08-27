import React, { useState } from 'react';
import { User, Property, Society, Booking } from '../types';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { 
  ShieldCheck, 
  Users, 
  Building2, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Search,
  DollarSign
} from 'lucide-react';

interface AdminDashboardProps {
  users: User[];
  properties: Property[];
  societies: Society[];
  bookings: Booking[];
  onToggleUserStatus: (userId: string) => void;
  onApproveProperty: (propId: string) => void;
  onRejectProperty: (propId: string) => void;
}

const SALES_CHART_DATA = [
  { month: 'Jan', salesPKR: 12.5, bookings: 14 },
  { month: 'Feb', salesPKR: 18.2, bookings: 22 },
  { month: 'Mar', salesPKR: 15.0, bookings: 19 },
  { month: 'Apr', salesPKR: 24.8, bookings: 31 },
  { month: 'May', salesPKR: 32.0, bookings: 40 },
  { month: 'Jun', salesPKR: 28.5, bookings: 36 },
  { month: 'Jul', salesPKR: 42.0, bookings: 54 },
  { month: 'Aug', salesPKR: 48.5, bookings: 62 }
];

const SOCIETY_PIE_DATA = [
  { name: 'Al-Rehman Garden', value: 45, color: '#f59e0b' },
  { name: 'Royal Orchard', value: 30, color: '#10b981' },
  { name: 'Model Town', value: 18, color: '#3b82f6' },
  { name: 'Executive Enclave', value: 7, color: '#6366f1' }
];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  users,
  properties,
  societies,
  bookings,
  onToggleUserStatus,
  onApproveProperty,
  onRejectProperty
}) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'users' | 'moderation' | 'fraud'>('analytics');
  const [userSearch, setUserSearch] = useState('');

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.role.toLowerCase().includes(userSearch.toLowerCase())
  );

  const pendingProperties = properties.filter(p => p.status === 'pending');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 text-slate-900 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-indigo-100 text-indigo-900 font-bold text-xs px-2.5 py-0.5 rounded border border-indigo-200">
                Platform Super Admin
              </span>
              <span className="text-slate-500 text-xs">MANZILIQ Platform Governance</span>
            </div>
            <h2 className="text-2xl font-black font-[Outfit] text-slate-900 mt-1">Platform Analytics & Moderation Portal</h2>
            <p className="text-xs text-slate-500">Monitor all verified housing societies, onboard dealers, and review fraud flags.</p>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl text-xs font-bold border border-slate-200">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'analytics' ? 'bg-amber-500 text-slate-950 shadow-xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              System Analytics
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'users' ? 'bg-amber-500 text-slate-950 shadow-xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              User Management ({users.length})
            </button>

            <button
              onClick={() => setActiveTab('moderation')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'moderation' ? 'bg-amber-500 text-slate-950 shadow-xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Listing Queue ({pendingProperties.length})
            </button>
          </div>
        </div>

        {/* Global Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs pt-1">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="text-slate-500 text-[10px] block font-bold">Total Platform Users</span>
            <span className="text-xl font-black text-slate-900 block mt-0.5 font-[Outfit]">{users.length} Users</span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="text-slate-500 text-[10px] block font-bold">Verified Societies</span>
            <span className="text-xl font-black text-emerald-700 block mt-0.5 font-[Outfit]">{societies.length} Active</span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="text-slate-500 text-[10px] block font-bold">Total Platform Bookings</span>
            <span className="text-xl font-black text-amber-700 block mt-0.5 font-[Outfit]">{bookings.length} Booked</span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="text-slate-500 text-[10px] block font-bold">Gross Transaction Vol</span>
            <span className="text-xl font-black text-amber-800 block mt-0.5 font-[Outfit]">PKR 124.8M</span>
          </div>
        </div>
      </div>

      {/* Tab 1: System Analytics */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Sales Trend Chart (8 Cols) */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-base font-[Outfit] text-slate-900">Platform Monthly Gross Sales (PKR Millions)</h3>
                <p className="text-xs text-slate-500">2026 Monthly transaction volume log across verified societies</p>
              </div>

              <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg">
                +38% MoM Growth
              </span>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={SALES_CHART_DATA}>
                  <defs>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                    formatter={(val: any) => [`PKR ${val} Million`, 'Gross Sales']}
                  />
                  <Area type="monotone" dataKey="salesPKR" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#salesGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Society Distribution Pie Chart (4 Cols) */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-base font-[Outfit] text-slate-900 border-b border-slate-100 pb-3">
              Society Inventory Share
            </h3>

            <div className="h-56 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={SOCIETY_PIE_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {SOCIETY_PIE_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-1.5 text-xs font-semibold text-slate-700">
              {SOCIETY_PIE_DATA.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span>{item.name}</span>
                  </div>
                  <span className="font-mono text-slate-900">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Tab 2: User Management */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-base font-[Outfit] text-slate-900">Platform Registered Users</h3>

            <input
              type="text"
              placeholder="Search users..."
              value={userSearch}
              onChange={e => setUserSearch(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                  <th className="p-3">User Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Moderation Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-bold text-slate-900">{u.name}</td>
                    <td className="p-3 text-slate-600">{u.email}</td>
                    <td className="p-3 text-slate-600 font-mono">{u.phone}</td>
                    <td className="p-3 uppercase text-[10px] font-bold text-amber-700">
                      {u.role.replace('_', ' ')}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.verified ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {u.verified ? 'Verified Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => onToggleUserStatus(u.id)}
                        className={`px-2.5 py-1 rounded text-[10px] font-bold transition-colors ${
                          u.verified ? 'bg-rose-100 text-rose-700 hover:bg-rose-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                        }`}
                      >
                        {u.verified ? 'Suspend User' : 'Activate User'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Property Moderation Queue */}
      {activeTab === 'moderation' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-base font-[Outfit] text-slate-900 border-b border-slate-100 pb-3">
            Property Submissions Approval Queue ({pendingProperties.length})
          </h3>

          {pendingProperties.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="font-bold text-slate-800">Moderation Queue is Clean!</p>
              <p>All property submissions have been reviewed & published.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingProperties.map(p => (
                <div key={p.id} className="p-4 border border-slate-200 rounded-xl flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{p.title}</h4>
                    <p className="text-xs text-slate-500">{p.location} • PKR {p.pricePKR.toLocaleString('en-PK')}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onApproveProperty(p.id)}
                      className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs"
                    >
                      Approve & Publish
                    </button>
                    <button
                      onClick={() => onRejectProperty(p.id)}
                      className="bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold px-3 py-1.5 rounded-lg text-xs"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
