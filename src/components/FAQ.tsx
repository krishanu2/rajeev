import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import Reveal from "./Reveal";

type Faq = { id: number; question: string; answer: string };

// Questions come from the database so Rajeev can add/remove them from the
// admin panel without touching code. The section hides itself entirely if
// the list is empty or the fetch fails — never a broken half-section.
export default function FAQ() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/faqs")
      .then((r) => r.json())
      .then((data) => setFaqs(data.faqs || []))
      .catch(() => {});
  }, []);

  if (faqs.length === 0) return null;

  return (
    <section id="faq" className="relative bg-ink py-24 md:py-32">
      <div className="container-px mx-auto max-w-3xl">
        <Reveal>
          <p className="section-eyebrow text-center">Before you book</p>
          <h2 className="font-display mt-4 text-center text-[clamp(1.9rem,4vw,3rem)] leading-[1.1] text-cream">
            Questions, answered honestly.
          </h2>
        </Reveal>

        <Reveal delay={0.1} className="mt-12">
          <div className="divide-y divide-cream/10 border-y border-cream/10">
            {faqs.map((f) => {
              const isOpen = open === f.id;
              return (
                <div key={f.id}>
                  <button
                    onClick={() => setOpen(isOpen ? null : f.id)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-6 py-5 text-left transition-colors hover:text-cream active:scale-[0.995]"
                  >
                    <span
                      className={`text-base font-semibold sm:text-lg ${
                        isOpen ? "text-cream" : "text-cream-dim"
                      }`}
                    >
                      {f.question}
                    </span>
                    <motion.span
                      animate={{ rotate: isOpen ? 45 : 0 }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      className={`shrink-0 ${isOpen ? "text-ember" : "text-cream-dim/60"}`}
                    >
                      <Plus size={20} strokeWidth={1.8} />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="max-w-2xl pb-6 text-sm leading-relaxed text-cream-dim sm:text-base">
                          {f.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
