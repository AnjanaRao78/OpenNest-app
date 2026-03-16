import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebase";
import { InternshipEntry } from "@/types/internship";

export async function saveInternshipEntry(entry: InternshipEntry) {
  const docRef = await addDoc(collection(db, "internship"), entry);
  return docRef.id;
}