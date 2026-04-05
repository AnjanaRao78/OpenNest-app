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
  addDoc,
  collection,
} from "firebase/firestore";
import { db, getClientAuth } from "@/lib/firebase";

const provider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  const auth = getClientAuth();
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function getUserProfile(uid: string) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  return {
    uid: snap.id,
    ...snap.data(),
  };
}

export async function saveUserProfile(profile: {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  familyId: string;
  familyName?: string;
  relationship: "parent" | "sibling" | "child";
}) {
  const ref = doc(db, "users", profile.uid);

  await setDoc(
    ref,
    {
      ...profile,
      createdAt: Date.now(),
    },
    { merge: true }
  );
}

function generateInviteCode(length = 6) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";

  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }

  return result;
}

export async function createFamily(name: string) {
  const inviteCode = generateInviteCode();

  const docRef = await addDoc(collection(db, "families"), {
    name,
    inviteCode,
    createdAt: Date.now(),
  });

  return {
    id: docRef.id,
    inviteCode,
  };
}

export async function logOut() {
  const auth = getClientAuth();
  await signOut(auth);
}

export function subscribeToAuth(callback: (user: User | null) => void) {
  if (typeof window === "undefined") {
    callback(null);
    return () => {};
  }

  const auth = getClientAuth();
  return onAuthStateChanged(auth, callback);
}