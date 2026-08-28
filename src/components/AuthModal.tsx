import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { INITIAL_USERS } from '../data/mockData';
import { ManzilIQLogo } from './common/ManzilIQLogo';
import { X, ShieldCheck, User as UserIcon, Building2, Users, CheckCircle2, Phone, Mail, ArrowRight, Lock, Database } from 'lucide-react';
import { isSupabaseConfigured, supabaseAuthHelper } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  onOpenSupabaseConnect?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess, onOpenSupabaseConnect }) => {
  const [tab, setTab] = useState<'presets' | 'supabase' | 'signup' | 'otp'>('presets');
  const [selectedRole, setSelectedRole] = useState<UserRole>('buyer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+92 300 ');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  // Supabase Auth States
  const [supabaseMode, setSupabaseMode] = useState<'signin' | 'signup'>('signin');
  const [supabaseEmail, setSupabaseEmail] = useState('ayeshashoukat2023cs512@gmail.com');
  const [supabasePass, setSupabasePass] = useState('Aye_sha123@#');
  const [supabaseName, setSupabaseName] = useState('Ayesha Shoukat');
  const [supabaseLoading, setSupabaseLoading] = useState(false);
  const [supabaseError, setSupabaseError] = useState('');

  if (!isOpen) return null;

  const handleSupabaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSupabaseError('');
    setSupabaseLoading(true);

    try {
      if (supabaseMode === 'signup') {
        await supabaseAuthHelper.signUp(supabaseEmail, supabasePass, supabaseName, selectedRole);
      } else {
        await supabaseAuthHelper.signIn(supabaseEmail, supabasePass);
      }
      const activeUser = await supabaseAuthHelper.getCurrentUser();
      if (activeUser) {
        onLoginSuccess(activeUser);
        onClose();
      } else {
        // Fallback user if email confirmation is required
        onLoginSuccess({
          id: `sp-${Date.now()}`,
          name: supabaseName || supabaseEmail.split('@')[0],
          email: supabaseEmail,
          phone: '',
          role: selectedRole,
          verified: true,
        });
        onClose();
      }
    } catch (err: any) {
      setSupabaseError(err.message || 'Supabase authentication failed');
    } finally {
      setSupabaseLoading(false);
    }
  };

  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    setOtpSent(true);
    setTab('otp');
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: User = {
      id: `u-custom-${Date.now()}`,
      name: name || 'Valued User',
      email: email || 'user@manziliq.pk',
      phone,
      role: selectedRole,
      status: 'active',
      verified: true,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
    };
    onLoginSuccess(newUser);
    onClose();
  };

  const handlePresetSelect = (role: UserRole) => {
    const matched = INITIAL_USERS.find(u => u.role === role) || INITIAL_USERS[0];
    onLoginSuccess(matched);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 text-white shadow-2xl relative overflow-hidden">
        
        {/* Header background glow */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-teal-500 via-amber-500 to-indigo-500" />

        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800 p-1.5 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <ManzilIQLogo variant="compact" size="sm" theme="dark" showTagline={false} />
            <span className="bg-amber-500/20 text-amber-400 font-bold text-[10px] px-2 py-0.5 rounded border border-amber-500/30 uppercase tracking-wider">
              Identity Portal
            </span>
          </div>
          <h2 className="text-xl font-extrabold font-[Outfit] text-white">Access MANZILIQ Platform</h2>
          <p className="text-slate-400 text-xs mt-1">
            Sign in to manage bookings, track installments, or explore verified housing properties and societies.
          </p>
        </div>

        {/* Tab Switchers */}
        <div className="flex rounded-xl bg-slate-800/80 p-1 mb-6 border border-slate-700/60 text-xs font-bold gap-1">
          <button
            onClick={() => setTab('presets')}
            className={`flex-1 py-2 rounded-lg transition-all ${
              tab === 'presets' ? 'bg-amber-500 text-slate-950 shadow-sm font-extrabold' : 'text-slate-300 hover:text-white'
            }`}
          >
            ⚡ Demo Logins
          </button>
          <button
            onClick={() => setTab('supabase')}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1 ${
              tab === 'supabase' ? 'bg-emerald-500 text-slate-950 shadow-sm font-extrabold' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Supabase Auth</span>
          </button>
          <button
            onClick={() => setTab('signup')}
            className={`flex-1 py-2 rounded-lg transition-all ${
              tab === 'signup' || tab === 'otp' ? 'bg-amber-500 text-slate-950 shadow-sm font-extrabold' : 'text-slate-300 hover:text-white'
            }`}
          >
            📱 Phone OTP
          </button>
        </div>

        {/* Tab 1: Quick Presets */}
        {tab === 'presets' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-400 font-semibold mb-2">
              Select a pre-configured role to immediately access that role's dashboard:
            </p>

            <button
              onClick={() => handlePresetSelect('buyer')}
              className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-800/70 border border-slate-700 hover:border-amber-500/50 hover:bg-slate-800 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  <UserIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-white group-hover:text-amber-400">Muhammad Farooq</div>
                  <div className="text-xs text-slate-400">Buyer • View Bookings & Pay Installments</div>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-amber-400 transition-colors" />
            </button>

            <button
              onClick={() => handlePresetSelect('dealer')}
              className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-800/70 border border-slate-700 hover:border-teal-500/50 hover:bg-slate-800 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-white group-hover:text-teal-400">Chaudhry Tariq Real Estate</div>
                  <div className="text-xs text-slate-400">Dealer/Agent • Manage Lead Pipeline</div>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-teal-400 transition-colors" />
            </button>

            <button
              onClick={() => handlePresetSelect('society_admin')}
              className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-800/70 border border-slate-700 hover:border-emerald-500/50 hover:bg-slate-800 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-white group-hover:text-emerald-400">Al-Rehman Garden Admin</div>
                  <div className="text-xs text-slate-400">Housing Society • Plots, Inventory & Approvals</div>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
            </button>

            <button
              onClick={() => handlePresetSelect('super_admin')}
              className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-800/70 border border-slate-700 hover:border-indigo-500/50 hover:bg-slate-800 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-white group-hover:text-indigo-400">MANZILIQ Super Admin</div>
                  <div className="text-xs text-slate-400">Platform Admin • Analytics & User Moderation</div>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
            </button>
          </div>
        )}

        {/* Tab 2: Supabase Auth */}
        {tab === 'supabase' && (
          <div className="space-y-4">
            {!isSupabaseConfigured() && (
              <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl text-amber-300 text-xs space-y-2">
                <p className="font-bold">Supabase credentials needed in .env</p>
                <p className="text-[11px] text-slate-300">
                  Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to activate cloud authentication.
                </p>
                {onOpenSupabaseConnect && (
                  <button
                    type="button"
                    onClick={() => { onClose(); onOpenSupabaseConnect(); }}
                    className="bg-amber-500 text-slate-950 font-bold px-3 py-1 rounded-lg text-xs hover:bg-amber-400 transition-colors"
                  >
                    View Supabase Credentials Guide
                  </button>
                )}
              </div>
            )}

            {supabaseError && (
              <div className="bg-rose-500/20 border border-rose-500/30 p-2.5 rounded-xl text-rose-300 text-xs font-bold">
                {supabaseError}
              </div>
            )}

            <div className="flex bg-slate-800 p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setSupabaseMode('signin')}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  supabaseMode === 'signin' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setSupabaseMode('signup')}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  supabaseMode === 'signup' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>

            <form onSubmit={handleSupabaseSubmit} className="space-y-3">
              {supabaseMode === 'signup' && (
                <>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1 font-bold">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tariq Mehmood"
                      value={supabaseName}
                      onChange={e => setSupabaseName(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-300 mb-1 font-bold">Account Role</label>
                    <select
                      value={selectedRole}
                      onChange={e => setSelectedRole(e.target.value as UserRole)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-emerald-400 font-bold focus:outline-none"
                    >
                      <option value="buyer">Plot Buyer</option>
                      <option value="dealer">Real Estate Dealer</option>
                      <option value="society_admin">Society Admin</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs text-slate-300 mb-1 font-bold">Supabase Email</label>
                <input
                  type="email"
                  required
                  placeholder="user@manziliq.pk"
                  value={supabaseEmail}
                  onChange={e => setSupabaseEmail(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1 font-bold">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={supabasePass}
                  onChange={e => setSupabasePass(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={supabaseLoading}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-2.5 rounded-xl shadow-lg transition-all"
              >
                {supabaseLoading ? 'Connecting to Supabase...' : (supabaseMode === 'signup' ? 'Register with Supabase' : 'Sign In with Supabase')}
              </button>
            </form>
          </div>
        )}

        {/* Tab 3: Custom Phone OTP Signup */}
        {tab === 'signup' && (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Select Account Type / Role</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { role: 'buyer', label: 'Property Buyer' },
                  { role: 'dealer', label: 'Agent / Dealer' },
                  { role: 'society_admin', label: 'Housing Society' },
                  { role: 'super_admin', label: 'Super Admin' },
                ].map(r => (
                  <button
                    key={r.role}
                    type="button"
                    onClick={() => setSelectedRole(r.role as UserRole)}
                    className={`py-2 px-3 rounded-lg text-xs font-bold text-left border transition-all ${
                      selectedRole === r.role
                        ? 'border-amber-500 bg-amber-500/20 text-amber-300'
                        : 'border-slate-700 bg-slate-800/50 text-slate-400'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Shahbaz Ahmed"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Mobile Phone (Pakistan +92)</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="+92 300 1234567"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold py-2.5 rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
            >
              <span>Send OTP Verification Code</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Tab 4: Enter OTP */}
        {tab === 'otp' && (
          <form onSubmit={handleVerifyOTP} className="space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center mb-2">
              <Lock className="w-6 h-6" />
            </div>

            <p className="text-sm font-bold">OTP Code sent to {phone}</p>
            <p className="text-xs text-slate-400">Enter sample OTP <span className="text-amber-400 font-mono font-bold">123456</span> to complete login.</p>

            <input
              type="text"
              required
              maxLength={6}
              placeholder="123456"
              value={otpCode}
              onChange={e => setOtpCode(e.target.value)}
              className="w-48 mx-auto text-center font-mono text-2xl tracking-widest bg-slate-800 border border-amber-500 rounded-xl px-3 py-2 text-white focus:outline-none"
            />

            <button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold py-2.5 rounded-xl shadow-lg transition-all"
            >
              Verify & Enter MANZILIQ
            </button>
          </form>
        )}

      </div>
    </div>
  );
};

