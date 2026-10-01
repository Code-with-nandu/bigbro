import SupabaseConnectionTester from './SupabaseConnectionTester';

export default function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-[#060609] py-16 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start justify-between gap-10">
        {/* Brand Lockup */}
        <div className="space-y-3 max-w-sm">
          <div className="flex items-center gap-2 text-white font-bold text-lg tracking-wider">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span>BIG BRO</span>
            <span className="text-xs font-medium text-amber-300/90 tracking-normal">(May 13 / Mai Tera)</span>
          </div>
          <div className="text-xs font-semibold tracking-wider text-amber-400/90 uppercase">
            Support · Empower · Employ · Give Forward
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Helping people stand on their own feet. A community-anchored social impact initiative
            backing our first 13 palliative care students with a ₹10,000/month collective support fund.
          </p>
        </div>

        {/* Navigation Mirror */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-xs">
          <div className="space-y-2.5">
            <div className="font-semibold text-white uppercase tracking-wider text-[11px]">
              Initiative
            </div>
            <ul className="space-y-2 text-neutral-400">
              <li><a href="#why-we-exist" className="hover:text-white transition-colors">Why We Exist</a></li>
              <li><a href="#problems-pillars" className="hover:text-white transition-colors">Five Problems</a></li>
              <li><a href="#problems-pillars" className="hover:text-white transition-colors">Five Pillars</a></li>
              <li><a href="#first-13" className="hover:text-white transition-colors">Our First 13</a></li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <div className="font-semibold text-white uppercase tracking-wider text-[11px]">
              Framework
            </div>
            <ul className="space-y-2 text-neutral-400">
              <li><a href="#journey" className="hover:text-white transition-colors">The 6-Step Journey</a></li>
              <li><a href="#fund" className="hover:text-white transition-colors">₹10,000 Common Fund</a></li>
              <li><a href="#upi-payment" className="text-amber-300 hover:text-amber-200 transition-colors">Support via UPI</a></li>
              <li><a href="#join" className="hover:text-white transition-colors">Become a Big Bro</a></li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <div className="font-semibold text-white uppercase tracking-wider text-[11px]">
              Pilot Protocol
            </div>
            <div className="text-neutral-400 text-xs leading-relaxed">
              Palliative Care Assistant Vocational Pilot (Cohort 01).
              <div className="text-amber-300/80 mt-1 font-mono text-[11px]">
                ₹10,000 Total Common Pool / Month for 13 Trainees
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Prominent Supabase Connection Section at the bottom of the footer */}
      <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-white/10 flex flex-col items-center justify-center">
        <SupabaseConnectionTester />
      </div>

      {/* Bottom Legal / Disclaimer */}
      <div className="max-w-6xl mx-auto mt-6 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-3">
        <p>© {new Date().getFullYear()} BIG BRO (May 13 / Mai Tera) Social Impact. All rights reserved.</p>
        <p className="text-[11px] text-neutral-500">
          Demo data presented for pilot demonstration. No administrative cuts taken from the common student fund.
        </p>
      </div>
    </footer>
  );
}
