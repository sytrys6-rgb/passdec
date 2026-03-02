
export interface OfferData {
  id: string;
  titre: string;
  description: string;
  prix: number;
  ville: string;
  typeOffre: 'vendre' | 'echanger' | 'evenement' | 'matcher';
  image: string;
  userNom: string;
  userType: string;
  userRating: number;
  date: string;
  userId: string;
}

export const allOffers: OfferData[] = [
  {
    id: '1',
    titre: 'Maillot OL 2024 Domicile',
    description: 'Neuf, jamais porté, taille L. Édition collector avec patch Ligue 1. Le textile est ultra respirant, idéal pour les matchs ou le sport intensif.',
    prix: 65,
    ville: 'Lyon',
    typeOffre: 'vendre',
    image: 'https://picsum.photos/seed/foot-shirt/600/400',
    userNom: 'GonesFC',
    userType: 'club_supporter',
    userRating: 4.9,
    date: 'Publié il y a 2h',
    userId: 'mock-user-1'
  },
  {
    id: '2',
    titre: 'Recherche Joueur U17',
    description: 'Le club recherche un gardien de but motivé pour son équipe U17 régionale. Entraînements 3 fois par semaine le soir.',
    prix: 0,
    ville: 'Villeurbanne',
    typeOffre: 'matcher',
    image: 'https://picsum.photos/seed/foot-match/600/400',
    userNom: 'FC Villeurbanne',
    userType: 'club_foot',
    userRating: 4.8,
    date: 'Publié hier',
    userId: 'mock-user-2'
  },
  {
    id: '3',
    titre: 'Échange Crampons T42',
    description: 'Paire d\'Adidas Predator Portée 2 fois sur herbe uniquement. État irréprochable. Échange uniquement contre des gants de gardien.',
    prix: 0,
    ville: 'Marseille',
    typeOffre: 'echanger',
    image: 'https://picsum.photos/seed/boots/600/400',
    userNom: 'OMFan13',
    userType: 'particulier',
    userRating: 4.7,
    date: 'Publié il y a 3 jours',
    userId: 'mock-user-3'
  },
  {
    id: '4',
    titre: 'Tournoi Futsal Solidaire',
    description: 'Inscrivez votre équipe pour le tournoi de charité au Five de Paris. Tous les bénéfices seront reversés à une association locale.',
    prix: 20,
    ville: 'Paris',
    typeOffre: 'evenement',
    image: 'https://picsum.photos/seed/stadium/600/400',
    userNom: 'PSG Academy',
    userType: 'club_foot',
    userRating: 5.0,
    date: 'Publié il y a 5h',
    userId: 'mock-user-4'
  },
  {
    id: '5',
    titre: 'Veste de survêtement vintage',
    description: 'Pièce rare des années 90, logo brodé. Très bon état général, taille M. Style rétro parfait pour les sorties.',
    prix: 40,
    ville: 'Lyon',
    typeOffre: 'vendre',
    image: 'https://picsum.photos/seed/vintage/600/400',
    userNom: 'VintageFoot',
    userType: 'particulier',
    userRating: 4.6,
    date: 'Publié la semaine dernière',
    userId: 'mock-user-5'
  }
];
