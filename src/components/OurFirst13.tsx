import { useState, useEffect } from 'react';
import { ArrowUpRight, Search, MapPin, HeartHandshake, Sparkles, GraduationCap, ShieldCheck, Users, Maximize2, X, ChevronLeft, ChevronRight, Camera } from 'lucide-react';
import { STUDENTS_DATA, FACULTY_AND_LEADERSHIP } from '../data/mockData';
import { Student } from '../types';
import TiltCard3D from './TiltCard3D';

interface OurFirst13Props {
  onSelectStudent: (student: Student) => void;
}

interface CohortPhoto {
  id: string;
  src: string;
  title: string;
  subtitle: string;
  caption: string;
  badge: string;
  aspect: string;
}

const COHORT_PHOTOS: CohortPhoto[] = [
  {
    id: 'ashram_steps',
    src: 'WhatsApp Image 2026-09-18 at 5.47.20 PM (1).jpeg',
    title: 'Gathered on the Ashram Steps Under the Sacred Tree',
    subtitle: 'The 13 Palliative Care Trainees with Instructors Varati Madam & Sandhyashree K C',
    caption: 'Seated together in traditional attire at the ashram hermitage cottage, embodying brotherhood, mutual respect, and selfless community service.',
    badge: 'Ashram Hermitage Steps',
    aspect: 'aspect-[3/4] sm:aspect-[4/3] lg:aspect-[16/10]'
  },
  {
    id: 'field_service',
    src: 'WhatsApp Image 2026-09-18 at 5.47.20 PM.jpeg',
    title: 'Humble Community Service & Rural Immersion',
    subtitle: 'Team Brotherhood & Practical Compassion at the Ashram Goshala',
    caption: 'Grounding the students through hands-on service and connection with nature in rural Bengal, fostering humility, duty, and deep empathy for living beings.',
    badge: 'Field Service Immersion',
    aspect: 'aspect-[16/10]'
  },
  {
    id: 'classroom_induction',
    src: 'pca image.jpg',
    title: 'Classroom Clinical Induction & Fellowship',
    subtitle: 'Cohort 01 Palliative Care Assistant Pilot Induction Ceremony',
    caption: 'Celebrating the formal launch of their 6-month intensive training journey to become certified frontline palliative healthcare providers.',
    badge: 'Classroom Induction',
    aspect: 'aspect-[16/10]'
  }
];

export default function OurFirst13({ onSelectStudent }: OurFirst13Props) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'skill' | 'opportunity'>('all');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number>(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  const activePhoto = COHORT_PHOTOS[selectedPhotoIndex];

  const handleStudentAvatarError = (studentId: number) => {
    setImageErrors((prev) => ({ ...prev, [studentId]: true }));
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return;
      if (e.key === 'Escape') setIsLightboxOpen(false);
      if (e.key === 'ArrowRight') setSelectedPhotoIndex((prev) => (prev + 1) % COHORT_PHOTOS.length);
      if (e.key === 'ArrowLeft') setSelectedPhotoIndex((prev) => (prev - 1 + COHORT_PHOTOS.length) % COHORT_PHOTOS.length);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen]);

  const filteredStudents = STUDENTS_DATA.filter((s) => {
    const matchesFilter =
      activeFilter === 'all' || s.journeyStage.toLowerCase() === activeFilter.toLowerCase();
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.module.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <section id="first-13" className="relative py-24 px-4 sm:px-6 max-w-7xl mx-auto overflow-hidden">
      {/* Subtle Family Connected-Network Background Visual */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        {/* Ambient warm glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-amber-500/[0.04] blur-[150px] rounded-full" />
        <div className="absolute bottom-1/3 right-10 w-[500px] h-[400px] bg-emerald-500/[0.03] blur-[160px] rounded-full" />

        {/* Constellation Golden Thread Lines (SVG) */}
        <svg
          className="absolute inset-0 w-full h-full opacity-20 stroke-amber-400/30"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="familyGlowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#d97706" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.5" />
            </linearGradient>
          </defs>

          <line x1="12%" y1="18%" x2="35%" y2="28%" stroke="url(#familyGlowGrad)" strokeWidth="1" strokeDasharray="4 6" />
          <line x1="35%" y1="28%" x2="62%" y2="22%" stroke="url(#familyGlowGrad)" strokeWidth="1" strokeDasharray="3 5" />
          <line x1="62%" y1="22%" x2="88%" y2="30%" stroke="url(#familyGlowGrad)" strokeWidth="1" strokeDasharray="4 6" />
          <line x1="20%" y1="48%" x2="45%" y2="55%" stroke="url(#familyGlowGrad)" strokeWidth="1" strokeDasharray="3 7" />
          <line x1="45%" y1="55%" x2="78%" y2="50%" stroke="url(#familyGlowGrad)" strokeWidth="1" strokeDasharray="5 5" />
          <line x1="30%" y1="78%" x2="60%" y2="82%" stroke="url(#familyGlowGrad)" strokeWidth="1" strokeDasharray="4 6" />
          <line x1="35%" y1="28%" x2="45%" y2="55%" stroke="url(#familyGlowGrad)" strokeWidth="0.75" />
          <line x1="62%" y1="22%" x2="78%" y2="50%" stroke="url(#familyGlowGrad)" strokeWidth="0.75" />

          <circle cx="12%" cy="18%" r="3" fill="#fbbf24" />
          <circle cx="35%" cy="28%" r="4" fill="#fbbf24" />
          <circle cx="62%" cy="22%" r="3.5" fill="#10b981" />
          <circle cx="88%" cy="30%" r="3" fill="#fbbf24" />
          <circle cx="20%" cy="48%" r="3" fill="#fbbf24" />
          <circle cx="45%" cy="55%" r="4.5" fill="#f59e0b" />
          <circle cx="78%" cy="50%" r="3.5" fill="#10b981" />
          <circle cx="30%" cy="78%" r="3" fill="#fbbf24" />
          <circle cx="60%" cy="82%" r="3.5" fill="#fbbf24" />
        </svg>
      </div>

      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-4">
          <HeartHandshake className="w-3.5 h-3.5" />
          <span>Cohort 01 · Community Fellowship</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-3">
          OUR FIRST 13
        </h2>
        <p className="text-base sm:text-lg text-amber-300/90 font-medium mb-3">
          13 students. One journey. One Big Brother family.
        </p>
        <p className="text-xs sm:text-sm text-neutral-300 max-w-2xl mx-auto leading-relaxed">
          These are the first 13 young men and women of our Palliative Care training pilot.
          Rooted in brotherhood, backed by our ₹10,000 common support fund, they are becoming certified frontline healers for terminal and elderly patients.
        </p>
      </div>

      {/* REAL COHORT FAMILY ALBUM (Interactive Multi-Perspective Showcase) */}
      <div className="mb-16 p-6 sm:p-8 rounded-3xl glass-panel border border-white/15 bg-gradient-to-br from-neutral-900/90 via-[#0e0e15] to-neutral-950 relative overflow-hidden shadow-2xl">
        {/* Album Header & Photo Switcher Pills */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
            <Camera className="w-4 h-4" />
            <span>The Big Brother Family Album · Authentic Cohort Moments</span>
          </div>

          {/* Quick-Switch Photo Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-white/5 border border-white/10 rounded-xl overflow-x-auto">
            {COHORT_PHOTOS.map((photo, idx) => (
              <button
                key={photo.id}
                onClick={() => setSelectedPhotoIndex(idx)}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  selectedPhotoIndex === idx
                    ? 'bg-amber-400 text-neutral-950 font-semibold shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <span>{photo.badge}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Featured Photo + Rich Storytelling Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Main Photo Card (7 cols) */}
          <div className="lg:col-span-7">
            <div
              onClick={() => setIsLightboxOpen(true)}
              className="relative rounded-2xl overflow-hidden border border-white/15 bg-black/50 group cursor-pointer aspect-[16/10] shadow-xl hover:border-amber-400/50 transition-all duration-300"
            >
              <CohortAlbumImage
                src={activePhoto.src}
                alt={activePhoto.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

              {/* Top-Right Lightbox / Fullscreen Icon */}
              <div className="absolute top-3 right-3 p-2 rounded-xl bg-black/60 backdrop-blur-md border border-white/15 text-white/90 group-hover:text-amber-300 group-hover:bg-black/80 transition-colors">
                <Maximize2 className="w-4 h-4" />
              </div>

              {/* Bottom Overlay Label */}
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-white">
                <span className="font-semibold drop-shadow-md flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {activePhoto.badge}
                </span>
                <span className="text-[11px] text-amber-300 font-mono">
                  Click to view full photo →
                </span>
              </div>
            </div>
          </div>

          {/* Context & Companion Thumbnails (5 cols) */}
          <div className="lg:col-span-5 space-y-4 text-left">
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 font-semibold text-[11px] uppercase tracking-wider">
                Real Pilot Moments · No Stock Photos
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-white mt-2 leading-snug">
                {activePhoto.title}
              </h3>
              <p className="text-xs font-medium text-amber-200/90 mt-1">
                {activePhoto.subtitle}
              </p>
            </div>

            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              {activePhoto.caption}
            </p>

            {/* Thumbnail Grid for Instant Switching */}
            <div className="pt-2">
              <div className="text-[11px] uppercase tracking-wider text-neutral-400 font-semibold mb-2">
                All 3 Cohort Views
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                {COHORT_PHOTOS.map((photo, idx) => (
                  <button
                    key={photo.id}
                    onClick={() => setSelectedPhotoIndex(idx)}
                    className={`relative rounded-xl overflow-hidden aspect-[4/3] border transition-all duration-200 ${
                      selectedPhotoIndex === idx
                        ? 'border-amber-400 ring-2 ring-amber-400/30 scale-102'
                        : 'border-white/10 hover:border-white/30 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <CohortAlbumImage
                      src={photo.src}
                      alt={photo.badge}
                      className="w-full h-full object-cover"
                      compact
                    />
                    <div className="absolute inset-0 bg-black/20" />
                    <span className="absolute bottom-1 left-1 text-[9px] font-bold text-white px-1 rounded bg-black/70">
                      #{idx + 1}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Cohort Stats Badge */}
            <div className="pt-2 flex items-center gap-3 text-xs text-neutral-300 border-t border-white/10">
              <span className="flex items-center gap-1">
                <strong className="text-white font-mono">13</strong> Trainees
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <strong className="text-emerald-400 font-mono">0%</strong> Dropout Rate
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <strong className="text-amber-300 font-mono">₹10k/mo</strong> Common Pool
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-10">
        <div className="flex items-center gap-1.5 p-1 bg-white/5 border border-white/10 rounded-xl overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeFilter === 'all'
                ? 'bg-amber-400 text-neutral-950 shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            All 13 Trainees
          </button>
          <button
            onClick={() => setActiveFilter('skill')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
              activeFilter === 'skill'
                ? 'bg-amber-400 text-neutral-950 font-semibold shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Clinical Skill Phase
          </button>
          <button
            onClick={() => setActiveFilter('opportunity')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
              activeFilter === 'opportunity'
                ? 'bg-amber-400 text-neutral-950 font-semibold shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Hospice Internship Phase
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by trainee name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white/5 border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-colors"
          />
        </div>
      </div>

      {/* Responsive CSS Grid: Desktop: 4 cols | Tablet: 2-3 cols | Mobile: 1 col */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-20">
        {filteredStudents.map((student) => {
          const hasImageError = imageErrors[student.id];

          return (
            <TiltCard3D key={student.id} maxTilt={8} scale={1.02} className="h-full">
              <div
                onClick={() => onSelectStudent(student)}
                tabIndex={0}
                role="button"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectStudent(student);
                  }
                }}
                aria-label={`View profile of ${student.name}, Palliative Care Trainee`}
                className="h-full group relative p-5 rounded-2xl glass-panel border border-white/10 hover:border-amber-400/50 bg-neutral-900/60 hover:bg-neutral-900/90 transition-all duration-300 cursor-pointer flex flex-col justify-between hover:shadow-xl hover:shadow-amber-500/10 focus-visible:outline-2 focus-visible:outline-amber-400 text-left"
              >
                {/* Glow ring on hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-amber-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                <div>
                  {/* Photo / Avatar Header */}
                  <div className="relative mb-4 flex items-center justify-between">
                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/15 group-hover:border-amber-400/60 shadow-lg bg-neutral-950 flex items-center justify-center shrink-0">
                      {!hasImageError ? (
                        <img
                          src={student.photoUrl}
                          alt={student.name}
                          onError={() => handleStudentAvatarError(student.id)}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : null}

                      {/* Fallback authentic warm monogram badge */}
                      {hasImageError && (
                        <div
                          className={`w-full h-full bg-gradient-to-br ${student.avatarColor} flex items-center justify-center font-bold text-lg tracking-wider text-white shadow-inner`}
                        >
                          {student.initials}
                        </div>
                      )}
                    </div>

                    {/* Trainee ID & Expansion Icon */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-mono text-neutral-400 font-semibold px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                        #{student.id}
                      </span>
                      <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-amber-400 group-hover:text-neutral-950 transition-colors shadow-sm">
                        <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-950" />
                      </div>
                    </div>
                  </div>

                  {/* Name & Palliative Care Trainee Tag */}
                  <div className="mb-3">
                    <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors tracking-tight">
                      {student.name}
                    </h3>
                    <div className="text-xs font-semibold text-amber-400 tracking-wide mt-0.5">
                      Palliative Care Trainee
                    </div>
                  </div>

                  {/* Clinical Module Focus */}
                  <div className="mb-4 space-y-1">
                    <div className="text-[10px] uppercase font-semibold text-neutral-400 tracking-wider">
                      Module Focus
                    </div>
                    <p className="text-xs text-neutral-200 font-medium line-clamp-2 leading-relaxed">
                      {student.module}
                    </p>
                  </div>
                </div>

                {/* Card Footer: Mentor & Support Fund Link */}
                <div className="pt-3 border-t border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-neutral-400">Mentor: {student.mentorName}</span>
                    <span className="text-emerald-400 font-mono font-semibold">{student.progressPercentage}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full transition-all duration-500"
                      style={{ width: `${student.progressPercentage}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-neutral-400 truncate">
                    <span className="text-neutral-500">Need Shield: </span>
                    {student.supportFundBenefited}
                  </div>
                </div>
              </div>
            </TiltCard3D>
          );
        })}
      </div>

      {/* Teachers and Institute Leadership Block */}
      <div className="p-8 sm:p-10 rounded-3xl glass-panel border border-white/15 bg-neutral-900/70 relative shadow-2xl">
        <div className="max-w-3xl mb-8 text-left">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">
            <GraduationCap className="w-4 h-4" />
            <span>Academic Faculty & Institute Leadership</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            The Mentors Guiding Our 13 Trainees
          </h3>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed mt-1">
            Behind every student standing on their own feet is an unshakeable teaching team.
            Our clinical instructors and institute leadership provide the daily guidance, rigor, and emotional support required for hospice mastery.
          </p>
        </div>

        {/* Faculty & Leadership Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
          {FACULTY_AND_LEADERSHIP.map((person) => (
            <div
              key={person.id}
              className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-400/40 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 font-bold text-xs">
                    {person.category === 'Faculty' ? 'FAC' : 'LEAD'}
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-neutral-400">
                    {person.designation}
                  </span>
                </div>
                <h4 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                  {person.name}
                </h4>
                <div className="text-xs text-amber-300/80 font-medium mt-0.5">
                  {person.role}
                </div>
                <p className="text-xs text-neutral-300 mt-3 leading-relaxed">
                  {person.bio}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-1.5 text-[11px] text-neutral-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Mentoring Cohort 01</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* High-Resolution Fullscreen Lightbox Modal */}
      {isLightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200"
        >
          {/* Close button */}
          <button
            onClick={() => setIsLightboxOpen(false)}
            aria-label="Close Lightbox"
            className="absolute top-5 right-5 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white z-10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Navigation Arrows */}
          <button
            onClick={() => setSelectedPhotoIndex((prev) => (prev - 1 + COHORT_PHOTOS.length) % COHORT_PHOTOS.length)}
            aria-label="Previous Photo"
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 border border-white/10 text-white hover:bg-amber-400 hover:text-neutral-950 transition-colors z-10"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={() => setSelectedPhotoIndex((prev) => (prev + 1) % COHORT_PHOTOS.length)}
            aria-label="Next Photo"
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 border border-white/10 text-white hover:bg-amber-400 hover:text-neutral-950 transition-colors z-10"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="max-w-5xl max-h-[90vh] flex flex-col items-center justify-center space-y-4">
            <div className="relative rounded-2xl overflow-hidden border border-white/20 shadow-2xl max-h-[75vh]">
              <CohortAlbumImage
                src={activePhoto.src}
                alt={activePhoto.title}
                className="max-h-[75vh] w-auto object-contain mx-auto"
                fallbackClassName="w-[min(90vw,960px)] aspect-[16/10] max-h-[75vh]"
              />
            </div>
            <div className="text-center max-w-2xl px-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1">
                {activePhoto.badge} · Photo {selectedPhotoIndex + 1} of {COHORT_PHOTOS.length}
              </div>
              <h4 className="text-lg font-bold text-white">{activePhoto.title}</h4>
              <p className="text-xs text-neutral-300 mt-1">{activePhoto.caption}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function CohortAlbumImage({
  src,
  alt,
  className,
  fallbackClassName = 'h-full w-full',
  compact = false
}: {
  src: string;
  alt: string;
  className: string;
  fallbackClassName?: string;
  compact?: boolean;
}) {
  const [unavailable, setUnavailable] = useState(false);

  if (unavailable) {
    return (
      <div
        role="img"
        aria-label={`${alt}: Image unavailable`}
        className={`${fallbackClassName} flex flex-col items-center justify-center gap-2 bg-neutral-900/90 px-2 text-center text-neutral-400`}
      >
        <Camera className={compact ? 'h-4 w-4' : 'h-7 w-7'} />
        <span className={compact ? 'text-[9px] leading-tight' : 'text-xs font-medium'}>Image unavailable</span>
      </div>
    );
  }

  return <img src={src} alt={alt} onError={() => setUnavailable(true)} className={className} />;
}
