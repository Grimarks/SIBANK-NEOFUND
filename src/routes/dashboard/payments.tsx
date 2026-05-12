import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Upload, Download, CreditCard, Calendar,
  CheckCircle, AlertCircle, Clock, XCircle, BadgeCheck, Trophy,
} from "lucide-react";
import { useState } from "react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { collection, getDocs, query, where, addDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/payments")({
  component: PaymentsPage,
});

interface PaymentRecord {
  id: string;
  date: string;
  loanId: string;
  amount: number;
  status: "verified" | "pending" | "rejected" | "overdue";
}

interface CustomerLoan {
  id: string;
  amount: number;
  duration: number;
  rate: number;
  status: string;
  remainingBalance: number;
  paid: number;
  total: number;
  monthlyPayment: number;
  startDate: string;
  nextDue: string;
}

function PaymentsPage() {
  const [showPay, setShowPay]                   = useState(false);
  const [selectedLoanId, setSelectedLoanId]     = useState("");
  const [paymentProofName, setPaymentProofName] = useState("");
  const queryClient = useQueryClient();

  /* ── fetch riwayat pembayaran milik user ── */
  const { data: paymentRecords = [], isLoading: isPayLoading, isError: isPayError } = useQuery({
    queryKey: ["userPaymentRecords", auth.currentUser?.uid],
    queryFn: async () => {
      if (!auth.currentUser) return [];
      const q    = query(collection(db, "paymentRecords"), where("userId", "==", auth.currentUser.uid));
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as PaymentRecord));
      return data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },
    enabled: !!auth.currentUser,
  });

  /* ── fetch semua loan milik user ── */
  const { data: customerLoans = [], isLoading: isLoansLoading } = useQuery({
    queryKey: ["loans", auth.currentUser?.uid],
    queryFn: async () => {
      if (!auth.currentUser) return [];
      const q    = query(collection(db, "loans"), where("userId", "==", auth.currentUser.uid));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as CustomerLoan));
    },
    enabled: !!auth.currentUser,
  });

  /* ── derivasi status ── */
  // Hanya loan "approved" yang masih boleh dibayar
  const activeLoans    = customerLoans.filter(l => l.status === "approved");
  const completedLoans = customerLoans.filter(l => l.status === "completed");
  const hasAnyLoan     = customerLoans.length > 0;
  const allCompleted   = hasAnyLoan && activeLoans.length === 0 && completedLoans.length > 0;

  // Loan aktif yang sedang dipilih (fallback ke loan pertama)
  const activeLoan =
    activeLoans.find(l => l.id === selectedLoanId) ??
    (activeLoans.length > 0 ? activeLoans[0] : null);

  /* ── Cek apakah loan yang dipilih sudah punya pending payment ── */
  // Cegah double-submit untuk cicilan bulan yang sama / sudah ada pending
  const hasPendingForSelected = paymentRecords.some(
    p => p.loanId === selectedLoanId && p.status === "pending",
  );

  /* ── submit cicilan ── */
  const { mutate: submitPayment, isPending: isSubmitting } = useMutation({
    mutationFn: async () => {
      if (!auth.currentUser || !selectedLoanId || !activeLoan) throw new Error("Invalid request");
      const today = new Date().toISOString().split("T")[0];

      await addDoc(collection(db, "paymentRecords"), {
        userId:        auth.currentUser.uid,
        customer:      auth.currentUser.email,
        loanId:        selectedLoanId,
        amount:        activeLoan.monthlyPayment,
        date:          today,
        status:        "pending",
        proofUploaded: true,
      });

      await addDoc(collection(db, "recentTransactions"), {
        userId:      auth.currentUser.uid,
        date:        today,
        description: `Installment Payment - ${selectedLoanId.substring(0, 6)}...`,
        amount:      -(activeLoan.monthlyPayment),
        type:        "payment",
      });
    },
    onSuccess: () => {
      toast.success("Pembayaran berhasil dikirim! Menunggu verifikasi admin.");
      setShowPay(false);
      setPaymentProofName("");
      setSelectedLoanId("");
      queryClient.invalidateQueries({ queryKey: ["userPaymentRecords"] });
      queryClient.invalidateQueries({ queryKey: ["recentTransactions"] });
    },
    onError: () => {
      toast.error("Gagal mengirim pembayaran.");
    },
  });

  /* ── loading / error ── */
  if (isPayLoading || isLoansLoading)
    return (
      <DashboardLayout role="customer" title="Payments" subtitle="Manage installment payments">
        <div className="flex justify-center items-center h-40 animate-pulse text-muted-foreground">
          Memuat data pembayaran...
        </div>
      </DashboardLayout>
    );

  if (isPayError)
    return (
      <DashboardLayout role="customer" title="Payments" subtitle="Manage installment payments">
        <div className="flex justify-center items-center h-40 text-red-500 gap-2">
          <AlertCircle className="w-5 h-5" /> Gagal memuat data.
        </div>
      </DashboardLayout>
    );

  /* ── summary numbers ── */
  const nextPaymentAmount = activeLoan?.monthlyPayment   ?? 0;
  const remainingBalance  = activeLoan?.remainingBalance ?? 0;
  const totalPaid         = activeLoan ? (activeLoan.paid ?? 0) * (activeLoan.monthlyPayment ?? 0) : 0;

  return (
    <DashboardLayout role="customer" title="Payments" subtitle="Manage installment payments">

      {/* Banner semua lunas */}
      {allCompleted && (
        <div
          className="flex items-center gap-3 p-4 rounded-xl mb-6"
          style={{
            background: "color-mix(in oklch, oklch(0.55 0.17 160) 12%, transparent)",
            border:     "1px solid color-mix(in oklch, oklch(0.55 0.17 160) 30%, transparent)",
          }}
        >
          <Trophy className="w-5 h-5 flex-shrink-0" style={{ color: "oklch(0.55 0.17 160)" }} />
          <div>
            <p className="text-sm font-semibold" style={{ color: "oklch(0.55 0.17 160)" }}>
              Semua pinjaman telah dilunasi!
            </p>
            <p className="text-xs mt-0.5" style={{ color: "oklch(0.55 0.17 160)", opacity: 0.8 }}>
              Tidak ada cicilan yang perlu dibayar saat ini.
            </p>
          </div>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <div
          className={`stat-card ${activeLoans.length > 0 ? "gradient-emerald" : ""}`}
          style={activeLoans.length > 0 ? { color: "var(--emerald-foreground)" } : { background: "var(--secondary)" }}
        >
          <CreditCard className="w-5 h-5 mb-3 opacity-80" />
          <p className="text-xs opacity-70">{allCompleted ? "Status Pembayaran" : "Next Payment"}</p>
          {allCompleted ? (
            <div className="flex items-center gap-2 mt-1">
              <BadgeCheck className="w-5 h-5" style={{ color: "oklch(0.55 0.17 160)" }} />
              <p className="text-lg font-bold" style={{ color: "oklch(0.55 0.17 160)" }}>Semua Lunas</p>
            </div>
          ) : (
            <p className="text-2xl font-bold">{formatCurrency(nextPaymentAmount)}</p>
          )}
          <div className="flex items-center gap-2 mt-2 text-xs opacity-70">
            <Calendar className="w-3 h-3" />
            {activeLoan?.nextDue
              ? `Jatuh tempo ${activeLoan.nextDue}`
              : allCompleted
              ? "Tidak ada tagihan"
              : "Tidak ada pinjaman aktif"}
          </div>
        </div>

        <div className="stat-card">
          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Total Dibayar</p>
          <p className="text-2xl font-bold">{formatCurrency(totalPaid)}</p>
          <p className="text-xs mt-1" style={{ color: "oklch(0.55 0.17 160)" }}>
            {activeLoan?.paid ?? 0} cicilan selesai
          </p>
        </div>

        <div className="stat-card">
          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Sisa Tagihan</p>
          <p className="text-2xl font-bold">
            {allCompleted
              ? <span style={{ color: "oklch(0.55 0.17 160)" }}>Rp 0</span>
              : formatCurrency(remainingBalance)}
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
            {activeLoan
              ? `${(activeLoan.total ?? 0) - (activeLoan.paid ?? 0)} cicilan tersisa`
              : allCompleted
              ? "Semua cicilan lunas"
              : "Tidak ada pinjaman aktif"}
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 mb-6">
        <div className="relative group">
          <button
            onClick={() => activeLoans.length > 0 && setShowPay(!showPay)}
            disabled={activeLoans.length === 0}
            className={`btn-emerald flex items-center gap-2 ${activeLoans.length === 0 ? "opacity-40 cursor-not-allowed" : ""}`}
          >
            <CreditCard className="w-4 h-4" />
            {allCompleted ? "Tidak Ada Tagihan" : "Pay Installment"}
          </button>
          {activeLoans.length === 0 && (
            <div
              className="absolute bottom-full left-0 mb-2 px-3 py-2 rounded-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"
              style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--foreground)", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}
            >
              {allCompleted ? "✓ Semua pinjaman sudah lunas" : "Tidak ada pinjaman aktif"}
            </div>
          )}
        </div>
        <button className="btn-outline flex items-center gap-2">
          <Download className="w-4 h-4" /> Download Invoice
        </button>
      </div>

      {/* Form pembayaran */}
      {showPay && activeLoans.length > 0 && (
        <div className="stat-card mb-6 animate-scale-in">
          <h3 className="font-semibold mb-4">Pay Installment</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>
                Loan ID
              </label>
              <select
                className="fintech-input"
                value={selectedLoanId}
                onChange={e => setSelectedLoanId(e.target.value)}
              >
                <option value="">-- Pilih Pinjaman --</option>
                {/* Hanya loan "approved" tampil di sini — completed tidak ada */}
                {activeLoans.map(loan => (
                  <option key={loan.id} value={loan.id}>{loan.id}</option>
                ))}
              </select>
              {/* Info cicilan lunas tidak ditampilkan */}
              {completedLoans.length > 0 && (
                <p className="text-[11px] mt-1.5 flex items-center gap-1" style={{ color: "var(--muted-foreground)" }}>
                  <BadgeCheck className="w-3 h-3" />
                  {completedLoans.length} pinjaman lunas tidak ditampilkan
                </p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>
                Jumlah Cicilan
              </label>
              <input
                className="fintech-input opacity-70 cursor-not-allowed"
                value={selectedLoanId ? formatCurrency(activeLoan?.monthlyPayment ?? 0) : "Rp 0"}
                readOnly
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>
              Upload Bukti Transfer
            </label>
            <label
              className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors block"
              style={{ borderColor: paymentProofName ? "oklch(0.55 0.17 160)" : "var(--border)" }}
            >
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => { if (e.target.files?.[0]) setPaymentProofName(e.target.files[0].name); }}
              />
              <Upload className="w-6 h-6 mx-auto mb-2" style={{ color: paymentProofName ? "oklch(0.55 0.17 160)" : "var(--muted-foreground)" }} />
              {paymentProofName
                ? <p className="text-sm font-medium" style={{ color: "oklch(0.55 0.17 160)" }}>{paymentProofName}</p>
                : <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Klik untuk upload bukti transfer (jpg, png)</p>}
            </label>
          </div>

          {/* Warning jika loan ini sudah punya pending payment */}
          {hasPendingForSelected && selectedLoanId && (
            <div
              className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
              style={{
                background: "color-mix(in oklch, var(--warning) 12%, transparent)",
                color: "var(--warning)",
                border: "1px solid color-mix(in oklch, var(--warning) 30%, transparent)",
              }}
            >
              <Clock className="w-3.5 h-3.5 flex-shrink-0" />
              Pinjaman ini sudah memiliki pembayaran yang menunggu verifikasi admin.
            </div>
          )}

          <button
            onClick={() => submitPayment()}
            disabled={isSubmitting || !selectedLoanId || !paymentProofName || hasPendingForSelected}
            className="btn-emerald mt-4 flex items-center gap-2"
          >
            {isSubmitting
              ? "Memproses..."
              : <><CheckCircle className="w-4 h-4" /> Submit Pembayaran</>}
          </button>
        </div>
      )}

      {/* Riwayat pembayaran */}
      <div className="stat-card overflow-x-auto">
        <h3 className="font-semibold mb-4">Riwayat Pembayaran</h3>
        <table className="data-table">
          <thead>
            <tr><th>Tanggal</th><th>Loan ID</th><th>Jumlah</th><th>Status</th></tr>
          </thead>
          <tbody>
            {paymentRecords.map(p => {
              /* Loan ID di-grey-out jika loan sudah completed */
              const loanDone = completedLoans.some(l => l.id === p.loanId);
              return (
                <tr key={p.id} style={loanDone ? { opacity: 0.55 } : {}}>
                  <td>{formatDate(p.date)}</td>
                  <td
                    className="truncate max-w-[120px] font-mono text-xs"
                    title={p.loanId}
                    style={loanDone ? { color: "var(--muted-foreground)", textDecoration: "line-through" } : {}}
                  >
                    {p.loanId}
                  </td>
                  <td className="font-semibold">{formatCurrency(p.amount)}</td>
                  <td>
                    <span className={`badge-status flex items-center w-max gap-1 ${
                      p.status === "verified"  ? "badge-approved"
                      : p.status === "rejected" ? "badge-rejected"
                      : "badge-pending"
                    }`}>
                      {p.status === "verified"  ? <CheckCircle className="w-3 h-3" />
                       : p.status === "rejected" ? <XCircle className="w-3 h-3" />
                       : <Clock className="w-3 h-3" />}
                      <span className="capitalize">{p.status}</span>
                    </span>
                  </td>
                </tr>
              );
            })}
            {paymentRecords.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-4 text-sm text-muted-foreground">
                  Belum ada riwayat pembayaran.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
