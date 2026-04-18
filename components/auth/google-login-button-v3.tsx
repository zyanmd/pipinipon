"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/hooks/use-auth"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { X } from "lucide-react"

interface GoogleLoginButtonProps {
  isRegister?: boolean
}

export function GoogleLoginButton({ isRegister = false }: GoogleLoginButtonProps) {
  const { loginWithGoogle, isLoading } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [popupWindow, setPopupWindow] = useState<Window | null>(null)
  const [popupMessage, setPopupMessage] = useState("")
  const [popupStep, setPopupStep] = useState<"loading" | "success" | "error">("loading")
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const initializedRef = useRef(false)

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

  // Custom popup component
  const CustomPopup = () => {
    if (!isPopupOpen) return null

    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="relative w-full max-w-sm mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {isRegister ? "Daftar dengan Google" : "Masuk dengan Google"}
              </h3>
            </div>
            <button
              onClick={closePopup}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 text-center">
            {popupStep === "loading" && (
              <>
                <div className="w-16 h-16 mx-auto mb-4">
                  <div className="w-full h-full border-4 border-gray-200 border-t-emerald-500 rounded-full animate-spin" />
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  {popupMessage || "Membuka jendela Google..."}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Pastikan popup tidak diblokir oleh browser Anda
                </p>
              </>
            )}

            {popupStep === "success" && (
              <>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  {popupMessage || "Berhasil! Mengalihkan..."}
                </p>
              </>
            )}

            {popupStep === "error" && (
              <>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <p className="text-red-600 dark:text-red-400">
                  {popupMessage || "Login gagal. Silakan coba lagi."}
                </p>
                <button
                  onClick={handleGoogleClick}
                  className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                >
                  Coba Lagi
                </button>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800 text-center">
            <p className="text-xs text-gray-400">
              Login menggunakan akun Google Anda
            </p>
          </div>
        </div>
      </div>
    )
  }

  const closePopup = () => {
    if (popupWindow && !popupWindow.closed) {
      popupWindow.close()
    }
    setIsPopupOpen(false)
    setPopupWindow(null)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const handleGoogleLogin = async () => {
    if (!clientId) {
      toast({
        title: "Konfigurasi Error",
        description: "Google Sign-In tidak dikonfigurasi.",
        variant: "destructive",
      })
      return
    }

    setIsPopupOpen(true)
    setPopupStep("loading")
    setPopupMessage("Membuka jendela Google...")

    // Load script jika belum ada
    if (typeof window !== "undefined" && !window.google) {
      const script = document.createElement("script")
      script.src = "https://accounts.google.com/gsi/client"
      script.async = true
      script.defer = true
      
      script.onload = () => {
        initializeGoogleSignIn()
      }
      
      script.onerror = () => {
        setPopupStep("error")
        setPopupMessage("Gagal memuat Google Sign-In. Periksa koneksi internet.")
      }
      
      document.body.appendChild(script)
    } else if (window.google) {
      initializeGoogleSignIn()
    } else {
      // Tunggu sebentar lalu coba lagi
      setTimeout(() => {
        if (window.google) {
          initializeGoogleSignIn()
        } else {
          setPopupStep("error")
          setPopupMessage("Gagal memuat Google Sign-In. Silakan refresh halaman.")
        }
      }, 1000)
    }
  }

  const initializeGoogleSignIn = () => {
    if (!window.google) {
      setPopupStep("error")
      setPopupMessage("Google Sign-In tidak tersedia.")
      return
    }

    if (!clientId) {
      setPopupStep("error")
      setPopupMessage("Konfigurasi Google tidak lengkap.")
      return
    }

    const handleCredentialResponse = async (response: any) => {
      const idToken = response.credential
      if (!idToken) {
        setPopupStep("error")
        setPopupMessage("Tidak ada token dari Google.")
        return
      }

      setPopupStep("loading")
      setPopupMessage("Memproses login...")

      try {
        await loginWithGoogle(idToken)
        
        setPopupStep("success")
        setPopupMessage("Berhasil login! Mengalihkan...")
        
        setTimeout(() => {
          closePopup()
          toast({
            title: isRegister ? "Pendaftaran Berhasil!" : "Login Berhasil!",
            description: isRegister 
              ? "Akun Google Anda telah terdaftar dan langsung terverifikasi." 
              : "Selamat datang kembali!",
          })
          router.push("/dashboard")
        }, 1000)
      } catch (error: any) {
        console.error("Google login error:", error)
        setPopupStep("error")
        setPopupMessage(error.response?.data?.error || "Login gagal. Silakan coba lagi.")
      }
    }

    try {
      // Pastikan clientId tidak undefined
      window.google.accounts.id.initialize({
        client_id: clientId as string, // Type assertion karena sudah dicek di atas
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
        ux_mode: "popup",
      })
      
      // Tampilkan popup Google
      window.google.accounts.id.prompt()
      
      // Set timeout untuk mendeteksi jika user membatalkan
      const timeoutId = setTimeout(() => {
        if (popupStep === "loading") {
          setPopupStep("error")
          setPopupMessage("Login dibatalkan atau timeout.")
        }
      }, 60000) // 60 detik timeout
      
      intervalRef.current = timeoutId as unknown as NodeJS.Timeout
      
    } catch (err) {
      console.error("Error initializing Google Sign-In:", err)
      setPopupStep("error")
      setPopupMessage("Gagal membuka jendela Google. Silakan coba lagi.")
    }
  }

  const handleGoogleClick = () => {
    handleGoogleLogin()
  }

  // Jika clientId tidak ada, jangan render tombol
  if (!clientId) {
    console.warn("Google Client ID not configured. Google login button hidden.")
    return null
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="w-full h-11 gap-2 border-border hover:bg-muted transition-all"
        onClick={handleGoogleClick}
        disabled={isLoading}
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        <span>{isRegister ? "Daftar dengan Google" : "Masuk dengan Google"}</span>
      </Button>

      <CustomPopup />
    </>
  )
}