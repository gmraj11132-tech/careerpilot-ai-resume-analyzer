"use client";

import { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, Rocket, AlertCircle, CheckCircle, UserCheck } from "lucide-react";

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      setSuccessMsg("Account registered successfully! Please log in.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!email.trim() || !password) {
      setError("Please fill in both your email and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        router.push("/dashboard");
      } else {
        setError(res.error || "Invalid email or password. Please verify your credentials.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please verify the server is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError("");
  };

  return (
    <div className="p-8">
      <div className="flex flex-col items-center space-y-2 mb-6">
        <Link href="/" className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-full mb-2">
          <Rocket className="h-6 w-6 text-blue-600" />
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Welcome back
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Sign in to your CareerPilot placement dashboard
        </p>
      </div>

      {successMsg && (
        <div className="mb-4 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 p-3 rounded-lg text-xs flex items-center gap-2 border border-emerald-200 dark:border-emerald-800">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="mb-4 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 p-3 rounded-lg text-xs flex items-center gap-2 border border-red-200 dark:border-red-800">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Quick 1-Click Demo Login Box */}
      <div className="mb-6 p-3 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-800 dark:text-blue-300 mb-2">
          <UserCheck className="w-3.5 h-3.5" />
          <span>Quick Demo Access (Instant Fill):</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleFillDemo("demo@careerpilot.dev", "Demo@1234")}
            className="text-left px-2.5 py-1.5 bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 rounded-lg text-xs hover:border-blue-400 transition-colors shadow-2xs"
          >
            <div className="font-semibold text-gray-900 dark:text-white">Student Demo</div>
            <div className="text-[11px] text-gray-400 font-mono">demo@careerpilot.dev</div>
          </button>
          <button
            type="button"
            onClick={() => handleFillDemo("admin@careerpilot.dev", "Admin@1234")}
            className="text-left px-2.5 py-1.5 bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 rounded-lg text-xs hover:border-blue-400 transition-colors shadow-2xs"
          >
            <div className="font-semibold text-gray-900 dark:text-white">Admin Demo</div>
            <div className="text-[11px] text-gray-400 font-mono">admin@careerpilot.dev</div>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300" htmlFor="email">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            className="flex h-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            placeholder="student@university.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300" htmlFor="password">
              Password
            </label>
          </div>
          <input
            id="password"
            type="password"
            className="flex h-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        <button
          type="submit"
          className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-blue-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 disabled:opacity-50 h-10"
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Verifying Credentials...</span>
            </div>
          ) : (
            "Sign In to Dashboard"
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
        <span>Don't have an account? </span>
        <Link href="/register" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">
          Create student account
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 flex justify-center items-center min-h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
