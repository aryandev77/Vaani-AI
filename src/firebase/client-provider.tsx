'use client';

import {
  type ReactNode,
  useState,
  useEffect,
  useMemo,
} from 'react';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

import { initializeFirebase } from './';
import { FirebaseProvider } from './provider';

type FirebaseClientProviderProps = {
  children: ReactNode;
};

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const [app, setApp] = useState<FirebaseApp | null>(null);
  const [auth, setAuth] = useState<Auth | null>(null);
  const [firestore, setFirestore] = useState<Firestore | null>(null);

  useEffect(() => {
    // Firebase is client-side only in this project.
    // We can safely initialize it in a useEffect.
    const { app, auth, firestore } = initializeFirebase();
    setApp(app);
    setAuth(auth);
    setFirestore(firestore);
  }, []);

  const contextValue = useMemo(() => {
    if (app && auth && firestore) {
      return { app, auth, firestore };
    }
    return null;
  }, [app, auth, firestore]);


  if (!contextValue) {
    return null; // or a loading spinner
  }

  return <FirebaseProvider value={contextValue}>{children}</FirebaseProvider>;
}
