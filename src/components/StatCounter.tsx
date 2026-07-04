import { useCountUp } from "../hooks/useCountUp";

export default function StatCounter({ value, className }: { value: string; className?: string }) {
  const match = value.match(/^(\d+)(.*)$/);
  const numeric = match ? parseInt(match[1], 10) : null;
  const suffix = match ? match[2] : "";
  const { ref, value: animated } = useCountUp(numeric ?? 0);

  if (numeric === null) {
    return <span className={className}>{value}</span>;
  }

  return (
    <span ref={ref} className={className}>
      {animated}
      {suffix}
    </span>
  );
}
