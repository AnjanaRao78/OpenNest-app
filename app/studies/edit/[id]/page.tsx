"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import PageHeader from "@/components/PageHeader";
const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const dynamic = "force-dynamic";
export default function EditStudiesPage() {
 const params = useParams();
 const router = useRouter();
 const id = params?.id as string;
 const [term, setTerm] = useState("");
 const [courseName, setCourseName] = useState("");
 const [courseCode, setCourseCode] = useState("");
 const [days, setDays] = useState<string[]>([]);
 const [classroom, setClassroom] = useState("");
 const [startTime, setStartTime] = useState("");
 const [endTime, setEndTime] = useState("");
 const [startDate, setStartDate] = useState("");
 const [endDate, setEndDate] = useState("");
 const [notes, setNotes] = useState("");
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
 const snap = await getDoc(doc(db, "studies", id));
 if (!snap.exists()) {
 setStatus("Studies entry not found.");
 setLoading(false);
 return;
 }
 const d = snap.data();
 setTerm(d.term || "");
 setCourseName(d.courseName || "");
 setCourseCode(d.courseCode || "");
 setDays(Array.isArray(d.days) ? d.days : []);
 setClassroom(d.classroom || "");
 setStartTime(d.startTime || "");
 setEndTime(d.endTime || "");
 setStartDate(d.startDate || "");
 setEndDate(d.endDate || "");
 setNotes(d.notes || "");
 } catch (error) {
 console.error(error);
 setStatus("Failed to load studies entry.");
 } finally {
 setLoading(false);
 }
 }
 load();
 }, [id]);
 function toggleDay(day: string) {
 setDays((prev) =>
 prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
 );
 }
 async function handleSave() {
 if (!db || !id) {
 setStatus("Firebase is not available.");
 return;
 }
 try {
 await updateDoc(doc(db, "studies", id), {
 term,
 courseName,
 courseCode,
 days,
 classroom,
 startTime,
 endTime,
 startDate,
 endDate,
 notes,
 });
 router.push(`/entry/studies/${id}`);
 } catch (error) {
 console.error(error);
 setStatus("Failed to save studies entry.");
 }
 }
 return (
 <div className="opennest-app-shell">
 <div className="opennest-page">
 <PageHeader title="Edit Studies" />
 <div className="opennest-card">
 {loading ? (
 <div className="opennest-card-subtitle">Loading...</div>
 ) : (
 <div className="opennest-form">
 <input
 value={term}
 onChange={(e) => setTerm(e.target.value)}
 placeholder="Term"
 />
 <input
 value={courseName}
 onChange={(e) => setCourseName(e.target.value)}
 placeholder="Course name"
 />
 <input
 value={courseCode}
 onChange={(e) => setCourseCode(e.target.value)}
 placeholder="Course code"
 />
 <div>
 <div className="opennest-list-meta" style={{ marginBottom: 8 }}>
 Class Days
 </div>
 <div className="opennest-pill-row">
 {weekDays.map((day) => (
 <button
 key={day}
 type="button"
 onClick={() => toggleDay(day)}
 className={`opennest-pill ${days.includes(day) ? "teal" : ""}`}
 >
 {day}
 </button>
 ))}
 </div>
 </div>
 <input
 value={classroom}
 onChange={(e) => setClassroom(e.target.value)}
 placeholder="Classroom"
 />
 <div className="opennest-form-row-2">
 <input
 type="time"
 value={startTime}
 onChange={(e) => setStartTime(e.target.value)}
 />
 <input
 type="time"
 value={endTime}
 onChange={(e) => setEndTime(e.target.value)}
 />
 </div>
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
 <textarea
 value={notes}
 onChange={(e) => setNotes(e.target.value)}
 placeholder="Notes"
 />
 <button
 type="button"
 onClick={handleSave}
 className="opennest-button opennest-button-primary"
 >
 Save Studies Entry
 </button>
 {status && <div className="opennest-list-meta">{status}</div>}
 </div>
 )}
 </div>
 </div>
 </div>
 );
}