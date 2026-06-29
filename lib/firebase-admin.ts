import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import {
  assertFirebaseAdminConfigured,
  getServiceAccount,
} from "./firebase-admin-config";
import { firebaseClientConfig } from "./firebase-config";

let app: App | null = null;
let db: Firestore | null = null;

export function getAdminApp(): App {
  assertFirebaseAdminConfigured();
  if (!app) {
    app = getApps().length
      ? getApps()[0]
      : initializeApp({ credential: cert(getServiceAccount()) });
  }
  return app;
}

export function getAdminDb(): Firestore {
  if (!db) {
    db = getFirestore(getAdminApp());
  }
  return db;
}

export function getAdminBucket() {
  const bucketName =
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    `${getServiceAccount().projectId}.appspot.com`;
  return getStorage(getAdminApp()).bucket(bucketName);
}
