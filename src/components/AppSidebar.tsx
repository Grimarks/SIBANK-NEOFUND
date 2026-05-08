import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, FileText, CreditCard, Wallet, User, Settings,
  Users, CheckCircle, BarChart3, Activity, LogOut, ChevronLeft,
  ChevronRight, Shield, X
} from "lucide-react";
import { useState, useEffect } from "react";

const customerNav = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Apply for Loan", to: "/dashboard/apply", icon: FileText },
  { label: "My Loans", to: "/dashboard/loans", icon: CreditCard },
  { label: "Payments", to: "/dashboard/payments", icon: Wallet },
  { label: "Profile", to: "/dashboard/profile", icon: User },
];

const adminNav = [
  { label: "Overview", to: "/admin", icon: LayoutDashboard },
  { label: "Customers", to: "/admin/customers", icon: Users },
  { label: "Loan Approval", to: "/admin/loans", icon: CheckCircle },
  { label: "Payments", to: "/admin/payments", icon: Wallet },
  { label: "Reports", to: "/admin/reports", icon: BarChart3 },
  { label: "Settings", to: "/admin/settings", icon: Settings },
];

export function AppSidebar({ role, mobileOpen, onMobileClose }: { role: "customer" | "admin"; mobileOpen?: boolean; onMobileClose?: () => void }) {
  const [collapsed, setCollapsed] = useState(false);
  const currentPath = useRouterState({ select: (s) => s.location.pathname });
  const nav = role === "admin" ? adminNav : customerNav;
  const isActive = (path: string) => {
    if (role === "admin" && path === "/admin") return currentPath === "/admin";
    if (role === "customer" && path === "/dashboard") return currentPath === "/dashboard";
    return currentPath.startsWith(path) && path !== "/dashboard" && path !== "/admin";
  };

  // Close mobile sidebar on route change
  useEffect(() => {
    if (onMobileClose) onMobileClose();
  }, [currentPath]);

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar — hidden on mobile by default, shown when mobileOpen */}
      <aside
        className={`fixed left-0 top-0 h-screen z-50 flex flex-col transition-all duration-300
          md:translate-x-0 ${collapsed ? "md:w-[72px]" : "md:w-[260px]"}
          w-[280px] ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ background: "var(--sidebar)", borderRight: "1px solid var(--sidebar-border)" }}
      >
        <div className={`flex items-center h-16 px-4 ${collapsed ? "md:justify-center" : "gap-3"} justify-between md:justify-start`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gradient-emerald flex items-center justify-center flex-shrink-0">
              <Shield className="w-4 h-4" style={{ color: "var(--emerald-foreground)" }} />
            </div>
            {(!collapsed || mobileOpen) && (
              <div className="animate-fade-in">
                <h1 className="text-base font-bold" style={{ color: "var(--sidebar-foreground)" }}>NeoFund</h1>
                <p className="text-[10px] uppercase tracking-widest" style={{ color: "var(--sidebar-foreground)", opacity: 0.5 }}>
                  {role === "admin" ? "Admin Panel" : "Banking"}
                </p>
              </div>
            )}
          </div>
          {/* Close button — mobile only */}
          <button onClick={onMobileClose} className="p-1.5 rounded-md md:hidden" style={{ color: "var(--sidebar-foreground)", opacity: 0.5 }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {nav.map((item) => (
            <Link key={item.to} to={item.to} className={`sidebar-nav-item ${isActive(item.to) ? "active" : ""} ${collapsed ? "md:justify-center md:px-0" : ""}`}>
              <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
              {(!collapsed || mobileOpen) && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="px-3 pb-4 space-y-2">
          <Link to="/login" className={`sidebar-nav-item ${collapsed ? "md:justify-center md:px-0" : ""}`}>
            <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
            {(!collapsed || mobileOpen) && <span>Logout</span>}
          </Link>
          {/* Collapse toggle — desktop only */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full hidden md:flex items-center justify-center p-2 rounded-md transition-colors"
            style={{ color: "var(--sidebar-foreground)", opacity: 0.5 }}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </aside>
    </>
  );
}
