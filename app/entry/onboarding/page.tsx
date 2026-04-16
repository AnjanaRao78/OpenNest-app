"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import {
 subscribeToAuth,
 getUserProfile,
 saveUserProfile,
} from "@/lib/auth";
import {
 createFamilyGroup,
 joinFamilyGroup,
 FamilyRelationship,
} from "@/lib/family";

type AuthUser = {
  uid: string;
  displayName?: string | null;
  email?: string | null;
  photoURL?: string | null;
};

export default function OnboardingPage() {
 const router = useRouter();
 const [user, setUser] = useState<AuthUser | null>(null);
 const [loading, setLoading] = useState(true);
 const [saving, setSaving] = useState(false);
 const [status, setStatus] = useState("");
 const [mode, setMode] = useState<"create" | "join">("create");
 // Create
 const [familyName, setFamilyName] = useState("");
 const [creatorName, setCreatorName] = useState("");
 const [creatorRelationship, setCreatorRelationship] =
   useState<FamilyRelationship>("parent");
 // Join
 const [joinCode, setJoinCode] = useState("");
 const [joinName, setJoinName] = useState("");
 const [joinRelationship, setJoinRelationship] =
   useState<FamilyRelationship>("child");
 useEffect(() => {
   const unsub = subscribeToAuth(async (authUser) => {
     setUser(authUser);
     if (!authUser) {
       setLoading(false);
       return;
     }
     try {
       const profile = await getUserProfile(authUser.uid);
       // If already onboarded → go Home
       if (profile?.familyId && profile?.relationship) {
         router.push("/");
         return;
       }
     } catch (err) {
       console.error("Profile check failed:", err);
     } finally {
       setLoading(false);
     }
   });
   return () => unsub();
 }, [router]);
 async function handleCreate() {
   if (!user) return setStatus("Sign in required.");
   if (!familyName.trim()) return setStatus("Enter family name.");
   if (!creatorName.trim()) return setStatus("Enter your name.");
   try {
     setSaving(true);
     setStatus("");
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
   } catch (err) {
     console.error(err);
     setStatus("Failed to create family.");
   } finally {
     setSaving(false);
   }
 }
 async function handleJoin() {
   if (!user) return setStatus("Sign in required.");
   if (!joinCode.trim()) return setStatus("Enter invite code.");
   if (!joinName.trim()) return setStatus("Enter your name.");
   try {
     setSaving(true);
     setStatus("");
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
   } catch (err) {
     console.error(err);
     setStatus("Failed to join family.");
   } finally {
     setSaving(false);
   }
 }
 if (loading) {
   return (
<div className="opennest-page">
<PageHeader title="Onboarding" />
<div className="opennest-card">Loading...</div>
</div>
   );
 }
 if (!user) {
   return (
<div className="opennest-page">
<PageHeader title="Onboarding" />
<div className="opennest-card">
<p>Please sign in first.</p>
<button
           className="opennest-button"
           onClick={() => router.push("/login")}
>
           Go to Login
</button>
</div>
</div>
   );
 }
 return (
<div className="opennest-app-shell">
<div className="opennest-page">
<PageHeader title="Set up your family" />
       {/* Mode toggle */}
<div className="opennest-card" style={{ marginBottom: 16 }}>
<div className="opennest-pill-row">
<button
             className={`opennest-pill ${mode === "create" ? "teal" : ""}`}
             onClick={() => setMode("create")}
>
             Create
</button>
<button
             className={`opennest-pill ${mode === "join" ? "teal" : ""}`}
             onClick={() => setMode("join")}
>
             Join
</button>
</div>
</div>
       {mode === "create" ? (
<div className="opennest-card">
<h3>Create Family</h3>
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
             onClick={handleCreate}
             disabled={saving}
             className="opennest-button"
>
             {saving ? "Creating..." : "Create Family"}
</button>
</div>
       ) : (
<div className="opennest-card">
<h3>Join Family</h3>
<input
             placeholder="Invite code"
             value={joinCode}
             onChange={(e) => setJoinCode(e.target.value)}
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
             onClick={handleJoin}
             disabled={saving}
             className="opennest-button"
>
             {saving ? "Joining..." : "Join Family"}
</button>
</div>
       )}
       {status && <div className="opennest-card">{status}</div>}
</div>
</div>
 );
}