import { addDoc, collection } from "firebase/firestore";
import { db } from "../types/firebase1";
import { HobbyEntry } from "@/types/hobbies";

export async function saveHobbyEntry(entry: HobbyEntry) {
  const docRef = await addDoc(collection(db, "hobbies"), entry);
  return docRef.id;
}