import React, { useState, useEffect } from "react";
import { Link, useRouterState, useRouter } from "@tanstack/react-router";
import {
  LayoutDashboard, FileText, CreditCard, Wallet, User, Settings,
  Users, CheckCircle, BarChart3, Activity, LogOut, ChevronLeft,
  ChevronRight, Shield, X
} from "lucide-react";

// --- Import Firebase Auth ---
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { toast } from "sonner";

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
  const router = useRouter();
  const nav = role === "admin" ? adminNav : customerNav;

  // PERBAIKAN LOGIKA HIGHLIGHT
  const isActive = (path: string) => {
    // Khusus dashboard/overview, hanya nyala jika path persis
    if (path === "/dashboard") return currentPath === "/dashboard" || currentPath === "/dashboard/";
    if (path === "/admin") return currentPath === "/admin" || currentPath === "/admin/";

    // Untuk menu lain, cek apakah path saat ini menunjuk ke sub-menu tersebut
    return currentPath.startsWith(path);
  };

  useEffect(() => {
    if (onMobileClose) onMobileClose();
  }, [currentPath]);

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await signOut(auth);
      toast.success("Berhasil keluar dari akun.");
      router.navigate({ to: "/login" });
    } catch (error) {
      toast.error("Gagal logout, silakan coba lagi.");
    }
  };

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onMobileClose}
        />
      )}

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
          <button onClick={onMobileClose} className="p-1.5 rounded-md md:hidden" style={{ color: "var(--sidebar-foreground)", opacity: 0.5 }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {nav.map((item) => {
            const active = isActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                // Mencegah TanStack Router melakukan auto-highlight yang salah
                activeOptions={{ exact: item.to === "/dashboard" || item.to === "/admin" }}
                className={`sidebar-nav-item ${active ? "active" : ""} ${collapsed ? "md:justify-center md:px-0" : ""}`}
              >
                <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
                {(!collapsed || mobileOpen) && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 pb-4 space-y-2">
          <a href="#" onClick={handleLogout} className={`sidebar-nav-item ${collapsed ? "md:justify-center md:px-0" : ""}`}>
            <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
            {(!collapsed || mobileOpen) && <span>Logout</span>}
          </a>

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