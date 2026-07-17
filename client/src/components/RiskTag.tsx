import type { RiskLevel } from "../lib/api";

const RISK_CLASSES: Record<RiskLevel, string> = {
  LOW: "text-risk-low",
  MEDIUM: "text-risk-medium",
  HIGH: "text-risk-high",
  CRITICAL: "text-risk-critical",
};

const RISK_BG: Record<RiskLevel, string> = {
  LOW: "bg-risk-low",
  MEDIUM: "bg-risk-medium",
  HIGH: "bg-risk-high",
  CRITICAL: "bg-risk-critical",
};

export function RiskTag({ level }: { level: RiskLevel }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wider ${RISK_CLASSES[level]}`}>
      <span className={`w-2 h-2 inline-block ${RISK_BG[level]}`} />
      {level}
    </span>
  );
}
