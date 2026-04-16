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
import { ReadingEntry } from "@/types/reading";

export async function saveReadingEntry(entry: ReadingEntry) {
  const firestore = requireDb();
  const docRef = await addDoc(collection(firestore, "reading"), entry);
  return docRef.id;
}


export async function loadReadingByAuthor(uid: string, familyId: string) {
  const firestore = requireDb();

  const q = query(
    collection(firestore, "reading"),
    where("authorUid", "==", uid),
    where("familyId", "==", familyId)
  );

  const snap = await getDocs(q);

  return snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export async function loadReadingByFamily(familyId: string) {
  const firestore = requireDb();
  const q = query(collection(firestore, "reading"), where("familyId", "==", familyId));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  })) as ReadingEntry[];
}

export async function loadReadingById(id: string) {
  const firestore = requireDb();
  const ref = doc(firestore, "reading", id);
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
  const firestore = requireDb();
  const ref = doc(firestore, "reading", id);
  await updateDoc(ref, updates);
}