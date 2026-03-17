import { addDoc, collection } from "firebase/firestore";
import { db } from "./firebase";
import { HobbyEntry } from "@/types/hobbies";

export async function saveHobbyEntry(entry: HobbyEntry) {
  const docRef = await addDoc(collection(db, "hobbies"), entry);
  return docRef.id;
}