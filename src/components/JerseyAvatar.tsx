
'use client';

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface JerseyAvatarProps {
  name: string;
  userId?: string;
  className?: string;
}

/**
 * Génère un avatar sous forme de maillot de foot personnalisé.
 * Affiche les 6 premières lettres du pseudo et un numéro de 1 à 11.
 */
export function JerseyAvatar({ name, userId, className }: JerseyAvatarProps) {
  const shortName = name.substring(0, 6).toUpperCase();
  
  // Utilisation d'un calcul déterministe basé sur l'ID utilisateur pour éviter les erreurs d'hydratation
  // et garder le même numéro pour un utilisateur donné.
  const jerseyNumber = useMemo(() => {
    if (!userId) return Math.floor(Math.random() * 11) + 1;
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    return (Math.abs(hash) % 11) + 1;
  }, [userId]);

  return (
    <div className={cn("relative flex items-center justify-center bg-card shadow-inner overflow-hidden", className)}>
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
        {/* Corps du maillot */}
        <path 
          d="M20,20 L80,20 L85,45 L70,45 L70,90 L30,90 L30,45 L15,45 Z" 
          fill="currentColor" 
          className="text-primary" 
        />
        {/* Col */}
        <path d="M40,20 Q50,30 60,20" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="2" />
        {/* Rayures subtiles */}
        <rect x="38" y="25" width="2" height="65" fill="rgba(0,0,0,0.05)" />
        <rect x="60" y="25" width="2" height="65" fill="rgba(0,0,0,0.05)" />
        
        {/* Pseudo (6 premières lettres) */}
        <text 
          x="50" 
          y="38" 
          textAnchor="middle" 
          fill="black" 
          className="font-black italic uppercase" 
          style={{ fontSize: '7px', letterSpacing: '0.1em' }}
        >
          {shortName}
        </text>
        
        {/* Numéro (1-11) */}
        <text 
          x="50" 
          y="72" 
          textAnchor="middle" 
          fill="black" 
          className="font-black italic" 
          style={{ fontSize: '28px' }}
        >
          {jerseyNumber}
        </text>
      </svg>
    </div>
  );
}
