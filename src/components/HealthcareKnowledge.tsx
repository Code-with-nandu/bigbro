import { useState } from 'react';
import {
  ArrowDown,
  ArrowRight,
  BookOpen,
  Check,
  Heart,
  HeartPulse,
  LockKeyhole,
  Search,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from 'lucide-react';

const categories = [
  'Cancer Care',
  'Palliative Care',
  'Diabetes',
  'Heart Health',
  'Elder Care',
  'Rehabilitation',
  'Chronic Conditions',
  'Caregiver Support',
];

const futureFeatures = [
  'Similar Patient Stories',
  'Treatment Journey Timeline',
  'Caregiver Experiences',
  'Doctor / Professional Insights',
  'Trusted Healthcare Resources',
  'Research & Educational Information',
  'Anonymous Experience Sharing',
  'Healthcare Knowledge Search',
];

const journeySteps = [
  'Patient Experience',
  'Treatment Journey',
  'Recovery / Ongoing Care',
  'Knowledge Sharing',
];

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="max-w-2xl">
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-emerald-800">{eyebrow}</p>
      <h2 className="text-3xl font-semibold tracking-tight text-[#18332d] sm:text-4xl">{title}</h2>
      {description && <p className="mt-4 text-base leading-7 text-[#5b6c66]">{description}</p>}
    </div>
  );
}

export default function HealthcareKnowledge() {
  const [searchQuery, setSearchQuery] = useState('');
  const [heroVideoAvailable, setHeroVideoAvailable] = useState(true);
  const matchingCategories = categories.filter((category) =>
    category.toLowerCase().includes(searchQuery.trim().toLowerCase()),
  );

  return (
    <main className="bg-[#f6f7f2] text-[#18332d]">
      <section className="relative isolate flex min-h-[100svh] items-center overflow-hidden bg-[#173a32] px-5 pb-16 pt-40 text-white sm:px-8 sm:pb-20 sm:pt-44">
        <div aria-hidden="true" className="absolute inset-0 -z-20 overflow-hidden bg-[radial-gradient(ellipse_at_72%_35%,rgba(236,190,103,0.2),transparent_40%),linear-gradient(135deg,#173a32,#102720)]">
          <div className="absolute -right-28 top-20 h-96 w-96 rounded-full border border-white/10 sm:right-10 sm:top-8 sm:h-[34rem] sm:w-[34rem]" />
          <div className="absolute right-8 top-40 h-72 w-72 rounded-full border border-amber-200/15 sm:right-28 sm:top-24 sm:h-[27rem] sm:w-[27rem]" />
          <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-emerald-300/10 blur-3xl" />
        </div>
        {heroVideoAvailable && (
          <video
            className="absolute inset-0 -z-10 h-full w-full object-cover"
            src="/healthcare-hero.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden="true"
            onError={() => setHeroVideoAvailable(false)}
          />
        )}
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[#071b16]/55" />
        <div className="mx-auto w-full max-w-6xl">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-2 text-xs font-medium text-emerald-50">
              <HeartPulse className="h-4 w-4 text-amber-300" aria-hidden="true" />
              A more human way to learn together
            </div>
            <h1 className="text-5xl font-semibold leading-[1.04] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
              Healthcare Knowledge
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-emerald-50/90 sm:text-xl">
              Learn from real experiences. Share knowledge. Help someone make a better-informed decision.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                href="#knowledge-bank"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-amber-300 px-6 py-3 text-sm font-semibold text-[#20382f] transition hover:bg-amber-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Explore Healthcare Knowledge <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                href="#privacy"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200"
              >
                Share Your Experience
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="Knowledge grows when it's shared"
            title="Learn From Similar Patient Experiences"
            description="People may learn from similar patients' experiences, treatment journeys and recovery or care experiences. Patient experiences are personal experiences, not medical advice. Consult qualified healthcare professionals for your healthcare decisions."
          />
          <div className="mt-12 grid gap-3 md:grid-cols-5">
            {journeySteps.map((step, index) => (
              <div key={step} className="relative">
                <div className="flex h-full min-h-32 flex-col justify-between rounded-2xl border border-[#e2e7de] bg-white p-5 shadow-sm">
                  <span className="text-xs font-semibold tracking-widest text-emerald-800">0{index + 1}</span>
                  <span className="mt-6 text-base font-semibold text-[#20382f]">{step}</span>
                </div>
                {index < journeySteps.length - 1 && (
                  <ArrowRight className="absolute -right-3 top-1/2 z-10 hidden h-5 w-5 -translate-y-1/2 text-emerald-700 md:block" aria-hidden="true" />
                )}
                {index < journeySteps.length - 1 && (
                  <ArrowDown className="mx-auto my-1 h-4 w-4 text-emerald-700 md:hidden" aria-hidden="true" />
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            <article className="rounded-2xl border border-[#e2e7de] bg-white p-6 sm:p-7">
              <div className="mb-5 inline-flex rounded-xl bg-[#e5ede4] p-3 text-emerald-900"><Heart className="h-5 w-5" aria-hidden="true" /></div>
              <h3 className="text-lg font-semibold">Patient Experience</h3>
              <p className="mt-2 text-sm leading-6 text-[#5b6c66]">Personal experiences shared by users, clearly identified as their own perspective.</p>
            </article>
            <article className="rounded-2xl border border-[#e2e7de] bg-white p-6 sm:p-7">
              <div className="mb-5 inline-flex rounded-xl bg-[#e5ede4] p-3 text-emerald-900"><BookOpen className="h-5 w-5" aria-hidden="true" /></div>
              <h3 className="text-lg font-semibold">Verified Information</h3>
              <p className="mt-2 text-sm leading-6 text-[#5b6c66]">A distinct space for information reviewed or curated from trusted healthcare sources.</p>
            </article>
            <article className="rounded-2xl border border-[#e2e7de] bg-white p-6 sm:p-7">
              <div className="mb-5 inline-flex rounded-xl bg-[#e5ede4] p-3 text-emerald-900"><UsersRound className="h-5 w-5" aria-hidden="true" /></div>
              <h3 className="text-lg font-semibold">Professional Guidance</h3>
              <p className="mt-2 text-sm leading-6 text-[#5b6c66]">A separate space for doctors or qualified healthcare professionals, where applicable.</p>
            </article>
          </div>
          <p className="mt-5 text-sm leading-6 text-[#5b6c66]">
            These are separate kinds of knowledge and will always be presented as distinct categories.
          </p>
        </div>
      </section>

      <section id="knowledge-bank" className="scroll-mt-28 bg-[#edf1e9] px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <SectionHeading
              eyebrow="Explore by topic"
              title="Healthcare Knowledge Bank"
              description="A future home for organised experiences and learning. The topics below are placeholders—there are no patient stories or medical advice here yet."
            />
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#cbd9cb] bg-white/70 px-3.5 py-2 text-xs font-semibold text-emerald-900">
              <Sparkles className="h-4 w-4" aria-hidden="true" /> Preview
            </span>
          </div>

          <label htmlFor="healthcare-search" className="sr-only">Search healthcare knowledge topics</label>
          <div className="mt-9 flex max-w-3xl items-center gap-3 rounded-2xl border border-[#d8e0d6] bg-white px-4 py-3.5 shadow-sm focus-within:ring-2 focus-within:ring-emerald-700">
            <Search className="h-5 w-5 shrink-0 text-emerald-800" aria-hidden="true" />
            <input
              id="healthcare-search"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search condition, treatment journey, care experience..."
              className="min-w-0 flex-1 bg-transparent text-sm text-[#18332d] outline-none placeholder:text-[#83918a]"
            />
          </div>
          <div className="mt-7 flex flex-wrap gap-2.5" aria-live="polite">
            {matchingCategories.map((category) => (
              <span key={category} className="rounded-full border border-[#d8e0d6] bg-white px-4 py-2.5 text-sm font-medium text-[#35564a]">
                {category}
              </span>
            ))}
            {matchingCategories.length === 0 && (
              <p className="text-sm text-[#5b6c66]">No matching placeholder topics. Try a different search.</p>
            )}
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <SectionHeading
              eyebrow="A story, not evidence"
              title="A Patient Journey"
              description="Stories may follow a simple structure to help readers understand someone's experience over time. This clearly labelled demo is not a real patient story or medical evidence."
            />
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {journeySteps.map((step, index) => (
                <div key={step} className="rounded-2xl border border-[#dfe5dc] bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800">DEMO / EXAMPLE · 0{index + 1}</p>
                  <p className="mt-2 text-sm font-semibold text-[#35564a]">{step}</p>
                </div>
              ))}
            </div>
          </div>
          <article className="rounded-3xl border border-[#dfe5dc] bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6 flex items-center justify-between gap-4">
              <h3 className="text-lg font-semibold">Patient Journey</h3>
              <span className="rounded-full bg-amber-100 px-3 py-1.5 text-[11px] font-bold tracking-wide text-amber-900">DEMO / EXAMPLE</span>
            </div>
            <dl className="grid gap-4 sm:grid-cols-2">
              {[
                ['Condition', 'Example condition'],
                ['Stage', 'Diagnosis'],
                ['Treatment', 'Treatment journey'],
                ['Experience', 'What the patient experienced'],
                ['Outcome', 'Recovery / ongoing care'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl bg-[#f6f7f2] p-4">
                  <dt className="text-xs font-semibold uppercase tracking-wider text-emerald-800">{label}</dt>
                  <dd className="mt-2 text-sm font-medium text-[#35564a]">{value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-5 text-xs leading-5 text-[#718078]">Illustrative structure only. No real patient information or medical guidance.</p>
          </article>
        </div>
      </section>

      <section id="privacy" className="scroll-mt-28 bg-[#173a32] px-5 py-20 text-white sm:px-8 sm:py-24">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <div className="mb-5 inline-flex rounded-2xl border border-white/10 bg-white/5 p-3 text-amber-200"><LockKeyhole className="h-6 w-6" aria-hidden="true" /></div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-amber-200">Privacy &amp; consent</p>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Your Health Story.<br />Your Choice.</h2>
            <p className="mt-5 max-w-lg text-base leading-7 text-emerald-50/75">
              Sharing a healthcare experience should always be voluntary and handled with care. You decide what to share.
            </p>
            <a
              href="#healthcare-sharing-note"
              className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-amber-300 px-6 py-3 text-sm font-semibold text-[#20382f] transition hover:bg-amber-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Share My Healthcare Experience <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <p id="healthcare-sharing-note" className="mt-3 text-xs text-emerald-100/60">Sharing is not open yet. This link does not publish or submit health information.</p>
          </div>
          <ul className="grid content-start gap-3 sm:grid-cols-2">
            {[
              'Sharing is voluntary.',
              'You control what you share.',
              'Personal identifying information should not be publicly exposed.',
              'Consent must be obtained before publishing a patient story.',
              'You can request to withdraw a story in the future.',
              'Sensitive healthcare information must be handled carefully.',
              'Patient experiences are not medical advice.',
            ].map((point) => (
              <li key={point} className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-4 text-sm leading-6 text-emerald-50/85">
                <Check className="mt-1 h-4 w-4 shrink-0 text-amber-200" aria-hidden="true" />
                {point}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="membership" className="scroll-mt-28 px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[2rem] border border-[#e0e5dc] bg-white shadow-sm md:grid-cols-[1fr_auto]">
          <div className="p-7 sm:p-10 lg:p-12">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-emerald-800">A future knowledge community</p>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Healthcare Knowledge Membership</h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#5b6c66]">
              Access organised healthcare experiences, educational resources and knowledge-sharing features.
            </p>
          </div>
          <div className="flex flex-col items-start justify-center border-t border-[#e5e9e2] bg-[#edf1e9] p-7 md:min-w-72 md:border-l md:border-t-0 sm:p-10">
            <p className="text-3xl font-semibold tracking-tight text-[#18332d]">₹100 <span className="text-base font-medium text-[#5b6c66]">/ month</span></p>
            <a href="#membership" className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-[#173a32] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#245448] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800">
              Join for ₹100/month
            </a>
            <p className="mt-3 text-xs text-[#718078]">Preview only · Membership and payments are not available yet.</p>
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 sm:px-8 sm:pb-28">
        <div className="mx-auto max-w-6xl rounded-3xl border border-amber-200 bg-[#fffaf0] p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:gap-5">
            <div className="h-fit rounded-xl bg-amber-100 p-3 text-amber-900"><ShieldCheck className="h-5 w-5" aria-hidden="true" /></div>
            <div>
              <h2 className="text-lg font-semibold text-[#43371f]">Important Healthcare Disclaimer</h2>
              <p className="mt-3 text-sm leading-7 text-[#63563d]">
                “Information shared on BigBro is intended for educational and informational purposes only. Patient experiences are personal experiences and should not be considered medical advice, diagnosis or treatment recommendations. Always consult a qualified healthcare professional for your individual healthcare decisions.”
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-20 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="A vision for what's next"
            title="Coming Soon"
            description="These ideas are part of the future Healthcare Knowledge experience. They are not available yet."
          />
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {futureFeatures.map((feature) => (
              <div key={feature} className="flex min-h-16 items-center gap-3 rounded-2xl border border-[#e2e7de] bg-[#f9faf7] px-4 py-3.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e5ede4] text-emerald-900">
                  <Check className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="text-sm font-medium text-[#35564a]">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
