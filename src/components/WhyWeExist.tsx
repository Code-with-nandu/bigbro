import { ShieldCheck, HeartHandshake, Award, Compass, Users, Sparkles } from 'lucide-react';
import Shield3DViewer from './Shield3DViewer';
import TiltCard3D from './TiltCard3D';

export default function WhyWeExist() {
  return (
    <section id="why-we-exist" className="relative py-24 px-4 sm:px-6 max-w-6xl mx-auto">
      {/* Subtle radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-amber-500/5 blur-[120px] pointer-events-none rounded-full" />

      {/* Section Header */}
      <div className="max-w-2xl mb-16">
        <div className="text-xs font-semibold tracking-wider uppercase text-amber-400 mb-2">
          01. Why We Exist
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
          Charity creates dependence. Brotherhood builds self-reliance.
        </h2>
        <p className="text-base text-neutral-300 leading-relaxed">
          Most social programs hand out food or certificates and walk away. But when a young trainee faces a ₹30 fare shortage,
          family pressure, or clinical anxiety, they drop out. BIG BRO (May 13 / Mai Tera) exists to ensure nobody fights the journey alone.
        </p>
      </div>

      {/* Core Philosophy Bento Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left marquee card: The Palliative Care Calling with 3D tilt */}
        <div className="md:col-span-7 flex flex-col gap-6">
          <TiltCard3D maxTilt={7} className="h-full">
            <div className="h-full p-8 rounded-3xl glass-panel border border-white/10 relative overflow-hidden flex flex-col justify-between group hover:border-white/20 transition-all duration-300">
              <div className="space-y-4 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-300">
                  <HeartHandshake className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-white tracking-tight">
                  Why Palliative Care for Our First 15?
                </h3>
                <p className="text-sm text-neutral-300 leading-relaxed">
                  Palliative care is the art of restoring comfort, peace, and dignity to patients facing serious or end-of-life illnesses.
                  It is one of healthcare’s most urgent, under-resourced frontiers.
                </p>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  For our 15 young men and women from vulnerable families, palliative care is not just a skill. It transforms them from people
                  viewed as "needing help" into proud, certified healers whom families and doctors deeply respect.
                </p>

                {/* Real Cohort Photo Embedded */}
                <div className="pt-2">
                  <div className="relative rounded-2xl overflow-hidden border border-white/15 aspect-[16/9] shadow-lg group-hover:border-amber-400/30 transition-all">
                    <img
                      src="WhatsApp Image 2026-09-18 at 5.47.20 PM (1).jpeg"
                      alt="Our First 13 Cohort Trainees on the Ashram Steps"
                      onError={(e) => {
                        const img = e.currentTarget;
                        if (!img.dataset.attempt) {
                          img.dataset.attempt = '1';
                          img.src = '/WhatsApp Image 2026-09-18 at 5.47.20 PM (1).jpeg';
                        }
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] text-white/90">
                      <span className="font-semibold text-amber-300">Cohort 01 Gathering</span>
                      <span className="text-[10px] text-neutral-300 font-mono">13 Trainees with Faculty</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 gap-4 text-left">
                <div>
                  <div className="text-xs text-neutral-400">Demand in Region</div>
                  <div className="text-sm font-semibold text-white mt-0.5">Severe Shortage of Certified Caregivers</div>
                </div>
                <div>
                  <div className="text-xs text-neutral-400">Career Outcome</div>
                  <div className="text-sm font-semibold text-amber-300 mt-0.5">Dignified Living Wage + Respect</div>
                </div>
              </div>
            </div>
          </TiltCard3D>
        </div>

        {/* Right side: 3D Shield Token + 3 Core Tenets */}
        <div className="md:col-span-5 flex flex-col gap-4">
          {/* Interactive 3D Five-Pillars Shield Model */}
          <Shield3DViewer />

          {/* Tenet 1 */}
          <TiltCard3D maxTilt={5}>
            <div className="p-5 rounded-2xl glass-panel border border-white/10 hover:border-white/20 transition-all">
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white shrink-0">
                  <ShieldCheck className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white mb-1">Unconditional Safety Net</h4>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Art of Living ensures local transport and shift meals; the ₹10,000 common pool absorbs emergency personal needs, study materials, and digital data so trainees never drop out.
                  </p>
                </div>
              </div>
            </div>
          </TiltCard3D>

          {/* Tenet 2 */}
          <TiltCard3D maxTilt={5}>
            <div className="p-5 rounded-2xl glass-panel border border-white/10 hover:border-white/20 transition-all">
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white shrink-0">
                  <Compass className="w-5 h-5 text-sky-400" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white mb-1">Standing on Your Own Feet</h4>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Our measure of success is simple: financial independence where graduates support their own households without needing aid.
                  </p>
                </div>
              </div>
            </div>
          </TiltCard3D>

          {/* Tenet 3 */}
          <TiltCard3D maxTilt={5}>
            <div className="p-5 rounded-2xl glass-panel border border-white/10 hover:border-white/20 transition-all">
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white shrink-0">
                  <Users className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white mb-1">The Give-Forward Chain</h4>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Once employed, alumni mentor the next cohort and contribute into the ₹10k pool, creating an unbroken chain of self-determination.
                  </p>
                </div>
              </div>
            </div>
          </TiltCard3D>
        </div>
      </div>
    </section>
  );
}
