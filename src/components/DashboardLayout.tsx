import { AppSidebar } from "./AppSidebar";
import { TopNav } from "./TopNav";
import { useState, useEffect } from "react";
import { useRouter } from "@tanstack/react-router";

// --- Import Firebase Auth ---
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export function DashboardLayout({
  role,
  title,
  subtitle,
  children,
}: {
  role: "customer" | "admin";
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // Jika belum login, paksa ke halaman login
        router.navigate({ to: "/login" });
      } else {
        // LOGIKA VERIFIKASI ROLE
        // Anggap akun adalah Admin jika emailnya mengandung kata "admin"
        const isAdmin = user.email?.toLowerCase().includes("admin");

        if (role === "admin" && !isAdmin) {
          // User biasa (Customer) mencoba menyusup ke URL /admin
          router.navigate({ to: "/dashboard" });
        } else if (role === "customer" && isAdmin) {
          // Admin mencoba masuk ke URL /dashboard
          router.navigate({ to: "/admin" });
        }
      }
    });

    return () => unsubscribe();
  }, [router, role]);

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