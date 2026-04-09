import { doc, getDoc } from "firebase/firestore";
import { requireDb } from "@/lib/firestoreClient";

export async function loadEntryById(collectionName: string, id: string) {
  const firestore = requireDb();
  const ref = doc(firestore, collectionName, id);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return null;
  }

  return {
    id: snap.id,
    ...snap.data(),
  };
}