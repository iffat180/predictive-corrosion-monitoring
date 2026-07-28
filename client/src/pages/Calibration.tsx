import { useEffect, useState } from "react";
import { fetchCalibration, type Calibration } from "../lib/api";
import { StatTile } from "../components/StatTile";

const VERDICT_COPY: Record<Calibration["verdict"], { label: string; toneClass: string; explanation: string }> = {
  TOO_AGGRESSIVE: {
    label: "Simulation Too Aggressive",
    toneClass: "text-risk-critical",
    explanation:
      "Our simulated fleet reaches CRITICAL far faster than real pipelines fail from corrosion. The demo data favors visible, readable dashboards over realistic timelines.",
  },
  REALISTIC: {
    label: "Simulation Realistic",
    toneClass: "text-risk-low",
    explanation:
      "Our simulated corrosion timelines are roughly in line with real-world PHMSA incident data.",
  },
  TOO_CONSERVATIVE: {
    label: "Simulation Too Conservative",
    toneClass: "text-risk-medium",
    explanation:
      "Our simulated fleet takes far longer to reach CRITICAL than real pipelines typically do before failing from corrosion.",
  },
};

export function Calibration() {
  const [data, setData] = useState<Calibration | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCalibration()
      .then(setData)
      .catch(() => setError("Could not load calibration data."));
  }, []);

  if (error) {
    return <div className="text-risk-critical">{error}</div>;
  }

  if (!data) {
    return (
      <div className="uppercase tracking-wider text-[11px] text-text-dim font-semibold">
        Loading calibration data...
      </div>
    );
  }

  const verdict = VERDICT_COPY[data.verdict];

  return (
    <div>
      <h1 className="text-xl font-semibold text-text-h mb-1">PHMSA Calibration</h1>
      <div className="text-text-dim text-[13px] mb-6">
        Comparing our simulated fleet's corrosion timelines against real-world PHMSA hazardous
        liquid pipeline incident data.
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <StatTile
          label="Real-World Median Years to Corrosion Failure"
          value={data.realWorldMedianYears.toFixed(1)}
        />
        <StatTile
          label="Simulated Median Years to Critical"
          value={data.simulatedMedianYears.toFixed(2)}
        />
        <StatTile label="Real-World Sample Size" value={String(data.realWorldSampleSize)} />
        <StatTile label="Simulated Fleet Size" value={String(data.simulatedSampleSize)} />
      </div>

      <div className="bg-panel border border-border p-4">
        <div className={`uppercase tracking-wider text-[11px] font-bold mb-2 ${verdict.toneClass}`}>
          {verdict.label}
        </div>
        <div className="text-text-h text-[13px]">{verdict.explanation}</div>
      </div>

      <div className="text-text-dim text-[11px] mt-4">
        Source: PHMSA Pipeline Safety Flagged Incidents (Hazardous Liquid, 2010-present),
        corrosion-caused incidents only.
      </div>
    </div>
  );
}
