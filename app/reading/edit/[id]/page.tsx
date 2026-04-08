//app/reading/edit/[id]/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import PageHeader from "@/components/PageHeader";
export const dynamic = "force-dynamic";
export default function EditReadingPage() {
 const params = useParams();
 const router = useRouter();
 const id = params?.id as string;
 const [title, setTitle] = useState("");
 const [statusValue, setStatusValue] = useState("to-read");
 const [notes, setNotes] = useState("");
 const [startDate, setStartDate] = useState("");
 const [endDate, setEndDate] = useState("");
 const [loading, setLoading] = useState(true);
 const [status, setStatus] = useState("");
 useEffect(() => {
 async function load() {
 if (!db || !id) {
 setStatus("Firebase is not available.");
 setLoading(false);
 return;
 }
 try {
 const snap = await getDoc(doc(db, "reading", id));
 if (!snap.exists()) {
 setStatus("Reading entry not found.");
 setLoading(false);
 return;
 }
 const d = snap.data();
 setTitle(d.title || "");
 setStatusValue(d.status || "to-read");
 setNotes(d.notes || "");
 setStartDate(d.startDate || "");
 setEndDate(d.endDate || "");
 } catch (error) {
 console.error(error);
 setStatus("Failed to load reading entry.");
 } finally {
 setLoading(false);
 }
 }
 load();
 }, [id]);
 async function handleSave() {
 if (!db || !id) {
 setStatus("Firebase is not available.");
 return;
 }
 try {
 await updateDoc(doc(db, "reading", id), {
 title,
 status: statusValue,
 notes,
 startDate,
 endDate,
 });
 router.push(`/entry/reading/${id}`);
 } catch (error) {
 console.error(error);
 setStatus("Failed to save reading entry.");
 }
 }
 return (
 <div className="opennest-app-shell">
 <div className="opennest-page">
 <PageHeader title="Edit Reading" />
 <div className="opennest-card">
 {loading ? (
 <div className="opennest-card-subtitle">Loading...</div>
 ) : (
 <div className="opennest-form">
 <input
 value={title}
 onChange={(e) => setTitle(e.target.value)}
 placeholder="Title"
 />
 <select
 value={statusValue}
 onChange={(e) => setStatusValue(e.target.value)}
 >
 <option value="to-read">To Read</option>
 <option value="reading">Reading</option>
 <option value="finished">Finished</option>
 </select>
 <textarea
 value={notes}
 onChange={(e) => setNotes(e.target.value)}
 placeholder="Notes"
 />
 <div className="opennest-form-row-2">
 <input
 type="date"
 value={startDate}
 onChange={(e) => setStartDate(e.target.value)}
 />
 <input
 type="date"
 value={endDate}
 onChange={(e) => setEndDate(e.target.value)}
 />
 </div>
 <button
 type="button"
 onClick={handleSave}
 className="opennest-button opennest-button-primary"
 >
 Save Reading Entry
 </button>
 {status && <div className="opennest-list-meta">{status}</div>}
 </div>
 )}
 </div>
 </div>
 </div>
 );
}