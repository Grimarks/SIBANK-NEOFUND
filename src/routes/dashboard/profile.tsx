import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { User, Lock, Bell, Shield, Camera } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/dashboard/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const [tab, setTab] = useState("profile");
  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Lock },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  return (
    <DashboardLayout role="customer" title="Profile Settings" subtitle="Manage your account">
      <div className="flex gap-2 mb-6">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.id ? "gradient-primary" : ""}`}
            style={tab === t.id ? { color: "var(--primary-foreground)" } : { background: "var(--secondary)", color: "var(--muted-foreground)" }}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === "profile" && (
        <div className="stat-card animate-fade-in">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b" style={{ borderColor: "var(--border)" }}>
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center text-2xl font-bold" style={{ color: "var(--primary-foreground)" }}>AR</div>
              <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center gradient-emerald" style={{ color: "var(--emerald-foreground)" }}>
                <Camera className="w-3 h-3" />
              </button>
            </div>
            <div>
              <h3 className="font-bold text-lg">Ahmad Rizki</h3>
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Customer since June 2023</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {[["Full Name", "Ahmad Rizki"], ["Email", "ahmad@email.com"], ["Phone", "+62 812 3456 7890"], ["Address", "Jl. Sudirman No. 123, Jakarta"]].map(([l, v]) => (
              <div key={l}>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>{l}</label>
                <input className="fintech-input" defaultValue={v} />
              </div>
            ))}
          </div>
          <button className="btn-emerald mt-6">Save Changes</button>
        </div>
      )}

      {tab === "security" && (
        <div className="stat-card animate-fade-in space-y-4">
          <h3 className="font-semibold">Change Password</h3>
          {["Current Password", "New Password", "Confirm New Password"].map((l) => (
            <div key={l}>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>{l}</label>
              <input type="password" className="fintech-input" placeholder="••••••••" />
            </div>
          ))}
          <button className="btn-primary w-auto">Update Password</button>
          <div className="pt-4 border-t mt-4" style={{ borderColor: "var(--border)" }}>
            <h4 className="font-semibold mb-3 flex items-center gap-2"><Shield className="w-4 h-4" /> Two-Factor Authentication</h4>
            <p className="text-sm mb-3" style={{ color: "var(--muted-foreground)" }}>Add an extra layer of security to your account</p>
            <button className="btn-outline">Enable 2FA</button>
          </div>
        </div>
      )}

      {tab === "notifications" && (
        <div className="stat-card animate-fade-in space-y-4">
          <h3 className="font-semibold">Notification Preferences</h3>
          {[["Payment Reminders", true], ["Loan Updates", true], ["Promotional Offers", false], ["Security Alerts", true]].map(([label, checked]) => (
            <div key={String(label)} className="flex items-center justify-between py-2">
              <span className="text-sm">{String(label)}</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked={checked as boolean} className="sr-only peer" />
                <div className="w-9 h-5 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:rounded-full after:h-4 after:w-4 after:transition-all"
                  style={{ background: "var(--secondary)" }} />
              </label>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
