import { useEffect, useState } from "react";

type Stats = { openThisWeek: number; bookedThisMonth: number };

// Real numbers from the database, not manufactured urgency. Scarcity only
// gets shown when it's genuinely scarce (a high open-slot count would just
// read as noise, not urgency) — the social-proof line shows whenever
// there's something real to say.
const SCARCITY_THRESHOLD = 12;

export default function LiveStats() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data) => {
        if (typeof data.openThisWeek === "number") setStats(data);
      })
      .catch(() => {});
  }, []);

  if (!stats) return null;

  const showScarcity = stats.openThisWeek > 0 && stats.openThisWeek <= SCARCITY_THRESHOLD;
  const showSocialProof = stats.bookedThisMonth > 0;
  if (!showScarcity && !showSocialProof) return null;

  return (
    <p className="mt-4 text-xs text-cream-dim/70">
      {showScarcity && (
        <span className="text-ember-light">
          🔥 Only {stats.openThisWeek} slot{stats.openThisWeek === 1 ? "" : "s"} left this week
        </span>
      )}
      {showScarcity && showSocialProof && <span className="mx-2 text-cream-dim/30">·</span>}
      {showSocialProof && (
        <span>
          {stats.bookedThisMonth} call{stats.bookedThisMonth === 1 ? "" : "s"} booked this month
        </span>
      )}
    </p>
  );
}
