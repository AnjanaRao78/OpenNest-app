"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function PageNav() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Home" },
    { href: "/feed", label: "Feed" },
    { href: "/calendar", label: "Calendar" },
    
  ];

  return (
    <div className="w-full flex justify-end items-center gap-4 text-sm">
      {links.map((link) => {
        const isActive =
          pathname === link.href ||
          (link.href !== "/" && pathname.startsWith(link.href));

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`transition ${
              isActive
                ? "font-semibold underline"
                : "text-gray-600 hover:text-black"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}