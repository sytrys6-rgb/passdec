"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, useUser } from '@/firebase'
import { initiateEmailSignIn, initiateEmailSignUp } from '@/firebase/non-blocking-login'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import Image from 'next/image'
import { PlaceHolderImages } from '@/lib/placeholder-images'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const auth = useAuth()
  const { user, isUserLoading } = useUser()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (user && !isUserLoading) {
      router.push('/')
    }
  }, [user, isUserLoading, router])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Champs manquants",
        description: "Veuillez remplir tous les champs."
      })
      return
    }

    if (isLogin) {
      initiateEmailSignIn(auth, email, password)
    } else {
      initiateEmailSignUp(auth, email, password)
    }
  }

  const heroImage = PlaceHolderImages.find(img => img.id === 'football-hero')

  if (isUserLoading) return null

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
         <Image 
            src={heroImage?.imageUrl || "https://images.unsplash.com/photo-1574629810360-7efbbe195018"} 
            alt="Background" 
            fill
            className="object-cover"
          />
      </div>

      <div className="w-full max-w-md z-10 flex flex-col gap-8">
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-black uppercase tracking-tighter">
            <span className="italic text-primary">100%</span>{" "}
            <span className="text-destructive">Pass' Déc'</span>
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground">
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
                <Label className="text-[10px] uppercase font-black tracking-widest ml-1">Email</Label>
                <Input 
                  type="email" 
                  placeholder="foot@passion.fr" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background/50 border-none ring-1 ring-white/10 focus-visible:ring-primary rounded-xl h-12"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-black tracking-widest ml-1">Mot de passe</Label>
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-background/50 border-none ring-1 ring-white/10 focus-visible:ring-primary rounded-xl h-12"
                />
              </div>
              <Button type="submit" className="w-full h-14 rounded-2xl font-black italic uppercase tracking-wider text-lg shadow-xl shadow-primary/20 mt-4">
                {isLogin ? 'Entrer sur le terrain' : 'Signer au club'}
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
              className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-colors"
            >
              {isLogin ? "Pas encore de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
            </button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
