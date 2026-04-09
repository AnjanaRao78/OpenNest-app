import { db } from "@/lib/firebase";
import type { Firestore } from "firebase/firestore";
export function requireDb(): Firestore {
if (!db) {
    throw new Error("Firestore is not available.");
}
    return db;
}