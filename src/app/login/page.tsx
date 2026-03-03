
"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, useUser, useFirestore } from '@/firebase'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import Image from 'next/image'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
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
      router.push('/')
    }
  }, [user, isUserLoading, router])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Champs manquants",
        description: "Veuillez remplir tous les champs."
      })
      return
    }

    if (!isLogin && !dob) {
      toast({
        variant: "destructive",
        title: "Date manquante",
        description: "Veuillez indiquer votre date de naissance."
      })
      return
    }

    // Validation de l'âge (min 15 ans)
    if (!isLogin) {
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

    // Validation des domaines autorisés
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
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password)
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        const userRef = doc(db, 'users', userCredential.user.uid)
        await setDoc(userRef, {
          id: userCredential.user.uid,
          nom: email.split('@')[0],
          typeProfil: 'particulier',
          ville: 'Non renseignée',
          description: 'Nouveau membre de la team Pass\' Déc\'.',
          dateNaissance: dob,
          createdAt: serverTimestamp(),
          isActive: true,
          favoris: []
        })
      }
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Hors-jeu !",
        description: "L'adresse mail ou le mot de passe est incorrect. Veuillez vérifier vos informations."
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
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground mt-4">
            Le réseau qui fait marquer
          </p>
        </div>

        <Card className="bg-card/80 backdrop-blur-xl border-white/10 shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-black italic uppercase tracking-tighter text-center">
              {isLogin ? 'Connexion' : 'Créer un compte'}
            </CardTitle>
            <CardDescription className="text-center text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
              {isLogin ? 'Heureux de vous revoir sur le terrain' : 'Rejoignez la plus grande team de passionnés'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <Label className="text-[10px] uppercase font-black tracking-widest">Email</Label>
                  <span className="text-[8px] font-bold text-primary uppercase">Validé par la ligue</span>
                </div>
                <Input 
                  type="email" 
                  placeholder="votre.nom@gmail.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="bg-background/50 border-none ring-1 ring-white/10 focus-visible:ring-primary rounded-xl h-12"
                />
              </div>

              {!isLogin && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <Label className="text-[10px] uppercase font-black tracking-widest ml-1 text-primary">Date de naissance (+15 ans requis)</Label>
                  <Input 
                    type="date" 
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    disabled={isLoading}
                    className="bg-background/50 border-none ring-1 ring-primary/30 focus-visible:ring-primary rounded-xl h-12"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-black tracking-widest ml-1">Mot de passe</Label>
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="bg-background/50 border-none ring-1 ring-white/10 focus-visible:ring-primary rounded-xl h-12"
                />
              </div>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full h-14 rounded-2xl font-black italic uppercase tracking-wider text-lg shadow-xl shadow-primary/20 mt-4"
              >
                {isLoading ? 'Action en cours...' : (isLogin ? 'Entrer sur le terrain' : 'Signer au club')}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/5" />
              </div>
              <div className="relative flex justify-center text-xs uppercase font-bold">
                <span className="bg-transparent px-2 text-muted-foreground">OU</span>
              </div>
            </div>
            <button 
              onClick={() => setIsLogin(!isLogin)}
              disabled={isLoading}
              className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
            >
              {isLogin ? "Pas encore de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
            </button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
