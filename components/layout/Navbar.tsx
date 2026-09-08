"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import posthog from "posthog-js";
import { SignOutButton } from "@/components/auth/SignOutButton";

const NAV_LINKS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Find Jobs", href: "/find-jobs" },
  { label: "Profile", href: "/profile" },
];

type Props = {
  ctaHref?: string;
  signedIn?: boolean;
};

export function Navbar({ ctaHref = "/login", signedIn = false }: Props) {
  const pathname = usePathname();

  return (
    <header className="w-full h-16 bg-surface border-b border-border">
      <div className="max-w-[1440px] mx-auto h-full px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="SkillsFit"
            width={496}
            height={168}
            priority
            className="h-8 w-auto"
          />
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={
                  isActive
                    ? "text-sm font-medium text-accent transition-colors"
                    : "text-sm font-medium text-text-secondary hover:text-accent transition-colors"
                }
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {signedIn ? (
          <SignOutButton />
        ) : (
          <Link
            href={ctaHref}
            onClick={() =>
              posthog.capture("cta_clicked", {
                location: "navbar",
                label: "Start for free",
                destination: ctaHref,
              })
            }
            className="inline-flex items-center rounded-md bg-overlay-dark px-4 py-2 text-sm font-medium text-white hover:bg-text-primary transition-colors"
          >
            Start for free
          </Link>
        )}
      </div>
    </header>
  );
}
