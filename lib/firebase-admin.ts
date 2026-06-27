import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import {
  assertFirebaseAdminConfigured,
  getServiceAccount,
} from "./firebase-admin-config";

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
