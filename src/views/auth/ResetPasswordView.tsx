import React, { useState } from 'react';
import { KeyRound, Mail, ArrowRight, CheckCircle2, Lock } from 'lucide-react';

interface ResetPasswordViewProps {
  onNavigate: (route: string) => void;
}

export const ResetPasswordView: React.FC<ResetPasswordViewProps> = ({ onNavigate }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-amber-400 font-black text-xl flex items-center justify-center mx-auto shadow-md">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Reset Password
          </h2>
          <p className="text-xs text-slate-500">
            {step === 1 && 'Enter your registered email address to receive an authentication OTP'}
            {step === 2 && 'Enter the OTP code received on your registered device'}
            {step === 3 && 'Choose a strong new password for your account'}
          </p>
        </div>

        {step === 1 && (
          <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Registered Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Send Reset OTP</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={(e) => { e.preventDefault(); setStep(3); }} className="space-y-4 text-xs">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950">
              OTP code sent to <strong>{email}</strong>. (Simulated code: <strong>991823</strong>)
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Enter 6-Digit OTP</label>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="991823"
                className="w-full text-center text-lg font-mono font-bold tracking-widest py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Verify Code</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={(e) => { e.preventDefault(); onNavigate('/login'); }} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Update Password & Return to Login</span>
            </button>
          </form>
        )}

        <div className="text-center text-xs text-slate-600 pt-2 border-t border-slate-100">
          Remember your password?{' '}
          <button
            onClick={() => onNavigate('/login')}
            className="font-bold text-emerald-800 hover:underline cursor-pointer"
          >
            Back to Sign In
          </button>
        </div>

      </div>
    </div>
  );
};
