// app/internship/edit/[id]/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { subscribeToAuth } from "@/lib/auth";
import EditPageShell from "@/components/EditPageShell";

export default function EditInternshipPage() {
  const { id } = useParams();
  const router = useRouter();

  const [user, setUser] = useState<any>(null);

  const [company, setCompany] = useState("");
  const [status, setStatus] = useState("");
  const [milestone, setMilestone] = useState("");
  const [blocker, setBlocker] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const unsub = subscribeToAuth(setUser);

    async function load() {
      const snap = await getDoc(doc(db, "internship", id as string));
      if (!snap.exists()) return;

      const d = snap.data();
      setCompany(d.company || "");
      setStatus(d.status || "");
      setMilestone(d.milestone || "");
      setBlocker(d.blocker || "");
      setStartDate(d.startDate || "");
      setEndDate(d.endDate || "");
    }

    load();
    return () => unsub();
  }, [id]);

  async function handleSave() {
    const ref = doc(db, "internship", id as string);
    const snap = await getDoc(ref);

    if (!snap.exists()) return;
    if (snap.data().authorUid !== user?.uid) return;

    await updateDoc(ref, {
      company,
      status,
      milestone,
      blocker,
      startDate,
      endDate,
    });

    router.push(`/entry/internship/${id}`);
  }

  return (
    <EditPageShell
      title="Edit Internship"
      onSave={handleSave}
      cancelHref={`/entry/internship/${id}`}
    >
      <input value={company} onChange={(e) => setCompany(e.target.value)} />
      <input value={status} onChange={(e) => setStatus(e.target.value)} />
      <input value={milestone} onChange={(e) => setMilestone(e.target.value)} />
      <input value={blocker} onChange={(e) => setBlocker(e.target.value)} />
      <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
      <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
    </EditPageShell>
  );
}