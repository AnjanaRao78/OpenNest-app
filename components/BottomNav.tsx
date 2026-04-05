"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <nav className="opennest-bottom-nav">
      <Link href="/" className={isActive("/") ? "active" : ""}>
        Home
      </Link>
      <Link href="/feed" className={isActive("/feed") ? "active" : ""}>
        Feed
      </Link>
      <Link href="/calendar" className={isActive("/calendar") ? "active" : ""}>
        Calendar
      </Link>
      <Link
        href="/reflection"
        className={isActive("/reflection") ? "active" : ""}
      >
        Reflection
      </Link>
    </nav>
  );
}