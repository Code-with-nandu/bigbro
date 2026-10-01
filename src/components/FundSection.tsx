import { useState } from 'react';
import { AlertCircle, Check, ArrowRight, ShieldCheck, Sparkles, Building2, HeartHandshake } from 'lucide-react';
import { FUND_ALLOCATIONS, CONTRIBUTION_TIERS, PILOT_FACTS, INSTITUTIONAL_PARTNERSHIP } from '../data/mockData';
import TiltCard3D from './TiltCard3D';

interface FundSectionProps {
  onOpenJoinModal: (role?: string, prefillAmount?: number) => void;
}

export default function FundSection({ onOpenJoinModal }: FundSectionProps) {
  const [selectedTier, setSelectedTier] = useState<string>('full_month');
  const [customAmount, setCustomAmount] = useState<number>(10000);

  const activeTier = CONTRIBUTION_TIERS.find((t) => t.id === selectedTier) || CONTRIBUTION_TIERS[3];

  const handleSelectTier = (tierId: string, amount: number) => {
    setSelectedTier(tierId);
    setCustomAmount(amount);
  };

  return (
    <section id="fund" className="relative py-24 px-4 sm:px-6 max-w-6xl mx-auto">
      {/* Background ambient glow */}
      <div className="absolute top-1/3 right-10 w-[450px] h-[350px] bg-amber-500/5 blur-[140px] pointer-events-none rounded-full" />

      {/* Section Header */}
      <div className="max-w-3xl mb-10">
        <div className="text-xs font-semibold tracking-wider uppercase text-amber-400 mb-2">
          06. Radical Financial Transparency
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3">
          BIG BROTHER ₹10,000 Monthly Common Support Fund
        </h2>
        <div className="text-sm font-mono text-amber-300/90 mb-3">
          Pilot Cohort 01 · 13 Palliative Care Trainees · (May 13 / Mai Tera)
        </div>
        <p className="text-base text-neutral-300 leading-relaxed">
          Art of Living provides the core training infrastructure. BIG BROTHER provides an additional, agile personal-support layer around each student.
        </p>
      </div>

      {/* Institutional Partnership Synergy Bento (Art of Living + BIG BRO) */}
      <div className="mb-10 grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left: Art of Living Core Infrastructure */}
        <div className="p-6 rounded-2xl glass-panel border border-sky-500/20 bg-sky-950/10 space-y-4">
          <div className="flex items-center gap-2.5 text-sky-400">
            <Building2 className="w-5 h-5 shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wider">Art of Living Foundation</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Core Training Infrastructure</h3>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Art of Living already provides and guarantees the foundational pillars:
            </p>
          </div>
          <ul className="space-y-2 text-xs text-neutral-200">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-1.5 shrink-0" />
              <span><strong>Local transportation support</strong> ensuring daily commute to classes and clinical rotations.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-1.5 shrink-0" />
              <span><strong>Shared meals / nutrition support</strong> during demanding 8-hour training shifts and hospital internships.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-1.5 shrink-0" />
              <span>Comprehensive certified palliative healthcare syllabus and clinical faculty.</span>
            </li>
          </ul>
        </div>

        {/* Right: BIG BROTHER Personal Support Layer */}
        <div className="p-6 rounded-2xl glass-panel border border-amber-500/30 bg-amber-950/10 space-y-4">
          <div className="flex items-center gap-2.5 text-amber-400">
            <HeartHandshake className="w-5 h-5 shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wider">BIG BROTHER / BIG BRO (May 13 / Mai Tera)</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Additional Personal-Support Layer</h3>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Focuses on additional, need-based micro-support via the ₹10,000 common pool:
            </p>
          </div>
          <ul className="space-y-2 text-xs text-neutral-200">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
              <span><strong>Emergency personal needs</strong> — small unexpected expenses in genuine difficulty.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
              <span><strong>Essential learning expenses</strong> — notebooks, stationery, printing & study materials.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
              <span><strong>Digital, wellbeing & transition support</strong> — internet data, hygiene, and interview expenses.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* MANDATORY CLARIFICATION CALLOUT BANNER */}
      <div className="mb-12 p-5 sm:p-6 rounded-2xl bg-amber-500/10 border-2 border-amber-400/40 relative overflow-hidden flex items-start gap-4 shadow-xl">
        <div className="p-2.5 rounded-xl bg-amber-400 text-neutral-950 shrink-0 mt-0.5">
          <AlertCircle className="w-5 h-5 font-bold" />
        </div>
        <div className="space-y-1.5">
          <div className="text-xs font-bold uppercase tracking-wider text-amber-300">
            Important Clarification on the ₹10,000 Common Fund
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
            The ₹10,000 is a common monthly fund for all 13 students, not ₹10,000 per student and not a guaranteed monthly payment to every student.
          </h3>
          <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed">
            This actually makes the BIG BROTHER concept stronger: Art of Living provides the core training infrastructure; BIG BROTHER provides an additional personal-support layer around the student.
          </p>
        </div>
      </div>

      {/* Core Breakdown Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
        {/* Left: Itemized Need-Based Allocation Ledger (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h4 className="text-lg font-bold text-white">Need-Based Support Allocation</h4>
              <p className="text-xs text-neutral-400">Disbursed dynamically on case-by-case assessment</p>
            </div>
            <span className="text-xs font-mono text-amber-400 font-semibold px-2.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/20">
              ₹10,000 / Month Common Pool
            </span>
          </div>

          {/* Allocation Progress Bar */}
          <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden flex">
            {FUND_ALLOCATIONS.map((item, idx) => (
              <div
                key={idx}
                className={`${item.color} h-full transition-all duration-300`}
                style={{ width: `${item.percentage}%` }}
                title={`${item.category}: ${item.percentage}% (₹${item.monthlyAmount})`}
              />
            ))}
          </div>

          {/* Itemized Categories List (6 Need-Based Points) */}
          <div className="space-y-3.5">
            {FUND_ALLOCATIONS.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl glass-panel border border-white/10 hover:border-white/20 transition-all space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                    <span className="text-sm font-bold text-white">{item.category}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-mono font-bold text-white tabular-nums">
                      ₹{item.monthlyAmount.toLocaleString()}
                    </span>
                    <span className="text-xs text-neutral-400 ml-1.5 font-mono">({item.percentage}%)</span>
                  </div>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">{item.description}</p>
                <div className="text-[11px] text-amber-300/80 font-mono pt-1">
                  Scope: {item.perStudentBreakdown}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs text-neutral-300">
            <span>Total Monthly Common Fund:</span>
            <span className="text-base font-bold font-mono text-emerald-400">₹10,000 / month (for all 13 trainees)</span>
          </div>
        </div>

        {/* Right: Interactive Contribution Simulator (5 cols) */}
        <div className="lg:col-span-5">
          <TiltCard3D maxTilt={6} className="h-full">
            <div className="h-full p-6 sm:p-8 rounded-3xl glass-panel border border-white/15 bg-neutral-900/90 relative overflow-hidden flex flex-col justify-between shadow-2xl">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                    Sponsor The Safety Net
                  </span>
                  <span className="text-[11px] text-neutral-400 font-mono">Transparent Case-by-Case Support</span>
                </div>

                <h3 className="text-xl font-bold text-white mb-2">Back the 13 Trainees</h3>
                <p className="text-xs text-neutral-300 leading-relaxed mb-6">
                  Select a need-based support tier or adopt the entire monthly pool of ₹10,000 for all 13 students.
                </p>

                {/* Contribution Tiers Buttons */}
                <div className="space-y-2.5 mb-6">
                  {CONTRIBUTION_TIERS.map((tier) => {
                    const isSelected = selectedTier === tier.id;
                    return (
                      <button
                        key={tier.id}
                        onClick={() => handleSelectTier(tier.id, tier.amount)}
                        className={`w-full p-3.5 rounded-xl text-left border transition-all duration-200 flex items-center justify-between ${
                          isSelected
                            ? 'bg-amber-400/10 border-amber-400 text-white shadow-md shadow-amber-500/10'
                            : 'bg-white/5 border-white/10 hover:border-white/20 text-neutral-300'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-semibold text-white">{tier.name}</div>
                          <div className="text-[11px] text-neutral-400">{tier.scope}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-mono font-bold text-amber-300 tabular-nums">
                            ₹{tier.amount.toLocaleString()}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Impact summary for selected tier */}
                {activeTier && (
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-6 text-xs leading-relaxed text-neutral-200">
                    <span className="font-semibold text-white">Direct Result: </span>
                    {activeTier.impactDescription}
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-white/10 space-y-2">
                <button
                  onClick={() => onOpenJoinModal('sponsor', customAmount)}
                  className="w-full py-3 px-4 rounded-full bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-neutral-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 active:scale-98 transition-all cursor-pointer"
                >
                  <span>Pledge ₹{customAmount.toLocaleString()} to Big Bro (Mai Tera)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <a
                  href="#upi-payment"
                  className="w-full py-2.5 px-4 rounded-full bg-white/5 hover:bg-white/10 text-amber-300 font-semibold text-xs flex items-center justify-center gap-1.5 border border-amber-400/25 transition-all text-center block"
                >
                  <span>Or Pay Directly via Instant UPI (GPay / PhonePe / Paytm)</span>
                </a>
                <p className="text-center text-[10px] text-neutral-500 mt-2">
                  100% directed to the 13 trainees' personal-support pool. Monthly transparent itemized reporting.
                </p>
              </div>
            </div>
          </TiltCard3D>
        </div>
      </div>
    </section>
  );
}
