"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Mail, CheckCircle, AlertCircle, Loader2, Send, ArrowLeft } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/components/ui/use-toast"

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { verifyEmail, resendVerification, isLoading, user } = useAuth()
  const { toast } = useToast()
  
  const emailFromQuery = searchParams.get("email") || ""
  const [code, setCode] = useState("")
  const [email, setEmail] = useState(emailFromQuery)
  const [error, setError] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Redirect ke dashboard jika sudah login dan terverifikasi
  useEffect(() => {
    if (mounted && user && user.is_verified === 1) {
      router.push("/dashboard")
    }
  }, [user, router, mounted])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (!code || code.length !== 6) {
      setError("Kode verifikasi harus 6 digit")
      return
    }
    
    setIsVerifying(true)
    try {
      const result = await verifyEmail(code, email || undefined)
      
      if (result.success) {
        toast({
          title: "Verifikasi Berhasil!",
          description: "Email Anda telah terverifikasi. Silakan login.",
        })
        
        // Redirect ke login
        router.push("/login?verified=true")
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Verifikasi gagal")
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResendCode = async () => {
    if (!email) {
      setError("Email diperlukan untuk mengirim ulang kode")
      return
    }
    
    setIsResending(true)
    try {
      await resendVerification(email)
      toast({
        title: "Kode Dikirim!",
        description: `Kode verifikasi baru telah dikirim ke ${email}`,
      })
    } catch (err: any) {
      setError(err.response?.data?.error || "Gagal mengirim ulang kode")
    } finally {
      setIsResending(false)
    }
  }

  if (!mounted) return null

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 bg-gradient-to-br from-background via-background to-muted/20">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-japanese-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="border shadow-2xl bg-card/80 backdrop-blur-sm overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-japanese-500 via-orange-500 to-japanese-600" />
          
          <CardHeader className="space-y-1 text-center pt-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="mx-auto w-14 h-14 rounded-full bg-gradient-to-br from-japanese-500 to-japanese-600 flex items-center justify-center mb-4 shadow-lg"
            >
              <Mail className="w-7 h-7 text-white" />
            </motion.div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-japanese-500 to-japanese-700 bg-clip-text text-transparent">
              Verifikasi Email
            </CardTitle>
            <CardDescription className="text-base">
              Masukkan kode verifikasi 6 digit yang dikirim ke email Anda
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleVerify}>
            <CardContent className="space-y-5">
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, x: -20, height: 0 }}
                    animate={{ opacity: 1, x: 0, height: "auto" }}
                    exit={{ opacity: 0, x: -20, height: 0 }}
                    className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm flex items-start gap-2"
                  >
                    <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {!emailFromQuery && (
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground font-medium">Alamat Email</Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-japanese-500 transition-colors" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="nama@example.com"
                      className="pl-10 bg-background border-input focus:ring-2 focus:ring-japanese-500 transition-all hover:border-japanese-300"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isVerifying || isResending}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="code" className="text-foreground font-medium">Kode Verifikasi</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  className="text-center text-2xl tracking-widest bg-background border-input focus:ring-2 focus:ring-japanese-500 transition-all hover:border-japanese-300"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  disabled={isVerifying || isResending}
                  autoFocus
                />
                <p className="text-xs text-muted-foreground text-center">
                  Masukkan kode 6 digit yang dikirim ke {email || "email Anda"}
                </p>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={isResending || !email}
                  className="text-sm text-japanese-600 hover:text-japanese-700 dark:text-japanese-400 dark:hover:text-japanese-300 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResending ? (
                    <span className="inline-flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Mengirim...
                    </span>
                  ) : (
                    "Kirim ulang kode"
                  )}
                </button>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pb-8">
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-japanese-500 to-japanese-600 hover:from-japanese-600 hover:to-japanese-700 text-white shadow-lg transition-all duration-200 h-11 text-base font-medium"
                disabled={isVerifying || code.length !== 6}
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memverifikasi...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Verifikasi Email
                  </>
                )}
              </Button>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Sudah punya akun?{" "}
                  <Link
                    href="/login"
                    className="text-japanese-600 hover:text-japanese-700 dark:text-japanese-400 dark:hover:text-japanese-300 font-semibold transition-colors"
                  >
                    Masuk di sini
                  </Link>
                </p>
              </div>

              <div className="text-center">
                <Link
                  href="/register"
                  className="text-sm text-muted-foreground hover:text-japanese-600 transition-colors inline-flex items-center gap-1"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Kembali ke Daftar
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="text-center text-xs text-muted-foreground mt-6"
        >
          Tidak menerima kode? Periksa folder Spam atau{" "}
          <button onClick={handleResendCode} className="text-japanese-600 hover:underline">
            kirim ulang
          </button>
        </motion.p>
      </motion.div>
    </div>
  )
}