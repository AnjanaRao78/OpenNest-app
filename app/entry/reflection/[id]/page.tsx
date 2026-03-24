"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { User } from "firebase/auth";
import { subscribeToAuth } from "@/lib/auth";
import { loadEntryById } from "@/lib/entryDetail";

export default function ReflectionDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [entry, setEntry] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToAuth(setUser);

    async function fetchEntry() {
      const data = await loadEntryById("reflections", id);
      setEntry(data);
      setLoading(false);
    }

    fetchEntry();

    return () => unsub();
  }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!entry) return <div className="p-6">Reflection not found.</div>;

  const canEdit = user?.uid === entry.authorUid;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="rounded-2xl border bg-white shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Reflection</h1>

        <div className="space-y-2 text-sm">
          <p><strong>Author:</strong> {entry.authorName}</p>
          <p><strong>Mood:</strong> {entry.mood}</p>
          <p><strong>Highlight:</strong> {entry.highlight}</p>
          <p><strong>Challenge:</strong> {entry.challenge}</p>
          <p><strong>Need Type:</strong> {entry.needType}</p>
        </div>

        <div className="mt-6 flex gap-3">
          <Link href="/calendar" className="underline">Back to Calendar</Link>

          {canEdit && (
            <Link
              href={`/reflection/edit/${id}`}
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