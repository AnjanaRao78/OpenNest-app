"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import { subscribeToAuth, saveUserProfile } from "@/lib/auth";
import {
 createFamilyGroup,
 joinFamilyGroup,
 FamilyRelationship,
} from "@/lib/family";

type AppUser = {
  uid: string;
  displayName?: string | null;
  email?: string | null;
  photoURL?: string | null;
} | null;

export default function FamilyPage() {
 const router = useRouter();
 const [user, setUser] = useState<AppUser>(null);
 const [loading, setLoading] = useState(true);
 const [saving, setSaving] = useState(false);
 const [result, setResult] = useState("");
 const [mode, setMode] = useState<"create" | "join">("create");
 const [familyName, setFamilyName] = useState("");
 const [creatorName, setCreatorName] = useState("");
 const [creatorRelationship, setCreatorRelationship] =
   useState<FamilyRelationship>("parent");
 const [joinCode, setJoinCode] = useState("");
 const [joinName, setJoinName] = useState("");
 const [joinRelationship, setJoinRelationship] =
   useState<FamilyRelationship>("child");
 useEffect(() => {
   const unsub = subscribeToAuth((authUser) => {
     setUser(authUser);
     setLoading(false);
   });
   return () => unsub();
 }, []);
 async function handleCreate() {
   if (!user) {
     setResult("Please sign in first.");
     return;
   }
   if (!familyName.trim()) {
     setResult("Please enter a family name.");
     return;
   }
   if (!creatorName.trim()) {
     setResult("Please enter your name.");
     return;
   }
   try {
     setSaving(true);
     setResult("");
     const created = await createFamilyGroup(
       familyName.trim(),
       user.uid,
       creatorName.trim(),
       creatorRelationship
     );
     await saveUserProfile({
       uid: user.uid,
       displayName: user.displayName || creatorName.trim(),
       email: user.email || "",
       photoURL: user.photoURL || "",
       familyId: created.id,
       familyName: created.name,
       relationship: creatorRelationship,
     });
     router.push("/");
   } catch (error) {
     console.error(error);
     setResult("Failed to create family.");
   } finally {
     setSaving(false);
   }
 }
 async function handleJoin() {
   if (!user) {
     setResult("Please sign in first.");
     return;
   }
   if (!joinCode.trim()) {
     setResult("Please enter an invite code.");
     return;
   }
   if (!joinName.trim()) {
     setResult("Please enter your name.");
     return;
   }
   try {
     setSaving(true);
     setResult("");
     const joined = await joinFamilyGroup(
       joinCode.trim().toUpperCase(),
       user.uid,
       joinName.trim(),
       joinRelationship
     );
     await saveUserProfile({
       uid: user.uid,
       displayName: user.displayName || joinName.trim(),
       email: user.email || "",
       photoURL: user.photoURL || "",
       familyId: joined.id,
       familyName: joined.name,
       relationship: joinRelationship,
     });
     router.push("/");
   } catch (error) {
     console.error(error);
     setResult("Failed to join family.");
   } finally {
     setSaving(false);
   }
 }
 if (loading) {
   return (
<div className="opennest-app-shell">
<div className="opennest-page">
<PageHeader title="Family Setup" />
<div className="opennest-card">
<div className="opennest-card-subtitle">Loading...</div>
</div>
</div>
</div>
   );
 }
 if (!user) {
   return (
<div className="opennest-app-shell">
<div className="opennest-page">
<PageHeader title="Family Setup" />
<div className="opennest-card">
<div className="opennest-card-title">Sign in required</div>
<div className="opennest-card-subtitle">
             Please sign in before setting up your family.
</div>
</div>
</div>
</div>
   );
 }
 return (
<div className="opennest-app-shell">
<div className="opennest-page">
<PageHeader title="Family Setup" />
<div className="opennest-hero-card" style={{ marginBottom: 16 }}>
<div className="opennest-card-title">Set up your family space</div>
<div className="opennest-card-subtitle">
           Create a family or join one with an invite code, then choose your
           relationship before entering Home.
</div>
</div>
<div className="opennest-card" style={{ marginBottom: 16 }}>
<div className="opennest-list-meta" style={{ marginBottom: 8 }}>
           Choose an option
</div>
<div className="opennest-pill-row">
<button
             type="button"
             className={`opennest-pill ${mode === "create" ? "teal" : ""}`}
             onClick={() => {
               setMode("create");
               setResult("");
             }}
>
             Create Family
</button>
<button
             type="button"
             className={`opennest-pill ${mode === "join" ? "teal" : ""}`}
             onClick={() => {
               setMode("join");
               setResult("");
             }}
>
             Join Family
</button>
</div>
</div>
       {mode === "create" ? (
<div className="opennest-card">
<div className="opennest-card-title">Create Family</div>
<div className="opennest-card-subtitle" style={{ marginBottom: 16 }}>
             Start a new family group and share the invite code with others.
</div>
<div className="opennest-form">
<input
               placeholder="Family name"
               value={familyName}
               onChange={(e) => setFamilyName(e.target.value)}
             />
<input
               placeholder="Your name"
               value={creatorName}
               onChange={(e) => setCreatorName(e.target.value)}
             />
<select
               value={creatorRelationship}
               onChange={(e) =>
                 setCreatorRelationship(e.target.value as FamilyRelationship)
               }
>
<option value="parent">Parent</option>
<option value="sibling">Sibling</option>
<option value="child">Child</option>
</select>
<button
               type="button"
               onClick={handleCreate}
               disabled={saving}
               className="opennest-button opennest-button-primary"
>
               {saving ? "Creating..." : "Create Family"}
</button>
</div>
</div>
       ) : (
<div className="opennest-card">
<div className="opennest-card-title">Join Family</div>
<div className="opennest-card-subtitle" style={{ marginBottom: 16 }}>
             Enter the invite code shared by your family and choose your
             relationship.
</div>
<div className="opennest-form">
<input
               placeholder="Invite code"
               value={joinCode}
               onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
             />
<input
               placeholder="Your name"
               value={joinName}
               onChange={(e) => setJoinName(e.target.value)}
             />
<select
               value={joinRelationship}
               onChange={(e) =>
                 setJoinRelationship(e.target.value as FamilyRelationship)
               }
>
<option value="parent">Parent</option>
<option value="sibling">Sibling</option>
<option value="child">Child</option>
</select>
<button
               type="button"
               onClick={handleJoin}
               disabled={saving}
               className="opennest-button opennest-button-primary"
>
               {saving ? "Joining..." : "Join Family"}
</button>
</div>
</div>
       )}
       {result && (
<div className="opennest-card" style={{ marginTop: 16 }}>
<div className="opennest-list-meta">{result}</div>
</div>
       )}
</div>
</div>
 );
}