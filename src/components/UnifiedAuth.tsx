import { useState, type FormEvent } from 'react';
import { supabase } from '../supabase';

type AuthMode = 'login' | 'signup';
type AuthMethod = 'choose' | 'email' | 'phone';

interface UnifiedAuthProps {
  initialMode: AuthMode;
}

export default function UnifiedAuth({ initialMode }: UnifiedAuthProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [method, setMethod] = useState<AuthMethod>('choose');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const showError = (text: string) => {
    setIsError(true);
    setMessage(text);
  };

  const handleOAuth = async (provider: 'google' | 'facebook') => {
    setLoading(true);
    setMessage('');
    setIsError(false);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: window.location.origin },
      });
      if (error) {
        const providerName = provider === 'facebook' ? 'Facebook' : 'Google';
        showError(`${error.message} Enable ${providerName} in Supabase Dashboard → Authentication → Providers → ${providerName}.`);
      }
    } catch (error) {
      const detail = error instanceof Error ? error.message : 'Please try again.';
      const providerName = provider === 'facebook' ? 'Facebook' : 'Google';
      showError(`${detail} Check Supabase Dashboard → Authentication → Providers → ${providerName}.`);
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubOAuth = async () => {
    setLoading(true);
    setMessage('');
    setIsError(false);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: { redirectTo: window.location.origin },
      });
      if (error) {
        showError(`${error.message} Enable GitHub in Supabase Dashboard → Authentication → Providers → GitHub.`);
      }
    } catch (error) {
      const detail = error instanceof Error ? error.message : 'Please try again.';
      showError(`${detail} Check Supabase Dashboard → Authentication → Providers → GitHub.`);
    } finally {
      setLoading(false);
    }
  };

  const handleEmail = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setIsError(false);
    try {
      if (mode === 'signup') {
        if (password !== confirmPassword) {
          showError('Passwords do not match.');
          return;
        }
        const { data, error } = await supabase.auth.signUp({ email: email.trim(), password });
        if (error) throw error;
        if (data.session) {
          window.location.assign('/dashboard');
          return;
        }
        setMessage('Account created. Check your email to confirm your account before logging in.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        window.location.assign('/dashboard');
      }
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setIsError(false);
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone: phone.trim() });
      if (error) {
        const detail = error.message;
        if (/phone|sms|provider|not enabled|not configured/i.test(detail)) {
          showError(`${detail} Enable Phone authentication and configure an SMS provider in Supabase Dashboard → Authentication → Providers.`);
        } else {
          showError(detail);
        }
        return;
      }
      setOtpSent(true);
      setMessage('OTP sent. Check your phone.');
    } catch (error) {
      const detail = error instanceof Error ? error.message : 'Please try again.';
      showError(`${detail} Check Phone authentication and SMS provider settings in Supabase Dashboard → Authentication → Providers.`);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setIsError(false);
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone: phone.trim(),
        token: otp.trim(),
        type: 'sms',
      });
      if (error) throw error;
      window.location.assign('/dashboard');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Unable to verify this OTP.');
    } finally {
      setLoading(false);
    }
  };

  const resetMessage = () => {
    setMessage('');
    setIsError(false);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050508] px-4 py-16 font-sans text-white">
      <section className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0c0c12] p-6 shadow-2xl sm:p-8">
        <a href="/" className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">BigBro</a>
        <h1 className="mt-4 text-center text-3xl font-bold tracking-tight">Welcome to BigBro</h1>

        <div className="mt-7 space-y-3">
          <button type="button" disabled={loading} onClick={() => handleOAuth('google')} className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-60">Continue with Google</button>
          <button type="button" disabled={loading} onClick={() => handleOAuth('facebook')} className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-60">Continue with Facebook</button>
          <button type="button" disabled={loading} onClick={handleGitHubOAuth} className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-60">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-current">
              <path d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.56.1.76-.24.76-.54v-2.08c-3.1.68-3.76-1.32-3.76-1.32-.5-1.29-1.24-1.63-1.24-1.63-1.01-.69.08-.68.08-.68 1.12.08 1.71 1.15 1.71 1.15 1 .1 1.52 1.03 1.52 1.03.99 1.7 2.6 1.2 3.24.92.1-.72.39-1.2.7-1.48-2.47-.28-5.07-1.24-5.07-5.5 0-1.22.44-2.21 1.15-2.99-.12-.28-.5-1.42.11-2.96 0 0 .94-.3 3.05 1.14a10.6 10.6 0 0 1 5.55 0c2.11-1.44 3.05-1.14 3.05-1.14.61 1.54.23 2.68.11 2.96.72.78 1.15 1.77 1.15 2.99 0 4.27-2.6 5.21-5.08 5.49.4.34.75 1 .75 2.02v3.08c0 .3.2.65.77.54A11.1 11.1 0 0 0 12 .9Z" />
            </svg>
            Continue with GitHub
          </button>
        </div>

        <div className="my-6 flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-neutral-500"><span className="h-px flex-1 bg-white/10" />Or<span className="h-px flex-1 bg-white/10" /></div>

        {method === 'choose' && (
          <div className="space-y-3">
            <button type="button" onClick={() => { setMethod('email'); resetMessage(); }} className="w-full rounded-lg bg-amber-300 px-4 py-3 text-sm font-bold text-neutral-950 transition hover:bg-amber-200">Continue with Email</button>
            <button type="button" onClick={() => { setMethod('phone'); resetMessage(); }} className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10">Continue with Phone</button>
          </div>
        )}

        {method === 'email' && (
          <>
            <div className="mb-4 flex rounded-lg border border-white/10 p-1 text-xs">
              <button type="button" onClick={() => { setMode('login'); resetMessage(); }} className={`flex-1 rounded-md px-3 py-2 ${mode === 'login' ? 'bg-white/10 text-white' : 'text-neutral-400'}`}>Login</button>
              <button type="button" onClick={() => { setMode('signup'); resetMessage(); }} className={`flex-1 rounded-md px-3 py-2 ${mode === 'signup' ? 'bg-white/10 text-white' : 'text-neutral-400'}`}>Sign Up</button>
            </div>
            <form onSubmit={handleEmail} className="space-y-4">
              <label className="block space-y-2 text-sm text-neutral-300"><span>Email</span><input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-3 text-white outline-none focus:border-amber-400/60" /></label>
              <label className="block space-y-2 text-sm text-neutral-300"><span>Password</span><input required type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-3 text-white outline-none focus:border-amber-400/60" /></label>
              {mode === 'signup' && <label className="block space-y-2 text-sm text-neutral-300"><span>Confirm Password</span><input required type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-3 text-white outline-none focus:border-amber-400/60" /></label>}
              <button type="submit" disabled={loading} className="w-full rounded-lg bg-amber-300 px-4 py-3 text-sm font-bold text-neutral-950 transition hover:bg-amber-200 disabled:opacity-60">{loading ? 'Please wait…' : mode === 'login' ? 'Login' : 'Create Account'}</button>
            </form>
          </>
        )}

        {method === 'phone' && (
          <div className="space-y-4">
            <form onSubmit={handleSendOtp} className="space-y-3">
              <label className="block space-y-2 text-sm text-neutral-300"><span>Phone Number</span><input required type="tel" autoComplete="tel" placeholder="+91 98765 43210" value={phone} onChange={(event) => setPhone(event.target.value)} className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-3 text-white outline-none focus:border-amber-400/60" /></label>
              <button type="submit" disabled={loading} className="w-full rounded-lg bg-amber-300 px-4 py-3 text-sm font-bold text-neutral-950 transition hover:bg-amber-200 disabled:opacity-60">{loading ? 'Sending…' : 'Send OTP'}</button>
            </form>
            {otpSent && <form onSubmit={handleVerifyOtp} className="space-y-3">
              <label className="block space-y-2 text-sm text-neutral-300"><span>OTP</span><input required inputMode="numeric" autoComplete="one-time-code" value={otp} onChange={(event) => setOtp(event.target.value)} className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-3 text-white outline-none focus:border-amber-400/60" /></label>
              <button type="submit" disabled={loading} className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-60">{loading ? 'Verifying…' : 'Verify OTP'}</button>
            </form>}
          </div>
        )}

        {message && <p role={isError ? 'alert' : 'status'} className={`mt-4 rounded-lg border p-3 text-sm ${isError ? 'border-rose-400/20 bg-rose-400/10 text-rose-200' : 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200'}`}>{message}</p>}
        {method !== 'choose' && <button type="button" onClick={() => { setMethod('choose'); resetMessage(); }} className="mt-4 text-xs text-neutral-400 hover:text-white">← Back to all sign-in options</button>}
        <p className="mt-6 border-t border-white/10 pt-5 text-center text-sm text-neutral-400">
          {mode === 'login' ? <>Don&apos;t have an account? <button type="button" onClick={() => { setMode('signup'); setMethod('email'); resetMessage(); }} className="font-semibold text-amber-300 hover:text-amber-200">Sign Up</button></> : <>Already have an account? <button type="button" onClick={() => { setMode('login'); setMethod('email'); resetMessage(); }} className="font-semibold text-amber-300 hover:text-amber-200">Login</button></>}
        </p>
      </section>
    </main>
  );
}
