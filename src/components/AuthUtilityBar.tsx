import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../supabase';

interface AuthUtilityBarProps {
  variant?: 'default' | 'sevak-dashboard';
}

export default function AuthUtilityBar({ variant = 'default' }: AuthUtilityBarProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    let active = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (active) {
        setSession(nextSession);
        setAuthReady(true);
      }
    });

    supabase.auth.getSession().then(({ data, error }) => {
      if (active) {
        if (!error) setSession(data.session);
        setAuthReady(true);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) console.error('Unable to log out:', error.message);
    } catch (error) {
      console.error('Unable to log out:', error);
    } finally {
      setSigningOut(false);
    }
  };

  const handleFooterLinkClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    document.getElementById('footer')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (variant === 'sevak-dashboard') {
    const linkClass = 'shrink-0 rounded px-2 py-1 font-medium text-neutral-300 transition hover:text-amber-300';
    return (
      <>
        <div className="fixed inset-x-0 top-0 z-[60] h-10 border-b border-white/10 bg-[#08090c]/95 backdrop-blur-md">
          <nav aria-label="Main navigation" className="mx-auto flex h-full max-w-7xl items-center overflow-x-auto px-2 text-[10px] sm:px-5 sm:text-xs">
            <div className="flex w-max min-w-full shrink-0 items-center gap-1 sm:gap-2">
              <a href="/coders-diary" className={linkClass}>🧑‍💻 Sevak Diary</a>
              <a href="/healthcare" className={linkClass}>Medical Fitness</a>
              <a href="/sevak-attendance" className={linkClass}>Sevak Attendance</a>
              <a href="/development-history#footer" className={linkClass}>↓ Footer</a>
            </div>
          </nav>
        </div>
        <div className="fixed inset-x-0 top-10 z-[60] h-10 border-b border-amber-300/10 bg-[#12131a]/95 backdrop-blur-md">
          <nav aria-label="Sevak account navigation" className="mx-auto flex h-full max-w-7xl items-center overflow-x-auto px-2 text-[10px] sm:px-5 sm:text-xs">
            <div className="flex w-max min-w-full shrink-0 items-center gap-1 sm:gap-2">
              <a href="/sevak/register" className={linkClass}>Sevak Registration Portal</a>
              <a href="/dashboard" className={linkClass}>My Account</a>
              <button type="button" onClick={handleSignOut} disabled={!authReady || !session || signingOut} className={`${linkClass} disabled:opacity-60`}>
                {signingOut ? 'Logging out…' : 'Logout'}
              </button>
            </div>
          </nav>
        </div>
      </>
    );
  }

  return (
    <div className="fixed inset-x-0 top-0 z-[60] h-10 border-b border-white/10 bg-[#08090c]/95 backdrop-blur-md">
      <nav aria-label="Header navigation" className="mx-auto flex h-full max-w-6xl items-center justify-between px-2 text-[10px] sm:px-6 sm:text-xs">
        <div className="flex shrink-0 items-center">
          <a href="/coders-diary" className="whitespace-nowrap rounded px-1 py-1 font-medium text-neutral-300 transition hover:text-amber-300 sm:px-2">🧑‍💻 Coder&apos;s Diary</a>
          <a href="/healthcare" className="whitespace-nowrap rounded px-1 py-1 font-medium text-neutral-300 transition hover:text-amber-300 sm:px-2">Healthcare Knowledge</a>
          <a href="/sevak-attendance" className="whitespace-nowrap rounded px-1 py-1 font-medium text-neutral-300 transition hover:text-amber-300 sm:px-2">Sevak Attendance</a>
          <a href="#footer" onClick={handleFooterLinkClick} className="whitespace-nowrap rounded px-1 py-1 font-medium text-neutral-300 transition hover:text-amber-300 sm:px-2">↓ Footer</a>
        </div>
        <div className="flex shrink-0 items-center">
          <a href="/sevak/register" aria-label="Sevak Registration Portal" className="whitespace-nowrap rounded px-1 py-1 font-medium text-neutral-300 transition hover:text-amber-300 sm:px-2">
            <span className="sm:hidden">Sevak Portal</span>
            <span className="hidden sm:inline">Sevak Registration Portal</span>
          </a>
          {authReady && <span aria-hidden="true" className="text-neutral-600">|</span>}
          {!authReady ? <span className="sr-only">Checking account…</span> : session ? (
            <>
              <a href="/dashboard" className="rounded px-1 py-1 font-medium text-neutral-300 transition hover:text-amber-300 sm:px-2">My Account</a>
              <span aria-hidden="true" className="text-neutral-600">|</span>
              <button type="button" onClick={handleSignOut} disabled={signingOut} className="rounded px-1 py-1 font-medium text-neutral-300 transition hover:text-amber-300 disabled:opacity-60 sm:px-2">
                {signingOut ? 'Logging out…' : 'Logout'}
              </button>
            </>
          ) : (
            <>
              <a href="/login" className="whitespace-nowrap rounded px-1 py-1 font-medium text-neutral-300 transition hover:text-amber-300 sm:px-2">Login</a>
              <span aria-hidden="true" className="text-neutral-600">|</span>
              <a href="/signup" className="whitespace-nowrap rounded px-1 py-1 font-semibold text-amber-300 transition hover:text-amber-200 sm:px-2">Sign Up</a>
            </>
          )}
        </div>
      </nav>
    </div>
  );
}

