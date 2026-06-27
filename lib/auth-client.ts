import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  type User,
} from "firebase/auth";
import { getFirebaseAuth } from "./firebase-client";
import { phoneToAuthEmail } from "./phone";

export async function signInWithEmail(email: string, password: string): Promise<User> {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error("Firebase Auth not configured");
  const result = await signInWithEmailAndPassword(auth, email.trim(), password);
  return result.user;
}

export async function registerWithEmail(email: string, password: string): Promise<User> {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error("Firebase Auth not configured");
  const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
  return result.user;
}

export async function signInWithPhone(digits: string, password: string): Promise<User> {
  return signInWithEmail(phoneToAuthEmail(digits), password);
}

export async function registerWithPhone(digits: string, password: string): Promise<User> {
  return registerWithEmail(phoneToAuthEmail(digits), password);
}

export async function getIdToken(): Promise<string | null> {
  const auth = getFirebaseAuth();
  if (!auth?.currentUser) return null;
  return auth.currentUser.getIdToken();
}

export async function signOutUser(): Promise<void> {
  const auth = getFirebaseAuth();
  if (!auth) return;
  await auth.signOut();
}
