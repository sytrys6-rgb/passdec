'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * Un composant qui écoute les événements 'permission-error' émis globalement.
 * Désormais, il logue simplement l'erreur dans la console sans interrompre l'utilisateur.
 */
export function FirebaseErrorListener() {
  useEffect(() => {
    const handleError = (error: FirestorePermissionError) => {
      // Log l'erreur structurée dans la console pour faciliter le débogage technique
      // sans afficher de message d'erreur visuel à l'utilisateur final.
      console.warn("Firestore Permission Denied Context:", error.request);
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, []);

  // Ce composant ne rend rien visuellement
  return null;
}
