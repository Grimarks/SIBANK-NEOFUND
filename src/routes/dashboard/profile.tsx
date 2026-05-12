import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { User, Lock, Bell, Shield, Camera, Building2, CreditCard, CheckCircle2, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";

// --- Import Firebase & Toast ---
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, updatePassword } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/profile")({
  component: ProfilePage,
});

// ─── Daftar Bank Indonesia ────────────────────────────────────────────────────
const BANK_LIST = [
  "BCA - Bank Central Asia",
  "BNI - Bank Negara Indonesia",
  "BRI - Bank Rakyat Indonesia",
  "Bank Mandiri",
  "BSI - Bank Syariah Indonesia",
  "CIMB Niaga",
  "Bank Danamon",
  "Permata Bank",
  "Bank Mega",
  "Bank Bukopin",
  "BTN - Bank Tabungan Negara",
  "Bank Muamalat",
  "OCBC NISP",
  "Maybank Indonesia",
  "Bank Panin",
  "Lainnya",
];

function ProfilePage() {
  const [tab, setTab] = useState("profile");
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isBankUpdating, setIsBankUpdating] = useState(false);

  // State form profil
  const [formData, setFormData] = useState({ name: "", phone: "", address: "" });

  // State form rekening bank
  const [bankData, setBankData] = useState({
    bankName: "",
    accountNumber: "",
    accountHolder: "",
  });

  // State form password
  const [passData, setPassData] = useState({ newPass: "", confirmPass: "" });

  const tabs = [
    { id: "profile",       label: "Profile",        icon: User },
    { id: "security",      label: "Security",        icon: Lock },
    { id: "notifications", label: "Notifications",   icon: Bell },
  ];

  // Fetch user data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const docRef = doc(db, "adminCustomers", currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserData(data);
            setFormData({
              name: data.name || "",
              phone: data.phone || "",
              address: data.address || "",
            });
            setBankData({
              bankName:      data.bankName      || "",
              accountNumber: data.accountNumber || "",
              accountHolder: data.accountHolder || "",
            });
          }
        } catch (error) {
          console.error("Gagal mengambil profil:", error);
        }
      } else {
        setUserData(null);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Update Profil
  const handleUpdateProfile = async () => {
    if (!auth.currentUser) return;
    setIsUpdating(true);
    try {
      await updateDoc(doc(db, "adminCustomers", auth.currentUser.uid), {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
      });
      setUserData((prev: any) => ({ ...prev, ...formData }));
      toast.success("Profil berhasil diperbarui!");
    } catch {
      toast.error("Gagal memperbarui profil.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Update Rekening Bank
  const handleUpdateBank = async () => {
    if (!auth.currentUser) return;

    if (!bankData.bankName || !bankData.accountNumber || !bankData.accountHolder) {
      toast.error("Harap lengkapi semua informasi rekening.");
      return;
    }
    if (!/^\d{8,20}$/.test(bankData.accountNumber)) {
      toast.error("Nomor rekening tidak valid (8–20 digit angka).");
      return;
    }

    setIsBankUpdating(true);
    try {
      await updateDoc(doc(db, "adminCustomers", auth.currentUser.uid), {
        bankName:      bankData.bankName,
        accountNumber: bankData.accountNumber,
        accountHolder: bankData.accountHolder,
        bankVerified:  false, // admin harus verifikasi ulang setiap kali diubah
      });
      setUserData((prev: any) => ({ ...prev, ...bankData, bankVerified: false }));
      toast.success("Informasi rekening berhasil disimpan!");
    } catch {
      toast.error("Gagal menyimpan rekening bank.");
    } finally {
      setIsBankUpdating(false);
    }
  };

  // Update Password
  const handleUpdatePassword = async () => {
    if (!auth.currentUser) return;
    if (passData.newPass !== passData.confirmPass) {
      toast.error("Password baru dan konfirmasi tidak cocok!");
      return;
    }
    if (passData.newPass.length < 6) {
      toast.error("Password minimal harus 6 karakter.");
      return;
    }
    setIsUpdating(true);
    try {
      await updatePassword(auth.currentUser, passData.newPass);
      toast.success("Password berhasil diperbarui!");
      setPassData({ newPass: "", confirmPass: "" });
    } catch (error: any) {
      if (error.code === "auth/requires-recent-login") {
        toast.error("Demi keamanan, silakan Logout dan Login kembali sebelum mengubah password.");
      } else {
        toast.error("Gagal memperbarui password.");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "US";
    return name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
  };

  const getJoinDate = (dateString: string) => {
    if (!dateString) return "Recently";
    return new Date(dateString).toLocaleDateString("id-ID", { month: "long", year: "numeric" });
  };

  const bankIsComplete = bankData.bankName && bankData.accountNumber && bankData.accountHolder;

  if (isLoading) {
    return (
      <DashboardLayout role="customer" title="Profile Settings" subtitle="Manage your account">
        <div className="flex flex-col items-center justify-center h-40 gap-3 text-muted-foreground">
          <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Memuat data profil...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="customer" title="Profile Settings" subtitle="Manage your account">

      {/* ── Tab navigation ── */}
      <div className="flex gap-2 mb-6">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.id ? "gradient-primary" : ""}`}
            style={
              tab === t.id
                ? { color: "var(--primary-foreground)" }
                : { background: "var(--secondary)", color: "var(--muted-foreground)" }
            }
          >
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════
          TAB: PROFILE
      ══════════════════════════════════════════════════════ */}
      {tab === "profile" && (
        <div className="space-y-6 animate-fade-in">

          {/* ── Info Dasar ── */}
          <div className="stat-card">
            {/* Avatar header */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b" style={{ borderColor: "var(--border)" }}>
              <div className="relative">
                <div
                  className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center text-2xl font-bold"
                  style={{ color: "var(--primary-foreground)" }}
                >
                  {getInitials(userData?.name)}
                </div>
                <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center gradient-emerald" style={{ color: "var(--emerald-foreground)" }}>
                  <Camera className="w-3 h-3" />
                </button>
              </div>
              <div>
                <h3 className="font-bold text-lg">{userData?.name || "Nama Pengguna"}</h3>
                <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                  Customer since {getJoinDate(userData?.joinDate)}
                </p>
              </div>
            </div>

            {/* Form profil */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>Full Name</label>
                <input
                  className="fintech-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>Email (Read Only)</label>
                <input
                  className="fintech-input opacity-70 cursor-not-allowed"
                  value={userData?.email || ""}
                  disabled
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>Phone</label>
                <input
                  className="fintech-input"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>Address</label>
                <input
                  className="fintech-input"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
            </div>

            <button onClick={handleUpdateProfile} disabled={isUpdating} className="btn-emerald mt-6">
              {isUpdating ? "Menyimpan..." : "Save Changes"}
            </button>
          </div>

          {/* ── Rekening Bank ── */}
          <div className="stat-card">
            {/* Header section rekening */}
            <div className="flex items-start justify-between mb-5 pb-5 border-b" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: "color-mix(in oklch, oklch(0.55 0.17 160) 15%, transparent)" }}
                >
                  <Building2 className="w-5 h-5" style={{ color: "oklch(0.55 0.17 160)" }} />
                </div>
                <div>
                  <h3 className="font-semibold">Rekening Pencairan Dana</h3>
                  <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                    Dana pinjaman yang disetujui akan ditransfer ke rekening ini
                  </p>
                </div>
              </div>

              {/* Badge status verifikasi */}
              {bankIsComplete && (
                userData?.bankVerified ? (
                  <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-500">
                    <CheckCircle2 className="w-4 h-4" />
                    Terverifikasi
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: "var(--warning)" }}>
                    <AlertCircle className="w-4 h-4" />
                    Menunggu verifikasi
                  </div>
                )
              )}
            </div>

            {/* Peringatan kalau belum isi rekening */}
            {!bankIsComplete && (
              <div
                className="flex items-start gap-3 p-3 rounded-xl mb-5 text-sm"
                style={{ background: "color-mix(in oklch, var(--warning) 10%, transparent)", color: "var(--warning)" }}
              >
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p>Lengkapi informasi rekening bank agar pengajuan pinjaman kamu bisa diproses.</p>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              {/* Pilih bank */}
              <div className="md:col-span-2">
                <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>
                  Nama Bank
                </label>
                <select
                  className="fintech-input"
                  value={bankData.bankName}
                  onChange={(e) => setBankData({ ...bankData, bankName: e.target.value })}
                >
                  <option value="">-- Pilih Bank --</option>
                  {BANK_LIST.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              {/* Nomor rekening */}
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>
                  Nomor Rekening
                </label>
                <div className="relative">
                  <CreditCard
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                    style={{ color: "var(--muted-foreground)" }}
                  />
                  <input
                    className="fintech-input pl-9"
                    placeholder="Contoh: 1234567890"
                    value={bankData.accountNumber}
                    inputMode="numeric"
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setBankData({ ...bankData, accountNumber: val });
                    }}
                  />
                </div>
                <p className="text-[11px] mt-1" style={{ color: "var(--muted-foreground)" }}>
                  Masukkan angka saja, tanpa spasi atau tanda hubung
                </p>
              </div>

              {/* Nama pemilik rekening */}
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>
                  Nama Pemilik Rekening
                </label>
                <input
                  className="fintech-input"
                  placeholder="Sesuai buku tabungan / e-banking"
                  value={bankData.accountHolder}
                  onChange={(e) => setBankData({ ...bankData, accountHolder: e.target.value.toUpperCase() })}
                />
                <p className="text-[11px] mt-1" style={{ color: "var(--muted-foreground)" }}>
                  Harus sama persis dengan nama di rekening bank
                </p>
              </div>
            </div>

            {/* Preview rekening kalau sudah lengkap */}
            {bankIsComplete && (
              <div
                className="mt-5 p-4 rounded-xl border flex items-center gap-4"
                style={{ borderColor: "var(--border)", background: "var(--secondary)" }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "color-mix(in oklch, oklch(0.35 0.12 260) 15%, transparent)" }}
                >
                  <Building2 className="w-5 h-5" style={{ color: "oklch(0.35 0.12 260)" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>
                    Rekening terdaftar
                  </p>
                  <p className="font-bold truncate">{bankData.accountHolder}</p>
                  <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                    {bankData.bankName} · {bankData.accountNumber.replace(/(\d{4})(?=\d)/g, "$1 ")}
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={handleUpdateBank}
              disabled={isBankUpdating}
              className="btn-primary mt-5"
            >
              {isBankUpdating ? "Menyimpan..." : bankIsComplete ? "Perbarui Rekening" : "Simpan Rekening"}
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          TAB: SECURITY
      ══════════════════════════════════════════════════════ */}
      {tab === "security" && (
        <div className="stat-card animate-fade-in space-y-4">
          <h3 className="font-semibold">Change Password</h3>
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>New Password</label>
            <input
              type="password"
              className="fintech-input"
              placeholder="Min. 6 karakter"
              value={passData.newPass}
              onChange={(e) => setPassData({ ...passData, newPass: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>Confirm New Password</label>
            <input
              type="password"
              className="fintech-input"
              placeholder="Ketik ulang password baru"
              value={passData.confirmPass}
              onChange={(e) => setPassData({ ...passData, confirmPass: e.target.value })}
            />
          </div>
          <button
            onClick={handleUpdatePassword}
            disabled={isUpdating || !passData.newPass}
            className="btn-primary w-auto"
          >
            {isUpdating ? "Memproses..." : "Update Password"}
          </button>

          <div className="pt-4 border-t mt-4" style={{ borderColor: "var(--border)" }}>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4" /> Two-Factor Authentication
            </h4>
            <p className="text-sm mb-3" style={{ color: "var(--muted-foreground)" }}>
              Add an extra layer of security to your account
            </p>
            <button className="btn-outline">Enable 2FA</button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          TAB: NOTIFICATIONS
      ══════════════════════════════════════════════════════ */}
      {tab === "notifications" && (
        <div className="stat-card animate-fade-in space-y-4">
          <h3 className="font-semibold mb-4">Notification Preferences</h3>
          <div className="space-y-3">
            {(
              [
                ["Payment Reminders",  true ],
                ["Loan Updates",       true ],
                ["Promotional Offers", false],
                ["Security Alerts",    true ],
              ] as [string, boolean][]
            ).map(([label, checked]) => (
              <label
                key={label}
                className="flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors hover:bg-secondary/50"
                style={{ borderColor: "var(--border)" }}
              >
                <span className="text-sm font-medium">{label}</span>
                <input
                  type="checkbox"
                  defaultChecked={checked}
                  className="w-4 h-4 rounded cursor-pointer"
                  style={{ accentColor: "var(--emerald)" }}
                />
              </label>
            ))}
          </div>
          <button className="btn-emerald mt-4">Save Preferences</button>
        </div>
      )}

    </DashboardLayout>
  );
}