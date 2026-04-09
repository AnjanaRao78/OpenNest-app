import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
} from "firebase/firestore";
import { requireDb } from "@/lib/firestoreClient";

function generateInviteCode(length = 6) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export async function createFamilyGroup(name: string, creatorName: string) {
  const inviteCode = generateInviteCode();

  const firestore = requireDb();
  const docRef = await addDoc(collection(firestore, "families"), {
    name,
    inviteCode,
    members: [creatorName],
    createdAt: Date.now(),
  });

  return { id: docRef.id, inviteCode };
}

export async function joinFamilyGroup(inviteCode: string, memberName: string) {
  const firestore = requireDb();
  const q = query(
    collection(firestore, "families"),
    where("inviteCode", "==", inviteCode)
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    throw new Error("Family group not found");
  }

  const familyDoc = snapshot.docs[0];
  const data = familyDoc.data();
  const currentMembers = Array.isArray(data.members) ? data.members : [];

  if (!currentMembers.includes(memberName)) {
    await updateDoc(doc(firestore, "families", familyDoc.id), {
      members: [...currentMembers, memberName],
    });
  }

  return { id: familyDoc.id, ...familyDoc.data() };
}