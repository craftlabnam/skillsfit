"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import posthog from "posthog-js";

type Props = {
  ctaHref?: string;
};

export function Hero({ ctaHref = "/login" }: Props) {
  return (
    <section className="max-w-[1440px] mx-auto px-6 pt-8">
      <div className="hero-gradient rounded-2xl px-8 py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-text-primary leading-tight max-w-2xl mx-auto">
          Job hunting is hard.
          <br />
          Your tools shouldn&apos;t be.
        </h1>
        <p className="mt-4 text-text-secondary max-w-xl mx-auto">
          Stop applying blind. SkillsFit finds the jobs, researches the
          companies, and gives you everything you need to stand out.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href={ctaHref}
            onClick={() =>
              posthog.capture("cta_clicked", {
                location: "hero",
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
                location: "hero",
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

      <div className="relative -mt-10 md:-mt-16 max-w-4xl mx-auto px-4">
        <Image
          src="/images/dashboard-demo.png"
          alt="SkillsFit dashboard preview"
          width={4788}
          height={2416}
          className="w-full h-auto"
          priority
        />
      </div>
    </section>
  );
}
