"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Home, RefreshCw, Mail, AlertTriangle } from "lucide-react"
import { motion } from "framer-motion"

function AuthErrorContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string>("")
  const [errorDescription, setErrorDescription] = useState<string>("")

  useEffect(() => {
    const errorType = searchParams.get("error")
    const errorMsg = searchParams.get("error_description") || searchParams.get("message")
    
    switch (errorType) {
      case "access_denied":
        setError("Akses Ditolak")
        setErrorDescription("Anda menolak memberikan akses ke akun Google Anda.")
        break
      case "redirect_uri_mismatch":
        setError("URI Pengalihan Tidak Cocok")
        setErrorDescription("Konfigurasi aplikasi tidak valid. Silakan hubungi pengembang.")
        break
      case "invalid_client":
        setError("Klien Tidak Valid")
        setErrorDescription("Aplikasi tidak terdaftar dengan benar di Google.")
        break
      case "unauthorized_client":
        setError("Klien Tidak Diizinkan")
        setErrorDescription("Aplikasi tidak memiliki izin untuk login dengan Google.")
        break
      default:
        setError(errorMsg || "Login Gagal")
        setErrorDescription("Terjadi kesalahan saat menghubungkan dengan Google. Silakan coba lagi.")
    }
  }, [searchParams])

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-background via-background to-muted/20">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="border-red-200 dark:border-red-800 shadow-2xl bg-card/80 backdrop-blur-sm overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-600" />
          
          <CardHeader className="text-center pt-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="mx-auto w-20 h-20 rounded-full bg-red-100 dark:bg-red-950/50 flex items-center justify-center mb-4"
            >
              <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
            </motion.div>
            <CardTitle className="text-3xl font-bold text-red-600 dark:text-red-400">
              {error || "Login Gagal"}
            </CardTitle>
            <CardDescription className="text-base">
              {errorDescription}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6">
            <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-700 dark:text-amber-300">
                  <p className="font-medium">Tips:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Pastikan Anda menggunakan akun Google yang valid</li>
                    <li>Coba login menggunakan metode email dan password</li>
                    <li>Bersihkan cache browser Anda</li>
                    <li>Coba lagi dalam beberapa menit</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-3 pb-8">
            <Button
              onClick={() => router.push("/login")}
              className="w-full bg-gradient-to-r from-japanese-500 to-japanese-600 hover:from-japanese-600 hover:to-japanese-700"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Coba Login Lagi
            </Button>
            <Link href="/" className="w-full">
              <Button variant="outline" className="w-full">
                <Home className="mr-2 h-4 w-4" />
                Kembali ke Beranda
              </Button>
            </Link>
            <Link href="/register" className="w-full">
              <Button variant="ghost" className="w-full">
                <Mail className="mr-2 h-4 w-4" />
                Daftar dengan Email
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-japanese-500 border-t-transparent" />
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  )
}