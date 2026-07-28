import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchAssets, fetchCalibration, type AssetSummary, type Calibration, type RiskLevel } from "../lib/api";
import { RiskDistributionBar } from "../components/RiskDistributionBar";
import { useInView } from "../hooks/useInView";
import { useCountUp } from "../hooks/useCountUp";

const GITHUB_URL = "https://github.com/iffat180/predictive-corrosion-monitoring";

export function Landing() {
  const [assets, setAssets] = useState<AssetSummary[] | null>(null);
  const [calibration, setCalibration] = useState<Calibration | null>(null);

  useEffect(() => {
    fetchAssets().then(setAssets).catch(() => setAssets([]));
    fetchCalibration().then(setCalibration).catch(() => setCalibration(null));
  }, []);

  const counts = useMemo(() => {
    const base: Record<RiskLevel, number> = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
    if (!assets) return base;
    for (const a of assets) base[a.riskLevel]++;
    return base;
  }, [assets]);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <Hero assets={assets} counts={counts} />
      <StatStrip assets={assets} calibration={calibration} />
      <Features />
      <CalibrationCallout calibration={calibration} />
      <SiteFooter />
    </div>
  );
}

function SiteHeader() {
  return (
    <header className="max-w-6xl mx-auto px-6 md:px-10 py-6 flex items-center justify-between">
      <div>
        <div className="font-bold text-text-h text-sm tracking-wide">FLEET INTEGRITY</div>
        <div className="uppercase tracking-wider text-[10px] text-text-dim font-semibold mt-0.5">
          Predictive Corrosion Monitoring
        </div>
      </div>
      <a
        href={GITHUB_URL}
        target="_blank"
        rel="noreferrer"
        className="text-[12px] text-text-dim hover:text-text-h transition-colors no-underline uppercase tracking-wider font-semibold"
      >
        View Source &rarr;
      </a>
    </header>
  );
}

function Hero({ assets, counts }: { assets: AssetSummary[] | null; counts: Record<RiskLevel, number> }) {
  return (
    <section className="max-w-6xl mx-auto px-6 md:px-10 pt-10 pb-20 grid md:grid-cols-2 gap-12 items-center">
      <div>
        <div className="inline-block uppercase tracking-wider text-[11px] font-semibold text-accent border border-accent-dim bg-accent/10 px-3 py-1 mb-5">
          Live Fleet Simulation
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-text-h leading-tight mb-5">
          Know which tank fails
          <br />
          before it does.
        </h1>
        <p className="text-text text-[15px] leading-relaxed mb-8 max-w-md">
          A predictive monitoring platform that forecasts pipeline and tank corrosion from
          real regression math, validates AI maintenance recommendations against a strict
          schema, and calibrates its own assumptions against real PHMSA incident data.
        </p>
        <div className="flex gap-3">
          <Link
            to="/app"
            className="bg-accent text-bg font-semibold text-[13px] uppercase tracking-wide px-5 py-3 no-underline hover:bg-accent-dim transition-colors"
          >
            Open Dashboard
          </Link>
          <Link
            to="/app/calibration"
            className="border border-border-strong text-text-h font-semibold text-[13px] uppercase tracking-wide px-5 py-3 no-underline hover:bg-panel-raised transition-colors"
          >
            See Real-Data Calibration
          </Link>
        </div>
      </div>

      <div className="bg-panel border border-border-strong p-5 shadow-[0_0_60px_-20px_var(--color-accent)]">
        <div className="uppercase tracking-wider text-[10px] text-text-dim font-semibold mb-4">
          Live Fleet Snapshot
        </div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <MiniStat label="Assets Tracked" value={assets?.length ?? 0} />
          <MiniStat label="Critical" value={counts.CRITICAL} toneClass="text-risk-critical" />
        </div>
        <RiskDistributionBar counts={counts} />
      </div>
    </section>
  );
}

function MiniStat({ label, value, toneClass }: { label: string; value: number; toneClass?: string }) {
  const display = useCountUp(value, value > 0);
  return (
    <div className="bg-panel-raised border border-border p-3">
      <div className="uppercase tracking-wider text-[9px] text-text-dim font-semibold mb-1">{label}</div>
      <div className={`font-mono text-xl tabular-nums ${toneClass ?? "text-text-h"}`}>
        {Math.round(display)}
      </div>
    </div>
  );
}

function StatStrip({ assets, calibration }: { assets: AssetSummary[] | null; calibration: Calibration | null }) {
  const { ref, inView } = useInView<HTMLDivElement>();

  const stats = [
    { label: "Assets Monitored", value: assets?.length ?? 0, suffix: "" },
    {
      label: "Real Incidents Analyzed",
      value: calibration?.realWorldSampleSize ?? 0,
      suffix: "",
    },
    { label: "API Endpoints", value: 10, suffix: "" },
    { label: "Test Coverage", value: 38, suffix: " tests" },
  ];

  return (
    <section
      ref={ref}
      className="border-y border-border bg-panel/40 py-10 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto px-6 md:px-10"
    >
      {stats.map((s, i) => (
        <RevealStat key={s.label} {...s} inView={inView} delayMs={i * 100} />
      ))}
    </section>
  );
}

function RevealStat({
  label,
  value,
  suffix,
  inView,
  delayMs,
}: {
  label: string;
  value: number;
  suffix: string;
  inView: boolean;
  delayMs: number;
}) {
  const display = useCountUp(value, inView);
  return (
    <div
      className="text-center transition-all duration-700"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(12px)",
        transitionDelay: `${delayMs}ms`,
      }}
    >
      <div className="font-mono text-3xl text-text-h tabular-nums">
        {Math.round(display)}
        {suffix}
      </div>
      <div className="uppercase tracking-wider text-[10px] text-text-dim font-semibold mt-1">
        {label}
      </div>
    </div>
  );
}

const FEATURE_LIST = [
  {
    title: "Real Forecasting Math",
    description:
      "Least-squares regression over sensor history projects remaining safe life per asset — not a canned demo number.",
    icon: TrendIcon,
  },
  {
    title: "AI-Validated Recommendations",
    description:
      "OpenAI generates structured maintenance guidance; every response is independently Zod-validated before it's trusted or stored.",
    icon: SparkIcon,
  },
  {
    title: "PHMSA-Calibrated",
    description:
      "Simulated corrosion timelines are checked against 940 real hazardous-liquid pipeline incidents from federal data.",
    icon: ScaleIcon,
  },
  {
    title: "Redis-Cached at Scale",
    description:
      "Cache-aside layer with graceful fallback keeps the fleet-wide risk ranking fast without ever becoming a point of failure.",
    icon: BoltIcon,
  },
];

function Features() {
  return (
    <section className="max-w-6xl mx-auto px-6 md:px-10 py-20 grid md:grid-cols-2 gap-5">
      {FEATURE_LIST.map((f, i) => (
        <FeatureCard key={f.title} {...f} delayMs={i * 80} />
      ))}
    </section>
  );
}

function FeatureCard({
  title,
  description,
  icon: Icon,
  delayMs,
}: {
  title: string;
  description: string;
  icon: (props: { className?: string }) => React.ReactElement;
  delayMs: number;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className="bg-panel border border-border p-6 transition-all duration-700 hover:border-border-strong hover:-translate-y-0.5"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(16px)",
        transitionDelay: `${delayMs}ms`,
      }}
    >
      <Icon className="text-accent mb-4" />
      <div className="text-text-h font-semibold text-[15px] mb-2">{title}</div>
      <div className="text-text-dim text-[13px] leading-relaxed">{description}</div>
    </div>
  );
}

function CalibrationCallout({ calibration }: { calibration: Calibration | null }) {
  const { ref, inView } = useInView<HTMLDivElement>();
  if (!calibration) return null;

  return (
    <section
      ref={ref}
      className="max-w-6xl mx-auto px-6 md:px-10 pb-24 transition-all duration-700"
      style={{ opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(16px)" }}
    >
      <div className="bg-panel border border-border-strong p-8 grid md:grid-cols-3 gap-6 items-center">
        <div className="md:col-span-2">
          <div className="uppercase tracking-wider text-[11px] font-bold text-risk-critical mb-2">
            Honest, Not Just Impressive
          </div>
          <div className="text-text-h text-[15px] leading-relaxed">
            Real hazardous-liquid pipelines take a median of{" "}
            <span className="font-mono text-text-h">
              {calibration.realWorldMedianYears.toFixed(0)} years
            </span>{" "}
            to fail from corrosion. This simulated fleet reaches CRITICAL in a median of{" "}
            <span className="font-mono text-text-h">
              {calibration.simulatedMedianYears.toFixed(1)} years
            </span>{" "}
            — tuned fast on purpose for a readable demo, and checked against{" "}
            {calibration.realWorldSampleSize} real PHMSA incidents rather than assumed.
          </div>
        </div>
        <Link
          to="/app/calibration"
          className="justify-self-start md:justify-self-end border border-border-strong text-text-h font-semibold text-[13px] uppercase tracking-wide px-5 py-3 no-underline hover:bg-panel-raised transition-colors whitespace-nowrap"
        >
          Full Comparison &rarr;
        </Link>
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-border py-8">
      <div className="max-w-6xl mx-auto px-6 md:px-10 flex flex-col md:flex-row items-center justify-between gap-3 text-text-dim text-[11px] uppercase tracking-wider font-semibold">
        <div>React &middot; Node/Express &middot; Prisma &middot; PostgreSQL &middot; Redis &middot; OpenAI</div>
        <div>Built as a portfolio project</div>
      </div>
    </footer>
  );
}

function TrendIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 17l6-6 4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 7h6v6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SparkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8" strokeLinecap="round" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function ScaleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 3v18M5 8l-3 6a3 3 0 006 0l-3-6zM19 8l-3 6a3 3 0 006 0l-3-6zM5 8h14M9 21h6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BoltIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
