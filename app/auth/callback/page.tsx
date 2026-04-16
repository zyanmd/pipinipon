"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const accessToken = searchParams.get("access_token")
    const refreshToken = searchParams.get("refresh_token")
    const userData = searchParams.get("user")
    const errorMsg = searchParams.get("error")

    if (errorMsg) {
      setError(decodeURIComponent(errorMsg))
      setTimeout(() => router.push("/login"), 3000)
      return
    }

    if (accessToken && refreshToken) {
      localStorage.setItem("access_token", accessToken)
      localStorage.setItem("refresh_token", refreshToken)
      
      if (userData) {
        try {
          const user = JSON.parse(decodeURIComponent(userData))
          console.log("User logged in:", user)
        } catch (e) {}
      }
      
      router.push("/dashboard")
    } else {
      setError("Login failed: No token received")
      setTimeout(() => router.push("/login"), 3000)
    }
  }, [searchParams, router])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Login Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Redirecting to login page...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Processing Google Login</CardTitle>
          <CardDescription>Please wait...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    </div>
  )
}