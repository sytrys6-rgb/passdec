
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
  "Aix-en-Provence", "Amiens", "Angers", "Annecy", "Besançon", "Bordeaux", "Boulogne-Billancourt", "Brest", 
  "Caen", "Clermont-Ferrand", "Dijon", "Grenoble", "Le Havre", "Le Mans", "Lille", "Limoges", "Lyon", 
  "Marseille", "Metz", "Montpellier", "Montreuil", "Mulhouse", "Nancy", "Nantes", "Nice", "Nîmes", 
  "Orléans", "Paris", "Perpignan", "Reims", "Rennes", "Rouen", "Saint-Denis", "Saint-Etienne", 
  "Strasbourg", "Toulon", "Toulouse", "Tours", "Villeurbanne"
].sort();

export default function NewOfferPage() {
  const router = useRouter()
  const { user, isUserLoading } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Récupération du profil pour dénormaliser le nom/type de l'utilisateur
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
              <SelectContent>
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
