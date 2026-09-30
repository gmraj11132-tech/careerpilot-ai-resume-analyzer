"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Rocket, Check, X, AlertCircle } from "lucide-react";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordReqs = [
    { text: "At least 8 characters", met: password.length >= 8 },
    { text: "One uppercase letter (A-Z)", met: /[A-Z]/.test(password) },
    { text: "One lowercase letter (a-z)", met: /[a-z]/.test(password) },
    { text: "One number (0-9)", met: /[0-9]/.test(password) },
  ];

  const allReqsMet = passwordReqs.every((req) => req.met);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (!allReqsMet) {
      setError("Please satisfy all password security requirements before proceeding.");
      return;
    }

    setLoading(true);
    try {
      const res = await register(name, email, password);
      if (res.success) {
        // Automatically authenticated! Navigate directly to dashboard!
        router.push("/dashboard");
      } else {
        setError(res.error || "Failed to create account. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to register. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex flex-col items-center space-y-2 mb-6">
        <Link href="/" className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-full mb-2">
          <Rocket className="h-6 w-6 text-blue-600" />
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Create an Account
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Start your smart campus placement preparation
        </p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 p-3 rounded-lg text-xs flex items-center gap-2 border border-red-200 dark:border-red-800">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300" htmlFor="name">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            className="flex h-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            placeholder="e.g. John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            required
          />
        </div>

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
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300" htmlFor="password">
            Create Password
          </label>
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

          {/* Real-time Password Checklist */}
          <div className="mt-2.5 p-2.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-lg space-y-1">
            <span className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 block mb-1">
              Password Requirements:
            </span>
            {passwordReqs.map((req, i) => (
              <div key={i} className="flex items-center text-xs">
                {req.met ? (
                  <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                ) : (
                  <X className="mr-1.5 h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                )}
                <span className={req.met ? "text-emerald-700 dark:text-emerald-300 font-medium" : "text-gray-500 dark:text-gray-400"}>
                  {req.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-blue-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 disabled:opacity-50 h-10 mt-2"
          disabled={loading || !allReqsMet}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Setting up your account...</span>
            </div>
          ) : (
            "Create Account & Enter Dashboard"
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
        <span>Already have an account? </span>
        <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">
          Sign in here
        </Link>
      </div>
    </div>
  );
}
