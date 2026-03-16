import { addDoc, collection } from "firebase/firestore"
import { db } from "./firebase"
import { StudiesEntry } from "@/types/studies"

export async function saveStudiesEntry(entry: StudiesEntry) {
  const docRef = await addDoc(collection(db, "studies"), entry)
  return docRef.id
}