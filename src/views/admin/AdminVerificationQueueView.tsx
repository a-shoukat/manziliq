import React, { useState } from 'react';
import { User, VerificationRequest } from '../../types';
import { 
  FileCheck2, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Download, 
  Building2, 
  Users, 
  ShieldCheck, 
  Eye, 
  Mail,
  Search,
  Filter,
  FileText,
  Clock,
  ExternalLink,
  Check,
  X
} from 'lucide-react';
import { generatePDFDocument } from '../../utils/pdfGenerator';

interface AdminVerificationQueueViewProps {
  verificationRequests?: VerificationRequest[];
  users?: User[];
  onApproveVerification?: (reqId: string, userId: string) => void;
  onRejectVerification?: (reqId: string, userId: string, reason: string) => void;
}

export const AdminVerificationQueueView: React.FC<AdminVerificationQueueViewProps> = ({
  verificationRequests = [],
  users = [],
  onApproveVerification,
  onRejectVerification
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReqId, setSelectedReqId] = useState<string | null>(
    verificationRequests[0]?.id || null
  );
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  // Filter requests
  const filteredRequests = verificationRequests.filter(req => {
    const matchesStatus = filterStatus === 'all' || req.status === filterStatus;
    const matchesSearch = 
      req.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (req.societyName && req.societyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (req.cnicNumber && req.cnicNumber.includes(searchTerm));
    return matchesStatus && matchesSearch;
  });

  const selectedRequest = verificationRequests.find(r => r.id === selectedReqId) || filteredRequests[0] || null;
  const associatedUser = selectedRequest ? users.find(u => u.id === selectedRequest.userId) : null;

  const handleApprove = (req: VerificationRequest) => {
    if (onApproveVerification) {
      onApproveVerification(req.id, req.userId);
    }
  };

  const handleRejectConfirm = () => {
    if (selectedRequest && onRejectVerification) {
      onRejectVerification(
        selectedRequest.id, 
        selectedRequest.userId, 
        rejectionReasonInput.trim() || 'Compliance criteria not met as per TMA / NADRA registry guidelines.'
      );
      setShowRejectModal(false);
      setRejectionReasonInput('');
    }
  };

  const handleDownloadNocReview = () => {
    if (!selectedRequest) return;
    generatePDFDocument({
      docType: 'noc_certificate',
      buyerName: selectedRequest.userName,
      buyerPhone: selectedRequest.phone,
      buyerCNIC: selectedRequest.cnicNumber || '34501-0000000-0',
      plotNumber: 'Municipal Scope Verification',
      societyName: selectedRequest.societyName || 'Central Provincial Jurisdiction',
      totalPricePKR: 0,
      nocNumber: `TMA/NRL/VER-${selectedRequest.id}`,
      date: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-[Outfit] text-slate-900 tracking-tight flex items-center gap-2.5">
            <FileCheck2 className="w-7 h-7 text-purple-700" />
            <span>Identity & Developer Verification Queue</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Super Admin compliance approval portal. Approving an application activates login access immediately.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-bold text-slate-600 bg-white px-3.5 py-2 rounded-2xl border border-slate-200 shadow-xs">
            Pending Queue: <strong className="text-purple-700 font-extrabold">{verificationRequests.filter(q => q.status === 'pending').length}</strong>
          </div>
          <div className="text-xs font-bold text-slate-600 bg-white px-3.5 py-2 rounded-2xl border border-slate-200 shadow-xs">
            Approved: <strong className="text-emerald-700 font-extrabold">{verificationRequests.filter(q => q.status === 'approved').length}</strong>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {(['all', 'pending', 'approved', 'rejected'] as const).map(statusKey => (
            <button
              key={statusKey}
              onClick={() => setFilterStatus(statusKey)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition capitalize cursor-pointer whitespace-nowrap ${
                filterStatus === statusKey
                  ? 'bg-purple-900 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {statusKey} ({
                statusKey === 'all' 
                  ? verificationRequests.length 
                  : verificationRequests.filter(r => r.status === statusKey).length
              })
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by applicant, CNIC, society..."
            className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-purple-600"
          />
        </div>
      </div>

      {/* Main Split Layout: Queue List (Left) vs Detail Reviewer (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Queue Items */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Submissions ({filteredRequests.length})</span>
            <span className="text-[10px] text-slate-400 font-normal">Click to review dossier</span>
          </div>

          {filteredRequests.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 text-xs">
              No verification requests match your current filters.
            </div>
          ) : (
            filteredRequests.map((item) => {
              const isSelected = selectedRequest?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedReqId(item.id)}
                  className={`p-4 sm:p-5 rounded-3xl border transition cursor-pointer space-y-2.5 ${
                    isSelected
                      ? 'bg-purple-50/70 border-purple-400 ring-2 ring-purple-400 shadow-sm'
                      : 'bg-white border-slate-200 hover:bg-slate-50 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 text-sm">{item.userName}</span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      item.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                      item.status === 'rejected' ? 'bg-rose-100 text-rose-800' :
                      'bg-amber-100 text-amber-900 animate-pulse'
                    }`}>
                      {item.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-700 font-semibold flex items-center gap-1.5">
                    {item.role === 'society_admin' ? (
                      <>
                        <Building2 className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                        <span>{item.societyName || 'Township Developer'}</span>
                      </>
                    ) : (
                      <>
                        <Users className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                        <span>Authorized Realtor / Broker</span>
                      </>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
                    <span>Role: <strong className="capitalize text-slate-700">{item.role.replace('_', ' ')}</strong></span>
                    <span className="flex items-center gap-1 font-mono text-[10px]">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {item.submittedAt}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Deep Verification Dossier & Action Box */}
        <div className="lg:col-span-7">
          {selectedRequest ? (
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-lg space-y-6">
              
              {/* Dossier Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-purple-700">
                    Applicant Dossier #{selectedRequest.id}
                  </div>
                  <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">
                    {selectedRequest.userName}
                  </h2>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Email: {selectedRequest.email} • Phone: {selectedRequest.phone}
                  </div>
                </div>

                <div className={`px-3 py-1.5 rounded-2xl text-xs font-black uppercase text-center shrink-0 ${
                  selectedRequest.status === 'approved' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' :
                  selectedRequest.status === 'rejected' ? 'bg-rose-100 text-rose-900 border border-rose-300' :
                  'bg-amber-100 text-amber-900 border border-amber-300'
                }`}>
                  Status: {selectedRequest.status}
                </div>
              </div>

              {/* Status and Active User sync status */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="font-bold text-slate-800 flex items-center justify-between">
                  <span>Current Account Login Permission:</span>
                  <span className={`font-mono px-2 py-0.5 rounded text-[11px] font-bold ${
                    associatedUser?.status === 'active' ? 'bg-emerald-600 text-white' :
                    associatedUser?.status === 'suspended' ? 'bg-rose-600 text-white' :
                    'bg-amber-500 text-white'
                  }`}>
                    {associatedUser?.status?.toUpperCase() || (selectedRequest.status === 'approved' ? 'ACTIVE' : 'PENDING_VERIFICATION')}
                  </span>
                </div>
                <p className="text-slate-600 text-[11px]">
                  {selectedRequest.status === 'pending'
                    ? '⚠️ Account is blocked from signing in until Super Admin verifies documents and clicks "Approve Application".'
                    : selectedRequest.status === 'approved'
                    ? '✅ Verified. This user can sign in and manage their designated role dashboard.'
                    : '⛔ Application rejected. User cannot log in.'}
                </p>
              </div>

              {/* Identity & Legal Data Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">NADRA CNIC</span>
                  <span className="font-mono font-bold text-slate-800 text-sm">
                    {selectedRequest.cnicNumber || associatedUser?.cnic || '34501-1234567-3'}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Requested Role</span>
                  <span className="font-bold text-slate-800 capitalize">
                    {selectedRequest.role.replace('_', ' ')}
                  </span>
                </div>

                {selectedRequest.societyName && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1 sm:col-span-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Housing Project Name</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {selectedRequest.societyName}
                    </span>
                  </div>
                )}
              </div>

              {/* Submitted Compliance Documents */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Submitted Verification Artifacts
                </div>

                <div className="space-y-2">
                  {/* CNIC Document */}
                  <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-purple-700 shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-slate-900">
                          {selectedRequest.cnicDocName || 'NADRA_CNIC_Scan_Dual.pdf'}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          NADRA Verified National Identity Card Copy
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleDownloadNocReview}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Inspect</span>
                    </button>
                  </div>

                  {/* Dealer License or Society NOC */}
                  {selectedRequest.role === 'dealer' && (
                    <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <FileCheck2 className="w-5 h-5 text-blue-700 shrink-0" />
                        <div>
                          <div className="text-xs font-bold text-slate-900">
                            {selectedRequest.licenseDocName || 'Punjab_Excise_Realtor_License.pdf'}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Punjab Excise & Taxation Registered Broker License
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={handleDownloadNocReview}
                        className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </div>
                  )}

                  {selectedRequest.role === 'society_admin' && (
                    <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
                        <div>
                          <div className="text-xs font-bold text-slate-900">
                            {selectedRequest.nocDocName || 'TMA_NOC_Township_Approval.pdf'}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Tehsil Municipal Administration Legal NOC Certificate
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={handleDownloadNocReview}
                        className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {selectedRequest.status === 'pending' ? (
                <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                  <button
                    onClick={() => handleApprove(selectedRequest)}
                    className="flex-1 py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-2xl text-xs font-extrabold transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve & Activate Account</span>
                  </button>

                  <button
                    onClick={() => setShowRejectModal(true)}
                    className="px-5 py-3 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                </div>
              ) : (
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-purple-700" />
                    <span>Compliance decision recorded on <strong>{selectedRequest.reviewedAt || 'Today'}</strong></span>
                  </div>

                  <button
                    onClick={() => handleApprove(selectedRequest)}
                    className="text-purple-700 hover:underline font-bold cursor-pointer"
                  >
                    Re-Verify / Modify
                  </button>
                </div>
              )}

            </div>
          ) : (
            <div className="h-full min-h-[300px] flex items-center justify-center bg-white rounded-3xl border border-slate-200 text-slate-400 text-xs font-medium">
              Select a verification submission from the queue to view documents.
            </div>
          )}
        </div>

      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5 text-rose-700 font-extrabold text-sm">
              <AlertCircle className="w-5 h-5" />
              <span>Reject Verification Application</span>
            </div>

            <p className="text-xs text-slate-600">
              Provide a clear municipal compliance reason for rejecting <strong>{selectedRequest?.userName}</strong>. This reason will be communicated to the applicant.
            </p>

            <textarea
              rows={3}
              value={rejectionReasonInput}
              onChange={(e) => setRejectionReasonInput(e.target.value)}
              placeholder="e.g. Scanned CNIC copy is blurry; Punjab Excise License number expired or unmatched."
              className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-rose-500"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectConfirm}
                className="px-4 py-2 text-xs font-bold bg-rose-700 hover:bg-rose-800 text-white rounded-xl shadow-xs cursor-pointer"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
