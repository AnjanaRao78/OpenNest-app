import {
  addDoc,
  collection,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
  doc,
} from "firebase/firestore";
import { requireDb } from "@/lib/firestoreClient";

export type FamilyRelationship = "parent" | "sibling" | "child";

export type FamilyMember = {
  uid?: string;
  name: string;
  relationship: FamilyRelationship;
};

export type FamilyGroup = {
  id: string;
  name: string;
  inviteCode: string;
  members: FamilyMember[];
  createdAt?: number;
};

function generateInviteCode(length = 6) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";

  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }

  return result;
}

function normalizeRelationship(value: unknown): FamilyRelationship {
  if (value === "parent" || value === "sibling" || value === "child") {
    return value;
  }
  return "child";
}

function sanitizeMember(member: FamilyMember) {
  return {
    ...(member.uid ? { uid: member.uid } : {}),
    name: member.name,
    relationship: member.relationship,
  };
}

function normalizeMembers(rawMembers: unknown): FamilyMember[] {
  if (!Array.isArray(rawMembers)) return [];

  return rawMembers
    .map((member) => {
      if (typeof member === "string") {
        return {
          name: member,
          relationship: "child" as FamilyRelationship,
        };
      }

      if (
        member &&
        typeof member === "object" &&
        "name" in member &&
        typeof (member as { name?: unknown }).name === "string"
      ) {
            const uidValue =
            typeof (member as { uid?: unknown }).uid === "string"
            ? (member as { uid: string }).uid
            : undefined;

          return {
            ...(uidValue ? { uid: uidValue } : {}),
            name: (member as { name: string }).name,
            relationship: normalizeRelationship(
              (member as { relationship?: unknown }).relationship
            ),
          };
      }
      return null;
    })
    .filter((member): member is FamilyMember => member !== null);
}

function normalizeFamilyDoc(
  id: string,
  data: Record<string, unknown>
): FamilyGroup {
  return {
    id,
    name: typeof data.name === "string" ? data.name : "",
    inviteCode: typeof data.inviteCode === "string" ? data.inviteCode : "",
    members: normalizeMembers(data.members),
    createdAt: typeof data.createdAt === "number" ? data.createdAt : undefined,
  };
}

export async function createFamilyGroup(
  familyName: string,
  creatorUid: string,
  creatorName: string,
  relationship: FamilyRelationship
): Promise<{ id: string; name: string; inviteCode: string }> {
  const firestore = requireDb();
  const inviteCode = generateInviteCode();

  const docRef = await addDoc(collection(firestore, "families"), {
    name: familyName,
    inviteCode,
    members: [
      sanitizeMember({
        uid: creatorUid,
        name: creatorName,
        relationship,
      }),
    ],
    createdAt: Date.now(),
  });

  return {
    id: docRef.id,
    name: familyName,
    inviteCode,
  };
}

export async function joinFamilyGroup(
  inviteCode: string,
  memberUid: string,
  memberName: string,
  relationship: FamilyRelationship
): Promise<{ id: string; name: string; inviteCode: string }> {
  const firestore = requireDb();

  const q = query(
    collection(firestore, "families"),
    where("inviteCode", "==", inviteCode)
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    throw new Error("Family group not found.");
  }

  const familyDoc = snapshot.docs[0];
  const family = normalizeFamilyDoc(
    familyDoc.id,
    familyDoc.data() as Record<string, unknown>
  );

  const existingIndex = family.members.findIndex(
    (member) =>
      member.uid === memberUid ||
      member.name.trim().toLowerCase() === memberName.trim().toLowerCase()
  );

  const nextMembers = [...family.members];

  const updatedMember: FamilyMember = {
    uid: memberUid,
    name: memberName,
    relationship,
  };

  if (existingIndex >= 0) {
    nextMembers[existingIndex] = updatedMember;
  } else {
    nextMembers.push(updatedMember);
  }

  await updateDoc(doc(firestore, "families", family.id), {
    members: nextMembers.map(sanitizeMember),
  });

  return {
    id: family.id,
    name: family.name,
    inviteCode: family.inviteCode,
  };
}

export async function getFamilyById(
  familyId: string
): Promise<FamilyGroup | null> {
  const firestore = requireDb();
  const snap = await getDoc(doc(firestore, "families", familyId));

  if (!snap.exists()) {
    return null;
  }

  return normalizeFamilyDoc(
    snap.id,
    snap.data() as Record<string, unknown>
  );
}

export async function getFamilies(): Promise<FamilyGroup[]> {
  const firestore = requireDb();
  const snapshot = await getDocs(collection(firestore, "families"));

  return snapshot.docs
    .map((snap) =>
      normalizeFamilyDoc(snap.id, snap.data() as Record<string, unknown>)
    )
    .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
}