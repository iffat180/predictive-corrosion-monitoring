import type { RiskLevel } from "../lib/api";

const RISK_CLASSES: Record<RiskLevel, string> = {
  LOW: "text-risk-low border-risk-low/30 bg-risk-low/10",
  MEDIUM: "text-risk-medium border-risk-medium/30 bg-risk-medium/10",
  HIGH: "text-risk-high border-risk-high/30 bg-risk-high/10",
  CRITICAL: "text-risk-critical border-risk-critical/30 bg-risk-critical/10",
};

const RISK_DOT: Record<RiskLevel, string> = {
  LOW: "bg-risk-low",
  MEDIUM: "bg-risk-medium",
  HIGH: "bg-risk-high",
  CRITICAL: "bg-risk-critical",
};

export function RiskTag({ level }: { level: RiskLevel }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-wider ${RISK_CLASSES[level]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full inline-block ${RISK_DOT[level]} ${level === "CRITICAL" ? "animate-pulse" : ""}`} />
      {level}
    </span>
  );
}
