"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../components/AuthContext";
import Link from "next/link";
import ThemeToggle from "../../components/ThemeToggle";
import { Loader2, Eye, EyeOff, Zap } from "lucide-react";

export default function LoginPage() {
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const { login } = useAuth(); // Safely calls Supabase Auth internally

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { ok, message, user } = await login(loginId, password);
      if (ok && user) {
        if (user.role === "admin") router.push("/admin");
        else if (user.role === "teacher") router.push("/dashboard");
        else router.push("/questions");
      } else {
        setError(message || "Invalid login credentials.");
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col overflow-hidden">
      
      {/* Background Animations */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-48 -left-48 w-96 h-96 rounded-full bg-blue-500/25 blur-[100px] animate-pulse" />
        <div className="absolute top-1/3 -right-48 w-96 h-96 rounded-full bg-indigo-500/25 blur-[100px] animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute -bottom-48 left-1/3 w-96 h-96 rounded-full bg-blue-400/20 blur-[80px] animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12 sm:py-16">
        <div className="w-full max-w-md animate-fade-in">
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl shadow-blue-500/40 mb-4">
              <Zap className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              Student Portal
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              LeetCode Progress Tracker
            </p>
          </div>

          <div className="glass-card p-6 sm:p-8 space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Sign in</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Or{" "}
                <Link href="/register" className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400">
                  create a new account
                </Link>
              </p>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 p-3 text-sm text-red-700 dark:text-red-300">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Identifiers
                </label>
                <input
                  id="loginId"
                  type="text"
                  required
                  autoComplete="username"
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-slate-800/60 px-3.5 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="Email, Roll No, or LeetCode User"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-slate-800/60 px-3.5 py-2.5 pr-10 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 py-2.5 px-4 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 transition-all duration-200"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? "Authenticating..." : "Sign In"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
