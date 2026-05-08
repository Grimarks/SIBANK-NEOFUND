import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { paymentRecords, formatCurrency, formatDate } from "@/lib/dummy-data";
import { CheckCircle, Eye, AlertCircle, Bell, Search } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/admin/payments")({
  component: AdminPaymentsPage,
});

function AdminPaymentsPage() {
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? paymentRecords : paymentRecords.filter((p) => p.status === filter);

  const stats = [
    { label: "Total Verified", value: "156", color: "var(--emerald)" },
    { label: "Pending Review", value: "8", color: "var(--warning)" },
    { label: "Overdue", value: "3", color: "var(--destructive)" },
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
          {["all", "verified", "pending", "overdue"].map((f) => (
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
                <td className="font-medium">{p.id}</td>
                <td>{p.customer}</td>
                <td>{p.loanId}</td>
                <td className="font-semibold">{formatCurrency(p.amount)}</td>
                <td>{formatDate(p.date)}</td>
                <td>{p.proofUploaded ? <CheckCircle className="w-4 h-4" style={{ color: "var(--emerald)" }} /> : <AlertCircle className="w-4 h-4" style={{ color: "var(--destructive)" }} />}</td>
                <td><span className={`badge-status ${p.status === "verified" ? "badge-approved" : p.status === "pending" ? "badge-pending" : "badge-rejected"}`}>{p.status}</span></td>
                <td>
                  <div className="flex items-center gap-1">
                    <button className="btn-outline p-1.5"><Eye className="w-3.5 h-3.5" /></button>
                    {p.status === "pending" && <button className="p-1.5 rounded-md" style={{ background: "color-mix(in oklch, var(--emerald) 15%, transparent)", color: "var(--emerald)" }}><CheckCircle className="w-3.5 h-3.5" /></button>}
                    {p.status === "overdue" && <button className="p-1.5 rounded-md" style={{ background: "color-mix(in oklch, var(--warning) 15%, transparent)", color: "var(--warning)" }}><Bell className="w-3.5 h-3.5" /></button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
