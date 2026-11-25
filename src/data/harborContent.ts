export interface ClinicalMetric {
  value: string;
  label: string;
  context: string;
}

export interface CapabilityItem {
  index: string;
  title: string;
  category: string;
  summary: string;
  outcome: string;
  image?: string;
  imageAlt?: string;
  span: 'wide' | 'standard';
}

export interface MicroPractice {
  id: string;
  title: string;
  duration: string;
  modality: string;
  purpose: string;
  steps: {
    phase: string;
    cue: string;
    detail: string;
  }[];
}

export interface CuratedSearchPrompt {
  id: string;
  label: string;
  query: string;
  region?: string;
}

export interface ClinicalOutcome {
  id: string;
  metric: string;
  metricLabel: string;
  cohort: string;
  summary: string;
  methodology: string;
}

export interface TestimonialItem {
  id: string;
  quote: string;
  author: string;
  role: string;
  organization: string;
  changeNote: string;
}

export const HERO_IMAGE = {
  src: '/src/assets/images/hero_harbor_sanctuary_1795347668511.jpg',
  alt: 'Sunlit coastal reading sanctuary overlooking calm misty harbor water',
};

export const CLINICAL_METRICS: ClinicalMetric[] = [
  {
    value: '-41%',
    label: 'GAD-7 anxiety scores',
    context: '8-week guided study (n = 312)',
  },
  {
    value: '3 min',
    label: 'Median daily check-in',
    context: 'Designed for low-energy days',
  },
  {
    value: '92%',
    label: 'Therapist session prep',
    context: 'Members sharing weekly notes',
  },
  {
    value: '24/7',
    label: 'Verified care lookup',
    context: 'Live search-grounded directories',
  },
];

export const CAPABILITIES: CapabilityItem[] = [
  {
    index: '01.',
    title: 'Three-Minute Daily Check-Ins',
    category: 'Daily Reflection',
    summary:
      'Log mood, somatic tension, and sleep quality in under three minutes without blank-page friction. Harbor surfaces gentle weekly trends you can keep private or export for your therapist.',
    outcome: '78% 6-week habit retention across active members',
    image: '/src/assets/images/feature_daily_checkin_1795347670667.jpg',
    imageAlt: 'Open linen-bound notebook with pen and warm cup of tea on pale stone desk',
    span: 'wide',
  },
  {
    index: '02.',
    title: 'Clinician-Authored Micro-Practices',
    category: 'CBT & Somatic Care',
    summary:
      'Short paced breathing, cognitive reframing, and sensory grounding sessions written by licensed psychologists for acute stress spikes at work or before sleep.',
    outcome: 'Average 2.4-point drop in acute distress rating after 5 minutes',
    image: '/src/assets/images/feature_guided_breath_1795347670546.jpg',
    imageAlt: 'Still harbor water at early dawn with weathered wooden dock edge',
    span: 'standard',
  },
  {
    index: '03.',
    title: 'Between-Session Therapy Continuity',
    category: 'Clinical Handoff',
    summary:
      'Turn scattered mid-week feelings into a concise, encrypted one-page summary before your appointment so your 50-minute session starts with clarity instead of catch-up.',
    outcome: '14 minutes saved per therapy intake check-in',
    image: '/src/assets/images/feature_clinical_dialogue_1795347668447.jpg',
    imageAlt: 'Calm sunlit modern counseling room with two light grey linen armchairs',
    span: 'standard',
  },
  {
    index: '04.',
    title: 'Private by Architecture, Never Ad-Supported',
    category: 'Zero-Knowledge Storage',
    summary:
      'Your reflections stay encrypted at rest and in transit, never sold to data brokers or used to train third-party ad profiles. Export or permanently delete your archive with one click.',
    outcome: 'HIPAA-aligned data handling & full member data portability',
    span: 'wide',
  },
];

export const MICRO_PRACTICES: MicroPractice[] = [
  {
    id: 'breathing',
    title: '4-4-6 Downshift Breathing',
    duration: '2 min',
    modality: 'Autonomic Regulation',
    purpose: 'Lengthening the exhale signals the parasympathetic nervous system to lower heart rate.',
    steps: [
      {
        phase: 'Step 1 of 3 · Inhale (4 seconds)',
        cue: 'Breathe in slowly through your nose',
        detail: 'Let your ribs expand gently sideways rather than lifting your shoulders.',
      },
      {
        phase: 'Step 2 of 3 · Hold (4 seconds)',
        cue: 'Pause softly at the top of the breath',
        detail: 'Keep your jaw unclenched and let your tongue rest away from the roof of your mouth.',
      },
      {
        phase: 'Step 3 of 3 · Exhale (6 seconds)',
        cue: 'Release slowly through relaxed lips',
        detail: 'Match the steady pace of a calm tide pulling back. Repeat for four cycles.',
      },
    ],
  },
  {
    id: 'reframe',
    title: 'Two-Column Thought Untangle',
    duration: '3 min',
    modality: 'Cognitive Behavioral',
    purpose: 'Separates an anxious prediction from observable facts when rumination loops.',
    steps: [
      {
        phase: 'Step 1 of 3 · Name the Loop',
        cue: 'Write the single sentence repeating in your mind',
        detail: 'Keep it literal (for example, "If I miss this deadline, everything falls apart").',
      },
      {
        phase: 'Step 2 of 3 · Check the Evidence',
        cue: 'List one fact that supports it and two that complicate it',
        detail: 'Look for past moments where an imperfect outcome remained manageable.',
      },
      {
        phase: 'Step 3 of 3 · Balanced Next Action',
        cue: 'Draft one steadier sentence and one 10-minute step',
        detail: 'Shift from predicting catastrophe to choosing the smallest useful move right now.',
      },
    ],
  },
  {
    id: 'sensory',
    title: '5-4-3 Sensory Anchor',
    duration: '90 sec',
    modality: 'Somatic Grounding',
    purpose: 'Brings attention out of racing thoughts and back into your physical room.',
    steps: [
      {
        phase: 'Step 1 of 3 · Five Visual Details',
        cue: 'Notice five quiet shapes or textures you can see',
        detail: 'Name neutral objects silently: wood grain, window light, fabric weave, chair leg.',
      },
      {
        phase: 'Step 2 of 3 · Four Physical Contacts',
        cue: 'Feel four points where your body meets support',
        detail: 'Notice the floor beneath your heels, the backrest, or the temperature of your hands.',
      },
      {
        phase: 'Step 3 of 3 · Three Ambient Sounds',
        cue: 'Listen for three distinct layers of sound',
        detail: 'Distinguish distant traffic, room airflow, or the rhythm of your own breath.',
      },
    ],
  },
];

export const CURATED_SEARCH_PROMPTS: CuratedSearchPrompt[] = [
  {
    id: 'us-crisis',
    label: 'Free 24/7 crisis lines (US)',
    query: 'Verified free 24/7 mental health crisis hotlines and text support lines in the United States',
    region: 'United States',
  },
  {
    id: 'nimh-sleep',
    label: 'NIMH guidance on anxiety & sleep',
    query: 'Latest NIMH and APA evidence-based guidance for managing anxiety-related insomnia',
  },
  {
    id: 'sliding-scale',
    label: 'Sliding-scale therapy directories',
    query: 'Reputable low-cost and sliding-scale therapy directories and community mental health clinics',
    region: 'United States',
  },
  {
    id: 'burnout-cbt',
    label: 'Clinical burnout recovery practices',
    query: 'Evidence-based clinical psychology strategies for occupational burnout recovery',
  },
];

export const CLINICAL_OUTCOMES: ClinicalOutcome[] = [
  {
    id: 'gad7-pilot',
    metric: '68%',
    metricLabel: 'of study participants moved down at least one GAD-7 severity tier',
    cohort: '8-week outpatient companion study · 312 adults',
    summary:
      'Participants paired weekly therapy or primary care check-ins with Harbor’s 3-minute evening reflection and somatic downshift modules.',
    methodology: 'Evaluated using standardized GAD-7 and PHQ-9 baselines at Week 0, Week 4, and Week 8.',
  },
  {
    id: 'care-navigation',
    metric: '3.2x',
    metricLabel: 'faster connection to verified community and sliding-scale care',
    cohort: 'Care navigation trial · 180 first-time care seekers',
    summary:
      'Replacing dead directory links with live search-grounded resource verification cut average time-to-first-outreach from 11 days to 3.4 days.',
    methodology: 'Measured via anonymized onboarding completion logs and 30-day follow-up surveys.',
  },
];

export const TESTIMONIALS: TestimonialItem[] = [
  {
    id: 'dr-chen',
    quote:
      'Before Harbor, my clients spent the first fifteen minutes of every session trying to remember how Tuesday felt. Now they bring a calm, structured one-page pattern log and we get straight to meaningful clinical work.',
    author: 'Dr. Hannah Lindqvist, PsyD',
    role: 'Clinical Director',
    organization: 'Northshore Behavioral Health Collaborative',
    changeNote: '15 min saved per clinical hour across 42 active outpatient clients',
  },
  {
    id: 'member-david',
    quote:
      'Most wellness apps felt loud and guilt-inducing when I missed a streak. Harbor skips the gamification—just a quiet three-minute check-in and grounded breathing when my chest tightens at 11 p.m.',
    author: 'David Okafor',
    role: 'Emergency Department Nurse',
    organization: 'Harbor Member · Portland, OR',
    changeNote: 'Reduced late-shift sleep onset latency from 55 min to 20 min over 6 weeks',
  },
];

export interface HarborContactChannel {
  email: string;
  label: string;
}

export const HARBOR_CONTACTS: HarborContactChannel[] = [
  {
    email: 'info@harborsupport.org',
    label: 'General inquiries',
  },
  {
    email: 'contact@harborsupport.org',
    label: 'Partnerships & care teams',
  },
  {
    email: 'john@harborsupport.org',
    label: 'Direct & founder outreach',
  },
];

export const HARBOR_PHONE = {
  display: '(480) 978-6590',
  href: 'tel:+14809786590',
  label: 'Phone inquiries',
  hours: 'Mon–Fri, 9am–5pm',
} as const;


