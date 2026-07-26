export function StatTile({
  label,
  value,
  toneClass,
}: {
  label: string;
  value: string;
  toneClass?: string;
}) {
  return (
    <div className="bg-panel border border-border p-4">
      <div className="uppercase tracking-wider text-[10px] text-text-dim font-semibold mb-2">
        {label}
      </div>
      <div className={`font-mono text-2xl tabular-nums ${toneClass ?? "text-text-h"}`}>
        {value}
      </div>
    </div>
  );
}
