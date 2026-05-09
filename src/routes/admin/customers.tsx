import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Search, Filter, Eye, UserCheck, UserX, ChevronDown, AlertCircle } from "lucide-react";
import { useState } from "react";

// --- Import Firebase & React Query ---
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const Route = createFileRoute("/admin/customers")({
  component: CustomersPage,
});

interface AdminCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: "active" | "suspended";
  totalLoans: number;
  creditScore: number;
  joinDate: string;
  verified: boolean;
}

function CustomersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: adminCustomers = [], isLoading, isError } = useQuery({
    queryKey: ["adminCustomers"],
    queryFn: async () => {
      const snap = await getDocs(collection(db, "adminCustomers"));
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as AdminCustomer));
    },
  });

  if (isLoading) {
    return (
      <DashboardLayout role="admin" title="Customer Management" subtitle="View and manage customer accounts">
        <div className="flex justify-center items-center h-40 animate-pulse text-muted-foreground">
          Memuat data nasabah...
        </div>
      </DashboardLayout>
    );
  }

  if (isError) {
    return (
      <DashboardLayout role="admin" title="Customer Management" subtitle="View and manage customer accounts">
        <div className="flex justify-center items-center h-40 text-red-500 gap-2">
          <AlertCircle className="w-5 h-5" /> Gagal memuat data nasabah.
        </div>
      </DashboardLayout>
    );
  }

  const filtered = adminCustomers.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <DashboardLayout role="admin" title="Customer Management" subtitle="View and manage customer accounts">
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--muted-foreground)" }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} className="fintech-input pl-9" placeholder="Search customers..." />
        </div>
        <div className="relative">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="fintech-input pr-8 appearance-none">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "var(--muted-foreground)" }} />
        </div>
      </div>

      <div className="stat-card overflow-x-auto">
        <table className="data-table">
          <thead>
          <tr><th>Customer</th><th>Email</th><th>Credit Score</th><th>Total Loans</th><th>Status</th><th>Verified</th><th>Actions</th></tr>
          </thead>
          <tbody>
          {filtered.map((c) => (
            <tr key={c.id}>
              <td>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-xs font-bold" style={{ color: "var(--primary-foreground)" }}>
                    {c.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{c.phone}</p>
                  </div>
                </div>
              </td>
              <td>{c.email}</td>
              <td>
                  <span className="font-semibold" style={{ color: c.creditScore >= 700 ? "var(--emerald)" : c.creditScore >= 600 ? "var(--warning)" : "var(--destructive)" }}>
                    {c.creditScore}
                  </span>
              </td>
              <td>{c.totalLoans}</td>
              <td><span className={`badge-status ${c.status === "active" ? "badge-approved" : "badge-rejected"}`}>{c.status}</span></td>
              <td>{c.verified ? <UserCheck className="w-4 h-4" style={{ color: "var(--emerald)" }} /> : <span className="badge-status badge-pending">Pending</span>}</td>
              <td>
                <div className="flex items-center gap-2">
                  <button className="btn-outline p-1.5"><Eye className="w-3.5 h-3.5" /></button>
                  <button className="btn-outline p-1.5">{c.status === "active" ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}</button>
                </div>
              </td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr><td colSpan={7} className="text-center py-4 text-sm text-muted-foreground">Tidak ada nasabah yang cocok</td></tr>
          )}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}