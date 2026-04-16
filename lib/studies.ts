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
import { StudiesEntry } from "@/types/studies";

export async function saveStudiesEntry(entry: StudiesEntry) {
  const firestore = requireDb();
  const docRef = await addDoc(collection(firestore, "studies"), entry);
  return docRef.id;
}


export async function loadStudiesByAuthor(uid: string, familyId: string) {
  const firestore = requireDb();

  const q = query(
    collection(firestore, "studies"),
    where("authorUid", "==", uid),
    where("familyId", "==", familyId)
  );

  const snap = await getDocs(q);

  return snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export async function loadStudyById(id: string) {
  const firestore = requireDb();
  const ref = doc(firestore, "studies", id);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  return {
    id: snap.id,
    ...snap.data(),
  } as StudiesEntry;
}

export async function updateStudyById(id: string, updates: Partial<StudiesEntry>) {
  const firestore = requireDb();
  const ref = doc(firestore, "studies", id);
  await updateDoc(ref, updates);
}