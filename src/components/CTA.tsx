import { cta, symptomSelector } from "../data/content";
import { useSelection } from "../context/SelectionContext";
import BookingWidget from "./BookingWidget";
import Reveal from "./Reveal";

export default function CTA() {
  const { selectedId } = useSelection();
  const short = symptomSelector.options.find((o) => o.id === selectedId)?.short;

  return (
    <section id="book" className="relative overflow-hidden bg-ink-soft py-32 md:py-44">
      <div className="absolute left-1/2 top-0 h-96 w-[60rem] -translate-x-1/2 rounded-full bg-ember/10 blur-[130px]" />

      {/* The "exhale" beat — calmer pacing (slower reveals, more air) so the
          design doesn't contradict copy that promises "no pressure" */}
      <div className="container-px relative mx-auto max-w-3xl text-center">
        <Reveal duration={0.9}>
          <p className="section-eyebrow">{cta.eyebrow}</p>
          <h2 className="font-display mt-5 text-[clamp(2.1rem,4.2vw,3.2rem)] leading-[1.15] text-cream">
            {short ? `Let's talk about your ${short}.` : cta.heading}
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-cream-dim">{cta.sub}</p>
        </Reveal>

        <Reveal delay={0.2} duration={0.9} className="mt-16">
          <BookingWidget />
        </Reveal>
      </div>
    </section>
  );
}
