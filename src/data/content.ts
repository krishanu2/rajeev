// All site copy lives here so it can be swapped for Rajeev's real content
// without touching component code. Anything wrapped in [[ ]] is a placeholder
// that must be replaced with real client material before launch.
import sangeethBefore from "../assets/sangeeth-before.jpg";
import sangeethAfter from "../assets/sangeeth-after.jpg";
import suchetaBefore from "../assets/sucheta-before.jpg";
import suchetaAfter from "../assets/sucheta-after.jpg";
import shubhamBefore from "../assets/shubham-before.jpg";
import shubhamAfter from "../assets/shubham-after.jpg";
import preetiBefore from "../assets/preeti-before.jpg";
import preetiAfter from "../assets/preeti-after.jpg";

export const site = {
  name: "FWR",
  fullName: "Fit with Rajeev",
  tagline: "Coach. Not a prescription.",
  instagramUrl: "https://www.instagram.com/coach.rajeevhb",
  funWithFitnessUrl: "https://www.instagram.com/fun.wth.fitness",
  email: "rajeevhb.91@gmail.com",
  city: "Bengaluru, India",
};

// "Book a Call" deliberately lives only as the standalone pill button in Nav,
// not as a text link here too — having both collided at narrower widths.
export const nav = [
  { label: "About", href: "#about" },
  { label: "Philosophy", href: "#philosophy" },
  { label: "Results", href: "#results" },
  { label: "Programs", href: "#programs" },
  { label: "Fun with Fitness", href: "#community" },
  { label: "FAQ", href: "#faq" },
];

// A quick interactive gut-check placed right after the hero. The point is
// psychological, not decorative: a visitor gets a personalized answer in one
// click instead of having to read five sections to find out "is this for me?"
export const symptomSelector = {
  eyebrow: "Before you read another word",
  heading: "Which one sounds like you?",
  sub: "Pick one. Not a quiz — just so I'm not wasting your time with a generic pitch.",
  options: [
    {
      id: "pcos",
      label: "PCOS / irregular cycles",
      short: "PCOS",
      response:
        "Birth control regulates a number on a chart, not the actual hormonal loop. We rebuild the daily inputs — meal timing, insulin sensitivity, sleep, stress — that your cycle actually responds to. Most PCOS clients see a change inside 3–4 months.",
    },
    {
      id: "thyroid",
      label: "Thyroid issues",
      short: "thyroid",
      response:
        "TSH 'normal' on paper but you're still exhausted and still gaining? Medication manages a lab value — it doesn't manage your metabolism, your energy, or the weight around it. That gap is exactly what I coach.",
    },
    {
      id: "diabetes",
      label: "Diabetes / blood sugar",
      short: "blood sugar",
      response:
        "For most people caught early-to-moderate, this is a daily-decision condition before it's a permanent-medication condition. We build the structure — food sequencing, movement timing, sleep — alongside your doctor, not instead of them.",
    },
    {
      id: "weight",
      label: "Stubborn weight",
      short: "weight",
      response:
        "If you've already tried 'eating clean' and working out and the scale won't move, the problem usually isn't effort. It's sequencing — what you're doing, and in what order. That part is fixable, fast.",
    },
    {
      id: "energy",
      label: "Just don't feel like myself",
      short: "how you're feeling",
      response:
        "No diagnosis, you just know something's off — energy, mood, motivation. That's still a daily-systems problem, and it's still exactly what a consultation call is for.",
    },
  ],
};

// About/authority section. [[Swap the portrait placeholder for Rajeev's real
// photo at src/assets/rajeev-portrait.jpg once supplied]]. Timeline years are
// illustrative — confirm exact milestones/dates with Rajeev before launch.
export const about = {
  eyebrow: "The person, not just the plan",
  heading: "Meet Rajeev.",
  bio: [
    "I'm not a doctor, and I don't pretend to be one. I'm the person who sits with you between appointments and figures out why the plan you were handed isn't sticking.",
    "I started as a Zumba instructor, not a nutritionist — which means I learned most of this the hard way, on my own body, before I ever coached anyone else through it.",
  ],
  quickFacts: [
    { label: "Experience", value: "8+ years" },
    { label: "Clients coached", value: "1000+" },
    { label: "Based in", value: "Bengaluru" },
    { label: "Focus", value: "PCOS · Thyroid · Diabetes · Weight" },
  ],
  timeline: [
    {
      year: "Where I started",
      title: "Zumba instructor",
      detail: "Teaching movement for a living, while quietly still fighting my own energy crashes and weight that wouldn't move.",
    },
    {
      year: "The turning point",
      title: "My own transformation",
      detail: "Fixed my own body first, through daily decisions rather than a diet plan — that became the proof of concept before it was ever a business.",
    },
    {
      year: "Going full-time",
      title: "1:1 coaching begins",
      detail: "Left group fitness to coach individuals — nutrition, sleep and stress as one connected system, not three separate PDFs.",
    },
    {
      year: "8 years in",
      title: "1000+ clients later",
      detail: "PCOS, thyroid, diabetes and stubborn weight, coached personally — plus a community (Fun with Fitness) and a podcast on the side.",
    },
  ],
};

// "Default system vs. working with me" contrast block — sits inside the
// Philosophy section. Contrast is a deliberate persuasion device: it makes
// the differentiation concrete instead of just asserted in prose.
export const comparison = {
  eyebrow: "Side by side",
  heading: "The default system vs. actually working with me",
  left: {
    label: "What usually happens",
    points: [
      "7 minutes, then a prescription",
      "One generic diet sheet for everyone",
      "No one checks in until the next flare-up",
      "Treats the lab value",
    ],
  },
  right: {
    label: "Working with me",
    points: [
      "Weekly, personal check-ins",
      "A system built around your actual schedule",
      "Adjustments before things go wrong",
      "Treats the daily decisions behind the lab value",
    ],
  },
};

export const hero = {
  eyebrow: "8 years · 1000+ real transformations",
  headlineTop: "Your doctor gets",
  headlineHighlight: "7 minutes.",
  headlineBottom: "I get your whole life.",
  sub:
    "PCOS, thyroid, diabetes, stubborn weight — these aren't fixed by a prescription refill. They're fixed in how you eat, sleep and handle stress every day. That's the part I coach.",
  ctaPrimary: "Book a consultation call",
  ctaSecondary: "See real results",
  stat1: { value: "1000+", label: "clients coached" },
  stat2: { value: "8 yrs", label: "in the field" },
  stat3: { value: "0", label: "magic pills sold" },
};

// Scroll-scrubbed confrontation moment — each line takes over the full
// screen as the user scrolls through it, one at a time. This is the one
// section deliberately built to feel unlike everything else on the page.
export const manifesto = [
  "Everyone will tell you to ‘eat clean.’",
  "Almost no one will tell you how — for the next 200 days straight.",
  "That gap is where most people quit.",
  "It’s also exactly where I show up.",
];

export const story = {
  eyebrow: "Why I do this",
  heading: "I didn't start as a coach. I started as someone who needed one.",
  paragraphs: [
    "Before the 1000+ client stories, I was a Zumba instructor fighting my own body — energy crashes, weight that wouldn't move. I know what 'just eat less and move more' feels like from the receiving end.",
    "A 7-minute appointment was never built to fix a lifestyle. PCOS, thyroid, sugar, stubborn weight are daily-decision problems — so that's what I coach. A daily system built around your actual life. No meal-plan PDFs, no shame.",
  ],
  quote: "Main aapko motivate nahi karta. Main aapke saath system banata hoon jo motivation ke bina bhi chalta hai.",
  quoteTranslation: "I don't just motivate you. I build a system with you that runs even on days you don't feel motivated.",
};

// All four cases below are real clients — photos, numbers and stories
// supplied by Rajeev with consent.
export type CaseStudy = {
  matchId: string;
  name: string;
  tag: string;
  result: string;
  stat: { value: number; prefix: string; suffix: string };
  color: string;
  // Real before/after photos (with consent). Cases without them render the
  // placeholder mock strip instead.
  beforePhoto?: string;
  afterPhoto?: string;
  // Zoomed background crop for the little face circle — tuned per photo
  // since faces sit in different spots (full-body shots need more zoom).
  avatarSize?: string;
  avatarPos?: string;
};

export const resultsSection = {
  eyebrow: "Real clients, real numbers",
  heading: "Not before/after filters. Before/after decisions.",
  sub: "A few of the 1000+ people who did the daily work. Shared only with written consent.",
  // matchId ties a case back to a symptomSelector option id, so a visitor's
  // earlier pick can highlight the case that's actually relevant to them.
  cases: [
    {
      matchId: "weight",
      name: "Sangeeth · shared with consent",
      tag: "Weight loss · 6 months",
      result: "−32 kg in 6 months — and the number on the scale was never the whole story.",
      stat: { value: 32, prefix: "−", suffix: " kg" },
      color: "ember",
      beforePhoto: sangeethBefore,
      afterPhoto: sangeethAfter,
      avatarSize: "340%",
      avatarPos: "46% 14%",
    },
    {
      matchId: "thyroid",
      name: "Preeti · shared with consent",
      tag: "Thyroid · 4 months",
      result: "TSH from 13.3 to 1.3, medication more than halved — and 84 kg down to 59 kg.",
      stat: { value: 25, prefix: "−", suffix: " kg" },
      color: "moss",
      beforePhoto: preetiBefore,
      afterPhoto: preetiAfter,
      avatarSize: "190%",
      avatarPos: "52% 25%",
    },
    {
      matchId: "weight",
      name: "Sucheta · shared with consent",
      tag: "Weight loss · 3 months",
      result: "−5 kg in 3 months, no extreme dieting — and easy to maintain after the programme ended.",
      stat: { value: 5, prefix: "−", suffix: " kg" },
      color: "clay",
      beforePhoto: suchetaBefore,
      afterPhoto: suchetaAfter,
      avatarSize: "320%",
      avatarPos: "38% 10%",
    },
    {
      matchId: "energy",
      name: "Shubham · shared with consent",
      tag: "Energy reset · 4 months",
      result: "Cholesterol down, vitamin levels back on track — energy back after an injury stalled everything.",
      stat: { value: 4, prefix: "", suffix: " months" },
      color: "ember",
      beforePhoto: shubhamBefore,
      afterPhoto: shubhamAfter,
      avatarSize: "170%",
      avatarPos: "50% 20%",
    },
  ] as CaseStudy[],
};

export type Testimonial = {
  quote: string;
  name: string;
  detail: string;
  // Real client photo (with consent) — falls back to a generic avatar.
  photo?: string;
  avatarSize?: string;
  avatarPos?: string;
};

// All real client quotes, supplied with photos + consent.
export const testimonials: Testimonial[] = [
  {
    quote:
      "Having a coach and nutritionist like Rajeev is great, because it is not just about guiding someone through nutrition — it is also about the mental challenges that come with it. And navigating that was easy in this programme.",
    name: "Sangeeth",
    detail: "Weight loss · −32 kg in 6 months",
    photo: sangeethAfter,
    avatarSize: "340%",
    avatarPos: "46% 14%",
  },
  {
    quote:
      "I lost 5 kg in just 3 months, without extreme dieting or exhausting workouts. Even after the programme ended it's been easy to maintain — it never felt like a temporary fix.",
    name: "Sucheta",
    detail: "Weight loss · −5 kg in 3 months",
    photo: suchetaAfter,
    avatarSize: "320%",
    avatarPos: "38% 10%",
  },
  {
    quote:
      "I used to feel stuck in my own body — but things changed when I started with Rajeev. Within four months my cholesterol came down, my vitamin levels got back on track, and I started feeling like me again.",
    name: "Shubham",
    detail: "Energy & health reset · 4 months",
    photo: shubhamAfter,
    avatarSize: "170%",
    avatarPos: "50% 20%",
  },
];

export const programs = {
  eyebrow: "What working together looks like",
  heading: "Coaching, not content.",
  sub: "Every program starts with a consultation call — no generic PDF, no one-size-fits-all plan.",
  // The first item is the flagship — most people should start here, so it's
  // deliberately presented larger/highlighted rather than as one of three
  // equal options (three equal choices flattens decision-making).
  items: [
    {
      title: "1:1 Transformation Coaching",
      description:
        "Personal daily coaching for PCOS, thyroid, diabetes and weight — nutrition, sleep, and stress systems built around your real schedule.",
      bullets: ["Weekly check-ins", "Direct chat access", "Reports reviewed personally"],
      featured: true,
    },
    {
      title: "Metabolic Reset",
      description:
        "For stubborn weight and blood sugar when the basics haven't worked — habit sequencing, not restriction.",
      bullets: ["8–12 week structure", "Lab-informed adjustments"],
      featured: false,
    },
    {
      title: "Women's Hormonal Health Track",
      description:
        "PCOS and thyroid coaching alongside your doctor — food, cycle, stress and sleep as one system.",
      bullets: ["Cycle-aware programming", "Works alongside your endocrinologist"],
      featured: false,
    },
  ],
};

export const community = {
  eyebrow: "Beyond 1:1 coaching",
  heading: "Fun with Fitness",
  sub:
    "The community I built for people who want movement to feel like play again — group treks, social workouts, adventure meetups. Proof this doesn't have to be miserable.",
  cta: "Follow Fun with Fitness on Instagram",
};

export const cta = {
  eyebrow: "One-on-one with Rajeev",
  heading: "Book your one-on-one session.",
  sub:
    "15 minutes. No pitch deck, no pressure — just a real conversation about what's not working and whether I can help.",
};

export const footer = {
  note:
    "This isn't medical advice, and it isn't a replacement for your doctor — it's the daily coaching that happens between appointments.",
};
