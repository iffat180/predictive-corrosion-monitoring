import { Link, NavLink, Outlet } from "react-router-dom";

function navLinkClass({ isActive }: { isActive: boolean }) {
  return `block px-3 py-2.5 text-sm border-l-2 transition-colors ${
    isActive
      ? "text-text-h border-accent bg-panel-raised"
      : "text-text-dim border-transparent hover:text-text hover:bg-panel-raised"
  }`;
}

function TankMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 32 32" className="shrink-0">
      <ellipse cx="16" cy="11" rx="6" ry="2.4" fill="var(--color-accent)" />
      <rect x="10" y="11" width="12" height="9" fill="var(--color-accent)" />
      <rect x="10" y="20" width="12" height="4" fill="var(--color-risk-critical)" />
      <ellipse cx="16" cy="24" rx="6" ry="2.2" fill="var(--color-accent-dim)" />
    </svg>
  );
}

export function Layout() {
  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 border-r border-border-strong bg-panel flex flex-col">
        <Link
          to="/"
          className="px-4 py-5 border-b border-border no-underline flex items-center gap-2.5 hover:bg-panel-raised transition-colors"
        >
          <TankMark />
          <div>
            <div className="font-bold text-text-h text-sm tracking-wide">FLEET INTEGRITY</div>
            <div className="uppercase tracking-wider text-[10px] text-text-dim font-semibold mt-0.5">
              Monitoring System
            </div>
          </div>
        </Link>
        <nav className="flex-1 py-3">
          <NavLink to="/app" className={navLinkClass} end>
            Fleet Overview
          </NavLink>
          <NavLink to="/app/priority" className={navLinkClass}>
            Priority Queue
          </NavLink>
          <NavLink to="/app/calibration" className={navLinkClass}>
            PHMSA Calibration
          </NavLink>
        </nav>
      </aside>
      <main className="flex-1 p-8 overflow-x-auto">
        <Outlet />
      </main>
    </div>
  );
}
