
"use client"

import { useState, useEffect } from 'react'
import { Navigation } from '@/components/Navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Camera, ArrowLeft, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase'
import { collection, addDoc, serverTimestamp, doc } from 'firebase/firestore'
import { useToast } from '@/hooks/use-toast'

const MAIN_CITIES = [
  "Abbeville", "Agen", "Aix-en-Provence", "Ajaccio", "Albi", "Alès", "Alfortville", "Amiens", "Angers", "Anglet", "Angoulême", "Annecy", "Annemasse", "Antibes", "Antony", "Argenteuil", "Arles", "Arras", "Asnières-sur-Seine", "Aubervilliers", "Aulnay-sous-Bois", "Aurillac", "Auxerre", "Avignon", "Bagneux", "Bayonne", "Beauvais", "Belfort", "Bergerac", "Besançon", "Béziers", "Biarritz", "Blois", "Bobigny", "Bondy", "Bordeaux", "Boulogne-Billancourt", "Boulogne-sur-Mer", "Bourg-en-Bresse", "Bourges", "Brest", "Brive-la-Gaillarde", "Bron", "Caen", "Cahors", "Calais", "Caluire-et-Cuire", "Cambrai", "Cannes", "Carcassonne", "Castres", "Cayenne", "Cergy", "Chalon-sur-Saône", "Châlons-en-Champagne", "Chambéry", "Champigny-sur-Marne", "Charenton-le-Pont", "Charleville-Mézières", "Chartres", "Châteauroux", "Châtellerault", "Châtenay-Malabry", "Châtillon", "Chatou", "Chaumont", "Chelles", "Cherbourg-en-Cotentin", "Choisy-le-Roi", "Cholet", "Clamart", "Clichy", "Clichy-sous-Bois", "Clermont-Ferrand", "Cognac", "Colmar", "Colombes", "Colomiers", "Combs-la-Ville", "Compiègne", "Concarneau", "Conflans-Sainte-Honorine", "Corbeil-Essonnes", "Courbevoie", "Creil", "Créteil", "Dax", "Dieppe", "Dijon", "Dole", "Douai", "Drancy", "Draguignan", "Dreux", "Dunkerque", "Échirolles", "Élancourt", "Épernay", "Épinal", "Épinay-sur-Seine", "Ermont", "Étampes", "Évreux", "Évry-Courcouronnes", "Fécamp", "Fleury-les-Aubrais", "Fontaine", "Fontenay-aux-Roses", "Fontenay-sous-Bois", "Forbach", "Fougères", "Franconville", "Fréjus", "Gagny", "Gap", "Garges-lès-Gonesse", "Gennevilliers", "Gif-sur-Yvette", "Gonesse", "Goussainville", "Gradignan", "Grande-Synthe", "Granville", "Grasse", "Grenoble", "Grigny", "Guéret", "Guyancourt", "Haguenau", "Hazebrouck", "Henin-Beaumont", "Herblay-sur-Seine", "Houilles", "Hyères", "Illkirch-Graffenstaden", "Issy-les-Moulineaux", "Istres", "Ivry-sur-Seine", "Joué-lès-Tours", "La Courneuve", "La Garde", "La Garenne-Colombes", "La Madeleine", "La Possession", "La Roche-sur-Yon", "La Rochelle", "La Seyne-sur-Mer", "La Valette-du-Var", "Lagny-sur-Marne", "Lambersart", "Lanester", "Laon", "Laval", "Le Blanc-Mesnil", "Le Bouscat", "Le Cannet", "Le Chesnay-Rocquencourt", "Le Creusot", "Le Grand-Quevilly", "Le Havre", "Le Kremlin-Bicêtre", "Le Mans", "Le Mée-sur-Seine", "Le Perreux-sur-Marne", "Le Petit-Quevilly", "Le Plessis-Robinson", "Le Pontet", "Le Port", "Le Raincy", "Le Robert", "Le Tampon", "Lens", "Les Abymes", "Les Lilas", "Les Mureaux", "Les Pavillons-sous-Bois", "Les Sables-d'Olonne", "Les Ulis", "Levallois-Perret", "Libourne", "Liévin", "Lille", "Limoges", "Lisieux", "Livry-Gargan", "Lons-le-Saunier", "Lorient", "Lormont", "Lunel", "Lunéville", "Lyon", "Mâcon", "Maisons-Alfort", "Maisons-Laffitte", "Malakoff", "Mandelieu-la-Napoule", "Manosque", "Mantes-la-Jolie", "Marcq-en-Barœul", "Marignane", "Marseille", "Martigues", "Massy", "Maubeuge", "Meaux", "Melun", "Menton", "Mérignac", "Metz", "Meudon", "Meyzieu", "Millau", "Miramas", "Mons-en-Barœul", "Mont-de-Marsan", "Mont-Saint-Aignan", "Montauban", "Montbéliard", "Montceau-les-Mines", "Montélimar", "Montfermeil", "Montgeron", "Montigny-le-Bretonneux", "Montigny-lès-Metz", "Montluçon", "Montmorency", "Montpellier", "Montreuil", "Montrouge", "Moulins", "Mulhouse", "Muret", "Nancy", "Nanterre", "Nantes", "Narbonne", "Neuilly-sur-Marne", "Neuilly-sur-Seine", "Nevers", "Nice", "Nîmes", "Niort", "Nogent-sur-Marne", "Noisy-le-Grand", "Noisy-le-Sec", "Olivet", "Orange", "Orléans", "Orly", "Orvault", "Oullins", "Outreau", "Oyonnax", "Ozoir-la-Ferrière", "Pantin", "Paris", "Palaiseau", "Pamiers", "Pau", "Périgueux", "Perpignan", "Pessac", "Pierrefitte-sur-Seine", "Plaisir", "Poissy", "Poitiers", "Pont-à-Mousson", "Pontault-Combault", "Pontoise", "Puteaux", "Quimper", "Rambouillet", "Reims", "Rennes", "Rezé", "Rillieux-la-Pape", "Ris-Orangis", "Roanne", "Rochefort", "Rodez", "Romainville", "Romans-sur-Isère", "Rosny-sous-Bois", "Roubaix", "Rouen", "Rueil-Malmaison", "Saint-André-lez-Lille", "Saint-Brieuc", "Saint-Chamond", "Saint-Cloud", "Saint-Denis", "Saint-Dié-des-Vosges", "Saint-Dizier", "Saint-Étienne", "Saint-Étienne-du-Rouvray", "Saint-Germain-en-Laye", "Saint-Gratien", "Saint-Herblain", "Saint-Jean-de-Braye", "Saint-Jean-de-Luz", "Saint-Joseph", "Saint-Laurent-du-Var", "Saint-Leu", "Saint-Louis", "Saint-Malo", "Saint-Mandé", "Saint-Martin-d'Hères", "Saint-Maur-des-Fossés", "Saint-Médard-en-Jalles", "Saint-Michel-sur-Orge", "Saint-Nazaire", "Saint-Ouen-sur-Seine", "Saint-Paul", "Saint-Pierre", "Saint-Priest", "Saint-Quentin", "Saint-Raphaël", "Saint-Sébastien-sur-Loire", "Sainte-Foy-lès-Lyon", "Sainte-Geneviève-des-Bois", "Sainte-Marie", "Saintes", "Salon-de-Provence", "Sannois", "Sarcelles", "Sarreguemines", "Sartrouville", "Saumur", "Savigny-le-Temple", "Savigny-sur-Orge", "Schiltigheim", "Sedan", "Sens", "Sète", "Sevran", "Sèvres", "Six-Fours-les-Plages", "Soissons", "Sotteville-lès-Rouen", "Stains", "Strasbourg", "Sucy-en-Brie", "Suresnes", "Talence", "Tarbes", "Taverny", "Thiais", "Thonon-les-Bains", "Torcy", "Toulon", "Toulouse", "Tourcoing", "Tournefeuille", "Tours", "Trappes", "Tremblay-en-France", "Tulle", "Valence", "Valenciennes", "Vallauris", "Vandoeuvre-lès-Nancy", "Vannes", "Vanves", "Vaulx-en-Velin", "Vélizy-Villacoublay", "Vénissieux", "Vernon", "Versailles", "Vertou", "Vichy", "Vienne", "Vierzon", "Vigneux-sur-Seine", "Villejuif", "Villemomble", "Villenave-d'Ornon", "Villeneuve-d'Ascq", "Villeneuve-la-Garenne", "Villeneuve-Saint-Georges", "Villeparisis", "Villepinte", "Villeurbanne", "Villiers-le-Bel", "Villiers-sur-Marne", "Vincennes", "Viry-Châtillon", "Vitrolles", "Vitry-sur-Seine", "Voiron", "Wattrelos", "Yerres"
].sort();

export default function NewOfferPage() {
  const router = useRouter()
  const { user, isUserLoading } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const userRef = useMemoFirebase(() => {
    if (!db || !user) return null
    return doc(db, 'users', user.uid)
  }, [db, user])
  const { data: profile } = useDoc(userRef)

  const [formData, setFormData] = useState({
    typeOffre: 'vendre',
    titre: '',
    description: '',
    ville: '',
    prix: ''
  })

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login')
    }
  }, [user, isUserLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !db) return

    if (!formData.titre || !formData.description || !formData.ville) {
      toast({
        variant: "destructive",
        title: "Carton jaune !",
        description: "Veuillez remplir les informations essentielles du match (Titre, Description et Ville)."
      })
      return
    }

    setIsSubmitting(true)

    try {
      const offersRef = collection(db, 'offres')
      await addDoc(offersRef, {
        typeOffre: formData.typeOffre,
        titre: formData.titre,
        description: formData.description,
        ville: formData.ville,
        prix: Number(formData.prix) || 0,
        userId: user.uid,
        userNom: profile?.nom || user.email?.split('@')[0] || 'Inconnu',
        userType: profile?.typeProfil || 'particulier',
        photos: ['https://picsum.photos/seed/' + Math.random() + '/600/400'], 
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true,
        latitude: 0,
        longitude: 0
      })

      toast({
        title: "But marqué !",
        description: "Votre annonce est en ligne sur le terrain."
      })
      router.push('/')
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur technique",
        description: "La passe n'a pas pu aboutir. Réessayez."
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isUserLoading || !user) return null

  return (
    <div className="flex flex-col min-h-screen bg-background p-6">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-2xl font-black italic uppercase tracking-tighter">Nouvelle Offre</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6 pb-24">
        <div className="grid grid-cols-2 gap-4">
          <div className="aspect-square rounded-2xl border-2 border-dashed border-muted flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-all cursor-pointer bg-card">
            <Camera className="w-8 h-8" />
            <span className="text-[10px] font-bold uppercase">Ajouter Photo</span>
          </div>
          <div className="aspect-square rounded-2xl border-2 border-dashed border-muted flex flex-col items-center justify-center bg-card/20" />
        </div>

        <div className="space-y-2">
          <Label className="uppercase text-[10px] font-bold tracking-widest text-muted-foreground ml-1">Type de passe</Label>
          <Select 
            value={formData.typeOffre} 
            onValueChange={(val) => setFormData({...formData, typeOffre: val})}
          >
            <SelectTrigger className="bg-card border-none ring-1 ring-white/10 rounded-xl h-12">
              <SelectValue placeholder="Choisir le type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vendre">Vendre</SelectItem>
              <SelectItem value="echanger">Échanger</SelectItem>
              <SelectItem value="evenement">Événement</SelectItem>
              <SelectItem value="matcher">Matcher (Recrutement)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="uppercase text-[10px] font-bold tracking-widest text-muted-foreground ml-1">Titre de l'annonce</Label>
          <Input 
            value={formData.titre}
            onChange={(e) => setFormData({...formData, titre: e.target.value})}
            placeholder="Ex: Maillot collector OL 2002" 
            className="bg-card border-none ring-1 ring-white/10 rounded-xl h-12" 
          />
        </div>

        <div className="space-y-2">
          <Label className="uppercase text-[10px] font-bold tracking-widest text-muted-foreground ml-1">Description</Label>
          <Textarea 
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            placeholder="Détaillez votre offre (état, taille, conditions...)" 
            className="bg-card border-none ring-1 ring-white/10 rounded-xl min-h-[120px]"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="uppercase text-[10px] font-bold tracking-widest text-muted-foreground ml-1">Ville</Label>
            <Select 
              value={formData.ville} 
              onValueChange={(val) => setFormData({...formData, ville: val})}
            >
              <SelectTrigger className="bg-card border-none ring-1 ring-white/10 rounded-xl h-12">
                <SelectValue placeholder="Choisir une ville" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {MAIN_CITIES.map((city) => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="uppercase text-[10px] font-bold tracking-widest text-muted-foreground ml-1">Prix (€)</Label>
            <Input 
              type="number" 
              value={formData.prix}
              onChange={(e) => setFormData({...formData, prix: e.target.value})}
              placeholder="0" 
              className="bg-card border-none ring-1 ring-white/10 rounded-xl h-12" 
            />
          </div>
        </div>

        <Button 
          type="submit"
          disabled={isSubmitting}
          size="lg" 
          className="w-full rounded-2xl h-14 text-lg font-black italic uppercase tracking-wider mt-4 shadow-lg shadow-primary/20"
        >
          {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : "Publier l'offre"}
        </Button>
      </form>

      <Navigation />
    </div>
  )
}
