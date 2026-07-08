import { Suspense, lazy, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, ArrowRight } from "lucide-react";
import { hero } from "../data/content";
import { useReducedMotion } from "../hooks/useReducedMotion";
import StatCounter from "./StatCounter";
import Magnetic from "./Magnetic";

const HeroScene = lazy(() => import("./three/HeroScene"));

const wordVariants = {
  hidden: { opacity: 0, y: 16, filter: "blur(8px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const } },
};

const line1Container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } },
};

// Line 2 waits until line 1 has fully resolved, plus a deliberate beat of
// silence — the setup ("your doctor gets 7 minutes") has to land before the
// payoff arrives, rather than both fading in together like everything else.
const line2Container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 1.35 } },
};

export default function Hero() {
  const reducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 160]);
  const opacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);

  return (
    <section id="top" ref={sectionRef} className="relative h-[125svh] bg-ink sm:h-[145svh]">
      {/* Sticky inner wrapper pins the 3D canvas while the headline/copy
          scrolls and fades past it, instead of both scrolling away together */}
      <div className="sticky top-0 flex h-[100svh] items-start overflow-hidden pt-36 sm:pt-40">
        <div className="absolute inset-0 -z-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(240,180,41,0.16),transparent)]" />
          <Suspense fallback={null}>
            <HeroScene reducedMotion={reducedMotion} />
          </Suspense>
          {/* Scrim keeps copy readable regardless of where the 3D shape drifts */}
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/75 to-ink/10 md:via-ink/60 md:to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink to-transparent" />
        </div>

        <motion.div
          style={{ y, opacity }}
          className="container-px relative z-10 mx-auto grid max-w-7xl gap-6 pb-24 pointer-events-none"
        >
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="section-eyebrow"
          >
            {hero.eyebrow}
          </motion.p>

          <h1 className="font-display max-w-5xl text-[clamp(2.6rem,7.2vw,6.2rem)] font-medium leading-[1.0] tracking-tight text-cream">
            <motion.span variants={line1Container} initial="hidden" animate="show" className="block">
              {hero.headlineTop.split(" ").map((word, i) => (
                <motion.span key={i} variants={wordVariants} className="inline-block">
                  {word}
                  {i < hero.headlineTop.split(" ").length - 1 ? " " : " "}
                </motion.span>
              ))}
              <motion.span variants={wordVariants} className="text-gradient-ember inline-block italic">
                {hero.headlineHighlight}
              </motion.span>
            </motion.span>
            <motion.span variants={line2Container} initial="hidden" animate="show" className="block">
              {hero.headlineBottom.split(" ").map((word, i) => (
                <motion.span key={i} variants={wordVariants} className="inline-block">
                  {word}
                  {i < hero.headlineBottom.split(" ").length - 1 ? " " : ""}
                </motion.span>
              ))}
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 2.3 }}
            className="max-w-xl text-lg leading-relaxed text-cream-dim"
          >
            {hero.sub}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 2.5 }}
            className="pointer-events-auto mt-2 flex flex-wrap items-center gap-4"
          >
            <Magnetic>
              <a
                href="#book"
                className="group inline-flex items-center gap-2 rounded-full bg-ember px-7 py-4 text-sm font-semibold text-ink transition-transform hover:scale-105"
              >
                {hero.ctaPrimary}
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </a>
            </Magnetic>
            <a
              href="#results"
              className="inline-flex items-center gap-2 rounded-full border border-cream/25 bg-ink/40 px-7 py-4 text-sm font-semibold text-cream backdrop-blur-sm transition-colors hover:border-cream/60"
            >
              {hero.ctaSecondary}
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 2.7 }}
            className="pointer-events-auto mt-10 flex max-w-xl flex-wrap gap-x-10 gap-y-4 border-t border-cream/10 pt-6"
          >
            {[hero.stat1, hero.stat2, hero.stat3].map((stat) => (
              <div key={stat.label}>
                <StatCounter value={stat.value} className="font-display text-2xl text-cream" />
                <div className="text-xs uppercase tracking-widest text-cream-dim">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <motion.a
          href="#philosophy"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-cream-dim"
          aria-label="Scroll to next section"
        >
          <ArrowDown size={22} />
        </motion.a>
      </div>
    </section>
  );
}
