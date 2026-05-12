import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Users, CreditCard, DollarSign, Clock, AlertCircle, ArrowUpRight, ArrowDownRight } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, CartesianGrid,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

// --- Import Firebase & React Query ---
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

// ─── Constants ────────────────────────────────────────────────────────────────
const COLORS = [
  "oklch(0.35 0.12 260)",
  "oklch(0.55 0.17 160)",
  "oklch(0.6 0.15 240)",
  "oklch(0.75 0.15 75)",
];

// ─── Dummy Data ───────────────────────────────────────────────────────────────
const DUMMY_REVENUE = [
  { month: "Jan", revenue: 13500000 },
  { month: "Feb", revenue: 15200000 },
  { month: "Mar", revenue: 14800000 },
  { month: "Apr", revenue: 17100000 },
  { month: "May", revenue: 16400000 },
  { month: "Jun", revenue: 19000000 },
  { month: "Jul", revenue: 18200000 },
  { month: "Agu", revenue: 21000000 },
  { month: "Sep", revenue: 20100000 },
  { month: "Okt", revenue: 22500000 },
  { month: "Nov", revenue: 24000000 },
  { month: "Des", revenue: 26800000 },
];

const DUMMY_DISTRIBUTION = [
  { name: "Konsumtif", value: 42 },
  { name: "Produktif", value: 31 },
  { name: "Mikro",     value: 18 },
  { name: "Properti",  value: 9  },
];

const CUSTOMER_GROWTH = [
  { month: "Jan", customers: 820  },
  { month: "Feb", customers: 910  },
  { month: "Mar", customers: 980  },
  { month: "Apr", customers: 1100 },
  { month: "May", customers: 1250 },
  { month: "Jun", customers: 1380 },
];

// ─── Custom Tooltips ──────────────────────────────────────────────────────────
const RevenueTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="stat-card p-3 text-xs shadow-lg border" style={{ minWidth: 160 }}>
      <p className="font-semibold mb-1">{label}</p>
      <p style={{ color: COLORS[1] }}>
        Pendapatan: <span className="font-bold">{formatCurrency(payload[0].value)}</span>
      </p>
    </div>
  );
};

const DistTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="stat-card p-3 text-xs shadow-lg border">
      <p className="font-semibold">{payload[0].name}</p>
      <p style={{ color: payload[0].payload.fill }}>{payload[0].value}%</p>
    </div>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────
function AdminDashboard() {
  // Fetch Loans untuk Statistik
  const { data: allLoans = [] } = useQuery({
    queryKey: ["adminAllLoans"],
    queryFn: async () => {
      const snap = await getDocs(collection(db, "loans"));
      return snap.docs.map((doc) => doc.data());
    },
  });

  // Fetch Customers untuk Statistik
  const { data: allCustomers = [] } = useQuery({
    queryKey: ["adminAllCustomers"],
    queryFn: async () => {
      const snap = await getDocs(collection(db, "adminCustomers"));
      return snap.docs.map((doc) => doc.data());
    },
  });

  // ── Pakai dummy data untuk chart (Firestore kosong) ──
  const chartRevenue    = DUMMY_REVENUE;
  const chartDist       = DUMMY_DISTRIBUTION;

  // ── Stats dari Firestore, fallback ke dummy kalau kosong ──
  const activeLoansCount    = allLoans.filter((l: any) => l.status === "approved").length || 48;
  const pendingRequestsCount = allLoans.filter((l: any) => l.status === "pending").length || 7;
  const totalCustomersCount  = allCustomers.length || 234;

  // Total revenue bulan ini (dari dummy: Des)
  const thisMonthRevenue = chartRevenue[chartRevenue.length - 1]?.revenue ?? 0;
  const lastMonthRevenue = chartRevenue[chartRevenue.length - 2]?.revenue ?? 0;
  const revenueGrowth = lastMonthRevenue
    ? (((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(1)
    : "0";

  const stats = [
    {
      label: "Total Pelanggan",
      value: totalCustomersCount.toLocaleString("id-ID"),
      icon: Users,
      change: "+12%",
      positive: true,
      color: "var(--primary)",
    },
    {
      label: "Pinjaman Aktif",
      value: activeLoansCount.toLocaleString("id-ID"),
      icon: CreditCard,
      change: "+5%",
      positive: true,
      color: "oklch(0.55 0.17 160)",
    },
    {
      label: "Pendapatan Bulan Ini",
      value: formatCurrency(thisMonthRevenue),
      icon: DollarSign,
      change: `+${revenueGrowth}%`,
      positive: true,
      color: "oklch(0.6 0.15 240)",
    },
    {
      label: "Menunggu Persetujuan",
      value: pendingRequestsCount.toLocaleString("id-ID"),
      icon: Clock,
      change: "-2 dari kemarin",
      positive: true,
      color: "var(--warning)",
    },
  ];

  return (
    <DashboardLayout role="admin" title="Admin Overview" subtitle="Welcome back, Admin">

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => {
          const TrendIcon = s.positive ? ArrowUpRight : ArrowDownRight;
          return (
            <div key={s.label} className="stat-card">
              <div className="flex items-center justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `color-mix(in oklch, ${s.color} 15%, transparent)` }}
                >
                  <s.icon className="w-5 h-5" style={{ color: s.color }} />
                </div>
                <div className="flex items-center gap-1">
                  <TrendIcon className={`w-3 h-3 ${s.positive ? "text-emerald-500" : "text-red-500"}`} />
                  <span className={`text-xs font-medium ${s.positive ? "text-emerald-500" : "text-red-500"}`}>
                    {s.change}
                  </span>
                </div>
              </div>
              <p className="text-xl font-bold tracking-tight">{s.value}</p>
              <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* ── Revenue + Distribution ── */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">

        {/* Revenue Overview */}
        <div className="lg:col-span-2 stat-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Revenue Overview</h3>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--secondary)", color: "var(--muted-foreground)" }}>
              2024 • Data Ilustrasi
            </span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartRevenue} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`}
              />
              <Tooltip content={<RevenueTooltip />} />
              <Bar
                dataKey="revenue"
                fill="oklch(0.55 0.17 160)"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Loan Distribution */}
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Loan Distribution</h3>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--secondary)", color: "var(--muted-foreground)" }}>
              Ilustrasi
            </span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={chartDist}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={75}
                dataKey="value"
                paddingAngle={4}
                strokeWidth={0}
              >
                {chartDist.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<DistTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {chartDist.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: COLORS[i % COLORS.length] }}
                  />
                  <span>{d.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="h-1.5 rounded-full"
                    style={{
                      width: `${d.value * 1.2}px`,
                      background: COLORS[i % COLORS.length],
                      opacity: 0.35,
                    }}
                  />
                  <span className="font-semibold w-8 text-right">{d.value}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Customer Growth + System Notes ── */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="stat-card">
          <h3 className="font-semibold mb-4">Customer Growth</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={CUSTOMER_GROWTH}>
              <defs>
                <linearGradient id="colorCust" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.35 0.12 260)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="oklch(0.35 0.12 260)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => [`${v} pelanggan`, "Total"]} />
              <Area
                type="monotone"
                dataKey="customers"
                stroke="oklch(0.35 0.12 260)"
                fill="url(#colorCust)"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "oklch(0.35 0.12 260)", strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">System Notes</h3>
          </div>
          <div className="space-y-3">
            {[
              {
                color: "oklch(0.55 0.17 160)",
                title: "Firebase Firestore terhubung secara Real-Time.",
                sub: "Active",
              },
              {
                color: "oklch(0.6 0.15 240)",
                title: "Chart revenue & distribusi menggunakan data ilustrasi.",
                sub: "Hubungkan ke Firestore untuk data nyata",
              },
              {
                color: "var(--warning)",
                title: `${pendingRequestsCount} pengajuan pinjaman menunggu persetujuan.`,
                sub: "Perlu tindakan",
              },
            ].map((n, i) => (
              <div
                key={i}
                className="flex items-start gap-3 py-2.5 border-b last:border-0"
                style={{ borderColor: "var(--border)" }}
              >
                <div
                  className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                  style={{ background: n.color }}
                />
                <div className="flex-1">
                  <p className="text-sm">{n.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{n.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </DashboardLayout>
  );
}