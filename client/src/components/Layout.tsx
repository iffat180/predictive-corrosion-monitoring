import { NavLink, Outlet } from "react-router-dom";

function navLinkClass({ isActive }: { isActive: boolean }) {
  return `block px-3 py-2 text-sm border-l-2 ${
    isActive
      ? "text-text-h border-accent bg-panel-raised"
      : "text-text-dim border-transparent hover:text-text hover:bg-panel-raised"
  }`;
}

export function Layout() {
  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 border-r border-border-strong bg-panel flex flex-col">
        <div className="px-4 py-5 border-b border-border">
          <div className="font-bold text-text-h text-sm tracking-wide">FLEET INTEGRITY</div>
          <div className="uppercase tracking-wider text-[10px] text-text-dim font-semibold mt-0.5">
            Monitoring System
          </div>
        </div>
        <nav className="flex-1 py-3">
          <NavLink to="/" className={navLinkClass} end>
            Fleet Overview
          </NavLink>
          <NavLink to="/priority" className={navLinkClass}>
            Priority Queue
          </NavLink>
          <NavLink to="/calibration" className={navLinkClass}>
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
