import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

interface SelectionState {
  selectedId: string | null;
  selectedLabel: string | null;
  select: (id: string, label: string) => void;
}

const SelectionContext = createContext<SelectionState | null>(null);

export function SelectionProvider({ children }: { children: ReactNode }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);

  const select = (id: string, label: string) => {
    setSelectedId(id);
    setSelectedLabel(label);
  };

  return (
    <SelectionContext.Provider value={{ selectedId, selectedLabel, select }}>
      {children}
    </SelectionContext.Provider>
  );
}

export function useSelection() {
  const ctx = useContext(SelectionContext);
  if (!ctx) throw new Error("useSelection must be used within SelectionProvider");
  return ctx;
}
