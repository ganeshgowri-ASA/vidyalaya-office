"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [localError, setLocalError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLocalError("");
    clearError();

    if (password !== confirmPassword) {
      setLocalError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setLocalError("Password must be at least 6 characters");
      return;
    }
    if (!termsAccepted) {
      setLocalError("Please accept the terms and conditions");
      return;
    }

    const ok = await register(name, email, password);
    if (ok) router.push("/");
  }

  const displayError = localError || error;

  return (
    <div
      className="flex min-h-screen items-center justify-center p-4"
      style={{ backgroundColor: "var(--background)" }}
    >
      <div
        className="w-full max-w-md rounded-2xl border p-8 shadow-xl"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <span
            className="text-3xl font-bold"
            style={{ color: "var(--primary)" }}
          >
            विद्यालय
          </span>
          <p className="mt-1 text-sm" style={{ color: "var(--muted-foreground, #888)" }}>
            Vidyalaya Office
          </p>
          <h1
            className="mt-4 text-2xl font-semibold"
            style={{ color: "var(--foreground)" }}
          >
            Create your account
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--muted-foreground, #888)" }}>
            Get started with Vidyalaya Office for free
          </p>
        </div>

        {/* Error */}
        {displayError && (
          <div
            className="mb-4 rounded-lg border px-4 py-3 text-sm"
            style={{
              backgroundColor: "rgba(239,68,68,0.1)",
              borderColor: "rgba(239,68,68,0.3)",
              color: "#ef4444",
            }}
          >
            {displayError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="mb-1.5 block text-sm font-medium"
              style={{ color: "var(--foreground)" }}
            >
              Full name
            </label>
            <div className="relative">
              <User
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--muted-foreground, #888)" }}
              />
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Jane Doe"
                className="w-full rounded-lg border py-2.5 pl-10 pr-3 text-sm outline-none transition-colors focus:ring-2"
                style={{
                  backgroundColor: "var(--background)",
                  borderColor: "var(--border)",
                  color: "var(--foreground)",
                }}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium"
              style={{ color: "var(--foreground)" }}
            >
              Email
            </label>
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--muted-foreground, #888)" }}
              />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full rounded-lg border py-2.5 pl-10 pr-3 text-sm outline-none transition-colors focus:ring-2"
                style={{
                  backgroundColor: "var(--background)",
                  borderColor: "var(--border)",
                  color: "var(--foreground)",
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium"
              style={{ color: "var(--foreground)" }}
            >
              Password
            </label>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--muted-foreground, #888)" }}
              />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="At least 6 characters"
                className="w-full rounded-lg border py-2.5 pl-10 pr-10 text-sm outline-none transition-colors focus:ring-2"
                style={{
                  backgroundColor: "var(--background)",
                  borderColor: "var(--border)",
                  color: "var(--foreground)",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--muted-foreground, #888)" }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-1.5 block text-sm font-medium"
              style={{ color: "var(--foreground)" }}
            >
              Confirm password
            </label>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--muted-foreground, #888)" }}
              />
              <input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Repeat password"
                className="w-full rounded-lg border py-2.5 pl-10 pr-10 text-sm outline-none transition-colors focus:ring-2"
                style={{
                  backgroundColor: "var(--background)",
                  borderColor: "var(--border)",
                  color: "var(--foreground)",
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--muted-foreground, #888)" }}
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Terms */}
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-0.5 h-4 w-4 cursor-pointer rounded accent-[var(--primary)]"
            />
            <span className="text-sm" style={{ color: "var(--foreground)" }}>
              I agree to the{" "}
              <Link
                href="#"
                className="font-medium hover:underline"
                style={{ color: "var(--primary)" }}
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="#"
                className="font-medium hover:underline"
                style={{ color: "var(--primary)" }}
              >
                Privacy Policy
              </Link>
            </span>
          </label>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{
              backgroundColor: "var(--primary)",
              color: "var(--primary-foreground, #fff)",
            }}
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Creating account...
              </>
            ) : (
              "Create account"
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-sm" style={{ color: "var(--muted-foreground, #888)" }}>
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium hover:underline"
            style={{ color: "var(--primary)" }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
