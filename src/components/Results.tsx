import { motion } from "framer-motion";
import { ArrowLeftRight, ImageIcon, UserRound } from "lucide-react";
import { resultsSection } from "../data/content";
import Reveal from "./Reveal";

const colorMap: Record<string, { wash: string; solid: string; ring: string }> = {
  ember: { wash: "from-ember/35 via-ember/15 to-ink-soft", solid: "bg-ember/25", ring: "ring-ember/40" },
  moss: { wash: "from-moss-light/35 via-moss/15 to-ink-soft", solid: "bg-moss-light/25", ring: "ring-moss-light/40" },
  clay: { wash: "from-clay/35 via-clay/15 to-ink-soft", solid: "bg-clay/25", ring: "ring-clay/40" },
};

export default function Results() {
  return (
    <section id="results" className="relative bg-ink py-28 md:py-36">
      <div className="container-px mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <Reveal className="max-w-xl">
            <p className="section-eyebrow">{resultsSection.eyebrow}</p>
            <h2 className="font-display mt-4 text-[clamp(1.9rem,4vw,3rem)] leading-[1.1] text-cream">
              {resultsSection.heading}
            </h2>
            <p className="mt-5 text-base text-cream-dim">{resultsSection.sub}</p>
          </Reveal>

          <Reveal delay={0.1} className="hidden shrink-0 items-center gap-2 text-xs text-cream-dim/60 md:flex">
            <ArrowLeftRight size={14} />
            Drag to browse
          </Reveal>
        </div>
      </div>

      {/* Full-bleed horizontal scroll — deliberately breaks out of the
          container grid used everywhere else on the page */}
      <div className="mt-14 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-6 pl-[max(1.25rem,calc((100vw-80rem)/2+1.5rem))] pr-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {resultsSection.cases.map((c, i) => {
          const palette = colorMap[c.color];
          return (
            <Reveal key={c.name + i} delay={i * 0.08} className={`shrink-0 snap-start ${i % 2 === 1 ? "md:mt-10" : ""}`}>
              <motion.div
                whileHover={{ y: -8 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="group relative h-full w-[19rem] overflow-hidden rounded-2xl border border-cream/10 bg-ink-soft sm:w-[22rem]"
              >
                <span className="font-display pointer-events-none absolute -right-1 -top-5 text-[5rem] leading-none text-cream/[0.05]">
                  {String(i + 1).padStart(2, "0")}
                </span>

                {/* Transformation photo mockup — swap for real before/after with client consent */}
                <div className={`relative h-36 bg-gradient-to-br ${palette.wash}`}>
                  <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-40">
                    <ImageIcon size={22} strokeWidth={1.5} className="text-cream" />
                    <div className="h-px w-8 bg-cream/60" />
                    <ImageIcon size={22} strokeWidth={1.5} className="text-cream" />
                  </div>
                  <span className="absolute left-3 top-3 rounded-full bg-ink/50 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wider text-cream/80 backdrop-blur-sm">
                    Before → After
                  </span>
                  <span className="absolute bottom-3 right-3 text-[0.65rem] italic text-cream/50">
                    photo placeholder
                  </span>
                </div>

                <div className="relative px-6 pb-6">
                  <div
                    className={`-mt-7 mb-4 flex h-14 w-14 items-center justify-center rounded-full border-4 border-ink-soft ${palette.solid} ring-1 ${palette.ring}`}
                  >
                    <UserRound size={22} className="text-cream" strokeWidth={1.5} />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-ember">{c.tag}</p>
                  <p className="mt-3 text-base leading-snug text-cream">{c.result}</p>
                  <p className="mt-4 text-sm text-cream-dim/70">{c.name}</p>
                </div>
              </motion.div>
            </Reveal>
          );
        })}
        <div className="w-1 shrink-0" aria-hidden />
      </div>
    </section>
  );
}
