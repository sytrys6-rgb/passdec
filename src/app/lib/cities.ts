
export interface CityInfo {
  name: string;
  lat: number;
  lng: number;
}

// Liste étendue avec coordonnées pour le calcul de distance
export const CITY_DATA: Record<string, { lat: number, lng: number }> = {
  "Paris": { lat: 48.8566, lng: 2.3522 },
  "Lyon": { lat: 45.7640, lng: 4.8357 },
  "Marseille": { lat: 43.2965, lng: 5.3698 },
  "Lille": { lat: 50.6292, lng: 3.0573 },
  "Bordeaux": { lat: 44.8378, lng: -0.5792 },
  "Nantes": { lat: 47.2184, lng: -1.5536 },
  "Strasbourg": { lat: 48.5734, lng: 7.7521 },
  "Montpellier": { lat: 43.6108, lng: 3.8767 },
  "Rennes": { lat: 48.1173, lng: -1.6778 },
  "Toulouse": { lat: 43.6047, lng: 1.4442 },
  "Nice": { lat: 43.7102, lng: 7.2620 },
  "Saint-Étienne": { lat: 45.4397, lng: 4.3872 },
  "Toulon": { lat: 43.1242, lng: 5.9280 },
  "Grenoble": { lat: 45.1885, lng: 5.7245 },
  "Dijon": { lat: 47.3220, lng: 5.0415 },
  "Angers": { lat: 47.4784, lng: -0.5632 },
  "Nîmes": { lat: 43.8367, lng: 4.3601 },
  "Villeurbanne": { lat: 45.7719, lng: 4.8817 },
  "Le Havre": { lat: 49.4944, lng: 0.1079 },
  "Reims": { lat: 49.2583, lng: 4.0317 }
};

export const MAIN_CITIES = Object.keys(CITY_DATA).sort();

// Fonction de calcul de distance (Haversine)
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Rayon de la terre en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance en km
}
