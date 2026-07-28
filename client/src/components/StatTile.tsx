const ACCENT_CLASS: Record<string, string> = {
  "text-risk-critical": "bg-risk-critical",
  "text-risk-high": "bg-risk-high",
  "text-risk-medium": "bg-risk-medium",
  "text-risk-low": "bg-risk-low",
};

export function StatTile({
  label,
  value,
  toneClass,
}: {
  label: string;
  value: string;
  toneClass?: string;
}) {
  const accent = toneClass ? ACCENT_CLASS[toneClass] : undefined;

  return (
    <div className="relative bg-panel border border-border p-4 overflow-hidden transition-colors hover:border-border-strong">
      <div className={`absolute top-0 left-0 right-0 h-0.5 ${accent ?? "bg-border-strong"}`} />
      <div className="uppercase tracking-wider text-[10px] text-text-dim font-semibold mb-2">
        {label}
      </div>
      <div className={`font-mono text-2xl tabular-nums ${toneClass ?? "text-text-h"}`}>
        {value}
      </div>
    </div>
  );
}
