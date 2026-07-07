import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";

type Slot = { time: string; status: "open" | "blocked" | "booked" };

function nextDays(n: number) {
  const days: { iso: string; label: string }[] = [];
  const d = new Date();
  while (days.length < n) {
    d.setDate(d.getDate() + (days.length === 0 ? 0 : 1));
    if (d.getDay() !== 0) {
      const iso = d.toISOString().slice(0, 10);
      days.push({ iso, label: d.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" }) });
    }
  }
  return days;
}

export default function BookingWidget() {
  const days = useMemo(() => nextDays(10), []);
  const [date, setDate] = useState(days[0].iso);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [picked, setPicked] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setLoading(true);
    setPicked(null);
    fetch(`/api/slots?date=${date}`)
      .then((r) => r.json())
      .then((d) => setSlots(d.slots || []))
      .finally(() => setLoading(false));
  }, [date]);

  const submit = async () => {
    if (!picked || !name.trim() || !contact.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, time: picked, name, contact }),
      });
      if (res.status === 409) {
        setError("That slot was just taken — pick another.");
        setPicked(null);
        fetch(`/api/slots?date=${date}`).then((r) => r.json()).then((d) => setSlots(d.slots || []));
      } else if (!res.ok) {
        setError("Something went wrong. Please try again.");
      } else {
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
          {date} at {picked} — I'll see you then.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-cream/10 bg-ink p-6 sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-widest text-cream-dim">Pick a day</p>
      <div className="mt-3 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {days.map((d) => (
          <button
            key={d.iso}
            onClick={() => setDate(d.iso)}
            className={`shrink-0 rounded-full border px-4 py-2 text-xs font-medium whitespace-nowrap transition-colors ${
              date === d.iso ? "border-ember bg-ember text-ink" : "border-cream/20 text-cream-dim hover:border-cream/50"
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-cream-dim">Pick a 30-min slot</p>
      {loading ? (
        <div className="mt-4 flex justify-center py-6">
          <Loader2 className="animate-spin text-cream-dim" size={22} />
        </div>
      ) : (
        <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
          {slots.map((s) => (
            <button
              key={s.time}
              disabled={s.status !== "open"}
              onClick={() => setPicked(s.time)}
              className={`rounded-lg border px-2 py-2.5 text-xs font-data transition-colors ${
                s.status !== "open"
                  ? "cursor-not-allowed border-cream/5 text-cream-dim/25 line-through"
                  : picked === s.time
                    ? "border-ember bg-ember text-ink"
                    : "border-cream/15 text-cream-dim hover:border-cream/40 hover:text-cream"
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
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="Phone or email"
            className="rounded-lg border border-cream/15 bg-ink-soft px-4 py-3 text-sm text-cream placeholder:text-cream-dim/50 focus:border-ember focus:outline-none"
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            onClick={submit}
            disabled={submitting || !name.trim() || !contact.trim()}
            className="rounded-full bg-ember px-6 py-3 text-sm font-semibold text-ink transition-transform hover:scale-105 disabled:opacity-50"
          >
            {submitting ? "Booking…" : `Confirm ${date} at ${picked}`}
          </button>
        </motion.div>
      )}
    </div>
  );
}
