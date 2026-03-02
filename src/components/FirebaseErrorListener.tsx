'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * Écoute les erreurs de permission Firestore.
 * Les erreurs sont loguées dans la console (console.warn) mais ne sont pas affichées 
 * à l'utilisateur pour éviter de bloquer l'expérience de navigation.
 */
export function FirebaseErrorListener() {
  useEffect(() => {
    const handleError = (error: FirestorePermissionError) => {
      // On logue l'erreur de manière silencieuse pour l'utilisateur final.
      // Utile pour le débogage technique uniquement.
      console.warn("Firestore Permission Denied (handled silently):", {
        operation: error.request.method,
        path: error.request.path,
        authUid: error.request.auth?.uid
      });
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, []);

  // Ce composant est purement logique et ne rend rien.
  return null;
}
