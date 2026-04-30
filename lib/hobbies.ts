import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { requireDb } from "@/lib/firestoreClient";

export type HobbyEntry = {
  id?: string;
  familyId: string;
  authorUid: string;
  authorName: string;
  title: string;
  hobbyName?: string;
  category?: string;
  skillLevel?: string;
  frequency?: string;
  notes?: string;
  status?: "planned" | "started" | "in-progress" | "completed";
  startDate?: string;
  targetEndDate?: string;
  completedDate?: string;
  progress?: number;
  createdAt: number;
};

export async function loadHobbiesByAuthor(uid: string, familyId: string) {
  const firestore = requireDb();

  const q = query(
    collection(firestore, "hobbies"),
    where("authorUid", "==", uid),
    where("familyId", "==", familyId)
  );

  const snap = await getDocs(q);

  return snap.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  })) as HobbyEntry[];
}

export async function loadHobbiesByFamily(familyId: string) {
  const firestore = requireDb();

  const q = query(
    collection(firestore, "hobbies"),
    where("familyId", "==", familyId)
  );

  const snap = await getDocs(q);

  return snap.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  })) as HobbyEntry[];
}

export async function saveHobbyEntry(entry: HobbyEntry) {
  const firestore = requireDb();
  await addDoc(collection(firestore, "hobbies"), entry);
}

export async function updateHobbyEntry(
  hobbyId: string,
  updates: Partial<HobbyEntry>
) {
  const firestore = requireDb();
  await updateDoc(doc(firestore, "hobbies", hobbyId), updates);
}