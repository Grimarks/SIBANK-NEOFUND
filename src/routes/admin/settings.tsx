import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Settings, Shield, Bell, Database } from "lucide-react";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettingsPage,
});

function AdminSettingsPage() {
  return (
    <DashboardLayout role="admin" title="Settings" subtitle="System configuration">
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center" style={{ color: "var(--primary-foreground)" }}>
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold">General Settings</h3>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Platform configuration</p>
            </div>
          </div>
          <div className="space-y-4">
            {[["Platform Name", "NeoFund"], ["Support Email", "support@neofund.id"], ["Default Currency", "IDR"]].map(([l, v]) => (
              <div key={l}>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>{l}</label>
                <input className="fintech-input" defaultValue={v} />
              </div>
            ))}
            <button className="btn-primary w-auto">Save Changes</button>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl gradient-emerald flex items-center justify-center" style={{ color: "var(--emerald-foreground)" }}>
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold">Loan Settings</h3>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Interest rates & limits</p>
            </div>
          </div>
          <div className="space-y-4">
            {[["Min Interest Rate (%)", "7.0"], ["Max Interest Rate (%)", "12.0"], ["Max Loan Amount (IDR)", "100,000,000"], ["Max Loan Duration (months)", "36"]].map(([l, v]) => (
              <div key={l}>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>{l}</label>
                <input className="fintech-input" defaultValue={v} />
              </div>
            ))}
            <button className="btn-emerald">Update Rates</button>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "color-mix(in oklch, var(--warning) 15%, transparent)", color: "var(--warning)" }}>
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold">Notifications</h3>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Alert preferences</p>
            </div>
          </div>
          <div className="space-y-3">
            {[["New Loan Applications", true], ["Overdue Payments", true], ["Customer Registrations", false], ["System Updates", true]].map(([l, c]) => (
              <div key={String(l)} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: "var(--border)" }}>
                <span className="text-sm">{String(l)}</span>
                <input type="checkbox" defaultChecked={c as boolean} className="rounded" />
              </div>
            ))}
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "color-mix(in oklch, var(--destructive) 15%, transparent)", color: "var(--destructive)" }}>
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold">Security</h3>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Access control</p>
            </div>
          </div>
          <div className="space-y-3">
            {[["Two-Factor Authentication", true], ["IP Whitelisting", false], ["Session Timeout (30 min)", true], ["Audit Logging", true]].map(([l, c]) => (
              <div key={String(l)} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: "var(--border)" }}>
                <span className="text-sm">{String(l)}</span>
                <input type="checkbox" defaultChecked={c as boolean} className="rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
