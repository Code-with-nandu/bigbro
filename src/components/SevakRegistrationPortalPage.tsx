import { useEffect, useState } from 'react';
import { supabase } from '../supabase';

export default function SevakRegistrationPortalPage() {
  const [checkingSession, setCheckingSession] = useState(true);
  const createProfilePath = '/sevak/create-profile';
  const loginLink = `/login?next=${encodeURIComponent(createProfilePath)}`;
  const signupLink = `/signup?next=${encodeURIComponent(createProfilePath)}`;

  useEffect(() => {
    let active = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      if (session) window.location.replace(createProfilePath);
      else setCheckingSession(false);
    });
    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (!error && data.session) window.location.replace(createProfilePath);
      else setCheckingSession(false);
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050508] px-4 py-12 font-sans text-white selection:bg-amber-500/30 selection:text-amber-200 sm:px-6">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(251,191,36,0.12),transparent_48%)]" />
      <section className="relative w-full max-w-3xl rounded-3xl border border-white/10 bg-[#0c0c12]/95 p-6 shadow-2xl shadow-black/40 sm:p-10">
        <a href="/" className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">BigBro · Sevak Portal</a>
        <div className="mt-10 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">Sevak Registration</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Serve with BigBro</h1>
          <p className="mt-4 text-sm leading-7 text-neutral-300 sm:text-base">
            Create your own Sevak profile using a BigBro account, then follow its review status here. Every new profile requires approval from a Sevak administrator before it can be used for attendance.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <article className="rounded-2xl border border-amber-300/20 bg-amber-300/[0.04] p-5">
            <h2 className="font-semibold text-white">New to the Sevak portal?</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-400">Sign up or log in first. Your profile will be linked to your authenticated account.</p>
            <a href={signupLink} className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-amber-300 px-4 py-3 text-sm font-bold text-neutral-950 transition hover:bg-amber-200">Create account</a>
            <a href={loginLink} className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/5">Log in</a>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
            <h2 className="font-semibold text-white">Already have a BigBro account?</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-400">Continue to your profile. If you have not registered before, you will be taken to the profile form.</p>
            <a href={loginLink} className="mt-5 inline-flex w-full items-center justify-center rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/5">Log in to continue</a>
            <a href="/sevak/my-profile" className="mt-3 inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold text-amber-200 transition hover:bg-amber-300/5">Check profile status</a>
          </article>
        </div>

        <p role="status" className="mt-7 text-center text-xs text-neutral-500">
          {checkingSession ? 'Checking your BigBro session…' : 'Profile approval is managed by authorized BigBro administrators.'}
        </p>
        <a href="/" className="mt-5 block text-center text-xs text-neutral-500 transition hover:text-white">Back to BigBro</a>
      </section>
    </main>
  );
}
