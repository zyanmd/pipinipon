"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { googleAPI } from "@/lib/api"
import { useAuth } from "@/lib/hooks/use-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function GoogleCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setUser } = useAuth() // Kita perlu export setUser dari AuthContext
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const code = searchParams.get("code")
    
    if (!code) {
      setError("Kode otorisasi tidak ditemukan")
      setTimeout(() => router.push("/login"), 3000)
      return
    }

    const handleGoogleCallback = async () => {
      try {
        const response = await googleAPI.googleCallback(code)
        const { access_token, refresh_token, user } = response.data
        
        // Simpan token
        localStorage.setItem("access_token", access_token)
        localStorage.setItem("refresh_token", refresh_token)
        
        // Set user ke context
        setUser(user)
        
        // Redirect ke dashboard
        router.push("/dashboard")
      } catch (err: any) {
        console.error("Google callback error:", err)
        setError(err.response?.data?.error || "Gagal login dengan Google")
        setTimeout(() => router.push("/login"), 3000)
      }
    }

    handleGoogleCallback()
  }, [searchParams, router, setUser])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Mengalihkan ke halaman login...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Memproses Login Google</CardTitle>
          <CardDescription>Mohon tunggu sebentar...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-japanese-500" />
        </CardContent>
      </Card>
    </div>
  )
}