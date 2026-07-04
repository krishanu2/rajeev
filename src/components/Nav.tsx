import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { nav } from "../data/content";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled || open
          ? "bg-ink/95 backdrop-blur-md shadow-[0_1px_0_rgba(246,240,230,0.08)]"
          : "bg-transparent"
      }`}
    >
      <div className="container-px mx-auto flex h-18 max-w-7xl items-center justify-between gap-6 py-4">
        <a href="#top" className="shrink-0 font-display text-xl font-medium tracking-tight text-cream">
          Rajeev<span className="text-ember">.</span>HB
        </a>

        <nav className="hidden min-w-0 items-center gap-7 lg:flex xl:gap-9">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="whitespace-nowrap text-sm text-cream-dim transition-colors hover:text-cream"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <a
          href="#book"
          className="hidden shrink-0 rounded-full bg-ember px-5 py-2.5 text-sm font-semibold text-ink transition-transform hover:scale-105 lg:inline-block"
        >
          Book a Call
        </a>

        <button
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          className="shrink-0 text-cream lg:hidden"
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden border-t border-cream/10 bg-ink lg:hidden"
          >
            <div className="container-px flex flex-col gap-1 py-4">
              {nav.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="py-3 text-base text-cream-dim transition-colors hover:text-cream"
                >
                  {item.label}
                </a>
              ))}
              <a
                href="#book"
                onClick={() => setOpen(false)}
                className="mt-2 rounded-full bg-ember px-5 py-3 text-center text-sm font-semibold text-ink"
              >
                Book a Call
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
