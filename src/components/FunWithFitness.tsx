import { Users, Mountain, PartyPopper } from "lucide-react";
import { community } from "../data/content";
import Reveal from "./Reveal";
import rajeevCommunity from "../assets/rajeev-community.jpg";

export default function FunWithFitness() {
  return (
    <section id="community" className="relative overflow-hidden bg-ink py-24 md:py-32">
      <div className="container-px mx-auto max-w-6xl">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-cream/10 bg-gradient-to-br from-ember/15 via-ink-soft to-ink-soft p-8 md:p-14">
            <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-ember-light/15 blur-[90px]" />

            <div className="relative grid gap-10 md:grid-cols-[1.3fr_1fr] md:items-center">
              <div>
                <p className="section-eyebrow text-ember-light">{community.eyebrow}</p>
                <h2 className="font-display mt-4 text-[clamp(1.8rem,3.4vw,2.6rem)] text-cream">
                  {community.heading}
                </h2>
                <p className="mt-4 max-w-xl text-base leading-relaxed text-cream-dim">
                  {community.sub}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <div className="relative overflow-hidden rounded-2xl border border-cream/10">
                  <img
                    src={rajeevCommunity}
                    alt="Rajeev at a Fun with Fitness meetup"
                    loading="lazy"
                    className="h-52 w-full object-cover object-[50%_25%] md:h-56"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { icon: Mountain, label: "Group treks" },
                    { icon: Users, label: "Social workouts" },
                    { icon: PartyPopper, label: "Community" },
                  ].map(({ icon: Icon, label }) => (
                    <div
                      key={label}
                      className="flex flex-col items-center gap-1.5 rounded-xl border border-cream/10 bg-ink/40 p-3 text-center"
                    >
                      <Icon size={18} className="text-ember-light" />
                      <span className="text-[0.7rem] text-cream-dim">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
