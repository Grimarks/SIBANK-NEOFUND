import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
// dummy-data.ts hanya disisakan untuk fungsi format saja
import { formatCurrency, formatDate } from "@/lib/dummy-data";
import { Upload, Download, CreditCard, Calendar, CheckCircle, AlertCircle } from "lucide-react";
import { useState } from "react";

// --- Import Firebase & React Query ---
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

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

function PaymentsPage() {
  const [showPay, setShowPay] = useState(false);

  // Fetching data transaksi dari Firestore
  const { data: recentTransactions = [], isLoading, isError } = useQuery({
    queryKey: ["recentTransactions"],
    queryFn: async () => {
      const querySnapshot = await getDocs(collection(db, "recentTransactions"));
      const txData: Transaction[] = [];
      querySnapshot.forEach((doc) => {
        txData.push({ id: doc.id, ...doc.data() } as Transaction);
      });
      return txData;
    },
  });

  // Tampilan Loading
  if (isLoading) {
    return (
      <DashboardLayout role="customer" title="Payments" subtitle="Manage installment payments">
        <div className="flex justify-center items-center h-40 animate-pulse">
          <p style={{ color: "var(--muted-foreground)" }}>Memuat riwayat pembayaran...</p>
        </div>
      </DashboardLayout>
    );
  }

  // Tampilan Error
  if (isError) {
    return (
      <DashboardLayout role="customer" title="Payments" subtitle="Manage installment payments">
        <div className="flex justify-center items-center h-40 text-red-500 gap-2">
          <AlertCircle className="w-5 h-5" />
          <p>Gagal memuat data dari database.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="customer" title="Payments" subtitle="Manage installment payments">
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <div className="stat-card gradient-emerald" style={{ color: "var(--emerald-foreground)" }}>
          <CreditCard className="w-5 h-5 mb-3 opacity-80" />
          <p className="text-xs opacity-70">Next Payment</p>
          <p className="text-2xl font-bold">{formatCurrency(1354167)}</p>
          <div className="flex items-center gap-2 mt-2 text-xs opacity-70">
            <Calendar className="w-3 h-3" /> June 15, 2024
          </div>
        </div>
        <div className="stat-card">
          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Total Paid</p>
          <p className="text-2xl font-bold">{formatCurrency(4062501)}</p>
          <p className="text-xs mt-1" style={{ color: "var(--emerald)" }}>3 installments completed</p>
        </div>
        <div className="stat-card">
          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Remaining</p>
          <p className="text-2xl font-bold">{formatCurrency(10250000)}</p>
          <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>9 installments left</p>
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        <button onClick={() => setShowPay(!showPay)} className="btn-emerald">
          <CreditCard className="w-4 h-4" /> Pay Installment
        </button>
        <button className="btn-outline"><Download className="w-4 h-4" /> Download Invoice</button>
      </div>

      {showPay && (
        <div className="stat-card mb-6 animate-scale-in">
          <h3 className="font-semibold mb-4">Pay Installment</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>Loan ID</label>
              <select className="fintech-input"><option>LN-2024-001</option></select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>Amount</label>
              <input className="fintech-input" value="Rp 1,354,167" readOnly />
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
          {/* Filter menggunakan data dari Firestore */}
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