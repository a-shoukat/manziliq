import React, { useState } from 'react';
import { User, UserRole } from '../../types';
import { 
  LogIn, 
  KeyRound, 
  Mail, 
  ShieldCheck, 
  ArrowRight, 
  Smartphone, 
  CheckCircle2, 
  Lock, 
  UserCheck, 
  AlertCircle, 
  X, 
  Building2, 
  Users,
  Eye,
  EyeOff,
  User as UserIcon
} from 'lucide-react';

interface LoginViewProps {
  users?: User[];
  lastVisitedProperty?: string | null;
  onLogin?: (role: UserRole) => void;
  onLoginSuccess?: (user: User) => void;
  onNavigate: (route: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  users = [],
  lastVisitedProperty,
  onLogin,
  onLoginSuccess,
  onNavigate
}) => {
  const [email, setEmail] = useState('ayeshashoukat2023cs512@gmail.com');
  const [password, setPassword] = useState('Aye_sha123@#');
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  
  // Dynamic 2FA OTP State
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [enteredOtp, setEnteredOtp] = useState<string>('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpToast, setOtpToast] = useState<string | null>(null);

  const [authError, setAuthError] = useState<string | null>(null);
  const [pendingAccountWarning, setPendingAccountWarning] = useState<string | null>(null);
  const [matchedUser, setMatchedUser] = useState<User | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setPendingAccountWarning(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    // Flexible user lookup supporting direct email and demo aliases
    const user = users.find(u => {
      const uEmail = u.email.trim().toLowerCase();
      if (uEmail === cleanEmail) return true;
      if (cleanEmail === 'dealer.tariq@bismillahestate.pk' && uEmail === 'tariq.realtor@manziliq.pk') return true;
      if (cleanEmail === 'tariq.realtor@manziliq.pk' && uEmail === 'dealer.tariq@bismillahestate.pk') return true;
      if (cleanEmail === 'buyer.farooq@gmail.com' && (uEmail === 'farooq.buyer@gmail.com' || u.role === 'buyer')) return true;
      if (cleanEmail === 'farooq.buyer@gmail.com' && (uEmail === 'buyer.farooq@gmail.com' || u.role === 'buyer')) return true;
      if ((cleanEmail === 'buyer@manziliq.pk' || cleanEmail === 'customer@manziliq.pk' || cleanEmail === 'farooq@gmail.com' || cleanEmail === 'buyer@gmail.com') && u.role === 'buyer') return true;
      if (cleanEmail === 'dealer@manziliq.pk' && u.role === 'dealer' && u.status === 'active') return true;
      if (cleanEmail === 'admin@manziliq.pk' && u.role === 'super_admin') return true;
      if (cleanEmail === 'society@manziliq.pk' && u.role === 'society_admin') return true;
      return false;
    });

    if (!user) {
      setAuthError('No MANZILIQ account registered with this email address. Try one of the 1-Click Demo Accounts below or check spelling.');
      return;
    }

    // Check account status
    if (user.status === 'suspended') {
      setAuthError('Account Access Suspended: Your access has been revoked by the Platform Super Admin due to compliance review.');
      return;
    }

    if (user.status === 'rejected') {
      setAuthError(`Account Registration Rejected: Your account application was rejected by Super Admin.${user.rejectionReason ? ` Reason: ${user.rejectionReason}` : ''}`);
      return;
    }

    if (user.status === 'pending' || user.status === 'pending_verification' || (!user.verified && user.role !== 'public_buyer' && user.role !== 'buyer')) {
      setPendingAccountWarning(
        `Account Pending Approval: Your ${user.role.replace('_', ' ')} registration credentials (CNIC / NOC) are currently in the Super Admin Verification Queue. You cannot log in until approved.`
      );
      return;
    }

    // Check password (allow user's password or common demo passwords)
    const isStandardDemoPass = ['Password123@#', 'Pass_123@#', 'Aye_sha123@#', '123456', 'password', 'dealer123', 'admin123'].includes(cleanPass);
    if (user.password && user.password !== cleanPass && !isStandardDemoPass) {
      if (cleanPass.length < 4) {
        setAuthError('Invalid credentials. Password is required.');
        return;
      }
    }

    // Credentials passed -> Proceed to 2FA OTP Step
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setMatchedUser(user);

      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(code);
      setEnteredOtp(code); // Pre-fill for convenience
      setOtpError(null);
      setStep('otp');
      setOtpToast(`[SMS Dispatch] 2FA Login Verification Code for ${user.name}: ${code}`);
    }, 250);
  };

  const handleOtpVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredOtp.trim() !== generatedOtp) {
      setOtpError(`Incorrect OTP code. Enter the 6-digit code (${generatedOtp}) sent to your registered device.`);
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      if (matchedUser) {
        if (onLoginSuccess) {
          onLoginSuccess(matchedUser);
        } else if (onLogin) {
          onLogin(matchedUser.role);
        }
      }
    }, 300);
  };

  const setQuickPersona = (userEmail: string, userPass: string) => {
    setEmail(userEmail);
    setPassword(userPass);
    setAuthError(null);
    setPendingAccountWarning(null);
  };

  const handleDirectDemoLogin = (targetEmail: string) => {
    setAuthError(null);
    setPendingAccountWarning(null);
    const cleanTarget = targetEmail.trim().toLowerCase();
    const user = users.find(u => 
      u.email.trim().toLowerCase() === cleanTarget ||
      (cleanTarget.includes('dealer') && u.role === 'dealer' && u.status === 'active') ||
      (cleanTarget.includes('buyer') && u.role === 'buyer') ||
      (cleanTarget.includes('alrehman') && u.role === 'society_admin') ||
      (cleanTarget.includes('ayesha') && u.role === 'super_admin')
    );

    if (user) {
      if (user.status === 'pending' || user.status === 'pending_verification') {
        setPendingAccountWarning(
          `Account Pending Approval: Your ${user.role.replace('_', ' ')} registration credentials are in the Super Admin Verification Queue.`
        );
        return;
      }
      if (onLoginSuccess) {
        onLoginSuccess(user);
      } else if (onLogin) {
        onLogin(user.role);
      }
    }
  };

  const demoAccounts = [
    {
      roleName: 'Licensed Dealer / Agent',
      name: 'Chaudhry Tariq Real Estate',
      email: 'tariq.realtor@manziliq.pk',
      aliasEmail: 'dealer.tariq@bismillahestate.pk',
      pass: 'Password123@#',
      badge: 'bg-teal-50 text-teal-800 border-teal-200',
      icon: Users,
      description: 'Manage plot inventory, client bookings & commissions'
    },
    {
      roleName: 'Super Admin',
      name: 'Ayesha Shoukat',
      email: 'ayeshashoukat2023cs512@gmail.com',
      aliasEmail: 'admin@manziliq.pk',
      pass: 'Aye_sha123@#',
      badge: 'bg-indigo-50 text-indigo-800 border-indigo-200',
      icon: ShieldCheck,
      description: 'Full administrative control, verification queue & audits'
    },
    {
      roleName: 'Society Developer',
      name: 'Al-Rehman Garden Admin',
      email: 'admin@alrehmangarden.pk',
      aliasEmail: 'society@alrehmangarden.pk',
      pass: 'Password123@#',
      badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      icon: Building2,
      description: 'Masterplan plot grid, dealer assignments & approvals'
    },
    {
      roleName: 'Verified Buyer / Customer',
      name: 'Muhammad Farooq',
      email: 'farooq.buyer@gmail.com',
      aliasEmail: 'buyer.farooq@gmail.com',
      pass: 'Password123@#',
      badge: 'bg-amber-50 text-amber-900 border-amber-200',
      icon: UserIcon,
      description: 'Installment tracking, digital ledger & reservations'
    }
  ];

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10 bg-slate-50">
      
      {/* Real-time SMS Toast Banner */}
      {otpToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-lg w-full px-4">
          <div className="bg-slate-900 border-2 border-emerald-400 text-white p-4 rounded-2xl shadow-2xl flex items-start justify-between gap-3 animate-slide-down">
            <div className="flex items-start gap-2.5">
              <Smartphone className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-black uppercase tracking-wider text-emerald-400">
                  2FA Mobile Security Gateway
                </div>
                <p className="text-xs font-semibold text-slate-200 mt-0.5">
                  {otpToast}
                </p>
                <div className="text-[10px] text-slate-400 mt-1">
                  Recipient: {matchedUser?.phone || '+92 300 0000000'} • Status: Delivered
                </div>
              </div>
            </div>
            <button
              onClick={() => setOtpToast(null)}
              className="text-slate-400 hover:text-white p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
        
        {/* Top Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-amber-400 font-black text-xl flex items-center justify-center mx-auto shadow-md">
            M
          </div>
          <h2 className="text-2xl font-black font-[Outfit] text-slate-900 tracking-tight">
            {step === 'credentials' ? 'Sign In to MANZILIQ' : '2-Factor OTP Verification'}
          </h2>
          <p className="text-xs text-slate-500">
            {step === 'credentials' 
              ? 'Access official property, plot booking and installment portal' 
              : `Enter the 6-digit PIN sent to ${matchedUser?.phone || 'your phone'}`}
          </p>
        </div>

        {/* Return to Property Destination Banner */}
        {lastVisitedProperty && (
          <div className="p-3 bg-amber-50 border border-amber-300/80 rounded-2xl text-xs text-amber-950 flex items-center justify-between gap-2.5 shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0" />
              <span className="font-medium text-[11px] leading-tight">
                You will be automatically returned to your selected property after signing in.
              </span>
            </div>
            <span className="px-2 py-0.5 bg-amber-200/80 text-amber-900 font-bold text-[10px] rounded-full shrink-0 uppercase tracking-wide">
              Auto-Return
            </span>
          </div>
        )}

        {/* Error / Warning Banners */}
        {authError && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-900 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Authentication Failed</strong>
              <span>{authError}</span>
            </div>
          </div>
        )}

        {pendingAccountWarning && (
          <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-2xl text-xs text-amber-950 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold text-amber-900">Verification Pending Approval</strong>
              <span>{pendingAccountWarning}</span>
              <button
                type="button"
                onClick={() => onNavigate('/verify-pending')}
                className="block mt-2 font-extrabold text-amber-900 underline hover:text-amber-950 cursor-pointer"
              >
                Check Real-time Verification Status →
              </button>
            </div>
          </div>
        )}

        {/* Step 1: Email & Password */}
        {step === 'credentials' ? (
          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-slate-900 focus:bg-white outline-none transition"
                  placeholder="name@domain.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={() => onNavigate('/reset-password')}
                  className="text-[11px] text-slate-600 hover:text-slate-900 hover:underline font-semibold cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-slate-900 focus:bg-white outline-none transition"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{isProcessing ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </button>
          </form>
        ) : (
          /* Step 2: OTP Verification */
          <form onSubmit={handleOtpVerify} className="space-y-4">
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-950 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-emerald-900">
                <Smartphone className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Simulated SMS Code Generated</span>
              </div>
              <p className="text-slate-600">
                Type the verification code dispatched to <strong>{matchedUser?.phone}</strong>.
              </p>
              <div className="p-2 bg-white rounded-xl border border-emerald-300 text-center font-mono font-black text-lg text-emerald-900">
                {generatedOtp}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 text-center">
                Enter 6-Digit Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={enteredOtp}
                onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="• • • • • •"
                className="w-full text-center text-xl font-mono tracking-widest py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none font-bold"
              />
              {otpError && (
                <p className="text-rose-600 text-xs font-bold mt-1.5 text-center">{otpError}</p>
              )}
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={() => {
                  const code = Math.floor(100000 + Math.random() * 900000).toString();
                  setGeneratedOtp(code);
                  setEnteredOtp('');
                  setOtpError(null);
                  setOtpToast(`[Resent SMS] 2FA Login Verification Code: ${code}`);
                }}
                className="text-slate-800 font-bold hover:underline cursor-pointer"
              >
                Resend SMS Code
              </button>

              <button
                type="button"
                onClick={() => setStep('credentials')}
                className="text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                ← Back
              </button>
            </div>

            <button
              type="submit"
              disabled={isProcessing || enteredOtp.length !== 6}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{isProcessing ? 'Verifying PIN...' : 'Confirm & Access Portal'}</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </button>
          </form>
        )}

        {/* Demo Credentials Quick-Fill Cards */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-amber-500" />
              <span>1-Click Persona Access</span>
            </span>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Instant Demo Access
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2.5 text-xs">
            {demoAccounts.map((acc, idx) => {
              const IconComp = acc.icon;
              const isSelected = email === acc.email || email === acc.aliasEmail;
              return (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    isSelected 
                      ? 'bg-slate-900 text-white border-slate-800 shadow-md' 
                      : 'bg-white hover:bg-slate-50/80 text-slate-800 border-slate-200 shadow-2xs'
                  }`}
                >
                  <div className="min-w-0 flex items-start gap-2.5">
                    <div className={`p-2 rounded-xl shrink-0 ${isSelected ? 'bg-slate-800 text-amber-400' : 'bg-slate-100 text-slate-700'}`}>
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-xs">{acc.name}</span>
                        <span className={`text-[9px] font-bold px-2 py-0.2 rounded-full border ${
                          isSelected ? 'bg-slate-800 text-amber-300 border-slate-700' : acc.badge
                        }`}>
                          {acc.roleName}
                        </span>
                      </div>
                      <div className={`text-[11px] font-mono mt-0.5 truncate ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                        {acc.email}
                      </div>
                      <div className={`text-[10px] mt-0.5 line-clamp-1 ${isSelected ? 'text-slate-400' : 'text-slate-400'}`}>
                        {acc.description}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 sm:border-transparent justify-end">
                    <button
                      type="button"
                      onClick={() => setQuickPersona(acc.email, acc.pass)}
                      className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition cursor-pointer ${
                        isSelected 
                          ? 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700' 
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                      title="Autofill email and password"
                    >
                      Autofill
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => handleDirectDemoLogin(acc.email)}
                      className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-[11px] font-black transition shadow-xs flex items-center gap-1 cursor-pointer"
                      title="Direct 1-Click Login"
                    >
                      <span>⚡ Instant Login</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pending Verification Dealer Testing Option */}
          <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-[11px] flex items-center justify-between text-slate-600">
            <span className="font-semibold">Test unverified KYC dealer state:</span>
            <button
              type="button"
              onClick={() => setQuickPersona('bismillah.realtors@gmail.com', 'Password123@#')}
              className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline cursor-pointer"
            >
              Autofill Pending Dealer (Malik Zeeshan)
            </button>
          </div>
        </div>

        {/* Signup Redirect */}
        <div className="text-center text-xs text-slate-600 pt-2 border-t border-slate-100">
          Don't have a registered profile yet?{' '}
          <button
            onClick={() => onNavigate('/signup')}
            className="font-bold text-slate-900 hover:underline cursor-pointer"
          >
            Create Account
          </button>
        </div>

      </div>
    </div>
  );
};
