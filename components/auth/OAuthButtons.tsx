"use client";

import { useState, useTransition } from "react";
import posthog from "posthog-js";
import { signInWithOAuth } from "@/actions/auth";

export function OAuthButtons() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSignIn = () => {
    setError(null);
    posthog.capture("oauth_sign_in_attempted", { provider: "google" });
    startTransition(async () => {
      const result = await signInWithOAuth("google");
      if (result?.error) {
        setError(result.error);
        posthog.capture("sign_in_failed", { method: "oauth", provider: "google", error: result.error });
      }
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        disabled={isPending}
        onClick={handleSignIn}
        className="w-full inline-flex items-center justify-center gap-3 rounded-md bg-surface border border-border px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface-secondary transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
      >
        <GoogleIcon />
        {isPending ? "Redirecting…" : "Continue with Google"}
      </button>

      {error && <p className="text-sm text-error text-center">{error}</p>}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="var(--color-google-blue)"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62Z"
      />
      <path
        fill="var(--color-google-green)"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.96v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="var(--color-google-yellow)"
        d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.03l2.99-2.33Z"
      />
      <path
        fill="var(--color-google-red)"
        d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.97l2.99 2.33C4.66 5.17 6.65 3.58 9 3.58Z"
      />
    </svg>
  );
}
