import React, { useState } from 'react';
import { User, UserRole, UserStatus } from '../../types';
import { 
  Users, 
  ShieldCheck, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Ban, 
  Key, 
  Edit3, 
  Building2, 
  BadgeCheck, 
  UserCheck, 
  UserX, 
  Mail, 
  Phone, 
  FileText, 
  Download,
  Calendar,
  Briefcase,
  Layers,
  ArrowUpDown,
  Check,
  X
} from 'lucide-react';

interface AdminUsersManagementViewProps {
  users: User[];
  currentUser: User;
  onUpdateUserStatus: (userId: string, newStatus: UserStatus, reason?: string) => void;
  onUpdateUserRole: (userId: string, newRole: UserRole) => void;
  onNavigate: (route: string) => void;
  initialRoleFilter?: UserRole | 'all';
}

export const AdminUsersManagementView: React.FC<AdminUsersManagementViewProps> = ({
  users = [],
  currentUser,
  onUpdateUserStatus,
  onUpdateUserRole,
  onNavigate,
  initialRoleFilter = 'all'
}) => {
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>(initialRoleFilter);
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Selected user for inspection & edit modal
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editRoleModalOpen, setEditRoleModalOpen] = useState(false);
  const [targetRole, setTargetRole] = useState<UserRole>('buyer');
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filtered users
  const filteredUsers = users.filter(u => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (statusFilter !== 'all' && u.status !== statusFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      const matchName = u.name.toLowerCase().includes(q);
      const matchEmail = u.email.toLowerCase().includes(q);
      const matchPhone = u.phone?.toLowerCase().includes(q);
      const matchCnic = u.cnic?.toLowerCase().includes(q);
      const matchSociety = u.societyName?.toLowerCase().includes(q);
      const matchLicense = u.licenseNo?.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchPhone && !matchCnic && !matchSociety && !matchLicense) {
        return false;
      }
    }
    return true;
  });

  // Metric counts
  const countTotal = users.length;
  const countActive = users.filter(u => u.status === 'active').length;
  const countPending = users.filter(u => u.status === 'pending' || u.status === 'pending_verification').length;
  const countSuspended = users.filter(u => u.status === 'suspended').length;
  const countDealers = users.filter(u => u.role === 'dealer').length;
  const countSocietyAdmins = users.filter(u => u.role === 'society_admin').length;
  const countBuyers = users.filter(u => u.role === 'buyer' || u.role === 'public_buyer').length;

  const handleActivate = (u: User) => {
    onUpdateUserStatus(u.id, 'active');
    showToast(`Account for ${u.name} has been activated with full system permissions.`);
  };

  const handleOpenSuspendModal = (u: User) => {
    setSelectedUser(u);
    setSuspendReason('');
    setSuspendModalOpen(true);
  };

  const handleConfirmSuspend = () => {
    if (!selectedUser) return;
    onUpdateUserStatus(
      selectedUser.id, 
      'suspended', 
      suspendReason.trim() || 'Account suspended by Platform Super Admin for regulatory review.'
    );
    setSuspendModalOpen(false);
    showToast(`Account for ${selectedUser.name} has been suspended.`);
  };

  const handleOpenRoleModal = (u: User) => {
    setSelectedUser(u);
    setTargetRole(u.role);
    setEditRoleModalOpen(true);
  };

  const handleConfirmRoleChange = () => {
    if (!selectedUser) return;
    onUpdateUserRole(selectedUser.id, targetRole);
    setEditRoleModalOpen(false);
    showToast(`Role for ${selectedUser.name} updated to ${targetRole.replace('_', ' ').toUpperCase()}.`);
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-lg border border-slate-800 flex items-center justify-between text-xs font-semibold animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-purple-950 rounded-3xl p-6 sm:p-8 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            <span>Identity & Access Governance • RBAC Directory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            User Accounts & Dealer Management
          </h1>
          <p className="text-xs text-slate-300">
            Super Admin Authority: Audit, verify, elevate roles, and enforce security policies across all personas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onNavigate('/admin/verification-queue')}
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5"
          >
            <BadgeCheck className="w-4 h-4" />
            <span>Pending Queue ({countPending})</span>
          </button>
          <button
            onClick={() => onNavigate('/admin/audit-logs')}
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4" />
            <span>Audit Trail</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Accounts</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{countTotal}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">{countActive} active in ecosystem</div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Authorized Dealers</div>
          <div className="text-2xl font-black text-indigo-900 mt-1">{countDealers}</div>
          <div className="text-[11px] text-indigo-600 font-semibold mt-0.5">Excise Registered</div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Society Admins</div>
          <div className="text-2xl font-black text-purple-900 mt-1">{countSocietyAdmins}</div>
          <div className="text-[11px] text-purple-600 font-semibold mt-0.5">Township Custodians</div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Review Required</div>
          <div className="text-2xl font-black text-amber-700 mt-1">{countPending + countSuspended}</div>
          <div className="text-[11px] text-amber-600 font-semibold mt-0.5">{countPending} pending, {countSuspended} suspended</div>
        </div>
      </div>

      {/* Search & Filter Row */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, phone, CNIC, license number..."
            className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-purple-600/20"
          >
            <option value="all">All Roles ({countTotal})</option>
            <option value="buyer">Buyers ({countBuyers})</option>
            <option value="dealer">Authorized Dealers ({countDealers})</option>
            <option value="society_admin">Society Admins ({countSocietyAdmins})</option>
            <option value="super_admin">Super Admins</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-purple-600/20"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Accounts</option>
            <option value="pending">Pending Approval</option>
            <option value="suspended">Suspended Accounts</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Users Directory Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
                <th className="p-4">User Profile</th>
                <th className="p-4">Role Persona</th>
                <th className="p-4">Credentials / Org</th>
                <th className="p-4">Account Status</th>
                <th className="p-4">Registered</th>
                <th className="p-4 text-right">Administrative Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No user accounts match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isSelf = u.id === currentUser.id;
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/60 transition">
                      
                      {/* User Info */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={u.avatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100`}
                            alt={u.name}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200 bg-slate-100 shrink-0"
                          />
                          <div>
                            <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {u.verified && (
                                <BadgeCheck className="w-3.5 h-3.5 text-blue-600" title="Identity Verified" />
                              )}
                              {isSelf && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-purple-100 text-purple-800 font-bold">You</span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <Mail className="w-3 h-3 text-slate-400" />
                              <span>{u.email}</span>
                            </div>
                            {u.phone && (
                              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                                <Phone className="w-3 h-3 text-slate-400" />
                                <span>{u.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${
                          u.role === 'super_admin' ? 'bg-purple-100 text-purple-900 border border-purple-200' :
                          u.role === 'society_admin' ? 'bg-emerald-100 text-emerald-900 border border-emerald-200' :
                          u.role === 'dealer' ? 'bg-indigo-100 text-indigo-900 border border-indigo-200' :
                          'bg-slate-100 text-slate-800 border border-slate-200'
                        }`}>
                          {u.role === 'super_admin' && <ShieldCheck className="w-3 h-3 text-purple-700" />}
                          {u.role === 'society_admin' && <Building2 className="w-3 h-3 text-emerald-700" />}
                          {u.role === 'dealer' && <Briefcase className="w-3 h-3 text-indigo-700" />}
                          {u.role === 'buyer' && <Users className="w-3 h-3 text-slate-600" />}
                          <span>{u.role.replace('_', ' ')}</span>
                        </span>
                      </td>

                      {/* Credentials / Organization */}
                      <td className="p-4">
                        <div className="space-y-0.5">
                          {u.cnic && (
                            <div className="text-[11px] font-mono text-slate-700">
                              CNIC: <strong>{u.cnic}</strong>
                            </div>
                          )}
                          {u.licenseNo && (
                            <div className="text-[11px] text-indigo-700 font-semibold">
                              License: {u.licenseNo}
                            </div>
                          )}
                          {u.societyName && (
                            <div className="text-[11px] text-emerald-800 font-medium">
                              Society: {u.societyName}
                            </div>
                          )}
                          {!u.cnic && !u.licenseNo && !u.societyName && (
                            <span className="text-slate-400 italic text-[11px]">Standard Public Buyer</span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${
                          u.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          u.status === 'suspended' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                          u.status === 'rejected' ? 'bg-slate-100 text-slate-600 border border-slate-200' :
                          'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {u.status === 'active' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                          {u.status === 'suspended' && <Ban className="w-3 h-3 text-rose-600" />}
                          {u.status === 'pending' && <AlertTriangle className="w-3 h-3 text-amber-600" />}
                          <span className="capitalize">{u.status.replace('_', ' ')}</span>
                        </span>
                      </td>

                      {/* Created At */}
                      <td className="p-4 text-slate-500 font-mono text-[11px]">
                        {u.createdAt || u.created_at || '2026-01-15'}
                      </td>

                      {/* Administrative Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          
                          {/* Role edit button */}
                          <button
                            onClick={() => handleOpenRoleModal(u)}
                            disabled={isSelf}
                            title={isSelf ? "Cannot change your own role" : "Modify user role"}
                            className="p-1.5 bg-slate-100 hover:bg-purple-100 text-slate-700 hover:text-purple-900 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          >
                            <Key className="w-3.5 h-3.5" />
                          </button>

                          {/* Suspend / Activate toggle */}
                          {u.status === 'active' ? (
                            <button
                              onClick={() => handleOpenSuspendModal(u)}
                              disabled={isSelf}
                              title={isSelf ? "Cannot suspend yourself" : "Suspend user account"}
                              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-lg text-[11px] transition border border-rose-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
                            >
                              <Ban className="w-3 h-3" />
                              <span>Suspend</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleActivate(u)}
                              title="Activate user account"
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold rounded-lg text-[11px] transition border border-emerald-200 cursor-pointer flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Activate</span>
                            </button>
                          )}
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Modification Modal */}
      {editRoleModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-5 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <Key className="w-5 h-5 text-purple-700" />
                <span>Elevate or Assign Role</span>
              </div>
              <button 
                onClick={() => setEditRoleModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1 text-xs text-slate-600">
              <div>Target User: <strong>{selectedUser.name}</strong></div>
              <div>Email: <span className="font-mono">{selectedUser.email}</span></div>
              <div>Current Role: <span className="font-bold text-slate-900 uppercase">{selectedUser.role.replace('_', ' ')}</span></div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Select New Role:</label>
              <div className="space-y-2">
                {[
                  { role: 'buyer', label: 'Public Buyer / Customer', desc: 'Browse marketplace, book plots, make payments.' },
                  { role: 'dealer', label: 'Authorized Dealer / Agent', desc: 'Manage listings, leads CRM, lot allocations.' },
                  { role: 'society_admin', label: 'Housing Society Admin', desc: 'Masterplan oversight, plot inventory, financials.' },
                  { role: 'super_admin', label: 'Super Admin / TMA Regulator', desc: 'Full municipal governance and system administration.' }
                ].map((item) => (
                  <label
                    key={item.role}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                      targetRole === item.role ? 'bg-purple-50/60 border-purple-600 ring-1 ring-purple-600' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="targetRole"
                      value={item.role}
                      checked={targetRole === item.role}
                      onChange={() => setTargetRole(item.role as UserRole)}
                      className="mt-1 text-purple-600 focus:ring-purple-500"
                    />
                    <div>
                      <div className="text-xs font-extrabold text-slate-900">{item.label}</div>
                      <div className="text-[11px] text-slate-500">{item.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditRoleModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRoleChange}
                className="px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Apply Role Assignment</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suspend Confirmation Modal */}
      {suspendModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-scale-up">
            <div className="flex items-center gap-3 text-rose-700 font-bold pb-2 border-b border-slate-100">
              <Ban className="w-5 h-5" />
              <span>Suspend User Account</span>
            </div>

            <p className="text-xs text-slate-600">
              Are you sure you want to suspend access for <strong>{selectedUser.name}</strong> ({selectedUser.email})? 
              They will be locked out of protected dashboards until reactivated.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Reason for Suspension (Audit Log):</label>
              <textarea
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="e.g. Unverified license credentials, duplicate listing spam, or buyer dispute mediation."
                rows={3}
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSuspendModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSuspend}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5"
              >
                <Ban className="w-4 h-4" />
                <span>Confirm Suspension</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
