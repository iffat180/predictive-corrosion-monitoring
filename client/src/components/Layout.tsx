import { NavLink, Outlet } from "react-router-dom";

function navClass({ isActive }: { isActive: boolean }) {
  return `py-2.5 text-[13px] tracking-wide border-b-2 ${
    isActive ? "text-text-h border-accent" : "text-text-dim border-transparent"
  }`;
}

export function Layout() {
  return (
    <div>
      <header className="border-b border-border-strong bg-panel px-6">
        <div className="max-w-[1100px] mx-auto flex items-center gap-8">
          <div className="py-4">
            <div className="font-bold text-text-h text-[15px]">FLEET INTEGRITY MONITOR</div>
            <div className="uppercase tracking-wider text-[11px] text-text-dim font-semibold">
              corrosion &amp; remaining-life tracking
            </div>
          </div>
          <nav className="flex gap-5">
            <NavLink to="/" className={navClass} end>
              Fleet
            </NavLink>
            <NavLink to="/priority" className={navClass}>
              Priority Queue
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="max-w-[1100px] mx-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
