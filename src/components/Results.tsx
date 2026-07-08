import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeftRight, ImageIcon, UserRound } from "lucide-react";
import { resultsSection } from "../data/content";
import { useSelection } from "../context/SelectionContext";
import CountingStat from "./CountingStat";
import Reveal from "./Reveal";

// All variants stay within the gold/black/white brand system — shades of
// the same accent rather than competing hues, so the strip reads as one
// classy palette instead of a rainbow of "variety" colors.
const colorMap: Record<string, { wash: string; solid: string; ring: string }> = {
  ember: { wash: "from-ember/35 via-ember/15 to-ink-soft", solid: "bg-ember/25", ring: "ring-ember/40" },
  moss: { wash: "from-ember-light/25 via-ember-dark/15 to-ink-soft", solid: "bg-ember-light/20", ring: "ring-ember-light/35" },
  clay: { wash: "from-ember-dark/35 via-ember-dark/15 to-ink-soft", solid: "bg-ember-dark/25", ring: "ring-ember-dark/40" },
};

export default function Results() {
  const { selectedId, selectedLabel } = useSelection();
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [constraint, setConstraint] = useState(0);

  useEffect(() => {
    const measure = () => {
      if (!trackRef.current || !containerRef.current) return;
      const overflow = trackRef.current.scrollWidth - containerRef.current.offsetWidth;
      setConstraint(Math.max(0, overflow));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  return (
    <section id="results" className="relative bg-ink py-28 md:py-36">
      <div className="container-px mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <Reveal className="max-w-xl">
            <p className="section-eyebrow">{resultsSection.eyebrow}</p>
            <h2 className="font-display mt-4 text-[clamp(1.9rem,4vw,3rem)] leading-[1.1] text-cream">
              {resultsSection.heading}
            </h2>
            <p className="mt-5 text-base text-cream-dim">
              {selectedId
                ? `You picked "${selectedLabel}" earlier — that case is highlighted below.`
                : resultsSection.sub}
            </p>
          </Reveal>

          <Reveal delay={0.1} className="hidden shrink-0 items-center gap-2 text-xs text-cream-dim/60 md:flex">
            <ArrowLeftRight size={14} />
            Drag to browse
          </Reveal>
        </div>
      </div>

      {/* Full-bleed drag carousel with real momentum/inertia — deliberately
          breaks out of the container grid used everywhere else on the page */}
      <div ref={containerRef} className="mt-14 overflow-hidden pl-[max(1.25rem,calc((100vw-80rem)/2+1.5rem))] pr-6 pb-6">
        <motion.div
          ref={trackRef}
          drag="x"
          dragConstraints={{ left: -constraint, right: 0 }}
          dragElastic={0.08}
          dragTransition={{ power: 0.25, timeConstant: 220 }}
          className="flex w-fit cursor-grab gap-5 active:cursor-grabbing"
        >
          {resultsSection.cases.map((c, i) => {
            const palette = colorMap[c.color];
            const isMatch = c.matchId === selectedId;
            return (
              <Reveal
                key={c.name + i}
                delay={i * 0.08}
                className={`shrink-0 ${i % 2 === 1 ? "md:mt-10" : ""}`}
              >
                <motion.div
                  whileHover={{ y: -8 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  animate={{
                    scale: isMatch ? 1.03 : 1,
                    borderColor: isMatch ? "rgba(240,180,41,0.6)" : "rgba(246,240,230,0.1)",
                  }}
                  className="group relative h-full w-[19rem] overflow-hidden rounded-2xl border bg-ink-soft select-none sm:w-[22rem]"
                >
                  {isMatch && (
                    <span className="absolute left-3 top-3 z-10 rounded-full bg-ember px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-ink">
                      Like your pick
                    </span>
                  )}
                  <span className="font-display pointer-events-none absolute -right-1 -top-5 text-[5rem] leading-none text-cream/[0.05]">
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  {c.beforePhoto && c.afterPhoto ? (
                    /* Real transformation photos, cropped side-by-side in CSS */
                    <div className="relative h-48">
                      <div className="flex h-full">
                        <img
                          src={c.beforePhoto}
                          alt="Before the program"
                          draggable={false}
                          className="pointer-events-none h-full w-1/2 select-none object-cover object-top"
                        />
                        <img
                          src={c.afterPhoto}
                          alt="After the program"
                          draggable={false}
                          className="pointer-events-none h-full w-1/2 select-none object-cover object-top"
                        />
                      </div>
                      <div className="absolute inset-y-0 left-1/2 w-px bg-ink/70" />
                      {!isMatch && (
                        <span className="absolute left-3 top-3 rounded-full bg-ink/60 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wider text-cream/90 backdrop-blur-sm">
                          Before → After
                        </span>
                      )}
                    </div>
                  ) : (
                    /* Photo mockup — swap for real before/after with client consent */
                    <div className={`relative h-48 bg-gradient-to-br ${palette.wash}`}>
                      <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-40">
                        <ImageIcon size={22} strokeWidth={1.5} className="text-cream" />
                        <div className="h-px w-8 bg-cream/60" />
                        <ImageIcon size={22} strokeWidth={1.5} className="text-cream" />
                      </div>
                      {!isMatch && (
                        <span className="absolute left-3 top-3 rounded-full bg-ink/50 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wider text-cream/80 backdrop-blur-sm">
                          Before → After
                        </span>
                      )}
                      <span className="absolute bottom-3 right-3 text-[0.65rem] italic text-cream/50">
                        photo placeholder
                      </span>
                    </div>
                  )}

                  <div className="relative px-6 pb-6">
                    {c.afterPhoto ? (
                      <div
                        className={`-mt-7 mb-4 h-14 w-14 rounded-full border-4 border-ink-soft ring-1 ${palette.ring}`}
                        style={{
                          backgroundImage: `url(${c.afterPhoto})`,
                          backgroundSize: c.avatarSize ?? "340%",
                          backgroundPosition: c.avatarPos ?? "46% 14%",
                        }}
                      />
                    ) : (
                      <div
                        className={`-mt-7 mb-4 flex h-14 w-14 items-center justify-center rounded-full border-4 border-ink-soft ${palette.solid} ring-1 ${palette.ring}`}
                      >
                        <UserRound size={22} className="text-cream" strokeWidth={1.5} />
                      </div>
                    )}
                    <p className="text-xs font-semibold uppercase tracking-widest text-ember">{c.tag}</p>
                    <CountingStat
                      value={c.stat.value}
                      prefix={c.stat.prefix}
                      suffix={c.stat.suffix}
                      className="mt-2 block text-3xl text-cream"
                    />
                    <p className="mt-2 text-sm leading-snug text-cream-dim">{c.result}</p>
                    <p className="mt-4 text-sm text-cream-dim/70">{c.name}</p>
                  </div>
                </motion.div>
              </Reveal>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
