import { Bell, Search, Moon, Sun, Menu } from "lucide-react";
import { useState } from "react";

export function TopNav({ title, subtitle, onMenuClick }: { title: string; subtitle?: string; onMenuClick?: () => void }) {
  const [dark, setDark] = useState(false);
  const [showNotif, setShowNotif] = useState(false);

  const toggleDark = () => {
    setDark(!dark);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <header className="h-16 flex items-center justify-between px-4 md:px-6 border-b" style={{ borderColor: "var(--border)" }}>
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button onClick={onMenuClick} className="btn-outline p-2 md:hidden">
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>{title}</h2>
          {subtitle && <p className="text-xs hidden sm:block" style={{ color: "var(--muted-foreground)" }}>{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2 md:gap-3">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--muted-foreground)" }} />
          <input type="text" placeholder="Search..." className="fintech-input pl-9 w-60" />
        </div>
        <button onClick={toggleDark} className="btn-outline p-2">
          {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        <div className="relative">
          <button onClick={() => setShowNotif(!showNotif)} className="btn-outline p-2 relative">
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center gradient-emerald" style={{ color: "var(--emerald-foreground)" }}>3</span>
          </button>
          {showNotif && (
            <div className="absolute right-0 top-12 w-72 rounded-xl p-4 shadow-lg animate-scale-in z-50" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <h4 className="font-semibold text-sm mb-3">Notifications</h4>
              {["Payment due in 3 days", "Loan LN-2024-003 approved", "New security update"].map((n, i) => (
                <div key={i} className="py-2 border-b last:border-0 text-xs" style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}>{n}</div>
              ))}
            </div>
          )}
        </div>
        <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-xs font-bold" style={{ color: "var(--primary-foreground)" }}>A</div>
      </div>
    </header>
  );
}
