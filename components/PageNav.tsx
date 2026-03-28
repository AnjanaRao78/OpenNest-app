"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function PageNav() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Home" },
    { href: "/calendar", label: "Calendar" },
    { href: "/feed", label: "Feed" },
    { href: "/studies", label: "Studies" },
    { href: "/reading", label: "Reading" },
    { href: "/hobbies", label: "Hobbies" },
    { href: "/internship", label: "Internship" },
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