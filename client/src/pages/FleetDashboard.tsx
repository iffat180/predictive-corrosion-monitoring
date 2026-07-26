import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchAssets, type AssetSummary, type RiskLevel } from "../lib/api";
import { RiskTag } from "../components/RiskTag";
import { StatTile } from "../components/StatTile";
import { RiskDistributionBar } from "../components/RiskDistributionBar";

type SortField = "daysRemaining" | "corrosionRate" | "name";

const RISK_FILTERS: (RiskLevel | "ALL")[] = ["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"];

export function FleetDashboard() {
  const [assets, setAssets] = useState<AssetSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [riskFilter, setRiskFilter] = useState<RiskLevel | "ALL">("ALL");
  const [sortBy, setSortBy] = useState<SortField>("daysRemaining");

  useEffect(() => {
    fetchAssets()
      .then(setAssets)
      .catch(() => setError("Could not reach the API. Is the server running?"));
  }, []);

  const counts = useMemo(() => {
    const base: Record<RiskLevel, number> = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
    if (!assets) return base;
    for (const asset of assets) {
      base[asset.riskLevel]++;
    }
    return base;
  }, [assets]);

  const avgDaysRemaining = useMemo(() => {
    if (!assets) return null;
    const withForecast = assets.filter((a) => a.daysRemaining !== null);
    if (withForecast.length === 0) return null;
    const total = withForecast.reduce((sum, a) => sum + (a.daysRemaining ?? 0), 0);
    return Math.round(total / withForecast.length);
  }, [assets]);

  const visibleAssets = useMemo(() => {
    if (!assets) return [];
    let filtered = assets;
    if (riskFilter !== "ALL") {
      filtered = filtered.filter((a) => a.riskLevel === riskFilter);
    }
    return [...filtered].sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      const aVal = a[sortBy] ?? Infinity;
      const bVal = b[sortBy] ?? Infinity;
      return Number(aVal) - Number(bVal);
    });
  }, [assets, riskFilter, sortBy]);

  if (error) {
    return <div className="text-risk-critical">{error}</div>;
  }

  if (!assets) {
    return <FleetDashboardSkeleton />;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-text-h">Fleet Overview</h1>
        <div className="uppercase tracking-wider text-[11px] text-text-dim font-semibold">
          {assets.length} assets tracked
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatTile label="Total Assets" value={String(assets.length)} />
        <StatTile label="Critical" value={String(counts.CRITICAL)} toneClass="text-risk-critical" />
        <StatTile label="High Risk" value={String(counts.HIGH)} toneClass="text-risk-high" />
        <StatTile
          label="Avg Days Remaining"
          value={avgDaysRemaining === null ? "—" : String(avgDaysRemaining)}
        />
      </div>

      <div className="bg-panel border border-border p-4 mb-6">
        <div className="uppercase tracking-wider text-[10px] text-text-dim font-semibold mb-3">
          Fleet Risk Distribution
        </div>
        <RiskDistributionBar counts={counts} />
      </div>

      <div className="flex items-center justify-between mb-3">
        <div className="flex gap-1">
          {RISK_FILTERS.map((level) => (
            <button
              key={level}
              onClick={() => setRiskFilter(level)}
              className={`px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide border ${
                riskFilter === level
                  ? "bg-panel-raised border-border-strong text-text-h"
                  : "border-transparent text-text-dim hover:text-text"
              }`}
            >
              {level}
            </button>
          ))}
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortField)}
          className="bg-panel border border-border text-text-dim text-[11px] uppercase tracking-wide px-2 py-1.5"
        >
          <option value="daysRemaining">Sort: Urgency</option>
          <option value="corrosionRate">Sort: Corrosion Rate</option>
          <option value="name">Sort: Name</option>
        </select>
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
          {visibleAssets.map((asset) => (
            <tr key={asset.id} className="border-b border-border hover:bg-panel">
              <td className="py-2.5 px-3 text-[13px]">
                <Link to={`/assets/${asset.id}`} className="text-text-h no-underline">
                  {asset.name}
                </Link>
              </td>
              <td className="py-2.5 px-3 text-[13px] font-mono tabular-nums text-text">
                {asset.latestThickness?.toFixed(2) ?? "—"} mm
              </td>
              <td className="py-2.5 px-3 text-[13px] font-mono tabular-nums text-text">
                {asset.corrosionRate?.toFixed(4) ?? "—"} mm/day
              </td>
              <td className="py-2.5 px-3 text-[13px] font-mono tabular-nums text-text">
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

function FleetDashboardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-6 w-40 bg-panel mb-2" />
      <div className="h-3 w-24 bg-panel mb-6" />
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-panel border border-border" />
        ))}
      </div>
      <div className="h-24 bg-panel border border-border mb-6" />
      <div className="h-8 bg-panel mb-3" />
      {[...Array(8)].map((_, i) => (
        <div key={i} className="h-10 bg-panel border-b border-border" />
      ))}
    </div>
  );
}

const headClass = "text-left py-2 px-3 text-[11px] tracking-wider uppercase text-text-dim";
