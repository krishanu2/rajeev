import { ArrowUpRight, Users, Mountain, PartyPopper } from "lucide-react";
import { community, site } from "../data/content";
import Reveal from "./Reveal";

export default function FunWithFitness() {
  return (
    <section id="community" className="relative overflow-hidden bg-ink py-24 md:py-32">
      <div className="container-px mx-auto max-w-6xl">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-cream/10 bg-gradient-to-br from-moss/25 via-ink-soft to-ink-soft p-8 md:p-14">
            <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-moss-light/20 blur-[90px]" />

            <div className="relative grid gap-10 md:grid-cols-[1.3fr_1fr] md:items-center">
              <div>
                <p className="section-eyebrow text-moss-light">{community.eyebrow}</p>
                <h2 className="font-display mt-4 text-[clamp(1.8rem,3.4vw,2.6rem)] text-cream">
                  {community.heading}
                </h2>
                <p className="mt-4 max-w-xl text-base leading-relaxed text-cream-dim">
                  {community.sub}
                </p>
                <a
                  href={site.funWithFitnessUrl}
                  className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-moss-light hover:text-cream"
                >
                  {community.cta}
                  <ArrowUpRight size={16} />
                </a>
              </div>

              <div className="grid grid-cols-3 gap-3 md:grid-cols-1">
                {[
                  { icon: Mountain, label: "Group treks & adventures" },
                  { icon: Users, label: "Social fitness meetups" },
                  { icon: PartyPopper, label: "Community, not competition" },
                ].map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex flex-col items-center gap-2 rounded-xl border border-cream/10 bg-ink/40 p-4 text-center md:flex-row md:text-left"
                  >
                    <Icon size={20} className="text-moss-light" />
                    <span className="text-xs text-cream-dim md:text-sm">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
