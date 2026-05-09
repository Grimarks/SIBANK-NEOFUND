import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { User, Lock, Bell, Shield, Camera } from "lucide-react";
import { useState, useEffect } from "react";

// --- Import Firebase & Toast ---
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, updatePassword } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const [tab, setTab] = useState("profile");
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // State untuk form input profil
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: ""
  });

  // State untuk form ganti password
  const [passData, setPassData] = useState({
    newPass: "",
    confirmPass: ""
  });

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Lock },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  // Fetching data user yang sedang login
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const docRef = doc(db, "adminCustomers", currentUser.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserData(data);
            // Isi form dengan data yang ditarik dari database
            setFormData({
              name: data.name || "",
              phone: data.phone || "",
              address: data.address || ""
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

  // FUNGSI 1: Update Profil (Nama, Telepon, Alamat)
  const handleUpdateProfile = async () => {
    if (!auth.currentUser) return;

    setIsUpdating(true);
    try {
      const docRef = doc(db, "adminCustomers", auth.currentUser.uid);
      await updateDoc(docRef, {
        name: formData.name,
        phone: formData.phone,
        address: formData.address
      });

      // Update UI seketika tanpa harus refresh halaman
      setUserData((prev: any) => ({ ...prev, ...formData }));
      toast.success("Profil berhasil diperbarui!");
    } catch (error) {
      console.error(error);
      toast.error("Gagal memperbarui profil.");
    } finally {
      setIsUpdating(false);
    }
  };

  // FUNGSI 2: Update Password
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
      // Kosongkan form password setelah berhasil
      setPassData({ newPass: "", confirmPass: "" });
    } catch (error: any) {
      console.error(error);
      // Firebase mengharuskan user baru saja login untuk bisa ganti password
      if (error.code === 'auth/requires-recent-login') {
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
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  if (isLoading) {
    return (
      <DashboardLayout role="customer" title="Profile Settings" subtitle="Manage your account">
        <div className="flex justify-center items-center h-40 animate-pulse text-muted-foreground">
          Memuat data profil...
        </div>
      </DashboardLayout>
    );
  }

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
              <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center text-2xl font-bold" style={{ color: "var(--primary-foreground)" }}>
                {getInitials(userData?.name)}
              </div>
              <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center gradient-emerald" style={{ color: "var(--emerald-foreground)" }}>
                <Camera className="w-3 h-3" />
              </button>
            </div>
            <div>
              <h3 className="font-bold text-lg">{userData?.name || "Nama Pengguna"}</h3>
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Customer since {getJoinDate(userData?.joinDate)}</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>Full Name</label>
              <input
                className="fintech-input"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              {/* Email dinonaktifkan agar tidak bisa diubah dengan mudah */}
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
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>Address</label>
              <input
                className="fintech-input"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
            </div>
          </div>
          <button
            onClick={handleUpdateProfile}
            disabled={isUpdating}
            className="btn-emerald mt-6"
          >
            {isUpdating ? "Menyimpan..." : "Save Changes"}
          </button>
        </div>
      )}

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
              onChange={(e) => setPassData({...passData, newPass: e.target.value})}
            />
          </div>
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>Confirm New Password</label>
            <input
              type="password"
              className="fintech-input"
              placeholder="Ketik ulang password baru"
              value={passData.confirmPass}
              onChange={(e) => setPassData({...passData, confirmPass: e.target.value})}
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