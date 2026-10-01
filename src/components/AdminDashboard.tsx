import { FormEvent, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { AlertCircle, ArrowLeft, CheckCircle2, Clock3, CreditCard, Loader2, LogOut, RefreshCw, Search, ShieldCheck } from 'lucide-react';
import { supabase } from '../supabase';

interface DashboardPayment {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  amount: number;
  currency: string | null;
  payment_id: string | null;
  payment_status: string | null;
  payment_gateway: string | null;
  created_at: string | null;
}

type StatusFilter = 'all' | 'completed' | 'pending' | 'failed' | 'cancelled';

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0
});

function formatDate(value: string | null) {
  if (!value) return 'Date unavailable';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : date.toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
}

function statusClasses(status: string | null) {
  switch (status?.toLowerCase()) {
    case 'completed':
      return 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300';
    case 'pending':
      return 'border-amber-400/25 bg-amber-400/10 text-amber-200';
    case 'failed':
    case 'cancelled':
      return 'border-rose-400/25 bg-rose-400/10 text-rose-300';
    default:
      return 'border-white/15 bg-white/5 text-neutral-300';
  }
}

function StatusBadge({ status }: { status: string | null }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize ${statusClasses(status)}`}>
      {status || 'Unknown'}
    </span>
  );
}

export default function AdminDashboard() {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signingIn, setSigningIn] = useState(false);
  const [authError, setAuthError] = useState('');
  const [payments, setPayments] = useState<DashboardPayment[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      setSession(data.session);
      if (error) setAuthError(error.message);
      setAuthLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthLoading(false);
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session) {
      setPayments([]);
      return;
    }

    let active = true;
    setLoading(true);
    setLoadError('');

    supabase
      .from('payments')
      .select('id, full_name, email, phone, amount, currency, payment_id, payment_status, payment_gateway, created_at')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          setLoadError(error.message);
          setPayments([]);
        } else {
          setPayments((data ?? []) as DashboardPayment[]);
        }
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [session, refreshKey]);

  const visiblePayments = useMemo(() => {
    const query = search.trim().toLowerCase();
    return payments.filter((payment) => {
      const matchesStatus = statusFilter === 'all' || payment.payment_status?.toLowerCase() === statusFilter;
      const searchable = [payment.full_name, payment.email, payment.phone, payment.payment_id, payment.payment_gateway]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return matchesStatus && (!query || searchable.includes(query));
    });
  }, [payments, search, statusFilter]);

  const totalAmount = payments.reduce((total, payment) => (
    payment.payment_status?.toLowerCase() === 'completed'
      ? total + (Number(payment.amount) || 0)
      : total
  ), 0);
  const successfulCount = payments.filter((payment) => payment.payment_status?.toLowerCase() === 'completed').length;
  const pendingCount = payments.filter((payment) => payment.payment_status?.toLowerCase() === 'pending').length;

  const handleSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSigningIn(true);
    setAuthError('');
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) setAuthError(error.message);
    if (data.session) setSession(data.session);
    setSigningIn(false);
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) setAuthError(error.message);
  };

  return (
    <main className="min-h-screen bg-[#050508] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-400/25 bg-amber-400/10 text-amber-300">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-300">Big Brother</p>
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Contributions</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a href="/" className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-neutral-300 transition hover:border-white/25 hover:text-white">
              <ArrowLeft className="h-4 w-4" /> Public site
            </a>
            {session && (
              <button onClick={handleSignOut} className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-neutral-300 transition hover:border-rose-400/40 hover:text-rose-200">
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            )}
          </div>
        </header>

        {authLoading ? (
          <div className="flex min-h-[50vh] items-center justify-center gap-3 text-sm text-neutral-400">
            <Loader2 className="h-5 w-5 animate-spin text-amber-300" /> Checking admin session...
          </div>
        ) : !session ? (
          <section className="mx-auto mt-12 max-w-md rounded-2xl border border-white/10 bg-[#0c0c12] p-6 shadow-2xl sm:p-8">
            <div className="mb-6">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-amber-300">Admin access</p>
              <h2 className="text-2xl font-bold">Sign in</h2>
              <p className="mt-2 text-sm text-neutral-400">Use your Supabase account to view contribution records.</p>
            </div>
            <form onSubmit={handleSignIn} className="space-y-4">
              <label className="block space-y-1.5 text-xs font-medium text-neutral-300">
                Email address
                <input required type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none transition focus:border-amber-400/60" />
              </label>
              <label className="block space-y-1.5 text-xs font-medium text-neutral-300">
                Password
                <input required type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none transition focus:border-amber-400/60" />
              </label>
              {authError && <p role="alert" className="flex items-start gap-2 rounded-lg border border-rose-400/20 bg-rose-400/10 p-3 text-xs text-rose-200"><AlertCircle className="h-4 w-4 shrink-0" />{authError}</p>}
              <button type="submit" disabled={signingIn} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-amber-300 px-4 py-3 text-sm font-bold text-neutral-950 transition hover:bg-amber-200 disabled:cursor-wait disabled:opacity-60">
                {signingIn && <Loader2 className="h-4 w-4 animate-spin" />}
                {signingIn ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          </section>
        ) : (
          <>
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-sm text-neutral-400">Payment confirmations and contribution totals</p>
                <p className="mt-1 text-xs text-neutral-500">Signed in as {session.user.email}</p>
              </div>
              <button onClick={() => setRefreshKey((key) => key + 1)} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-neutral-300 transition hover:border-amber-300/40 hover:text-white disabled:opacity-50">
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
              </button>
            </div>

            {loadError ? (
              <section role="alert" className="rounded-xl border border-rose-400/20 bg-rose-400/10 p-5 text-rose-100">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-300" />
                  <div className="min-w-0 flex-1">
                    <h2 className="font-semibold">Unable to load contributions</h2>
                    <p className="mt-1 break-words text-sm text-rose-100/80">{loadError}</p>
                  </div>
                  <button onClick={() => setRefreshKey((key) => key + 1)} className="rounded-md border border-rose-200/20 px-3 py-1.5 text-xs font-semibold hover:bg-rose-200/10">Retry</button>
                </div>
              </section>
            ) : (
              <>
                <section aria-label="Contribution summary" className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <SummaryCard label="Total Contributions" value={loading ? '...' : payments.length.toLocaleString('en-IN')} icon={<CreditCard className="h-4 w-4" />} />
                  <SummaryCard label="Total Contribution Amount" value={loading ? '...' : currencyFormatter.format(totalAmount)} accent />
                  <SummaryCard label="Successful Payments" value={loading ? '...' : successfulCount.toLocaleString('en-IN')} icon={<CheckCircle2 className="h-4 w-4" />} />
                  <SummaryCard label="Pending Payments" value={loading ? '...' : pendingCount.toLocaleString('en-IN')} icon={<Clock3 className="h-4 w-4" />} />
                </section>

                <section className="overflow-hidden rounded-xl border border-white/10 bg-[#0b0b10]">
                  <div className="flex flex-col gap-4 border-b border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                    <div>
                      <h2 className="font-semibold">Recent Contributions</h2>
                      <p className="mt-1 text-xs text-neutral-500">{visiblePayments.length.toLocaleString('en-IN')} of {payments.length.toLocaleString('en-IN')} records</p>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <label className="relative block sm:w-64">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                        <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, email, UTR..." className="w-full rounded-lg border border-white/10 bg-black/30 py-2 pl-9 pr-3 text-xs text-white outline-none placeholder:text-neutral-600 focus:border-amber-400/50" />
                      </label>
                      <select aria-label="Filter by payment status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as StatusFilter)} className="rounded-lg border border-white/10 bg-[#111117] px-3 py-2 text-xs text-neutral-200 outline-none focus:border-amber-400/50">
                        <option value="all">All statuses</option>
                        <option value="completed">Completed</option>
                        <option value="pending">Pending</option>
                        <option value="failed">Failed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  {loading ? (
                    <div className="flex min-h-56 items-center justify-center gap-3 text-sm text-neutral-400">
                      <Loader2 className="h-5 w-5 animate-spin text-amber-300" /> Loading payment records...
                    </div>
                  ) : visiblePayments.length === 0 ? (
                    <div className="px-5 py-16 text-center">
                      <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-neutral-400"><Search className="h-5 w-5" /></div>
                      <h3 className="text-sm font-semibold">{payments.length ? 'No matching contributions' : 'No contributions yet'}</h3>
                      <p className="mt-1 text-xs text-neutral-500">{payments.length ? 'Try changing the search or status filter.' : 'Payment confirmations will appear here when submitted.'}</p>
                    </div>
                  ) : (
                    <>
                      <div className="hidden overflow-x-auto md:block">
                        <table className="w-full min-w-[1100px] text-left text-xs">
                          <thead className="bg-white/[0.025] text-[10px] uppercase tracking-wider text-neutral-500">
                            <tr>
                              <th className="px-5 py-3 font-semibold">Contributor</th>
                              <th className="px-4 py-3 font-semibold">Phone</th>
                              <th className="px-4 py-3 font-semibold">Amount</th>
                              <th className="px-4 py-3 font-semibold">UTR</th>
                              <th className="px-4 py-3 font-semibold">Status</th>
                              <th className="px-4 py-3 font-semibold">Gateway</th>
                              <th className="px-4 py-3 font-semibold">Created</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/[0.06]">
                            {visiblePayments.map((payment) => <PaymentTableRow key={payment.id} payment={payment} />)}
                          </tbody>
                        </table>
                      </div>
                      <div className="divide-y divide-white/[0.07] md:hidden">
                        {visiblePayments.map((payment) => <PaymentMobileRow key={payment.id} payment={payment} />)}
                      </div>
                    </>
                  )}
                </section>
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}

function SummaryCard({ label, value, icon, accent = false }: { label: string; value: string; icon?: ReactNode; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0b0b10] p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3 text-xs text-neutral-400">
        <span>{label}</span>
        {icon && <span className="text-amber-300">{icon}</span>}
      </div>
      <p className={`mt-3 break-words text-2xl font-bold tabular-nums ${accent ? 'text-amber-200' : 'text-white'}`}>{value}</p>
    </div>
  );
}

function PaymentTableRow({ payment }: { payment: DashboardPayment }) {
  return (
    <tr className="align-top transition hover:bg-white/[0.025]">
      <td className="max-w-56 px-5 py-4">
        <p className="truncate font-semibold text-white">{payment.full_name}</p>
        <p className="mt-1 truncate text-neutral-500">{payment.email}</p>
      </td>
      <td className="px-4 py-4 text-neutral-300">{payment.phone || '—'}</td>
      <td className="whitespace-nowrap px-4 py-4 font-semibold text-amber-200">{currencyFormatter.format(Number(payment.amount) || 0)}</td>
      <td className="max-w-40 break-all px-4 py-4 font-mono text-neutral-300">{payment.payment_id || '—'}</td>
      <td className="px-4 py-4"><StatusBadge status={payment.payment_status} /></td>
      <td className="px-4 py-4 text-neutral-300">{payment.payment_gateway || '—'}</td>
      <td className="whitespace-nowrap px-4 py-4 text-neutral-400">{formatDate(payment.created_at)}</td>
    </tr>
  );
}

function PaymentMobileRow({ payment }: { payment: DashboardPayment }) {
  return (
    <article className="space-y-3 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold">{payment.full_name}</h3>
          <p className="mt-1 break-all text-xs text-neutral-500">{payment.email}</p>
        </div>
        <StatusBadge status={payment.payment_status} />
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
        <PaymentField label="Amount" value={currencyFormatter.format(Number(payment.amount) || 0)} accent />
        <PaymentField label="Phone" value={payment.phone || '—'} />
        <PaymentField label="UTR" value={payment.payment_id || '—'} mono />
        <PaymentField label="Gateway" value={payment.payment_gateway || '—'} />
        <div className="col-span-2"><PaymentField label="Created" value={formatDate(payment.created_at)} /></div>
      </div>
    </article>
  );
}

function PaymentField({ label, value, accent = false, mono = false }: { label: string; value: string; accent?: boolean; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] uppercase tracking-wider text-neutral-500">{label}</p>
      <p className={`mt-1 break-words ${accent ? 'font-semibold text-amber-200' : 'text-neutral-300'} ${mono ? 'font-mono' : ''}`}>{value}</p>
    </div>
  );
}
