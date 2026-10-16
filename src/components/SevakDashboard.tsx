import { useState } from 'react';
import { ArrowDown, ArrowRight, CalendarCheck2, Check, ChevronRight, ClipboardList, FileHeart, HeartHandshake, Sparkles, UserRound } from 'lucide-react';

interface SevakDashboardProps {
  pathname: string;
}

const originalImages = {
  hero: 'https://volunteer.aolic.in/hrwebsite/images/homeImage.jpg',
  seva: 'https://volunteer.aolic.in/hrwebsite/images/rightImage.jpg',
  happiness: 'https://volunteer.aolic.in/hrwebsite/images/col1.jpg',
  pillars: [
    'https://volunteer.aolic.in/hrwebsite/images/sadhna.jpg',
    'https://volunteer.aolic.in/hrwebsite/images/seva.png',
    'https://volunteer.aolic.in/hrwebsite/images/satsang.png',
  ],
};

const replacementImages = {
  hero: 'https://bangaloreashram.org/app/uploads-blr/2024/12/AOLIC_Hiring_Hero_Image.jpg',
  seva: 'https://www.artofliving.org/in-en/app/uploads/bis-images/14783/2023/08/Service-VBI-Volunteers-720x480-f50_38.jpg',
  happiness: 'https://bangaloreashram.org/app/uploads-blr/bis-images/48294/2024/03/Dynamism-for-self-and-nation-dsn-program-720x480-f60_63.jpg',
  pillars: [
    'https://www.artofliving.org/in-en/app/uploads/bis-images/14783/2023/08/Service-VBI-Volunteers-720x480-f50_38.jpg',
    'https://bangaloreashram.org/app/uploads-blr/bis-images/48294/2024/03/Dynamism-for-self-and-nation-dsn-program-720x480-f60_63.jpg',
    'https://www.artofliving.org/sites/www.artofliving.org/files/styles/original_image/public/unity2/blog_image/Art_of_Living_Volunteer_in_India_.jpg?itok=YOBfmOYg',
  ],
};

const features = [
  { title: 'Attendance', description: 'Open the current attendance workspace', href: '/sevak-attendance', icon: CalendarCheck2, status: 'Open workspace', available: true },
  { title: 'Leave Management', description: 'Leave requests are not available yet', href: '/sevak-dashboard/leave', icon: ClipboardList, status: 'Coming soon', available: false },
  { title: 'Medical Reports', description: 'Secure medical reports are not available yet', href: '/sevak-dashboard/medical', icon: FileHeart, status: 'Coming soon', available: false },
  { title: 'Sevak Profile', description: 'Review your profile and approval status', href: '/sevak/my-profile', icon: UserRound, status: 'View profile', available: true },
];

const programs = [
  'Happiness Program',
  'Sahaj Samadhi Dhyaan Yoga',
  'Silence Retreat',
  'Wellness Program',
  'Sri Sri Yoga Deep Dive',
];

function ReferenceImage({ src, fallback, alt, className = '' }: { src: string; fallback: string; alt: string; className?: string }) {
  const [imageSrc, setImageSrc] = useState(src);
  return <img src={imageSrc} alt={alt} className={className} onError={() => { if (imageSrc !== fallback) setImageSrc(fallback); }} loading="lazy" />;
}

export default function SevakDashboard({ pathname }: SevakDashboardProps) {
  const modulePage = pathname === '/sevak-dashboard/leave'
    ? { title: 'Leave Management', copy: 'Leave requests and balances are not stored in the current portal yet. No leave records are being displayed.' }
    : pathname === '/sevak-dashboard/medical'
      ? { title: 'Medical Reports', copy: 'A secure medical records workflow is not available in the current portal. No medical information is collected or displayed here.' }
      : null;

  return (
    <div className="min-h-screen bg-white font-sans text-[#263238]">
      <div className="border-b border-[#e8e1d1] bg-[#f8f7f3] px-4 py-3 sm:px-8 lg:px-12">
        <nav aria-label="Sevak dashboard tools" className="mx-auto grid max-w-7xl grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4">
          {features.map(({ title, href, icon: Icon }) => {
            const active = pathname === href;
            return (
              <a
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`flex min-h-11 items-center justify-center gap-2 rounded-lg border px-2 py-2.5 text-center text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#bd8d36] sm:px-3 sm:text-sm ${active ? 'border-[#bd8d36] bg-white text-[#78591d] shadow-sm' : 'border-[#e7e2d8] bg-white/70 text-[#485a61] hover:border-[#cbb782] hover:bg-white hover:text-[#78591d]'}`}
              >
                <Icon size={16} className="shrink-0" aria-hidden="true" />
                <span>{title}</span>
              </a>
            );
          })}
        </nav>
      </div>
      <header className="relative z-20 border-b border-[#e8e8e8] bg-white">
        <div className="mx-auto flex min-h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-12">
          <a href="/sevak-dashboard" className="flex items-center gap-3" aria-label="Central Human Resources home">
            <span className="grid h-11 w-11 place-items-center rounded-full border border-[#dfb252] text-[#bf8c25]"><HeartHandshake size={22} strokeWidth={1.7} /></span>
            <span className="leading-tight"><span className="block text-[11px] font-medium uppercase tracking-[0.21em] text-[#768187]">Art of Living</span><span className="mt-1 block text-sm font-semibold uppercase tracking-[0.11em] text-[#273943] sm:text-base">Central Human Resources</span></span>
          </a>
        </div>
      </header>

      {modulePage ? (
        <main className="bg-[#f8f7f3] px-5 py-16 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-4xl rounded-sm border-l-4 border-[#c39a4b] bg-white px-7 py-9 shadow-sm sm:px-12 sm:py-14">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#a57d31]">Sevak Services</p>
            <h1 className="mt-4 font-serif text-3xl text-[#263c45] sm:text-4xl">{modulePage.title}</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#66777d]">{modulePage.copy}</p>
            {pathname === '/sevak-dashboard/medical' && <p className="mt-6 border-t border-[#ece9e2] pt-5 text-sm leading-6 text-[#6d6560]">Medical information is private. This page does not show or collect health details.</p>}
            <a href="/sevak-dashboard" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#aa7f30] hover:text-[#78591d]"><ChevronRight size={17} className="rotate-180" /> Return to the home page</a>
          </div>
        </main>
      ) : (
        <>
          <section className="relative isolate flex min-h-[530px] items-center overflow-hidden bg-[#243b43] sm:min-h-[620px]">
            <ReferenceImage src={originalImages.hero} fallback={replacementImages.hero} alt="Volunteers gathering for a moment of meditation and service" className="absolute inset-0 -z-20 h-full w-full object-cover object-center" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#182c35]/80 via-[#182c35]/45 to-[#182c35]/5" />
            <div className="mx-auto w-full max-w-7xl px-6 py-20 sm:px-10 lg:px-16">
              <div className="max-w-2xl text-white">
                <p className="mb-5 text-xs font-semibold uppercase tracking-[0.28em] text-[#f0d391]">Central Human Resources · Seva</p>
                <h1 className="font-serif text-4xl leading-[1.12] sm:text-5xl md:text-6xl">Experience The Joy of Selfless Service!</h1>
                <p className="mt-6 max-w-lg text-lg font-light leading-8 text-white/90 sm:text-xl">Mind in Present Moment, Free From Stress.</p>
                <a href="/sevak/register" className="mt-9 inline-flex items-center gap-3 rounded-sm bg-[#c59a4a] px-7 py-3.5 text-xs font-bold uppercase tracking-[0.13em] text-white shadow-sm transition hover:bg-[#ad8135]">Apply Now <ArrowRight size={16} /></a>
              </div>
            </div>
            <a href="#seva-intro" aria-label="Scroll to learn about Seva" className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full border border-white/60 p-2 text-white/90 transition hover:bg-white/15"><ArrowDown size={18} /></a>
          </section>

          <section id="seva-intro" className="scroll-mt-10 bg-white px-5 py-16 sm:px-8 sm:py-24">
            <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
              <div className="order-2 lg:order-1">
                <p className="text-xs font-bold uppercase tracking-[0.23em] text-[#b48836]">Seva</p>
                <h2 className="mt-4 font-serif text-3xl leading-tight text-[#2b4149] sm:text-4xl">What about Me? <span className="text-[#bd9342]">.. to..</span> What can I Contribute?</h2>
                <p className="mt-6 text-base leading-8 text-[#68787c]">The way to overcome personal misery is to share universal misery! The way to expand personal joy is to share universal joy. Instead of thinking What about me? What can I gain from this world?, think What can I do for the world? When everyone comes from the point of contributing to society, you will have a Divine society.</p>
                <a href="/sevak/register" className="mt-7 inline-flex items-center gap-2 border-b border-[#bd9342] pb-2 text-sm font-semibold text-[#9b742c] hover:text-[#654b1c]">Apply Now <ArrowRight size={15} /></a>
              </div>
              <div className="order-1 lg:order-2">
                <ReferenceImage src={originalImages.seva} fallback={replacementImages.seva} alt="Seva volunteers working together" className="aspect-[1.42] w-full object-cover shadow-[18px_18px_0_#f2eee4]" />
              </div>
            </div>
          </section>

          <section id="sevak-tools" className="scroll-mt-10 bg-[#f5f3ed] px-5 py-14 sm:px-8 sm:py-18">
            <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#ac8436]">For our Sevaks</p>
                <h2 className="mt-3 font-serif text-3xl text-[#2c4148] sm:text-4xl">Your Seva workspace</h2>
                <p className="mt-4 max-w-lg text-sm leading-7 text-[#6c797b]">A simple place to reach your daily attendance and personal profile, alongside the original Seva inspiration.</p>
              </div>
              <nav aria-label="Sevak tools" className="divide-y divide-[#dfddd5] border-y border-[#dfddd5]">
                {features.map(({ title, description, href, icon: Icon, status, available }) => (
                  <a key={title} href={href} aria-label={`${title}: ${status}`} className="group flex items-center gap-4 py-4 transition hover:pl-1 sm:gap-5 sm:py-5">
                    <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${available ? 'bg-white text-[#a47c30]' : 'bg-[#e9e6dc] text-[#85867e]'}`}><Icon size={19} strokeWidth={1.7} /></span>
                    <span className="min-w-0 flex-1"><span className="block font-serif text-lg text-[#334950] group-hover:text-[#9b742c]">{title}</span><span className="mt-1 block text-xs leading-5 text-[#758184] sm:text-sm">{description}</span></span>
                    <span className={`hidden shrink-0 text-[10px] font-semibold uppercase tracking-[0.12em] sm:block ${available ? 'text-[#a47c30]' : 'text-[#92938c]'}`}>{status}</span>
                    <ChevronRight size={18} className="shrink-0 text-[#aab0ad] transition group-hover:translate-x-1 group-hover:text-[#a47c30]" />
                  </a>
                ))}
              </nav>
            </div>
          </section>

          <section className="bg-white px-5 py-16 sm:px-8 sm:py-24">
            <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-20">
              <div className="relative">
                <ReferenceImage src={originalImages.happiness} fallback={replacementImages.happiness} alt="A group of volunteers sharing a joyful moment" className="aspect-[1.4] w-full object-cover" />
                <span className="absolute -bottom-5 -right-3 grid h-20 w-20 place-items-center rounded-full bg-[#bf9649] text-white shadow-lg sm:-right-5 sm:h-24 sm:w-24"><Sparkles size={27} strokeWidth={1.4} /></span>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#b48836]">A life of giving</p>
                <h2 className="mt-4 font-serif text-3xl leading-tight text-[#2b4149] sm:text-4xl">Seva is your very nature</h2>
                <p className="mt-6 text-base leading-8 text-[#68787c]">You have come to this world to do something beneficial for everybody. Do not stay entangled in thinking what will you get. There is nothing for you to take from this world. You have come to give.</p>
                <a href="https://www.artofliving.org/" target="_blank" rel="noreferrer" className="mt-7 inline-flex items-center gap-2 rounded-sm border border-[#bd9342] px-6 py-3 text-xs font-bold uppercase tracking-[0.12em] text-[#9b742c] transition hover:bg-[#bd9342] hover:text-white">Learn Now <ArrowRight size={15} /></a>
              </div>
            </div>
          </section>

          <section id="pillars" className="scroll-mt-10 bg-[#f5f3ed] px-5 py-16 sm:px-8 sm:py-24">
            <div className="mx-auto max-w-7xl">
              <div className="mx-auto max-w-3xl text-center">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#b48836]">A joyful life</p>
                <h2 className="mt-3 font-serif text-3xl text-[#2b4149] sm:text-4xl">The Secret to Happiness</h2>
                <h3 className="mt-3 text-base font-medium text-[#64757a] sm:text-lg">Three Pillars to Success</h3>
                <p className="mt-4 text-sm leading-7 text-[#778286]">As Gurudev says, strength to smile through ups and downs comes with Sadhana, Seva &amp; Satsang.</p>
              </div>
              <div className="mt-10 grid gap-5 md:grid-cols-3 md:gap-7">
                {[
                  { title: 'Sadhana', image: originalImages.pillars[0], fallback: replacementImages.pillars[0], alt: 'A meditation gathering' },
                  { title: 'Seva', image: originalImages.pillars[1], fallback: replacementImages.pillars[1], alt: 'Volunteers serving together' },
                  { title: 'Satsang', image: originalImages.pillars[2], fallback: replacementImages.pillars[2], alt: 'Volunteers coming together in community' },
                ].map((item, index) => (
                  <article key={item.title} className="group overflow-hidden bg-white shadow-[0_8px_30px_rgba(44,56,54,0.07)]">
                    <div className="relative overflow-hidden"><ReferenceImage src={item.image} fallback={item.fallback} alt={item.alt} className="aspect-[1.42] w-full object-cover transition duration-500 group-hover:scale-[1.03]" /><span className="absolute left-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-white/95 text-xs font-semibold text-[#a47c30]">0{index + 1}</span></div>
                    <div className="flex items-center justify-between px-5 py-4"><h3 className="font-serif text-xl text-[#344b51]">{item.title}</h3><span className="h-px w-10 bg-[#c09a51]" /></div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section id="programs" className="scroll-mt-10 bg-white px-5 py-16 sm:px-8 sm:py-20">
            <div className="mx-auto max-w-7xl">
              <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#e6e5e0] pb-5">
                <div><p className="text-xs font-bold uppercase tracking-[0.22em] text-[#b48836]">Learn and experience</p><h2 className="mt-3 font-serif text-3xl text-[#2b4149] sm:text-4xl">Upcoming Programs</h2></div>
                <p className="max-w-sm text-sm leading-6 text-[#7a8586]">Explore programs offered by the Art of Living International Center.</p>
              </div>
              <div className="mt-3 grid md:grid-cols-2 md:gap-x-12">
                {programs.map((program) => <a key={program} href="https://bangaloreashram.org/programs/" target="_blank" rel="noreferrer" className="group flex items-center justify-between border-b border-[#ecebe6] py-4 text-sm text-[#50636a] transition hover:text-[#a47c30]"><span>{program}</span><ChevronRight size={17} className="text-[#b09a6a] transition group-hover:translate-x-1" /></a>)}
              </div>
            </div>
          </section>

          <section id="contact" className="scroll-mt-10 bg-[#263c43] px-5 py-12 text-white sm:px-8 sm:py-16">
            <div className="mx-auto grid max-w-7xl gap-10 sm:grid-cols-2 sm:items-start">
              <div><p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#e3c783]">We are here</p><h2 className="mt-3 font-serif text-3xl">Contact Information</h2><p className="mt-4 max-w-md text-sm leading-7 text-white/65">Connect with Central Human Resources for information about Seva and programs.</p></div>
              <address className="not-italic text-sm leading-8 text-white/80"><p>21st Km, Kanakpura Road, Udayapura, Bengaluru</p><a href="mailto:chr.seva@artofliving.org" className="block transition hover:text-[#e3c783]">chr.seva@artofliving.org</a><a href="tel:+918067262626" className="block transition hover:text-[#e3c783]">+91 80 67262626/27/28</a></address>
            </div>
          </section>

          <footer className="bg-[#1e3036] px-5 py-5 text-white/55 sm:px-8">
            <div className="mx-auto flex max-w-7xl flex-col gap-3 text-xs sm:flex-row sm:items-center sm:justify-between"><span>Central Human Resources · Art of Living International Center</span><nav aria-label="Footer navigation" className="flex flex-wrap gap-x-5 gap-y-2"><a href="/sevak-dashboard" className="hover:text-white">Home</a><a href="/sevak-attendance" className="hover:text-white">Attendance</a><a href="/sevak/my-profile" className="hover:text-white">Sevak Profile</a><a href="#contact" className="hover:text-white">Contact</a></nav><span className="inline-flex items-center gap-1.5"><Check size={13} /> In service</span></div>
          </footer>
        </>
      )}
    </div>
  );
}
