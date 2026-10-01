import { X, MapPin, Heart, BookOpen, User, CheckCircle2, Shield } from 'lucide-react';
import { Student } from '../types';

interface StudentDetailModalProps {
  student: Student | null;
  onClose: () => void;
}

export default function StudentDetailModal({ student, onClose }: StudentDetailModalProps) {
  if (!student) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-[#0e0e15] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/15 text-neutral-300 hover:text-white transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Profile Bar */}
        <div className="flex items-start gap-4 mb-6">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/20 bg-neutral-950 flex items-center justify-center font-bold text-lg shrink-0 shadow-lg">
            {student.photoUrl && (
              <img
                src={student.photoUrl}
                alt={student.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
            <div
              className={`w-full h-full bg-gradient-to-br ${student.avatarColor} flex items-center justify-center font-bold text-lg text-white`}
              style={{ position: student.photoUrl ? 'absolute' : 'relative', zIndex: -1 }}
            >
              {student.initials}
            </div>
          </div>

          <div className="pr-8">
            <div className="flex items-center gap-2">
              <h3 className="text-xl sm:text-2xl font-bold text-white">{student.name}</h3>
              <span className="text-xs text-neutral-400">· #{student.id}</span>
            </div>
            <div className="text-xs font-semibold text-amber-400 tracking-wide mt-0.5">
              Palliative Care Trainee
            </div>
            <div className="flex items-center gap-1.5 text-xs text-neutral-400 mt-1">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>{student.origin} · {student.age} yrs</span>
            </div>
            <div className="mt-2 inline-flex items-center gap-2 text-xs">
              <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-neutral-200 font-medium">
                Stage: {student.journeyStage}
              </span>
              <span className="text-amber-400 font-semibold">{student.progressPercentage}% Complete</span>
            </div>
          </div>
        </div>

        {/* Content Tabs / Bento Details */}
        <div className="space-y-4">
          {/* Active Clinical Module */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
              <BookOpen className="w-4 h-4" />
              <span>Current Palliative Training Module</span>
            </div>
            <p className="text-sm font-medium text-white">{student.module}</p>
          </div>

          {/* Personal Journey & Background */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="text-xs font-semibold text-neutral-400 mb-1 uppercase tracking-wider">
              Background & Calling
            </div>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              {student.personalStory}
            </p>
          </div>

          {/* Tangible Fund Benefit */}
          <div className="p-4 rounded-xl bg-amber-400/5 border border-amber-400/20">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
              <Shield className="w-4 h-4" />
              <span>Direct Benefit from the ₹10,000 Collective Fund</span>
            </div>
            <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed">
              {student.dailyChallengeOvercome}
            </p>
            <div className="mt-2 text-[11px] text-amber-300/80 font-mono">
              Allocated coverage: {student.supportFundBenefited}
            </div>
          </div>

          {/* Mentor Feedback */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
              <span className="font-semibold uppercase tracking-wider">Big Bro (Mai Tera) Mentor Feedback</span>
              <span className="text-neutral-300 font-medium">Mentor: {student.mentorName}</span>
            </div>
            <p className="text-xs sm:text-sm text-neutral-300 italic">
              "{student.mentorFeedback}"
            </p>
          </div>

          {/* Part of Cohort 01 Big Brother Family */}
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
            <div className="w-16 h-12 rounded-lg overflow-hidden shrink-0 border border-white/15 bg-black">
              <img
                src="WhatsApp Image 2026-09-18 at 5.47.20 PM (1).jpeg"
                alt="Cohort 01 Family"
                onError={(e) => {
                  const img = e.currentTarget;
                  if (!img.dataset.attempt) {
                    img.dataset.attempt = '1';
                    img.src = '/WhatsApp Image 2026-09-18 at 5.47.20 PM (1).jpeg';
                  }
                }}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-left text-xs">
              <div className="font-semibold text-white">{student.name} is 1 of Our First 13</div>
              <p className="text-[11px] text-neutral-400">Supported by the ₹10,000 common fund & mentor network.</p>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-neutral-400">
          <span>Trainee #{student.id} of 13 Pilot Members</span>
          <span className="text-neutral-500">Demo student profile for pilot demonstration</span>
        </div>
      </div>
    </div>
  );
}
