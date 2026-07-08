import { useRef } from "react";
import type { MotionValue } from "framer-motion";
import { motion, useScroll, useTransform } from "framer-motion";
import { manifesto } from "../data/content";

function ManifestoLine({
  text,
  index,
  total,
  progress,
  emphasis = false,
}: {
  text: string;
  index: number;
  total: number;
  progress: MotionValue<number>;
  emphasis?: boolean;
}) {
  const seg = 1 / total;
  const start = index * seg;
  const end = (index + 1) * seg;
  const fade = seg * 0.22;

  const opacity = useTransform(progress, [start, start + fade, end - fade, end], [0, 1, 1, 0]);
  const scale = useTransform(
    progress,
    [start, start + fade, end - fade, end],
    emphasis ? [0.88, 1, 1.04, 1.1] : [0.9, 1, 1, 1.06]
  );
  const blur = useTransform(progress, [end - fade, end], ["blur(0px)", "blur(10px)"]);

  return (
    <motion.p
      style={{ opacity, scale, filter: blur }}
      className={`font-display absolute inset-x-0 px-6 text-center leading-[1.15] ${
        emphasis
          ? "text-gradient-ember text-[clamp(2.2rem,7vw,5.4rem)] italic"
          : "text-[clamp(1.9rem,6vw,4.4rem)] text-cream"
      }`}
    >
      {text}
    </motion.p>
  );
}

export default function Manifesto() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  return (
    <section ref={sectionRef} className="relative h-[220svh] bg-ink sm:h-[280svh]">
      <div className="sticky top-0 flex h-svh items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_50%,rgba(255,106,57,0.08),transparent)]" />
        {manifesto.map((line, i) => (
          <ManifestoLine
            key={line}
            text={line}
            index={i}
            total={manifesto.length}
            progress={scrollYProgress}
            emphasis={i === manifesto.length - 1}
          />
        ))}
      </div>
    </section>
  );
}
