import { useState, useEffect } from 'react';
import { Menu, X, ArrowUpRight, Smartphone } from 'lucide-react';

interface NavbarProps {
  onOpenJoinModal: (role?: string) => void;
}

export default function Navbar({ onOpenJoinModal }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isDevelopmentHistoryPage = window.location.pathname.replace(/\/$/, '') === '/development-history';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Why We Exist', href: `${isDevelopmentHistoryPage ? '/' : ''}#why-we-exist` },
    { name: 'Problems & Pillars', href: `${isDevelopmentHistoryPage ? '/' : ''}#problems-pillars` },
    { name: 'Our First 13', href: `${isDevelopmentHistoryPage ? '/' : ''}#first-13` },
    { name: 'The Journey', href: `${isDevelopmentHistoryPage ? '/' : ''}#journey` },
    { name: '₹10k Fund', href: `${isDevelopmentHistoryPage ? '/' : ''}#fund` },
    { name: 'Pay with UPI', href: `${isDevelopmentHistoryPage ? '/' : ''}#upi-payment` }
  ];

  return (
    <header className="fixed top-10 inset-x-0 z-50 px-4 sm:px-6 py-4 transition-all duration-300 pointer-events-none">
      <div className="max-w-6xl mx-auto flex items-center justify-between pointer-events-auto">
        {/* Floating pill navigation container */}
        <div
          className={`w-full flex items-center justify-between px-4 sm:px-6 py-2.5 rounded-full transition-all duration-300 border ${
            scrolled
              ? 'bg-[#0a0a0f]/85 border-white/12 backdrop-blur-xl shadow-2xl shadow-black/80'
              : 'bg-[#0a0a0f]/60 border-white/8 backdrop-blur-md'
          }`}
        >
          {/* Zone 1: Single text element wordmark */}
          <a
            href={isDevelopmentHistoryPage ? '/' : '#'}
            className="flex items-center gap-2 group tracking-tight text-white font-bold text-base sm:text-lg focus-visible:outline-2 focus-visible:outline-amber-400"
            aria-label="May Tera (Big Bro) home"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 group-hover:scale-125 transition-transform duration-200" />
            <span className="tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-white to-amber-200 font-extrabold text-base sm:text-xl">
              MAY TERA
            </span>
            <span className="text-[11px] sm:text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/25 text-amber-300 tracking-normal whitespace-nowrap">
              Big Bro · May 13
            </span>
          </a>

          {/* Zone 2: Navigation links */}
          <nav className="hidden lg:flex items-center gap-6 text-[13px] font-medium text-neutral-300" aria-label="Primary navigation">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="hover:text-white transition-colors duration-150 relative py-1 focus-visible:outline-2 focus-visible:outline-amber-400"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Zone 3: Primary actions */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <a
              href={`${isDevelopmentHistoryPage ? '/' : ''}#upi-payment`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-300 bg-amber-400/10 border border-amber-400/30 rounded-full hover:bg-amber-400/20 transition-all duration-180 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-amber-400"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Pay with UPI</span>
            </a>

            <button
              onClick={() => onOpenJoinModal()}
              className="inline-flex items-center gap-1 px-4 py-1.5 text-xs font-semibold text-neutral-950 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 rounded-full shadow-sm hover:shadow-amber-500/20 transition-all duration-180 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-amber-400 cursor-pointer"
            >
              <span>Join May Tera</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 text-neutral-300 hover:text-white rounded-lg focus-visible:outline-2 focus-visible:outline-amber-400 cursor-pointer"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Sheet */}
      {mobileMenuOpen && (
        <div className="lg:hidden max-w-6xl mx-auto mt-2 pointer-events-auto">
          <div className="p-4 rounded-2xl bg-[#0e0e14]/95 border border-white/12 backdrop-blur-2xl shadow-2xl space-y-3">
            <nav className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-sm text-neutral-200 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  {link.name}
                </a>
              ))}
            </nav>
            <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
              <a
                href={`${isDevelopmentHistoryPage ? '/' : ''}#upi-payment`}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 text-center text-xs font-bold text-neutral-950 bg-amber-400 rounded-lg hover:bg-amber-300 flex items-center justify-center gap-1.5"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Pay with UPI</span>
              </a>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenJoinModal();
                }}
                className="w-full py-2 text-center text-xs font-semibold text-white border border-white/15 rounded-lg hover:bg-white/5"
              >
                Join May Tera (Big Bro)
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
