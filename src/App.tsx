import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { getSupabase, isSupabaseConfigured } from './lib/supabase';

type Mode = 'signin' | 'signup';

export default function App() {
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const configured = isSupabaseConfigured();

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) =>
      setSession(s),
    );
    return () => listener.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = getSupabase();
    if (!supabase) return;
    setLoading(true);
    setError(null);
    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    const supabase = getSupabase();
    if (supabase) await supabase.auth.signOut();
    setSession(null);
  };

  if (!configured) {
    return (
      <div className="page">
        <div className="card">
          <h1>ManzilIQ</h1>
          <p className="muted">Prototype v1 — database not connected</p>
          <div className="notice">
            Supabase keys missing. Copy <code>.env.example</code> to{' '}
            <code>.env</code> and add your <code>VITE_SUPABASE_URL</code> and{' '}
            <code>VITE_SUPABASE_ANON_KEY</code>, then restart the dev server.
          </div>
        </div>
      </div>
    );
  }

  if (session) {
    return (
      <div className="page">
        <div className="card">
          <div className="badge ok">Database connected</div>
          <h1>Welcome</h1>
          <p className="muted">You are signed in as</p>
          <p className="email">{session.user.email}</p>
          <button className="btn secondary" onClick={handleSignOut}>
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="card">
        <h1>ManzilIQ</h1>
        <p className="muted">
          Prototype v1 — {mode === 'signin' ? 'Sign in' : 'Create account'}
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
          {error && <div className="error">{error}</div>}
          <button className="btn" type="submit" disabled={loading}>
            {loading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>
        <button
          className="link"
          onClick={() => {
            setMode(mode === 'signin' ? 'signup' : 'signin');
            setError(null);
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
