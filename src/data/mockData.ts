import { Student, ProblemItem, PillarItem, JourneyStage, FundAllocation, ContributionTier } from '../types';

export const INSTITUTIONAL_PARTNERSHIP = {
  partnerName: "Art of Living",
  partnerRole: "Core Training Infrastructure & Operations",
  partnerProvisions: [
    "Full palliative care assistant clinical syllabus & accredited training facilities",
    "Local transportation support for all trainees",
    "Shared meals / nutrition support during demanding 8-hour training shifts"
  ],
  bigBroRole: "Personal Support & Need-Based Shield Layer",
  bigBroProvisions: [
    "Emergency personal needs — small unexpected expenses when a student is in genuine difficulty",
    "Essential learning expenses — notebooks, stationery, printing, study materials, or training needs",
    "Communication & digital support — internet/data packs, essential digital requirements",
    "Personal care & wellbeing needs — small essential needs affecting training continuity",
    "Special individual support — occasional support for genuine personal situations (case-by-case)",
    "Post-training transition support — reasonable small expenses for interviews and job transitions"
  ],
  importantClarification: "The ₹10,000 is a common monthly fund for all 15 students, not ₹10,000 per student and not a guaranteed monthly payment to every student."
};

export interface FacultyMember {
  id: string;
  name: string;
  designation: string;
  role: string;
  category: 'Faculty' | 'Leadership';
  photoUrl?: string;
  bio: string;
}

export const FACULTY_AND_LEADERSHIP: FacultyMember[] = [
  {
    id: "varati_madam",
    name: "Varati Madam",
    designation: "Teacher / Faculty",
    role: "Palliative Care Faculty & Clinical Instructor",
    category: "Faculty",
    photoUrl: "/students/varati_madam.jpg",
    bio: "Guiding the 15 trainees through rigorous bedside hospice care, symptom management, and patient dignity ethics."
  },
  {
    id: "sandhyashree_kc",
    name: "Sandhyashree K C",
    designation: "Teacher / Faculty",
    role: "Palliative Care Faculty & Trainer",
    category: "Faculty",
    photoUrl: "/students/sandhyashree_kc.jpg",
    bio: "Mentoring trainees on clinical communication, vital signs documentation, and compassionate family accompaniment."
  },
  {
    id: "principal",
    name: "Principal",
    designation: "Principal",
    role: "Healthcare Vocational Institute Head",
    category: "Leadership",
    photoUrl: "/students/principal.jpg",
    bio: "Stewarding academic excellence, institutional accreditation, and vocational health pathways for grassroots youths."
  },
  {
    id: "vice_principal",
    name: "Vice Principal",
    designation: "Vice Principal",
    role: "Clinical Operations & Student Welfare",
    category: "Leadership",
    photoUrl: "/students/vice_principal.jpg",
    bio: "Overseeing hospital clinical rotations, student wellbeing support, and verified living-wage placement pipelines."
  }
];

const createPendingStudent = (
  id: number,
  name: string,
  slug: string,
  age: number,
  initials: string,
  avatarColor: string
): Student => ({
  id,
  name,
  role: "Palliative Care Trainee",
  slug,
  photoUrl: `/students/${slug}.jpg`,
  age,
  origin: "Not provided",
  avatarColor,
  initials,
  module: "Not provided",
  journeyStage: "Support",
  progressPercentage: 0,
  personalStory: "Profile details have not been provided.",
  aspiration: "Not provided",
  mentorName: "Not assigned",
  mentorFeedback: "Not provided",
  dailyChallengeOvercome: "Not provided",
  supportFundBenefited: "Not provided"
});

export const STUDENTS_DATA: Student[] = [
  {
    id: 1,
    name: "Krishnendu",
    role: "Palliative Care Trainee",
    slug: "krishnendu",
    photoUrl: "/students/krishnendu.jpg",
    age: 22,
    origin: "West Bengal",
    avatarColor: "from-amber-500/20 to-orange-500/30 border-amber-500/40 text-amber-300",
    initials: "KR",
    module: "Terminal Patient Comfort & Pain Management",
    journeyStage: "Skill",
    progressPercentage: 74,
    personalStory: "Dedicated young leader in the cohort with a natural calling for bedside empathy. Driven to bring dignified, pain-free comfort to geriatric patients.",
    aspiration: "Lead palliative caregiver and hospice operations supervisor.",
    mentorName: "Varati Madam",
    mentorFeedback: "Remarkable calm and emotional maturity when comforting patients in acute discomfort.",
    dailyChallengeOvercome: "Faced sudden emergency family medicine costs; assisted by the Big Bro need-based emergency buffer.",
    supportFundBenefited: "Essential study binder, laminated clinical charts & emergency micro-reserve"
  },
  createPendingStudent(2, "Akshay Manohar", "akshay-manohar", 29, "AK", "from-emerald-500/20 to-teal-500/30 border-emerald-500/40 text-emerald-300"),
  {
    id: 3,
    name: "Amarnath",
    role: "Palliative Care Trainee",
    slug: "amarnath",
    photoUrl: "/students/amarnath.jpg",
    age: 23,
    origin: "West Bengal",
    avatarColor: "from-cyan-500/20 to-blue-500/30 border-cyan-500/40 text-cyan-300",
    initials: "AM",
    module: "Family Counseling & Emotional Care",
    journeyStage: "Skill",
    progressPercentage: 68,
    personalStory: "Inspired by caring for elderly relatives. Excels at bringing gentle reassurance to families struggling with grief and medical acceptance.",
    aspiration: "Certified palliative hospice coordinator.",
    mentorName: "Varati Madam",
    mentorFeedback: "Deep listener. Families in our mock simulations immediately feel comforted in his presence.",
    dailyChallengeOvercome: "Struggled with remote connectivity; digital data pack enabled timely course access.",
    supportFundBenefited: "Communication mobile data pack & psychological counseling handbook"
  },
  {
    id: 4,
    name: "Ajay",
    role: "Palliative Care Trainee",
    slug: "ajay",
    photoUrl: "/students/ajay.jpg",
    age: 22,
    origin: "West Bengal",
    avatarColor: "from-indigo-500/20 to-violet-500/30 border-indigo-500/40 text-indigo-300",
    initials: "AJ",
    module: "Vitals Monitoring & Clinical Hygiene",
    journeyStage: "Opportunity",
    progressPercentage: 80,
    personalStory: "Detail-oriented and disciplined. Dedicated to mastering infection control, clinical sanitation, and vital signs alerting protocols.",
    aspiration: "Senior clinical palliative orderly in an intensive hospice wing.",
    mentorName: "Sandhyashree K C",
    mentorFeedback: "Flawless attention to sterilization protocols and emergency vital reporting.",
    dailyChallengeOvercome: "Needed digital pulse oximeter demonstration log sheets and interview prep materials.",
    supportFundBenefited: "Clinical practice charts & post-training transition kit"
  },
  {
    id: 5,
    name: "Kajal",
    role: "Palliative Care Trainee",
    slug: "kajal",
    photoUrl: "/students/kajal.jpg",
    age: 20,
    origin: "West Bengal",
    avatarColor: "from-rose-500/20 to-pink-500/30 border-rose-500/40 text-rose-300",
    initials: "KJ",
    module: "Hospice Clinical Ethics & Patient Rights",
    journeyStage: "Skill",
    progressPercentage: 71,
    personalStory: "Overcame immense odds to pursue professional healthcare. Fierce advocate for patient dignity, clean sheets, and respectful bedside communication.",
    aspiration: "Senior hospice care assistant and future Big Bro mentor.",
    mentorName: "Varati Madam",
    mentorFeedback: "Fierce defender of patient comfort, clean sheets, and respectful bedside communication.",
    dailyChallengeOvercome: "Nearly dropped out due to zero family pocket money for emergency personal needs; saved by the ₹10k fund.",
    supportFundBenefited: "Emergency personal need buffer & learning study material"
  },
  {
    id: 6,
    name: "Swechaya",
    role: "Palliative Care Trainee",
    slug: "swechaya",
    photoUrl: "/students/swechaya.jpg",
    age: 21,
    origin: "West Bengal",
    avatarColor: "from-fuchsia-500/20 to-purple-500/30 border-fuchsia-500/40 text-fuchsia-300",
    initials: "SW",
    module: "Nutrition & Enteral Tube Feeding Support",
    journeyStage: "Skill",
    progressPercentage: 66,
    personalStory: "Passionate about ensuring terminal patients receive comfortable, gentle nutritional sustenance in their final chapters with warmth and grace.",
    aspiration: "Community palliative nutritional supervisor.",
    mentorName: "Sandhyashree K C",
    mentorFeedback: "Meticulous in feeding rate calculations and patient head elevation posture.",
    dailyChallengeOvercome: "Required special personal care hygiene supplies during grueling 8-hour hospital clinicals.",
    supportFundBenefited: "Personal care & wellbeing kit + clinical reference manuals"
  },
  {
    id: 7,
    name: "Shiva",
    role: "Palliative Care Trainee",
    slug: "shiva",
    photoUrl: "/students/shiva.jpg",
    age: 23,
    origin: "West Bengal",
    avatarColor: "from-sky-500/20 to-cyan-500/30 border-sky-500/40 text-sky-300",
    initials: "SH",
    module: "Palliative Medication Timing & Cold Storage",
    journeyStage: "Skill",
    progressPercentage: 69,
    personalStory: "Dedicated to precision in palliative symptom alleviation. Strives to ensure pain management protocols are carried out with absolute punctuality.",
    aspiration: "Hospital hospice pharmacy assistant and bedside companion.",
    mentorName: "Varati Madam",
    mentorFeedback: "Precise with medication schedules and symptom monitoring records.",
    dailyChallengeOvercome: "English medical abbreviations were intimidating; mastered 120 key medical terms with reference guides.",
    supportFundBenefited: "Laminated pharmacology pocket cheat-sheets & digital data pack"
  },
  {
    id: 8,
    name: "Suryanarayan",
    role: "Palliative Care Trainee",
    slug: "suryanarayan",
    photoUrl: "/students/suryanarayan.jpg",
    age: 24,
    origin: "West Bengal",
    avatarColor: "from-amber-600/20 to-yellow-600/30 border-amber-600/40 text-amber-200",
    initials: "SN",
    module: "Geriatric Communication & Non-Verbal Empathy",
    journeyStage: "Opportunity",
    progressPercentage: 78,
    personalStory: "Warm-hearted caregiver with an instinctive gift for connecting with dementia and Alzheimer’s patients when speech is no longer possible.",
    aspiration: "Chief patient companion in specialized oncology hospice.",
    mentorName: "Sandhyashree K C",
    mentorFeedback: "Natural empathy and patience with dementia and memory-impaired patients.",
    dailyChallengeOvercome: "Family faced a sudden crop shock; case-by-case special support buffer prevented him from abandoning training.",
    supportFundBenefited: "Special individual emergency buffer & clinical logbook"
  },
  {
    id: 9,
    name: "Vumi",
    role: "Palliative Care Trainee",
    slug: "vumi",
    photoUrl: "/students/vumi.jpg",
    age: 20,
    origin: "West Bengal",
    avatarColor: "from-purple-500/20 to-indigo-500/30 border-purple-500/40 text-purple-300",
    initials: "VU",
    module: "Patient Dignity & Wound Dressing",
    journeyStage: "Skill",
    progressPercentage: 65,
    personalStory: "Believes deeply that human dignity in the final days of life is a sacred right. Excels in gentle, aseptic wound care and decubitus prevention.",
    aspiration: "Specialist home-visit wound & pressure ulcer management nurse.",
    mentorName: "Varati Madam",
    mentorFeedback: "Tender touch and exemplary hygiene awareness during aseptic dressing drills.",
    dailyChallengeOvercome: "Needed supportive ergonomic footwear for 8-hour hospice rotations; assisted by wellbeing fund.",
    supportFundBenefited: "Clinical footwear wellbeing support & antiseptic dressing study guides"
  },
  {
    id: 10,
    name: "Sanju",
    role: "Palliative Care Trainee",
    slug: "sanju",
    photoUrl: "/students/sanju.jpg",
    age: 22,
    origin: "West Bengal",
    avatarColor: "from-blue-500/20 to-sky-500/30 border-blue-500/40 text-blue-300",
    initials: "SJ",
    module: "Respiratory Support & Oxygen Protocol",
    journeyStage: "Skill",
    progressPercentage: 70,
    personalStory: "Focused and methodical. Aims to bring certified respiratory palliative care and oxygen protocol expertise to district hospital units.",
    aspiration: "Lead palliative care technician at district level.",
    mentorName: "Sandhyashree K C",
    mentorFeedback: "Calm under pressure during simulated respiratory distress emergencies.",
    dailyChallengeOvercome: "High-speed data recharge enabled daily telemedicine and palliative symptom webinars.",
    supportFundBenefited: "Monthly digital communication data & clinical study materials"
  },
  {
    id: 11,
    name: "Shshni",
    role: "Palliative Care Trainee",
    slug: "shshni",
    photoUrl: "/students/shshni.jpg",
    age: 21,
    origin: "West Bengal",
    avatarColor: "from-teal-500/20 to-emerald-500/30 border-teal-500/40 text-teal-300",
    initials: "SS",
    module: "Bereavement Support & Family Care Plans",
    journeyStage: "Opportunity",
    progressPercentage: 76,
    personalStory: "Combines quiet strength with profound emotional sensitivity. Helps terminal patients and their families write care plans and find peace.",
    aspiration: "Community palliative social caregiver.",
    mentorName: "Varati Madam",
    mentorFeedback: "Warm, grounding aura. Instinctively senses unspoken emotional burdens.",
    dailyChallengeOvercome: "Assisted with interview outfit, resume printouts, and post-training hospital placement transit.",
    supportFundBenefited: "Post-training interview transition support & mentorship drills"
  },
  {
    id: 12,
    name: "Tony",
    role: "Palliative Care Trainee",
    slug: "tony",
    photoUrl: "/students/tony.jpg",
    age: 23,
    origin: "West Bengal",
    avatarColor: "from-violet-500/20 to-indigo-500/30 border-violet-500/40 text-violet-300",
    initials: "TN",
    module: "Documentation & Electronic Health Records",
    journeyStage: "Skill",
    progressPercentage: 67,
    personalStory: "Sharp analytical thinker who understands that precise clinical records, vitals charting, and doctor handovers save lives.",
    aspiration: "Hospice operations and patient care records supervisor.",
    mentorName: "Sandhyashree K C",
    mentorFeedback: "Sharp analytical mind and immaculate record-keeping discipline.",
    dailyChallengeOvercome: "Study printing and certification exam documentation expenses covered on time.",
    supportFundBenefited: "Essential study printing credits & electronic health records guide"
  },
  createPendingStudent(13, "ABIJAY BIJU S B", "abijay-biju-s-b", 23, "AB", "from-emerald-600/20 to-teal-600/30 border-emerald-600/40 text-emerald-200"),
  createPendingStudent(14, "Vatan Mishra", "vatan-mishra", 22, "VM", "from-cyan-500/20 to-blue-500/30 border-cyan-500/40 text-cyan-300"),
  createPendingStudent(15, "AMAL VELAYUDHAN T V", "amal-velayudhan-t-v", 29, "AM", "from-amber-500/20 to-orange-500/30 border-amber-500/40 text-amber-300")
];

export const FIVE_PROBLEMS: ProblemItem[] = [
  {
    id: 1,
    title: "Money & Out-of-Pocket Shocks",
    shortSummary: "Unexpected micro-expenses that threaten training continuity",
    groundReality: "While Art of Living generously provides local transport and shift meals, trainees have zero safety buffer for sudden family emergencies, essential study materials, or internet data.",
    impactOnTrainee: "Even a small ₹200 printing expense or sudden medical bill forces a vulnerable youth to abandon classes to seek day labor.",
    iconName: "Coins"
  },
  {
    id: 2,
    title: "Relationship",
    shortSummary: "Total emotional isolation & absence of guidance",
    groundReality: "Most trainees come from backgrounds where no elder sibling or parent has ever worked in healthcare, corporate environments, or formal institutional setups.",
    impactOnTrainee: "When anxiety, family skepticism, or self-doubt strikes, they have nobody to call—no 'Big Bro (Mai Tera)' to say: 'Hold on, we're in this together.'",
    iconName: "HeartHandshake"
  },
  {
    id: 3,
    title: "Language",
    shortSummary: "The intimidating wall of clinical English & communication",
    groundReality: "Palliative care requires interacting with doctors, reading dosage charts, and communicating gently with grieving families in multiple languages.",
    impactOnTrainee: "Fear of speaking incorrect English or stumbling in front of senior hospital staff destroys confidence despite superb practical caregiving skills.",
    iconName: "MessageSquareQuote"
  },
  {
    id: 4,
    title: "Job Search",
    shortSummary: "No network, no resume literacy, no direct hospital access",
    groundReality: "Graduating with a certificate doesn't guarantee a job if the trainee does not know how to approach hospital HR, present credentials, or navigate interview panels.",
    impactOnTrainee: "Youths risk falling back into informal unorganized labor after completing intensive months of training due to a broken bridge to employment.",
    iconName: "Briefcase"
  },
  {
    id: 5,
    title: "Body Language + Health + Wellbeing",
    shortSummary: "Physical strain, personal hygiene needs & clinical poise",
    groundReality: "Palliative care involves moving immobile patients, 8-hour standing shifts, and secondary trauma. Personal wellbeing and ergonomic items are essential.",
    impactOnTrainee: "Lack of proper footwear or personal care items causes physical burnout within weeks. Trainees often look exhausted rather than confident healers.",
    iconName: "Activity"
  }
];

export const FIVE_PILLARS: PillarItem[] = [
  {
    id: 1,
    title: "Need-Based Personal Support Shield",
    subtitle: "The ₹10,000/Month Common Protective Pool",
    answersProblemId: 1,
    actionProtocol: "A collective monthly pool of ₹10,000 provides an agile, case-by-case personal safety net across 6 need-based categories (Art of Living already covers local transit and shift meals).",
    keyMetric: "₹10,000/mo common pool for 15 trainees (zero dropout rate)",
    howWeDeliver: [
      "Emergency personal needs for unexpected student hardships",
      "Essential learning expenses: notebooks, printing & charts",
      "Digital communication packs for internet & course access",
      "Post-training transition funds for interview travel & joining"
    ]
  },
  {
    id: 2,
    title: "Relationship & Mentoring",
    subtitle: "1-on-1 Elder Guidance That Never Leaves Your Side",
    answersProblemId: 2,
    actionProtocol: "Every student is paired with a dedicated 'Big Bro' elder mentor—an elder figure for weekly check-ins, emotional decompression, and moral stamina.",
    keyMetric: "Weekly 60-min dedicated 1-on-1 mentoring dialogue",
    howWeDeliver: [
      "Weekly debriefs on emotional fatigue & clinical challenges",
      "Family counseling when relatives doubt healthcare work",
      "Safe space to express fears, doubts, and personal dreams",
      "Lifelong elder brotherhood even after graduation"
    ]
  },
  {
    id: 3,
    title: "Language & Communication",
    subtitle: "Confidence to Speak, Console & Chart",
    answersProblemId: 3,
    actionProtocol: "Daily 30-minute contextual communication sessions focusing on bedside compassion, medical terminology in English, and clear patient charting.",
    keyMetric: "120+ clinical medical terms mastered with patient roleplays",
    howWeDeliver: [
      "Simulation roleplays with doctor handovers",
      "Empathetic conversation practice for terminal patient care",
      "Reading vitals charts and doctor prescriptions with zero hesitation",
      "Eliminating language anxiety without erasing mother tongue pride"
    ]
  },
  {
    id: 4,
    title: "Career & Job Search",
    subtitle: "Direct Bridge to Fair Living-Wage Employment",
    answersProblemId: 4,
    actionProtocol: "We don't merely train; we accompany each graduate until they secure a verified living-wage placement in accredited hospices, hospitals, or certified home care.",
    keyMetric: "Direct placement pipeline with verified living wages",
    howWeDeliver: [
      "Professional resume building tailored to healthcare institutions",
      "Mock interviews with hospital HR directors & hospice supervisors",
      "Pre-vetted healthcare employer network across Bengal & East India",
      "First 90-day workplace transition tracking and dispute protection"
    ]
  },
  {
    id: 5,
    title: "Personal Care, Wellbeing & Clinical Poise",
    subtitle: "Ergonomic Stamina & Professional Bedside Presence",
    answersProblemId: 5,
    actionProtocol: "Personal care wellbeing support, supportive footwear guidance, physical biomechanics for safe patient lifting, and emotional decompression circles.",
    keyMetric: "Bedside posture stamina + zero musculoskeletal strain",
    howWeDeliver: [
      "Personal care & wellbeing support for trainees on 8-hr shifts",
      "Biomechanics training for safe patient turning and lifting",
      "Clinical grooming, eye contact, and compassionate bedside stance",
      "Mental health decompression circles for handling grief"
    ]
  }
];

export const JOURNEY_STAGES: JourneyStage[] = [
  {
    step: 1,
    name: "Support",
    tagline: "Stabilize the Foundation",
    description: "Art of Living covers training infrastructure, local transit, and shift meals; Big Bro’s ₹10,000 common pool absorbs emergency personal needs, study supplies, and digital data so the student can focus on learning.",
    milestones: [
      "Baseline needs assessment across all 15 students",
      "Activation of the ₹10k/mo need-based personal support layer",
      "Big Bro 1-on-1 mentor pairing",
      "Essential study materials & digital connectivity packs distributed"
    ],
    studentQuote: "With our classes, travel, and emergency expenses supported together, we can focus 100% on learning.",
    studentAuthor: "Rahul Soren, Trainee"
  },
  {
    step: 2,
    name: "Skill",
    tagline: "Rigorous Palliative Mastery",
    description: "6 months of intensive, compassionate clinical training: symptom control, wound management, vitals monitoring, respiratory assistance, and deep human empathy.",
    milestones: [
      "320 hours of clinical bedside training",
      "Vital signs, oxygen protocols, catheter and tube care",
      "Medical English & patient documentation literacy",
      "In-depth palliative ethics & palliative comfort modules"
    ],
    studentQuote: "Holding an elderly patient's hand with confidence requires both science and heart.",
    studentAuthor: "Priya Sharma, Trainee"
  },
  {
    step: 3,
    name: "Opportunity",
    tagline: "Real-World Hospice Exposure",
    description: "Structured clinical rotations in accredited cancer hospitals, geriatric wards, and community home-hospice visits under experienced supervisors.",
    milestones: [
      "Clinical internship rotations under palliative nurses",
      "Home-visit palliative protocols & family interaction",
      "Weekly mentorship debriefs on coping with loss and grief",
      "Performance evaluation by hospital supervisors"
    ],
    studentQuote: "Working beside senior nurses showed me that our work is sacred and deeply needed.",
    studentAuthor: "Bikash Murmu, Trainee"
  },
  {
    step: 4,
    name: "Job",
    tagline: "Dignified, Fair-Wage Placement",
    description: "Direct placement with vetted healthcare partners. Transition support covers interview clothes, travel, and initial documentation.",
    milestones: [
      "Employer matching with accredited hospices & healthcare providers",
      "Interview prep, legal contract review, and fair wage assurance",
      "Post-training interview and joining transition assistance",
      "First paycheck celebration with family"
    ],
    studentQuote: "A job where you earn with pride and heal with kindness changes an entire family.",
    studentAuthor: "Manoj Kisku, Trainee"
  },
  {
    step: 5,
    name: "Independence",
    tagline: "Standing on Your Own Feet",
    description: "The core promise of BIG BRO (May 13 / Mai Tera) realized: financial self-reliance, debt clearance, dignified social standing, and true agency over one’s destiny.",
    milestones: [
      "Sustainable monthly living wage supporting immediate family",
      "Financial literacy & savings accounts initiated",
      "Transition from trainee to respected healthcare professional",
      "Full self-sufficiency without needing external relief"
    ],
    studentQuote: "Standing on your own feet means your parents can sleep without worry tonight.",
    studentAuthor: "Rina Tudu, Trainee"
  },
  {
    step: 6,
    name: "Give Forward",
    tagline: "The Circle of Brotherhood",
    description: "The cycle completes and regenerates: graduates return to mentor the next cohort of 15 and contribute back into the ₹10,000 common fund for younger brothers and sisters.",
    milestones: [
      "Alumni return as guest mentors for new students",
      "Voluntary small contribution into the Big Bro (Mai Tera) common pool",
      "Creating an unstoppable chain of community empowerment",
      "Expanding from 13 to hundreds standing on their own feet"
    ],
    studentQuote: "Someone held my hand when I was stumbling. Now it is my turn to hold the next one.",
    studentAuthor: "Kajal Mahato, Trainee"
  }
];

export const FUND_ALLOCATIONS: FundAllocation[] = [
  {
    category: "Emergency Personal Needs",
    monthlyAmount: 2500,
    percentage: 25,
    description: "Small unexpected micro-expenses when a trainee faces genuine difficulty (urgent medicines, emergency family crisis, sudden hardship).",
    perStudentBreakdown: "Available dynamically for urgent case-by-case distress",
    color: "bg-rose-500"
  },
  {
    category: "Essential Learning Expenses",
    monthlyAmount: 2000,
    percentage: 20,
    description: "Notebooks, stationery, printing, study materials, clinical charts, and training-related documentation.",
    perStudentBreakdown: "Shared clinical notebooks, laminated guides & printing pool",
    color: "bg-amber-500"
  },
  {
    category: "Communication & Digital Support",
    monthlyAmount: 1500,
    percentage: 15,
    description: "Internet and mobile data packs, essential digital requirements, and communication-related expenses for coursework and shifts.",
    perStudentBreakdown: "Ensures all 15 trainees have uninterrupted mobile internet access",
    color: "bg-sky-500"
  },
  {
    category: "Personal Care & Wellbeing Needs",
    monthlyAmount: 1500,
    percentage: 15,
    description: "Small essential hygiene, footwear, and personal wellness needs that directly affect a student’s ability to attend and continue training.",
    perStudentBreakdown: "Dignified personal wellbeing & supportive clinical items",
    color: "bg-emerald-500"
  },
  {
    category: "Special Individual Support",
    monthlyAmount: 1500,
    percentage: 15,
    description: "Occasional support for genuine, unique personal situations assessed case-by-case with mentor approval.",
    perStudentBreakdown: "Need-based discretion buffer for bespoke trainee challenges",
    color: "bg-purple-500"
  },
  {
    category: "Post-Training Transition Support",
    monthlyAmount: 1000,
    percentage: 10,
    description: "Reasonable small expenses connected with attending hospital interviews, formal joining, and transition into employment.",
    perStudentBreakdown: "Interview transit, formal presentation & first-month onboarding buffer",
    color: "bg-teal-500"
  }
];

export const CONTRIBUTION_TIERS: ContributionTier[] = [
  {
    id: "learning_digital",
    name: "Learning & Digital Pack",
    amount: 1000,
    scope: "Notebooks, Study Printing & Data Recharge",
    impactDescription: "Underwrites 1 month of high-speed mobile data, notebooks, and clinical laminated charts for active students."
  },
  {
    id: "wellbeing_care",
    name: "Personal Care & Wellbeing Shield",
    amount: 2500,
    scope: "Wellbeing & Personal Dignity Buffer",
    impactDescription: "Covers essential personal care, clinical footwear, and wellness needs for trainees on demanding 8-hour hospital rotations."
  },
  {
    id: "emergency_special",
    name: "Emergency & Special Support Pool",
    amount: 5000,
    scope: "50% of Total Monthly Personal Safety Net",
    impactDescription: "Underwrites half the entire group's monthly need-based pool, shielding 15 trainees from sudden dropouts due to unforeseen shocks."
  },
  {
    id: "full_month",
    name: "Adopt the Full Common Fund (13 Students)",
    amount: 10000,
    scope: "Complete Cohort Monthly Need-Based Pool",
    impactDescription: "Covers the entire ₹10,000 monthly collective pool across all 6 need-based pillars, building the complete personal safety net around Art of Living's core training."
  }
];

export const PILOT_FACTS = {
  totalStudents: 13,
  programName: "Palliative Care Assistant Vocational Training",
  institutionalPartner: "Art of Living",
  partnerProvisionsSummary: "Local transportation support + Shared training shift meals",
  bigBroScopeSummary: "₹10,000 common monthly fund for personal, learning, digital & emergency support",
  totalMonthlyFund: 10000,
  fundCurrency: "₹",
  fundScopeNote: "Important: The ₹10,000 is a common monthly fund for all 15 students, not ₹10,000 per student and not a guaranteed monthly payment to every student.",
  perStudentEquivalent: "₹769 per student per month pooled together",
  trainingDuration: "6 Months Intensive (Theory + Hospice Internship)",
  dropoutRate: "0% across current cohort",
  placementGoal: "100% living-wage palliative hospice placement"
};
