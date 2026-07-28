import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchAssets, type AssetSummary } from "../lib/api";
import { RiskTag } from "../components/RiskTag";

const BORDER_COLOR = {
  LOW: "border-l-risk-low",
  MEDIUM: "border-l-risk-medium",
  HIGH: "border-l-risk-high",
  CRITICAL: "border-l-risk-critical",
};

const RANK_BG = {
  LOW: "bg-risk-low/15 text-risk-low",
  MEDIUM: "bg-risk-medium/15 text-risk-medium",
  HIGH: "bg-risk-high/15 text-risk-high",
  CRITICAL: "bg-risk-critical/15 text-risk-critical",
};

export function PriorityQueue() {
  const [assets, setAssets] = useState<AssetSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAssets()
      .then((data) => {
        const urgent = data
          .filter((a) => a.riskLevel === "HIGH" || a.riskLevel === "CRITICAL")
          .sort((a, b) => (a.daysRemaining ?? Infinity) - (b.daysRemaining ?? Infinity));
        setAssets(urgent);
      })
      .catch(() => setError("Could not reach the API. Is the server running?"));
  }, []);

  if (error) {
    return <div className="text-risk-critical">{error}</div>;
  }

  if (!assets) {
    return (
      <div className="uppercase tracking-wider text-[11px] text-text-dim font-semibold">
        Loading priority queue...
      </div>
    );
  }

  return (
    <div>
      <div className="mb-7 pb-5 border-b border-border">
        <h1 className="text-2xl font-bold text-text-h tracking-tight">Priority Queue</h1>
        <div className="text-text-dim text-[13px] mt-1">
          {assets.length} assets need attention &middot; ranked by urgency
        </div>
      </div>

      {assets.length === 0 && (
        <div className="text-text-dim text-sm">Nothing urgent right now.</div>
      )}

      <div className="flex flex-col gap-2.5">
        {assets.map((asset, i) => (
          <Link
            key={asset.id}
            to={`/app/assets/${asset.id}`}
            className={`group flex items-center gap-4 bg-panel border border-border border-l-4 ${BORDER_COLOR[asset.riskLevel]} px-4 py-3.5 no-underline transition-all hover:border-border-strong hover:-translate-y-0.5 hover:shadow-[0_4px_20px_-8px_rgba(0,0,0,0.6)]`}
          >
            <div
              className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-mono text-[12px] font-bold ${RANK_BG[asset.riskLevel]}`}
            >
              {i + 1}
            </div>

            <div className="flex-1">
              <div className="text-text-h text-sm font-semibold group-hover:text-accent transition-colors">
                {asset.name}
              </div>
              <div className="font-mono text-text-dim text-xs mt-0.5">
                {asset.latestThickness?.toFixed(2) ?? "—"} mm &middot;{" "}
                {asset.corrosionRate?.toFixed(4) ?? "—"} mm/day
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="uppercase text-[10px] text-text-dim tracking-wider">Days Left</div>
                <div className="font-mono text-text-h text-sm">
                  {asset.daysRemaining !== null ? Math.round(asset.daysRemaining) : "—"}
                </div>
              </div>
              <RiskTag level={asset.riskLevel} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
