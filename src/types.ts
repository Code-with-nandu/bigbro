export interface Student {
  id: number;
  name: string;
  age: number;
  origin: string;
  avatarColor: string;
  initials: string;
  module: string;
  journeyStage: 'Support' | 'Skill' | 'Opportunity' | 'Job' | 'Independence' | 'Give Forward';
  progressPercentage: number;
  personalStory: string;
  aspiration: string;
  mentorName: string;
  mentorFeedback: string;
  dailyChallengeOvercome: string;
  supportFundBenefited: string;
  photoUrl?: string;
  slug?: string;
  role?: string;
}

export interface ProblemItem {
  id: number;
  title: string;
  shortSummary: string;
  groundReality: string;
  impactOnTrainee: string;
  iconName: string;
}

export interface PillarItem {
  id: number;
  title: string;
  subtitle: string;
  answersProblemId: number;
  actionProtocol: string;
  keyMetric: string;
  howWeDeliver: string[];
}

export interface JourneyStage {
  step: number;
  name: string;
  tagline: string;
  description: string;
  milestones: string[];
  studentQuote: string;
  studentAuthor: string;
}

export interface FundAllocation {
  category: string;
  monthlyAmount: number;
  percentage: number;
  description: string;
  perStudentBreakdown: string;
  color: string;
}

export type ContributionTier = {
  id: string;
  name: string;
  amount: number;
  scope: string;
  impactDescription: string;
};
