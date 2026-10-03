import { useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../supabase';

interface ProtectedRouteProps {
  children: (session: Session) => ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<'checking' | 'authenticated' | 'unauthenticated'>('checking');

  useEffect(() => {
    let active = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      setStatus(nextSession ? 'authenticated' : 'unauthenticated');
    });

    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      const nextSession = error ? null : data.session;
      setSession(nextSession);
      setStatus(nextSession ? 'authenticated' : 'unauthenticated');
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') window.location.replace('/login');
  }, [status]);

  if (status !== 'authenticated' || !session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050508] px-4 pt-10 text-sm text-neutral-400" aria-live="polite">
        Checking your account…
      </main>
    );
  }

  return <>{children(session)}</>;
}
