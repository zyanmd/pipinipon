"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/hooks/use-auth"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface GoogleLoginButtonProps {
  isRegister?: boolean
}

export function GoogleLoginButton({ isRegister = false }: GoogleLoginButtonProps) {
  const { loginWithGoogle, isLoading } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [isGoogleReady, setIsGoogleReady] = useState(false)
  const initializedRef = useRef(false)

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

  const handleGoogleResponse = async (response: any) => {
    try {
      const idToken = response.credential
      if (!idToken) {
        throw new Error("No ID token received")
      }
      
      await loginWithGoogle(idToken)  // ← Hapus 'const result ='
      
      // Langsung sukses karena tidak ada error
      toast({
        title: isRegister ? "Pendaftaran Berhasil!" : "Login Berhasil!",
        description: isRegister 
          ? "Akun Google Anda telah terdaftar dan langsung terverifikasi." 
          : "Selamat datang kembali!",
      })
      router.push("/dashboard")
      
    } catch (error: any) {
      console.error("Google login error:", error)
      toast({
        title: "Gagal",
        description: error.response?.data?.error || "Login dengan Google gagal. Silakan coba lagi.",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    if (!clientId) {
      console.error("❌ NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set!")
      return
    }

    if (initializedRef.current) return
    initializedRef.current = true

    // Load Google script
    const script = document.createElement("script")
    script.src = "https://accounts.google.com/gsi/client"
    script.async = true
    script.defer = true
    
    script.onload = () => {
      if (typeof window !== "undefined" && window.google) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
          ux_mode: "popup",
        })
        setIsGoogleReady(true)
        console.log("✅ Google initialized with popup mode")
      }
    }
    
    script.onerror = () => {
      console.error("❌ Failed to load Google script")
    }
    
    document.body.appendChild(script)
  }, [clientId])

  const handleGoogleClick = () => {
    if (!clientId) {
      toast({
        title: "Konfigurasi Error",
        description: "Google Sign-In tidak dikonfigurasi.",
        variant: "destructive",
      })
      return
    }

    if (!isGoogleReady) {
      toast({
        title: "Memuat...",
        description: "Google Sign-In sedang dimuat, silakan tunggu.",
      })
      return
    }

    if (typeof window !== "undefined" && window.google) {
      try {
        window.google.accounts.id.prompt()
      } catch (err) {
        console.error("Error showing Google prompt:", err)
        toast({
          title: "Error",
          description: "Gagal menampilkan login Google. Silakan coba lagi.",
          variant: "destructive",
        })
      }
    }
  }

  if (!clientId) {
    return null
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full h-11 gap-2 border-border hover:bg-muted transition-all"
      onClick={handleGoogleClick}
      disabled={isLoading || !isGoogleReady}
    >
      {!isGoogleReady ? (
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-japanese-500 border-t-transparent" />
      ) : (
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
      )}
      <span>{isRegister ? "Daftar dengan Google" : "Masuk dengan Google"}</span>
    </Button>
  )
}