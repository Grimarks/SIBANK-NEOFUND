import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CheckCircle, XCircle, Eye, AlertTriangle, Clock, Shield, AlertCircle } from "lucide-react";
import { useState } from "react";

// --- Import Firebase & React Query ---
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const Route = createFileRoute("/admin/loans")({
  component: LoanApprovalPage,
});

const riskColors = { low: "badge-approved", medium: "badge-pending", high: "badge-rejected" };

interface AdminLoan {
  id: string;
  customer: string;
  amount: number;
  duration: number;
  rate: number;
  status: "approved" | "completed" | "pending" | "rejected";
  riskLevel: "low" | "medium" | "high";
  appliedDate: string;
}

function LoanApprovalPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");

  const { data: adminLoans = [], isLoading, isError } = useQuery({
    queryKey: ["adminLoans"],
    queryFn: async () => {
      const snap = await getDocs(collection(db, "adminLoans"));
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as AdminLoan));
    },
  });

  if (isLoading) {
    return (
      <DashboardLayout role="admin" title="Loan Approval" subtitle="Review and manage loan applications">
        <div className="flex justify-center items-center h-40 animate-pulse text-muted-foreground">
          Memuat data pinjaman...
        </div>
      </DashboardLayout>
    );
  }

  if (isError) {
    return (
      <DashboardLayout role="admin" title="Loan Approval" subtitle="Review and manage loan applications">
        <div className="flex justify-center items-center h-40 text-red-500 gap-2">
          <AlertCircle className="w-5 h-5" /> Gagal memuat data pinjaman.
        </div>
      </DashboardLayout>
    );
  }

  const filtered = filter === "all" ? adminLoans : adminLoans.filter((l) => l.status === filter);
  const pendingCount = adminLoans.filter((l) => l.status === "pending").length;

  return (
    <DashboardLayout role="admin" title="Loan Approval" subtitle="Review and manage loan applications">
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {["all", "pending", "approved", "rejected", "completed"].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${filter === f ? "gradient-emerald" : ""}`}
                  style={filter === f ? { color: "var(--emerald-foreground)" } : { background: "var(--secondary)", color: "var(--muted-foreground)" }}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f === "pending" && pendingCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px]" style={{ background: "var(--warning)", color: "var(--warning-foreground)" }}>
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="stat-card overflow-x-auto">
        <table className="data-table">
          <thead>
          <tr><th>Loan ID</th><th>Customer</th><th>Amount</th><th>Duration</th><th>Rate</th><th>Risk</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
          {filtered.map((loan) => (
            <React.Fragment key={loan.id}>
              <tr>
                <td className="font-medium">{loan.id}</td>
                <td>{loan.customer}</td>
                <td className="font-semibold">{formatCurrency(loan.amount)}</td>
                <td>{loan.duration}mo</td>
                <td>{loan.rate}%</td>
                <td><span className={`badge-status ${riskColors[loan.riskLevel]}`}>{loan.riskLevel}</span></td>
                <td><span className={`badge-status ${loan.status === "approved" ? "badge-approved" : loan.status === "pending" ? "badge-pending" : loan.status === "rejected" ? "badge-rejected" : "badge-completed"}`}>{loan.status}</span></td>
                <td>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setSelected(selected === loan.id ? null : loan.id)} className="btn-outline p-1.5"><Eye className="w-3.5 h-3.5" /></button>
                    {loan.status === "pending" && (
                      <>
                        <button className="p-1.5 rounded-md transition-colors" style={{ background: "color-mix(in oklch, var(--emerald) 15%, transparent)", color: "var(--emerald)" }}>
                          <CheckCircle className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1.5 rounded-md transition-colors" style={{ background: "color-mix(in oklch, var(--destructive) 15%, transparent)", color: "var(--destructive)" }}>
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
              {selected === loan.id && (
                <tr key={`${loan.id}-detail`}>
                  <td colSpan={8} className="!p-0">
                    <div className="p-4 animate-fade-in" style={{ background: "var(--secondary)" }}>
                      <div className="grid md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Applied Date</p>
                          <p className="font-medium text-sm">{formatDate(loan.appliedDate)}</p>
                        </div>
                        <div>
                          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Monthly Payment</p>
                          <p className="font-medium text-sm">{formatCurrency(Math.round(loan.amount / loan.duration * (1 + loan.rate / 100)))}</p>
                        </div>
                        <div>
                          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Total Interest</p>
                          <p className="font-medium text-sm">{formatCurrency(Math.round(loan.amount * loan.rate / 100 * loan.duration / 12))}</p>
                        </div>
                        <div>
                          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Risk Assessment</p>
                          <div className="flex items-center gap-1">
                            {loan.riskLevel === "high" ? <AlertTriangle className="w-3.5 h-3.5" style={{ color: "var(--destructive)" }} /> : <Shield className="w-3.5 h-3.5" style={{ color: "var(--emerald)" }} />}
                            <span className="font-medium text-sm capitalize">{loan.riskLevel} Risk</span>
                          </div>
                        </div>
                      </div>
                      {loan.status === "pending" && (
                        <div>
                          <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>Admin Notes</label>
                          <textarea className="fintech-input" rows={2} placeholder="Add notes for this loan application..." />
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
          {filtered.length === 0 && (
            <tr><td colSpan={8} className="text-center py-4 text-sm text-muted-foreground">Tidak ada pinjaman</td></tr>
          )}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}