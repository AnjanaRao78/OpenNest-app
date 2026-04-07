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
import { StudiesEntry } from "@/types/studies";

export async function saveStudiesEntry(entry: StudiesEntry) {
  const docRef = await addDoc(collection(db, "studies"), entry);
  return docRef.id;
}

export async function loadStudiesByAuthor(authorUid: string) {
  const q = query(collection(db, "studies"), where("authorUid", "==", authorUid));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as StudiesEntry[];
}

export async function loadStudyById(id: string) {
  const ref = doc(db, "studies", id);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  return {
    id: snap.id,
    ...snap.data(),
  } as StudiesEntry;
}

export async function updateStudyById(id: string, updates: Partial<StudiesEntry>) {
  const ref = doc(db, "studies", id);
  await updateDoc(ref, updates);
}