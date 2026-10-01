import { useState } from 'react';
import { Database, Loader2, AlertCircle, CreditCard, CheckCircle2 } from 'lucide-react';
import { testSupabaseConnection, testPaymentsTableConnection } from '../supabase';

export default function SupabaseConnectionTester() {
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [diagnostics, setDiagnostics] = useState<{ urlSource: string; keySource: string } | null>(null);

  // Payments table test state
  const [testingPayments, setTestingPayments] = useState(false);
  const [paymentsStatus, setPaymentsStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [paymentsMessage, setPaymentsMessage] = useState<string>('');

  const handleTest = async () => {
    setTesting(true);
    setStatus('idle');
    setErrorMessage('');
    setDiagnostics(null);

    const result = await testSupabaseConnection();

    setTesting(false);
    setDiagnostics({
      urlSource: result.envInfo.urlSource,
      keySource: result.envInfo.keySource
    });

    if (result.success) {
      setStatus('success');
    } else {
      setStatus('error');
      setErrorMessage(result.message);
    }
  };

  const handleTestPayments = async () => {
    setTestingPayments(true);
    setPaymentsStatus('idle');
    setPaymentsMessage('');

    const res = await testPaymentsTableConnection();
    setTestingPayments(false);

    if (res.success) {
      setPaymentsStatus('success');
      setPaymentsMessage(res.message);
    } else {
      setPaymentsStatus('error');
      setPaymentsMessage(res.message);
    }
  };

  return (
    <div className="w-full py-6 flex flex-col items-center justify-center text-center">
      {/* Prominent, Clearly Visible Action Button */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={handleTest}
          disabled={testing}
          type="button"
          className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:from-amber-300 hover:to-amber-200 text-neutral-950 font-extrabold text-xs sm:text-sm tracking-wider uppercase shadow-xl shadow-amber-500/20 hover:shadow-amber-500/40 border border-amber-300 active:scale-95 transition-all cursor-pointer disabled:opacity-60"
          aria-label="Test Supabase Connection"
        >
          {testing ? (
            <Loader2 className="w-4 h-4 animate-spin text-neutral-950 shrink-0" />
          ) : (
            <Database className="w-4 h-4 text-neutral-950 shrink-0" />
          )}
          <span>{testing ? 'CHECKING SUPABASE...' : 'TEST SUPABASE CONNECTION'}</span>
        </button>

        <button
          onClick={handleTestPayments}
          disabled={testingPayments}
          type="button"
          className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-white/10 hover:bg-white/15 text-neutral-200 hover:text-white font-semibold text-xs tracking-wider uppercase border border-white/20 active:scale-95 transition-all cursor-pointer disabled:opacity-60"
          title="Verify public.payments table status"
        >
          {testingPayments ? (
            <Loader2 className="w-4 h-4 animate-spin text-amber-400 shrink-0" />
          ) : (
            <CreditCard className="w-4 h-4 text-amber-400 shrink-0" />
          )}
          <span>Check `payments` Table</span>
        </button>
      </div>

      {/* Connection State Output */}
      {status === 'success' && (
        <div className="mt-4 flex flex-col items-center gap-2">
          <div className="px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm font-semibold inline-flex items-center gap-2 animate-in fade-in duration-300 shadow-lg shadow-emerald-500/10">
            <span>✅ Supabase Connected Successfully</span>
          </div>
          {diagnostics && (
            <div className="text-[11px] font-mono text-neutral-400">
              Read URL from <span className="text-amber-300">{diagnostics.urlSource}</span> & Key from <span className="text-amber-300">{diagnostics.keySource}</span>
            </div>
          )}
        </div>
      )}

      {status === 'error' && (
        <div className="mt-4 max-w-lg px-4 py-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs sm:text-sm text-left flex flex-col gap-2 animate-in fade-in duration-300 shadow-lg shadow-rose-500/10">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <div className="font-semibold text-rose-200">Supabase Connection Error:</div>
              <div className="font-mono text-[11px] sm:text-xs text-rose-300 break-all leading-relaxed">
                {errorMessage}
              </div>
            </div>
          </div>
          {diagnostics && (
            <div className="pt-2 border-t border-rose-500/20 text-[11px] font-mono text-neutral-400">
              Target variables: URL [<span className="text-amber-300">{diagnostics.urlSource}</span>], Key [<span className="text-amber-300">{diagnostics.keySource}</span>]
            </div>
          )}
        </div>
      )}

      {/* Payments Table Check State */}
      {paymentsStatus === 'success' && (
        <div className="mt-3 px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs inline-flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{paymentsMessage}</span>
        </div>
      )}

      {paymentsStatus === 'error' && (
        <div className="mt-3 max-w-lg px-4 py-2 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs inline-flex items-center gap-2 text-left animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Payments table status: {paymentsMessage}</span>
        </div>
      )}
    </div>
  );
}
