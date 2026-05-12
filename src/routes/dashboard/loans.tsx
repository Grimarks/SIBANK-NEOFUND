import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Eye, EyeOff, Clock, CheckCircle, XCircle, AlertCircle, BadgeCheck } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";

export const Route = createFileRoute("/dashboard/loans")({
  component: MyLoansPage,
});

const statusConfig: Record<string, { icon: React.ElementType; badge: string; label: string }> = {
  approved:  { icon: CheckCircle, badge: "badge-approved",  label: "Approved"  },
  pending:   { icon: Clock,       badge: "badge-pending",   label: "Pending"   },
  rejected:  { icon: XCircle,     badge: "badge-rejected",  label: "Rejected"  },
  completed: { icon: BadgeCheck,  badge: "badge-completed", label: "Completed" },
};

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

function MyLoansPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter]     = useState("all");

  const { data: customerLoans = [], isLoading, isError } = useQuery({
    queryKey: ["loans", auth.currentUser?.uid],
    queryFn: async () => {
      if (!auth.currentUser) return [];
      const q    = query(collection(db, "loans"), where("userId", "==", auth.currentUser.uid));
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as CustomerLoan));
    },
    enabled: !!auth.currentUser,
  });

  if (isLoading)
    return (
      <DashboardLayout role="customer" title="My Loans" subtitle="Track all your loan applications">
        <div className="flex justify-center items-center h-40 animate-pulse">
          <p style={{ color: "var(--muted-foreground)" }}>Memuat data pinjaman...</p>
        </div>
      </DashboardLayout>
    );

  if (isError)
    return (
      <DashboardLayout role="customer" title="My Loans" subtitle="Track all your loan applications">
        <div className="flex justify-center items-center h-40 text-red-500 gap-2">
          <AlertCircle className="w-5 h-5" />
          <p>Gagal memuat data dari database.</p>
        </div>
      </DashboardLayout>
    );

  const filtered =
    filter === "all"
      ? customerLoans
      : customerLoans.filter(l => l.status?.toLowerCase() === filter);

  return (
    <DashboardLayout role="customer" title="My Loans" subtitle="Track all your loan applications">
      {/* Filter pills */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {["all", "approved", "pending", "rejected", "completed"].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${filter === f ? "gradient-emerald" : ""}`}
            style={
              filter === f
                ? { color: "var(--emerald-foreground)" }
                : { background: "var(--secondary)", color: "var(--muted-foreground)" }
            }
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map(loan => {
          const safeStatus  = loan.status?.toLowerCase() ?? "pending";
          const cfg         = statusConfig[safeStatus] ?? { icon: AlertCircle, badge: "badge-pending", label: loan.status || "Unknown" };
          const isCompleted = safeStatus === "completed";
          const progress    = loan.total > 0 ? Math.min((loan.paid ?? 0) / loan.total, 1) : 0;
          const isExpanded  = selected === loan.id;

          return (
            <div
              key={loan.id}
              className="stat-card relative overflow-hidden transition-all"
              style={isCompleted ? { opacity: 0.55, filter: "grayscale(0.6)" } : {}}
            >
              {/* Overlay LUNAS — hanya untuk completed */}
              {isCompleted && (
                <div
                  className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl pointer-events-none"
                  style={{ background: "rgba(0,0,0,0.12)", backdropFilter: "blur(1.5px)" }}
                >
                  <span
                    className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold"
                    style={{
                      background: "var(--card)",
                      color: "var(--muted-foreground)",
                      border: "1px solid var(--border)",
                      boxShadow: "0 2px 16px rgba(0,0,0,0.12)",
                    }}
                  >
                    <BadgeCheck className="w-4 h-4" />
                    LUNAS
                  </span>
                </div>
              )}

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: isCompleted ? "var(--secondary)" : "var(--primary)",
                      color: isCompleted ? "var(--muted-foreground)" : "var(--primary-foreground)",
                    }}
                  >
                    <cfg.icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold truncate max-w-[160px]" title={loan.id}>{loan.id}</p>
                    <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                      Applied {formatDate(loan.startDate)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 md:gap-6 flex-wrap">
                  {/* Progress mini-bar — selalu terlihat */}
                  {safeStatus === "approved" && (
                    <div className="hidden md:flex flex-col gap-1 min-w-[100px]">
                      <div className="flex justify-between text-[10px]" style={{ color: "var(--muted-foreground)" }}>
                        <span>Cicilan</span>
                        <span>{loan.paid ?? 0}/{loan.total ?? 0}</span>
                      </div>
                      <div className="h-1.5 rounded-full w-[100px]" style={{ background: "var(--secondary)" }}>
                        <div
                          className="h-1.5 rounded-full gradient-emerald transition-all"
                          style={{ width: `${progress * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="text-left md:text-right">
                    <p className="text-lg font-bold">{formatCurrency(loan.amount)}</p>
                    <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                      {loan.duration} bulan @ {loan.rate}%
                    </p>
                  </div>

                  <span className={`badge-status ${cfg.badge}`}>{cfg.label}</span>

                  {/* Tombol detail — disabled & ikon berbeda jika completed */}
                  <button
                    onClick={() => !isCompleted && setSelected(isExpanded ? null : loan.id)}
                    disabled={isCompleted}
                    className="btn-outline p-2 transition-opacity"
                    style={isCompleted ? { opacity: 0.35, cursor: "not-allowed" } : {}}
                    title={isCompleted ? "Pinjaman telah lunas" : isExpanded ? "Sembunyikan detail" : "Lihat detail"}
                  >
                    {isCompleted ? <EyeOff className="w-4 h-4" /> : isExpanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Detail panel — hanya untuk loan aktif yang di-expand */}
              {isExpanded && !isCompleted && (
                <div
                  className="mt-4 pt-4 border-t grid md:grid-cols-3 gap-4 animate-fade-in"
                  style={{ borderColor: "var(--border)" }}
                >
                  <div>
                    <p className="text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>Sisa Tagihan</p>
                    <p className="font-semibold">{formatCurrency(loan.remainingBalance ?? 0)}</p>
                  </div>
                  <div>
                    <p className="text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>Cicilan / Bulan</p>
                    <p className="font-semibold">{formatCurrency(loan.monthlyPayment ?? 0)}</p>
                  </div>
                  <div>
                    <p className="text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>Progress</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full" style={{ background: "var(--secondary)" }}>
                        <div
                          className="h-2 rounded-full gradient-emerald transition-all"
                          style={{ width: `${progress * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium">
                        {loan.paid ?? 0}/{loan.total ?? 0}
                      </span>
                    </div>
                  </div>
                  {loan.nextDue && (
                    <div>
                      <p className="text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>Jatuh Tempo Berikutnya</p>
                      <p className="font-semibold">{formatDate(loan.nextDue)}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-8 text-sm" style={{ color: "var(--muted-foreground)" }}>
            Belum ada pinjaman dengan status ini.
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
