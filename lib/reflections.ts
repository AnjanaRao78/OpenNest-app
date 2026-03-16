import {
  addDoc,
  collection,
  getDocs,
  query,
} from "firebase/firestore";
import { db } from "./firebase";
import { ReflectionPost } from "@/types/reflection";

export async function saveReflection(post: ReflectionPost) {
  const docRef = await addDoc(collection(db, "reflections"), post);
  return docRef.id;
}

export async function loadReflections(familyId: string) {
  const q = query(collection(db, "reflections"));
  const snapshot = await getDocs(q);

  const allPosts = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as ReflectionPost[];

  return allPosts.filter((p) => p.familyId === familyId);
}