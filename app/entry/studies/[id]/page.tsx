"use client";

import { useEffect, useState } from "react";
import { subscribeToAuth } from "@/lib/auth";
import { loadEntryById } from "@/lib/entryDetail";
import Link from "next/link";
import { useParams } from "next/navigation";
import { User } from "firebase/auth";

export default function StudyDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [entry, setEntry] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToAuth(setUser);

    async function load() {
      const data = await loadEntryById("studies", id);
      setEntry(data);
      setLoading(false);
    }

    load();
    return () => unsub();
  }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!entry) return <div className="p-6">Entry not found.</div>;

  const canEdit = user?.uid === entry.authorUid;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="rounded-2xl border p-6 bg-white shadow">
        <h1 className="text-2xl font-bold mb-4">{entry.courseName}</h1>

        <div className="space-y-2 text-sm">
          <p><strong>Author:</strong> {entry.authorName}</p>
          <p><strong>Term:</strong> {entry.term}</p>
          <p><strong>Workload:</strong> {entry.workload}</p>
          <p><strong>Weekly Focus:</strong> {entry.weeklyFocus}</p>
          <p><strong>Start:</strong> {entry.startDate}</p>
          <p><strong>End:</strong> {entry.endDate}</p>
        </div>

        <div className="mt-6 flex gap-3">
          <Link href="/calendar" className="underline">Back to Calendar</Link>

          {canEdit && (
            <Link
              href={`/studies/edit/${id}`}
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