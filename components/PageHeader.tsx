import Link from "next/link";

interface PageHeaderProps {
  title: string;
}

export default function PageHeader({ title }: PageHeaderProps) {
  return (
    <div className="border-b bg-white">
      <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* LEFT: Title */}
        <h1 className="text-2xl font-bold">{title}</h1>

        {/* RIGHT: Links */}
        <div className="flex gap-4 text-sm">
          <Link href="/" className="underline">
            Home
          </Link>
          <Link href="/calendar" className="underline">
            Calendar
          </Link>
        </div>

      </div>
    </div>
  );
}