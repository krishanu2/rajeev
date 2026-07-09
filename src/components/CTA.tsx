import { useState } from "react";
import { motion } from "framer-motion";
import { cta } from "../data/content";
import BookingWidget from "./BookingWidget";
import Reveal from "./Reveal";
import fwrBadge from "../assets/fwr-badge.png";

export default function CTA() {
  const [showCalendar, setShowCalendar] = useState(false);

  return (
    <section id="book" className="relative overflow-hidden bg-ink-soft py-32 md:py-44">
      <div className="absolute left-1/2 top-0 h-96 w-[60rem] -translate-x-1/2 rounded-full bg-ember/10 blur-[130px]" />

      {/* The "exhale" beat — calmer pacing (slower reveals, more air) so the
          design doesn't contradict copy that promises "no pressure" */}
      <div className="container-px relative mx-auto max-w-3xl text-center">
        <Reveal duration={0.9}>
          <img
            src={fwrBadge}
            alt=""
            aria-hidden
            className="mx-auto mb-8 h-16 w-16 animate-[spin_28s_linear_infinite] opacity-70 sm:h-20 sm:w-20"
          />
          <p className="section-eyebrow">{cta.eyebrow}</p>
          <h2 className="font-display mt-5 text-[clamp(2.1rem,4.2vw,3.2rem)] leading-[1.15] text-cream">
            {cta.heading}
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-cream-dim">{cta.sub}</p>
        </Reveal>

        {showCalendar ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mt-12"
          >
            <BookingWidget />
          </motion.div>
        ) : (
          <Reveal delay={0.2} duration={0.9} className="mt-12">
            <button
              onClick={() => setShowCalendar(true)}
              className="group inline-flex items-center gap-3 rounded-full bg-ember px-8 py-4 text-base font-semibold text-ink transition-transform hover:scale-105 active:scale-[0.97] sm:px-10 sm:text-lg"
            >
              Book the call
              <span aria-hidden className="h-4 w-px bg-ink/25" />
              <span className="text-ink/50 line-through decoration-2">₹1,000</span>
              <span className="font-extrabold uppercase tracking-wide">Free</span>
            </button>
            <p className="mt-4 text-xs text-cream-dim/60">
              Pick a date and time that works for you — takes under a minute.
            </p>
          </Reveal>
        )}
      </div>
    </section>
  );
}
