import { useCountUp } from "../hooks/useCountUp";

export default function CountingStat({
  value,
  prefix = "",
  suffix = "",
  className,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const decimals = Number.isInteger(value) ? 0 : 1;
  const { ref, value: animated } = useCountUp(value, 1200, decimals);

  return (
    <span ref={ref} className={`font-data tabular-nums tracking-tight ${className ?? ""}`}>
      {prefix}
      {decimals ? animated.toFixed(1) : animated}
      <span className="text-[0.65em] tracking-normal">{suffix}</span>
    </span>
  );
}
