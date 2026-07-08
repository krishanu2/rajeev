import type { ReactNode } from "react";

export type BeatTone = "confrontation" | "recognition" | "human" | "evidence" | "invitation";

const overlay: Record<BeatTone, ReactNode> = {
  confrontation: (
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(0,0,0,0.45),transparent_70%)]" />
  ),
  recognition: (
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_50%_at_50%_50%,transparent,rgba(0,0,0,0.4)_100%)]" />
  ),
  human: (
    <>
      <div className="absolute inset-0 bg-gradient-to-b from-[#3a2414]/20 via-transparent to-[#3a2414]/15" />
      <div className="grain-local opacity-[0.05]" />
    </>
  ),
  evidence: (
    <>
      <div className="absolute inset-0 bg-gradient-to-b from-[#0b1a20]/55 via-[#0b1a20]/15 to-transparent" />
      <div className="lab-grid" />
    </>
  ),
  invitation: (
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_55%_at_50%_100%,rgba(253,230,138,0.14),transparent_70%)]" />
  ),
};

export default function Beat({
  id,
  tone,
  children,
}: {
  id: string;
  tone: BeatTone;
  children: ReactNode;
}) {
  return (
    <div id={`beat-${id}`} data-beat={tone} className="relative">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">{overlay[tone]}</div>
      <div className="relative">{children}</div>
    </div>
  );
}
