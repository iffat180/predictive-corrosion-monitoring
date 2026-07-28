import { useEffect, useState } from "react";
import { fetchCalibration, type Calibration } from "../lib/api";
import { StatTile } from "../components/StatTile";
import { useInView } from "../hooks/useInView";

const VERDICT_COPY: Record<
  Calibration["verdict"],
  { label: string; toneClass: string; barClass: string; explanation: string }
> = {
  TOO_AGGRESSIVE: {
    label: "Simulation Too Aggressive",
    toneClass: "text-risk-critical",
    barClass: "bg-risk-critical",
    explanation:
      "Our simulated fleet reaches CRITICAL far faster than real pipelines fail from corrosion. The demo data favors visible, readable dashboards over realistic timelines.",
  },
  REALISTIC: {
    label: "Simulation Realistic",
    toneClass: "text-risk-low",
    barClass: "bg-risk-low",
    explanation:
      "Our simulated corrosion timelines are roughly in line with real-world PHMSA incident data.",
  },
  TOO_CONSERVATIVE: {
    label: "Simulation Too Conservative",
    toneClass: "text-risk-medium",
    barClass: "bg-risk-medium",
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
      <div className="mb-7 pb-5 border-b border-border">
        <h1 className="text-2xl font-bold text-text-h tracking-tight">PHMSA Calibration</h1>
        <div className="text-text-dim text-[13px] mt-1">
          Comparing our simulated fleet's corrosion timelines against real-world PHMSA hazardous
          liquid pipeline incident data.
        </div>
      </div>

      <ComparisonBars
        realWorldYears={data.realWorldMedianYears}
        simulatedYears={data.simulatedMedianYears}
        barClass={verdict.barClass}
      />

      <div className="grid grid-cols-2 gap-4 my-6">
        <StatTile label="Real-World Sample Size" value={String(data.realWorldSampleSize)} />
        <StatTile label="Simulated Fleet Size" value={String(data.simulatedSampleSize)} />
      </div>

      <div className="bg-panel border border-border-strong p-5">
        <div className={`flex items-center gap-2 uppercase tracking-wider text-[11px] font-bold mb-2 ${verdict.toneClass}`}>
          <VerdictIcon verdict={data.verdict} />
          {verdict.label}
        </div>
        <div className="text-text-h text-[13px] leading-relaxed">{verdict.explanation}</div>
      </div>

      <div className="text-text-dim text-[11px] mt-4">
        Source: PHMSA Pipeline Safety Flagged Incidents (Hazardous Liquid, 2010-present),
        corrosion-caused incidents only.
      </div>
    </div>
  );
}

function ComparisonBars({
  realWorldYears,
  simulatedYears,
  barClass,
}: {
  realWorldYears: number;
  simulatedYears: number;
  barClass: string;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const max = Math.max(realWorldYears, simulatedYears);

  return (
    <div ref={ref} className="bg-panel border border-border p-6">
      <div className="uppercase tracking-wider text-[10px] text-text-dim font-semibold mb-5">
        Median Years to Corrosion Failure
      </div>

      <ComparisonBar
        label="Real PHMSA Incidents"
        years={realWorldYears}
        pct={(realWorldYears / max) * 100}
        inView={inView}
        toneClass="bg-accent"
        delayMs={0}
      />
      <ComparisonBar
        label="Simulated Fleet"
        years={simulatedYears}
        pct={(simulatedYears / max) * 100}
        inView={inView}
        toneClass={barClass}
        delayMs={200}
      />
    </div>
  );
}

function ComparisonBar({
  label,
  years,
  pct,
  inView,
  toneClass,
  delayMs,
}: {
  label: string;
  years: number;
  pct: number;
  inView: boolean;
  toneClass: string;
  delayMs: number;
}) {
  return (
    <div className="mb-5 last:mb-0">
      <div className="flex items-baseline justify-between mb-1.5">
        <div className="text-text text-[13px] font-medium">{label}</div>
        <div className="font-mono text-text-h text-sm tabular-nums">
          {years < 1 ? `${(years * 12).toFixed(1)} mo` : `${years.toFixed(1)} yrs`}
        </div>
      </div>
      <div className="h-3 w-full bg-panel-raised overflow-hidden">
        <div
          className={`h-full ${toneClass} transition-[width] duration-1000 ease-out`}
          style={{ width: inView ? `${Math.max(pct, 1.5)}%` : "0%", transitionDelay: `${delayMs}ms` }}
        />
      </div>
    </div>
  );
}

function VerdictIcon({ verdict }: { verdict: Calibration["verdict"] }) {
  if (verdict === "TOO_AGGRESSIVE") {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M12 9v4M12 17h.01M10.3 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L14.7 3.86a2 2 0 00-3.4 0z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (verdict === "REALISTIC") {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
    </svg>
  );
}
