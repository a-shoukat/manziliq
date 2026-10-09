import { useState } from 'react';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import { ROLE_LABELS, type UserRole } from '../types';
import {
  CustomerRegistrationForm,
  DealerRegistrationForm,
  SocietyRegistrationForm,
} from '../components/RegistrationForms';

type Step = 'signin' | 'choose-role' | 'create-account' | 'register-details';

const ROLES: UserRole[] = ['buyer', 'dealer', 'society_admin'];

const ROLE_META: Record<UserRole, { icon: string; blurb: string }> = {
  buyer: { icon: '🏠', blurb: 'Browse & book' },
  dealer: { icon: '🤝', blurb: 'Sell for clients' },
  society_admin: { icon: '🏘️', blurb: 'Manage society' },
  super_admin: { icon: '⚙️', blurb: 'Platform admin' },
};

export default function Login({ onNavigate }: { onNavigate: (p: string) => void }) {
  const [step, setStep] = useState<Step>('signin');
  const [role, setRole] = useState<UserRole>('buyer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  if (!isSupabaseConfigured()) {
    return (
      <div className="page-center">
        <div className="card narrow">
          <h1>ManzilIQ</h1>
          <p>Database not connected</p>
          <div className="alert error">Copy <code>.env.example</code> to <code>.env</code> and add your Supabase keys.</div>
        </div>
      </div>
    );
  }

  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = getSupabase();
    if (!supabase) return;
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      onNavigate('dashboard');
    } catch (err) {
      setError(
        err instanceof Error && err.message.includes('Invalid login')
          ? 'Email or password is incorrect. Please try again.'
          : err instanceof Error ? err.message : 'Sign in failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = getSupabase();
    if (!supabase) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      const user = data.user;
      if (!user) throw new Error('Signup failed — please try again.');
      const needsApproval = role === 'dealer' || role === 'society_admin';
      const { error: pErr } = await supabase.from('profiles').insert({
        id: user.id,
        email,
        role,
        verification_status: needsApproval ? 'pending' : 'approved',
      });
      if (pErr) throw pErr;
      setStep('register-details');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create your account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const detailsDone = () => {
    setNotice(
      role === 'buyer'
        ? 'Welcome to ManzilIQ! Your account is ready.'
        : 'Application submitted. We’ll verify your documents and activate your account shortly.',
    );
    setStep('signin');
  };

  return (
    <div className="login-split">
      {/* Left — brand visual (like reference) */}
      <div className="login-visual" aria-hidden="true">
        <div className="lv-bg">🏡</div>
        <div className="lv-brand">
          <img src="/manziliq-logo.png" alt="" style={{ height: 40, filter: 'brightness(0) invert(1)' }} />
        </div>
        <div>
          <h2>Find your sweet home</h2>
          <p>Verified societies, transparent prices, and plots you can book in just a few clicks — all across Pakistan.</p>
          <div className="lv-dots"><i className="on" /><i /><i /></div>
        </div>
      </div>

      {/* Right — form */}
      <div className="login-form-wrap">
        <div className="login-form">
          <div className="login-top">
            <button className="btn dark pill small" onClick={() => onNavigate('landing')}>← Back to home</button>
          </div>

          {step === 'signin' && (
            <>
              <h1>Welcome back to ManzilIQ!</h1>
              <p className="sub">Sign in to your account</p>
              <form onSubmit={handleSignin}>
                <label className="field" htmlFor="login-email">
                  <span className="flabel">Your Email</span>
                  <input id="login-email" type="email" required autoComplete="email"
                    value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                </label>
                <label className="field" htmlFor="login-password">
                  <span className="flabel">Password</span>
                  <div style={{ position: 'relative' }}>
                    <input id="login-password" type={showPw ? 'text' : 'password'} required autoComplete="current-password"
                      value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                      style={{ paddingRight: 44 }} />
                    <button type="button" aria-label={showPw ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPw(s => !s)}
                      style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>
                      {showPw ? '🙈' : '👁️'}
                    </button>
                  </div>
                </label>
                {error && <div className="alert error" role="alert">{error}</div>}
                {notice && <div className="alert ok" role="status">{notice}</div>}
                <button className="btn dark block pill" style={{ minHeight: 50 }} disabled={loading}>
                  {loading ? 'Signing you in…' : 'Login'}
                </button>
              </form>
              <p className="login-alt">
                Don’t have an account?{' '}
                <button className="link" onClick={() => { setStep('choose-role'); setError(null); }}>Register</button>
              </p>
            </>
          )}

          {step === 'choose-role' && (
            <>
              <h1>Join ManzilIQ</h1>
              <p className="sub">What best describes you?</p>
              <div className="role-pick" role="group" aria-label="Account type">
                {ROLES.map((r) => (
                  <button key={r} aria-pressed={role === r} onClick={() => setRole(r)}>
                    <span style={{ fontSize: 22 }}>{ROLE_META[r].icon}</span><br />
                    {ROLE_LABELS[r]}
                    <small>{ROLE_META[r].blurb}</small>
                  </button>
                ))}
              </div>
              <button className="btn dark block pill" style={{ minHeight: 50 }} onClick={() => setStep('create-account')}>
                Continue →
              </button>
              <p className="login-alt">
                <button className="link" onClick={() => setStep('signin')}>← Back to sign in</button>
              </p>
            </>
          )}

          {step === 'create-account' && (
            <>
              <h1>Create account</h1>
              <p className="sub">Registering as <strong style={{ color: 'var(--ink)' }}>{ROLE_LABELS[role]}</strong></p>
              <form onSubmit={handleCreateAccount}>
                <label className="field" htmlFor="reg-email">
                  <span className="flabel">Your Email</span>
                  <input id="reg-email" type="email" required autoComplete="email"
                    value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                </label>
                <label className="field" htmlFor="reg-password">
                  <span className="flabel">Password</span>
                  <input id="reg-password" type="password" required minLength={8} autoComplete="new-password"
                    value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" />
                  <span className="fhint">Use 8+ characters with letters and numbers.</span>
                </label>
                {error && <div className="alert error" role="alert">{error}</div>}
                <button className="btn dark block pill" style={{ minHeight: 50 }} disabled={loading}>
                  {loading ? 'Creating…' : 'Create account'}
                </button>
              </form>
              <p className="login-alt">
                <button className="link" onClick={() => setStep('choose-role')}>← Change account type</button>
              </p>
            </>
          )}

          {step === 'register-details' && (
            <>
              <h1>Almost done 🎉</h1>
              <p className="sub">Complete your {ROLE_LABELS[role]} profile</p>
              {role === 'society_admin' && <SocietyRegistrationForm onDone={detailsDone} />}
              {role === 'dealer' && <DealerRegistrationForm onDone={detailsDone} />}
              {role === 'buyer' && <CustomerRegistrationForm onDone={detailsDone} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
