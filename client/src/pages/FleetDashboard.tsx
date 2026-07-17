import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchAssets, type AssetSummary } from "../lib/api";
import { RiskTag } from "../components/RiskTag";

export function FleetDashboard() {
  const [assets, setAssets] = useState<AssetSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAssets()
      .then((data) => {
        const sorted = [...data].sort((a, b) => {
          const aVal = a.daysRemaining ?? Infinity;
          const bVal = b.daysRemaining ?? Infinity;
          return aVal - bVal;
        });
        setAssets(sorted);
      })
      .catch(() => setError("Could not reach the API. Is the server running?"));
  }, []);

  if (error) {
    return <div className="text-risk-critical">{error}</div>;
  }

  if (!assets) {
    return <div className="uppercase tracking-wider text-[11px] text-text-dim font-semibold">Loading fleet data...</div>;
  }

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-text-h">Fleet Overview</h1>
        <div className="uppercase tracking-wider text-[11px] text-text-dim font-semibold">
          {assets.length} assets tracked, sorted by urgency
        </div>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border-strong">
            <th className={headClass}>Asset</th>
            <th className={headClass}>Thickness</th>
            <th className={headClass}>Corrosion Rate</th>
            <th className={headClass}>Days Remaining</th>
            <th className={headClass}>Risk</th>
          </tr>
        </thead>
        <tbody>
          {assets.map((asset) => (
            <tr key={asset.id} className="border-b border-border">
              <td className="py-2.5 px-3 text-[13px]">
                <Link to={`/assets/${asset.id}`} className="text-text-h no-underline">
                  {asset.name}
                </Link>
              </td>
              <td className="py-2.5 px-3 text-[13px] font-mono text-text">
                {asset.latestThickness?.toFixed(2) ?? "—"} mm
              </td>
              <td className="py-2.5 px-3 text-[13px] font-mono text-text">
                {asset.corrosionRate !== null ? `${asset.corrosionRate.toFixed(4)} mm/day` : "—"}
              </td>
              <td className="py-2.5 px-3 text-[13px] font-mono text-text">
                {asset.daysRemaining !== null ? Math.round(asset.daysRemaining) : "—"}
              </td>
              <td className="py-2.5 px-3 text-[13px]">
                <RiskTag level={asset.riskLevel} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const headClass = "text-left py-2 px-3 text-[11px] tracking-wider uppercase text-text-dim";
