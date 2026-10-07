import { HeartHandshake, Shield, Briefcase, GraduationCap, ArrowRight, CheckCircle2 } from 'lucide-react';

interface BecomeBigBrotherProps {
  onOpenJoinModal: (role?: string) => void;
}

export default function BecomeBigBrother({ onOpenJoinModal }: BecomeBigBrotherProps) {
  const pathways = [
    {
      role: 'mentor',
      title: 'Be a 1-on-1 Mentor',
      badge: 'Time & Wisdom',
      description: 'Spend 1 hour a week with a student. Listen to their anxieties, help them practice professional conversations, and be the guiding elder brother or sister they never had.',
      impact: '1 hour weekly = permanent emotional grounding for 1 student',
      icon: HeartHandshake,
      action: 'Apply to Mentor'
    },
    {
      role: 'sponsor',
      title: 'Back the ₹10,000 Fund',
      badge: 'Direct Financial Shield',
      description: 'Sponsor a full month (₹10,000) for all 15 students, or fund a slice (₹1,000–₹2,500) for transit passes, hot shift lunches, and emergency buffers.',
      impact: '100% of capital shields the 15 trainees with zero overhead',
      icon: Shield,
      action: 'Sponsor a Slice'
    },
    {
      role: 'employer',
      title: 'Hire a Palliative Graduate',
      badge: 'Employment Partner',
      description: 'Hospitals, hospices, and geriatric home care organizations can pre-commit to interviewing and hiring our certified, compassionate trainees at fair living wages.',
      impact: 'Guaranteed career independence and escape from poverty',
      icon: Briefcase,
      action: 'Partner as Employer'
    },
    {
      role: 'volunteer',
      title: 'Skill & Health Volunteer',
      badge: 'Knowledge & Care',
      description: 'Doctors, palliative nurses, and soft-skill coaches conduct weekend masterclasses in clinical documentation, bedside ergonomics, grief coping, and spoken English.',
      impact: 'World-class training delivered directly to grassroots youths',
      icon: GraduationCap,
      action: 'Volunteer Skills'
    }
  ];

  return (
    <section id="join" className="relative py-24 px-4 sm:px-6 max-w-6xl mx-auto">
      {/* Background glow */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-amber-500/5 blur-[160px] pointer-events-none rounded-full" />

      {/* Section Header */}
      <div className="max-w-2xl mb-16">
        <div className="text-xs font-semibold tracking-wider uppercase text-amber-400 mb-2">
          07. Join the Brotherhood
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3">
          Become a Big Bro (Mai Tera). Help someone stand on their own feet.
        </h2>
        <p className="text-base text-neutral-300 leading-relaxed">
          You don't need a foundation or millions to change a life. Whether it is one hour of mentorship,
          sponsoring a week of bus tickets, or offering a fair living-wage job, you can be the turning point.
        </p>
      </div>

      {/* Pathways Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        {pathways.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.role}
              className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/10 hover:border-amber-400/40 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-neutral-300">
                    {item.badge}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-amber-300 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed mb-4">
                  {item.description}
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 space-y-4">
                <div className="flex items-center gap-2 text-xs text-amber-300/90 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{item.impact}</span>
                </div>

                <button
                  onClick={() => onOpenJoinModal(item.role)}
                  className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-amber-400 hover:text-neutral-950 text-white font-semibold text-xs border border-white/10 hover:border-amber-400 flex items-center justify-center gap-1.5 transition-all duration-200"
                >
                  <span>{item.action}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Closing Manifesto Banner */}
      <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-neutral-900 to-[#0e0e15] border border-white/15 text-center relative overflow-hidden shadow-2xl">
        <div className="max-w-2xl mx-auto space-y-4 relative z-10">
          <div className="text-xs font-semibold tracking-widest uppercase text-amber-400">
            The Big Bro (Mai Tera) Creed
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            "When you stand on your own feet, you are free. When you help another stand, you make the world free."
          </h3>
          <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-xl mx-auto">
            15 students. ₹10,000 monthly pool. One united brotherhood.
          </p>
          <div className="pt-4">
            <button
              onClick={() => onOpenJoinModal('mentor')}
              className="px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-200 hover:from-amber-300 hover:to-amber-100 text-neutral-950 font-bold text-xs sm:text-sm shadow-xl shadow-amber-500/20 active:scale-95 transition-all"
            >
              Take the Pledge with Us Today
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
