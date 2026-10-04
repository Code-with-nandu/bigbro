import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../supabase';

export default function AuthUtilityBar() {
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

  return (
    <div className="fixed inset-x-0 top-0 z-[60] h-10 border-b border-white/10 bg-[#08090c]/95 backdrop-blur-md">
      <nav aria-label="Header navigation" className="mx-auto flex h-full max-w-6xl items-center justify-between px-2 text-[10px] sm:px-6 sm:text-xs">
        <div className="flex shrink-0 items-center">
          <a href="/coders-diary" className="whitespace-nowrap rounded px-1 py-1 font-medium text-neutral-300 transition hover:text-amber-300 sm:px-2">🧑‍💻 Coder&apos;s Diary</a>
          <a href="#footer" onClick={handleFooterLinkClick} className="whitespace-nowrap rounded px-1 py-1 font-medium text-neutral-300 transition hover:text-amber-300 sm:px-2">↓ Footer</a>
        </div>
        <div className="flex shrink-0 items-center">
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
