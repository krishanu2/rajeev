import { Quote, UserRound } from "lucide-react";
import { testimonials } from "../data/content";
import Reveal from "./Reveal";

const avatarPalette = ["bg-ember/25 ring-ember/40", "bg-moss-light/25 ring-moss-light/40", "bg-clay/25 ring-clay/40"];

export default function Testimonials() {
  return (
    <section className="relative overflow-hidden bg-ink-soft py-28 md:py-36">
      <div className="container-px mx-auto max-w-6xl">
        <Reveal className="max-w-xl">
          <p className="section-eyebrow">In their words</p>
          <h2 className="font-display mt-4 text-[clamp(2.1rem,4.5vw,3.6rem)] leading-[1.1] text-cream">
            People who did the work, talking about it.
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal key={t.name + i} delay={i * 0.1}>
              <div className="flex h-full flex-col justify-between rounded-2xl border border-cream/10 bg-ink p-7">
                <div>
                  <Quote className="text-ember" size={26} strokeWidth={1.5} />
                  <p className="mt-4 text-[1.05rem] leading-relaxed text-cream">{t.quote}</p>
                </div>
                <div className="mt-8 flex items-center gap-3 border-t border-cream/10 pt-4">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ring-1 ${avatarPalette[i % avatarPalette.length]}`}
                    title="Client photo placeholder"
                  >
                    <UserRound size={18} className="text-cream" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-cream">{t.name}</p>
                    <p className="text-xs text-cream-dim">{t.detail}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
