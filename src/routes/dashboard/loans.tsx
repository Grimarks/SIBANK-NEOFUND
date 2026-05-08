import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { customerLoans, formatCurrency, formatDate } from "@/lib/dummy-data";
import { Eye, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/dashboard/loans")({
  component: MyLoansPage,
});

const statusConfig = {
  approved: { icon: CheckCircle, badge: "badge-approved", label: "Approved" },
  pending: { icon: Clock, badge: "badge-pending", label: "Pending" },
  rejected: { icon: XCircle, badge: "badge-rejected", label: "Rejected" },
  completed: { icon: CheckCircle, badge: "badge-completed", label: "Completed" },
};

function MyLoansPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
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
      </div>
    </DashboardLayout>
  );
}
