import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Check, X } from "lucide-react";
import { comparison, story } from "../data/content";
import Reveal from "./Reveal";

export default function Story() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const orbY = useTransform(scrollYProgress, [0, 1], [-60, 60]);
  const orbY2 = useTransform(scrollYProgress, [0, 1], [40, -80]);

  return (
    <section id="philosophy" ref={sectionRef} className="relative overflow-hidden bg-ink-soft py-28 md:py-36">
      <motion.div
        style={{ y: orbY }}
        className="absolute -left-32 top-10 h-72 w-72 rounded-full bg-ember-dark/15 blur-[100px]"
      />
      <motion.div
        style={{ y: orbY2 }}
        className="absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-ember/15 blur-[110px]"
      />

      <div className="container-px relative mx-auto grid max-w-6xl gap-16 md:grid-cols-[0.9fr_1.1fr]">
        <Reveal>
          <p className="section-eyebrow">{story.eyebrow}</p>
          <h2 className="font-display mt-4 text-[clamp(1.9rem,3.4vw,2.8rem)] leading-[1.1] text-cream">
            {story.heading}
          </h2>

          <div className="mt-10 rounded-2xl border border-cream/10 bg-cream/[0.03] p-6">
            <p className="font-display text-xl italic leading-relaxed text-ember-light">
              "{story.quote}"
            </p>
            <p className="mt-3 text-sm text-cream-dim">{story.quoteTranslation}</p>
          </div>
        </Reveal>

        <div className="flex flex-col gap-7">
          {story.paragraphs.map((p, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <p className="text-lg leading-relaxed text-cream-dim">{p}</p>
            </Reveal>
          ))}
        </div>
      </div>

      <div className="container-px relative mx-auto mt-20 max-w-6xl">
        <Reveal>
          <p className="section-eyebrow text-center">{comparison.eyebrow}</p>
          <h3 className="font-display mx-auto mt-3 max-w-2xl text-center text-2xl text-cream md:text-3xl">
            {comparison.heading}
          </h3>
        </Reveal>

        {/* Asymmetric weight: the default system reads dense, dark and
            cramped; working-with-me reads lighter and more spacious — the
            physical feel of the two columns argues the point before the
            words do. */}
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <Reveal delay={0.05}>
            <div className="h-full rounded-xl border border-cream/15 bg-black/40 p-6 shadow-[inset_0_2px_12px_rgba(0,0,0,0.5)]">
              <p className="font-data text-[0.65rem] font-semibold uppercase tracking-widest text-cream-dim/70">
                {comparison.left.label}
              </p>
              <ul className="mt-4 flex flex-col gap-2.5">
                {comparison.left.points.map((point) => (
                  <li key={point} className="flex items-start gap-2.5 text-sm leading-snug text-cream-dim/80">
                    <X size={14} className="mt-0.5 shrink-0 text-cream-dim/40" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="h-full rounded-3xl border border-ember/30 bg-ember/[0.07] p-9 shadow-[0_0_50px_-12px_rgba(240,180,41,0.3)]">
              <p className="text-sm font-semibold uppercase tracking-widest text-ember">
                {comparison.right.label}
              </p>
              <ul className="mt-6 flex flex-col gap-5">
                {comparison.right.points.map((point) => (
                  <li key={point} className="flex items-start gap-3 text-base leading-relaxed text-cream">
                    <Check size={17} className="mt-0.5 shrink-0 text-ember" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
