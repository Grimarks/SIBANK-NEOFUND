import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
  TrendingUp,
  TrendingDown,
  CreditCard,
  Calendar,
  DollarSign,
  Activity,
  ArrowUpRight,
  Clock,
  AlertCircle,
  Plus,
  BarChart3 // Tambahan icon untuk empty state
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useMemo } from "react"; // Tambahan useMemo

// --- Import Firebase & React Query ---
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";

export const Route = createFileRoute("/dashboard/")({
  component: CustomerDashboard,
});

// Data chart placeholder jika belum ada data asli
const emptyChartData = [
  { month: "Jan", balance: 0 }, { month: "Feb", balance: 0 },
  { month: "Mar", balance: 0 }, { month: "Apr", balance: 0 },
  { month: "May", balance: 0 }, { month: "Jun", balance: 0 },
];

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

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: string;
}

function CustomerDashboard() {
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

  const { data: recentTransactions = [], isLoading: isTxLoading, isError } = useQuery({
    queryKey: ["recentTransactions", auth.currentUser?.uid],
    queryFn: async () => {
      if (!auth.currentUser) return [];
      const q = query(collection(db, "recentTransactions"), where("userId", "==", auth.currentUser.uid));
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
    },
    enabled: !!auth.currentUser,
  });

  if (isLoansLoading || isTxLoading) {
    return (
      <DashboardLayout role="customer" title="Dashboard" subtitle="Syncing your data...">
        <div className="flex justify-center items-center h-64 animate-pulse text-muted-foreground text-sm">
          Memuat data dashboard...
        </div>
      </DashboardLayout>
    );
  }

  if (isError) {
    return (
      <DashboardLayout role="customer" title="Dashboard" subtitle="An error occurred">
        <div className="flex justify-center items-center h-64 text-red-500 gap-2">
          <AlertCircle className="w-5 h-5" /> Gagal memuat data dashboard.
        </div>
      </DashboardLayout>
    );
  }

  const activeLoan = customerLoans.find((l) => l.status === "approved");

  // LOGIKA 1: Membuat Data Grafik Proyeksi Dinamis 6 Bulan ke Depan
  const chartData = useMemo(() => {
    if (!activeLoan) return emptyChartData; // Pakai dummy jika kosong

    let currentBal = activeLoan.remainingBalance;
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const startMonth = new Date().getMonth(); // Bulan ini

    return Array.from({ length: 6 }).map((_, i) => {
      const val = Math.max(0, currentBal);
      currentBal -= activeLoan.monthlyPayment; // Kurangi saldo setiap bulan
      return {
        month: months[(startMonth + i) % 12],
        balance: val
      };
    });
  }, [activeLoan]);

  const stats = [
    { label: "Active Loans", value: customerLoans.filter(l => l.status === "approved").length.toString(), icon: CreditCard, change: "+0%", up: true, color: "var(--primary)" },
    { label: "Remaining Balance", value: formatCurrency(activeLoan?.remainingBalance || 0), icon: DollarSign, change: "-0%", up: false, color: "var(--emerald)" },
    { label: "Monthly Payment", value: formatCurrency(activeLoan?.monthlyPayment || 0), icon: Calendar, change: "0%", up: true, color: "var(--info)" },
    { label: "Credit Score", value: "650", icon: Activity, change: "+0%", up: true, color: "var(--warning)" },
  ];

  return (
    <DashboardLayout role="customer" title="Dashboard" subtitle={`Welcome back`}>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `color-mix(in oklch, ${s.color} 15%, transparent)` }}>
                <s.icon className="w-5 h-5" style={{ color: s.color }} />
              </div>
              <span className={`flex items-center gap-1 text-xs font-medium ${s.up ? "badge-approved" : "badge-rejected"}`}>
                {s.change}
              </span>
            </div>
            <p className="text-xl font-bold">{s.value}</p>
            <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-2 stat-card relative overflow-hidden">
          <h3 className="font-semibold mb-4">Loan Balance Projection</h3>

          <div className="relative">
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
                <Area
                  type="monotone"
                  dataKey="balance"
                  stroke="oklch(0.55 0.17 160)"
                  fill="url(#colorBal)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>

            {/* LOGIKA 2: OVERLAY BLUR JIKA TIDAK ADA PINJAMAN AKTIF */}
            {!activeLoan && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/40 backdrop-blur-[2px] rounded-xl border border-dashed" style={{ borderColor: "var(--border)" }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ background: "var(--secondary)" }}>
                  <BarChart3 className="w-5 h-5 opacity-50" style={{ color: "var(--foreground)" }} />
                </div>
                <p className="text-sm font-semibold">Proyeksi Saldo Terkunci</p>
                <p className="text-xs text-center max-w-[250px] mt-1" style={{ color: "var(--muted-foreground)" }}>
                  Grafik prediksi pelunasan akan muncul di sini setelah Anda memiliki pinjaman aktif.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="stat-card flex flex-col h-full">
          <h3 className="font-semibold mb-4">Upcoming Payment</h3>

          {activeLoan ? (
            <>
              <div
                className="rounded-xl p-4 mb-4 gradient-primary"
                style={{ color: "var(--primary-foreground)" }}
              >
                <p className="text-xs opacity-70 mb-1">Next installment</p>
                <p className="text-2xl font-bold">{formatCurrency(activeLoan.monthlyPayment)}</p>
                <div className="flex items-center gap-2 mt-3 text-xs opacity-80">
                  <Clock className="w-3 h-3" /> Due {activeLoan.nextDue}
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span style={{ color: "var(--muted-foreground)" }}>Progress</span>
                  <span className="font-medium">{activeLoan.paid} of {activeLoan.total}</span>
                </div>
                <div className="w-full h-2 rounded-full" style={{ background: "var(--secondary)" }}>
                  <div
                    className="h-2 rounded-full gradient-emerald"
                    style={{ width: `${(activeLoan.paid / activeLoan.total) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: "var(--muted-foreground)" }}>Loan ID</span>
                  <span className="font-medium truncate max-w-[120px]">{activeLoan.id}</span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-4">
                <CreditCard className="w-6 h-6 text-muted-foreground opacity-50" />
              </div>
              <p className="font-semibold text-sm mb-1">Anda belum memiliki pinjaman aktif</p>
              <p className="text-xs text-muted-foreground mb-6">
                Ajukan pinjaman pertama Anda dan kelola keuangan dengan lebih cerdas.
              </p>
              <Link
                to="/dashboard/apply"
                className="btn-emerald w-full py-2.5 text-xs flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Ajukan Pinjaman
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="stat-card mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Recent Transactions</h3>
          <Link
            to="/dashboard/payments"
            className="text-xs font-medium flex items-center gap-1"
            style={{ color: "var(--emerald)" }}
          >
            View all <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Type</th>
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
              <tr>
                <td colSpan={4} className="text-center py-8 text-sm text-muted-foreground">
                  Belum ada riwayat transaksi.
                </td>
              </tr>
            )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}