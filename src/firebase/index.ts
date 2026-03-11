'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// ✅ VERSION CORRIGÉE POUR VERCEL + FIREBASE HOSTING
export function initializeFirebase() {
  if (!getApps().length) {
      // On initialise TOUJOURS avec le config (marche partout : Vercel, local, Firebase Hosting)
          const firebaseApp = initializeApp(firebaseConfig);
              return getSdks(firebaseApp);
                }

                  // Si déjà initialisé, on réutilise
                    return getSdks(getApp());
                    }

                    export function getSdks(firebaseApp: FirebaseApp) {
                      return {
                          firebaseApp,
                              auth: getAuth(firebaseApp),
                                  firestore: getFirestore(firebaseApp)
                                    };
                                    }

                                    export * from './provider';
                                    export * from './client-provider';
                                    export * from './firestore/use-collection';
                                    export * from './firestore/use-doc';
                                    export * from './non-blocking-updates';
                                    export * from './non-blocking-login';
                                    export * from './errors';
                                    export * from './error-emitter';