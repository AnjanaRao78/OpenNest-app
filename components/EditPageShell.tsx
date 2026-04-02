"use client";

import { ReactNode } from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";

type EditPageShellProps = {
  title: string;
  children: ReactNode;
  onSave: () => void | Promise<void>;
  cancelHref: string;
  statusMessage?: string;
};

export default function EditPageShell({
  title,
  children,
  onSave,
  cancelHref,
  statusMessage,
}: EditPageShellProps) {
  return (
    <div>
      <PageHeader title={title} />

      <div className="max-w-2xl mx-auto p-6">
        <div className="rounded-2xl border bg-white shadow p-6">
          <div className="space-y-3">{children}</div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onSave}
              className="bg-black text-white px-4 py-2 rounded"
            >
              Save Changes
            </button>

            <Link href={cancelHref} className="border px-4 py-2 rounded">
              Cancel
            </Link>
          </div>

          {statusMessage && <p className="mt-4 text-sm">{statusMessage}</p>}
        </div>
      </div>
    </div>
  );
}