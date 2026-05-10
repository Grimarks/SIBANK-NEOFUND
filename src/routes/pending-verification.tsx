import { createFileRoute, Link } from "@tanstack/react-router";
import { Shield, Clock, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/pending-verification")({
  component: PendingVerificationPage,
});

function PendingVerificationPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "var(--background)" }}>
      <div className="w-full max-w-md text-center animate-fade-in">
        <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Clock className="w-10 h-10" style={{ color: "var(--primary-foreground)" }} />
        </div>

        <h1 className="text-2xl font-bold mb-2">Harap Tunggu Verifikasi</h1>
        <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
          Pendaftaran Anda berhasil! Akun Anda sedang dalam proses peninjauan oleh tim admin.
          Verifikasi data biasanya memerlukan waktu <span className="font-semibold text-foreground">1 x 24 jam</span>.
        </p>

        <div className="p-4 rounded-xl border border-dashed mb-8" style={{ borderColor: "var(--border)", background: "var(--secondary)" }}>
          <div className="flex items-center gap-3 text-left">
            <Shield className="w-5 h-5 text-emerald-500" />
            <p className="text-xs text-muted-foreground">
              Kami menjaga keamanan data Anda. Anda akan mendapatkan akses penuh setelah verifikasi selesai.
            </p>
          </div>
        </div>

        <Link to="/login" className="btn-primary w-full justify-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Login
        </Link>
      </div>
    </div>
  );
}