import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Quote, UserRound } from "lucide-react";
import { testimonials } from "../data/content";
import Reveal from "./Reveal";

const avatarPalette = ["bg-ember/25 ring-ember/40", "bg-cream/15 ring-cream/30", "bg-clay/25 ring-clay/40"];

export default function Testimonials() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setActive((v) => (v + 1) % testimonials.length), 6000);
    return () => clearInterval(id);
  }, [paused]);

  const t = testimonials[active];

  return (
    <section
      className="relative overflow-hidden bg-ink-soft py-28 md:py-40"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <p className="section-eyebrow absolute left-1/2 top-16 -translate-x-1/2 text-center md:top-20">
        In their words
      </p>

      <div className="container-px relative mx-auto flex min-h-[22rem] max-w-4xl flex-col items-center justify-center text-center">
        <Quote className="text-ember/50" size={40} strokeWidth={1.2} />

        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6"
          >
            <p className="font-display text-[clamp(1.5rem,3.6vw,2.4rem)] leading-[1.35] text-cream">
              {t.quote}
            </p>
            <div className="mt-8 flex flex-col items-center gap-3">
              {t.photo ? (
                // Zoomed background crop: pulls a headshot out of a full-body
                // photo (object-cover alone can't zoom past "fit").
                <div
                  role="img"
                  aria-label={t.name}
                  className="h-12 w-12 rounded-full ring-1 ring-ember/40"
                  style={{
                    backgroundImage: `url(${t.photo})`,
                    backgroundSize: "340%",
                    backgroundPosition: "46% 14%",
                  }}
                />
              ) : (
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full ring-1 ${avatarPalette[active % avatarPalette.length]}`}
                  title="Client photo placeholder"
                >
                  <UserRound size={20} className="text-cream" strokeWidth={1.5} />
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-cream">{t.name}</p>
                <p className="text-xs text-cream-dim">{t.detail}</p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <Reveal delay={0.2} className="mt-10 flex items-center gap-2.5">
          {testimonials.map((item, i) => (
            <button
              key={item.name + i}
              type="button"
              aria-label={`Show testimonial ${i + 1}`}
              onClick={() => setActive(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === active ? "w-7 bg-ember" : "w-1.5 bg-cream/25 hover:bg-cream/50"
              }`}
            />
          ))}
        </Reveal>
      </div>
    </section>
  );
}
