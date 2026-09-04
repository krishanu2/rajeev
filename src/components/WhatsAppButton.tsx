import { motion } from "framer-motion";
import { site } from "../data/content";

// Plain wa.me link — no Business API, no cost, works the instant someone
// taps it (opens their own WhatsApp with a pre-filled message to Rajeev).
// Kept in WhatsApp's own green rather than the site's gold: recognizability
// of "this is the WhatsApp button" matters more here than brand purity.
export default function WhatsAppButton() {
  const message = encodeURIComponent("Hi Rajeev, I'd like to know more about coaching with you.");
  const href = `https://wa.me/${site.whatsappNumber}?text=${message}`;

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 1 }}
      whileHover={{ scale: 1.08 }}
      className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-transform active:scale-95 sm:bottom-6 sm:right-6"
    >
      <svg viewBox="0 0 24 24" fill="white" className="h-7 w-7">
        <path d="M12.04 2c-5.52 0-10 4.48-10 10 0 1.86.5 3.6 1.38 5.1L2 22l5.06-1.33A9.94 9.94 0 0 0 12.04 22c5.52 0 10-4.48 10-10s-4.48-10-10-10Zm0 18.15a8.15 8.15 0 0 1-4.16-1.14l-.3-.18-3 .79.8-2.92-.2-.3a8.15 8.15 0 1 1 6.86 3.75Zm4.48-6.1c-.25-.12-1.45-.72-1.68-.8-.22-.08-.38-.12-.55.12-.16.24-.63.8-.77.96-.14.16-.28.18-.53.06-.24-.12-1.02-.38-1.94-1.2-.72-.64-1.2-1.43-1.34-1.67-.14-.24-.02-.37.1-.5.12-.12.27-.31.4-.47.13-.16.18-.27.27-.45.09-.18.04-.33-.04-.46-.08-.12-.5-1.2-.69-1.65-.18-.44-.37-.38-.51-.39-.13-.01-.28-.01-.43-.01-.15 0-.4.06-.6.3-.2.24-.79.77-.79 1.87 0 1.1.8 2.16.91 2.31.11.15 1.52 2.32 3.68 3.16 1.85.71 2.23.57 2.63.53.4-.04 1.3-.53 1.48-1.04.18-.51.18-.95.13-1.04-.05-.09-.2-.15-.44-.27Z" />
      </svg>
    </motion.a>
  );
}
