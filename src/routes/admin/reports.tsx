import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, CartesianGrid,
  Legend, YAxis as RechartYAxis,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import {
  Download, FileText, AlertCircle, TrendingUp, TrendingDown,
  Users, CheckCircle, AlertTriangle, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import { useState, useMemo } from "react";

export const Route = createFileRoute("/admin/reports")({
  component: ReportsPage,
});

// ─── Types ────────────────────────────────────────────────────────────────────
interface MonthlyRevenue {
  month: string;
  revenue: number;
  loans: number;
}

interface LoanDistribution {
  name: string;
  value: number;
}

interface RecentLoan {
  id: string;
  borrower: string;
  category: string;
  amount: number;
  status: "approved" | "pending" | "rejected" | "active";
  date: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const CHART_COLORS = [
  "oklch(0.55 0.17 160)",
  "oklch(0.35 0.12 260)",
  "oklch(0.6 0.15 240)",
  "oklch(0.75 0.15 75)",
];

const PERIOD_MONTHS: Record<string, number> = { "1m": 1, "3m": 3, "6m": 6, "1y": 12 };

const FALLBACK_REVENUE: MonthlyRevenue[] = [
  { month: "Jan", revenue: 13500000, loans: 11 },
  { month: "Feb", revenue: 15200000, loans: 13 },
  { month: "Mar", revenue: 14800000, loans: 12 },
  { month: "Apr", revenue: 17100000, loans: 15 },
  { month: "May", revenue: 16400000, loans: 14 },
  { month: "Jun", revenue: 19000000, loans: 17 },
  { month: "Jul", revenue: 18200000, loans: 16 },
  { month: "Aug", revenue: 21000000, loans: 19 },
  { month: "Sep", revenue: 20100000, loans: 18 },
  { month: "Oct", revenue: 22500000, loans: 20 },
  { month: "Nov", revenue: 24000000, loans: 22 },
  { month: "Dec", revenue: 26800000, loans: 24 },
];

const FALLBACK_DISTRIBUTION: LoanDistribution[] = [
  { name: "Konsumtif", value: 42 },
  { name: "Produktif", value: 31 },
  { name: "Mikro", value: 18 },
  { name: "Properti", value: 9 },
];

const FALLBACK_RECENT: RecentLoan[] = [
  { id: "1", borrower: "Budi Santoso", category: "Konsumtif", amount: 15000000, status: "approved", date: "2024-06-14" },
  { id: "2", borrower: "Siti Rahayu", category: "Produktif", amount: 30000000, status: "active", date: "2024-06-13" },
  { id: "3", borrower: "Ahmad Fauzi", category: "Mikro", amount: 8000000, status: "pending", date: "2024-06-12" },
  { id: "4", borrower: "Dewi Kurnia", category: "Konsumtif", amount: 12000000, status: "approved", date: "2024-06-11" },
  { id: "5", borrower: "Hendra Wijaya", category: "Properti", amount: 85000000, status: "rejected", date: "2024-06-10" },
];

const PERFORMANCE_DATA = [
  { month: "Jan", approval: 85, default: 2 },
  { month: "Feb", approval: 88, default: 1.5 },
  { month: "Mar", approval: 82, default: 3 },
  { month: "Apr", approval: 90, default: 1 },
  { month: "May", approval: 87, default: 2.5 },
  { month: "Jun", approval: 92, default: 1.2 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Metrics where a decrease is GOOD (lower = better) */
const LOWER_IS_BETTER = ["Default Rate", "Avg. Interest Rate"];

function isPositiveChange(label: string, change: string) {
  const isDecrease = change.startsWith("-");
  return LOWER_IS_BETTER.includes(label) ? isDecrease : !isDecrease;
}

function statusBadgeClass(status: RecentLoan["status"]) {
  const map: Record<RecentLoan["status"], string> = {
    approved: "badge-status badge-approved",
    active:   "badge-status badge-active",
    pending:  "badge-status badge-pending",
    rejected: "badge-status badge-rejected",
  };
  return map[status];
}

function statusLabel(status: RecentLoan["status"]) {
  const map: Record<RecentLoan["status"], string> = {
    approved: "Disetujui",
    active:   "Aktif",
    pending:  "Menunggu",
    rejected: "Ditolak",
  };
  return map[status];
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const RevenueTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="stat-card p-3 text-xs shadow-lg border" style={{ minWidth: 160 }}>
      <p className="font-semibold mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex justify-between gap-4">
          <span style={{ color: p.color }}>{p.name === "revenue" ? "Pendapatan" : "Pinjaman"}</span>
          <span className="font-medium">
            {p.name === "revenue" ? formatCurrency(p.value) : `${p.value} nasabah`}
          </span>
        </div>
      ))}
    </div>
  );
};

const PerformanceTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="stat-card p-3 text-xs shadow-lg border" style={{ minWidth: 160 }}>
      <p className="font-semibold mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex justify-between gap-4">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="font-medium">{p.value}%</span>
        </div>
      ))}
    </div>
  );
};

// ─── Page Component ───────────────────────────────────────────────────────────
function ReportsPage() {
  const [period, setPeriod] = useState("6m");

  // ── Dummy data (ganti dengan query Firestore kalau data sudah siap) ──
  const allRevenue = FALLBACK_REVENUE;
  const loanDistribution = FALLBACK_DISTRIBUTION;
  const recentLoans = FALLBACK_RECENT;
  const isLoansLoading = false;
  const isRevLoading = false;
  const isDistLoading = false;
  const isRevError = false;
  const isDistError = false;

  // ── Filter revenue by period ──
  const monthlyRevenue = useMemo(() => {
    const count = PERIOD_MONTHS[period] ?? 6;
    return allRevenue.slice(-count);
  }, [allRevenue, period]);

  // ── Derived summary metrics ──
  const totalRevenue = useMemo(
    () => monthlyRevenue.reduce((sum, m) => sum + m.revenue, 0),
    [monthlyRevenue]
  );
  const totalLoans = useMemo(
    () => monthlyRevenue.reduce((sum, m) => sum + m.loans, 0),
    [monthlyRevenue]
  );
  const avgLoanAmount = totalLoans > 0 ? totalRevenue / totalLoans : 0;

  const summaryCards = [
    { icon: TrendingUp,       label: "Total Pendapatan",    value: formatCurrency(totalRevenue),   change: "+18%", metric: "Total Revenue" },
    { icon: Users,            label: "Peminjam Aktif",      value: "234",                          change: "+12%", metric: "Active Borrowers" },
    { icon: CheckCircle,      label: "Tingkat Approval",    value: "87%",                          change: "+3%",  metric: "Loan Approval Rate" },
    { icon: AlertTriangle,    label: "Tingkat Default",     value: "1.9%",                         change: "-0.5%",metric: "Default Rate" },
  ];

  const keyMetrics = [
    { label: "Total Pendapatan",   value: formatCurrency(totalRevenue), change: "+18%" },
    { label: "Rata-rata Pinjaman", value: formatCurrency(avgLoanAmount), change: "+5%" },
    { label: "Avg. Interest Rate", value: "8.6%",  change: "-0.2%" },
    { label: "Default Rate",       value: "1.9%",  change: "-0.5%" },
    { label: "Active Borrowers",   value: "234",   change: "+12%" },
    { label: "Loan Approval Rate", value: "87%",   change: "+3%" },
  ];

  // ── Loading & error states ──
  if (isRevLoading || isDistLoading) {
    return (
      <DashboardLayout role="admin" title="Reports & Analytics" subtitle="Comprehensive financial insights">
        <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Memuat data laporan...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (isRevError || isDistError) {
    return (
      <DashboardLayout role="admin" title="Reports & Analytics" subtitle="Comprehensive financial insights">
        <div className="flex flex-col items-center justify-center h-64 gap-2 text-red-500">
          <AlertCircle className="w-8 h-8" />
          <p className="font-medium">Gagal memuat data laporan</p>
          <p className="text-sm text-muted-foreground">Periksa koneksi internet dan coba lagi.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin" title="Reports & Analytics" subtitle="Comprehensive financial insights">

      {/* ── Header: period filter + export ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex gap-2">
          {(["1m", "3m", "6m", "1y"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                period === p ? "gradient-primary" : ""
              }`}
              style={
                period === p
                  ? { color: "var(--primary-foreground)" }
                  : { background: "var(--secondary)", color: "var(--muted-foreground)" }
              }
            >
              {p.toUpperCase()}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button className="btn-outline flex items-center gap-1.5 text-xs">
            <Download className="w-3.5 h-3.5" /> Export PDF
          </button>
          <button className="btn-outline flex items-center gap-1.5 text-xs">
            <FileText className="w-3.5 h-3.5" /> Export Excel
          </button>
        </div>
      </div>

      {/* ── Summary stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {summaryCards.map((s) => {
          const positive = isPositiveChange(s.metric, s.change);
          const Icon = s.icon;
          const TrendIcon = positive ? ArrowUpRight : ArrowDownRight;
          return (
            <div key={s.label} className="stat-card flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{s.label}</p>
                <Icon className="w-4 h-4" style={{ color: "var(--muted-foreground)" }} />
              </div>
              <p className="text-2xl font-bold tracking-tight">{s.value}</p>
              <div className="flex items-center gap-1">
                <TrendIcon className={`w-3 h-3 ${positive ? "text-emerald-500" : "text-red-500"}`} />
                <span className={`text-xs font-medium ${positive ? "text-emerald-500" : "text-red-500"}`}>
                  {s.change}
                </span>
                <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>vs. periode lalu</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Charts row 1: Revenue + Performance ── */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">

        {/* Monthly Revenue */}
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Pendapatan Bulanan</h3>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--secondary)", color: "var(--muted-foreground)" }}>
              {period.toUpperCase()}
            </span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthlyRevenue} barSize={24}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`}
              />
              <Tooltip content={<RevenueTooltip />} />
              <Bar dataKey="revenue" name="revenue" fill="oklch(0.55 0.17 160)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Loan Performance — dual Y-axis fix */}
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Performa Pinjaman</h3>
            <div className="flex items-center gap-3 text-xs" style={{ color: "var(--muted-foreground)" }}>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-0.5 bg-emerald-500 rounded" />Approval
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-0.5 bg-red-500 rounded" />Default
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={PERFORMANCE_DATA}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              {/* Left Y-axis: approval % (70–100) */}
              <YAxis
                yAxisId="left"
                domain={[70, 100]}
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              {/* Right Y-axis: default % (0–5) */}
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[0, 5]}
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip content={<PerformanceTooltip />} />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="approval"
                name="Approval %"
                stroke="oklch(0.55 0.17 160)"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "oklch(0.55 0.17 160)", strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="default"
                name="Default %"
                stroke="oklch(0.58 0.22 25)"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "oklch(0.58 0.22 25)", strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Charts row 2: Pie + Key Metrics ── */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">

        {/* Loan Categories */}
        <div className="stat-card">
          <h3 className="font-semibold mb-4">Kategori Pinjaman</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={loanDistribution}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                dataKey="value"
                paddingAngle={4}
                strokeWidth={0}
              >
                {loanDistribution.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => [`${v}%`, "Porsi"]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-1">
            {loanDistribution.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
                  />
                  <span>{d.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="h-1.5 rounded-full"
                    style={{
                      width: `${d.value * 1.2}px`,
                      background: CHART_COLORS[i % CHART_COLORS.length],
                      opacity: 0.4,
                    }}
                  />
                  <span className="font-semibold w-8 text-right">{d.value}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Metrics Summary */}
        <div className="lg:col-span-2 stat-card">
          <h3 className="font-semibold mb-4">Ringkasan Metrik Utama</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {keyMetrics.map((m) => {
              const positive = isPositiveChange(m.label, m.change);
              const TrendIcon = positive ? TrendingUp : TrendingDown;
              return (
                <div
                  key={m.label}
                  className="p-3 rounded-xl flex flex-col gap-1"
                  style={{ background: "var(--secondary)" }}
                >
                  <p className="text-[11px] leading-tight" style={{ color: "var(--muted-foreground)" }}>
                    {m.label}
                  </p>
                  <p className="text-lg font-bold">{m.value}</p>
                  <div className="flex items-center gap-1">
                    <TrendIcon className={`w-3 h-3 ${positive ? "text-emerald-500" : "text-red-500"}`} />
                    <span className={`text-[10px] font-semibold ${positive ? "text-emerald-500" : "text-red-500"}`}>
                      {m.change}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Recent Transactions table ── */}
      <div className="stat-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Transaksi Pinjaman Terbaru</h3>
          <button className="text-xs font-medium" style={{ color: "var(--primary)" }}>
            Lihat Semua →
          </button>
        </div>

        {isLoansLoading ? (
          <div className="flex justify-center py-8 text-sm text-muted-foreground animate-pulse">
            Memuat transaksi...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
              <tr
                className="text-xs border-b"
                style={{ color: "var(--muted-foreground)", borderColor: "var(--border)" }}
              >
                <th className="text-left pb-3 font-medium">Peminjam</th>
                <th className="text-left pb-3 font-medium">Kategori</th>
                <th className="text-right pb-3 font-medium">Jumlah</th>
                <th className="text-right pb-3 font-medium">Tanggal</th>
                <th className="text-right pb-3 font-medium">Status</th>
              </tr>
              </thead>
              <tbody>
              {recentLoans.map((loan) => (
                <tr
                  key={loan.id}
                  className="border-b last:border-0 hover:bg-secondary/50 transition-colors"
                  style={{ borderColor: "var(--border)" }}
                >
                  <td className="py-3 font-medium">{loan.borrower}</td>
                  <td className="py-3" style={{ color: "var(--muted-foreground)" }}>
                    {loan.category}
                  </td>
                  <td className="py-3 text-right font-medium tabular-nums">
                    {formatCurrency(loan.amount)}
                  </td>
                  <td className="py-3 text-right text-xs" style={{ color: "var(--muted-foreground)" }}>
                    {new Date(loan.date).toLocaleDateString("id-ID", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </td>
                  <td className="py-3 text-right">
                      <span className={statusBadgeClass(loan.status)}>
                        {statusLabel(loan.status)}
                      </span>
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </DashboardLayout>
  );
}