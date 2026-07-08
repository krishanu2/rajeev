import type { ComponentType } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Activity, ArrowRight, Droplet, HeartPulse, Scale, Sparkles } from "lucide-react";
import { symptomSelector } from "../data/content";
import { useSelection } from "../context/SelectionContext";
import Reveal from "./Reveal";

const icons: Record<string, ComponentType<{ size?: number; className?: string }>> = {
  pcos: HeartPulse,
  thyroid: Activity,
  diabetes: Droplet,
  weight: Scale,
  energy: Sparkles,
};

export default function SymptomSelector() {
  const { selectedId, select } = useSelection();
  const activeOption = symptomSelector.options.find((o) => o.id === selectedId);

  return (
    <section className="relative bg-ink-soft py-24 md:py-32">
      <div className="container-px mx-auto max-w-4xl text-center">
        <Reveal>
          <p className="section-eyebrow">{symptomSelector.eyebrow}</p>
          <h2 className="font-display mt-4 text-[clamp(1.9rem,4vw,2.9rem)] text-cream">
            {symptomSelector.heading}
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-cream-dim">{symptomSelector.sub}</p>
        </Reveal>

        <Reveal delay={0.1} className="relative mt-10 flex flex-wrap justify-center gap-3">
          {/* Warm spotlight that fades in behind the chosen option, and the
              rest of the row dims — reinforces "this is now about you" */}
          {selectedId && (
            <motion.div
              layoutId="segmenter-spotlight"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="pointer-events-none absolute inset-x-0 -inset-y-6 -z-10 bg-[radial-gradient(ellipse_50%_80%_at_50%_50%,rgba(253,230,138,0.1),transparent_70%)]"
            />
          )}
          {symptomSelector.options.map((opt) => {
            const Icon = icons[opt.id];
            const isActive = selectedId === opt.id;
            const dimmed = selectedId !== null && !isActive;
            return (
              <motion.button
                key={opt.id}
                type="button"
                onClick={() => select(opt.id, opt.label)}
                animate={{ opacity: dimmed ? 0.35 : 1, scale: dimmed ? 0.96 : 1 }}
                transition={{ duration: 0.4 }}
                className={`flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-ember bg-ember text-ink"
                    : "border-cream/20 text-cream-dim hover:border-cream/50 hover:text-cream"
                }`}
              >
                <Icon size={16} />
                {opt.label}
              </motion.button>
            );
          })}
        </Reveal>

        <div className="mt-8 min-h-40">
          <AnimatePresence mode="wait">
            {activeOption ? (
              <motion.div
                key={activeOption.id}
                initial={{ opacity: 0, y: 14, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="mx-auto max-w-2xl rounded-2xl border border-ember/25 bg-ink p-7 text-left"
              >
                <p className="text-lg leading-relaxed text-cream">{activeOption.response}</p>
                <a
                  href="#book"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-ember hover:text-ember-light"
                >
                  Talk to me about this
                  <ArrowRight size={15} />
                </a>
              </motion.div>
            ) : (
              <motion.p
                key="prompt"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="pt-10 text-sm text-cream-dim/60"
              >
                ↑ Tap one — takes two seconds.
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
