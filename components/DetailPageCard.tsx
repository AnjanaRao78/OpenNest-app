"use client";

import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { ReactNode } from "react";

interface DetailField {
  label: string;
  value: ReactNode;
}

interface DetailPageCardProps {
  title: string;
  fields: DetailField[];
  backHref: string;
  backLabel: string;
  calendarHref?: string;
  editHref?: string;
  canEdit?: boolean;
}

export default function DetailPageCard({
  title,
  fields,
  backHref,
  backLabel,
  calendarHref = "/calendar",
  editHref,
  canEdit = false,
}: DetailPageCardProps) {
  return (
    <div>
      <PageHeader title={title} />

      <div className="max-w-2xl mx-auto p-6">
        <div className="rounded-2xl border border-neutral-300 bg-white shadow p-6">
          <h1 className="text-2xl font-bold mb-4">{title}</h1>

          <div className="grid gap-2 text-sm">
            {fields.map((field) => (
              <p key={field.label}>
                <strong>{field.label}:</strong> {field.value}
              </p>
            ))}
          </div>

          <div className="mt-6 flex gap-3 flex-wrap">
            <Link href={backHref} className="underline">
              {backLabel}
            </Link>

            <Link href={calendarHref} className="underline">
              Back to Calendar
            </Link>

            {canEdit && editHref && (
              <Link
                href={editHref}
                className="px-4 py-2 rounded bg-black text-white"
              >
                Edit
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}