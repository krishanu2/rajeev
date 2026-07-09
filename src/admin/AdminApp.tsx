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
type Faq = { id: number; question: string; answer: string };

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
  const [tab, setTab] = useState<"schedule" | "clients" | "faqs">("schedule");

  // Schedule state
  const [date, setDate] = useState(todayIso());
  const [slots, setSlots] = useState<Slot[]>([]);
  const [week, setWeek] = useState<WeekDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [rangeFrom, setRangeFrom] = useState("00:00");
  const [rangeTo, setRangeTo] = useState("08:30");

  // FAQ state
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [faqDrafts, setFaqDrafts] = useState<Record<number, { question: string; answer: string }>>({});
  const [newFaq, setNewFaq] = useState({ question: "", answer: "" });
  const [faqBusy, setFaqBusy] = useState(false);

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

  const loadFaqs = (k: string) => {
    fetch("/api/admin/faqs", { headers: headers(k) })
      .then((r) => r.json())
      .then((data) => setFaqs(data.faqs || []))
      .catch(() => {});
  };

  // All FAQ changes go through one endpoint; it returns the fresh list.
  const faqAction = async (body: Record<string, unknown>) => {
    setFaqBusy(true);
    try {
      const res = await fetch("/api/admin/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers(key || "testing") },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.faqs) setFaqs(data.faqs);
    } finally {
      setFaqBusy(false);
    }
  };

  useEffect(() => {
    // TEMPORARY: login gate disabled for testing — auto-loads regardless of key.
    const k = key || "testing";
    loadDay(date, k);
    loadWeek(k);
    loadClients(k);
    loadFaqs(k);
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
          {(["schedule", "clients", "faqs"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                tab === t ? "bg-ember text-ink" : "text-cream-dim hover:text-cream"
              }`}
            >
              {t === "faqs" ? "FAQs" : t === "schedule" ? "Schedule" : "Clients"}
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

        {tab === "faqs" && (
          <>
            <p className="mt-6 text-xs leading-relaxed text-cream-dim/70">
              These questions appear in the FAQ section of the website. Changes go live
              immediately — no technical steps needed.
            </p>

            <div className="mt-4 rounded-xl border border-ember/25 bg-ember/5 p-4">
              <p className="text-sm font-semibold text-cream">Add a new question</p>
              <input
                value={newFaq.question}
                onChange={(e) => setNewFaq((f) => ({ ...f, question: e.target.value }))}
                placeholder="Type the question here…"
                className="mt-3 w-full rounded-lg border border-cream/15 bg-ink px-4 py-3 text-sm text-cream placeholder:text-cream-dim/40 focus:border-ember focus:outline-none"
              />
              <textarea
                value={newFaq.answer}
                onChange={(e) => setNewFaq((f) => ({ ...f, answer: e.target.value }))}
                placeholder="Type the answer here…"
                rows={3}
                className="mt-2 w-full resize-none rounded-lg border border-cream/15 bg-ink px-4 py-3 text-sm text-cream placeholder:text-cream-dim/40 focus:border-ember focus:outline-none"
              />
              <button
                onClick={async () => {
                  await faqAction({ action: "add", ...newFaq });
                  setNewFaq({ question: "", answer: "" });
                }}
                disabled={faqBusy || !newFaq.question.trim() || !newFaq.answer.trim()}
                className="mt-3 rounded-full bg-ember px-6 py-2.5 text-sm font-semibold text-ink disabled:opacity-40"
              >
                Add to website
              </button>
            </div>

            <div className="mt-5 flex flex-col gap-3">
              {faqs.map((f, i) => {
                const draft = faqDrafts[f.id];
                const changed =
                  draft && (draft.question !== f.question || draft.answer !== f.answer);
                return (
                  <div key={f.id} className="rounded-xl border border-cream/10 bg-ink-soft p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => faqAction({ action: "move", id: f.id, dir: "up" })}
                          disabled={faqBusy || i === 0}
                          aria-label="Move up"
                          className="rounded-md border border-cream/10 px-2 py-0.5 text-xs text-cream-dim hover:text-cream disabled:opacity-20"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => faqAction({ action: "move", id: f.id, dir: "down" })}
                          disabled={faqBusy || i === faqs.length - 1}
                          aria-label="Move down"
                          className="rounded-md border border-cream/10 px-2 py-0.5 text-xs text-cream-dim hover:text-cream disabled:opacity-20"
                        >
                          ↓
                        </button>
                      </div>
                      <div className="min-w-0 flex-1">
                        <input
                          value={draft?.question ?? f.question}
                          onChange={(e) =>
                            setFaqDrafts((d) => ({
                              ...d,
                              [f.id]: {
                                question: e.target.value,
                                answer: d[f.id]?.answer ?? f.answer,
                              },
                            }))
                          }
                          className="w-full rounded-lg border border-cream/10 bg-ink px-3 py-2 text-sm font-semibold text-cream focus:border-ember focus:outline-none"
                        />
                        <textarea
                          value={draft?.answer ?? f.answer}
                          onChange={(e) =>
                            setFaqDrafts((d) => ({
                              ...d,
                              [f.id]: {
                                question: d[f.id]?.question ?? f.question,
                                answer: e.target.value,
                              },
                            }))
                          }
                          rows={3}
                          className="mt-2 w-full resize-none rounded-lg border border-cream/10 bg-ink px-3 py-2 text-sm text-cream-dim focus:border-ember focus:outline-none"
                        />
                        <div className="mt-2 flex items-center gap-3">
                          {changed && (
                            <button
                              onClick={async () => {
                                await faqAction({ action: "update", id: f.id, ...draft });
                                setFaqDrafts((d) => {
                                  const next = { ...d };
                                  delete next[f.id];
                                  return next;
                                });
                              }}
                              disabled={faqBusy}
                              className="rounded-full bg-ember px-5 py-1.5 text-xs font-semibold text-ink disabled:opacity-50"
                            >
                              Save changes
                            </button>
                          )}
                          <button
                            onClick={() => {
                              if (window.confirm("Remove this question from the website?")) {
                                faqAction({ action: "delete", id: f.id });
                              }
                            }}
                            disabled={faqBusy}
                            className="text-xs font-semibold text-red-400 underline disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {faqs.length === 0 && (
                <p className="text-sm text-cream-dim">
                  No questions yet — add the first one above and it appears on the site instantly.
                </p>
              )}
            </div>
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
