import { useEffect, useRef } from "react";
import { AtSign, Mail } from "lucide-react";
import { cta, site, symptomSelector } from "../data/content";
import { useSelection } from "../context/SelectionContext";
import Magnetic from "./Magnetic";
import Reveal from "./Reveal";

declare global {
  interface Window {
    Calendly?: unknown;
  }
}

export default function CTA() {
  const widgetRef = useRef<HTMLDivElement>(null);
  const { selectedId } = useSelection();
  const short = symptomSelector.options.find((o) => o.id === selectedId)?.short;

  useEffect(() => {
    if (!site.calendlyConfigured) return;
    const existing = document.getElementById("calendly-widget-script");
    if (!existing) {
      const script = document.createElement("script");
      script.id = "calendly-widget-script";
      script.src = "https://assets.calendly.com/assets/external/widget.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

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
          {site.calendlyConfigured ? (
            <>
              <div
                ref={widgetRef}
                className="calendly-inline-widget mx-auto overflow-hidden rounded-2xl border border-cream/10 bg-ink"
                data-url={`${site.calendlyUrl}?background_color=17140f&text_color=f6f0e6&primary_color=ff6a39`}
                style={{ minWidth: "280px", height: "700px" }}
              />
              <p className="mt-4 text-xs text-cream-dim/60">
                Widget loads your live Calendly availability — no page reload needed.
              </p>
            </>
          ) : (
            <div className="mx-auto max-w-lg rounded-2xl border border-cream/10 bg-ink p-12">
              <p className="font-display text-xl text-cream">Online booking is being set up.</p>
              <p className="mt-4 text-sm leading-relaxed text-cream-dim">
                The instant-scheduling widget goes live here shortly. In the meantime, reach out
                directly and I'll personally get back to you to find a time.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Magnetic strength={0.2}>
                  <a
                    href={`mailto:${site.email}`}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-ember px-6 py-3 text-sm font-semibold text-ink transition-transform hover:scale-105"
                  >
                    <Mail size={16} />
                    Email me
                  </a>
                </Magnetic>
                <a
                  href={site.instagramUrl}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-cream/25 px-6 py-3 text-sm font-semibold text-cream transition-colors hover:border-cream/60"
                >
                  <AtSign size={16} />
                  DM on Instagram
                </a>
              </div>
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}
