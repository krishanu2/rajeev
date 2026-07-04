import { motion } from "framer-motion";
import { ImageIcon, UserRound } from "lucide-react";
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
        <Reveal className="max-w-2xl">
          <p className="section-eyebrow">{resultsSection.eyebrow}</p>
          <h2 className="font-display mt-4 text-[clamp(2.1rem,4.5vw,3.6rem)] leading-[1.1] text-cream">
            {resultsSection.heading}
          </h2>
          <p className="mt-5 text-lg text-cream-dim">{resultsSection.sub}</p>
        </Reveal>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {resultsSection.cases.map((c, i) => {
            const palette = colorMap[c.color];
            return (
              <Reveal key={c.name + i} delay={i * 0.08}>
                <motion.div
                  whileHover={{ y: -8 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className="group relative h-full overflow-hidden rounded-2xl border border-cream/10 bg-ink-soft"
                >
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
        </div>
      </div>
    </section>
  );
}
