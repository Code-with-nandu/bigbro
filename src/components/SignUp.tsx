import { useState, type FormEvent } from 'react';
import { supabase } from '../supabase';

export default function SignUp() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleSignUp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');
    setIsError(false);
    if (!fullName.trim() || !email.trim() || !mobile.trim() || !password || !confirmPassword) {
      setIsError(true);
      setMessage('Please complete all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setIsError(true);
      setMessage('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({ email: email.trim(), password });
      if (error) throw error;
      if (data.session) {
        window.location.assign('/dashboard');
        return;
      }
      setMessage('Account created. Check your email to confirm your account before logging in.');
    } catch (error) {
      setIsError(true);
      setMessage(error instanceof Error ? error.message : 'Unable to create your account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050508] px-4 py-12 font-sans text-white">
      <section className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0c0c12] p-6 shadow-2xl sm:p-8">
        <a href="/" className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">BigBro</a>
        <h1 className="mt-4 text-3xl font-bold tracking-tight">Create BigBro Account</h1>
        <form onSubmit={handleSignUp} className="mt-7 space-y-4">
          <label className="block space-y-2 text-sm text-neutral-300">
            <span>Full Name</span>
            <input required type="text" autoComplete="name" value={fullName} onChange={(event) => setFullName(event.target.value)} className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-3 text-white outline-none transition focus:border-amber-400/60" />
          </label>
          <label className="block space-y-2 text-sm text-neutral-300">
            <span>Email</span>
            <input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-3 text-white outline-none transition focus:border-amber-400/60" />
          </label>
          <label className="block space-y-2 text-sm text-neutral-300">
            <span>Mobile</span>
            <input required type="tel" autoComplete="tel" value={mobile} onChange={(event) => setMobile(event.target.value)} className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-3 text-white outline-none transition focus:border-amber-400/60" />
          </label>
          <label className="block space-y-2 text-sm text-neutral-300">
            <span>Password</span>
            <input required type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-3 text-white outline-none transition focus:border-amber-400/60" />
          </label>
          <label className="block space-y-2 text-sm text-neutral-300">
            <span>Confirm Password</span>
            <input required type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-3 text-white outline-none transition focus:border-amber-400/60" />
          </label>
          {message && <p role={isError ? 'alert' : 'status'} className={`rounded-lg border p-3 text-sm ${isError ? 'border-rose-400/20 bg-rose-400/10 text-rose-200' : 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200'}`}>{message}</p>}
          <button type="submit" disabled={loading} className="w-full rounded-lg bg-amber-300 px-4 py-3 text-sm font-bold text-neutral-950 transition hover:bg-amber-200 disabled:cursor-wait disabled:opacity-60">{loading ? 'Creating account…' : 'Create Account'}</button>
        </form>
        <p className="mt-7 border-t border-white/10 pt-5 text-sm text-neutral-400">Already have an account? <a href="/login" className="font-semibold text-amber-300 hover:text-amber-200">Login</a></p>
      </section>
    </main>
  );
}
