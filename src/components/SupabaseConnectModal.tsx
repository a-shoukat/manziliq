import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Key, 
  CheckCircle2, 
  XCircle, 
  Copy, 
  ExternalLink, 
  ShieldCheck, 
  UserCheck, 
  Lock, 
  Code2, 
  AlertTriangle, 
  LogOut, 
  Sparkles,
  X
} from 'lucide-react';
import { isSupabaseConfigured, SUPABASE_SQL_SCHEMA, supabaseAuthHelper } from '../lib/supabase';
import { User, UserRole } from '../types';

interface SupabaseConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: User;
  onAuthSuccess?: (user: User) => void;
}

export const SupabaseConnectModal: React.FC<SupabaseConnectModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onAuthSuccess,
}) => {
  const [copiedSql, setCopiedSql] = useState(false);
  const [activeTab, setActiveTab] = useState<'credentials' | 'sql' | 'auth_test'>('credentials');
  
  // Auth Form State
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');
  const [email, setEmail] = useState('ayeshashoukat2023cs512@gmail.com');
  const [password, setPassword] = useState('Aye_sha123@#');
  const [fullName, setFullName] = useState('Ayesha Shoukat');
  const [role, setRole] = useState<UserRole>('super_admin');
  const [authLoading, setAuthLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const isConfigured = isSupabaseConfigured();

  useEffect(() => {
    if (copiedSql) {
      const timer = setTimeout(() => setCopiedSql(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [copiedSql]);

  if (!isOpen) return null;

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthMessage(null);
    setAuthLoading(true);

    try {
      if (authMode === 'signup') {
        await supabaseAuthHelper.signUp(email, password, fullName, role);
        setAuthMessage({ type: 'success', text: 'Supabase User Registered Successfully! You are now logged in.' });
      } else {
        await supabaseAuthHelper.signIn(email, password);
        setAuthMessage({ type: 'success', text: 'Logged in successfully via Supabase Auth!' });
      }

      const activeUser = await supabaseAuthHelper.getCurrentUser();
      if (activeUser && onAuthSuccess) {
        onAuthSuccess(activeUser);
      }
    } catch (err: any) {
      setAuthMessage({ type: 'error', text: err.message || 'Authentication failed' });
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black font-[Outfit]">Supabase Integration Portal</h3>
                {isConfigured ? (
                  <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Connected
                  </span>
                ) : (
                  <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Credentials Needed
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Connect your MANZILIQ real estate app with Supabase Auth & PostgreSQL Database.
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-100 border-b border-slate-200 px-6 pt-3 flex gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('credentials')}
            className={`pb-3 px-4 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'credentials' 
                ? 'border-emerald-600 text-emerald-700 font-extrabold' 
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>1. Required Credentials</span>
          </button>

          <button
            onClick={() => setActiveTab('sql')}
            className={`pb-3 px-4 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'sql' 
                ? 'border-emerald-600 text-emerald-700 font-extrabold' 
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>2. SQL Database Schema</span>
          </button>

          <button
            onClick={() => setActiveTab('auth_test')}
            className={`pb-3 px-4 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'auth_test' 
                ? 'border-emerald-600 text-emerald-700 font-extrabold' 
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>3. Supabase Auth Test</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 text-xs">
          
          {/* TAB 1: REQUIRED CREDENTIALS GUIDE */}
          {activeTab === 'credentials' && (
            <div className="space-y-5">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-950 space-y-1">
                <h4 className="font-bold text-sm font-[Outfit] flex items-center gap-1.5 text-emerald-900">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  Supabase Setup Instructions (ہہدایات)
                </h4>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Supabase provides full PostgreSQL database storage, real-time subscriptions, and email/password authentication. Add the 2 keys below to your environment configuration to connect.
                </p>
              </div>

              {/* Required Keys Box */}
              <div className="space-y-4">
                <h4 className="font-bold text-slate-900 font-[Outfit] text-sm">Required Environment Variables (.env)</h4>

                <div className="bg-slate-900 text-slate-200 p-4 rounded-2xl space-y-3 font-mono text-xs border border-slate-800">
                  <div>
                    <span className="text-amber-400 font-bold block">1. VITE_SUPABASE_URL</span>
                    <span className="text-slate-400 text-[11px]">Your Supabase Project URL (e.g. https://your-project-id.supabase.co)</span>
                    <input 
                      readOnly 
                      value={import.meta.env.VITE_SUPABASE_URL || 'Not set (Add in .env or Settings secrets)'}
                      className="w-full bg-slate-950 text-emerald-400 border border-slate-800 rounded-lg p-2 mt-1 text-xs"
                    />
                  </div>

                  <div>
                    <span className="text-amber-400 font-bold block">2. VITE_SUPABASE_ANON_KEY</span>
                    <span className="text-slate-400 text-[11px]">Your Supabase Public Anon API Key (eyJhbGciOi...)</span>
                    <input 
                      readOnly 
                      value={import.meta.env.VITE_SUPABASE_ANON_KEY || 'Not set (Add in .env or Settings secrets)'}
                      className="w-full bg-slate-950 text-emerald-400 border border-slate-800 rounded-lg p-2 mt-1 text-xs truncate"
                    />
                  </div>
                </div>
              </div>

              {/* Steps List */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 font-[Outfit] text-sm">How to get these credentials (طریقہ کار):</h4>
                <ol className="space-y-2 list-decimal list-inside text-slate-700 leading-relaxed">
                  <li>Visit <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-emerald-700 font-bold underline inline-flex items-center gap-1">Supabase.com <ExternalLink className="w-3 h-3" /></a> and sign in or create a free account.</li>
                  <li>Create a new project (e.g., <span className="font-bold text-slate-900">"manziliq-platform"</span>).</li>
                  <li>In your Supabase project dashboard, go to <span className="font-bold text-slate-900">Project Settings → API</span>.</li>
                  <li>Copy <span className="font-bold text-slate-900">Project URL</span> and <span className="font-bold text-slate-900">anon public key</span>.</li>
                  <li>Run the SQL script from Tab 2 in your Supabase SQL Editor.</li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 2: SQL SCHEMA GENERATOR */}
          {activeTab === 'sql' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-100 p-3 rounded-xl border border-slate-200">
                <div>
                  <h4 className="font-extrabold text-slate-900 font-[Outfit]">Supabase PostgreSQL Database Schema</h4>
                  <p className="text-[11px] text-slate-600">Copy & paste this script into your Supabase Dashboard → SQL Editor.</p>
                </div>

                <button
                  onClick={handleCopySql}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <Copy className="w-4 h-4" />
                  <span>{copiedSql ? 'Copied to Clipboard!' : 'Copy SQL Script'}</span>
                </button>
              </div>

              <div className="bg-slate-950 text-slate-300 p-4 rounded-2xl font-mono text-[11px] h-80 overflow-y-auto border border-slate-800 space-y-1">
                <pre className="whitespace-pre-wrap">{SUPABASE_SQL_SCHEMA}</pre>
              </div>
            </div>
          )}

          {/* TAB 3: SUPABASE AUTHENTICATION TEST */}
          {activeTab === 'auth_test' && (
            <div className="space-y-6">
              {!isConfigured ? (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-amber-900 space-y-2">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Supabase Credentials Not Yet Configured</span>
                  </div>
                  <p className="text-xs text-amber-800">
                    To test Supabase Authentication, please set <span className="font-mono font-bold">VITE_SUPABASE_URL</span> and <span className="font-mono font-bold">VITE_SUPABASE_ANON_KEY</span> in your project configuration.
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl flex items-center justify-between text-emerald-950">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-emerald-800 block">Supabase Connection Status</span>
                      <span className="font-extrabold text-emerald-900 text-sm">Active & Connected to Supabase Cloud</span>
                    </div>
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  </div>

                  {authMessage && (
                    <div className={`p-3 rounded-xl border text-xs font-bold ${
                      authMessage.type === 'success' 
                        ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
                        : 'bg-rose-100 border-rose-300 text-rose-900'
                    }`}>
                      {authMessage.text}
                    </div>
                  )}

                  {/* Auth Mode Toggle */}
                  <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setAuthMode('signup')}
                      className={`flex-1 py-2 rounded-lg transition-all ${
                        authMode === 'signup' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Supabase Sign Up (Register)
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthMode('signin')}
                      className={`flex-1 py-2 rounded-lg transition-all ${
                        authMode === 'signin' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Supabase Sign In (Login)
                    </button>
                  </div>

                  {/* Auth Form */}
                  <form onSubmit={handleAuthSubmit} className="space-y-4">
                    {authMode === 'signup' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Full Name</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Chaudhry Usman"
                            value={fullName}
                            onChange={e => setFullName(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold mb-1">User Role</label>
                          <select
                            value={role}
                            onChange={e => setRole(e.target.value as UserRole)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-bold"
                          >
                            <option value="buyer">Plot Buyer</option>
                            <option value="dealer">Real Estate Dealer / Agent</option>
                            <option value="society_admin">Housing Society Administrator</option>
                            <option value="super_admin">Platform Super Admin</option>
                          </select>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        placeholder="buyer@manziliq.pk"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Password</label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={authLoading}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      {authLoading ? (
                        <span>Authenticating with Supabase...</span>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          <span>{authMode === 'signup' ? 'Create Supabase Account' : 'Sign In with Supabase'}</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 px-6 flex items-center justify-between text-xs text-slate-500">
          <span>MANZILIQ Unified Real Estate Platform</span>
          <button
            onClick={onClose}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl transition-all"
          >
            Close Window
          </button>
        </div>

      </div>
    </div>
  );
};
