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
        <div className="card">
          <h1>ManzilIQ</h1>
          <p className="muted">Database not connected</p>
          <div className="notice">
            Copy <code>.env.example</code> to <code>.env</code>, add your{' '}
            <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code>,
            and run the SQL in <code>supabase/schema.sql</code>.
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
      setError(err instanceof Error ? err.message : 'Sign in failed');
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
      if (!user) throw new Error('Signup failed — please try again');
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
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const detailsDone = () => {
    setNotice(
      role === 'buyer'
        ? 'Registration complete — welcome!'
        : 'Submitted! Admin will verify your documents, then your account activates.',
    );
    setStep('signin');
  };

  return (
    <div className="page">
      <div className="card">
        <h1>ManzilIQ</h1>

        {step === 'signin' && (
          <>
            <p className="muted">Sign in to your account</p>
            <form onSubmit={handleSignin}>
              <label>
                Email
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              </label>
              <label>
                Password
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
              </label>
              {error && <div className="error">{error}</div>}
              {notice && <div className="notice">{notice}</div>}
              <button className="btn" disabled={loading}>
                {loading ? 'Please wait…' : 'Sign in'}
              </button>
            </form>
            <button className="link" onClick={() => { setStep('choose-role'); setError(null); setNotice(null); }}>
              Don't have an account? Register
            </button>
          </>
        )}

        {step === 'choose-role' && (
          <>
            <p className="muted">I want to register as…</p>
            <div className="role-grid">
              {ROLES.map((r) => (
                <button
                  key={r}
                  className={`role-card${role === r ? ' selected' : ''}`}
                  onClick={() => setRole(r)}
                >
                  {ROLE_LABELS[r]}
                </button>
              ))}
            </div>
            <button className="btn" onClick={() => setStep('create-account')}>
              Continue
            </button>
            <button className="link" onClick={() => setStep('signin')}>
              Back to sign in
            </button>
          </>
        )}

        {step === 'create-account' && (
          <>
            <p className="muted">Create account — {ROLE_LABELS[role]}</p>
            <form onSubmit={handleCreateAccount}>
              <label>
                Email
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              </label>
              <label>
                Password
                <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 characters" />
              </label>
              {error && <div className="error">{error}</div>}
              <button className="btn" disabled={loading}>
                {loading ? 'Please wait…' : 'Create account'}
              </button>
            </form>
            <button className="link" onClick={() => setStep('choose-role')}>
              Back
            </button>
          </>
        )}

        {step === 'register-details' && (
          <>
            <p className="muted">Complete your {ROLE_LABELS[role]} profile</p>
            {role === 'society_admin' && <SocietyRegistrationForm onDone={detailsDone} />}
            {role === 'dealer' && <DealerRegistrationForm onDone={detailsDone} />}
            {role === 'buyer' && <CustomerRegistrationForm onDone={detailsDone} />}
          </>
        )}
      </div>
    </div>
  );
}
