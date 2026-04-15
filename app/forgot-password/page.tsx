"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Mail, ArrowLeft, CheckCircle, AlertCircle, RotateCcw, Key, Sparkles } from "lucide-react"
import { authAPI } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [canResend, setCanResend] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const startCountdown = (seconds: number) => {
    setCanResend(false)
    setCountdown(seconds)
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          setCanResend(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)

    if (!email) {
      setError("Email harus diisi")
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Email tidak valid")
      return
    }

    setIsLoading(true)

    try {
      await authAPI.forgotPassword(email)
      setSuccess(true)
      startCountdown(60)
      toast({
        title: "Kode OTP terkirim!",
        description: `Kode verifikasi 6 digit telah dikirim ke ${email}`,
      })
    } catch (err: any) {
      setError(err.response?.data?.error || "Gagal mengirim email. Silakan coba lagi.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (!canResend) return
    
    setError("")
    setIsLoading(true)

    try {
      await authAPI.forgotPassword(email)
      startCountdown(60)
      toast({
        title: "Kode OTP dikirim ulang!",
        description: "Cek email Anda untuk kode verifikasi baru",
      })
    } catch (err: any) {
      setError(err.response?.data?.error || "Gagal mengirim ulang. Silakan coba lagi.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-background via-background to-muted/20">
        <Card className="border shadow-2xl bg-card/80 backdrop-blur-sm overflow-hidden w-full max-w-md">
          <CardContent className="py-12 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-japanese-500 border-t-transparent mx-auto" />
            <p className="mt-4 text-muted-foreground">Memuat...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-background via-background to-muted/20">
      <div className="w-full max-w-md">
        <Card className="border shadow-2xl bg-card/80 backdrop-blur-sm overflow-hidden">
          {/* Top gradient bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-japanese-500 via-orange-500 to-japanese-600" />
          
          <CardHeader className="space-y-1 text-center pt-8">
            <div className="mx-auto w-14 h-14 rounded-full bg-gradient-to-br from-japanese-500 to-japanese-600 flex items-center justify-center mb-4 shadow-lg">
              <Key className="w-7 h-7 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-japanese-500 to-japanese-700 bg-clip-text text-transparent">
              Lupa Password?
            </CardTitle>
            <CardDescription className="text-base">
              Tenang, kami akan membantu Anda mereset password
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-5">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {success ? (
                <div className="p-5 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-green-700 dark:text-green-300">Kode OTP Terkirim!</p>
                      <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                        Kami telah mengirimkan kode OTP 6 digit ke
                      </p>
                      <p className="text-sm font-mono font-medium text-green-800 dark:text-green-300 mt-0.5">
                        {email}
                      </p>
                      <p className="text-xs text-muted-foreground mt-3">
                        Kode valid selama 10 menit. Silakan masukkan kode di halaman berikutnya.
                      </p>
                      
                      <div className="mt-4">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleResend}
                          disabled={!canResend || isLoading}
                          className={cn(
                            "gap-2 transition-all",
                            canResend && "hover:bg-green-50 dark:hover:bg-green-950/20"
                          )}
                        >
                          <RotateCcw className="h-3 w-3" />
                          {canResend ? "Kirim Ulang OTP" : `Kirim ulang dalam ${countdown}s`}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground font-medium">Alamat Email</Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-japanese-500 transition-colors" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="nama@example.com"
                      className={cn(
                        "pl-10 bg-background border-input focus:ring-2 focus:ring-japanese-500 transition-all",
                        "hover:border-japanese-300"
                      )}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      autoFocus
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Masukkan email yang terdaftar di akun Pipinipon Anda
                  </p>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pb-8">
              {!success ? (
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-japanese-500 to-japanese-600 hover:from-japanese-600 hover:to-japanese-700 text-white shadow-lg transition-all duration-200 h-11 text-base font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Mengirim...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Kirim Kode OTP
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={() => router.push(`/reset-password?email=${encodeURIComponent(email)}`)}
                  className="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-lg transition-all duration-200 h-11 text-base font-medium"
                >
                  <Key className="mr-2 h-4 w-4" />
                  Lanjutkan Verifikasi
                </Button>
              )}

              <div className="text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-japanese-600 transition-colors"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Kembali ke Login
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Masih ingat password?{" "}
          <Link href="/login" className="text-japanese-600 hover:text-japanese-700 font-medium transition-colors inline-flex items-center gap-1">
            Masuk sekarang
            <Sparkles className="h-3 w-3" />
          </Link>
        </p>
      </div>
    </div>
  )
}