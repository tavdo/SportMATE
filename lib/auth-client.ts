import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  type ConfirmationResult,
  type User,
} from "firebase/auth";
import { getFirebaseAuth } from "./firebase-client";
import { toE164 } from "./phone";

let recaptchaVerifier: RecaptchaVerifier | null = null;
let confirmationResult: ConfirmationResult | null = null;

export function getRecaptchaVerifier(containerId: string): RecaptchaVerifier {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error("Firebase Auth not configured");

  if (recaptchaVerifier) {
    try {
      recaptchaVerifier.clear();
    } catch {
      // ignore
    }
  }

  recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: "invisible",
  });

  return recaptchaVerifier;
}

export async function sendPhoneOtp(
  digits: string,
  containerId: string
): Promise<void> {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error("Firebase Auth not configured");

  const verifier = getRecaptchaVerifier(containerId);
  confirmationResult = await signInWithPhoneNumber(auth, toE164(digits), verifier);
}

export async function confirmPhoneOtp(code: string): Promise<User> {
  if (!confirmationResult) {
    throw new Error("No verification in progress");
  }
  const result = await confirmationResult.confirm(code);
  confirmationResult = null;
  return result.user;
}

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

export async function getIdToken(): Promise<string | null> {
  const auth = getFirebaseAuth();
  if (!auth?.currentUser) return null;
  return auth.currentUser.getIdToken();
}

export async function signOutUser(): Promise<void> {
  const auth = getFirebaseAuth();
  if (!auth) return;
  await auth.signOut();
  confirmationResult = null;
  if (recaptchaVerifier) {
    try {
      recaptchaVerifier.clear();
    } catch {
      // ignore
    }
    recaptchaVerifier = null;
  }
}
