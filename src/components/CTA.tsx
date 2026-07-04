import { useEffect, useRef } from "react";
import { AtSign, Mail } from "lucide-react";
import { cta, site } from "../data/content";
import Reveal from "./Reveal";

declare global {
  interface Window {
    Calendly?: unknown;
  }
}

export default function CTA() {
  const widgetRef = useRef<HTMLDivElement>(null);

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
    <section id="book" className="relative overflow-hidden bg-ink-soft py-28 md:py-36">
      <div className="absolute left-1/2 top-0 h-96 w-[60rem] -translate-x-1/2 rounded-full bg-ember/10 blur-[130px]" />

      <div className="container-px relative mx-auto max-w-4xl text-center">
        <Reveal>
          <p className="section-eyebrow">{cta.eyebrow}</p>
          <h2 className="font-display mt-4 text-[clamp(2.2rem,4.5vw,3.4rem)] leading-[1.05] text-cream">
            {cta.heading}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-cream-dim">{cta.sub}</p>
        </Reveal>

        <Reveal delay={0.15} className="mt-12">
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
            <div className="mx-auto max-w-lg rounded-2xl border border-cream/10 bg-ink p-10">
              <p className="font-display text-xl text-cream">Online booking is being set up.</p>
              <p className="mt-3 text-sm leading-relaxed text-cream-dim">
                The instant-scheduling widget goes live here shortly. In the meantime, reach out
                directly and I'll personally get back to you to find a time.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <a
                  href={`mailto:${site.email}`}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-ember px-6 py-3 text-sm font-semibold text-ink transition-transform hover:scale-105"
                >
                  <Mail size={16} />
                  Email me
                </a>
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
