"use client";

import { useState, useTransition } from "react";
import posthog from "posthog-js";
import { signInWithPassword } from "@/actions/auth";

export function EmailPasswordForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    posthog.capture("sign_in_attempted", { method: "email" });
    startTransition(async () => {
      const result = await signInWithPassword(email, password);
      if (result?.error) {
        setError(result.error);
        posthog.capture("sign_in_failed", { method: "email", error: result.error });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-text-secondary mb-1"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-text-secondary mb-1"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full inline-flex items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent-dark transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Signing in…" : "Sign in"}
      </button>

      {error && <p className="text-sm text-error text-center">{error}</p>}
    </form>
  );
}
