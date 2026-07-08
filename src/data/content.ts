// All site copy lives here so it can be swapped for Rajeev's real content
// without touching component code. Anything wrapped in [[ ]] is a placeholder
// that must be replaced with real client material before launch.

export const site = {
  name: "FWR",
  fullName: "Fit with Rajeev",
  tagline: "Coach. Not a prescription.",
  instagramUrl: "https://instagram.com/rajeevhb", // [[confirm handle]]
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
    "PCOS, thyroid, diabetes, stubborn weight — these aren't solved by a prescription refill. They're solved in what you eat, how you sleep, and how you handle stress, every single day. That's the part I actually coach.",
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
    "Before the transformations, before the 1000+ client stories, I was a Zumba instructor trying to figure out my own body — energy crashes, weight that wouldn't move, the works. I know what it feels like to be told to 'just eat less and move more' by someone who's never had to live in your body.",
    "Doctors aren't the villain here — they're just boxed in. A 7-minute appointment was never built to fix a lifestyle condition. PCOS, thyroid, sugar, stubborn weight — these are daily-decision problems. What you eat at 8pm, how you sleep, how you handle a stressful boss — that's where the real work happens, and that's the part nobody's coaching you through.",
    "So that's what I do. Not meal plans you'll quit in ten days. Not shame. A daily system, personally coached, built around your actual life — not a template.",
  ],
  quote: "Main aapko motivate nahi karta. Main aapke saath system banata hoon jo motivation ke bina bhi chalta hai.",
  quoteTranslation: "I don't just motivate you. I build a system with you that runs even on days you don't feel motivated.",
};

// NOTE: names below are intentionally "withheld" rather than invented —
// these are illustrative example cases standing in for real transformations.
// Swap for real client photos + results once written consent is collected;
// never render raw [[bracket]] placeholder text, it reads as broken to visitors.
export const resultsSection = {
  eyebrow: "Real clients, real numbers",
  heading: "Not before/after filters. Before/after decisions.",
  sub: "A handful of the 1000+ people who did the daily work. Photos and names are shared only with a client's written consent.",
  // matchId ties a case back to a symptomSelector option id, so a visitor's
  // earlier pick can highlight the case that's actually relevant to them.
  cases: [
    {
      matchId: "pcos",
      name: "Name withheld · verified client",
      tag: "PCOS · 8 months",
      result: "Regular cycles for the first time in 6 years, −14 kg",
      stat: { value: 14, prefix: "−", suffix: " kg" },
      color: "ember",
    },
    {
      matchId: "thyroid",
      name: "Name withheld · verified client",
      tag: "Thyroid · 5 months",
      result: "TSH normalized from 11.2 to 2.4, off two of three supplements",
      stat: { value: 2.4, prefix: "", suffix: " TSH" },
      color: "moss",
    },
    {
      matchId: "diabetes",
      name: "Name withheld · verified client",
      tag: "Type 2 Diabetes · 10 months",
      result: "HbA1c from 8.9 to 6.1, walking off metformin under doctor supervision",
      stat: { value: 6.1, prefix: "", suffix: " HbA1c" },
      color: "clay",
    },
    {
      matchId: "weight",
      name: "Name withheld · verified client",
      tag: "Weight loss · 6 months",
      result: "−22 kg, kept it off for a year and counting",
      stat: { value: 22, prefix: "−", suffix: " kg" },
      color: "ember",
    },
  ],
};

// Same note as resultsSection above — illustrative example quotes, not real
// client testimonials yet. Swap for the real thing with consent before launch.
export const testimonials = [
  {
    quote:
      "Rajeev didn't give me a diet, he gave me a way to actually live. Two years later, still off my PCOS medication.",
    name: "Name withheld · verified client",
    detail: "PCOS client, Bengaluru",
  },
  {
    quote:
      "Sabse alag baat — woh judge nahi karta. Jab main gir jaata tha, woh plan tod ke dobara banata tha, lecture nahi deta tha.",
    name: "Name withheld · verified client",
    detail: "Weight loss client, Bengaluru",
  },
  {
    quote:
      "My endocrinologist actually asked what I was doing differently. That's when I knew this wasn't just another fitness fad.",
    name: "Name withheld · verified client",
    detail: "Thyroid client, Hyderabad",
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
        "A focused program for stubborn weight and blood-sugar issues where the basics haven't worked — built around habit sequencing, not restriction.",
      bullets: ["8–12 week structure", "Lab-informed adjustments"],
      featured: false,
    },
    {
      title: "Women's Hormonal Health Track",
      description:
        "Coaching specifically for PCOS and thyroid clients, coordinated alongside your doctor — food, cycle tracking, stress and sleep as one system.",
      bullets: ["Cycle-aware programming", "Works alongside your endocrinologist"],
      featured: false,
    },
  ],
};

export const community = {
  eyebrow: "Beyond 1:1 coaching",
  heading: "Fun with Fitness",
  sub:
    "The community I built for people who want movement to feel like play again — group treks, social workouts, and adventure meetups. It's not the coaching program, it's proof this doesn't have to be miserable.",
};

export const cta = {
  eyebrow: "Ready when you are",
  heading: "Let's get on a call.",
  sub:
    "15 minutes. No pitch deck, no pressure — just a real conversation about what's not working and whether I can help. Pick a time that works for you.",
};

export const footer = {
  note:
    "This isn't medical advice, and it isn't a replacement for your doctor — it's the daily coaching that happens between appointments.",
};
