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

export async function loadReflectionsForHome(
  familyId: string,
  uid: string,
  relationship: "parent" | "sibling" | "child"
) {
  const firestore = requireDb();

  const visibilityValues =
    relationship === "parent"
      ? ["everyone", "parentsOnly"]
      : relationship === "sibling"
      ? ["everyone", "siblingOnly"]
      : ["everyone"];

  const promises = visibilityValues.map(async (visibility) => {
    const q = query(
      collection(firestore, "reflections"),
      where("familyId", "==", familyId),
      where("visibility", "==", visibility)
    );

    const snap = await getDocs(q);
    return snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  });

  const ownOnlyMeQuery = query(
    collection(firestore, "reflections"),
    where("familyId", "==", familyId),
    where("authorUid", "==", uid),
    where("visibility", "==", "onlyMe")
  );

  const ownOnlyMeSnap = await getDocs(ownOnlyMeQuery);
  const ownOnlyMe = ownOnlyMeSnap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  const grouped = await Promise.all(promises);
  return [...grouped.flat(), ...ownOnlyMe];
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