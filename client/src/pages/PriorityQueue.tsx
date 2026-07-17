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
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-text-h">Priority Queue</h1>
        <div className="uppercase tracking-wider text-[11px] text-text-dim font-semibold">
          {assets.length} assets need attention
        </div>
      </div>

      {assets.length === 0 && (
        <div className="text-text-dim text-sm">Nothing urgent right now.</div>
      )}

      <div className="flex flex-col gap-2">
        {assets.map((asset) => (
          <Link
            key={asset.id}
            to={`/assets/${asset.id}`}
            className={`flex items-center justify-between bg-panel border border-border border-l-4 ${BORDER_COLOR[asset.riskLevel]} px-4 py-3 no-underline`}
          >
            <div>
              <div className="text-text-h text-sm font-semibold">{asset.name}</div>
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
