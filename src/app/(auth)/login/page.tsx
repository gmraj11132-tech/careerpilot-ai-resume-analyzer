"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Rocket } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex flex-col items-center space-y-2 mb-8">
        <Link href="/" className="bg-primary/10 p-3 rounded-full mb-2">
          <Rocket className="h-6 w-6 text-primary" />
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">Enter your credentials to continue</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm">
            {error}
          </div>
        )}
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="m@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="password">
              Password
            </label>
            <Link href="#" className="text-xs text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-10"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            "Sign In"
          )}
        </button>
      </form>
      <div className="mt-6 text-center text-sm">
        <span className="text-muted-foreground">Don't have an account? </span>
        <Link href="/register" className="text-primary hover:underline font-medium">
          Register here
        </Link>
      </div>
    </div>
  );
}
