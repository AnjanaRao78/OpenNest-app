import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

type FirebaseWebConfig = {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
};

function readFirebaseConfig(): FirebaseWebConfig {
  const fromNextEnv: FirebaseWebConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  const hasNextEnv =
    !!fromNextEnv.apiKey &&
    !!fromNextEnv.authDomain &&
    !!fromNextEnv.projectId &&
    !!fromNextEnv.appId;

  if (hasNextEnv) return fromNextEnv;

  const rawWebConfig = process.env.FIREBASE_WEBAPP_CONFIG;
  if (rawWebConfig) {
    try {
      const parsed = JSON.parse(rawWebConfig) as FirebaseWebConfig;
      return {
        apiKey: parsed.apiKey,
        authDomain: parsed.authDomain,
        projectId: parsed.projectId,
        storageBucket: parsed.storageBucket,
        messagingSenderId: parsed.messagingSenderId,
        appId: parsed.appId,
      };
    } catch (error) {
      console.error("Failed to parse FIREBASE_WEBAPP_CONFIG", error);
    }
  }

  return {};
}

const firebaseConfig = readFirebaseConfig();

const hasRequiredConfig =
  !!firebaseConfig.apiKey &&
  !!firebaseConfig.authDomain &&
  !!firebaseConfig.projectId &&
  !!firebaseConfig.appId;

const isServer = typeof window === "undefined";
if (!hasRequiredConfig && !isServer) {
 throw new Error(
   "Missing Firebase web config. Set NEXT_PUBLIC_FIREBASE_* or provide FIREBASE_WEBAPP_CONFIG."
 );
}

let app: any = null;
if (hasRequiredConfig) {
 app = getApps().length ? getApp() : initializeApp(firebaseConfig);
}

export { app };
export const db = app ? getFirestore(app) : null;

export function getClientAuth() {
  if (typeof window === "undefined") {
    throw new Error("Firebase Auth is client-only.");
  }
  return getAuth(app);
}
