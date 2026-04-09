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
import { requireDb } from "@/lib/firestoreClient";
import { InternshipEntry } from "@/types/internship";

export async function saveInternshipEntry(entry: InternshipEntry) {
  const firestore = requireDb();
  const docRef = await addDoc(collection(firestore, "internship"), entry);
  return docRef.id;
}

export async function loadInternshipsByAuthor(authorUid: string) {
  const firestore = requireDb();
  const q = query(collection(firestore, "internship"), where("authorUid", "==", authorUid));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as InternshipEntry[];
}

export async function loadInternshipById(id: string) {
  const firestore = requireDb();
  const ref = doc(firestore, "internship", id);
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
  const firestore = requireDb();
  const ref = doc(firestore, "internship", id);
  await updateDoc(ref, updates);
}