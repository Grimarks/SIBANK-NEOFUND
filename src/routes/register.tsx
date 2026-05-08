import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Shield, Eye, EyeOff, ArrowRight, Upload } from "lucide-react";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Register — NeoFund" },
      { name: "description", content: "Create your NeoFund account" },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const [showPass, setShowPass] = useState(false);
  const [step, setStep] = useState(1);

  return (
    <div className="min-h-screen flex" style={{ background: "var(--background)" }}>
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-[45%] gradient-dark relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 opacity-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="absolute" style={{
              width: `${60 + i * 40}px`, height: "1px",
              background: "rgba(255,255,255,0.3)",
              top: `${10 + i * 11}%`, left: `${20 + (i % 3) * 15}%`,
              transform: `rotate(${-30 + i * 8}deg)`,
            }} />
          ))}
        </div>
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-emerald flex items-center justify-center">
            <Shield className="w-5 h-5" style={{ color: "var(--emerald-foreground)" }} />
          </div>
          <span className="text-xl font-bold" style={{ color: "var(--primary-foreground)" }}>NeoFund</span>
        </div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold leading-tight mb-4" style={{ color: "var(--primary-foreground)" }}>
            Start Your<br />Financial Journey
          </h2>
          <p className="text-sm opacity-60 max-w-xs" style={{ color: "var(--primary-foreground)" }}>
            Join thousands of users who trust NeoFund for smart loan management and financial growth.
          </p>
          <div className="mt-8 flex items-center gap-4">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step >= s ? "gradient-emerald" : ""}`}
                  style={step >= s ? { color: "var(--emerald-foreground)" } : { border: "1px solid rgba(255,255,255,0.3)", color: "rgba(255,255,255,0.5)" }}>
                  {s}
                </div>
                <span className="text-xs" style={{ color: "var(--primary-foreground)", opacity: step >= s ? 1 : 0.4 }}>
                  {s === 1 ? "Personal Info" : "Security"}
                </span>
                {s < 2 && <div className="w-8 h-px" style={{ background: "rgba(255,255,255,0.2)" }} />}
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10" />
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-lg animate-fade-in-up">
          <h1 className="text-2xl font-bold mb-1">Create your account</h1>
          <p className="text-sm mb-6" style={{ color: "var(--muted-foreground)" }}>Fill in your details to get started</p>

          {step === 1 ? (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>Full Name</label>
                <input className="fintech-input" placeholder="John Doe" />
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>Email Address</label>
                <input className="fintech-input" placeholder="you@example.com" type="email" />
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>Phone Number</label>
                <input className="fintech-input" placeholder="+62 812 3456 7890" />
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>Address</label>
                <textarea className="fintech-input" rows={2} placeholder="Your full address" />
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>Upload KTP / ID Card</label>
                <div className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors hover:border-emerald" style={{ borderColor: "var(--border)" }}>
                  <Upload className="w-8 h-8 mx-auto mb-2" style={{ color: "var(--muted-foreground)" }} />
                  <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Click or drag & drop your ID card</p>
                  <p className="text-[10px] mt-1" style={{ color: "var(--muted-foreground)", opacity: 0.6 }}>PNG, JPG up to 5MB</p>
                </div>
              </div>
              <button onClick={() => setStep(2)} className="btn-primary">
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>Password</label>
                <div className="relative">
                  <input type={showPass ? "text" : "password"} className="fintech-input pr-10" placeholder="Min. 8 characters" />
                  <button onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }}>
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>Confirm Password</label>
                <input type="password" className="fintech-input" placeholder="Repeat your password" />
              </div>
              <label className="flex items-start gap-2 text-xs cursor-pointer">
                <input type="checkbox" className="rounded mt-0.5" />
                <span style={{ color: "var(--muted-foreground)" }}>I agree to the <span style={{ color: "var(--emerald)" }} className="font-medium">Terms of Service</span> and <span style={{ color: "var(--emerald)" }} className="font-medium">Privacy Policy</span></span>
              </label>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-outline flex-1">Back</button>
                <Link to="/dashboard" className="btn-primary flex-1">
                  Create Account <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

          <p className="text-center text-xs mt-8" style={{ color: "var(--muted-foreground)" }}>
            Already have an account?{" "}
            <Link to="/login" className="font-semibold" style={{ color: "var(--emerald)" }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
