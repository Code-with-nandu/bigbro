import { useState, useEffect } from 'react';
import { X, CheckCircle, HeartHandshake, Shield, Briefcase, GraduationCap, Loader2, AlertCircle, Database, CheckCircle2 } from 'lucide-react';
import { supabase, testSupabaseConnection, activeEnvDetails } from '../supabase';

interface JoinModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: string;
  defaultAmount?: number;
}

export default function JoinModal({ isOpen, onClose, defaultRole = 'mentor', defaultAmount }: JoinModalProps) {
  const [role, setRole] = useState<string>(defaultRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState<string>(defaultAmount ? defaultAmount.toString() : '2500');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Connection testing state
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [connectionMessage, setConnectionMessage] = useState<string>('');

  useEffect(() => {
    if (defaultRole) setRole(defaultRole);
    if (defaultAmount) setAmount(defaultAmount.toString());
  }, [defaultRole, defaultAmount]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setConnectionStatus('idle');
    setConnectionMessage('');

    const res = await testSupabaseConnection();
    setTestingConnection(false);

    if (res.success) {
      setConnectionStatus('success');
      setConnectionMessage(res.message);
    } else {
      setConnectionStatus('error');
      setConnectionMessage(res.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    // 1. Validate full_name and email
    if (!trimmedName) {
      setError('Please provide your full name.');
      return;
    }

    if (!trimmedEmail) {
      setError('Please provide your email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError('Please enter a valid email address (e.g. name@example.com).');
      return;
    }

    setSubmitting(true);

    try {
      // Build note content including pledge amount if applicable
      let combinedNote = message.trim();
      if (role === 'sponsor' && amount) {
        const pledgeNote = `Pledged Amount: ₹${amount}/mo`;
        combinedNote = combinedNote ? `${pledgeNote} | ${combinedNote}` : pledgeNote;
      }

      // 2. Insert the form data directly into public.commitments
      // Using only the required columns: contribution_type, full_name, email, phone, note
      const { error: insertError } = await supabase
        .from('commitments')
        .insert([
          {
            contribution_type: role,
            full_name: trimmedName,
            email: trimmedEmail,
            phone: phone.trim() || null,
            note: combinedNote || null
          }
        ]);

      if (insertError) {
        // 3. Show the exact Supabase error message if the insert fails
        throw new Error(insertError.message || (typeof insertError === 'object' ? JSON.stringify(insertError) : 'Failed to submit commitment'));
      }

      // 4. Show a clear success message after a successful insert
      setSubmitted(true);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(`Supabase Error: ${errorMsg}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setError(null);
    setName('');
    setEmail('');
    setPhone('');
    setMessage('');
    setConnectionStatus('idle');
    setConnectionMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-xl bg-[#0e0e15] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden text-left"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          disabled={submitting}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/15 text-neutral-300 hover:text-white transition-colors disabled:opacity-50"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-white">Your commitment has been submitted successfully.</h3>
            <p className="text-sm text-neutral-300 max-w-md mx-auto leading-relaxed">
              Thank you, <span className="text-white font-medium">{name}</span>! Your commitment as a{' '}
              <span className="text-amber-300 font-semibold">{role}</span> has been stored in <code className="text-amber-300 text-xs font-mono">public.commitments</code>.
            </p>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              A coordinator will follow up with you at{' '}
              <span className="text-amber-200 font-mono">{email}</span>.
            </p>
            <div className="pt-4">
              <button
                onClick={handleReset}
                className="px-6 py-2.5 rounded-full bg-amber-400 text-neutral-950 font-semibold text-xs hover:bg-amber-300 transition-colors cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1">
                May Tera · Join the Movement
              </div>
              <h3 className="text-2xl font-bold text-white tracking-tight">May Tera (Mai Tera / Big Bro)</h3>
              <p className="text-xs text-neutral-300 leading-relaxed mt-1">
                Stand with our 13 palliative care students so they can stand on their own feet.
              </p>
            </div>

            {/* Role Selector Tabs */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-300">How would you like to contribute?</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'mentor', label: '1-on-1 Mentor', icon: HeartHandshake },
                  { id: 'sponsor', label: 'Fund Supporter', icon: Shield },
                  { id: 'employer', label: 'Hire a Trainee', icon: Briefcase },
                  { id: 'volunteer', label: 'Skill Trainer', icon: GraduationCap }
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = role === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      disabled={submitting}
                      onClick={() => setRole(item.id)}
                      className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                        isSelected
                          ? 'bg-amber-400/15 border-amber-400 text-amber-300 font-semibold'
                          : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-[11px] leading-tight">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional Amount for Fund Supporter */}
            {role === 'sponsor' && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1.5">
                <label className="text-xs font-medium text-amber-200">Pledge Amount (₹)</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-neutral-400">₹</span>
                  <input
                    type="number"
                    value={amount}
                    disabled={submitting}
                    onChange={(e) => setAmount(e.target.value)}
                    min="500"
                    step="500"
                    placeholder="2500"
                    className="w-full bg-black/40 border border-white/15 rounded-lg px-3 py-1.5 text-sm text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div className="text-[10px] text-neutral-400">
                  Target: ₹10,000/month covers the entire group of 13 students.
                </div>
              </div>
            )}

            {/* Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-300">Your Full Name *</label>
                <input
                  type="text"
                  required
                  disabled={submitting}
                  placeholder="e.g. Dr. Soumen Roy"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-colors disabled:opacity-50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-300">Email Address *</label>
                <input
                  type="email"
                  required
                  disabled={submitting}
                  placeholder="e.g. name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-colors disabled:opacity-50"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-neutral-300">Phone / WhatsApp (Optional)</label>
              <input
                type="tel"
                disabled={submitting}
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-colors disabled:opacity-50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-neutral-300">Note or Relevant Experience</label>
              <textarea
                rows={2}
                disabled={submitting}
                placeholder="Share a short note on how you'd like to support (e.g., healthcare professional, spoken English coach, hiring hospice)..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-colors resize-none disabled:opacity-50"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <div className="space-y-0.5">
                  <div className="font-semibold text-rose-200">Submission Error</div>
                  <div className="font-mono text-[11px] leading-snug">{error}</div>
                </div>
              </div>
            )}

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-neutral-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-neutral-950" />
                    <span>Submitting to Supabase...</span>
                  </>
                ) : (
                  <span>Submit Commitment</span>
                )}
              </button>

              {/* Direct In-Modal Supabase Connection Test */}
              <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[11px] text-neutral-400">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testingConnection || submitting}
                  className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-amber-300 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {testingConnection ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                  ) : (
                    <Database className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  <span>Test Supabase Connection</span>
                </button>

                {connectionStatus === 'success' && (
                  <span className="inline-flex items-center gap-1 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Supabase Connected</span>
                  </span>
                )}

                {connectionStatus === 'error' && (
                  <span className="inline-flex items-center gap-1 text-rose-400 truncate max-w-[200px]" title={connectionMessage}>
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{connectionMessage}</span>
                  </span>
                )}
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
