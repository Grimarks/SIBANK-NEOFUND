import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Eye, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const Route = createFileRoute("/dashboard/loans")({
  component: MyLoansPage,
});

const statusConfig = {
  approved: { icon: CheckCircle, badge: "badge-approved", label: "Approved" },
  pending: { icon: Clock, badge: "badge-pending", label: "Pending" },
  rejected: { icon: XCircle, badge: "badge-rejected", label: "Rejected" },
  completed: { icon: CheckCircle, badge: "badge-completed", label: "Completed" },
};

// Interface untuk TypeScript
interface CustomerLoan {
  id: string;
  amount: number;
  duration: number;
  rate: number;
  status: "approved" | "completed" | "pending" | "rejected";
  remainingBalance: number;
  paid: number;
  total: number;
  monthlyPayment: number;
  startDate: string;
  nextDue: string;
}

function MyLoansPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");

  // Fetching data dari Firestore
  const { data: customerLoans = [], isLoading, isError } = useQuery({
    queryKey: ["customerLoans"],
    queryFn: async () => {
      const querySnapshot = await getDocs(collection(db, "customerLoans"));
      const loansData: CustomerLoan[] = [];

      querySnapshot.forEach((doc) => {
        loansData.push({ id: doc.id, ...doc.data() } as CustomerLoan);
      });

      return loansData;
    },
  });

  // Tampilan saat data sedang diambil (Loading)
  if (isLoading) {
    return (
      <DashboardLayout role="customer" title="My Loans" subtitle="Track all your loan applications">
        <div className="flex justify-center items-center h-40 animate-pulse">
          <p style={{ color: "var(--muted-foreground)" }}>Memuat data pinjaman...</p>
        </div>
      </DashboardLayout>
    );
  }

  // Tampilan saat terjadi error / gagal fetch
  if (isError) {
    return (
      <DashboardLayout role="customer" title="My Loans" subtitle="Track all your loan applications">
        <div className="flex justify-center items-center h-40 text-red-500 gap-2">
          <AlertCircle className="w-5 h-5" />
          <p>Gagal memuat data dari database.</p>
        </div>
      </DashboardLayout>
    );
  }

  // Filter berjalan menggunakan data yang sudah diambil dari Firestore
  const filtered = filter === "all" ? customerLoans : customerLoans.filter((l) => l.status === filter);

  return (
    <DashboardLayout role="customer" title="My Loans" subtitle="Track all your loan applications">
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {["all", "approved", "pending", "rejected", "completed"].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${filter === f ? "gradient-emerald" : ""}`}
                  style={filter === f ? { color: "var(--emerald-foreground)" } : { background: "var(--secondary)", color: "var(--muted-foreground)" }}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map((loan) => {
          const cfg = statusConfig[loan.status];
          return (
            <div key={loan.id} className="stat-card">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center" style={{ color: "var(--primary-foreground)" }}>
                    <cfg.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold">{loan.id}</p>
                    <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Applied {formatDate(loan.startDate)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 md:gap-6 flex-wrap">
                  <div className="text-left md:text-right">
                    <p className="text-lg font-bold">{formatCurrency(loan.amount)}</p>
                    <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{loan.duration} months @ {loan.rate}%</p>
                  </div>
                  <span className={`badge-status ${cfg.badge}`}>{cfg.label}</span>
                  <button onClick={() => setSelected(selected === loan.id ? null : loan.id)} className="btn-outline p-2">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {selected === loan.id && (
                <div className="mt-4 pt-4 border-t grid md:grid-cols-3 gap-4 animate-fade-in" style={{ borderColor: "var(--border)" }}>
                  <div>
                    <p className="text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>Remaining Balance</p>
                    <p className="font-semibold">{formatCurrency(loan.remainingBalance)}</p>
                  </div>
                  <div>
                    <p className="text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>Monthly Payment</p>
                    <p className="font-semibold">{formatCurrency(loan.monthlyPayment)}</p>
                  </div>
                  <div>
                    <p className="text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>Progress</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full" style={{ background: "var(--secondary)" }}>
                        <div className="h-2 rounded-full gradient-emerald" style={{ width: `${(loan.paid / loan.total) * 100}%` }} />
                      </div>
                      <span className="text-xs font-medium">{loan.paid}/{loan.total}</span>
                    </div>
                  </div>
                  {loan.status === "approved" && (
                    <div className="md:col-span-3 overflow-hidden">
                      <p className="text-xs mb-2 font-medium">Installment Timeline</p>
                      <div className="flex items-center gap-1 flex-wrap pb-2">
                        {Array.from({ length: loan.total }, (_, i) => (
                          <div key={i} className="flex flex-col items-center w-8">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${i < loan.paid ? "gradient-emerald" : ""}`}
                                 style={i < loan.paid ? { color: "var(--emerald-foreground)" } : { border: "2px solid var(--border)", color: "var(--muted-foreground)" }}>
                              {i + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Tambahan UX kecil: Menampilkan pesan jika tidak ada data dari filter tersebut */}
        {filtered.length === 0 && (
          <div className="text-center py-8 text-sm" style={{ color: "var(--muted-foreground)" }}>
            Belum ada pinjaman dengan status ini.
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}