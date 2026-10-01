import { useState } from 'react';
import { Coins, HeartHandshake, MessageSquareQuote, Briefcase, Activity, ArrowRight, ShieldCheck } from 'lucide-react';
import { FIVE_PROBLEMS, FIVE_PILLARS } from '../data/mockData';
import TiltCard3D from './TiltCard3D';

const ICONS_MAP: Record<string, any> = {
  Coins,
  HeartHandshake,
  MessageSquareQuote,
  Briefcase,
  Activity
};

export default function ProblemsAndPillars() {
  const [activeTab, setActiveTab] = useState<'problems' | 'pillars' | 'pairing'>('pairing');
  const [selectedPillarId, setSelectedPillarId] = useState<number>(1);

  const activePillar = FIVE_PILLARS.find((p) => p.id === selectedPillarId) || FIVE_PILLARS[0];
  const pairedProblem = FIVE_PROBLEMS.find((prob) => prob.id === activePillar.answersProblemId) || FIVE_PROBLEMS[0];

  return (
    <section id="problems-pillars" className="relative py-24 px-4 sm:px-6 max-w-6xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="max-w-2xl">
          <div className="text-xs font-semibold tracking-wider uppercase text-amber-400 mb-2">
            02 & 03. The Real Hurdles & The Big Bro Shield
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3">
            Five fatal drop-out triggers. Five unbreakable pillars.
          </h2>
          <p className="text-base text-neutral-300 leading-relaxed">
            Vocational training usually fails not because of the syllabus, but because life happens in the margins.
            Here is how BIG BRO (May 13 / Mai Tera) methodically shields each student.
          </p>
        </div>

        {/* View Switcher Tabs (Accessible Buttons) */}
        <div className="flex items-center gap-1 p-1 bg-white/5 border border-white/10 rounded-xl backdrop-blur-md shrink-0">
          <button
            onClick={() => setActiveTab('pairing')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'pairing'
                ? 'bg-amber-400 text-neutral-950 font-semibold shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Direct Pairing (Matrix)
          </button>
          <button
            onClick={() => setActiveTab('problems')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'problems'
                ? 'bg-amber-400 text-neutral-950 font-semibold shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            The 5 Problems
          </button>
          <button
            onClick={() => setActiveTab('pillars')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'pillars'
                ? 'bg-amber-400 text-neutral-950 font-semibold shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            The 5 Pillars
          </button>
        </div>
      </div>

      {/* Mode 1: Interactive Pairing (Problem vs Pillar Matrix) */}
      {activeTab === 'pairing' && (
        <div className="space-y-6">
          {/* Quick Pillar Selector Row */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {FIVE_PILLARS.map((pillar) => {
              const isSelected = pillar.id === selectedPillarId;
              const prob = FIVE_PROBLEMS.find((p) => p.id === pillar.answersProblemId);
              return (
                <button
                  key={pillar.id}
                  onClick={() => setSelectedPillarId(pillar.id)}
                  className={`p-3 rounded-xl text-left border transition-all duration-200 ${
                    isSelected
                      ? 'bg-neutral-900 border-amber-400/80 shadow-lg shadow-amber-500/10'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-mono text-neutral-400">Pillar 0{pillar.id}</span>
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                  </div>
                  <div className="text-xs font-semibold text-white line-clamp-1">{pillar.title}</div>
                  <div className="text-[10px] text-neutral-400 mt-1 line-clamp-1">vs {prob?.title}</div>
                </button>
              );
            })}
          </div>

          {/* Interactive Dual Panel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: The Ground Problem */}
            <TiltCard3D maxTilt={6}>
              <div className="h-full p-6 sm:p-8 rounded-3xl glass-panel border border-rose-500/20 bg-rose-950/10 relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold tracking-wider uppercase text-rose-400">
                    The Hurdle · Problem 0{pairedProblem.id}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-rose-500/15 text-rose-300 border border-rose-500/30">
                    Daily Dropout Risk
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-white mb-2">{pairedProblem.title}</h3>
                <p className="text-sm font-medium text-rose-200/90 mb-4">{pairedProblem.shortSummary}</p>

                <div className="space-y-4 pt-4 border-t border-rose-500/20 text-neutral-300 text-sm leading-relaxed">
                  <div>
                    <div className="text-xs font-semibold uppercase text-neutral-400 mb-1">Ground Reality</div>
                    <p>{pairedProblem.groundReality}</p>
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase text-neutral-400 mb-1">Impact on Trainee</div>
                    <p className="text-neutral-400">{pairedProblem.impactOnTrainee}</p>
                  </div>
                </div>
              </div>
            </TiltCard3D>

            {/* Right: The Big Bro Shield */}
            <TiltCard3D maxTilt={6}>
              <div className="h-full p-6 sm:p-8 rounded-3xl glass-panel border border-amber-500/30 bg-neutral-900/80 relative overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold tracking-wider uppercase text-amber-400">
                    The Shield · Pillar 0{activePillar.id}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-400/15 text-amber-300 border border-amber-400/30">
                    Big Bro (Mai Tera) Solution
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-white mb-1">{activePillar.title}</h3>
                <p className="text-sm font-medium text-amber-200/90 mb-4">{activePillar.subtitle}</p>

                <p className="text-sm text-neutral-300 leading-relaxed mb-5">
                  {activePillar.actionProtocol}
                </p>

                <div className="space-y-2 pt-4 border-t border-white/10">
                  <div className="text-xs font-semibold uppercase text-neutral-400 mb-2">How We Deliver</div>
                  {activePillar.howWeDeliver.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-neutral-300">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                  <span className="text-neutral-400">Pillar Benchmark:</span>
                  <span className="font-semibold text-amber-300">{activePillar.keyMetric}</span>
                </div>
              </div>
            </TiltCard3D>
          </div>
        </div>
      )}

      {/* Mode 2: All 5 Problems Grid */}
      {activeTab === 'problems' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FIVE_PROBLEMS.map((prob) => {
            const IconComp = ICONS_MAP[prob.iconName] || Coins;
            return (
              <div
                key={prob.id}
                className="p-6 rounded-2xl glass-panel border border-white/10 hover:border-rose-500/30 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono text-neutral-500">Problem 0{prob.id}</span>
                    <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
                      <IconComp className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">{prob.title}</h3>
                  <p className="text-xs text-rose-300 font-medium mb-3">{prob.shortSummary}</p>
                  <p className="text-xs text-neutral-300 leading-relaxed mb-4">{prob.groundReality}</p>
                </div>
                <div className="pt-3 border-t border-white/10 text-[11px] text-neutral-400">
                  <span className="text-neutral-500">Risk: </span>
                  {prob.impactOnTrainee}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Mode 3: All 5 Pillars Grid */}
      {activeTab === 'pillars' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FIVE_PILLARS.map((pillar) => (
            <div
              key={pillar.id}
              className="p-6 rounded-2xl glass-panel border border-white/10 hover:border-amber-400/40 transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono text-amber-400">Pillar 0{pillar.id}</span>
                  <span className="text-[11px] text-neutral-400">Answers Problem 0{pillar.answersProblemId}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{pillar.title}</h3>
                <p className="text-xs text-amber-300/90 font-medium mb-3">{pillar.subtitle}</p>
                <p className="text-xs text-neutral-300 leading-relaxed mb-4">{pillar.actionProtocol}</p>
              </div>

              <div className="space-y-1.5 pt-3 border-t border-white/10">
                {pillar.howWeDeliver.slice(0, 2).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-[11px] text-neutral-300">
                    <span className="w-1 h-1 rounded-full bg-amber-400" />
                    <span className="truncate">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
