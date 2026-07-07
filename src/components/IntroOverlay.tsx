import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

export default function IntroOverlay() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion) return;
    if (sessionStorage.getItem("intro-shown")) return;
    sessionStorage.setItem("intro-shown", "1");
    setShow(true);
    const timer = setTimeout(() => setShow(false), 1650);
    return () => clearTimeout(timer);
  }, [prefersReducedMotion]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          exit={{ opacity: 0, filter: "blur(6px)" }}
          transition={{ duration: 0.55, ease: [0.65, 0, 0.35, 1] }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink"
        >
          <div className="flex flex-col items-center gap-5">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-2xl tracking-tight text-cream"
            >
              FWR<span className="text-ember">.</span>
            </motion.p>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.9, delay: 0.4, ease: [0.65, 0, 0.35, 1] }}
              className="h-px w-44 origin-left bg-gradient-to-r from-ember-light via-ember to-clay"
            />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="font-data text-[0.65rem] uppercase tracking-[0.3em] text-cream-dim/60"
            >
              8 years · 1000+ transformations
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
