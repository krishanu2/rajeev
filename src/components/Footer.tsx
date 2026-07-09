import { AtSign, Mail } from "lucide-react";
import { footer, nav, site } from "../data/content";
import fwrLogo from "../assets/fwr-logo.png";

export default function Footer() {
  return (
    <footer className="border-t border-cream/10 bg-ink py-14">
      <div className="container-px mx-auto max-w-7xl">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="max-w-sm">
            <img src={fwrLogo} alt="FWR — Fit with Rajeev" className="h-8 w-auto" />
            <p className="mt-3 font-data text-[0.65rem] uppercase tracking-[0.2em] text-cream-dim/60">{site.fullName}</p>
            <p className="mt-3 text-sm leading-relaxed text-cream-dim">{footer.note}</p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-cream-dim">Explore</p>
              <ul className="mt-3 flex flex-col gap-2">
                {nav.map((item) => (
                  <li key={item.href}>
                    <a href={item.href} className="text-sm text-cream-dim hover:text-cream">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-cream-dim">Connect</p>
              <ul className="mt-3 flex flex-col gap-2.5">
                <li>
                  <a
                    href={site.instagramUrl}
                    className="flex items-center gap-2 text-sm text-cream-dim hover:text-cream"
                  >
                    <AtSign size={15} /> Instagram
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${site.email}`}
                    className="flex items-center gap-2 text-sm text-cream-dim hover:text-cream"
                  >
                    <Mail size={15} /> {site.email}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-cream/10 pt-6 text-xs text-cream-dim/60 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} {site.name} Coaching. {site.city}.</p>
          <p>Results vary by individual. Always consult your physician before changing medication.</p>
        </div>
      </div>
    </footer>
  );
}
