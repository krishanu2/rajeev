import { useEffect, useState } from "react";

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarsePointer = window.matchMedia("(pointer: coarse)");
    const update = () => setReduced(query.matches || coarsePointer.matches);
    update();
    query.addEventListener("change", update);
    coarsePointer.addEventListener("change", update);
    return () => {
      query.removeEventListener("change", update);
      coarsePointer.removeEventListener("change", update);
    };
  }, []);

  return reduced;
}
