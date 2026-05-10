import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Upload, Download, CreditCard, Calendar, CheckCircle, AlertCircle } from "lucide-react";
import { useState } from "react";

// --- Import Firebase & React Query ---
import { useQuery } from "@tanstack/react-query";
// Tambahkan query dan where
import { collection, getDocs, query, where } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";

export const Route = createFileRoute("/dashboard/payments")({
  component: PaymentsPage,
});

// Interface untuk TypeScript
interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: string;
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
  const [showPay, setShowPay] = useState(false);
  const [selectedLoanId, setSelectedLoanId] = useState("");

  // 1. Fetching Riwayat Transaksi (HANYA MILIK USER INI)
  const {
    data: recentTransactions = [],
    isLoading: isTxLoading,
    isError: isTxError,
  } = useQuery({
    queryKey: ["recentTransactions", auth.currentUser?.uid],
    queryFn: async () => {
      if (!auth.currentUser) return [];

      const q = query(
        collection(db, "recentTransactions"),
        where("userId", "==", auth.currentUser.uid)
      );

      const querySnapshot = await getDocs(q);
      const txData: Transaction[] = [];
      querySnapshot.forEach((doc) => {
        txData.push({ id: doc.id, ...doc.data() } as Transaction);
      });
      return txData;
    },
    enabled: !!auth.currentUser, // Hanya jalan kalau user sudah login
  });

  // 2. Fetching Pinjaman (Untuk menghitung tagihan di bagian atas)
  const { data: customerLoans = [], isLoading: isLoansLoading } = useQuery({
    queryKey: ["customerLoans", auth.currentUser?.uid],
    queryFn: async () => {
      if (!auth.currentUser) return [];
      const q = query(collection(db, "customerLoans"), where("userId", "==", auth.currentUser.uid));
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as CustomerLoan));
    },
    enabled: !!auth.currentUser,
  });

  // Tampilan Loading
  if (isTxLoading || isLoansLoading) {
    return (
      <DashboardLayout role="customer" title="Payments" subtitle="Manage installment payments">
        <div className="flex justify-center items-center h-40 animate-pulse">
          <p style={{ color: "var(--muted-foreground)" }}>Memuat data pembayaran...</p>
        </div>
      </DashboardLayout>
    );
  }

  // Tampilan Error
  if (isTxError) {
    return (
      <DashboardLayout role="customer" title="Payments" subtitle="Manage installment payments">
        <div className="flex justify-center items-center h-40 text-red-500 gap-2">
          <AlertCircle className="w-5 h-5" />
          <p>Gagal memuat data dari database.</p>
        </div>
      </DashboardLayout>
    );
  }

  // Kalkulasi Statistik Dinamis
  // Cari pinjaman yang disetujui (aktif)
  const activeLoans = customerLoans.filter((l) => l.status === "approved");
  const activeLoan = activeLoans.length > 0 ? activeLoans[0] : null;

  // Jika tidak ada pinjaman aktif, nilai fallback ke 0
  const nextPaymentAmount = activeLoan?.monthlyPayment || 0;
  const remainingBalance = activeLoan?.remainingBalance || 0;
  const totalPaidAmount = activeLoan ? (activeLoan.total - activeLoan.paid) * activeLoan.monthlyPayment : 0; // Asumsi perhitungan sederhana

  return (
    <DashboardLayout role="customer" title="Payments" subtitle="Manage installment payments">
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <div className="stat-card gradient-emerald" style={{ color: "var(--emerald-foreground)" }}>
          <CreditCard className="w-5 h-5 mb-3 opacity-80" />
          <p className="text-xs opacity-70">Next Payment</p>
          <p className="text-2xl font-bold">{formatCurrency(nextPaymentAmount)}</p>
          <div className="flex items-center gap-2 mt-2 text-xs opacity-70">
            <Calendar className="w-3 h-3" /> {activeLoan?.nextDue ? `Due ${activeLoan.nextDue}` : "No upcoming due"}
          </div>
        </div>
        <div className="stat-card">
          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Total Paid</p>
          {/* Untuk sederhananya kita hitung dari progress yang sudah dibayar */}
          <p className="text-2xl font-bold">{formatCurrency(activeLoan ? (activeLoan.paid * activeLoan.monthlyPayment) : 0)}</p>
          <p className="text-xs mt-1" style={{ color: "var(--emerald)" }}>
            {activeLoan?.paid || 0} installments completed
          </p>
        </div>
        <div className="stat-card">
          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Remaining</p>
          <p className="text-2xl font-bold">{formatCurrency(remainingBalance)}</p>
          <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
            {activeLoan ? activeLoan.total - activeLoan.paid : 0} installments left
          </p>
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        <button onClick={() => setShowPay(!showPay)} className="btn-emerald" disabled={!activeLoan}>
          <CreditCard className="w-4 h-4" /> Pay Installment
        </button>
        <button className="btn-outline"><Download className="w-4 h-4" /> Download Invoice</button>
      </div>

      {showPay && activeLoan && (
        <div className="stat-card mb-6 animate-scale-in">
          <h3 className="font-semibold mb-4">Pay Installment</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>Loan ID</label>
              <select
                className="fintech-input"
                value={selectedLoanId}
                onChange={(e) => setSelectedLoanId(e.target.value)}
              >
                <option value="">-- Select Loan --</option>
                {activeLoans.map(loan => (
                  <option key={loan.id} value={loan.id}>{loan.id}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>Amount</label>
              {/* Nominal disesuaikan otomatis dengan pinjaman yang dipilih */}
              <input
                className="fintech-input"
                value={selectedLoanId ? formatCurrency(activeLoans.find(l => l.id === selectedLoanId)?.monthlyPayment || 0) : "Rp 0"}
                readOnly
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>Upload Payment Proof</label>
            <div className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer" style={{ borderColor: "var(--border)" }}>
              <Upload className="w-6 h-6 mx-auto mb-2" style={{ color: "var(--muted-foreground)" }} />
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Click to upload receipt or proof of transfer</p>
            </div>
          </div>
          <button className="btn-emerald mt-4"><CheckCircle className="w-4 h-4" /> Submit Payment</button>
        </div>
      )}

      <div className="stat-card overflow-x-auto">
        <h3 className="font-semibold mb-4">Payment History</h3>
        <table className="data-table">
          <thead>
          <tr><th>Date</th><th>Description</th><th>Amount</th><th>Status</th></tr>
          </thead>
          <tbody>
          {/* Filter tipe transaksi */}
          {recentTransactions.filter((t) => t.type === "payment").map((t) => (
            <tr key={t.id}>
              <td>{formatDate(t.date)}</td>
              <td>{t.description}</td>
              <td className="font-semibold">{formatCurrency(Math.abs(t.amount))}</td>
              <td><span className="badge-status badge-approved">Verified</span></td>
            </tr>
          ))}

          {recentTransactions.filter((t) => t.type === "payment").length === 0 && (
            <tr>
              <td colSpan={4} className="text-center py-4 text-sm" style={{ color: "var(--muted-foreground)" }}>
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