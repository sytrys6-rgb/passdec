'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useToast } from '@/hooks/use-toast';

/**
 * Un composant qui écoute les événements 'permission-error' émis globalement.
 * Au lieu de lancer une erreur (ce qui bloquerait l'interface via Next.js),
 * il affiche une notification toast et log l'erreur dans la console pour le debug.
 */
export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handleError = (error: FirestorePermissionError) => {
      // Affiche un toast au lieu de faire planter l'application
      toast({
        variant: "destructive",
        title: "Accès refusé (Firestore)",
        description: "Vos permissions ne permettent pas d'effectuer cette action ou de lire ces données.",
      });
      
      // Log l'erreur structurée dans la console pour faciliter le débogage agentive
      console.warn("Firestore Permission Denied Context:", error.request);
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, [toast]);

  // Ce composant ne rend rien visuellement
  return null;
}
