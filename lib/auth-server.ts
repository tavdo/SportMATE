import { getAuth } from "firebase-admin/auth";
import { getAdminApp } from "./firebase-admin";

export function getAdminAuth() {
  return getAuth(getAdminApp());
}

function parseList(raw: string | undefined): string[] {
  return (raw ?? "")
    .split(",")
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean);
}

export function getAdminPhones(): string[] {
  return parseList(process.env.ADMIN_PHONES).map((p) => p.replace(/\s/g, ""));
}

export function getAdminEmails(): string[] {
  return parseList(process.env.ADMIN_EMAILS);
}

export function isAdminPhone(phone: string | undefined | null): boolean {
  if (!phone) return false;
  const normalized = phone.replace(/\s/g, "");
  return getAdminPhones().some((admin) => admin === normalized);
}

export function isAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  return getAdminEmails().includes(email.toLowerCase());
}

export function isAdminUser(phone: string | null | undefined, email: string | null | undefined): boolean {
  return isAdminPhone(phone) || isAdminEmail(email);
}
