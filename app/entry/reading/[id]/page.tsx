"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { User } from "firebase/auth";
import { subscribeToAuth } from "@/lib/auth";
import { loadEntryById } from "@/lib/entryDetail";

export default function ReadingDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [entry, setEntry] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToAuth(setUser);

    async function fetchEntry() {
      const data = await loadEntryById("reading", id);
      setEntry(data);
      setLoading(false);
    }

    fetchEntry();

    return () => unsub();
  }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!entry) return <div className="p-6">Reading entry not found.</div>;

  const canEdit = user?.uid === entry.authorUid;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="rounded-2xl border bg-white shadow p-6">
        <h1 className="text-2xl font-bold mb-4">{entry.title}</h1>

        <div className="space-y-2 text-sm">
          <p><strong>Author:</strong> {entry.authorName}</p>
          <p><strong>Status:</strong> {entry.status}</p>
          <p><strong>Notes:</strong> {entry.notes}</p>
        </div>

        <div className="mt-6 flex gap-3">
          <Link href="/calendar" className="underline">Back to Calendar</Link>

          {canEdit && (
            <Link
              href={`/reading/edit/${id}`}
              className="px-4 py-2 rounded bg-black text-white"
            >
              Edit
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}