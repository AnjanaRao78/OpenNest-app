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
import { ReadingEntry } from "@/types/reading";

export async function saveReadingEntry(entry: ReadingEntry) {
  const docRef = await addDoc(collection(db, "reading"), entry);
  return docRef.id;
}

export async function loadReadingByAuthor(authorUid: string) {
  const q = query(collection(db, "reading"), where("authorUid", "==", authorUid));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  })) as ReadingEntry[];
}

export async function loadReadingByFamily(familyId: string) {
  const q = query(collection(db, "reading"), where("familyId", "==", familyId));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  })) as ReadingEntry[];
}

export async function loadReadingById(id: string) {
  const ref = doc(db, "reading", id);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  return {
    id: snap.id,
    ...snap.data(),
  } as ReadingEntry;
}

export async function updateReadingById(
  id: string,
  updates: Partial<ReadingEntry>
) {
  const ref = doc(db, "reading", id);
  await updateDoc(ref, updates);
}