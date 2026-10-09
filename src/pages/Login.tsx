import { useState } from 'react';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import { ROLE_LABELS, type UserRole } from '../types';

type Mode = 'signin' | 'signup';

const ROLES: UserRole[] = ['buyer', 'dealer', 'society_admin', 'super_admin'];

export default function Login({ onNavigate }: { onNavigate: (p: string) => void }) {
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('buyer');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = getSupabase();
    if (!supabase) return;
    setLoading(true);
    setError(null);
    setNotice(null);
    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        onNavigate('dashboard');
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.user) {
          // Create the role profile right away
          const { error: pErr } = await supabase.from('profiles').insert({
            id: data.user.id,
            email,
            role,
          });
          if (pErr) throw pErr;
        }
        setNotice(
          'Account created! If email confirmation is on, confirm your email, then sign in.',
        );
        setMode('signin');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="card">
        <h1>ManzilIQ</h1>
        <p className="muted">
          {mode === 'signin' ? 'Sign in to your account' : 'Create a new account'}
        </p>
        <form onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </label>
          {mode === 'signup' && (
            <label>
              I am a…
              <select value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </option>
                ))}
              </select>
            </label>
          )}
          {error && <div className="error">{error}</div>}
          {notice && <div className="notice">{notice}</div>}
          <button className="btn" type="submit" disabled={loading}>
            {loading
              ? 'Please wait…'
              : mode === 'signin'
                ? 'Sign in'
                : 'Create account'}
          </button>
        </form>
        <button
          className="link"
          onClick={() => {
            setMode(mode === 'signin' ? 'signup' : 'signin');
            setError(null);
            setNotice(null);
          }}
        >
          {mode === 'signin'
            ? "Don't have an account? Create one"
            : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  );
}
