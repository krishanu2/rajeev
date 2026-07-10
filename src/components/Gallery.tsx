import { useEffect, useState } from "react";
import Reveal from "./Reveal";

type GalleryItem = {
  id: number;
  name: string;
  review: string;
  before: string | null;
  after: string;
};

// Auto-scrolling wall of client photos, managed entirely by Rajeev from the
// admin Gallery tab. Hides itself when empty. The track is duplicated once
// and slid -50% on a loop — the classic seamless marquee.
export default function Gallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);

  useEffect(() => {
    fetch("/api/gallery")
      .then((r) => r.json())
      .then((data) => setItems(data.items || []))
      .catch(() => {});
  }, []);

  if (items.length === 0) return null;

  // Short lists still need enough width for a seamless loop.
  const track = items.length < 4 ? [...items, ...items] : items;

  return (
    <section id="gallery" className="relative overflow-hidden bg-ink py-24 md:py-32">
      <div className="container-px mx-auto max-w-7xl">
        <Reveal>
          <p className="section-eyebrow text-center">The wall</p>
          <h2 className="font-display mt-4 text-center text-[clamp(1.9rem,4vw,3rem)] leading-[1.1] text-cream">
            Real people. Real change.
          </h2>
        </Reveal>
      </div>

      <Reveal delay={0.15} className="relative mt-12">
        {/* edge fades so cards dissolve instead of hitting a hard border */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-ink to-transparent sm:w-28" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-ink to-transparent sm:w-28" />

        <div className="overflow-hidden motion-reduce:overflow-x-auto">
          <div className="flex w-max gap-5 animate-marquee hover:[animation-play-state:paused] motion-reduce:animate-none">
            {[...track, ...track].map((item, i) => (
              <figure
                key={`${item.id}-${i}`}
                className="w-[17rem] shrink-0 rounded-2xl border border-cream/15 bg-cream/[0.07] p-3 backdrop-blur-md"
              >
                <div className="flex gap-1.5">
                  {item.before && (
                    <div className="relative w-1/2 overflow-hidden rounded-lg">
                      <img
                        src={item.before}
                        alt={`${item.name} before`}
                        loading="lazy"
                        draggable={false}
                        className="h-44 w-full select-none object-cover object-top"
                      />
                      <span className="absolute left-1.5 top-1.5 rounded-full bg-ink/60 px-2 py-0.5 text-[0.55rem] font-semibold uppercase tracking-wider text-cream/80 backdrop-blur-sm">
                        Before
                      </span>
                    </div>
                  )}
                  <div className={`relative overflow-hidden rounded-lg ${item.before ? "w-1/2" : "w-full"}`}>
                    <img
                      src={item.after}
                      alt={item.name}
                      loading="lazy"
                      draggable={false}
                      className="h-44 w-full select-none object-cover object-top"
                    />
                    {item.before && (
                      <span className="absolute left-1.5 top-1.5 rounded-full bg-ember/90 px-2 py-0.5 text-[0.55rem] font-bold uppercase tracking-wider text-ink">
                        After
                      </span>
                    )}
                  </div>
                </div>
                <figcaption className="px-1 pb-1 pt-3">
                  <p className="flex items-center gap-2 text-sm font-semibold text-cream">
                    {item.name}
                    <span aria-hidden className="h-1 w-1 rounded-full bg-accent-pink" />
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-cream-dim line-clamp-2">{item.review}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
