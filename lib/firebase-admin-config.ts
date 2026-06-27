import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { firebaseClientConfig } from "./firebase-config";

export function isFirebaseAdminConfigured(): boolean {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) return true;
  const filePath =
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH ??
    join(process.cwd(), "firebase-service-account.json");
  if (existsSync(filePath)) return true;
  return Boolean(
    process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
  );
}

export function assertFirebaseAdminConfigured(): void {
  if (!isFirebaseAdminConfigured()) {
    throw new Error("FIREBASE_NOT_CONFIGURED");
  }
}

export function getServiceAccount() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  }

  const filePath =
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH ??
    join(process.cwd(), "firebase-service-account.json");

  if (existsSync(filePath)) {
    return JSON.parse(readFileSync(filePath, "utf8"));
  }

  return {
    projectId:
      process.env.FIREBASE_PROJECT_ID ?? firebaseClientConfig.projectId,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  };
}
