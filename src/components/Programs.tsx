import { motion } from "framer-motion";
import { Check, Star } from "lucide-react";
import { programs } from "../data/content";
import Reveal from "./Reveal";

export default function Programs() {
  const [featured, ...secondary] = programs.items;

  return (
    <section id="programs" className="relative bg-ink py-28 md:py-36">
      <div className="container-px mx-auto max-w-7xl">
        <Reveal className="max-w-2xl">
          <p className="section-eyebrow">{programs.eyebrow}</p>
          <h2 className="font-display mt-4 text-[clamp(1.9rem,4vw,3rem)] leading-[1.1] text-cream">
            {programs.heading}
          </h2>
          <p className="mt-5 text-base text-cream-dim">{programs.sub}</p>
        </Reveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <Reveal>
            <motion.div
              whileHover={{ y: -6 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-ember/40 bg-gradient-to-br from-ember/[0.08] via-ink-soft to-ink-soft p-9 shadow-[0_0_60px_-15px_rgba(255,106,57,0.25)]"
            >
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-ember px-3 py-1 text-[0.65rem] font-bold uppercase tracking-widest text-ink">
                <Star size={11} fill="currentColor" />
                Start here
              </span>
              <h3 className="font-display relative mt-5 text-2xl text-cream md:text-3xl">{featured.title}</h3>
              <p className="relative mt-4 max-w-md text-base leading-relaxed text-cream-dim">
                {featured.description}
              </p>
              <ul className="relative mt-7 flex flex-col gap-3 border-t border-cream/10 pt-6">
                {featured.bullets.map((b) => (
                  <li key={b} className="flex items-center gap-2.5 text-sm text-cream">
                    <Check size={15} className="shrink-0 text-ember" />
                    {b}
                  </li>
                ))}
              </ul>
              <a
                href="#book"
                className="relative mt-8 inline-flex w-fit items-center justify-center rounded-full bg-ember px-7 py-3.5 text-sm font-semibold text-ink transition-transform hover:scale-105"
              >
                Start with this program
              </a>
            </motion.div>
          </Reveal>

          <div className="flex flex-col gap-6">
            {secondary.map((p, i) => (
              <Reveal key={p.title} delay={0.1 + i * 0.1} className="flex-1">
                <motion.div
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 260, damping: 22 }}
                  className="flex h-full flex-col rounded-2xl border border-cream/10 bg-ink-soft p-6"
                >
                  <h3 className="font-display text-lg text-cream">{p.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-cream-dim">{p.description}</p>
                  <ul className="mt-4 flex flex-col gap-1.5 border-t border-cream/10 pt-4">
                    {p.bullets.map((b) => (
                      <li key={b} className="flex items-center gap-2 text-xs text-cream-dim">
                        <Check size={12} className="shrink-0 text-moss-light" />
                        {b}
                      </li>
                    ))}
                  </ul>
                  <a
                    href="#book"
                    className="mt-4 text-xs font-semibold text-cream-dim underline decoration-cream/30 underline-offset-4 transition-colors hover:text-cream hover:decoration-cream"
                  >
                    Ask about this instead →
                  </a>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
