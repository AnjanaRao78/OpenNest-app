import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
const firebaseConfig = {
apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};
const hasRequiredConfig =
!!firebaseConfig.apiKey &&
!!firebaseConfig.authDomain &&
!!firebaseConfig.projectId &&
!!firebaseConfig.appId;
let app: FirebaseApp | null = null;
if (hasRequiredConfig) {
app = getApps().length ? getApp() : initializeApp(firebaseConfig);
}
export { app };
export const db = app ? getFirestore(app) : null;
export function getClientAuth() {
if (typeof window === "undefined") {
throw new Error("Firebase Auth is client-only.");
}
if (!app) {
throw new Error("Firebase app is not initialized.");
}
return getAuth(app);
}