import { ArrowRight, ChevronDown, Sparkles } from 'lucide-react';
import ThreeHeroWebGL from './ThreeHeroWebGL';

interface HeroProps {
  onOpenJoinModal: (role?: string) => void;
  onSelectStudent: (id: number) => void;
}

export default function Hero({ onOpenJoinModal, onSelectStudent }: HeroProps) {
  return (
    <section className="relative min-h-[92vh] sm:min-h-screen flex items-center justify-center pt-24 pb-16 px-4 sm:px-6 overflow-hidden">
      {/* 3D Depth Interactive WebGL Celestial Canvas */}
      <ThreeHeroWebGL onSelectStudent={onSelectStudent} />

      {/* Atmospheric Vignette and Horizon Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050508]/80 via-transparent to-[#050508] pointer-events-none" />

      {/* Main Hero Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center">
        {/* Eyebrow Pill Badge */}
        <a
          href="#first-13"
          className="group inline-flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full glass-pill hover:bg-white/12 transition-all duration-200 mb-8 border border-white/15"
        >
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-300 text-neutral-950 font-bold text-[10px] tracking-wider uppercase">
            May Tera · Pilot 13
          </span>
          <span className="text-xs font-medium text-neutral-200">
            13 Palliative Care Trainees · ₹10k/mo Common Pool
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
        </a>

        {/* Two-Line Masked Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.08]">
          <span className="block reveal-mask">
            <span className="inline-block animate-in fade-in slide-in-from-bottom-4 duration-700">
              Helping people
            </span>
          </span>
          <span className="block reveal-mask mt-1">
            <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-100 to-amber-200/90 animate-in fade-in slide-in-from-bottom-6 duration-1000">
              stand on their own feet.
            </span>
          </span>
        </h1>

        {/* Brand Tagline */}
        <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold tracking-widest uppercase text-amber-400/90 mb-5">
          <span>Support</span>
          <span className="text-neutral-600">·</span>
          <span>Empower</span>
          <span className="text-neutral-600">·</span>
          <span>Employ</span>
          <span className="text-neutral-600">·</span>
          <span>Give Forward</span>
        </div>

        {/* Sub-headline */}
        <p className="text-base sm:text-lg text-neutral-300 max-w-2xl mx-auto leading-relaxed mb-8 font-normal">
          <span className="text-amber-300 font-semibold">MAY TERA</span> (May 13 / Big Bro) is a community brotherhood shielding 13 frontline palliative care students from financial fragility.
          With a collective ₹10,000/month support fund, we bridge the five critical chasms between poverty and career dignity.
        </p>

        {/* CTA Action Row */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto justify-center mb-14">
          <button
            onClick={() => onOpenJoinModal()}
            className="w-full sm:w-auto px-6 py-3 text-sm font-semibold text-neutral-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-200 hover:from-amber-300 hover:to-amber-100 rounded-full shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all duration-200 active:scale-95"
          >
            Join May Tera (Mai Tera)
          </button>
          <a
            href="#journey"
            className="w-full sm:w-auto px-6 py-3 text-sm font-medium text-neutral-200 hover:text-white border border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 rounded-full transition-all duration-200 text-center backdrop-blur-sm"
          >
            Explore The Journey
          </a>
        </div>

        {/* Live Grounding Metrics Strip (Tabular Numerals) */}
        <div className="w-full max-w-3xl grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl glass-panel border border-white/10 text-left">
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums tracking-tight">
              13
            </div>
            <div className="text-xs text-neutral-400 font-medium">Students in Pilot</div>
            <div className="text-[11px] text-amber-400/80">Palliative Care Track</div>
          </div>

          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums tracking-tight">
              ₹10,000
            </div>
            <div className="text-xs text-neutral-400 font-medium">Total Monthly Fund</div>
            <div className="text-[11px] text-emerald-400/80">Combined for all 13</div>
          </div>

          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums tracking-tight">
              5
            </div>
            <div className="text-xs text-neutral-400 font-medium">Core Pillars</div>
            <div className="text-[11px] text-sky-400/80">Holistic life support</div>
          </div>

          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums tracking-tight">
              6
            </div>
            <div className="text-xs text-neutral-400 font-medium">Journey Milestones</div>
            <div className="text-[11px] text-amber-400/80">Support to Give Forward</div>
          </div>
        </div>

        {/* Scroll Cue */}
        <a
          href="#why-we-exist"
          className="mt-12 inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors duration-150 animate-bounce"
          aria-label="Scroll to discover Why We Exist"
        >
          <span>Discover the mission</span>
          <ChevronDown className="w-4 h-4" />
        </a>
      </div>
    </section>
  );
}
