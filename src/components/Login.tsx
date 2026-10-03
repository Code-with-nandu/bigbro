import { useState, type FormEvent } from 'react';
import { supabase } from '../supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setIsError(false);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;
      window.location.assign('/dashboard');
    } catch (error) {
      setIsError(true);
      setMessage(error instanceof Error ? error.message : 'Unable to log in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setMessage('');
    setIsError(false);
    if (!email.trim()) {
      setIsError(true);
      setMessage('Enter your email address first, then request a password reset.');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
      if (error) throw error;
      setMessage('If an account exists for this email, a password reset link has been sent.');
    } catch (error) {
      setIsError(true);
      setMessage(error instanceof Error ? error.message : 'Unable to send a reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050508] px-4 py-12 font-sans text-white">
      <section className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0c0c12] p-6 shadow-2xl sm:p-8">
        <a href="/" className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">BigBro</a>
        <h1 className="mt-4 text-3xl font-bold tracking-tight">Login to BigBro</h1>
        <form onSubmit={handleLogin} className="mt-7 space-y-5">
          <label className="block space-y-2 text-sm text-neutral-300">
            <span>Email</span>
            <input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-3 text-white outline-none transition focus:border-amber-400/60" />
          </label>
          <label className="block space-y-2 text-sm text-neutral-300">
            <span>Password</span>
            <input required type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-3 text-white outline-none transition focus:border-amber-400/60" />
          </label>
          {message && <p role={isError ? 'alert' : 'status'} className={`rounded-lg border p-3 text-sm ${isError ? 'border-rose-400/20 bg-rose-400/10 text-rose-200' : 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200'}`}>{message}</p>}
          <button type="submit" disabled={loading} className="w-full rounded-lg bg-amber-300 px-4 py-3 text-sm font-bold text-neutral-950 transition hover:bg-amber-200 disabled:cursor-wait disabled:opacity-60">{loading ? 'Logging in…' : 'Login'}</button>
        </form>
        <button type="button" onClick={handleForgotPassword} disabled={loading} className="mt-4 text-sm text-amber-300 transition hover:text-amber-200 disabled:opacity-60">Forgot Password?</button>
        <p className="mt-7 border-t border-white/10 pt-5 text-sm text-neutral-400">Don&apos;t have an account? <a href="/signup" className="font-semibold text-amber-300 hover:text-amber-200">Sign Up</a></p>
      </section>
    </main>
  );
}
