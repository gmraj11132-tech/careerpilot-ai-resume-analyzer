"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Rocket, Check, X } from "lucide-react";

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
    { text: "Contains a number", met: /\d/.test(password) },
    { text: "Contains a special character", met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password) {
      setError("Please fill in all fields");
      return;
    }

    if (!passwordReqs.every(req => req.met)) {
      setError("Please meet all password requirements");
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password);
      router.push("/login?registered=true");
    } catch (err: any) {
      setError(err.message || "Failed to register");
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
        <h1 className="text-2xl font-bold tracking-tight">Create an account</h1>
        <p className="text-sm text-muted-foreground">Start your career journey with us</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm">
            {error}
          </div>
        )}
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none" htmlFor="name">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none" htmlFor="email">
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
          <label className="text-sm font-medium leading-none" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          <div className="mt-2 space-y-1">
            {passwordReqs.map((req, i) => (
              <div key={i} className="flex items-center text-xs">
                {req.met ? (
                  <Check className="mr-2 h-3 w-3 text-green-500" />
                ) : (
                  <X className="mr-2 h-3 w-3 text-muted-foreground" />
                )}
                <span className={req.met ? "text-muted-foreground" : "text-muted-foreground"}>
                  {req.text}
                </span>
              </div>
            ))}
          </div>
        </div>
        <button
          type="submit"
          className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-10"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            "Create Account"
          )}
        </button>
      </form>
      <div className="mt-6 text-center text-sm">
        <span className="text-muted-foreground">Already have an account? </span>
        <Link href="/login" className="text-primary hover:underline font-medium">
          Sign in
        </Link>
      </div>
    </div>
  );
}
