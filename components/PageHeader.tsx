"use client";

import Link from "next/link";

export default function PageHeader({
  title,
}: {
  title: string;
}) {
  return (
    <header className="opennest-header">
      
      {/* LEFT: Logo + Title */}
      <div className="opennest-header-left">
        <img
          src="/opennest-logo.png"   // <-- place your uploaded logo in /public/opennest-logo.png
          alt="OpenNest"
          className="opennest-logo"
        />

        <div className="opennest-title">
          {title}
        </div>
      </div>

      {/* RIGHT: Navigation */}
      <div className="opennest-header-right">
        <Link href="/" className="text-sm text-[#5f6f73]">
          Home
        </Link>
        <Link href="/calendar" className="text-sm text-[#5f6f73]">
          Calendar
        </Link>
      </div>
    </header>
  );
}