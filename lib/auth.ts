import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db, getClientAuth } from "@/lib/firebase";

export function subscribeToAuth(callback: (user: User | null) => void) {
  if (typeof window === "undefined") {
    callback(null);
    return () => {};
  }

  const auth = getClientAuth();
  return onAuthStateChanged(auth, callback);
}

export async function signInWithGoogle() {
  const auth = getClientAuth();
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function logOut() {
  const auth = getClientAuth();
  await signOut(auth);
}

export async function getUserProfile(uid: string) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  return snap.exists() ? { uid: snap.id, ...snap.data() } : null;
}