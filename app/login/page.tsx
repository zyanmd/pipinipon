"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Mail, Lock, LogIn, Eye, EyeOff, AlertCircle, Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { googleAPI } from "@/lib/api"

const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoading, user } = useAuth()
  const { toast } = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [mounted, setMounted] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && user) {
      router.push("/dashboard")
    }
  }, [user, router, mounted])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.email || !formData.password) {
      setError("Email dan password harus diisi")
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError("Format email tidak valid")
      return
    }

    try {
      await login(formData.email, formData.password)
    } catch (err: any) {
      setError(err.response?.data?.error || "Login gagal. Periksa email dan password Anda.")
    }
  }

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true)
    try {
      // Panggil API backend untuk dapat URL login Google
      const response = await googleAPI.googleLogin()
      const authUrl = response.data.auth_url
      // Redirect ke halaman Google login
      window.location.href = authUrl
    } catch (error: any) {
      console.error("Google login error:", error)
      toast({
        title: "Gagal",
        description: error.response?.data?.error || "Gagal terhubung dengan Google",
        variant: "destructive",
      })
      setIsGoogleLoading(false)
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-background via-background to-muted/20">
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
              <LogIn className="w-7 h-7 text-white" />
            </motion.div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-japanese-500 to-japanese-700 bg-clip-text text-transparent">
              Selamat Datang
            </CardTitle>
            <CardDescription className="text-base">
              Masuk ke akun Pipinipon Anda
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
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
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={isLoading}
                    autoFocus
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground font-medium">Password</Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-japanese-500 transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={cn(
                      "pl-10 pr-10 bg-background border-input focus:ring-2 focus:ring-japanese-500 transition-all",
                      "hover:border-japanese-300"
                    )}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-japanese-500 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end">
                <Link
                  href="/forgot-password"
                  className="text-sm text-japanese-600 hover:text-japanese-700 dark:text-japanese-400 dark:hover:text-japanese-300 transition-colors font-medium"
                >
                  Lupa password?
                </Link>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pb-8">
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-japanese-500 to-japanese-600 hover:from-japanese-600 hover:to-japanese-700 text-white shadow-lg transition-all duration-200 h-11 text-base font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Masuk
                  </>
                )}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">atau</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleLogin}
                disabled={isGoogleLoading}
                className="w-full h-11 gap-2 border-border hover:bg-muted/50 transition-all duration-200"
              >
                {isGoogleLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-japanese-500 border-t-transparent" />
                ) : (
                  <GoogleIcon />
                )}
                <span>Masuk dengan Google</span>
              </Button>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Belum punya akun?{" "}
                  <Link
                    href="/register"
                    className="text-japanese-600 hover:text-japanese-700 dark:text-japanese-400 dark:hover:text-japanese-300 font-semibold transition-colors inline-flex items-center gap-1"
                  >
                    Daftar sekarang
                    <Sparkles className="h-3 w-3" />
                  </Link>
                </p>
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
          Dengan masuk, Anda menyetujui{" "}
          <Link href="/terms" className="hover:text-japanese-600 transition-colors">Syarat & Ketentuan</Link>
          {" "}dan{" "}
          <Link href="/privacy" className="hover:text-japanese-600 transition-colors">Kebijakan Privasi</Link>
        </motion.p>
      </motion.div>
    </div>
  )
}