"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { User } from "firebase/auth";
import { subscribeToAuth } from "@/lib/auth";
import { loadEntryById } from "@/lib/entryDetail";
import DetailPageCard from "@/components/DetailPageCard";

export default function StudyDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [entry, setEntry] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToAuth(setUser);

    async function fetchEntry() {
      const data = await loadEntryById("studies", id);
      setEntry(data);
      setLoading(false);
    }

    fetchEntry();
    return () => unsub();
  }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!entry) return <div className="p-6">Study entry not found.</div>;

  const canEdit = user?.uid === entry.authorUid;

  return (
    <DetailPageCard
      title={entry.courseName || "Study Details"}
      backHref="/studies"
      backLabel="Back to Studies"
      editHref={`/studies/edit/${id}`}
      canEdit={canEdit}
      fields={[
        { label: "Author", value: entry.authorName || "-" },
        { label: "Term", value: entry.term || "-" },
        { label: "Course Code", value: entry.courseCode || "-" },
        {
          label: "Days",
          value: Array.isArray(entry.days) ? entry.days.join(", ") : "-",
        },
        { label: "Classroom", value: entry.classroom || "-" },
        {
          label: "Time",
          value:
            entry.startTime && entry.endTime
              ? `${entry.startTime} - ${entry.endTime}`
              : "-",
        },
        { label: "Start Date", value: entry.startDate || "-" },
        { label: "End Date", value: entry.endDate || "-" },
        {
          label: "Vacation Days",
          value:
            Array.isArray(entry.vacationDays) && entry.vacationDays.length > 0
              ? entry.vacationDays.join(", ")
              : "-",
        },
        { label: "Notes", value: entry.notes || "-" },
      ]}
    />
  );
}