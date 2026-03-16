import { addDoc, collection } from "firebase/firestore";
import { db } from "./firebase";
import { ReadingEntry } from "@/types/reading";

export async function saveReadingEntry(entry: ReadingEntry) {
  const docRef = await addDoc(collection(db, "reading"), entry);
  return docRef.id;
}