"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import PageHeader from "@/components/PageHeader";
import { VisibilityScope } from "@/types/reflection";
export const dynamic = "force-dynamic";
export default function EditReflectionPage() {
 const params = useParams();
 const router = useRouter();
 const id = params?.id as string;
 const [highlight, setHighlight] = useState("");
 const [challenge, setChallenge] = useState("");
 const [mood, setMood] = useState("");
 const [needType, setNeedType] = useState("");
 const [visibility, setVisibility] = useState<VisibilityScope>("everyone");
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
 const snap = await getDoc(doc(db, "reflections", id));
 if (!snap.exists()) {
 setStatus("Reflection entry not found.");
 setLoading(false);
 return;
 }
 const d = snap.data();
 setHighlight(d.highlight || "");
 setChallenge(d.challenge || "");
 setMood(d.mood || "");
 setNeedType(d.needType || "");
 setVisibility((d.visibility as VisibilityScope) || "everyone");
 } catch (error) {
 console.error(error);
 setStatus("Failed to load reflection entry.");
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
 await updateDoc(doc(db, "reflections", id), {
 highlight,
 challenge,
 mood,
 needType,
 visibility,
 });
 router.push(`/entry/reflection/${id}`);
 } catch (error) {
 console.error(error);
 setStatus("Failed to save reflection entry.");
 }
 }
 return (
 <div className="opennest-app-shell">
 <div className="opennest-page">
 <PageHeader title="Edit Reflection" />
 <div className="opennest-card">
 {loading ? (
 <div className="opennest-card-subtitle">Loading...</div>
 ) : (
 <div className="opennest-form">
 <textarea
 value={highlight}
 onChange={(e) => setHighlight(e.target.value)}
 placeholder="Highlight"
 />
 <textarea
 value={challenge}
 onChange={(e) => setChallenge(e.target.value)}
 placeholder="Challenge"
 />
 <input
 value={mood}
 onChange={(e) => setMood(e.target.value)}
 placeholder="Mood"
 />
 <select
 value={needType}
 onChange={(e) => setNeedType(e.target.value)}
 >
 <option value="">Need type</option>
 <option value="listening">Listening</option>
 <option value="advice">Advice</option>
 <option value="space">Space</option>
 <option value="celebrate">Celebrate</option>
 <option value="practical">Practical help</option>
 </select>
 <select
 value={visibility}
 onChange={(e) => setVisibility(e.target.value as VisibilityScope)}
 >
 <option value="everyone">Everyone</option>
 <option value="parentsOnly">Parents only</option>
 <option value="siblingOnly">Sibling only</option>
 <option value="onlyMe">Only me</option>
 </select>
 <button
 type="button"
 onClick={handleSave}
 className="opennest-button opennest-button-primary"
 >
 Save Reflection
 </button>
 {status && <div className="opennest-list-meta">{status}</div>}
 </div>
 )}
 </div>
 </div>
 </div>
 );
}
