import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { firebaseClientConfig } from "./firebase-config";

function normalizePrivateKey(key: string): string {
  let k = key.trim();
  if ((k.startsWith('"') && k.endsWith('"')) || (k.startsWith("'") && k.endsWith("'"))) {
    k = k.slice(1, -1);
  }
  return k.replace(/\\n/g, "\n");
}

function parseServiceAccountJson(raw: string) {
  const trimmed = raw.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    try {
      return JSON.parse(Buffer.from(trimmed, "base64").toString("utf8"));
    } catch {
      throw new Error("Invalid FIREBASE_SERVICE_ACCOUNT_JSON");
    }
  }
}

export function isFirebaseAdminConfigured(): boolean {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (json && json.length > 20) return true;

  const filePath =
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH ??
    join(process.cwd(), "firebase-service-account.json");
  if (existsSync(filePath)) return true;

  const projectId =
    process.env.FIREBASE_PROJECT_ID ?? firebaseClientConfig.projectId;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.trim();

  return Boolean(
    projectId && clientEmail && privateKey && privateKey.length > 40
  );
}

export function assertFirebaseAdminConfigured(): void {
  if (!isFirebaseAdminConfigured()) {
    throw new Error("FIREBASE_NOT_CONFIGURED");
  }
}

export function getServiceAccount() {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (json && json.length > 20) {
    const account = parseServiceAccountJson(json);
    if (account.private_key) {
      account.private_key = normalizePrivateKey(account.private_key);
    }
    return account;
  }

  const filePath =
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH ??
    join(process.cwd(), "firebase-service-account.json");

  if (existsSync(filePath)) {
    const account = JSON.parse(readFileSync(filePath, "utf8"));
    if (account.private_key) {
      account.private_key = normalizePrivateKey(account.private_key);
    }
    return account;
  }

  const projectId =
    process.env.FIREBASE_PROJECT_ID ?? firebaseClientConfig.projectId;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ? normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY)
    : undefined;

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("FIREBASE_NOT_CONFIGURED");
  }

  return { projectId, clientEmail, privateKey };
}
