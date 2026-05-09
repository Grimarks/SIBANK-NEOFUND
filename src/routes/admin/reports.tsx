import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Download, FileText, Calendar, AlertCircle } from "lucide-react";
import { useState } from "react";

// --- Import Firebase & React Query ---
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const Route = createFileRoute("/admin/reports")({
  component: ReportsPage,
});

const COLORS = ["oklch(0.35 0.12 260)", "oklch(0.55 0.17 160)", "oklch(0.6 0.15 240)", "oklch(0.75 0.15 75)"];
const performanceData = [
  { month: "Jan", approval: 85, default: 2 }, { month: "Feb", approval: 88, default: 1.5 },
  { month: "Mar", approval: 82, default: 3 }, { month: "Apr", approval: 90, default: 1 },
  { month: "May", approval: 87, default: 2.5 }, { month: "Jun", approval: 92, default: 1.2 },
];

interface MonthlyRevenue {
  month: string;
  revenue: number;
  loans: number;
}

interface LoanDistribution {
  name: string;
  value: number;
}

function ReportsPage() {
  const [period, setPeriod] = useState("6m");

  const { data: monthlyRevenue = [], isLoading: isRevLoading, isError: isRevError } = useQuery({
    queryKey: ["monthlyRevenue"],
    queryFn: async () => {
      const snap = await getDocs(collection(db, "monthlyRevenue"));
      return snap.docs.map(doc => doc.data() as MonthlyRevenue);
    },
  });

  const { data: loanDistribution = [], isLoading: isDistLoading, isError: isDistError } = useQuery({
    queryKey: ["loanDistribution"],
    queryFn: async () => {
      const snap = await getDocs(collection(db, "loanDistribution"));
      return snap.docs.map(doc => doc.data() as LoanDistribution);
    },
  });

  if (isRevLoading || isDistLoading) {
    return (
      <DashboardLayout role="admin" title="Reports & Analytics" subtitle="Comprehensive financial insights">
        <div className="flex justify-center items-center h-64 animate-pulse text-muted-foreground">
          Memuat data laporan...
        </div>
      </DashboardLayout>
    );
  }

  if (isRevError || isDistError) {
    return (
      <DashboardLayout role="admin" title="Reports & Analytics" subtitle="Comprehensive financial insights">
        <div className="flex justify-center items-center h-64 text-red-500 gap-2">
          <AlertCircle className="w-5 h-5" /> Gagal memuat grafik laporan.
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin" title="Reports & Analytics" subtitle="Comprehensive financial insights">
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          {["1m", "3m", "6m", "1y"].map((p) => (
            <button key={p} onClick={() => setPeriod(p)}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${period === p ? "gradient-primary" : ""}`}
                    style={period === p ? { color: "var(--primary-foreground)" } : { background: "var(--secondary)", color: "var(--muted-foreground)" }}>
              {p.toUpperCase()}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button className="btn-outline"><Download className="w-4 h-4" /> Export PDF</button>
          <button className="btn-outline"><FileText className="w-4 h-4" /> Export Excel</button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="stat-card">
          <h3 className="font-semibold mb-4">Monthly Revenue</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthlyRevenue}>
              <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
              <Tooltip formatter={(v) => formatCurrency(Number(v))} />
              <Bar dataKey="revenue" fill="oklch(0.55 0.17 160)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="stat-card">
          <h3 className="font-semibold mb-4">Loan Performance</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={performanceData}>
              <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Line type="monotone" dataKey="approval" stroke="oklch(0.55 0.17 160)" strokeWidth={2} dot={{ r: 4 }} name="Approval %" />
              <Line type="monotone" dataKey="default" stroke="oklch(0.58 0.22 25)" strokeWidth={2} dot={{ r: 4 }} name="Default %" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="stat-card">
          <h3 className="font-semibold mb-4">Loan Categories</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={loanDistribution} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" paddingAngle={4}>
                {loanDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1 mt-2">
            {loanDistribution.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  <span>{d.name}</span>
                </div>
                <span className="font-medium">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-2 stat-card">
          <h3 className="font-semibold mb-4">Key Metrics Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Total Revenue (6mo)", value: formatCurrency(93000000), change: "+18%" },
              { label: "Avg. Loan Amount", value: formatCurrency(21000000), change: "+5%" },
              { label: "Avg. Interest Rate", value: "8.6%", change: "-0.2%" },
              { label: "Default Rate", value: "1.9%", change: "-0.5%" },
              { label: "Active Borrowers", value: "234", change: "+12%" },
              { label: "Loan Approval Rate", value: "87%", change: "+3%" },
            ].map((m) => (
              <div key={m.label} className="p-3 rounded-xl" style={{ background: "var(--secondary)" }}>
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{m.label}</p>
                <p className="text-lg font-bold mt-1">{m.value}</p>
                <span className="badge-status badge-approved text-[10px] mt-1">{m.change}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}