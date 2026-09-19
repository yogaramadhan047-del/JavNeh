"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Film, Lock, Mail, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw signInError;
      }

      if (!data.session?.access_token) {
        throw new Error("Gagal memperoleh sesi otentikasi. Silakan coba lagi.");
      }

      const token = data.session.access_token;
      document.cookie = `admin_token=${token}; path=/; max-age=86400; secure; samesite=strict`;
      router.push("/admin/dashboard");
    } catch (err: unknown) {
      console.error("Login error:", err);
      if (err instanceof Error) {
        setError(err.message || "Gagal masuk. Periksa kembali email dan password Anda.");
      } else {
        setError("Gagal masuk. Periksa kembali email dan password Anda.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-background-dark">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-blue/10 rounded-full blur-3xl opacity-50" />
      </div>
      <div className="relative w-full max-w-md bg-card-dark/80 backdrop-blur-xl border border-border-dark p-8 rounded-2xl shadow-2xl z-10">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-16 h-16 bg-primary-blue/20 rounded-2xl flex items-center justify-center text-primary-blue mb-4">
            <Film className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Admin Panel</h1>
          <p className="text-gray-400 text-sm">Masuk untuk mengelola konten XStream21.</p>
        </div>
        {error && (
          <div className="mb-6 bg-danger/10 border border-danger/20 text-danger p-4 rounded-xl flex items-start gap-3 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5 ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-primary-blue transition-colors" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-background-dark border border-border-dark rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all"
                placeholder="admin@xstream21.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5 ml-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-primary-blue transition-colors" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-background-dark border border-border-dark rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>
          <div className="flex items-center justify-between mt-2 mb-6 text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded border-border-dark bg-background-dark text-primary-blue focus:ring-primary-blue" />
              <span className="text-gray-400 select-none">Remember me</span>
            </label>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-blue hover:bg-primary-blue-hover text-white font-medium py-3 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
