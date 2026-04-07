import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { InternshipEntry } from "@/types/internship";

export async function saveInternshipEntry(entry: InternshipEntry) {
  const docRef = await addDoc(collection(db, "internship"), entry);
  return docRef.id;
}

export async function loadInternshipsByAuthor(authorUid: string) {
  const q = query(collection(db, "internship"), where("authorUid", "==", authorUid));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as InternshipEntry[];
}

export async function loadInternshipById(id: string) {
  const ref = doc(db, "internship", id);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  return {
    id: snap.id,
    ...snap.data(),
  } as InternshipEntry;
}

export async function updateInternshipById(
  id: string,
  updates: Partial<InternshipEntry>
) {
  const ref = doc(db, "internship", id);
  await updateDoc(ref, updates);
}