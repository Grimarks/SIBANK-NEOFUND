import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Users, CreditCard, DollarSign, Clock, TrendingUp, ArrowUpRight, AlertCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from "recharts";
import { formatCurrency, formatDate } from "@/lib/utils";

// --- Import Firebase & React Query ---
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

const COLORS = ["oklch(0.35 0.12 260)", "oklch(0.55 0.17 160)", "oklch(0.6 0.15 240)", "oklch(0.75 0.15 75)"];

const customerGrowth = [
  { month: "Jan", customers: 820 }, { month: "Feb", customers: 910 }, { month: "Mar", customers: 980 },
  { month: "Apr", customers: 1100 }, { month: "May", customers: 1250 }, { month: "Jun", customers: 1380 },
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

function AdminDashboard() {
  const { data: monthlyRevenue = [], isLoading: isRevLoading } = useQuery({
    queryKey: ["monthlyRevenue"],
    queryFn: async () => {
      const snap = await getDocs(collection(db, "monthlyRevenue"));
      return snap.docs.map(doc => doc.data() as MonthlyRevenue);
    },
  });

  const { data: loanDistribution = [], isLoading: isDistLoading, isError } = useQuery({
    queryKey: ["loanDistribution"],
    queryFn: async () => {
      const snap = await getDocs(collection(db, "loanDistribution"));
      return snap.docs.map(doc => doc.data() as LoanDistribution);
    },
  });

  if (isRevLoading || isDistLoading) {
    return (
      <DashboardLayout role="admin" title="Admin Overview" subtitle="Welcome back, Admin">
        <div className="flex justify-center items-center h-64 animate-pulse text-muted-foreground">
          Memuat data statistik admin...
        </div>
      </DashboardLayout>
    );
  }

  if (isError) {
    return (
      <DashboardLayout role="admin" title="Admin Overview" subtitle="Welcome back, Admin">
        <div className="flex justify-center items-center h-64 text-red-500 gap-2">
          <AlertCircle className="w-5 h-5" /> Gagal memuat data chart.
        </div>
      </DashboardLayout>
    );
  }

  const stats = [
    { label: "Total Customers", value: "1,380", icon: Users, change: "+12%", color: "var(--primary)" },
    { label: "Active Loans", value: "234", icon: CreditCard, change: "+8%", color: "var(--emerald)" },
    { label: "Monthly Revenue", value: formatCurrency(18200000), icon: DollarSign, change: "+15%", color: "var(--info)" },
    { label: "Pending Requests", value: "12", icon: Clock, change: "-3", color: "var(--warning)" },
  ];

  return (
    <DashboardLayout role="admin" title="Admin Overview" subtitle="Welcome back, Admin">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `color-mix(in oklch, ${s.color} 15%, transparent)` }}>
                <s.icon className="w-5 h-5" style={{ color: s.color }} />
              </div>
              <span className="badge-status badge-approved flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> {s.change}
              </span>
            </div>
            <p className="text-xl font-bold">{s.value}</p>
            <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 stat-card">
          <h3 className="font-semibold mb-4">Revenue Overview</h3>
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
          <h3 className="font-semibold mb-4">Loan Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={loanDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={4}>
                {loanDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {loanDistribution.map((d, i) => (
              <div key={d.name} className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                <span style={{ color: "var(--muted-foreground)" }}>{d.name} ({d.value}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="stat-card">
          <h3 className="font-semibold mb-4">Customer Growth</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={customerGrowth}>
              <defs>
                <linearGradient id="colorCust" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.35 0.12 260)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="oklch(0.35 0.12 260)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Area type="monotone" dataKey="customers" stroke="oklch(0.35 0.12 260)" fill="url(#colorCust)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Recent Activity</h3>
            <button className="text-xs font-medium flex items-center gap-1" style={{ color: "var(--emerald)" }}>View all <ArrowUpRight className="w-3 h-3" /></button>
          </div>
          <div className="space-y-3">
            {[
              { text: "New loan application from Dewi Lestari", time: "2 hours ago", badge: "badge-pending" },
              { text: "Payment verified for Ahmad Rizki", time: "5 hours ago", badge: "badge-approved" },
              { text: "Loan LN-2024-005 rejected", time: "1 day ago", badge: "badge-rejected" },
              { text: "New customer registration: Eko Prasetyo", time: "2 days ago", badge: "badge-completed" },
            ].map((a, i) => (
              <div key={i} className="flex items-start gap-3 py-2 border-b last:border-0" style={{ borderColor: "var(--border)" }}>
                <div className={`w-2 h-2 rounded-full mt-1.5 ${a.badge}`} />
                <div className="flex-1">
                  <p className="text-sm">{a.text}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}