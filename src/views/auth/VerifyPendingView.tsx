import React from 'react';
import { User, VerificationRequest } from '../../types';
import { 
  Clock, 
  ShieldCheck, 
  FileCheck2, 
  CheckCircle2, 
  ArrowLeft,
  Mail,
  AlertCircle,
  RefreshCw,
  ArrowRight
} from 'lucide-react';

interface VerifyPendingViewProps {
  currentUser?: User;
  verificationRequests?: VerificationRequest[];
  onNavigate: (route: string) => void;
}

export const VerifyPendingView: React.FC<VerifyPendingViewProps> = ({ 
  currentUser,
  verificationRequests = [],
  onNavigate 
}) => {
  const req = verificationRequests.find(r => r.userId === currentUser?.id);
  const isApproved = currentUser?.status === 'active' || currentUser?.verified === true || req?.status === 'approved';

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="w-full max-w-xl bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6 text-center">
        
        {/* Animated Status Icon */}
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-xs ${
          isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
        }`}>
          {isApproved ? (
            <CheckCircle2 className="w-8 h-8 text-emerald-700" />
          ) : (
            <Clock className="w-8 h-8 animate-pulse text-amber-700" />
          )}
        </div>

        <div className="space-y-2">
          <span className={`inline-block text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
            isApproved 
              ? 'text-emerald-800 bg-emerald-50 border-emerald-300' 
              : 'text-amber-800 bg-amber-50 border-amber-200'
          }`}>
            {isApproved ? 'Application Approved & Verified' : 'Account Under Super Admin Review'}
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {isApproved ? 'Welcome to MANZILIQ!' : 'Verification Queue In Progress'}
          </h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            {isApproved 
              ? `Congratulations ${currentUser?.name || 'Applicant'}! Your credentials have been authenticated. Your account is now fully active.`
              : 'In accordance with Punjab Housing Ordinance & Housing Authority guidelines, society developers and real estate dealers require compliance credential verification by Platform Super Admin (Ayesha Shoukat).'}
          </p>
        </div>

        {/* Verification Checklist */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-left space-y-3 text-xs">
          <div className="font-bold text-slate-800 flex items-center justify-between pb-2 border-b border-slate-200">
            <span>Submitted Documentation Checklist</span>
            <span className={isApproved ? 'text-emerald-700 font-bold' : 'text-amber-800 font-semibold'}>
              Status: {isApproved ? 'Verified & Active' : 'Stage 2/3 (Pending Review)'}
            </span>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Identity & NADRA CNIC Record</span>
              </div>
              <span className="text-emerald-700 font-bold font-mono text-[11px]">{currentUser?.cnic || 'Verified 13-Digit'}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-700">
                {isApproved ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                )}
                <span>Punjab Excise License / TMA NOC Dossier</span>
              </div>
              <span className={isApproved ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                {isApproved ? 'Approved by Super Admin' : 'In Review Queue'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-700">
                {isApproved ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" />
                )}
                <span>Role Management & Inventory Allocation Rights</span>
              </div>
              <span className={isApproved ? 'text-emerald-700 font-bold' : 'text-slate-400 font-medium'}>
                {isApproved ? 'Granted' : 'Pending Approval'}
              </span>
            </div>
          </div>
        </div>

        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 text-left flex items-start gap-2">
          <Mail className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
          <span>
            {isApproved 
              ? 'Your dashboard permissions have been unlocked. You can start creating listings, assigning lots, or managing inventory.'
              : 'You will receive an automated notification the moment your credentials are authenticated by Super Admin.'}
          </span>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          {isApproved ? (
            <button
              onClick={() => {
                if (currentUser?.role === 'dealer') onNavigate('/dealer/overview');
                else if (currentUser?.role === 'society_admin') onNavigate('/society/overview');
                else onNavigate('/buyer/overview');
              }}
              className="w-full sm:w-auto px-6 py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-2xl text-xs font-black transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              <span>Enter {currentUser?.role === 'dealer' ? 'Dealer CRM' : 'Society Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <>
              <button
                onClick={() => onNavigate('/')}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Public Marketplace</span>
              </button>
              <button
                onClick={() => onNavigate('/login')}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Sign In with Another Account
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
};
