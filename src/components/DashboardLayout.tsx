import { AppSidebar } from "./AppSidebar";
import { TopNav } from "./TopNav";
import { useState } from "react";

export function DashboardLayout({
  role, title, subtitle, children,
}: {
  role: "customer" | "admin"; title: string; subtitle?: string; children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <AppSidebar role={role} mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <div className="transition-all duration-300 ml-0 md:ml-[260px]">
        <TopNav title={title} subtitle={subtitle} onMenuClick={() => setMobileOpen(true)} />
        <main className="animate-fade-in-up p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
