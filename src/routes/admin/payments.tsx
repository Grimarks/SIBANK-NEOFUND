import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CheckCircle, XCircle, Eye, AlertCircle, Bell, Search } from "lucide-react";
import { useState } from "react";

// --- Import Firebase & React Query ---
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { collection, getDocs, doc, updateDoc, getDoc, increment } from "firebase/firestore"; // Tambahkan getDoc & increment
import { db } from "@/lib/firebase";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/payments")({
  component: AdminPaymentsPage,
});

interface PaymentRecord {
  id: string;
  customer: string;
  loanId: string;
  amount: number;
  date: string;
  status: "verified" | "pending" | "overdue" | "rejected";
  proofUploaded: boolean;
}

function AdminPaymentsPage() {
  const [filter, setFilter] = useState("all");
  const queryClient = useQueryClient();

  const { data: paymentRecords = [], isLoading, isError } = useQuery({
    queryKey: ["paymentRecords"],
    queryFn: async () => {
      const snap = await getDocs(collection(db, "paymentRecords"));
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as PaymentRecord));
    },
  });

  // FUNGSI UPDATE STATUS PEMBAYARAN & PROGRESS PINJAMAN CUSTOMER
  const updatePaymentStatus = async (paymentId: string, newStatus: string, loanId?: string, amountPaid?: number) => {
    try {
      // 1. Update status record pembayarannya sendiri
      await updateDoc(doc(db, "paymentRecords", paymentId), {
        status: newStatus
      });

      // 2. JIKA DIVERIFIKASI: Tambah cicilan di data 'loans' milik Customer
      if (newStatus === "verified" && loanId && amountPaid) {
        // Kurangi sisa saldo dan tambah jumlah kali bayar (paid + 1)
        await updateDoc(doc(db, "loans", loanId), {
          remainingBalance: increment(-amountPaid),
          paid: increment(1)
        });
      }

      toast.success(`Pembayaran berhasil di-${newStatus === 'verified' ? 'verifikasi' : 'tolak'}!`);
      queryClient.invalidateQueries({ queryKey: ["paymentRecords"] });
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengubah status pembayaran.");
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout role="admin" title="Payment Monitoring" subtitle="Track and verify installment payments">
        <div className="flex justify-center items-center h-40 animate-pulse text-muted-foreground">
          Memuat data pembayaran...
        </div>
      </DashboardLayout>
    );
  }

  if (isError) {
    return (
      <DashboardLayout role="admin" title="Payment Monitoring" subtitle="Track and verify installment payments">
        <div className="flex justify-center items-center h-40 text-red-500 gap-2">
          <AlertCircle className="w-5 h-5" /> Gagal memuat data pembayaran.
        </div>
      </DashboardLayout>
    );
  }

  const filtered = filter === "all" ? paymentRecords : paymentRecords.filter((p) => p.status === filter);

  const stats = [
    { label: "Total Verified", value: paymentRecords.filter(p => p.status === "verified").length.toString(), color: "var(--emerald)" },
    { label: "Pending Review", value: paymentRecords.filter(p => p.status === "pending").length.toString(), color: "var(--warning)" },
    { label: "Overdue", value: paymentRecords.filter(p => p.status === "overdue").length.toString(), color: "var(--destructive)" },
  ];

  return (
    <DashboardLayout role="admin" title="Payment Monitoring" subtitle="Track and verify installment payments">
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{s.label}</p>
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--muted-foreground)" }} />
          <input className="fintech-input pl-9" placeholder="Search payments..." />
        </div>
        <div className="flex gap-2">
          {["all", "verified", "pending", "overdue", "rejected"].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${filter === f ? "gradient-emerald" : ""}`}
                    style={filter === f ? { color: "var(--emerald-foreground)" } : { background: "var(--secondary)", color: "var(--muted-foreground)" }}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="stat-card overflow-x-auto">
        <table className="data-table">
          <thead>
          <tr><th>Payment ID</th><th>Customer</th><th>Loan</th><th>Amount</th><th>Date</th><th>Proof</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
          {filtered.map((p) => (
            <tr key={p.id}>
              <td className="font-medium truncate max-w-[80px]">{p.id}</td>
              <td>{p.customer}</td>
              <td className="truncate max-w-[80px]">{p.loanId}</td>
              <td className="font-semibold">{formatCurrency(p.amount)}</td>
              <td>{formatDate(p.date)}</td>
              <td>{p.proofUploaded ? <CheckCircle className="w-4 h-4" style={{ color: "var(--emerald)" }} /> : <AlertCircle className="w-4 h-4" style={{ color: "var(--destructive)" }} />}</td>
              <td><span className={`badge-status ${p.status === "verified" ? "badge-approved" : p.status === "pending" ? "badge-pending" : p.status === "rejected" ? "badge-rejected" : "badge-completed"}`}>{p.status}</span></td>
              <td>
                <div className="flex items-center gap-1">
                  <button className="btn-outline p-1.5"><Eye className="w-3.5 h-3.5" /></button>
                  {p.status === "pending" && (
                    <>
                      {/* Tombol Verify bawa LoanID dan Amount agar bisa dipotong */}
                      <button
                        onClick={() => updatePaymentStatus(p.id, "verified", p.loanId, p.amount)}
                        className="p-1.5 rounded-md"
                        style={{ background: "color-mix(in oklch, var(--emerald) 15%, transparent)", color: "var(--emerald)" }}
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => updatePaymentStatus(p.id, "rejected")}
                        className="p-1.5 rounded-md"
                        style={{ background: "color-mix(in oklch, var(--destructive) 15%, transparent)", color: "var(--destructive)" }}
                      >
                        <XCircle className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                  {p.status === "overdue" && (
                    <button className="p-1.5 rounded-md" style={{ background: "color-mix(in oklch, var(--warning) 15%, transparent)", color: "var(--warning)" }}>
                      <Bell className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr><td colSpan={8} className="text-center py-4 text-sm text-muted-foreground">Tidak ada pembayaran</td></tr>
          )}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}