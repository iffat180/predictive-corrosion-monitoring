import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fetchAsset, fetchReadings, type AssetSummary, type Reading } from "../lib/api";
import { RiskTag } from "../components/RiskTag";

export function AssetDetail() {
  const { id } = useParams();
  const [asset, setAsset] = useState<AssetSummary | null>(null);
  const [readings, setReadings] = useState<Reading[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const assetId = Number(id);

    Promise.all([fetchAsset(assetId), fetchReadings(assetId)])
      .then(([assetData, readingsData]) => {
        setAsset(assetData);
        setReadings(readingsData);
      })
      .catch(() => setError("Could not load this asset."));
  }, [id]);

  if (error) {
    return <div className="text-risk-critical">{error}</div>;
  }

  if (!asset || !readings) {
    return (
      <div className="uppercase tracking-wider text-[11px] text-text-dim font-semibold">
        Loading asset...
      </div>
    );
  }

  const chartData = readings.map((r) => ({
    date: new Date(r.recordedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    thickness: Number(r.thickness),
  }));

  return (
    <div>
      <Link to="/" className="text-[11px] text-text-dim uppercase tracking-wider">
        &larr; Back to fleet
      </Link>

      <div className="flex items-center justify-between mt-3 mb-6">
        <h1 className="text-xl font-semibold text-text-h">{asset.name}</h1>
        <RiskTag level={asset.riskLevel} />
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <Stat label="Latest Thickness" value={`${asset.latestThickness?.toFixed(2) ?? "—"} mm`} />
        <Stat label="Corrosion Rate" value={`${asset.corrosionRate?.toFixed(4) ?? "—"} mm/day`} />
        <Stat
          label="Days Remaining"
          value={asset.daysRemaining !== null ? String(Math.round(asset.daysRemaining)) : "—"}
        />
        <Stat label="Min Safe Thickness" value={`${asset.minSafeThickness?.toFixed(2) ?? "—"} mm`} />
      </div>

      <div className="uppercase tracking-wider text-[11px] text-text-dim font-semibold mb-3">
        Wall Thickness Over Time
      </div>
      <div className="h-80 bg-panel border border-border p-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />
            <XAxis dataKey="date" stroke="var(--color-text-dim)" fontSize={11} />
            <YAxis stroke="var(--color-text-dim)" fontSize={11} domain={["auto", "auto"]} />
            <Tooltip
              contentStyle={{ background: "var(--color-panel-raised)", border: "1px solid var(--color-border-strong)" }}
              labelStyle={{ color: "var(--color-text-h)" }}
            />
            {asset.minSafeThickness !== undefined && (
              <ReferenceLine
                y={asset.minSafeThickness}
                stroke="var(--color-risk-critical)"
                strokeDasharray="4 4"
                label={{ value: "Min Safe", position: "insideTopLeft", fill: "var(--color-risk-critical)", fontSize: 11 }}
              />
            )}
            <Line type="monotone" dataKey="thickness" stroke="var(--color-accent)" dot={false} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-panel border border-border p-3">
      <div className="uppercase tracking-wider text-[10px] text-text-dim font-semibold mb-1">{label}</div>
      <div className="font-mono text-text-h text-base">{value}</div>
    </div>
  );
}
