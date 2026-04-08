"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import PageHeader from "@/components/PageHeader";
export const dynamic = "force-dynamic";
export default function EditHobbyPage() {
const params = useParams();
const router = useRouter();
const id = params?.id as string;
const [hobbyName, setHobbyName] = useState("");
const [frequencyGoal, setFrequencyGoal] = useState("weekly");
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
const snap = await getDoc(doc(db, "hobbies", id));
if (!snap.exists()) {
setStatus("Hobby entry not found.");
setLoading(false);
return;
}
const d = snap.data();
setHobbyName(d.hobbyName || "");
setFrequencyGoal(d.frequencyGoal || "weekly");
setNotes(d.notes || "");
setStartDate(d.startDate || "");
setEndDate(d.endDate || "");
} catch (error) {
console.error(error);
setStatus("Failed to load hobby entry.");
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
await updateDoc(doc(db, "hobbies", id), {
hobbyName,
frequencyGoal,
notes,
startDate,
endDate,
});
router.push(`/entry/hobbies/${id}`);
} catch (error) {
console.error(error);
setStatus("Failed to save hobby entry.");
}
}
return (
<div className="opennest-app-shell">
<div className="opennest-page">
<PageHeader title="Edit Hobby" />
<div className="opennest-card">
{loading ? (
<div className="opennest-card-subtitle">Loading...</div>
) : (
<div className="opennest-form">
<input
value={hobbyName}
onChange={(e) => setHobbyName(e.target.value)}
placeholder="Hobby name"
/>
<select
value={frequencyGoal}
onChange={(e) => setFrequencyGoal(e.target.value)}
>
<option value="daily">Daily</option>
<option value="weekly">Weekly</option>
<option value="monthly">Monthly</option>
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
Save Hobby
</button>
{status && <div className="opennest-list-meta">{status}</div>}
</div>
)}
</div>
</div>
</div>
);
}