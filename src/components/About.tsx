import { UserRound } from "lucide-react";
import { about } from "../data/content";
import Reveal from "./Reveal";
import TiltCard from "./TiltCard";

export default function About() {
  return (
    <section id="about" className="relative overflow-hidden bg-ink py-28 md:py-36">
      <div className="absolute left-1/2 top-10 h-96 w-96 -translate-x-1/2 rounded-full bg-ember/10 blur-[120px]" />

      <div className="container-px relative mx-auto grid max-w-6xl gap-16 md:grid-cols-[0.85fr_1.15fr] md:items-start">
        <Reveal>
          <TiltCard className="relative mx-auto w-full max-w-sm md:sticky md:top-32 [transform-style:preserve-3d]">
            <div className="animate-float-slow absolute -inset-3 rounded-[2rem] border border-ember/25" />
            <div className="absolute -inset-6 rounded-[2.5rem] border border-cream/10" />

            <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] border border-cream/10 bg-gradient-to-br from-ember/25 via-ink-soft to-ink-soft">
              {/* [[Swap for Rajeev's real portrait once supplied — e.g. src/assets/rajeev-portrait.jpg]] */}
              <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-cream/50">
                <UserRound size={48} strokeWidth={1.1} />
                <p className="px-6 text-center text-xs uppercase tracking-widest">
                  Rajeev's photo goes here
                </p>
              </div>
            </div>

            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-cream/10 bg-ink-soft px-5 py-2.5 text-xs font-semibold text-cream shadow-xl">
              8+ yrs · 1000+ clients coached
            </div>
          </TiltCard>
        </Reveal>

        <div>
          <Reveal>
            <p className="section-eyebrow">{about.eyebrow}</p>
            <h2 className="font-display mt-4 text-[clamp(1.8rem,3.2vw,2.6rem)] text-cream">{about.heading}</h2>
          </Reveal>

          <div className="mt-6 flex flex-col gap-4">
            {about.bio.map((p, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <p className="text-lg leading-relaxed text-cream-dim">{p}</p>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.18} className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {about.quickFacts.map((f) => (
              <div key={f.label} className="rounded-xl border border-cream/10 bg-ink-soft p-4">
                <p className="font-display text-lg leading-tight text-cream">{f.value}</p>
                <p className="mt-1 text-[0.65rem] uppercase tracking-widest text-cream-dim">{f.label}</p>
              </div>
            ))}
          </Reveal>

          <ul className="mt-10 flex flex-col gap-6 border-l-2 border-ember/30 pl-6">
            {about.timeline.map((step, i) => (
              <Reveal key={step.title} as="li" delay={0.1 + i * 0.12} y={18} className="relative">
                <span className="absolute -left-[1.85rem] top-1.5 h-2.5 w-2.5 rounded-full bg-ember" />
                <p className="text-xs font-semibold uppercase tracking-widest text-ember">{step.year}</p>
                <p className="font-display mt-1 text-lg text-cream">{step.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-cream-dim">{step.detail}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
