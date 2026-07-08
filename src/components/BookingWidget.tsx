import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

type Slot = { time: string; status: "open" | "blocked" | "booked" };

function toIso(d: Date) {
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function buildMonth(viewYear: number, viewMonth: number) {
  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const startOffset = firstOfMonth.getDay(); // 0=Sun
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(viewYear, viewMonth, d));
  return cells;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function BookingWidget() {
  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);
  const maxDate = useMemo(() => {
    const m = new Date(today);
    m.setMonth(m.getMonth() + 2);
    return m;
  }, [today]);

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [meetLink, setMeetLink] = useState<string | null>(null);

  const cells = useMemo(() => buildMonth(viewYear, viewMonth), [viewYear, viewMonth]);
  const canGoPrev = new Date(viewYear, viewMonth, 1) > today;
  const canGoNext = new Date(viewYear, viewMonth + 1, 1) <= maxDate;

  const isDisabled = (d: Date) => d < today || d.getDay() === 0 || d > maxDate;

  const selectDate = (d: Date) => {
    if (isDisabled(d)) return;
    const iso = toIso(d);
    setSelectedDate(iso);
    setPicked(null);
    setLoading(true);
    fetch(`/api/slots?date=${iso}`)
      .then((r) => r.json())
      .then((data) => setSlots(data.slots || []))
      .finally(() => setLoading(false));
  };

  const refreshSlots = () => {
    if (!selectedDate) return;
    fetch(`/api/slots?date=${selectedDate}`).then((r) => r.json()).then((d) => setSlots(d.slots || []));
  };

  const submit = async () => {
    if (!picked || !selectedDate || !name.trim() || !contact.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: selectedDate, time: picked, name, contact }),
      });
      if (res.status === 409) {
        setError("That slot was just taken — pick another.");
        setPicked(null);
        refreshSlots();
      } else if (!res.ok) {
        setError("Something went wrong. Please try again.");
      } else {
        const data = await res.json().catch(() => ({}));
        setMeetLink(data.meetLink || null);
        setDone(true);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-ember/30 bg-ink p-10 text-center">
        <Check className="mx-auto text-ember" size={32} />
        <p className="font-display mt-4 text-xl text-cream">You're booked.</p>
        <p className="mt-2 text-sm text-cream-dim">
          {selectedDate} at {picked} — I'll see you then.
        </p>
        {meetLink ? (
          <>
            <a
              href={meetLink}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center justify-center rounded-full bg-ember px-6 py-3 text-sm font-semibold text-ink transition-transform hover:scale-105 active:scale-[0.97]"
            >
              Google Meet link
            </a>
            <p className="mt-3 text-xs text-cream-dim/60">A calendar invite with this link is on its way to your email.</p>
          </>
        ) : (
          <p className="mt-4 text-xs text-cream-dim/60">A confirmation is on its way to your email.</p>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-cream/10 bg-ink p-5 sm:p-7">
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            const m = new Date(viewYear, viewMonth - 1, 1);
            setViewYear(m.getFullYear());
            setViewMonth(m.getMonth());
          }}
          disabled={!canGoPrev}
          className="rounded-full p-1.5 text-cream-dim transition-[color,transform] hover:text-cream active:scale-90 disabled:opacity-20 disabled:active:scale-100"
          aria-label="Previous month"
        >
          <ChevronLeft size={18} />
        </button>
        <p className="font-display text-base text-cream">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </p>
        <button
          onClick={() => {
            const m = new Date(viewYear, viewMonth + 1, 1);
            setViewYear(m.getFullYear());
            setViewMonth(m.getMonth());
          }}
          disabled={!canGoNext}
          className="rounded-full p-1.5 text-cream-dim transition-[color,transform] hover:text-cream active:scale-90 disabled:opacity-20 disabled:active:scale-100"
          aria-label="Next month"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[0.65rem] uppercase tracking-wide text-cream-dim/60">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i}>{d}</div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const iso = toIso(d);
          const disabled = isDisabled(d);
          const isSelected = iso === selectedDate;
          return (
            <button
              key={i}
              onClick={() => selectDate(d)}
              disabled={disabled}
              className={`aspect-square rounded-lg text-sm font-data transition-[background-color,color,transform] ${
                disabled
                  ? "cursor-not-allowed text-cream-dim/20"
                  : isSelected
                    ? "bg-ember font-semibold text-ink active:scale-95"
                    : "text-cream-dim hover:bg-cream/10 hover:text-cream active:scale-90"
              }`}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {selectedDate && (
          <motion.div
            key={selectedDate}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-cream-dim">
              Available times · {selectedDate}
            </p>
            {loading ? (
              <div className="mt-4 flex justify-center py-6">
                <Loader2 className="animate-spin text-cream-dim" size={22} />
              </div>
            ) : (
              <div className="mt-3 grid grid-cols-4 gap-2">
                {slots.map((s) => (
                  <button
                    key={s.time}
                    disabled={s.status !== "open"}
                    onClick={() => setPicked(s.time)}
                    className={`rounded-lg border px-2 py-2.5 text-xs font-data transition-[background-color,color,border-color,transform] ${
                      s.status !== "open"
                        ? "cursor-not-allowed border-cream/5 text-cream-dim/25 line-through"
                        : picked === s.time
                          ? "border-ember bg-ember text-ink active:scale-95"
                          : "border-cream/15 text-cream-dim hover:border-cream/40 hover:text-cream active:scale-95"
                    }`}
                  >
                    {s.time}
                  </button>
                ))}
              </div>
            )}

            {picked && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-6 flex flex-col gap-3">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="rounded-lg border border-cream/15 bg-ink-soft px-4 py-3 text-sm text-cream placeholder:text-cream-dim/50 focus:border-ember focus:outline-none"
                />
                <input
                  type="email"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="Your email (for the calendar invite)"
                  className="rounded-lg border border-cream/15 bg-ink-soft px-4 py-3 text-sm text-cream placeholder:text-cream-dim/50 focus:border-ember focus:outline-none"
                />
                {error && <p className="text-sm text-red-400">{error}</p>}
                <button
                  onClick={submit}
                  disabled={submitting || !name.trim() || !contact.trim()}
                  className="rounded-full bg-ember px-6 py-3 text-sm font-semibold text-ink transition-transform hover:scale-105 active:scale-[0.97] disabled:opacity-50 disabled:active:scale-100"
                >
                  {submitting ? "Booking…" : `Confirm ${selectedDate} at ${picked}`}
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
