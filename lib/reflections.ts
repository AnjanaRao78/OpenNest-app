import {
 addDoc,
 collection,
 doc,
 getDoc,
 getDocs,
 orderBy,
 query,
 where,
} from "firebase/firestore";
import { requireDb } from "@/lib/firestoreClient";
import { VisibilityScope } from "@/types/reflection";
export type ReflectionEntry = {
 id?: string;
 familyId: string;
 authorUid: string;
 authorName: string;
 authorRelationship?: "parent" | "sibling" | "child";
 highlight: string;
 challenge?: string;
 mood?: string;
 needType?: string;
 visibility: VisibilityScope;
 createdAt: number;
};
function normalizeReflection(
 id: string,
 data: Record<string, unknown>
): ReflectionEntry {
 return {
   id,
   familyId: typeof data.familyId === "string" ? data.familyId : "",
   authorUid: typeof data.authorUid === "string" ? data.authorUid : "",
   authorName: typeof data.authorName === "string" ? data.authorName : "Unknown",
   authorRelationship:
     data.authorRelationship === "parent" ||
     data.authorRelationship === "sibling" ||
     data.authorRelationship === "child"
       ? data.authorRelationship
       : undefined,
   highlight: typeof data.highlight === "string" ? data.highlight : "",
   challenge: typeof data.challenge === "string" ? data.challenge : "",
   mood: typeof data.mood === "string" ? data.mood : "",
   needType: typeof data.needType === "string" ? data.needType : "",
   visibility:
     data.visibility === "everyone" ||
     data.visibility === "parentsOnly" ||
     data.visibility === "siblingOnly" ||
     data.visibility === "onlyMe"
       ? data.visibility
       : "everyone",
   createdAt: typeof data.createdAt === "number" ? data.createdAt : 0,
 };
}
function sortNewestFirst(entries: ReflectionEntry[]) {
 return [...entries].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}
function dedupeById(entries: ReflectionEntry[]) {
 const map = new Map<string, ReflectionEntry>();
 for (const entry of entries) {
   if (entry.id) {
     map.set(entry.id, entry);
   }
 }
 return Array.from(map.values());
}
async function runReflectionQuery(
 familyId: string,
 visibility: VisibilityScope,
 extra?: { field: "authorUid"; value: string }
): Promise<ReflectionEntry[]> {
 const firestore = requireDb();
 const constraints = [
   where("familyId", "==", familyId),
   where("visibility", "==", visibility),
   orderBy("createdAt", "desc"),
 ] as const;
 const q = extra
   ? query(
       collection(firestore, "reflections"),
       where("familyId", "==", familyId),
       where("visibility", "==", visibility),
       where(extra.field, "==", extra.value),
       orderBy("createdAt", "desc")
     )
   : query(collection(firestore, "reflections"), ...constraints);
 const snap = await getDocs(q);
 return snap.docs.map((docSnap) =>
   normalizeReflection(docSnap.id, docSnap.data() as Record<string, unknown>)
 );
}
export async function saveReflection(entry: ReflectionEntry) {
 const firestore = requireDb();
 await addDoc(collection(firestore, "reflections"), {
   familyId: entry.familyId,
   authorUid: entry.authorUid,
   authorName: entry.authorName,
   authorRelationship: entry.authorRelationship || "",
   highlight: entry.highlight,
   challenge: entry.challenge || "",
   mood: entry.mood || "",
   needType: entry.needType || "",
   visibility: entry.visibility,
   createdAt: entry.createdAt ?? Date.now(),
 });
}
export async function loadReflectionsForHome(
 familyId: string,
 viewerUid: string,
 viewerRelationship?: string
): Promise<ReflectionEntry[]> {
 const queries: Promise<ReflectionEntry[]>[] = [
   runReflectionQuery(familyId, "everyone"),
   runReflectionQuery(familyId, "onlyMe", {
     field: "authorUid",
     value: viewerUid,
   }),
 ];
 if (viewerRelationship === "parent") {
   queries.push(runReflectionQuery(familyId, "parentsOnly"));
 }
 if (viewerRelationship === "sibling") {
   queries.push(runReflectionQuery(familyId, "siblingOnly"));
 }
 const results = await Promise.all(queries);
 return sortNewestFirst(dedupeById(results.flat()));
}
export async function loadReflectionAuthorsForFamily(
 familyId: string,
 viewerUid: string,
 viewerRelationship?: string
): Promise<string[]> {
 const visible = await loadReflectionsForHome(
   familyId,
   viewerUid,
   viewerRelationship
 );
 return Array.from(
   new Set(visible.map((entry) => entry.authorName).filter(Boolean))
 ).sort((a, b) => a.localeCompare(b));
}
export async function loadReflectionById(
 id: string
): Promise<ReflectionEntry | null> {
 const firestore = requireDb();
 const snap = await getDoc(doc(firestore, "reflections", id));
 if (!snap.exists()) return null;
 return normalizeReflection(
   snap.id,
   snap.data() as Record<string, unknown>
 );
}