"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    console.log("=== AUTH CALLBACK PAGE LOADED ===")
    
    const accessToken = searchParams.get("access_token")
    const refreshToken = searchParams.get("refresh_token")
    const userData = searchParams.get("user")
    const errorMsg = searchParams.get("error")

    console.log("access_token exists:", !!accessToken)
    console.log("refresh_token exists:", !!refreshToken)

    if (errorMsg) {
      console.error("Error:", errorMsg)
      router.replace("/login?error=" + encodeURIComponent(errorMsg))
      return
    }

    if (accessToken && refreshToken) {
      // Simpan token
      localStorage.setItem("access_token", accessToken)
      localStorage.setItem("refresh_token", refreshToken)
      console.log("Tokens saved")
      
      // Simpan user jika ada
      if (userData) {
        try {
          const user = JSON.parse(decodeURIComponent(userData))
          console.log("User:", user.username)
          localStorage.setItem("user", JSON.stringify(user))
        } catch (e) {
          console.error("Parse error:", e)
        }
      }
      
      // Redirect ke dashboard
      console.log("Redirecting to dashboard...")
      router.replace("/dashboard")
    } else {
      console.error("No tokens found")
      router.replace("/login?error=No tokens")
    }
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-japanese-500 border-t-transparent mx-auto mb-4" />
        <p className="text-muted-foreground">Memproses login Google...</p>
      </div>
    </div>
  )
}