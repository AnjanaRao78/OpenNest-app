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
import { ReflectionPost } from "@/types/reflection";

export async function saveReflection(post: ReflectionPost) {
  const firestore = requireDb();
  const docRef = await addDoc(collection(firestore, "reflections"), post);
  return docRef.id;
}

export async function loadReflections(familyId: string) {
   const firestore = requireDb();
  const q = query(collection(firestore, "reflections"), where("familyId", "==", familyId));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as ReflectionPost[];
}

export async function loadReflectionById(id: string) {
  const firestore = requireDb();
  const ref = doc(firestore, "reflections", id);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  return {
    id: snap.id,
    ...snap.data(),
  } as ReflectionPost;
}

export async function updateReflectionById(
  id: string,
  updates: Partial<ReflectionPost>
) {
  const firestore = requireDb();
  const ref = doc(firestore, "reflections", id);
  await updateDoc(ref, updates);
}