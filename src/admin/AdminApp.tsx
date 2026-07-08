import { useEffect, useState } from "react";

type Slot = { time: string; status: "open" | "blocked" | "booked"; name?: string; contact?: string };

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function AdminApp() {
  const [key, setKey] = useState(() => sessionStorage.getItem("admin-key") || "");
  const [input, setInput] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState("");
  const [date, setDate] = useState(todayIso());
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);

  const load = (d: string, k: string) => {
    setLoading(true);
    fetch(`/api/admin/day?date=${d}`, { headers: { "x-admin-key": k } })
      .then((r) => {
        if (r.status === 401) throw new Error("unauthorized");
        return r.json();
      })
      .then((data) => {
        setSlots(data.slots || []);
        setAuthed(true);
      })
      .catch(() => {
        setAuthed(false);
        sessionStorage.removeItem("admin-key");
        setAuthError("Wrong password.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    // TEMPORARY: login gate disabled for testing — auto-loads regardless of key.
    load(date, key || "testing");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (authed && key) load(date, key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  const login = (e: React.FormEvent) => {
    e.preventDefault();
    sessionStorage.setItem("admin-key", input);
    setKey(input);
    load(date, input);
  };

  const act = async (action: string, time: string) => {
    await fetch("/api/admin/action", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-key": key },
      body: JSON.stringify({ action, date, time }),
    });
    load(date, key);
  };

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink px-6">
        <form onSubmit={login} className="w-full max-w-sm rounded-2xl border border-cream/10 bg-ink-soft p-8">
          <p className="font-display text-xl text-cream">FWR Admin</p>
          <input
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Admin password"
            className="mt-6 w-full rounded-lg border border-cream/15 bg-ink px-4 py-3 text-sm text-cream focus:border-ember focus:outline-none"
            autoFocus
          />
          {authError && <p className="mt-2 text-sm text-red-400">{authError}</p>}
          <button className="mt-4 w-full rounded-full bg-ember px-6 py-3 text-sm font-semibold text-ink">
            Enter
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink px-6 py-10 text-cream">
      <div className="mx-auto max-w-3xl">
        <p className="font-display text-2xl">FWR Admin — Slot Manager</p>
        <p className="mt-2 text-sm text-cream-dim">
          Subscribe Google Calendar to{" "}
          <code className="font-data rounded bg-ink-soft px-1.5 py-0.5">{window.location.origin}/api/ics</code>{" "}
          ("Other calendars" → "From URL") to see bookings there.
        </p>

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mt-6 rounded-lg border border-cream/15 bg-ink-soft px-4 py-2 text-sm text-cream"
        />

        {loading ? (
          <p className="mt-6 text-cream-dim">Loading…</p>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {slots.map((s) => (
              <div
                key={s.time}
                className={`rounded-xl border p-3 text-sm ${
                  s.status === "booked"
                    ? "border-ember/40 bg-ember/10"
                    : s.status === "blocked"
                      ? "border-cream/10 bg-ink-soft opacity-50"
                      : "border-cream/10 bg-ink-soft"
                }`}
              >
                <p className="font-data font-semibold">{s.time}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-cream-dim">{s.status}</p>
                {s.status === "booked" && (
                  <>
                    <p className="mt-2 text-xs text-cream">{s.name}</p>
                    <p className="text-xs text-cream-dim">{s.contact}</p>
                    <button
                      onClick={() => act("cancel", s.time)}
                      className="mt-2 text-xs font-semibold text-red-400 underline"
                    >
                      Cancel
                    </button>
                  </>
                )}
                {s.status === "open" && (
                  <button
                    onClick={() => act("block", s.time)}
                    className="mt-2 text-xs font-semibold text-cream-dim underline"
                  >
                    Block
                  </button>
                )}
                {s.status === "blocked" && (
                  <button
                    onClick={() => act("unblock", s.time)}
                    className="mt-2 text-xs font-semibold text-ember underline"
                  >
                    Unblock
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
