'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  UserCredential,
} from 'firebase/auth';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): Promise<UserCredential> {
  const promise = signInAnonymously(authInstance);
  promise.catch((error) => {
     // Handle or log error appropriately, maybe via a global error handler
     console.error("Anonymous sign-in failed:", error);
  });
  return promise;
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string): Promise<UserCredential> {
  const promise = createUserWithEmailAndPassword(authInstance, email, password);
  promise.catch((error) => {
     // Propagate as a generic auth error for the UI to handle
     console.error("Email sign-up failed:", error);
     throw error;
  });
  return promise;
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): Promise<UserCredential> {
  const promise = signInWithEmailAndPassword(authInstance, email, password);
  promise.catch((error) => {
     console.error("Email sign-in failed:", error);
     throw error;
  });
  return promise;
}

/** Initiate Google sign-in with a popup (non-blocking). */
export function initiateGoogleSignIn(authInstance: Auth): Promise<UserCredential> {
  const provider = new GoogleAuthProvider();
  const promise = signInWithPopup(authInstance, provider);
  promise.catch((error) => {
     // Allow UI to handle specific error codes like 'popup-closed-by-user'
     // Do not log the error here, as it's expected if the user closes the popup.
     // The calling component will handle whether to show a toast or not.
     throw error;
  });
  return promise;
}
