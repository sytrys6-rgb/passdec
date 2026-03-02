
"use client"

import { useState, useEffect, useRef } from 'react'
import { Navigation } from '@/components/Navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Camera, ArrowLeft, Loader2, Lock, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase'
import { collection, addDoc, serverTimestamp, doc } from 'firebase/firestore'
import { useToast } from '@/hooks/use-toast'
import { MAIN_CITIES, CITY_DATA } from '@/app/lib/cities'
import Image from 'next/image'
import { cn } from '@/lib/utils'

const CLOUDINARY_CLOUD_NAME = "dfincejqz";
const CLOUDINARY_UPLOAD_PRESET = "passdec_uploads";

export default function NewOfferPage() {
  const router = useRouter()
  const { user, isUserLoading } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [activeSlot, setActiveSlot] = useState<number | null>(null)

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
    prix: '',
    etat: 'Bon'
  })

  const [uploadedPhotos, setUploadedPhotos] = useState<(string | null)[]>([null, null])
  const [uploadedPhotoIds, setUploadedPhotoIds] = useState<(string | null)[]>([null, null])

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login')
    }
  }, [user, isUserLoading, router])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || activeSlot === null) return

    setUploadingIndex(activeSlot)
    
    const uploadData = new FormData()
    uploadData.append("file", file)
    uploadData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET)

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: uploadData,
        }
      )
      
      const data = await response.json()
      
      if (data.secure_url) {
        const newPhotos = [...uploadedPhotos]
        newPhotos[activeSlot] = data.secure_url
        setUploadedPhotos(newPhotos)

        const newPhotoIds = [...uploadedPhotoIds]
        newPhotoIds[activeSlot] = data.public_id
        setUploadedPhotoIds(newPhotoIds)

        toast({
          title: "Photo validée !",
          description: activeSlot === 0 ? "Photo principale enregistrée." : "Photo secondaire ajoutée."
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur d'upload",
        description: "Le transfert vers Cloudinary a échoué."
      })
    } finally {
      setUploadingIndex(null)
      setActiveSlot(null)
    }
  }

  const removePhoto = (index: number) => {
    const newPhotos = [...uploadedPhotos]
    newPhotos[index] = null
    setUploadedPhotos(newPhotos)

    const newPhotoIds = [...uploadedPhotoIds]
    newPhotoIds[index] = null
    setUploadedPhotoIds(newPhotoIds)
  }

  const triggerUpload = (index: number) => {
    if (uploadingIndex !== null) return
    setActiveSlot(index)
    fileInputRef.current?.click()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !db) return

    if (!uploadedPhotos[0]) {
      toast({
        variant: "warning",
        title: "Carton rouge !",
        description: "Une photo principale est obligatoire pour entrer sur le terrain."
      })
      return
    }

    if (!formData.titre || !formData.description || !formData.ville) {
      toast({
        variant: "warning",
        title: "Infos manquantes",
        description: "Veuillez remplir le titre, la description et la ville."
      })
      return
    }

    setIsSubmitting(true)

    try {
      const cityCoords = CITY_DATA[formData.ville] || { lat: 0, lng: 0 };
      const offersRef = collection(db, 'offres')
      
      const isSalesOrExchange = formData.typeOffre === 'vendre' || formData.typeOffre === 'echanger';

      await addDoc(offersRef, {
        typeOffre: formData.typeOffre,
        titre: formData.titre,
        description: formData.description,
        ville: formData.ville,
        prix: Number(formData.prix) || 0,
        etat: isSalesOrExchange ? formData.etat : null,
        userId: user.uid,
        userNom: profile?.nom || user.email?.split('@')[0] || 'Inconnu',
        userType: profile?.typeProfil || 'particulier',
        photos: uploadedPhotos.filter(p => p !== null), 
        photoIds: uploadedPhotoIds.filter(id => id !== null),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true,
        latitude: cityCoords.lat,
        longitude: cityCoords.lng
      })

      toast({
        title: "But marqué !",
        description: "Votre annonce est en ligne avec ses photos."
      })
      router.push('/')
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur technique",
        description: "La passe n'a pas pu aboutir."
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const showConditionField = formData.typeOffre === 'vendre' || formData.typeOffre === 'echanger';

  if (isUserLoading || !user) return null

  return (
    <div className="flex flex-col min-h-screen bg-background p-6">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-2xl font-black italic uppercase tracking-tighter text-primary">Nouvelle Passe</h1>
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="image/*"
      />

      <form onSubmit={handleSubmit} className="flex flex-col gap-6 pb-24">
        <div className="grid grid-cols-2 gap-4">
          <div 
            onClick={() => triggerUpload(0)}
            className={cn(
              "relative aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all cursor-pointer overflow-hidden",
              uploadedPhotos[0] ? "border-primary" : "border-muted hover:border-primary bg-card"
            )}
          >
            {uploadedPhotos[0] ? (
              <>
                <Image src={uploadedPhotos[0]} alt="Principal" fill className="object-cover" unoptimized />
                <button 
                  onClick={(e) => { e.stopPropagation(); removePhoto(0); }}
                  className="absolute top-2 right-2 p-1.5 bg-background/80 rounded-full text-destructive"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-2 left-2 bg-primary text-black px-2 py-0.5 rounded-md text-[8px] font-black uppercase">Principal</div>
              </>
            ) : uploadingIndex === 0 ? (
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            ) : (
              <>
                <Camera className="w-8 h-8 text-muted-foreground" />
                <span className="text-[10px] font-black uppercase italic text-center px-2">Photo de match*<br/>(Obligatoire)</span>
              </>
            )}
          </div>

          <div 
            onClick={() => triggerUpload(1)}
            className={cn(
              "relative aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all cursor-pointer overflow-hidden",
              uploadedPhotos[1] ? "border-primary" : "border-muted hover:border-primary bg-card"
            )}
          >
            {uploadedPhotos[1] ? (
              <>
                <Image src={uploadedPhotos[1]} alt="Secondaire" fill className="object-cover" unoptimized />
                <button 
                  onClick={(e) => { e.stopPropagation(); removePhoto(1); }}
                  className="absolute top-2 right-2 p-1.5 bg-background/80 rounded-full text-destructive"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : uploadingIndex === 1 ? (
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            ) : (
              <>
                <Camera className="w-4 h-4 text-muted-foreground" />
                <span className="text-[9px] font-bold uppercase text-muted-foreground">Optionnelle</span>
              </>
            )}
          </div>

          <div className="relative aspect-square rounded-2xl border-2 border-white/5 bg-card/40 flex flex-col items-center justify-center gap-2 opacity-50 grayscale">
            <Lock className="w-4 h-4 text-muted-foreground" />
            <span className="text-[8px] font-black uppercase tracking-widest text-primary">Premium</span>
          </div>

          <div className="relative aspect-square rounded-2xl border-2 border-white/5 bg-card/40 flex flex-col items-center justify-center gap-2 opacity-50 grayscale">
            <Lock className="w-4 h-4 text-muted-foreground" />
            <span className="text-[8px] font-black uppercase tracking-widest text-primary">Premium</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="uppercase text-[10px] font-black tracking-widest text-muted-foreground ml-1">Type de passe</Label>
          <Select 
            value={formData.typeOffre} 
            onValueChange={(val) => setFormData({...formData, typeOffre: val})}
          >
            <SelectTrigger className="bg-card border-none ring-1 ring-white/10 rounded-xl h-12 font-bold italic">
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

        {showConditionField && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
            <Label className="uppercase text-[10px] font-black tracking-widest text-muted-foreground ml-1">État de l'article</Label>
            <Select 
              value={formData.etat} 
              onValueChange={(val) => setFormData({...formData, etat: val})}
            >
              <SelectTrigger className="bg-card border-none ring-1 ring-white/10 rounded-xl h-12 font-bold italic">
                <SelectValue placeholder="Choisir l'état" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Neuf">Neuf</SelectItem>
                <SelectItem value="Très bon">Très bon</SelectItem>
                <SelectItem value="Bon">Bon</SelectItem>
                <SelectItem value="Satisfaisant">État satisfaisant</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label className="uppercase text-[10px] font-black tracking-widest text-muted-foreground ml-1">Titre de l'annonce</Label>
          <Input 
            value={formData.titre}
            onChange={(e) => setFormData({...formData, titre: e.target.value})}
            placeholder="Ex: Maillot collector OL 2002" 
            className="bg-card border-none ring-1 ring-white/10 rounded-xl h-12 font-bold uppercase italic" 
          />
        </div>

        <div className="space-y-2">
          <Label className="uppercase text-[10px] font-black tracking-widest text-muted-foreground ml-1">Description du match</Label>
          <Textarea 
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            placeholder="Détaillez votre offre tactiquement..." 
            className="bg-card border-none ring-1 ring-white/10 rounded-xl min-h-[120px] font-medium"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="uppercase text-[10px] font-black tracking-widest text-muted-foreground ml-1">Ville du stade</Label>
            <Select 
              value={formData.ville} 
              onValueChange={(val) => setFormData({...formData, ville: val})}
            >
              <SelectTrigger className="bg-card border-none ring-1 ring-white/10 rounded-xl h-12 font-bold italic">
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
            <Label className="uppercase text-[10px] font-black tracking-widest text-muted-foreground ml-1">Prix (€)</Label>
            <Input 
              type="number" 
              value={formData.prix}
              onChange={(e) => setFormData({...formData, prix: e.target.value})}
              placeholder="0" 
              className="bg-card border-none ring-1 ring-white/10 rounded-xl h-12 font-black italic text-primary" 
            />
          </div>
        </div>

        <Button 
          type="submit"
          disabled={isSubmitting || uploadingIndex !== null}
          size="lg" 
          className="w-full rounded-2xl h-14 text-lg font-black italic uppercase tracking-wider mt-4 shadow-xl shadow-primary/20 bg-primary text-black hover:bg-primary/90"
        >
          {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : "Frapper au but (Publier)"}
        </Button>
      </form>

      <Navigation />
    </div>
  )
}
