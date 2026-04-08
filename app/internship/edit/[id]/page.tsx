"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import PageHeader from "@/components/PageHeader";
export const dynamic = "force-dynamic";
export default function EditInternshipPage() {
 const params = useParams();
 const router = useRouter();
 const id = params?.id as string;
 const [company, setCompany] = useState("");
 const [statusValue, setStatusValue] = useState("searching");
 const [milestone, setMilestone] = useState("");
 const [blocker, setBlocker] = useState("");
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
 const snap = await getDoc(doc(db, "internship", id));
 if (!snap.exists()) {
 setStatus("Internship entry not found.");
 setLoading(false);
 return;
 }
 const d = snap.data();
 setCompany(d.company || "");
 setStatusValue(d.status || "searching");
 setMilestone(d.milestone || "");
 setBlocker(d.blocker || "");
 setStartDate(d.startDate || "");
 setEndDate(d.endDate || "");
 } catch (error) {
 console.error(error);
 setStatus("Failed to load internship entry.");
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
 await updateDoc(doc(db, "internship", id), {
 company,
 status: statusValue,
 milestone,
 blocker,
 startDate,
 endDate,
 });
 router.push(`/entry/internship/${id}`);
 } catch (error) {
 console.error(error);
 setStatus("Failed to save internship entry.");
 }
 }
 return (
 <div className="opennest-app-shell">
 <div className="opennest-page">
 <PageHeader title="Edit Internship" />
 <div className="opennest-card">
 {loading ? (
 <div className="opennest-card-subtitle">Loading...</div>
 ) : (
 <div className="opennest-form">
 <input
 value={company}
 onChange={(e) => setCompany(e.target.value)}
 placeholder="Company"
 />
 <select
 value={statusValue}
 onChange={(e) => setStatusValue(e.target.value)}
 >
 <option value="searching">Searching</option>
 <option value="interviewing">Interviewing</option>
 <option value="offered">Offered</option>
 <option value="active">Active</option>
 </select>
 <textarea
 value={milestone}
 onChange={(e) => setMilestone(e.target.value)}
 placeholder="Milestone"
 />
 <textarea
 value={blocker}
 onChange={(e) => setBlocker(e.target.value)}
 placeholder="Blocker"
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
 Save Internship Entry
 </button>
 {status && <div className="opennest-list-meta">{status}</div>}
 </div>
 )}
 </div>
 </div>
 </div>
 );
}