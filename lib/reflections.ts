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
import { ReflectionPost } from "@/types/reflection";

export async function saveReflection(post: ReflectionPost) {
  const docRef = await addDoc(collection(db, "reflections"), post);
  return docRef.id;
}

export async function loadReflections(familyId: string) {
  const q = query(collection(db, "reflections"), where("familyId", "==", familyId));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as ReflectionPost[];
}

export async function loadReflectionById(id: string) {
  const ref = doc(db, "reflections", id);
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
  const ref = doc(db, "reflections", id);
  await updateDoc(ref, updates);
}