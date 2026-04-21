"use client";
export const dynamic = "force-dynamic";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { User } from "firebase/auth";
import { subscribeToAuth, getUserProfile } from "@/lib/auth";
import { loadHobbiesByAuthor } from "@/lib/hobbies";
import PageHeader from "@/components/PageHeader";
import SummaryCard from "@/components/SummaryCard";
import DashboardCard from "@/components/DashboardCard";
import BottomNav from "@/components/BottomNav";
type HobbyEntry = {
 id: string;
 title?: string;
 hobbyName?: string;
 category?: string;
 skillLevel?: string;
 frequency?: string;
 notes?: string;
 createdAt?: number;
 authorUid?: string;
 authorName?: string;
 familyId?: string;
};
export default function HobbiesPage() {
 const [user, setUser] = useState<User | null>(null);
 const [profile, setProfile] = useState<any>(null);
 const [entries, setEntries] = useState<HobbyEntry[]>([]);
 const [loading, setLoading] = useState(true);
 const [message, setMessage] = useState("");
 useEffect(() => {
   const unsub = subscribeToAuth(async (authUser) => {
     setUser(authUser);
     if (!authUser) {
       setProfile(null);
       setEntries([]);
       setLoading(false);
       return;
     }
     try {
       const userProfile = await getUserProfile(authUser.uid);
       setProfile(userProfile);
       if (!userProfile?.familyId) {
         setEntries([]);
         setMessage("Complete family setup to view hobbies.");
         setLoading(false);
         return;
       }
       const hobbyData = await loadHobbiesByAuthor(
         authUser.uid,
         userProfile.familyId
       );
       setEntries(Array.isArray(hobbyData) ? hobbyData : []);
       setMessage("");
     } catch (error) {
       console.error("Failed to load hobbies:", error);
       setEntries([]);
       setMessage("Failed to load hobbies.");
     } finally {
       setLoading(false);
     }
   });
   return () => unsub();
 }, []);
 const sortedEntries = useMemo(() => {
   return [...entries].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
 }, [entries]);
 const categoryCount = useMemo(() => {
   return new Set(
     entries.map((entry) => entry.category).filter(Boolean)
   ).size;
 }, [entries]);
 const activeFrequencyCount = useMemo(() => {
   return entries.filter((entry) => !!entry.frequency).length;
 }, [entries]);
 function formatDate(value?: number) {
   if (!value) return "-";
   return new Date(value).toLocaleDateString();
 }
 if (loading) {
   return (
<div className="opennest-app-shell">
<div className="opennest-page">
<PageHeader title="Hobbies" />
<div className="opennest-card">
<div className="opennest-card-subtitle">Loading hobbies...</div>
</div>
</div>
</div>
   );
 }
 if (!user) {
   return (
<div className="opennest-app-shell">
<div className="opennest-page">
<PageHeader title="Hobbies" />
<div className="opennest-hero-card" style={{ marginBottom: 18 }}>
<div className="opennest-card-title">Your hobby space</div>
<div className="opennest-card-subtitle">
             Track interests, routines, and creative energy in one place.
</div>
</div>
<div className="opennest-card">
<div className="opennest-form">
<Link href="/login" className="opennest-button opennest-button-primary">
               Go to Login
</Link>
</div>
</div>
</div>
</div>
   );
 }
 if (!profile?.familyId) {
   return (
<div className="opennest-app-shell">
<div className="opennest-page">
<PageHeader title="Hobbies" />
<div className="opennest-hero-card" style={{ marginBottom: 18 }}>
<div className="opennest-card-title">Finish setup first</div>
<div className="opennest-card-subtitle">
             Your hobbies will appear once your family setup is complete.
</div>
</div>
<div className="opennest-card">
<div className="opennest-form">
<Link href="/family" className="opennest-button opennest-button-primary">
               Go to Family Setup
</Link>
             {message && <div className="opennest-list-meta">{message}</div>}
</div>
</div>
</div>
</div>
   );
 }
 return (
<div className="opennest-app-shell">
<div className="opennest-page">
<PageHeader title="Hobbies" />
<div className="opennest-hero-card" style={{ marginBottom: 18 }}>
<div className="opennest-card-title">Make room for what brings life</div>
<div className="opennest-card-subtitle">
           Keep track of the things you practice, enjoy, and return to when the day needs color.
</div>
</div>
<div className="opennest-summary-grid">
<SummaryCard label="Total Hobbies" value={entries.length} />
<SummaryCard label="Categories" value={categoryCount} />
<SummaryCard label="With Frequency" value={activeFrequencyCount} />
<SummaryCard
           label="Latest Added"
           value={sortedEntries.length > 0 ? 1 : 0}
         />
</div>
<div className="opennest-module-grid">
<div className="opennest-section">
<DashboardCard
             title="Recent Hobbies"
             accentClass="opennest-module-accent-hobbies"
>
<div className="opennest-list">
               {sortedEntries.length === 0 && (
<div className="opennest-empty-state">
                   No hobbies added yet.
</div>
               )}
               {sortedEntries.map((entry) => (
<div key={entry.id} className="opennest-list-card teal">
<div className="flex justify-between gap-3">
<div>
<div className="opennest-list-title">
                         {entry.title || entry.hobbyName || "Untitled Hobby"}
</div>
<div className="opennest-list-meta">
                         {entry.category || "General"} · {formatDate(entry.createdAt)}
</div>
</div>
<Link
                       href={`/entry/hobbies/${entry.id}`}
                       className="underline text-sm"
>
                       Open
</Link>
</div>
<div className="opennest-meta-grid">
<div>
<strong>Skill Level:</strong> {entry.skillLevel || "-"}
</div>
<div>
<strong>Frequency:</strong> {entry.frequency || "-"}
</div>
<div>
<strong>Notes:</strong> {entry.notes || "-"}
</div>
</div>
</div>
               ))}
</div>
</DashboardCard>
</div>
<div className="opennest-section">
<DashboardCard
             title="Actions"
             accentClass="opennest-module-accent-hobbies"
>
<div className="opennest-list">
<div className="opennest-list-card gold">
<div className="opennest-list-title">Add a hobby</div>
<div className="opennest-list-meta">
                   Capture a new interest, routine, or creative pursuit.
</div>
<div style={{ marginTop: 12 }}>
<Link href="/hobbies/new" className="underline text-sm">
                     Create Hobby
</Link>
</div>
</div>
<div className="opennest-list-card">
<div className="opennest-list-title">Open calendar</div>
<div className="opennest-list-meta">
                   See hobbies alongside the rest of family life.
</div>
<div style={{ marginTop: 12 }}>
<Link href="/calendar" className="underline text-sm">
                     Open Calendar
</Link>
</div>
</div>
</div>
             {message && (
<div style={{ marginTop: 12 }} className="opennest-list-meta">
                 {message}
</div>
             )}
</DashboardCard>
</div>
</div>
</div>
<BottomNav />
</div>
 );
}