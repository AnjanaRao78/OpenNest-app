import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const app = getApps().length ? getApp() : initializeApp();

export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;