import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
  Search, Eye, UserCheck, UserX, ChevronDown, AlertCircle,
  X, Building2, CreditCard, Phone, Mail, Calendar,
  BadgeCheck, Clock, ShieldAlert,
} from "lucide-react";
import { useState } from "react";

// --- Import Firebase & React Query ---
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/customers")({
  component: CustomersPage,
});

interface AdminCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: "active" | "suspended";
  totalLoans: number;
  creditScore: number;
  joinDate: string;
  verified: boolean;
  // Rekening bank
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  bankVerified: boolean;
}

// ─── Customer Detail Modal ────────────────────────────────────────────────────
function CustomerDetailModal({
                               customer,
                               onClose,
                               onVerifyBank,
                               isVerifyingBank,
                             }: {
  customer: AdminCustomer;
  onClose: () => void;
  onVerifyBank: (id: string) => void;
  isVerifyingBank: boolean;
}) {
  const hasBankInfo = customer.bankName && customer.accountNumber && customer.accountHolder;

  const getInitials = (name: string) =>
    name ? name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase() : "US";

  const formatAccountNumber = (num: string) =>
    num?.replace(/(\d{4})(?=\d)/g, "$1 ") ?? "-";

  const getJoinDate = (d: string) =>
    d ? new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "—";

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      {/* Modal panel */}
      <div
        className="w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-fade-in"
        style={{ background: "var(--card)", border: "1px solid var(--border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: "var(--border)" }}
        >
          <h2 className="font-semibold text-base">Detail Nasabah</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-secondary"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">

          {/* ── Avatar + nama ── */}
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center text-xl font-bold flex-shrink-0"
              style={{ color: "var(--primary-foreground)" }}
            >
              {getInitials(customer.name)}
            </div>
            <div>
              <p className="font-bold text-lg leading-tight">{customer.name || "—"}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`badge-status ${customer.status === "active" ? "badge-approved" : "badge-rejected"}`}>
                  {customer.status}
                </span>
                {customer.verified ? (
                  <span className="badge-status badge-approved flex items-center gap-1">
                    <BadgeCheck className="w-3 h-3" /> Verified
                  </span>
                ) : (
                  <span className="badge-status badge-pending flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Unverified
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ── Info Kontak ── */}
          <div
            className="rounded-xl p-4 space-y-3"
            style={{ background: "var(--secondary)" }}
          >
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>
              Informasi Kontak
            </p>
            {[
              { icon: Mail,     label: "Email",    value: customer.email   },
              { icon: Phone,    label: "Telepon",  value: customer.phone   },
              { icon: Calendar, label: "Bergabung",value: getJoinDate(customer.joinDate) },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 text-sm">
                <Icon className="w-4 h-4 flex-shrink-0" style={{ color: "var(--muted-foreground)" }} />
                <span style={{ color: "var(--muted-foreground)" }} className="w-20 flex-shrink-0">{label}</span>
                <span className="font-medium truncate">{value || "—"}</span>
              </div>
            ))}
          </div>

          {/* ── Credit Score ── */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl p-4" style={{ background: "var(--secondary)" }}>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Credit Score</p>
              <p
                className="text-2xl font-bold mt-1"
                style={{
                  color: customer.creditScore >= 700
                    ? "oklch(0.55 0.17 160)"
                    : customer.creditScore >= 600
                      ? "var(--warning)"
                      : "var(--destructive)",
                }}
              >
                {customer.creditScore || "N/A"}
              </p>
            </div>
            <div className="rounded-xl p-4" style={{ background: "var(--secondary)" }}>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Total Pinjaman</p>
              <p className="text-2xl font-bold mt-1">{customer.totalLoans ?? 0}</p>
            </div>
          </div>

          {/* ── Rekening Bank ── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>
                Rekening Pencairan Dana
              </p>
              {hasBankInfo && (
                customer.bankVerified ? (
                  <span className="flex items-center gap-1 text-xs font-medium text-emerald-500">
                    <BadgeCheck className="w-3.5 h-3.5" /> Terverifikasi
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-medium" style={{ color: "var(--warning)" }}>
                    <ShieldAlert className="w-3.5 h-3.5" /> Belum diverifikasi
                  </span>
                )
              )}
            </div>

            {hasBankInfo ? (
              <div
                className="rounded-xl border p-4 space-y-3"
                style={{ borderColor: "var(--border)", background: "var(--secondary)" }}
              >
                {[
                  { icon: Building2,  label: "Bank",     value: customer.bankName },
                  { icon: CreditCard, label: "Rekening", value: formatAccountNumber(customer.accountNumber) },
                  { icon: UserCheck,  label: "A/N",      value: customer.accountHolder },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3 text-sm">
                    <Icon className="w-4 h-4 flex-shrink-0" style={{ color: "var(--muted-foreground)" }} />
                    <span style={{ color: "var(--muted-foreground)" }} className="w-20 flex-shrink-0">{label}</span>
                    <span className="font-semibold">{value}</span>
                  </div>
                ))}

                {/* Tombol verifikasi rekening oleh admin */}
                {!customer.bankVerified && (
                  <button
                    onClick={() => onVerifyBank(customer.id)}
                    disabled={isVerifyingBank}
                    className="btn-emerald w-full mt-2 text-sm"
                  >
                    {isVerifyingBank ? "Memverifikasi..." : "✓ Verifikasi Rekening Ini"}
                  </button>
                )}
              </div>
            ) : (
              <div
                className="rounded-xl border border-dashed p-4 flex items-center gap-3 text-sm"
                style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <p>Nasabah belum mengisi informasi rekening bank.</p>
              </div>
            )}
          </div>

        </div>

        {/* ── Footer ── */}
        <div
          className="px-6 py-4 border-t flex justify-end"
          style={{ borderColor: "var(--border)" }}
        >
          <button onClick={onClose} className="btn-outline text-sm">Tutup</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
function CustomersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedCustomer, setSelectedCustomer] = useState<AdminCustomer | null>(null);
  const [isVerifyingBank, setIsVerifyingBank] = useState(false);
  const queryClient = useQueryClient();

  const { data: adminCustomers = [], isLoading, isError } = useQuery({
    queryKey: ["adminCustomers"],
    queryFn: async () => {
      const snap = await getDocs(collection(db, "adminCustomers"));
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AdminCustomer));
    },
  });

  // Verifikasi akun nasabah
  const verifyCustomer = async (customerId: string) => {
    try {
      await updateDoc(doc(db, "adminCustomers", customerId), {
        verified: true,
        status: "active",
      });
      toast.success("Akun nasabah berhasil diverifikasi!");
      queryClient.invalidateQueries({ queryKey: ["adminCustomers"] });
    } catch {
      toast.error("Gagal memverifikasi akun.");
    }
  };

  // Suspend / unsuspend
  const toggleSuspendCustomer = async (customerId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "active" ? "suspended" : "active";
      await updateDoc(doc(db, "adminCustomers", customerId), { status: newStatus });
      toast.success(`Akun berhasil di-${newStatus}`);
      queryClient.invalidateQueries({ queryKey: ["adminCustomers"] });
    } catch {
      toast.error("Gagal mengubah status akun.");
    }
  };

  // Verifikasi rekening bank oleh admin
  const verifyBankAccount = async (customerId: string) => {
    setIsVerifyingBank(true);
    try {
      await updateDoc(doc(db, "adminCustomers", customerId), { bankVerified: true });
      toast.success("Rekening nasabah berhasil diverifikasi!");
      queryClient.invalidateQueries({ queryKey: ["adminCustomers"] });
      // Update modal state supaya badge langsung berubah
      setSelectedCustomer((prev) => prev ? { ...prev, bankVerified: true } : prev);
    } catch {
      toast.error("Gagal memverifikasi rekening.");
    } finally {
      setIsVerifyingBank(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout role="admin" title="Customer Management" subtitle="View and manage customer accounts">
        <div className="flex flex-col items-center justify-center h-40 gap-3 text-muted-foreground">
          <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Memuat data nasabah...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (isError) {
    return (
      <DashboardLayout role="admin" title="Customer Management" subtitle="View and manage customer accounts">
        <div className="flex justify-center items-center h-40 text-red-500 gap-2">
          <AlertCircle className="w-5 h-5" /> Gagal memuat data nasabah.
        </div>
      </DashboardLayout>
    );
  }

  // Filter: sembunyikan akun admin, terapkan search & status
  const filtered = adminCustomers
    .filter((c) => !c.email?.toLowerCase().includes("admin"))
    .filter((c) => {
      const matchSearch =
        c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.email?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || c.status === statusFilter;
      return matchSearch && matchStatus;
    });

  return (
    <DashboardLayout role="admin" title="Customer Management" subtitle="View and manage customer accounts">

      {/* ── Filters ── */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--muted-foreground)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="fintech-input pl-9"
            placeholder="Cari nama atau email..."
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="fintech-input pr-8 appearance-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "var(--muted-foreground)" }} />
        </div>
      </div>

      {/* ── Table ── */}
      <div className="stat-card overflow-x-auto">
        <table className="data-table">
          <thead>
          <tr>
            <th>Customer</th>
            <th>Email</th>
            <th>Credit Score</th>
            <th>Total Loans</th>
            <th>Status</th>
            <th>Rekening</th>
            <th>Actions</th>
          </tr>
          </thead>
          <tbody>
          {filtered.map((c) => {
            const initial = c.name
              ? c.name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()
              : "U";
            const hasBankInfo = c.bankName && c.accountNumber && c.accountHolder;

            return (
              <tr key={c.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-xs font-bold"
                      style={{ color: "var(--primary-foreground)" }}
                    >
                      {initial}
                    </div>
                    <div>
                      <p className="font-medium">{c.name}</p>
                      <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{c.phone}</p>
                    </div>
                  </div>
                </td>
                <td>{c.email}</td>
                <td>
                    <span
                      className="font-semibold"
                      style={{
                        color: c.creditScore >= 700
                          ? "oklch(0.55 0.17 160)"
                          : c.creditScore >= 600
                            ? "var(--warning)"
                            : "var(--destructive)",
                      }}
                    >
                      {c.creditScore || "N/A"}
                    </span>
                </td>
                <td>{c.totalLoans || 0}</td>
                <td>
                    <span className={`badge-status ${c.status === "active" ? "badge-approved" : "badge-rejected"}`}>
                      {c.status || "pending"}
                    </span>
                </td>

                {/* Kolom rekening — indikator cepat */}
                <td>
                  {!hasBankInfo ? (
                    <span className="badge-status badge-rejected flex w-max items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Belum diisi
                      </span>
                  ) : c.bankVerified ? (
                    <span className="badge-status badge-approved flex w-max items-center gap-1">
                        <BadgeCheck className="w-3 h-3" /> Verified
                      </span>
                  ) : (
                    <span className="badge-status badge-pending flex w-max items-center gap-1">
                        <Clock className="w-3 h-3" /> Pending
                      </span>
                  )}
                </td>

                <td>
                  <div className="flex items-center gap-2">
                    {/* Tombol Eye → buka modal detail */}
                    <button
                      className="btn-outline p-1.5"
                      title="Lihat Detail"
                      onClick={() => setSelectedCustomer(c)}
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>

                    {/* Verify akun */}
                    {!c.verified && (
                      <button
                        onClick={() => verifyCustomer(c.id)}
                        className="p-1.5 rounded-md transition-colors"
                        style={{
                          background: "color-mix(in oklch, oklch(0.55 0.17 160) 15%, transparent)",
                          color: "oklch(0.55 0.17 160)",
                        }}
                        title="Approve & Verify"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Suspend / unsuspend */}
                    {c.verified && (
                      <button
                        onClick={() => toggleSuspendCustomer(c.id, c.status)}
                        className="p-1.5 rounded-md transition-colors"
                        style={{
                          background:
                            c.status === "active"
                              ? "color-mix(in oklch, var(--destructive) 15%, transparent)"
                              : "color-mix(in oklch, oklch(0.55 0.17 160) 15%, transparent)",
                          color:
                            c.status === "active" ? "var(--destructive)" : "oklch(0.55 0.17 160)",
                        }}
                        title={c.status === "active" ? "Suspend User" : "Re-activate User"}
                      >
                        {c.status === "active" ? (
                          <UserX className="w-3.5 h-3.5" />
                        ) : (
                          <UserCheck className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
          {filtered.length === 0 && (
            <tr>
              <td colSpan={7} className="text-center py-6 text-sm" style={{ color: "var(--muted-foreground)" }}>
                Tidak ada nasabah yang cocok
              </td>
            </tr>
          )}
          </tbody>
        </table>
      </div>

      {/* ── Detail Modal ── */}
      {selectedCustomer && (
        <CustomerDetailModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          onVerifyBank={verifyBankAccount}
          isVerifyingBank={isVerifyingBank}
        />
      )}

    </DashboardLayout>
  );
}