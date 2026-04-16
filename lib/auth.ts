import {
 GoogleAuthProvider,
 onAuthStateChanged,
 signInWithPopup,
 signOut,
 User,
} from "firebase/auth";
import {
 doc,
 getDoc,
 setDoc,
} from "firebase/firestore";
import { getClientAuth } from "@/lib/firebase";
import { requireDb } from "@/lib/firestoreClient";
export type UserRelationship = "parent" | "sibling" | "child";
export type UserProfile = {
 uid: string;
 displayName: string;
 email: string;
 photoURL?: string;
 familyId: string;
 familyName?: string;
 relationship: UserRelationship;
 createdAt?: number;
};
const provider = new GoogleAuthProvider();
export async function signInWithGoogle() {
 const auth = getClientAuth();
 const result = await signInWithPopup(auth, provider);
 return result.user;
}
export function subscribeToAuth(callback: (user: User | null) => void) {
 if (typeof window === "undefined") {
   callback(null);
   return () => {};
 }
 const auth = getClientAuth();
 return onAuthStateChanged(auth, callback);
}
export async function logOut() {
 const auth = getClientAuth();
 await signOut(auth);
}
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
 const firestore = requireDb();
 const ref = doc(firestore, "users", uid);
 const snap = await getDoc(ref);
 if (!snap.exists()) {
   return null;
 }
 return {
   uid: snap.id,
   ...(snap.data() as Omit<UserProfile, "uid">),
 };
}
export async function saveUserProfile(profile: UserProfile) {
 const firestore = requireDb();
 const ref = doc(firestore, "users", profile.uid);
 const existingSnap = await getDoc(ref);
 const existingData = existingSnap.exists() ? existingSnap.data() : null;
 await setDoc(
   ref,
   {
     ...existingData,
     ...profile,
     createdAt: existingData?.createdAt ?? Date.now(),
   },
   { merge: true }
 );
}