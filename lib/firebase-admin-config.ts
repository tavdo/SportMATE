import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { firebaseClientConfig } from "./firebase-config";

function parseServiceAccountJson(raw: string) {
  const trimmed = raw.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    // Vercel sometimes stores base64-encoded JSON
    try {
      return JSON.parse(Buffer.from(trimmed, "base64").toString("utf8"));
    } catch {
      throw new Error("Invalid FIREBASE_SERVICE_ACCOUNT_JSON");
    }
  }
}

export function isFirebaseAdminConfigured(): boolean {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) return true;
  const filePath =
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH ??
    join(process.cwd(), "firebase-service-account.json");
  if (existsSync(filePath)) return true;
  return Boolean(
    (process.env.FIREBASE_PROJECT_ID ?? firebaseClientConfig.projectId) &&
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
    return parseServiceAccountJson(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  }

  const filePath =
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH ??
    join(process.cwd(), "firebase-service-account.json");

  if (existsSync(filePath)) {
    return JSON.parse(readFileSync(filePath, "utf8"));
  }

  const projectId =
    process.env.FIREBASE_PROJECT_ID ?? firebaseClientConfig.projectId;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("FIREBASE_NOT_CONFIGURED");
  }

  return { projectId, clientEmail, privateKey };
}
