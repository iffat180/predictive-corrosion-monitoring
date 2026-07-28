import type { RiskLevel } from "../lib/api";

const ORDER: RiskLevel[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];

const SEGMENT_CLASS: Record<RiskLevel, string> = {
  LOW: "bg-risk-low",
  MEDIUM: "bg-risk-medium",
  HIGH: "bg-risk-high",
  CRITICAL: "bg-risk-critical",
};

const TEXT_CLASS: Record<RiskLevel, string> = {
  LOW: "text-risk-low",
  MEDIUM: "text-risk-medium",
  HIGH: "text-risk-high",
  CRITICAL: "text-risk-critical",
};

export function RiskDistributionBar({ counts }: { counts: Record<RiskLevel, number> }) {
  const total = counts.LOW + counts.MEDIUM + counts.HIGH + counts.CRITICAL;

  return (
    <div>
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-panel-raised">
        {ORDER.map((level) => {
          const pct = total === 0 ? 0 : (counts[level] / total) * 100;
          if (pct === 0) return null;
          return (
            <div
              key={level}
              className={`${SEGMENT_CLASS[level]} transition-[width] duration-700 ease-out`}
              style={{ width: `${pct}%` }}
              title={`${level}: ${counts[level]}`}
            />
          );
        })}
      </div>
      <div className="flex gap-5 mt-3">
        {ORDER.map((level) => (
          <div key={level} className="flex items-center gap-1.5 text-[11px]">
            <span className={`w-2 h-2 rounded-full inline-block ${SEGMENT_CLASS[level]}`} />
            <span className={`font-semibold ${TEXT_CLASS[level]}`}>{level}</span>
            <span className="text-text-dim font-mono">{counts[level]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
