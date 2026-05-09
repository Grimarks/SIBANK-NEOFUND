import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { TrendingUp, TrendingDown, CreditCard, Calendar, DollarSign, Activity, ArrowUpRight, Clock, AlertCircle } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrency, formatDate } from "@/lib/utils";

// --- Import Firebase & React Query ---
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const Route = createFileRoute("/dashboard/")({
  component: CustomerDashboard,
});

const chartData = [
  { month: "Jan", balance: 15000000 }, { month: "Feb", balance: 13500000 },
  { month: "Mar", balance: 12000000 }, { month: "Apr", balance: 10250000 },
  { month: "May", balance: 8900000 }, { month: "Jun", balance: 7500000 },
];

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

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: string;
}

function CustomerDashboard() {
  // Fetching Loans
  const { data: customerLoans = [], isLoading: isLoansLoading } = useQuery({
    queryKey: ["customerLoans"],
    queryFn: async () => {
      const snap = await getDocs(collection(db, "customerLoans"));
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as CustomerLoan));
    },
  });

  // Fetching Transactions
  const { data: recentTransactions = [], isLoading: isTxLoading, isError } = useQuery({
    queryKey: ["recentTransactions"],
    queryFn: async () => {
      const snap = await getDocs(collection(db, "recentTransactions"));
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
    },
  });

  if (isLoansLoading || isTxLoading) {
    return (
      <DashboardLayout role="customer" title="Dashboard" subtitle="Welcome back, Ahmad">
        <div className="flex justify-center items-center h-64 animate-pulse text-muted-foreground">
          Memuat data dashboard...
        </div>
      </DashboardLayout>
    );
  }

  if (isError) {
    return (
      <DashboardLayout role="customer" title="Dashboard" subtitle="Welcome back, Ahmad">
        <div className="flex justify-center items-center h-64 text-red-500 gap-2">
          <AlertCircle className="w-5 h-5" /> Gagal memuat data dashboard.
        </div>
      </DashboardLayout>
    );
  }

  const activeLoan = customerLoans.find((l) => l.status === "approved");
  const stats = [
    { label: "Active Loans", value: activeLoan ? "1" : "0", icon: CreditCard, change: "+0%", up: true, color: "var(--primary)" },
    { label: "Remaining Balance", value: formatCurrency(activeLoan?.remainingBalance || 0), icon: DollarSign, change: "-12%", up: false, color: "var(--emerald)" },
    { label: "Monthly Payment", value: formatCurrency(activeLoan?.monthlyPayment || 0), icon: Calendar, change: "0%", up: true, color: "var(--info)" },
    { label: "Credit Score", value: "780", icon: Activity, change: "+2.5%", up: true, color: "var(--warning)" },
  ];

  return (
    <DashboardLayout role="customer" title="Dashboard" subtitle="Welcome back, Ahmad">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `color-mix(in oklch, ${s.color} 15%, transparent)` }}>
                <s.icon className="w-5 h-5" style={{ color: s.color }} />
              </div>
              <span className={`flex items-center gap-1 text-xs font-medium ${s.up ? "badge-approved" : "badge-rejected"}`}>
                {s.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />} {s.change}
              </span>
            </div>
            <p className="text-xl font-bold">{s.value}</p>
            <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 stat-card">
          <h3 className="font-semibold mb-4">Loan Balance Trend</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorBal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.55 0.17 160)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="oklch(0.55 0.17 160)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
              <Tooltip formatter={(v) => formatCurrency(Number(v))} />
              <Area type="monotone" dataKey="balance" stroke="oklch(0.55 0.17 160)" fill="url(#colorBal)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Due */}
        <div className="stat-card">
          <h3 className="font-semibold mb-4">Upcoming Payment</h3>
          <div className="rounded-xl p-4 mb-4 gradient-primary" style={{ color: "var(--primary-foreground)" }}>
            <p className="text-xs opacity-70 mb-1">Next installment</p>
            <p className="text-2xl font-bold">{formatCurrency(activeLoan?.monthlyPayment || 1354167)}</p>
            <div className="flex items-center gap-2 mt-3 text-xs opacity-80">
              <Clock className="w-3 h-3" /> Due {activeLoan?.nextDue || "June 15, 2024"}
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span style={{ color: "var(--muted-foreground)" }}>Installment</span>
              <span className="font-medium">{activeLoan?.paid || 5} of {activeLoan?.total || 12}</span>
            </div>
            <div className="w-full h-2 rounded-full" style={{ background: "var(--secondary)" }}>
              <div className="h-2 rounded-full gradient-emerald" style={{ width: `${((activeLoan?.paid || 5) / (activeLoan?.total || 12)) * 100}%` }} />
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: "var(--muted-foreground)" }}>Loan ID</span>
              <span className="font-medium">{activeLoan?.id || "LN-2024-001"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="stat-card mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Recent Transactions</h3>
          <button className="text-xs font-medium flex items-center gap-1" style={{ color: "var(--emerald)" }}>
            View all <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
            <tr>
              <th>Date</th><th>Description</th><th>Amount</th><th>Type</th>
            </tr>
            </thead>
            <tbody>
            {recentTransactions.slice(0, 5).map((t) => (
              <tr key={t.id}>
                <td className="font-medium">{formatDate(t.date)}</td>
                <td>{t.description}</td>
                <td className="font-semibold" style={{ color: t.amount > 0 ? "var(--emerald)" : "var(--foreground)" }}>
                  {t.amount > 0 ? "+" : ""}{formatCurrency(t.amount)}
                </td>
                <td><span className={`badge-status ${t.type === "payment" ? "badge-approved" : "badge-completed"}`}>{t.type}</span></td>
              </tr>
            ))}
            {recentTransactions.length === 0 && (
              <tr><td colSpan={4} className="text-center py-4 text-sm text-muted-foreground">Belum ada transaksi</td></tr>
            )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}