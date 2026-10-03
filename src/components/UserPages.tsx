import type { Session } from '@supabase/supabase-js';
import type { ReactNode } from 'react';

interface UserPagesProps {
  pathname: string;
  session: Session;
}

export default function UserPages({ pathname, session }: UserPagesProps) {
  if (pathname === '/profile') return <ProfilePage session={session} />;

  const page = {
    '/register-problem': {
      title: 'Register a Problem',
      description: 'Problem registration form will be available here.',
    },
    '/my-problems': {
      title: 'My Problems',
      description: 'Your registered problems will appear here.',
    },
    '/notifications': {
      title: 'Notifications',
      description: 'No new notifications.',
    },
  }[pathname];

  if (!page) return null;

  return (
    <PageFrame title={page.title}>
      <p className="text-sm text-neutral-400">{page.description}</p>
      <a href="/dashboard" className="mt-6 inline-flex rounded-lg bg-amber-300 px-4 py-2.5 text-sm font-bold text-neutral-950 transition hover:bg-amber-200">Back to Dashboard</a>
    </PageFrame>
  );
}

function ProfilePage({ session }: { session: Session }) {
  const user = session.user;
  const metadata = user.user_metadata ?? {};
  const name = metadata.full_name || metadata.name || [metadata.first_name, metadata.last_name].filter(Boolean).join(' ');
  const loginMethod = user.app_metadata?.provider || user.app_metadata?.providers?.join(', ');

  return (
    <PageFrame title="My Profile">
      <div className="space-y-4 border-t border-white/10 pt-5">
        {name && <ProfileValue label="Name" value={name} />}
        {user.email && <ProfileValue label="Email" value={user.email} />}
        {user.phone && <ProfileValue label="Phone" value={user.phone} />}
        {loginMethod && <ProfileValue label="Login Method" value={loginMethod} />}
        {!name && !user.email && !user.phone && !loginMethod && <p className="text-sm text-neutral-400">No profile information is available.</p>}
      </div>
      <a href="/dashboard" className="mt-6 inline-flex rounded-lg bg-amber-300 px-4 py-2.5 text-sm font-bold text-neutral-950 transition hover:bg-amber-200">Back to Dashboard</a>
    </PageFrame>
  );
}

function PageFrame({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050508] px-4 pb-8 pt-16 font-sans text-white">
      <section className="w-full max-w-xl rounded-2xl border border-white/10 bg-[#0c0c12] p-6 shadow-2xl sm:p-8">
        <a href="/dashboard" className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">BigBro</a>
        <h1 className="mt-4 text-3xl font-bold tracking-tight">{title}</h1>
        <div className="mt-5">{children}</div>
      </section>
    </main>
  );
}

function ProfileValue({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs text-neutral-500">{label}</p><p className="mt-1 break-words text-sm text-neutral-200">{value}</p></div>;
}
