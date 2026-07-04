import { useEffect, useState } from "react";

// Unlike useReducedMotion (which also treats touch devices as "reduced" for
// heavy GPU work like the 3D scene), this checks only the actual OS setting —
// for lightweight things like the intro overlay that should still play on phones.
export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return reduced;
}
