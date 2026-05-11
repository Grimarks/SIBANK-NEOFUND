import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Settings, Shield, Bell, Database, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";

// --- Import Firebase & Toast ---
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettingsPage,
});

function AdminSettingsPage() {
  const [isSaving, setIsSaving] = useState(false);

  // State untuk pengaturan Loan yang tersambung ke Firebase
  const [loanSettings, setLoanSettings] = useState({
    minLoan: 1000000,
    maxLoan: 100000000,
    minRate: 7.0,
    maxRate: 12.0,
    maxDuration: 36
  });

  // Ambil data settings dari Firestore saat halaman dibuka
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, "systemSettings", "loanConfig");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setLoanSettings(docSnap.data() as any);
        }
      } catch (error) {
        console.error("Gagal mengambil pengaturan", error);
      }
    };
    fetchSettings();
  }, []);

  // Fungsi simpan settings dengan Validasi Min-Max
  const handleSaveLoanSettings = async () => {
    // LOGIKA VALIDASI: Min tidak boleh >= Max
    if (loanSettings.minLoan >= loanSettings.maxLoan) {
      toast.error("Gagal: Minimum Loan Amount tidak boleh lebih besar atau sama dengan Maximum Loan Amount!");
      return;
    }
    if (loanSettings.minRate >= loanSettings.maxRate) {
      toast.error("Gagal: Minimum Interest Rate tidak boleh lebih besar atau sama dengan Maximum Interest Rate!");
      return;
    }

    setIsSaving(true);
    try {
      await setDoc(doc(db, "systemSettings", "loanConfig"), loanSettings);
      toast.success("Pengaturan pinjaman berhasil diperbarui!");
    } catch (error) {
      toast.error("Gagal menyimpan pengaturan.");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout role="admin" title="Settings" subtitle="System configuration">
      <div className="grid lg:grid-cols-2 gap-6">

        {/* --- GENERAL SETTINGS (Gimmick) --- */}
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

        {/* --- LOAN SETTINGS (Fungsional & Terhubung Firebase) --- */}
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>Min Loan Amount (IDR)</label>
                <input type="number" className="fintech-input" value={loanSettings.minLoan} onChange={(e) => setLoanSettings({...loanSettings, minLoan: Number(e.target.value)})} />
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>Max Loan Amount (IDR)</label>
                <input type="number" className="fintech-input" value={loanSettings.maxLoan} onChange={(e) => setLoanSettings({...loanSettings, maxLoan: Number(e.target.value)})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>Min Interest Rate (%)</label>
                <input type="number" step="0.1" className="fintech-input" value={loanSettings.minRate} onChange={(e) => setLoanSettings({...loanSettings, minRate: Number(e.target.value)})} />
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>Max Interest Rate (%)</label>
                <input type="number" step="0.1" className="fintech-input" value={loanSettings.maxRate} onChange={(e) => setLoanSettings({...loanSettings, maxRate: Number(e.target.value)})} />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>Max Loan Duration (months)</label>
              <input type="number" className="fintech-input" value={loanSettings.maxDuration} onChange={(e) => setLoanSettings({...loanSettings, maxDuration: Number(e.target.value)})} />
            </div>

            {/* Warning Note untuk UX Admin */}
            <div className="p-3 rounded-lg border border-dashed flex gap-2 items-start" style={{ background: "var(--secondary)", borderColor: "var(--border)" }}>
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "var(--warning)" }} />
              <p className="text-[10px] leading-tight" style={{ color: "var(--muted-foreground)" }}>
                Perubahan limit & bunga ini hanya berlaku untuk pendaftaran pinjaman <strong>baru</strong>. Pinjaman pengguna yang sudah berjalan tidak akan terpengaruh.
              </p>
            </div>

            <button onClick={handleSaveLoanSettings} disabled={isSaving} className="btn-emerald">
              {isSaving ? "Updating..." : "Update Rates"}
            </button>
          </div>
        </div>

        {/* --- NOTIFICATIONS (Gimmick) --- */}
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
                <input type="checkbox" defaultChecked={c as boolean} className="rounded accent-emerald-500" />
              </div>
            ))}
          </div>
        </div>

        {/* --- SECURITY (Gimmick) --- */}
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
                <input type="checkbox" defaultChecked={c as boolean} className="rounded accent-emerald-500" />
              </div>
            ))}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}