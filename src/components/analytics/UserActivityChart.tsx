import React from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { UserActivityReport } from '../../services/analyticsService';
import { Users, UserCheck, Eye, MessageSquare, Calendar, Activity } from 'lucide-react';

interface UserActivityChartProps {
  userActivity: UserActivityReport;
}

export const UserActivityChart: React.FC<UserActivityChartProps> = ({ userActivity }) => {
  return (
    <div className="space-y-6">
      
      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Registered Users</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{userActivity.totalUsers.toLocaleString()}</div>
            <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">+{userActivity.userGrowthTimeSeries[userActivity.userGrowthTimeSeries.length - 1]?.newBuyers} this month</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Dealer Accounts</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{userActivity.activeDealersCount} Active</div>
            <div className="text-[11px] text-slate-500 mt-0.5">{userActivity.inactiveDealersCount} inactive / pending renewal</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Inquiries & Leads</div>
            <div className="text-2xl font-black text-indigo-950 mt-1">{userActivity.buyerEngagementMetrics.inquiriesSubmitted}</div>
            <div className="text-[11px] text-indigo-700 font-semibold mt-0.5">Avg response: {userActivity.buyerEngagementMetrics.avgResponseTimeMinutes} mins</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
            <MessageSquare className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Site Visits Scheduled</div>
            <div className="text-2xl font-black text-amber-950 mt-1">{userActivity.buyerEngagementMetrics.siteVisitsScheduled}</div>
            <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">{userActivity.buyerEngagementMetrics.siteVisitsCompleted} completed ({userActivity.buyerEngagementMetrics.bookingConversionRate} conv.)</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* User Growth & Onboarding Chart */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-700" />
              <span>User Registration Velocity & Platform Growth</span>
            </h3>
            <p className="text-xs text-slate-500">
              Monthly acquisition of customer accounts vs authorized dealer registrations.
            </p>
          </div>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={userActivity.userGrowthTimeSeries} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis 
                dataKey="month" 
                tick={{ fill: '#64748b', fontSize: 11 }} 
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />
              <YAxis 
                tick={{ fill: '#64748b', fontSize: 11 }} 
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-xl border border-slate-700 text-xs space-y-1.5">
                        <div className="font-bold text-white border-b border-slate-800 pb-1">{label}</div>
                        <div className="text-blue-300 font-bold">New Buyer Accounts: {d.newBuyers}</div>
                        <div className="text-teal-300 font-bold">New Licensed Dealers: {d.newDealers}</div>
                        <div className="text-purple-300 text-[11px]">Active Portal Sessions: {d.activeSessions}</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="newBuyers" name="New Customer Registrations" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              <Bar dataKey="newDealers" name="New Licensed Dealers" fill="#0d9488" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Most Viewed Societies & Properties 2-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Most Viewed Societies */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-purple-700" />
              <span>Most Viewed Housing Societies</span>
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">Last 30 Days</span>
          </div>

          <div className="space-y-2.5">
            {userActivity.mostViewedSocieties.map((soc, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-bold text-slate-900">{soc.name}</div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-3 mt-0.5">
                    <span>{soc.inquiries} inquiries</span>
                    <span>•</span>
                    <span>{soc.siteVisits} visits</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-purple-800">{soc.views.toLocaleString()}</div>
                  <div className="text-[10px] text-slate-400">Views</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Most Viewed Properties */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-emerald-700" />
              <span>Top Viewed Property Listings</span>
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">High Engagement</span>
          </div>

          <div className="space-y-2.5">
            {userActivity.mostViewedProperties.map((prop, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between gap-3 text-xs">
                <div className="min-w-0">
                  <div className="font-bold text-slate-900 truncate">{prop.title}</div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                    <span className="text-indigo-700 font-semibold">{prop.society}</span>
                    <span>•</span>
                    <span className="font-mono font-bold text-slate-800">PKR {(prop.pricePKR / 100000).toFixed(1)} Lakh</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-black text-emerald-800">{prop.views.toLocaleString()}</div>
                  <div className="text-[10px] text-slate-400">{prop.inquiries} Inquiries</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
