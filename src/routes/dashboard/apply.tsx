import { createFileRoute, useRouter } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useState, useEffect } from "react";
import { Calculator, Info, ArrowRight } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

// --- Import Firebase ---
import { collection, addDoc, doc, getDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/apply")({
  component: ApplyLoanPage,
});

function ApplyLoanPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // State untuk menyimpan range dari Admin (Default jika gagal memuat)
  const [limits, setLimits] = useState({ min: 1000000, max: 100000000, maxDuration: 36 });

  const [amount, setAmount] = useState(10000000);
  const [duration, setDuration] = useState(12);
  const [purpose, setPurpose] = useState("Personal");
  const [notes, setNotes] = useState("");

  // 1. Ambil batas pinjaman dari pengaturan Admin
  useEffect(() => {
    const fetchLimits = async () => {
      try {
        const docRef = doc(db, "systemSettings", "loanConfig");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const newMin = data.minLoan || 1000000;
          const newMax = data.maxLoan || 100000000;
          const newMaxDuration = data.maxDuration || 36;

          setLimits({ min: newMin, max: newMax, maxDuration: newMaxDuration });

          // Sesuaikan amount jika nilai awal di luar batas baru
          setAmount((prev) => {
            if (prev < newMin) return newMin;
            if (prev > newMax) return newMax;
            return prev;
          });

          // Sesuaikan duration jika melebihi batas baru admin
          setDuration((prev) => (prev > newMaxDuration ? newMaxDuration : prev));
        }
      } catch (error) {
        console.error("Gagal memuat pengaturan limit pinjaman:", error);
      }
    };
    fetchLimits();
  }, []);

  const rate = duration <= 6 ? 7.0 : duration <= 12 ? 8.5 : duration <= 24 ? 9.0 : 10.5;
  const monthlyInterest = rate / 100 / 12;
  const monthly = amount * (monthlyInterest * Math.pow(1 + monthlyInterest, duration)) / (Math.pow(1 + monthlyInterest, duration) - 1);
  const totalPayment = monthly * duration;
  const totalInterest = totalPayment - amount;

  const { mutate: submitApplication, isPending } = useMutation({
    mutationFn: async () => {
      if (!auth.currentUser) throw new Error("User tidak login");

      const today = new Date();
      const nextMonth = new Date();
      nextMonth.setMonth(today.getMonth() + 1);

      // Simpan ke koleksi 'loans' yang seragam dengan Admin
      await addDoc(collection(db, "loans"), {
        userId: auth.currentUser.uid,
        customer: auth.currentUser.email, // Sebagai identifier sementara
        amount,
        duration,
        rate,
        status: "pending",
        riskLevel: "medium",
        appliedDate: today.toISOString().split("T")[0],
        purpose,
        notes,
        // Properti tambahan agar UI tabel tidak crash
        remainingBalance: Math.round(totalPayment),
        paid: 0,
        total: duration,
        monthlyPayment: Math.round(monthly),
        startDate: today.toISOString().split("T")[0],
        nextDue: nextMonth.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      });
    },
    onSuccess: () => {
      toast.success("Pengajuan berhasil dikirim!");
      // Segarkan data loans agar muncul di tabel
      queryClient.invalidateQueries({ queryKey: ["loans"] });
      router.navigate({ to: "/dashboard/loans" });
    },
    onError: (error) => {
      toast.error("Gagal mengirim pengajuan. Silakan coba lagi.");
      console.error(error);
    }
  });

  return (
    <DashboardLayout role="customer" title="Apply for Loan" subtitle="Submit a new loan application">
      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 stat-card">
          <h3 className="font-semibold mb-6 flex items-center gap-2">
            <Calculator className="w-4 h-4" style={{ color: "var(--emerald)" }} /> Loan Calculator
          </h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>Loan Amount</label>
                <span className="text-sm font-bold" style={{ color: "var(--emerald)" }}>{formatCurrency(amount)}</span>
              </div>
              <input
                type="range"
                min={limits.min}
                max={limits.max}
                step={limits.min >= 1000000 ? 1000000 : 100000}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{ background: "var(--secondary)", accentColor: "var(--emerald)" }}
              />
              <div className="flex justify-between text-[10px] mt-1" style={{ color: "var(--muted-foreground)" }}>
                <span>{formatCurrency(limits.min)}</span>
                <span>{formatCurrency(limits.max)}</span>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium mb-2 block" style={{ color: "var(--muted-foreground)" }}>Loan Duration</label>
              <div className="grid grid-cols-4 gap-2">
                {/* Durasi difilter otomatis berdasarkan batas maksimal dari Admin */}
                {[6, 12, 24, 36].filter(d => d <= limits.maxDuration).map((d) => (
                  <button key={d} onClick={() => setDuration(d)}
                          className={`py-2.5 rounded-lg text-sm font-medium transition-all ${duration === d ? "gradient-emerald" : ""}`}
                          style={duration === d ? { color: "var(--emerald-foreground)" } : { background: "var(--secondary)", color: "var(--foreground)" }}>
                    {d} months
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium mb-2 block" style={{ color: "var(--muted-foreground)" }}>Loan Purpose</label>
              <select
                className="fintech-input"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
              >
                <option>Personal</option>
                <option>Business</option>
                <option>Education</option>
                <option>Emergency</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium mb-2 block" style={{ color: "var(--muted-foreground)" }}>Additional Notes</label>
              <textarea
                className="fintech-input"
                rows={3}
                placeholder="Tell us about your loan purpose..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="stat-card gradient-primary" style={{ color: "var(--primary-foreground)" }}>
            <p className="text-xs opacity-70 mb-1">Monthly Installment</p>
            <p className="text-3xl font-bold">{formatCurrency(Math.round(monthly))}</p>
            <p className="text-xs mt-2 opacity-60">per month for {duration} months</p>
          </div>
          <div className="stat-card space-y-3">
            <h4 className="font-semibold text-sm">Loan Summary</h4>
            {[
              ["Loan Amount", formatCurrency(amount)],
              ["Interest Rate", `${rate}% p.a.`],
              ["Duration", `${duration} months`],
              ["Total Interest", formatCurrency(Math.round(totalInterest))],
              ["Total Payment", formatCurrency(Math.round(totalPayment))],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm">
                <span style={{ color: "var(--muted-foreground)" }}>{k}</span>
                <span className="font-medium">{v}</span>
              </div>
            ))}
          </div>
          <div className="stat-card flex items-start gap-3" style={{ background: "color-mix(in oklch, var(--info) 8%, var(--card))" }}>
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "var(--info)" }} />
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              Interest rates are calculated based on loan duration. Actual rates may vary after credit assessment.
            </p>
          </div>

          <button
            className="btn-emerald w-full py-3"
            onClick={() => submitApplication()}
            disabled={isPending}
          >
            {isPending ? "Processing..." : (
              <>Submit Application <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}