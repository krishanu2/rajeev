import { motion } from "framer-motion";
import { X } from "lucide-react";

// Rendered as the first row inside Nav's own fixed header (not its own
// fixed element) so it always moves as one unit with the nav bar — no
// separate positioning/height math to keep in sync. Fixed height (h-10)
// so Nav's layout above it never has to measure or guess.
export default function ReferralBanner({ name, onDismiss }: { name: string; onDismiss: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex h-10 items-center justify-center gap-3 bg-ember/10 px-4"
    >
      <p className="truncate text-xs font-semibold text-ember-light">👋 {name} sent you here</p>
      <button
        onClick={onDismiss}
        aria-label="Dismiss"
        className="shrink-0 text-ember-light/60 transition-colors hover:text-ember-light"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}
