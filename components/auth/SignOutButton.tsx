"use client";

import { useState, useTransition } from "react";
import posthog from "posthog-js";
import { signOut } from "@/actions/auth";

export function SignOutButton() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSignOut = () => {
    setError(null);
    // Reset before the request, not after: signOut() redirects server-side on
    // success rather than returning, so code placed after that await is not
    // guaranteed to run before the client-side navigation it triggers.
    posthog.reset();
    startTransition(async () => {
      const result = await signOut();
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        disabled={isPending}
        onClick={handleSignOut}
        className="inline-flex items-center justify-center rounded-md bg-surface border border-border px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface-secondary transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Signing out…" : "Sign out"}
      </button>

      {error && <p className="text-sm text-error text-center">{error}</p>}
    </div>
  );
}
