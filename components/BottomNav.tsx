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
      
      <Link
        href="/reflection"
        className={isActive("/reflection") ? "active" : ""}
      >
        Reflection
      </Link>

      <Link
        href="/studies"
        className={isActive("/studies") ? "active" : ""}
      >
        Classes
      </Link>

      <Link
        href="/internship"
        className={isActive("/internship") ? "active" : ""}
      >
        Internship
      </Link>

        <Link
        href="/reading"
        className={isActive("/reading") ? "active" : ""}
      >
        Reading
      </Link>

        <Link
        href="/hobbies"
        className={isActive("/hobbies") ? "active" : ""}
      >
        Hobbies
      </Link>

      <Link href="/calendar" className={isActive("/calendar") ? "active" : ""}>
        Calendar
      </Link>

    
    </nav>
  );
}