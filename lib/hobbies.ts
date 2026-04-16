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
import { requireDb } from "@/lib/firestoreClient";
import { HobbyEntry } from "@/types/hobbies";

export async function saveHobbyEntry(entry: HobbyEntry) {
  const firestore = requireDb();
  const docRef = await addDoc(collection(firestore, "hobbies"), entry);
  return docRef.id;
}

export async function loadHobbiesByAuthor(uid: string, familyId: string) {
  const firestore = requireDb();

  const q = query(
    collection(firestore, "hobbies"),
    where("authorUid", "==", uid),
    where("familyId", "==", familyId)
  );

  const snap = await getDocs(q);

  return snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}


export async function loadHobbiesByFamily(familyId: string) {
  const firestore = requireDb();
  const q = query(
    collection(firestore, "hobbies"),
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
  const firestore = requireDb();
  const ref = doc(firestore, "hobbies", id);
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
  const firestore = requireDb();
  const ref = doc(firestore, "hobbies", id);
  await updateDoc(ref, updates);
}