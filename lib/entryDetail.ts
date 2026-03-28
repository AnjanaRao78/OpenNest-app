import { doc, getDoc } from "firebase/firestore";
import { db } from "@/types/firebase1";

export async function loadEntryById(collectionName: string, id: string) {
  const ref = doc(db, collectionName, id);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return null;
  }

  return {
    id: snap.id,
    ...snap.data(),
  };
}