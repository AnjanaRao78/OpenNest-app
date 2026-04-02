import Link from "next/link";
import { ReactNode } from "react";
import BrandAnchor from "@/components/BrandAnchor";

type AppShellProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  action?: ReactNode;
};

const navItems = [
  { href: "/reflection", label: "Reflection" },
  { href: "/reading", label: "Reading" },
  { href: "/studies", label: "Studies" },
  { href: "/internship", label: "Internship" },
  { href: "/calendar", label: "Calendar" },
];

export default function AppShell({
  title,
  subtitle,
  children,
  action,
}: AppShellProps) {
  return (
    <main className="on-page-shell">
      <div className="on-brand-glow on-brand-glow-teal" />
      <div className="on-brand-glow on-brand-glow-gold" />

      <div className="on-page-container">
        <header className="on-topbar on-surface">
          <BrandAnchor />

          <nav className="on-nav" aria-label="Primary">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="on-nav-link">
                {item.label}
              </Link>
            ))}
          </nav>
        </header>

        <section className="on-page-hero on-surface">
          <div>
            <p className="on-kicker">OpenNest</p>
            <h1 className="on-page-title">{title}</h1>
            {subtitle ? <p className="on-page-subtitle">{subtitle}</p> : null}
          </div>
          {action ? <div>{action}</div> : null}
        </section>

        {children}
      </div>
    </main>
  );
}