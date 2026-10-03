import { useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../supabase';

interface DashboardProps {
  session: Session;
}

export default function Dashboard({ session }: DashboardProps) {
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState('');
  const user = session.user;
  const metadata = user.user_metadata ?? {};
  const name = metadata.full_name || metadata.name || [metadata.first_name, metadata.last_name].filter(Boolean).join(' ');
  const loginMethod = user.app_metadata?.provider || user.app_metadata?.providers?.join(', ');

  const handleLogout = async () => {
    setLoggingOut(true);
    setLogoutError('');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) setLogoutError(error.message);
    } catch (error) {
      setLogoutError(error instanceof Error ? error.message : 'Unable to log out. Please try again.');
    } finally {
      setLoggingOut(false);
    }
  };

  const actions = [
    { icon: '📝', label: 'Register a Problem', href: '/register-problem', detail: 'Tell us about an issue that needs support.' },
    { icon: '📋', label: 'My Problems', href: '/my-problems', detail: 'View problems you have registered.' },
    { icon: '👤', label: 'My Profile', href: '/profile', detail: 'View your account information.' },
    { icon: '🔔', label: 'Notifications', href: '/notifications', detail: 'See updates and notices.' },
  ];

  return (
    <main className="min-h-screen bg-[#050508] px-4 pb-10 pt-16 font-sans text-white sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex flex-col justify-between gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">BigBro</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Welcome to BigBro</h1>
            <p className="mt-2 text-neutral-400">Hello{name ? `, ${name}` : ''}</p>
          </div>
          <button type="button" onClick={handleLogout} disabled={loggingOut} className="self-start rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-neutral-300 transition hover:border-rose-400/40 hover:text-rose-200 disabled:cursor-wait disabled:opacity-60 sm:self-auto">
            {loggingOut ? 'Logging out…' : 'Logout'}
          </button>
        </header>

        <section className="rounded-2xl border border-white/10 bg-[#0c0c12] p-5 sm:p-7">
          <h2 className="text-lg font-semibold">Account</h2>
          <div className="mt-4 grid gap-4 border-t border-white/10 pt-4 text-sm sm:grid-cols-2">
            {name && <AccountValue label="Name" value={name} />}
            {user.email && <AccountValue label="Email" value={user.email} />}
            {user.phone && <AccountValue label="Phone" value={user.phone} />}
            {loginMethod && <AccountValue label="Login Method" value={loginMethod} />}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-semibold">Quick Actions</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {actions.map((action) => (
              <a key={action.href} href={action.href} className="group rounded-2xl border border-white/10 bg-[#0c0c12] p-5 transition hover:border-amber-300/40 hover:bg-[#111118] sm:p-6">
                <span className="text-2xl" aria-hidden="true">{action.icon}</span>
                <h3 className="mt-3 font-semibold text-white group-hover:text-amber-200">{action.label}</h3>
                <p className="mt-1 text-sm text-neutral-400">{action.detail}</p>
              </a>
            ))}
          </div>
        </section>
        {logoutError && <p role="alert" className="mt-4 rounded-lg border border-rose-400/20 bg-rose-400/10 p-3 text-sm text-rose-200">{logoutError}</p>}
      </div>
    </main>
  );
}

function AccountValue({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs text-neutral-500">{label}</p><p className="mt-1 break-words text-neutral-200">{value}</p></div>;
}
