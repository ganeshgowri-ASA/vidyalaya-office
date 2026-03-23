"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 23 23">
      <rect x="1" y="1" width="10" height="10" fill="#F25022" />
      <rect x="12" y="1" width="10" height="10" fill="#7FBA00" />
      <rect x="1" y="12" width="10" height="10" fill="#00A4EF" />
      <rect x="12" y="12" width="10" height="10" fill="#FFB900" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

function SignInContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const error = searchParams.get("error");

  const providers = [
    {
      id: "google",
      name: "Google",
      icon: <GoogleIcon />,
      bg: "#ffffff",
      color: "#1f1f1f",
      hoverBg: "#f2f2f2",
    },
    {
      id: "azure-ad",
      name: "Microsoft",
      icon: <MicrosoftIcon />,
      bg: "#2f2f2f",
      color: "#ffffff",
      hoverBg: "#3a3a3a",
    },
    {
      id: "apple",
      name: "Apple",
      icon: <AppleIcon />,
      bg: "#000000",
      color: "#ffffff",
      hoverBg: "#1a1a1a",
    },
  ];

  return (
    <div
      className="flex min-h-screen items-center justify-center p-4"
      style={{ backgroundColor: "var(--background)" }}
    >
      <div
        className="w-full max-w-md rounded-2xl border p-8"
        style={{
          backgroundColor: "var(--card)",
          borderColor: "var(--border)",
        }}
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <h1
            className="text-3xl font-bold mb-1"
            style={{ color: "var(--primary)" }}
          >
            विद्यालय
          </h1>
          <p
            className="text-sm font-medium mb-1"
            style={{ color: "var(--foreground)" }}
          >
            Vidyalaya Office
          </p>
          <p
            className="text-xs"
            style={{ color: "var(--muted-foreground)" }}
          >
            Sign in to access your workspace
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div
            className="mb-4 rounded-lg border px-4 py-3 text-sm"
            style={{
              borderColor: "#dc262640",
              backgroundColor: "#dc262610",
              color: "#ef4444",
            }}
          >
            {error === "OAuthAccountNotLinked"
              ? "This email is already linked to another account. Please sign in with the original provider."
              : "An error occurred during sign in. Please try again."}
          </div>
        )}

        {/* Provider buttons */}
        <div className="space-y-3">
          {providers.map((provider) => (
            <button
              key={provider.id}
              onClick={() =>
                signIn(provider.id, { callbackUrl })
              }
              className="flex w-full items-center justify-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all hover:scale-[1.01] active:scale-[0.99]"
              style={{
                backgroundColor: provider.bg,
                color: provider.color,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = provider.hoverBg)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = provider.bg)
              }
            >
              {provider.icon}
              Sign in with {provider.name}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <div
            className="h-px flex-1"
            style={{ backgroundColor: "var(--border)" }}
          />
          <span
            className="text-xs"
            style={{ color: "var(--muted-foreground)" }}
          >
            Secure OAuth 2.0 authentication
          </span>
          <div
            className="h-px flex-1"
            style={{ backgroundColor: "var(--border)" }}
          />
        </div>

        {/* Footer */}
        <p
          className="text-center text-[11px]"
          style={{ color: "var(--muted-foreground)" }}
        >
          By signing in, you agree to our Terms of Service and Privacy
          Policy. Your data is encrypted and securely stored.
        </p>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div
          className="flex min-h-screen items-center justify-center"
          style={{ backgroundColor: "var(--background)" }}
        >
          <div
            className="text-sm"
            style={{ color: "var(--muted-foreground)" }}
          >
            Loading...
          </div>
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
