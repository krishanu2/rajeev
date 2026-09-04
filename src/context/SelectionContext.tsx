import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

interface SelectionState {
  selectedId: string | null;
  selectedLabel: string | null;
  select: (id: string, label: string) => void;
  // Who referred this visitor, if they arrived via an affiliate link — set
  // once on landing, read by Nav to show a welcome strip. Lives here (not
  // component state) so it's available without prop-drilling.
  referrerName: string | null;
  dismissReferrer: () => void;
}

const SelectionContext = createContext<SelectionState | null>(null);

export function SelectionProvider({ children }: { children: ReactNode }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [referrerName, setReferrerName] = useState<string | null>(null);

  const select = (id: string, label: string) => {
    setSelectedId(id);
    setSelectedLabel(label);
  };

  // Catches an affiliate link like fitwithrajeev.com/?ref=ARPITA4F2 on
  // first load. Saved to localStorage (not just the URL) so the referral
  // survives even if the visitor books days later on a return visit — the
  // code rides along automatically whenever BookingWidget submits. The
  // same click-tracking call also hands back the affiliate's name, which
  // is what powers the "Arpita sent you here" welcome strip in Nav — no
  // second request needed. Then the ?ref= is stripped from the visible
  // address bar so it doesn't linger in a bookmark or a screenshot.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref && /^[A-Za-z0-9]{2,14}$/.test(ref)) {
      const code = ref.toUpperCase();
      localStorage.setItem("fwr_ref", code);
      params.delete("ref");
      const clean =
        window.location.pathname +
        (params.toString() ? `?${params.toString()}` : "") +
        window.location.hash;
      window.history.replaceState({}, "", clean);

      fetch("/api/track-click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.name) setReferrerName(data.name);
        })
        .catch(() => {});
    }
  }, []);

  return (
    <SelectionContext.Provider
      value={{
        selectedId,
        selectedLabel,
        select,
        referrerName,
        dismissReferrer: () => setReferrerName(null),
      }}
    >
      {children}
    </SelectionContext.Provider>
  );
}

export function useSelection() {
  const ctx = useContext(SelectionContext);
  if (!ctx) throw new Error("useSelection must be used within SelectionProvider");
  return ctx;
}
