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

export default function EditProfilePage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    nom: '',
    typeProfil: '',
    ville: '',
    description: ''
  })

  useEffect(() => {
    const savedUser = localStorage.getItem('pass-dec-user')
    const initialUser = {
      nom: 'FC Etoile',
      typeProfil: 'club_foot',
      ville: 'Lyon',
      description: 'Club amateur historique de la région lyonnaise. On cherche toujours des nouveaux talents !'
    }
    
    if (savedUser) {
      try {
        setFormData(JSON.parse(savedUser))
      } catch (e) {
        setFormData(initialUser)
      }
    } else {
      setFormData(initialUser)
    }
  }, [])

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    localStorage.setItem('pass-dec-user', JSON.stringify(formData))
    router.push('/profile')
  }

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
        {/* Avatar change simulation */}
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
          <Label className="uppercase text-[10px] font-black tracking-[0.2em] text-muted-foreground ml-1">Nom du club ou utilisateur</Label>
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
              <SelectValue placeholder="Type de compte" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="club_foot">Club de Football</SelectItem>
              <SelectItem value="club_supporter">Club de Supporters</SelectItem>
              <SelectItem value="particulier">Particulier / Fan</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="uppercase text-[10px] font-black tracking-[0.2em] text-muted-foreground ml-1">Ma Ville</Label>
          <Input 
            value={formData.ville}
            onChange={(e) => setFormData({...formData, ville: e.target.value})}
            placeholder="Ex: Lyon" 
            className="bg-card border-none ring-1 ring-white/10 rounded-xl h-12 font-bold focus-visible:ring-primary/50" 
          />
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
