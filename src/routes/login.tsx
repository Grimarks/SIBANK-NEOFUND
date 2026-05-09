import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Shield, Eye, EyeOff, ArrowRight } from "lucide-react";

// --- Import Firebase Auth & Utilities ---
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — NeoFund" },
      { name: "description", content: "Login to your NeoFund account" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Fungsi Login Firebase
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Mohon isi email dan password.");
      return;
    }

    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Login berhasil!");

      // Jika berhasil, arahkan ke Dashboard
      // (Bisa ditambahkan logika: jika email admin, arahkan ke /admin)
      if (email.includes("admin")) {
        router.navigate({ to: "/admin" });
      } else {
        router.navigate({ to: "/dashboard" });
      }
    } catch (error: any) {
      console.error(error);
      toast.error("Login gagal. Periksa kembali email dan password Anda.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "var(--background)" }}>
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 opacity-10">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute rounded-full" style={{
              width: `${100 + i * 80}px`, height: `${100 + i * 80}px`,
              border: "1px solid rgba(255,255,255,0.2)",
              top: `${10 + i * 12}%`, left: `${-5 + i * 10}%`,
            }} />
          ))}
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl gradient-emerald flex items-center justify-center">
              <Shield className="w-5 h-5" style={{ color: "var(--emerald-foreground)" }} />
            </div>
            <span className="text-xl font-bold" style={{ color: "var(--primary-foreground)" }}>NeoFund</span>
          </div>
        </div>
        <div className="relative z-10">
          <h2 className="text-4xl font-bold leading-tight mb-4" style={{ color: "var(--primary-foreground)" }}>
            Smart Banking<br />for the Next<br />Generation
          </h2>
          <p className="text-sm opacity-70" style={{ color: "var(--primary-foreground)" }}>
            Manage your loans, track payments, and grow your financial future with NeoFund's intelligent platform.
          </p>
        </div>
        <div className="relative z-10 flex gap-8">
          {[["10K+", "Active Users"], ["Rp 50B+", "Loans Processed"], ["99.9%", "Uptime"]].map(([val, lbl]) => (
            <div key={lbl}>
              <p className="text-2xl font-bold" style={{ color: "var(--primary-foreground)" }}>{val}</p>
              <p className="text-xs opacity-60" style={{ color: "var(--primary-foreground)" }}>{lbl}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl gradient-emerald flex items-center justify-center">
              <Shield className="w-5 h-5" style={{ color: "var(--emerald-foreground)" }} />
            </div>
            <span className="text-xl font-bold">NeoFund</span>
          </div>

          <h1 className="text-2xl font-bold mb-1">Welcome back</h1>
          <p className="text-sm mb-8" style={{ color: "var(--muted-foreground)" }}>Enter your credentials to access your account</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>Email or Username</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="fintech-input" placeholder="you@example.com" required />
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>Password</label>
              <div className="relative">
                <input type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="fintech-input pr-10" placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }}>
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input type="checkbox" className="rounded" /> <span style={{ color: "var(--muted-foreground)" }}>Remember me</span>
              </label>
              <button type="button" className="text-xs font-medium" style={{ color: "var(--emerald)" }}>Forgot password?</button>
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary mt-2 w-full">
              {isLoading ? "Signing in..." : <>Sign In <ArrowRight className="w-4 h-4" /></>}
            </button>

            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
              <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>or continue as</span>
              <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
            </div>

            <Link to="/admin" className="btn-outline w-full justify-center">
              <Shield className="w-4 h-4" /> Admin Dashboard
            </Link>
          </form>

          <p className="text-center text-xs mt-8" style={{ color: "var(--muted-foreground)" }}>
            Don't have an account?{" "}
            <Link to="/register" className="font-semibold" style={{ color: "var(--emerald)" }}>Create account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}