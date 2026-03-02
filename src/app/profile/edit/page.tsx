
"use client"

import { useState, useEffect } from 'react'
import { Navigation } from '@/components/Navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Check, Camera } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useUser, useFirestore, useDoc, useMemoFirebase, setDocumentNonBlocking } from '@/firebase'
import { doc, serverTimestamp } from 'firebase/firestore'
import { MAIN_CITIES } from '@/app/lib/cities'

export default function EditProfilePage() {
  const router = useRouter()
  const { user, isUserLoading } = useUser()
  const db = useFirestore()
  
  const userRef = useMemoFirebase(() => {
    if (!db || !user) return null
    return doc(db, 'users', user.uid)
  }, [db, user])

  const { data: profile } = useDoc(userRef)

  const [formData, setFormData] = useState({
    nom: '',
    typeProfil: 'particulier',
    ville: '',
    description: '',
    whatsapp: '',
    emailPublic: ''
  })

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login')
    }
  }, [user, isUserLoading, router])

  useEffect(() => {
    if (profile) {
      setFormData({
        nom: profile.nom || '',
        typeProfil: profile.typeProfil || 'particulier',
        ville: profile.ville || '',
        description: profile.description || '',
        whatsapp: profile.whatsapp || '',
        emailPublic: profile.emailPublic || ''
      })
    }
  }, [profile])

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!userRef) return

    setDocumentNonBlocking(userRef, {
      ...formData,
      id: user?.uid,
      updatedAt: serverTimestamp(),
      isActive: true,
      createdAt: profile?.createdAt || serverTimestamp()
    }, { merge: true })

    router.push('/profile')
  }

  if (isUserLoading || !user) return null

  return (
    <div className="flex flex-col min-h-screen bg-background p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-2xl font-black italic uppercase tracking-tighter">Édition Profil</h1>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleSave}
          className="bg-primary/10 text-primary rounded-full hover:bg-primary hover:text-black transition-all"
        >
          <Check className="w-6 h-6" />
        </Button>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-6 pb-24">
        <div className="flex flex-col items-center gap-4 mb-4">
          <div className="relative group cursor-pointer">
            <div className="w-24 h-24 rounded-3xl overflow-hidden border-2 border-primary/20 bg-card flex items-center justify-center">
              <Camera className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-primary p-2 rounded-xl text-black shadow-lg">
              <Camera className="w-4 h-4" />
            </div>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Changer le logo/avatar</span>
        </div>

        <div className="space-y-2">
          <Label className="uppercase text-[10px] font-black tracking-[0.2em] text-muted-foreground ml-1">Nom affiché</Label>
          <Input 
            value={formData.nom}
            onChange={(e) => setFormData({...formData, nom: e.target.value})}
            placeholder="Ex: FC Etoile" 
            className="bg-card border-none ring-1 ring-white/10 rounded-xl h-12 font-bold focus-visible:ring-primary/50" 
          />
        </div>

        <div className="space-y-2">
          <Label className="uppercase text-[10px] font-black tracking-[0.2em] text-muted-foreground ml-1">Type de profil</Label>
          <Select 
            value={formData.typeProfil} 
            onValueChange={(val) => setFormData({...formData, typeProfil: val})}
          >
            <SelectTrigger className="bg-card border-none ring-1 ring-white/10 rounded-xl h-12 font-bold focus:ring-primary/50">
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="particulier">Particulier - Footeux ⚽</SelectItem>
              <SelectItem value="club_foot">Club de foot - Team 🏟️</SelectItem>
              <SelectItem value="club_supporter">Club de supporters - Ultras 🎺</SelectItem>
              <SelectItem value="professionnel">Professionnel / Entreprise - Pro 🏢</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="uppercase text-[10px] font-black tracking-[0.2em] text-muted-foreground ml-1">Ma Ville</Label>
          <Select 
            value={formData.ville} 
            onValueChange={(val) => setFormData({...formData, ville: val})}
          >
            <SelectTrigger className="bg-card border-none ring-1 ring-white/10 rounded-xl h-12 font-bold focus:ring-primary/50">
              <SelectValue placeholder="Choisir une ville" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {MAIN_CITIES.map((city) => (
                <SelectItem key={city} value={city}>{city}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="uppercase text-[10px] font-black tracking-[0.2em] text-muted-foreground ml-1">WhatsApp (Optionnel)</Label>
            <Input 
              value={formData.whatsapp}
              onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
              placeholder="0612345678" 
              className="bg-card border-none ring-1 ring-white/10 rounded-xl h-12 font-bold focus-visible:ring-primary/50" 
            />
          </div>
          <div className="space-y-2">
            <Label className="uppercase text-[10px] font-black tracking-[0.2em] text-muted-foreground ml-1">Email public (Optionnel)</Label>
            <Input 
              type="email"
              value={formData.emailPublic}
              onChange={(e) => setFormData({...formData, emailPublic: e.target.value})}
              placeholder="coach@team.fr" 
              className="bg-card border-none ring-1 ring-white/10 rounded-xl h-12 font-bold focus-visible:ring-primary/50" 
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="uppercase text-[10px] font-black tracking-[0.2em] text-muted-foreground ml-1">Bio / Présentation</Label>
          <Textarea 
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            placeholder="Décrivez votre club ou votre passion pour le foot..." 
            className="bg-card border-none ring-1 ring-white/10 rounded-xl min-h-[120px] font-medium focus-visible:ring-primary/50"
          />
        </div>

        <Button 
          type="submit"
          size="lg" 
          className="w-full rounded-2xl h-14 text-lg font-black italic uppercase tracking-wider mt-4 shadow-xl shadow-primary/20 bg-primary text-black hover:bg-primary/90"
        >
          Enregistrer les modifs
        </Button>
      </form>

      <Navigation />
    </div>
  )
}
