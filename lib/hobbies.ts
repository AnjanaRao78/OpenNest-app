import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  updateDoc,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { HobbyEntry } from "@/types/hobbies";

export async function saveHobbyEntry(entry: HobbyEntry) {
  const docRef = await addDoc(collection(db, "hobbies"), entry);
  return docRef.id;
}

export async function loadHobbiesByAuthor(
  authorUid: string,
  familyId: string
) {
  const q = query(
    collection(db, "hobbies"),
    where("authorUid", "==", authorUid),
    where("familyId", "==", familyId),
    orderBy("startDate", "desc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  })) as unknown as HobbyEntry[];
}

export async function loadHobbiesByFamily(familyId: string) {
  const q = query(
    collection(db, "hobbies"),
    where("familyId", "==", familyId),
    orderBy("startDate", "desc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  })) as unknown as HobbyEntry[];
}

export async function loadHobbyById(id: string) {
  const ref = doc(db, "hobbies", id);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  return {
    id: snap.id,
    ...snap.data(),
  } as unknown as HobbyEntry;
}

export async function updateHobbyById(
  id: string,
  updates: Partial<HobbyEntry>
) {
  const ref = doc(db, "hobbies", id);
  await updateDoc(ref, updates);
}