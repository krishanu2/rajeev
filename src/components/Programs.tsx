import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { programs } from "../data/content";
import Reveal from "./Reveal";

export default function Programs() {
  return (
    <section id="programs" className="relative bg-ink py-28 md:py-36">
      <div className="container-px mx-auto max-w-7xl">
        <Reveal className="max-w-2xl">
          <p className="section-eyebrow">{programs.eyebrow}</p>
          <h2 className="font-display mt-4 text-[clamp(2.1rem,4.5vw,3.6rem)] leading-[1.1] text-cream">
            {programs.heading}
          </h2>
          <p className="mt-5 text-lg text-cream-dim">{programs.sub}</p>
        </Reveal>

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {programs.items.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.1} className="h-full">
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 260, damping: 22 }}
                className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-cream/10 bg-ink-soft p-8"
              >
                <span className="font-display pointer-events-none absolute -right-2 -top-6 text-[6.5rem] leading-none text-cream/[0.04]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display relative text-xl text-cream">{p.title}</h3>
                <p className="relative mt-3 flex-1 text-[0.95rem] leading-relaxed text-cream-dim">
                  {p.description}
                </p>
                <ul className="relative mt-6 flex flex-col gap-2.5 border-t border-cream/10 pt-6">
                  {p.bullets.map((b) => (
                    <li key={b} className="flex items-center gap-2.5 text-sm text-cream-dim">
                      <Check size={15} className="shrink-0 text-moss-light" />
                      {b}
                    </li>
                  ))}
                </ul>
                <a
                  href="#book"
                  className="relative mt-7 inline-flex items-center justify-center rounded-full border border-cream/20 py-3 text-sm font-semibold text-cream transition-colors hover:border-ember hover:text-ember"
                >
                  Ask about this program
                </a>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
