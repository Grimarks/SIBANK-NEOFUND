import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Upload, Download, CreditCard, Calendar, CheckCircle, AlertCircle, Clock, XCircle } from "lucide-react";
import { useState } from "react";

// --- Import Firebase & React Query ---
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
  const [showPay, setShowPay] = useState(false);
  const [selectedLoanId, setSelectedLoanId] = useState("");
  // STATE UNTUK GIMMICK BUKTI TRANSFER
  const [paymentProofName, setPaymentProofName] = useState("");
  const queryClient = useQueryClient();

  const { data: paymentRecords = [], isLoading: isPayLoading, isError: isPayError } = useQuery({
    queryKey: ["userPaymentRecords", auth.currentUser?.uid],
    queryFn: async () => {
      if (!auth.currentUser) return [];
      const q = query(collection(db, "paymentRecords"), where("userId", "==", auth.currentUser.uid));
      const querySnapshot = await getDocs(q);
      const payData: PaymentRecord[] = [];
      querySnapshot.forEach((doc) => payData.push({ id: doc.id, ...doc.data() } as PaymentRecord));

      return payData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },
    enabled: !!auth.currentUser,
  });

  const { data: customerLoans = [], isLoading: isLoansLoading } = useQuery({
    queryKey: ["loans", auth.currentUser?.uid],
    queryFn: async () => {
      if (!auth.currentUser) return [];
      const q = query(collection(db, "loans"), where("userId", "==", auth.currentUser.uid));
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as CustomerLoan));
    },
    enabled: !!auth.currentUser,
  });

  const activeLoans = customerLoans.filter((l) => l.status === "approved");
  const activeLoan = activeLoans.find(l => l.id === selectedLoanId) || (activeLoans.length > 0 ? activeLoans[0] : null);

  const { mutate: submitPayment, isPending: isSubmitting } = useMutation({
    mutationFn: async () => {
      if (!auth.currentUser || !selectedLoanId || !activeLoan) throw new Error("Invalid request");
      const today = new Date().toISOString().split("T")[0];

      await addDoc(collection(db, "paymentRecords"), {
        userId: auth.currentUser.uid,
        customer: auth.currentUser.email,
        loanId: selectedLoanId,
        amount: activeLoan.monthlyPayment,
        date: today,
        status: "pending",
        proofUploaded: true
      });

      await addDoc(collection(db, "recentTransactions"), {
        userId: auth.currentUser.uid,
        date: today,
        description: `Installment Payment - ${selectedLoanId.substring(0, 6)}...`,
        amount: -(activeLoan.monthlyPayment),
        type: "payment"
      });
    },
    onSuccess: () => {
      toast.success("Pembayaran berhasil dikirim! Menunggu verifikasi admin.");
      setShowPay(false);
      setPaymentProofName(""); // Reset nama file setelah sukses
      queryClient.invalidateQueries({ queryKey: ["userPaymentRecords"] });
      queryClient.invalidateQueries({ queryKey: ["recentTransactions"] });
    },
    onError: () => {
      toast.error("Gagal mengirim pembayaran.");
    }
  });

  if (isPayLoading || isLoansLoading) return <DashboardLayout role="customer" title="Payments" subtitle="Manage installment payments"><div className="flex justify-center items-center h-40 animate-pulse text-muted-foreground">Memuat data pembayaran...</div></DashboardLayout>;
  if (isPayError) return <DashboardLayout role="customer" title="Payments" subtitle="Manage installment payments"><div className="flex justify-center items-center h-40 text-red-500 gap-2"><AlertCircle className="w-5 h-5" /> Gagal memuat data.</div></DashboardLayout>;

  const nextPaymentAmount = activeLoan?.monthlyPayment || 0;
  const remainingBalance = activeLoan?.remainingBalance || 0;

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
          <p className="text-2xl font-bold">{formatCurrency(activeLoan ? (activeLoan.paid * activeLoan.monthlyPayment) : 0)}</p>
          <p className="text-xs mt-1" style={{ color: "var(--emerald)" }}>{activeLoan?.paid || 0} installments completed</p>
        </div>
        <div className="stat-card">
          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Remaining</p>
          <p className="text-2xl font-bold">{formatCurrency(remainingBalance)}</p>
          <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>{activeLoan ? activeLoan.total - activeLoan.paid : 0} installments left</p>
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        <button onClick={() => setShowPay(!showPay)} className="btn-emerald" disabled={activeLoans.length === 0}>
          <CreditCard className="w-4 h-4" /> Pay Installment
        </button>
        <button className="btn-outline"><Download className="w-4 h-4" /> Download Invoice</button>
      </div>

      {showPay && activeLoans.length > 0 && (
        <div className="stat-card mb-6 animate-scale-in">
          <h3 className="font-semibold mb-4">Pay Installment</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>Loan ID</label>
              <select className="fintech-input" value={selectedLoanId} onChange={(e) => setSelectedLoanId(e.target.value)}>
                <option value="">-- Select Loan --</option>
                {activeLoans.map(loan => <option key={loan.id} value={loan.id}>{loan.id}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>Amount</label>
              <input className="fintech-input" value={selectedLoanId ? formatCurrency(activeLoan?.monthlyPayment || 0) : "Rp 0"} readOnly />
            </div>
          </div>

          {/* UPLOAD BUKTI TRANSFER GIMMICK */}
          <div className="mt-4">
            <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>Upload Payment Proof</label>
            <label
              className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:border-emerald transition-colors block"
              style={{ borderColor: paymentProofName ? "var(--emerald)" : "var(--border)" }}
            >
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setPaymentProofName(e.target.files[0].name);
                  }
                }}
              />
              <Upload className="w-6 h-6 mx-auto mb-2" style={{ color: paymentProofName ? "var(--emerald)" : "var(--muted-foreground)" }} />
              {paymentProofName ? (
                <p className="text-sm font-medium" style={{ color: "var(--emerald)" }}>{paymentProofName}</p>
              ) : (
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Click to upload receipt or proof of transfer</p>
              )}
            </label>
          </div>

          {/* Tombol akan ter-disable jika belum pura-pura upload */}
          <button
            onClick={() => submitPayment()}
            disabled={isSubmitting || !selectedLoanId || !paymentProofName}
            className="btn-emerald mt-4"
          >
            {isSubmitting ? "Memproses..." : <><CheckCircle className="w-4 h-4" /> Submit Payment</>}
          </button>
        </div>
      )}

      <div className="stat-card overflow-x-auto">
        <h3 className="font-semibold mb-4">Payment History</h3>
        <table className="data-table">
          <thead><tr><th>Date</th><th>Loan ID</th><th>Amount</th><th>Status</th></tr></thead>
          <tbody>
          {paymentRecords.map((p) => (
            <tr key={p.id}>
              <td>{formatDate(p.date)}</td>
              <td className="truncate max-w-[120px]" title={p.loanId}>{p.loanId}</td>
              <td className="font-semibold">{formatCurrency(p.amount)}</td>
              <td>
                <span className={`badge-status flex items-center w-max gap-1 ${
                  p.status === "verified" ? "badge-approved" :
                    p.status === "rejected" ? "badge-rejected" : "badge-pending"
                }`}>
                  {p.status === "verified" ? <CheckCircle className="w-3 h-3"/> :
                    p.status === "rejected" ? <XCircle className="w-3 h-3"/> : <Clock className="w-3 h-3"/>}
                  <span className="capitalize">{p.status}</span>
                </span>
              </td>
            </tr>
          ))}
          {paymentRecords.length === 0 && (
            <tr><td colSpan={4} className="text-center py-4 text-sm text-muted-foreground">Belum ada riwayat pembayaran.</td></tr>
          )}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}