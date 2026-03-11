
"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, useUser, useFirestore } from '@/firebase'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signOut } from 'firebase/auth'
import { doc, setDoc, serverTimestamp, getDoc, updateDoc } from 'firebase/firestore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [dob, setDob] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const auth = useAuth()
  const db = useFirestore()
  const { user, isUserLoading } = useUser()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (user && !isUserLoading) {
      const checkStatusAndPromote = async () => {
        const userRef = doc(db, 'users', user.uid)
        const snap = await getDoc(userRef)
        
        // AUTO-PROMOTION LOGIC FOR ADMIN
        if (user.email === 'sytrys6@gmail.com') {
          if (snap.exists() && snap.data().role !== 'admin') {
            try {
              await updateDoc(userRef, { role: 'admin' })
              toast({
                title: "Accès Arbitre Activé",
                description: "Votre compte sytrys6@gmail.com a été promu Administrateur."
              })
            } catch (e) {
              console.error("Promotion failed", e)
            }
          }
        }

        if (snap.exists() && snap.data().isBlocked === true) {
          document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
          await signOut(auth)
          toast({
            variant: "destructive",
            title: "Carton Rouge !",
            description: "Votre accès au terrain a été suspendu par l'arbitre."
          })
        } else {
          document.cookie = `auth_token=true; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
          router.push('/')
        }
      }
      checkStatusAndPromote()
    }
  }, [user, isUserLoading, router, db, auth, toast])

  const calculateAge = (birthDateString: string) => {
    const today = new Date();
    const birthDate = new Date(birthDateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast({
        variant: "destructive",
        title: "Email manquant",
        description: "Veuillez entrer votre adresse email pour recevoir le lien."
      })
      return
    }

    setIsLoading(true)
    try {
      await sendPasswordResetEmail(auth, email)
      toast({
        title: "Lien envoyé !",
        description: "Vérifiez votre boîte mail (et les spams) pour réinitialiser votre mot de passe."
      })
      setMode('login')
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'envoyer l'email. Vérifiez l'adresse saisie."
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (mode === 'forgot') {
      handleResetPassword(e)
      return
    }

    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Champs manquants",
        description: "Veuillez remplir tous les champs."
      })
      return
    }

    if (mode === 'signup' && !dob) {
      toast({
        variant: "destructive",
        title: "Date manquante",
        description: "Veuillez indiquer votre date de naissance."
      })
      return
    }

    if (mode === 'signup') {
      const age = calculateAge(dob);
      if (age < 15) {
        toast({
          variant: "destructive",
          title: "Carton Rouge !",
          description: "Vous devez avoir au moins 15 ans pour entrer sur le terrain."
        })
        return
      }
    }

    const allowedDomains = ['gmail.com', 'outlook.fr', 'hotmail.fr', 'hotmail.com', 'yahoo.fr', 'orange.fr', 'free.fr'];
    const emailDomain = email.split('@')[1]?.toLowerCase();

    if (!allowedDomains.includes(emailDomain)) {
      toast({
        variant: "destructive",
        title: "Carton Rouge !",
        description: "Seules les adresses Gmail, Outlook, Hotmail, Yahoo, Orange et Free sont autorisées sur le terrain."
      })
      return
    }

    setIsLoading(true)

    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password)
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        const userRef = doc(db, 'users', userCredential.user.uid)
        await setDoc(userRef, {
          id: userCredential.user.uid,
          nom: email.split('@')[0],
          role: email === 'sytrys6@gmail.com' ? 'admin' : 'user',
          typeProfil: 'particulier',
          ville: 'Non renseignée',
          description: 'Nouveau membre de la team Pass\' Déc\'.',
          dateNaissance: dob,
          createdAt: serverTimestamp(),
          isActive: true,
          isBlocked: false,
          favoris: []
        })
      }
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Hors-jeu !",
        description: "L'adresse mail ou le mot de passe est incorrect."
      })
    } finally {
      setIsLoading(false)
    }
  }

  const heroImage = "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200&auto=format&fit=crop"
  const logoUrl = "https://res.cloudinary.com/dfincejqz/image/upload/v1772489336/logo_fec345.jpg"

  if (isUserLoading) return null

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
         <Image 
            src={heroImage} 
            alt="Action Football Pro" 
            fill
            className="object-cover"
            priority
            unoptimized
          />
      </div>

      <div className="w-full max-w-md z-10 flex flex-col gap-8">
        <div className="flex flex-col items-center">
          <Image 
            src={logoUrl}
            alt="100% Pass'Déc' Logo"
            width={200}
            height={80}
            unoptimized={true}
            className="object-contain"
          />
        </div>

        <Card className="bg-card/80 backdrop-blur-xl border-white/10 shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader className="pb-4">
            {mode === 'forgot' && (
              <button 
                onClick={() => setMode('login')}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary mb-2"
              >
                <ArrowLeft className="w-3 h-3" /> Retour
              </button>
            )}
            <CardTitle className="text-2xl font-black italic uppercase tracking-tighter text-center">
              {mode === 'login' ? 'Connexion' : mode === 'signup' ? 'Créer un compte' : 'Mot de passe oublié'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-black tracking-widest">Email</Label>
                <Input 
                  type="email" 
                  placeholder="votre.nom@gmail.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="bg-background/50 border-none ring-1 ring-white/10 focus-visible:ring-primary rounded-xl h-12"
                />
              </div>

              {mode === 'signup' && (
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-black tracking-widest text-primary">Date de naissance (+15 ans)</Label>
                  <Input 
                    type="date" 
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    disabled={isLoading}
                    className="bg-background/50 border-none ring-1 ring-primary/30 rounded-xl h-12"
                  />
                </div>
              )}

              {mode !== 'forgot' && (
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-black tracking-widest">Mot de passe</Label>
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="bg-background/50 border-none ring-1 ring-white/10 focus-visible:ring-primary rounded-xl h-12"
                  />
                </div>
              )}

              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full h-14 rounded-2xl font-black italic uppercase tracking-wider text-lg shadow-xl shadow-primary/20 mt-4"
              >
                {isLoading ? 'Action en cours...' : (mode === 'login' ? 'Entrer sur le terrain' : mode === 'signup' ? 'Signer au club' : 'Envoyer le lien')}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <button 
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              disabled={isLoading}
              className="text-[10px] font-black uppercase tracking-widest text-primary"
            >
              {mode === 'login' ? "Pas encore de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
            </button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
