import { useState } from 'react';
import { ArrowRight, CheckCircle2, ChevronRight, Quote, Sparkles } from 'lucide-react';
import { JOURNEY_STAGES } from '../data/mockData';

export default function JourneySection() {
  const [activeStep, setActiveStep] = useState<number>(1);
  const currentStage = JOURNEY_STAGES.find((s) => s.step === activeStep) || JOURNEY_STAGES[0];

  return (
    <section id="journey" className="relative py-24 px-4 sm:px-6 max-w-6xl mx-auto">
      {/* Background radial atmosphere */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-amber-500/5 blur-[140px] pointer-events-none rounded-full" />

      {/* Section Header */}
      <div className="max-w-2xl mb-12">
        <div className="text-xs font-semibold tracking-wider uppercase text-amber-400 mb-2">
          05. The Core Journey
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3">
          Support → Skill → Opportunity → Job → Independence → Give Forward
        </h2>
        <p className="text-base text-neutral-300 leading-relaxed">
          The transformation roadmap. We accompany each individual from the first moment of instability to the day
          they stand on their own feet—and choose to extend a hand to someone behind them.
        </p>
      </div>

      {/* Step Progress Indicators (Desktop & Mobile) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-10">
        {JOURNEY_STAGES.map((stage) => {
          const isActive = stage.step === activeStep;
          const isPassed = stage.step < activeStep;
          return (
            <button
              key={stage.step}
              onClick={() => setActiveStep(stage.step)}
              className={`p-3.5 rounded-2xl text-left border transition-all duration-200 relative overflow-hidden group ${
                isActive
                  ? 'bg-neutral-900 border-amber-400 shadow-lg shadow-amber-500/10'
                  : isPassed
                  ? 'bg-white/5 border-white/15 hover:border-white/30'
                  : 'bg-white/5 border-white/10 opacity-70 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono tracking-widest text-neutral-400">
                  STEP 0{stage.step}
                </span>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />}
              </div>
              <div className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                {stage.name}
              </div>
              <div className="text-[11px] text-neutral-400 truncate mt-0.5">{stage.tagline}</div>
            </button>
          );
        })}
      </div>

      {/* Active Stage Detailed Showcase Card */}
      <div className="p-6 sm:p-10 rounded-3xl glass-panel border border-white/15 bg-neutral-950/70 relative overflow-hidden shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Details (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-semibold">
              <span>Step 0{currentStage.step} of 06</span>
              <span>·</span>
              <span>{currentStage.tagline}</span>
            </div>

            <div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-3">
                {currentStage.name}: {currentStage.tagline}
              </h3>
              <p className="text-sm sm:text-base text-neutral-300 leading-relaxed font-normal">
                {currentStage.description}
              </p>
            </div>

            {/* Milestones list */}
            <div className="space-y-2.5 pt-2">
              <div className="text-xs font-semibold uppercase text-neutral-400 tracking-wider">
                Concrete Cohort Milestones
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {currentStage.milestones.map((m, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-neutral-200">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                    <span>{m}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation between steps */}
            <div className="pt-4 flex items-center gap-3">
              <button
                disabled={activeStep === 1}
                onClick={() => setActiveStep((prev) => Math.max(1, prev - 1))}
                className="px-4 py-2 text-xs font-medium rounded-xl border border-white/15 text-neutral-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none hover:bg-white/5 transition-colors"
              >
                Previous Step
              </button>
              <button
                disabled={activeStep === 6}
                onClick={() => setActiveStep((prev) => Math.min(6, prev + 1))}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-amber-400 text-neutral-950 hover:bg-amber-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                Next Step
              </button>
            </div>
          </div>

          {/* Right Showcase Box (5 cols): Trainee Voice & Circular Impact */}
          <div className="lg:col-span-5 space-y-4">
            {/* Trainee Voice Quote Box */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 relative overflow-hidden">
              <Quote className="w-8 h-8 text-amber-400/20 absolute -top-1 -right-1" />
              <div className="text-xs uppercase font-semibold text-neutral-400 tracking-wider mb-2">
                Trainee Perspective
              </div>
              <p className="text-sm sm:text-base text-neutral-200 italic leading-relaxed mb-4">
                "{currentStage.studentQuote}"
              </p>
              <div className="text-xs font-medium text-amber-300">
                — {currentStage.studentAuthor}
              </div>
            </div>

            {/* Stage 6 Spotlight Callout if active */}
            {currentStage.step === 6 ? (
              <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/20 to-emerald-500/20 border border-amber-400/30">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase mb-1">
                  <Sparkles className="w-4 h-4" />
                  <span>The Perpetual Brotherhood</span>
                </div>
                <p className="text-xs text-neutral-200 leading-relaxed">
                  Giving Forward closes the loop. Today’s 13 students will become tomorrow’s elder mentors, funding the next 13 palliative care trainees with their own earnings.
                </p>
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-xs text-neutral-300 space-y-2">
                <div className="font-semibold text-white">How This Fuels Independence:</div>
                <p className="text-neutral-400 leading-relaxed">
                  By pairing clinical competency with psychological stability, students graduate without debt, without obligations to loan sharks, and ready for immediate employment.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
