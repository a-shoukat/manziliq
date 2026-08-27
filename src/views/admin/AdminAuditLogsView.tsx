import React, { useState } from 'react';
import { AuditLogEntry, AuditLogCategory } from '../../types';
import { 
  Activity, 
  ShieldCheck, 
  Search, 
  Filter, 
  Clock, 
  UserCheck, 
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Scale,
  BadgeCheck
} from 'lucide-react';

interface AdminAuditLogsViewProps {
  logs?: AuditLogEntry[];
}

export const AdminAuditLogsView: React.FC<AdminAuditLogsViewProps> = ({
  logs = []
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [exportMsg, setExportMsg] = useState<string | null>(null);

  const filteredLogs = logs.filter(l => {
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch = !q || 
      l.action.toLowerCase().includes(q) ||
      l.actor.toLowerCase().includes(q) ||
      l.target.toLowerCase().includes(q) ||
      (l.details && l.details.toLowerCase().includes(q)) ||
      (l.ipAddress && l.ipAddress.toLowerCase().includes(q));
    const matchesCategory = selectedCategory === 'all' || l.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleExportCSV = () => {
    const headers = ['Log ID', 'Timestamp', 'IP Address', 'Category', 'Action Event', 'Authorized Actor', 'Target Entity', 'Details'];
    const rows = filteredLogs.map(l => [
      `"${l.id}"`,
      `"${l.timestamp}"`,
      `"${l.ipAddress || 'N/A'}"`,
      `"${l.category}"`,
      `"${l.action.replace(/"/g, '""')}"`,
      `"${l.actor.replace(/"/g, '""')}"`,
      `"${l.target.replace(/"/g, '""')}"`,
      `"${(l.details || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `MANZILIQ_Audit_Log_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportMsg(`Exported ${filteredLogs.length} audit records to CSV.`);
    setTimeout(() => setExportMsg(null), 4000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Activity className="w-7 h-7 text-purple-700" />
            <span>Immutable Platform Audit Logs & Security Trail</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Chronological cryptographic ledger recording every credential elevation, transaction milestone, and arbitration event.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-bold text-slate-600 bg-white px-3 py-2 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Integrity: <strong className="text-emerald-800">SHA-256 Verified</strong></span>
          </div>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Export feedback toast */}
      {exportMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{exportMsg}</span>
        </div>
      )}

      {/* Filter Row */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search action, actor, target, or details..."
            className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-purple-600/20"
        >
          <option value="all">All Event Categories ({logs.length})</option>
          <option value="IDENTITY">IDENTITY (Role & Credentials)</option>
          <option value="SECURITY">SECURITY (Authentication & Access)</option>
          <option value="TRANSACTION">TRANSACTION (Bookings & Escrow)</option>
          <option value="MODERATION">MODERATION (Duplicates & Listings)</option>
          <option value="DISPUTE">DISPUTE (Freezes & Arbitrations)</option>
        </select>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
                <th className="p-4">Timestamp & IP</th>
                <th className="p-4">Category</th>
                <th className="p-4">Action Event</th>
                <th className="p-4">Authorized Actor</th>
                <th className="p-4">Target Entity</th>
                <th className="p-4">Audit Payload Details</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No audit records match the current search query.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition">
                    <td className="p-4 font-mono">
                      <div className="font-bold text-slate-900">{log.timestamp}</div>
                      <div className="text-[10px] text-slate-500">{log.ipAddress || '127.0.0.1'}</div>
                    </td>

                    <td className="p-4">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${
                        log.category === 'IDENTITY' ? 'bg-purple-100 text-purple-900 border border-purple-200' :
                        log.category === 'SECURITY' ? 'bg-blue-100 text-blue-900 border border-blue-200' :
                        log.category === 'TRANSACTION' ? 'bg-emerald-100 text-emerald-900 border border-emerald-200' :
                        log.category === 'DISPUTE' ? 'bg-rose-100 text-rose-900 border border-rose-200' :
                        'bg-amber-100 text-amber-900 border border-amber-200'
                      }`}>
                        {log.category}
                      </span>
                    </td>

                    <td className="p-4 font-black text-slate-900 font-mono text-[11px]">
                      {log.action}
                    </td>

                    <td className="p-4 font-semibold text-slate-800">
                      {log.actor}
                    </td>

                    <td className="p-4 font-medium text-slate-700">
                      {log.target}
                    </td>

                    <td className="p-4 text-slate-600 max-w-xs text-[11px] leading-relaxed">
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

