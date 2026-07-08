import { useEffect, useState } from "react";

type Slot = {
  time: string;
  status: "open" | "blocked" | "booked";
  name?: string;
  contact?: string;
  meetLink?: string | null;
  focus?: string | null;
};

type Client = {
  id: number;
  email: string;
  name: string;
  focus: string | null;
  status: "lead" | "active" | "paused" | "completed";
  notes: string;
  total_bookings: number;
  last_booking: string | null;
  first_seen: string;
};

type Stats = { totalClients: number; newThisMonth: number; callsNext7Days: number };
type WeekDay = { date: string; booked: number; blocked: number; open: number };

const STATUSES = ["lead", "active", "paused", "completed"] as const;
const STATUS_COLORS: Record<string, string> = {
  lead: "border-cream/20 text-cream-dim",
  active: "border-ember/50 text-ember",
  paused: "border-cream/20 text-cream-dim/60",
  completed: "border-moss-light/50 text-moss-light",
};

function todayIso() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// All 48 half-hour slots (IST) — mirrors SLOT_TIMES on the server.
const ALL_TIMES: string[] = [];
for (let h = 0; h < 24; h++) {
  ALL_TIMES.push(`${String(h).padStart(2, "0")}:00`, `${String(h).padStart(2, "0")}:30`);
}

export default function AdminApp() {
  const [key, setKey] = useState(() => sessionStorage.getItem("admin-key") || "");
  const [input, setInput] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState("");
  const [tab, setTab] = useState<"schedule" | "clients">("schedule");

  // Schedule state
  const [date, setDate] = useState(todayIso());
  const [slots, setSlots] = useState<Slot[]>([]);
  const [week, setWeek] = useState<WeekDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [rangeFrom, setRangeFrom] = useState("00:00");
  const [rangeTo, setRangeTo] = useState("08:30");

  // Clients state
  const [clients, setClients] = useState<Client[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [sheetUrl, setSheetUrl] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [clientsLoading, setClientsLoading] = useState(false);
  const [noteDrafts, setNoteDrafts] = useState<Record<number, string>>({});
  const [savingNote, setSavingNote] = useState<number | null>(null);

  const headers = (k: string) => ({ "x-admin-key": k });

  const loadDay = (d: string, k: string) => {
    setLoading(true);
    fetch(`/api/admin/day?date=${d}`, { headers: headers(k) })
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

  const loadWeek = (k: string) => {
    fetch(`/api/admin/week?start=${todayIso()}`, { headers: headers(k) })
      .then((r) => r.json())
      .then((data) => setWeek(data.days || []))
      .catch(() => {});
  };

  const loadClients = (k: string, q = "") => {
    setClientsLoading(true);
    fetch(`/api/admin/clients${q ? `?q=${encodeURIComponent(q)}` : ""}`, { headers: headers(k) })
      .then((r) => r.json())
      .then((data) => {
        setClients(data.clients || []);
        setStats(data.stats || null);
        setSheetUrl(data.sheetUrl || null);
      })
      .catch(() => {})
      .finally(() => setClientsLoading(false));
  };

  useEffect(() => {
    // TEMPORARY: login gate disabled for testing — auto-loads regardless of key.
    const k = key || "testing";
    loadDay(date, k);
    loadWeek(k);
    loadClients(k);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (authed) loadDay(date, key || "testing");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  // Debounced client search
  useEffect(() => {
    if (!authed) return;
    const t = setTimeout(() => loadClients(key || "testing", search), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const login = (e: React.FormEvent) => {
    e.preventDefault();
    sessionStorage.setItem("admin-key", input);
    setKey(input);
    loadDay(date, input);
    loadWeek(input);
    loadClients(input);
  };

  const act = async (action: string, extra: Record<string, string> = {}) => {
    const k = key || "testing";
    await fetch("/api/admin/action", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers(k) },
      body: JSON.stringify({ action, date, ...extra }),
    });
    loadDay(date, k);
    loadWeek(k);
  };

  const updateClient = async (id: number, fields: { status?: string; notes?: string }) => {
    const k = key || "testing";
    await fetch("/api/admin/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers(k) },
      body: JSON.stringify({ id, ...fields }),
    });
    loadClients(k, search);
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

  const booked = slots.filter((s) => s.status === "booked").length;
  const blocked = slots.filter((s) => s.status === "blocked").length;

  return (
    <div className="min-h-screen bg-ink px-4 py-8 text-cream sm:px-6 sm:py-10">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-display text-2xl">FWR Admin</p>
          <div className="flex items-center gap-4 text-xs">
            {sheetUrl && (
              <a href={sheetUrl} target="_blank" rel="noreferrer" className="font-semibold text-ember underline">
                Open Google Sheet
              </a>
            )}
            <a href="/api/auth/google" className="font-semibold text-cream-dim underline hover:text-cream">
              Connect Google
            </a>
          </div>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-cream-dim/70">
          Connect Google once (as the account that hosts the calls) — bookings then get Meet links,
          Google emails the invites, and every client auto-syncs to a "FWR Clients" spreadsheet.
        </p>

        {stats && (
          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              { label: "Total clients", value: stats.totalClients },
              { label: "New this month", value: stats.newThisMonth },
              { label: "Calls next 7 days", value: stats.callsNext7Days },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-cream/10 bg-ink-soft p-4">
                <p className="font-data text-2xl font-semibold text-ember">{s.value}</p>
                <p className="mt-1 text-[0.65rem] uppercase tracking-widest text-cream-dim">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 flex gap-1 rounded-full border border-cream/10 bg-ink-soft p-1">
          {(["schedule", "clients"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold capitalize transition-colors ${
                tab === t ? "bg-ember text-ink" : "text-cream-dim hover:text-cream"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "schedule" && (
          <>
            <div className="mt-6 grid grid-cols-7 gap-1.5">
              {week.map((d) => {
                const selected = d.date === date;
                const dayNum = Number(d.date.slice(8, 10));
                const dow = DAY_NAMES[new Date(`${d.date}T00:00:00`).getDay()];
                return (
                  <button
                    key={d.date}
                    onClick={() => setDate(d.date)}
                    className={`rounded-xl border p-2 text-center transition-colors ${
                      selected
                        ? "border-ember bg-ember/15"
                        : "border-cream/10 bg-ink-soft hover:border-cream/30"
                    }`}
                  >
                    <p className="text-[0.6rem] uppercase tracking-wide text-cream-dim">{dow}</p>
                    <p className="font-data text-lg font-semibold">{dayNum}</p>
                    <p className={`text-[0.6rem] ${d.booked > 0 ? "font-semibold text-ember" : "text-cream-dim/50"}`}>
                      {d.booked > 0 ? `${d.booked} call${d.booked > 1 ? "s" : ""}` : d.open === 0 ? "off" : "free"}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="rounded-lg border border-cream/15 bg-ink-soft px-4 py-2 text-sm text-cream"
              />
              <span className="text-xs text-cream-dim">
                {booked} booked · {blocked} blocked
              </span>
              <div className="ml-auto flex gap-2">
                <button
                  onClick={() => act("block-day")}
                  className="rounded-full border border-cream/15 px-4 py-2 text-xs font-semibold text-cream-dim hover:border-cream/40 hover:text-cream"
                >
                  Block whole day
                </button>
                <button
                  onClick={() => act("unblock-day")}
                  className="rounded-full border border-cream/15 px-4 py-2 text-xs font-semibold text-cream-dim hover:border-cream/40 hover:text-cream"
                >
                  Unblock day
                </button>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-cream/10 bg-ink-soft p-3">
              <span className="text-xs text-cream-dim">Range (IST)</span>
              <select
                value={rangeFrom}
                onChange={(e) => setRangeFrom(e.target.value)}
                className="rounded-lg border border-cream/15 bg-ink px-2 py-1.5 font-data text-xs text-cream"
              >
                {ALL_TIMES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <span className="text-xs text-cream-dim">to</span>
              <select
                value={rangeTo}
                onChange={(e) => setRangeTo(e.target.value)}
                className="rounded-lg border border-cream/15 bg-ink px-2 py-1.5 font-data text-xs text-cream"
              >
                {ALL_TIMES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <div className="ml-auto flex gap-2">
                <button
                  onClick={() => rangeFrom <= rangeTo && act("block-range", { from: rangeFrom, to: rangeTo })}
                  className="rounded-full border border-cream/15 px-4 py-1.5 text-xs font-semibold text-cream-dim hover:border-cream/40 hover:text-cream"
                >
                  Block range
                </button>
                <button
                  onClick={() => rangeFrom <= rangeTo && act("unblock-range", { from: rangeFrom, to: rangeTo })}
                  className="rounded-full border border-ember/40 px-4 py-1.5 text-xs font-semibold text-ember hover:border-ember"
                >
                  Open range
                </button>
              </div>
            </div>

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
                        <p className="break-all text-xs text-cream-dim">{s.contact}</p>
                        {s.focus && <p className="mt-1 text-[0.65rem] text-ember-light">{s.focus}</p>}
                        {s.meetLink && (
                          <a
                            href={s.meetLink}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-1 block text-xs font-semibold text-ember underline"
                          >
                            Meet link
                          </a>
                        )}
                        <button
                          onClick={() => act("cancel", { time: s.time })}
                          className="mt-2 text-xs font-semibold text-red-400 underline"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    {s.status === "open" && (
                      <button
                        onClick={() => act("block", { time: s.time })}
                        className="mt-2 text-xs font-semibold text-cream-dim underline"
                      >
                        Block
                      </button>
                    )}
                    {s.status === "blocked" && (
                      <button
                        onClick={() => act("unblock", { time: s.time })}
                        className="mt-2 text-xs font-semibold text-ember underline"
                      >
                        Unblock
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === "clients" && (
          <>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email or focus area…"
              className="mt-6 w-full rounded-lg border border-cream/15 bg-ink-soft px-4 py-3 text-sm text-cream placeholder:text-cream-dim/50 focus:border-ember focus:outline-none"
            />
            {clientsLoading ? (
              <p className="mt-6 text-cream-dim">Loading…</p>
            ) : clients.length === 0 ? (
              <p className="mt-6 text-sm text-cream-dim">
                {search ? "No clients match that search." : "No clients yet — they appear here automatically when someone books."}
              </p>
            ) : (
              <div className="mt-5 flex flex-col gap-3">
                {clients.map((c) => (
                  <div key={c.id} className="rounded-xl border border-cream/10 bg-ink-soft p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-cream">{c.name}</p>
                        <p className="break-all text-xs text-cream-dim">{c.email}</p>
                        {c.focus && (
                          <span className="mt-1.5 inline-block rounded-full border border-ember/30 bg-ember/10 px-2.5 py-0.5 text-[0.65rem] text-ember-light">
                            {c.focus}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <select
                          value={c.status}
                          onChange={(e) => updateClient(c.id, { status: e.target.value })}
                          className={`rounded-full border bg-ink px-3 py-1 text-xs font-semibold capitalize focus:outline-none ${STATUS_COLORS[c.status]}`}
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        <p className="text-[0.65rem] text-cream-dim/70">
                          {c.total_bookings} booking{c.total_bookings !== 1 ? "s" : ""}
                          {c.last_booking ? ` · last ${c.last_booking}` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-end gap-2">
                      <textarea
                        value={noteDrafts[c.id] ?? c.notes}
                        onChange={(e) => setNoteDrafts((d) => ({ ...d, [c.id]: e.target.value }))}
                        placeholder="Notes (goals, meds, progress…)"
                        rows={2}
                        className="w-full resize-none rounded-lg border border-cream/10 bg-ink px-3 py-2 text-xs text-cream placeholder:text-cream-dim/40 focus:border-ember focus:outline-none"
                      />
                      {noteDrafts[c.id] !== undefined && noteDrafts[c.id] !== c.notes && (
                        <button
                          onClick={async () => {
                            setSavingNote(c.id);
                            await updateClient(c.id, { notes: noteDrafts[c.id] });
                            setNoteDrafts((d) => {
                              const next = { ...d };
                              delete next[c.id];
                              return next;
                            });
                            setSavingNote(null);
                          }}
                          disabled={savingNote === c.id}
                          className="shrink-0 rounded-full bg-ember px-4 py-2 text-xs font-semibold text-ink disabled:opacity-50"
                        >
                          {savingNote === c.id ? "Saving…" : "Save"}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
