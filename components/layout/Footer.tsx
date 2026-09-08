import Image from "next/image";
import Link from "next/link";

const FOOTER_LINKS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms & Condition", href: "/terms" },
];

export function Footer() {
  return (
    <footer className="w-full bg-surface border-t border-border">
      <div className="max-w-[1440px] mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="SkillsFit"
            width={496}
            height={168}
            className="h-7 w-auto"
          />
        </Link>

        <nav className="flex items-center gap-6">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-text-secondary hover:text-accent transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
