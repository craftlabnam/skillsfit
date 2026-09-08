"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import posthog from "posthog-js";

type Props = {
  ctaHref?: string;
};

export function CTA({ ctaHref = "/login" }: Props) {
  return (
    <section className="max-w-[1440px] mx-auto px-6 pb-20">
      <div className="hero-gradient rounded-2xl px-8 py-20 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-text-primary leading-tight max-w-xl mx-auto">
          Your next job search can feel a lot less overwhelming
        </h2>
        <p className="mt-4 text-text-secondary max-w-lg mx-auto">
          Set up your profile, upload your resume, and start finding matches
          in minutes.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href={ctaHref}
            onClick={() =>
              posthog.capture("cta_clicked", {
                location: "cta_section",
                label: "Get Started",
                destination: ctaHref,
              })
            }
            className="inline-flex items-center gap-1 rounded-md bg-overlay-dark px-4 py-2 text-sm font-medium text-white hover:bg-text-primary transition-colors"
          >
            Get Started
            <ArrowRight className="size-4" />
          </Link>
          <Link
            href={ctaHref}
            onClick={() =>
              posthog.capture("cta_clicked", {
                location: "cta_section",
                label: "Find Your First Match",
                destination: ctaHref,
              })
            }
            className="inline-flex items-center rounded-md bg-surface border border-border px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface-secondary transition-colors"
          >
            Find Your First Match
          </Link>
        </div>
      </div>
    </section>
  );
}
