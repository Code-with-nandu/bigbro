import React, { useState } from 'react';
import {
  Smartphone,
  Copy,
  Check,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Sparkles,
  Info,
  Clock
} from 'lucide-react';
import { supabase } from '../supabase';
import { UPI_CONFIG, buildUpiIntentUrl } from '../config/upiConfig';
import UpiQrCodeDisplay from './UpiQrCodeDisplay';

export default function UpiPaymentSection() {
  const [amount, setAmount] = useState<string>('2500');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [showConfirmationForm, setShowConfirmationForm] = useState(false);

  // Confirmation form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmedAmount, setConfirmedAmount] = useState<string>('2500');
  const [upiRefId, setUpiRefId] = useState('');
  const [note, setNote] = useState('');

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const numericAmount = Math.max(1, Number(amount) || 0);
  const upiIntentUrl = buildUpiIntentUrl(numericAmount);

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(UPI_CONFIG.upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const handleOpenConfirmationForm = () => {
    setConfirmedAmount(amount);
    setShowConfirmationForm(true);
    setSubmissionError(null);
  };

  const handleSubmitPaymentConfirmation = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionError(null);

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();
    const trimmedRef = upiRefId.trim();
    const parsedAmount = Number(confirmedAmount);

    if (!trimmedName) {
      setSubmissionError('Please provide your full name.');
      return;
    }

    if (!trimmedEmail) {
      setSubmissionError('Please provide your email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setSubmissionError('Please enter a valid email address.');
      return;
    }

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setSubmissionError('Please enter a valid contribution amount.');
      return;
    }

    if (!trimmedRef) {
      setSubmissionError('Please provide your UPI Transaction / Reference ID (12-digit UTR).');
      return;
    }

    setSubmitting(true);

    try {
      // Direct insertion into existing public.payments table with pending status
      const { error: insertError } = await supabase
        .from('payments')
        .insert([
          {
            full_name: trimmedName,
            email: trimmedEmail,
            phone: phone.trim() || null,
            amount: parsedAmount,
            currency: 'INR',
            payment_gateway: 'direct_upi',
            order_id: null,
            payment_id: trimmedRef,
            payment_status: 'pending',
            note: note.trim() || null
          }
        ]);

      if (insertError) {
        throw new Error(insertError.message || (typeof insertError === 'object' ? JSON.stringify(insertError) : 'Failed to record payment confirmation'));
      }

      setSubmissionSuccess(true);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setSubmissionError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetConfirmation = () => {
    setSubmissionSuccess(false);
    setShowConfirmationForm(false);
    setFullName('');
    setEmail('');
    setPhone('');
    setUpiRefId('');
    setNote('');
    setSubmissionError(null);
  };

  return (
    <section id="upi-payment" className="relative py-20 px-4 sm:px-6 bg-[#07070b] border-t border-b border-white/10 overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/25 text-amber-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Direct Community Support</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Support / Pay with Direct UPI
          </h2>
          <p className="text-sm text-neutral-400 leading-relaxed">
            100% of your contribution goes directly to the student support fund. No middleman, no gateway commissions. Pay directly via any UPI app.
          </p>
        </div>

        {/* Main Payment Container */}
        <div className="bg-[#0c0c12] border border-white/15 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Amount Selection & Direct UPI Pay Action */}
            <div className="lg:col-span-7 space-y-6">
              {/* Step 1: Choose Amount */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider flex items-center justify-between">
                  <span>1. Select or Enter Amount (INR)</span>
                  <span className="text-amber-400 font-mono text-xs">₹10k Goal / Mo</span>
                </label>

                {/* Preset Chips */}
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {UPI_CONFIG.presetAmounts.map((preset) => {
                    const isSelected = amount === preset.toString();
                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setAmount(preset.toString())}
                        className={`py-2 px-3 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-400 border-amber-300 text-neutral-950 shadow-md shadow-amber-500/20'
                            : 'bg-white/5 border-white/10 text-neutral-300 hover:border-white/25 hover:text-white'
                        }`}
                      >
                        ₹{preset.toLocaleString()}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Amount Input */}
                <div className="relative mt-2">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 font-mono text-lg font-bold">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="100"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter custom amount"
                    className="w-full bg-white/5 border border-white/15 focus:border-amber-400 rounded-2xl pl-10 pr-4 py-3 text-lg font-mono font-bold text-white placeholder-neutral-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Step 2: UPI ID & Payee Display Area */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span className="font-semibold uppercase tracking-wider text-[11px]">Direct UPI ID (VPA)</span>
                  <span className="text-emerald-400 text-[11px] font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified Direct Account
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 bg-black/40 border border-white/10 rounded-xl px-4 py-3">
                  <div className="font-mono text-sm sm:text-base font-bold text-amber-300 tracking-wide select-all">
                    {UPI_CONFIG.upiId}
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-neutral-200 text-xs font-medium transition-colors cursor-pointer shrink-0"
                    title="Copy UPI ID to clipboard"
                  >
                    {copiedUpi ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Clearly Display Payee Name & Amount Preview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-white/10 text-xs">
                  <div>
                    <span className="text-neutral-500 text-[11px] block">Payee Name:</span>
                    <span className="text-white font-semibold">{UPI_CONFIG.payeeName}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 text-[11px] block">Amount to Transfer:</span>
                    <span className="text-amber-300 font-mono font-bold">₹{numericAmount.toLocaleString()} INR</span>
                  </div>
                </div>
              </div>

              {/* Step 3: Direct UPI Payment Buttons */}
              <div className="space-y-3 pt-2">
                <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
                  2. Make Payment
                </label>

                {/* Direct App Launch Button for Mobile / Supported Desktops */}
                <a
                  href={upiIntentUrl}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:from-amber-300 hover:to-amber-200 text-neutral-950 font-bold text-sm tracking-wide shadow-xl shadow-amber-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Smartphone className="w-4 h-4 shrink-0 text-neutral-950" />
                  <span>Pay ₹{numericAmount.toLocaleString()} to {UPI_CONFIG.payeeName} via Any UPI App</span>
                  <ArrowRight className="w-4 h-4 shrink-0 text-neutral-950" />
                </a>

                {/* Completed Payment Trigger Button */}
                <button
                  type="button"
                  onClick={handleOpenConfirmationForm}
                  className="w-full py-3.5 px-6 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs sm:text-sm tracking-wide border border-white/20 hover:border-amber-400/50 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>I Have Completed the Payment</span>
                </button>
              </div>

              {/* Verification Protocol Notice */}
              <div className="flex items-start gap-2 text-[11px] text-neutral-400 bg-white/[0.02] p-3 rounded-xl border border-white/5">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Verification Notice:</strong> Direct UPI payments are not automatically verified by a gateway. Once you transfer ₹{numericAmount.toLocaleString()} to <strong>{UPI_CONFIG.upiId}</strong> ({UPI_CONFIG.payeeName}), click <strong>"I Have Completed the Payment"</strong> to submit your 12-digit UTR/Reference ID. Status starts as <strong>pending</strong> and is confirmed after manual reconciliation.
                </p>
              </div>
            </div>

            {/* Right Column: Dynamic QR Code Display Area */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 rounded-2xl bg-black/40 border border-white/10 text-center space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
                <QrCode className="w-4 h-4" />
                <span>Dynamic UPI QR Code</span>
              </div>

              {/* Dynamic QR Code for the exact current amount */}
              <UpiQrCodeDisplay
                value={upiIntentUrl}
                size={300}
                customImageUrl={UPI_CONFIG.customQrImageUrl}
                upiId={UPI_CONFIG.upiId}
                amount={numericAmount}
              />

              {/* Clear Amount and Payee Indicator */}
              <div className="space-y-1 w-full pt-1">
                <div className="font-mono text-xl font-bold text-white">
                  ₹{numericAmount.toLocaleString()}
                </div>
                <div className="text-xs text-amber-300/90 font-medium">
                  Pay to: {UPI_CONFIG.payeeName}
                </div>
                <div className="text-[11px] font-mono text-neutral-400 select-all">
                  {UPI_CONFIG.upiId}
                </div>
                <div className="text-[10px] text-neutral-500 pt-1">
                  Scan using Google Pay, PhonePe, Paytm, or BHIM
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Confirmation Modal */}
        {showConfirmationForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
            <div
              className="relative w-full max-w-lg bg-[#0e0e15] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden text-left"
              onClick={(e) => e.stopPropagation()}
            >
              {submissionSuccess ? (
                <div className="py-6 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center mx-auto">
                    <Clock className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Payment Submission Recorded</h3>
                  <p className="text-sm text-neutral-300 max-w-md mx-auto leading-relaxed">
                    Thank you, <span className="text-white font-medium">{fullName}</span>! Your payment details of{' '}
                    <span className="text-amber-300 font-mono font-bold">₹{Number(confirmedAmount).toLocaleString()}</span>{' '}
                    with Reference ID <code className="text-amber-300 text-xs font-mono">{upiRefId}</code> have been saved to our database with status <span className="px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 font-mono text-xs">pending</span>.
                  </p>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-neutral-300 text-left space-y-1">
                    <div className="text-neutral-400 text-[11px]">Notice:</div>
                    <div>Direct UPI payments are manually verified against bank records. We will confirm your payment via email at <span className="text-amber-200 font-mono">{email}</span> once reconciled.</div>
                  </div>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleResetConfirmation}
                      className="px-6 py-2.5 rounded-full bg-amber-400 text-neutral-950 font-semibold text-xs hover:bg-amber-300 transition-colors cursor-pointer"
                    >
                      Close Window
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitPaymentConfirmation} className="space-y-4">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1">
                      Direct UPI Contribution
                    </div>
                    <h3 className="text-2xl font-bold text-white tracking-tight">I Have Completed the Payment</h3>
                    <p className="text-xs text-neutral-300 leading-relaxed mt-1">
                      Please enter your details and the 12-digit UPI Transaction / Reference ID (UTR) from your bank or payment app.
                    </p>
                  </div>

                  {/* Amount and UPI ID Summary */}
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-neutral-400">Transferring to:</span>{' '}
                      <span className="font-mono text-amber-300 font-semibold">{UPI_CONFIG.upiId}</span>
                      <span className="text-neutral-400 text-[11px] block">{UPI_CONFIG.payeeName}</span>
                    </div>
                    <div className="font-mono text-white font-bold text-sm">
                      ₹{Number(confirmedAmount || 0).toLocaleString()}
                    </div>
                  </div>

                  {/* Form inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-neutral-300">Full Name *</label>
                      <input
                        type="text"
                        required
                        disabled={submitting}
                        placeholder="e.g. Soumen Roy"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-colors disabled:opacity-50"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-neutral-300">Email Address *</label>
                      <input
                        type="email"
                        required
                        disabled={submitting}
                        placeholder="e.g. soumen@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-colors disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-neutral-300">Phone (Optional)</label>
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
                      <label className="text-xs font-medium text-neutral-300">Contribution Amount (₹) *</label>
                      <input
                        type="number"
                        required
                        min="1"
                        disabled={submitting}
                        value={confirmedAmount}
                        onChange={(e) => setConfirmedAmount(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-colors disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-neutral-300">
                      UPI Transaction / Reference ID (UTR) *
                    </label>
                    <input
                      type="text"
                      required
                      disabled={submitting}
                      placeholder="e.g. 423948293847 (12-digit reference number from GPay/PhonePe/Paytm)"
                      value={upiRefId}
                      onChange={(e) => setUpiRefId(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-colors disabled:opacity-50"
                    />
                    <p className="text-[10px] text-neutral-400">
                      Found in your payment app under "UPI Transaction ID" or "Google Pay Transaction ID".
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-neutral-300">Note / Message (Optional)</label>
                    <textarea
                      rows={2}
                      disabled={submitting}
                      placeholder="Optional note for the students or team..."
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-colors resize-none disabled:opacity-50"
                    />
                  </div>

                  {submissionError && (
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                      <div className="space-y-0.5">
                        <div className="font-semibold text-rose-200">Error Recording Payment:</div>
                        <div className="font-mono text-[11px] leading-snug">{submissionError}</div>
                      </div>
                    </div>
                  )}

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => setShowConfirmationForm(false)}
                      className="px-4 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-medium transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-neutral-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-neutral-950" />
                          <span>Saving to public.payments...</span>
                        </>
                      ) : (
                        <span>Confirm & Submit Details</span>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
