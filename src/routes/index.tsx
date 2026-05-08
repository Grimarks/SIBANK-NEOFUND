import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Shield, ArrowRight, CreditCard, BarChart3, Lock, Zap, Globe, Users } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NeoFund — Smart Digital Banking" },
      { name: "description", content: "Modern loan and installment management platform for the next generation" },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl gradient-emerald flex items-center justify-center">
            <Shield className="w-4 h-4" style={{ color: "var(--emerald-foreground)" }} />
          </div>
          <span className="text-lg font-bold">NeoFund</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="btn-outline text-sm py-2 px-4">Sign In</Link>
          <Link to="/register" className="btn-emerald text-sm py-2 px-4">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 md:px-12 py-20 md:py-32 max-w-6xl mx-auto text-center">
        <div className="animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-xs font-medium" style={{ background: "var(--secondary)", color: "var(--emerald)" }}>
            <Zap className="w-3 h-3" /> Next-Gen Digital Banking Platform
          </div>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            Banking Made
            <span className="block" style={{ color: "var(--emerald)" }}> Brilliantly Simple</span>
          </h1>
          <p className="text-base md:text-lg max-w-xl mx-auto mb-10" style={{ color: "var(--muted-foreground)" }}>
            Apply for loans, manage installments, and track your financial health — all in one beautiful, intelligent platform.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/register" className="btn-emerald px-8 py-3 text-base">
              Start Free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/login" className="btn-outline px-8 py-3 text-base">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 md:px-12 py-20 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: CreditCard, title: "Smart Loans", desc: "Apply and manage loans with real-time tracking and transparent terms." },
            { icon: BarChart3, title: "Analytics", desc: "Beautiful dashboards with actionable insights on your financial health." },
            { icon: Lock, title: "Bank-Grade Security", desc: "Your data is protected with enterprise-level encryption and compliance." },
            { icon: Zap, title: "Instant Approval", desc: "AI-powered credit scoring delivers decisions in minutes, not days." },
            { icon: Globe, title: "Digital First", desc: "Access everything from any device — no branch visits needed." },
            { icon: Users, title: "Community Trust", desc: "Trusted by 10,000+ users across the country for their financial needs." },
          ].map((f) => (
            <div key={f.title} className="stat-card group">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 gradient-emerald transition-transform group-hover:scale-110">
                <f.icon className="w-5 h-5" style={{ color: "var(--emerald-foreground)" }} />
              </div>
              <h3 className="font-semibold mb-2">{f.title}</h3>
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 md:px-12 py-8 text-center border-t" style={{ borderColor: "var(--border)" }}>
        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>© 2024 NeoFund. All rights reserved.</p>
      </footer>
    </div>
  );
}
