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

const ROLE_BLURBS: Record<UserRole, string> = {
  buyer: 'Browse verified listings, book plots, and track payments.',
  dealer: 'List properties for clients and manage bookings.',
  society_admin: 'Manage your society: blocks, bookings, and transfers.',
  super_admin: 'Full platform administration and oversight.',
};

export default function Login({ onNavigate }: { onNavigate: (p: string) => void }) {
  const [step, setStep] = useState<Step>('signin');
  const [role, setRole] = useState<UserRole>('buyer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  if (!isSupabaseConfigured()) {
    return (
      <div className="page">
        <div className="card narrow">
          <h1>ManzilIQ</h1>
          <p className="muted">Database not connected</p>
          <div className="notice" role="alert">
            Copy <code>.env.example</code> to <code>.env</code>, add your{' '}
            <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code>,
            then run the SQL in <code>supabase/schema.sql</code>.
          </div>
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

  const resetToSignin = () => { setStep('signin'); setError(null); setNotice(null); };

  return (
    <div className="page">
      <div className="card narrow">
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div className="nav-brand" style={{ justifyContent: 'center', cursor: 'default' }}>
            <span className="mark" aria-hidden="true">M</span>
            ManzilIQ
          </div>
        </div>

        {step === 'signin' && (
          <>
            <h1 style={{ textAlign: 'center' }}>Welcome back</h1>
            <p className="muted" style={{ textAlign: 'center' }}>Sign in to manage your properties and bookings</p>
            <form onSubmit={handleSignin} noValidate={false}>
              <label className="field" htmlFor="login-email">
                <span className="field-label">Email address <span className="req" aria-hidden="true">*</span></span>
                <input
                  id="login-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </label>
              <label className="field" htmlFor="login-password">
                <span className="field-label">Password <span className="req" aria-hidden="true">*</span></span>
                <input
                  id="login-password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                />
              </label>
              {error && <div className="error" role="alert">{error}</div>}
              {notice && <div className="success-note" role="status">{notice}</div>}
              <button className="btn block large" disabled={loading}>
                {loading ? 'Signing you in…' : 'Sign in'}
              </button>
            </form>
            <p className="small muted" style={{ textAlign: 'center', marginTop: 16 }}>
              New to ManzilIQ?{' '}
              <button className="link inline" onClick={() => { setStep('choose-role'); setError(null); setNotice(null); }}>
                Create an account
              </button>
            </p>
          </>
        )}

        {step === 'choose-role' && (
          <>
            <h1 style={{ textAlign: 'center' }}>Join ManzilIQ</h1>
            <p className="muted" style={{ textAlign: 'center' }}>What best describes you?</p>
            <div className="role-grid" role="radiogroup" aria-label="Account type">
              {ROLES.map((r) => (
                <button
                  key={r}
                  role="radio"
                  aria-checked={role === r}
                  className={`role-card${role === r ? ' selected' : ''}`}
                  onClick={() => setRole(r)}
                >
                  <strong>{ROLE_LABELS[r]}</strong>
                  <span className="caption muted" style={{ display: 'block', marginTop: 4 }}>{ROLE_BLURBS[r]}</span>
                </button>
              ))}
            </div>
            <button className="btn block" onClick={() => setStep('create-account')}>
              Continue as {ROLE_LABELS[role]}
            </button>
            <p className="small muted" style={{ textAlign: 'center', marginTop: 16 }}>
              <button className="link inline" onClick={resetToSignin}>Back to sign in</button>
            </p>
          </>
        )}

        {step === 'create-account' && (
          <>
            <h1 style={{ textAlign: 'center' }}>Create your account</h1>
            <p className="muted" style={{ textAlign: 'center' }}>
              Registering as <strong className="secondary-text">{ROLE_LABELS[role]}</strong>
            </p>
            <form onSubmit={handleCreateAccount}>
              <label className="field" htmlFor="reg-email">
                <span className="field-label">Email address <span className="req" aria-hidden="true">*</span></span>
                <input
                  id="reg-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </label>
              <label className="field" htmlFor="reg-password">
                <span className="field-label">Password <span className="req" aria-hidden="true">*</span></span>
                <input
                  id="reg-password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                />
                <span className="field-hint">Use 8+ characters with a mix of letters and numbers.</span>
              </label>
              {error && <div className="error" role="alert">{error}</div>}
              <button className="btn block large" disabled={loading}>
                {loading ? 'Creating your account…' : 'Create account'}
              </button>
            </form>
            <p className="small muted" style={{ textAlign: 'center', marginTop: 16 }}>
              <button className="link inline" onClick={() => setStep('choose-role')}>← Choose a different account type</button>
            </p>
          </>
        )}

        {step === 'register-details' && (
          <>
            <h1 style={{ textAlign: 'center' }}>Almost done</h1>
            <p className="muted" style={{ textAlign: 'center' }}>Complete your {ROLE_LABELS[role]} profile</p>
            {role === 'society_admin' && <SocietyRegistrationForm onDone={detailsDone} />}
            {role === 'dealer' && <DealerRegistrationForm onDone={detailsDone} />}
            {role === 'buyer' && <CustomerRegistrationForm onDone={detailsDone} />}
          </>
        )}
      </div>
    </div>
  );
}
