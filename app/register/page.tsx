"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { User, Mail, Lock, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
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

export default function RegisterPage() {
  const router = useRouter()
  const { register, isLoading, user } = useAuth()
  const { toast } = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")
  const [mounted, setMounted] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    number: false,
    letter: false,
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && user) {
      router.push("/dashboard")
    }
  }, [user, router, mounted])

  const checkPasswordStrength = (password: string) => {
    setPasswordStrength({
      length: password.length >= 6,
      number: /[0-9]/.test(password),
      letter: /[a-zA-Z]/.test(password),
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.username || !formData.email || !formData.password) {
      setError("Semua field harus diisi")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Password dan konfirmasi password tidak cocok")
      return
    }

    if (formData.password.length < 6) {
      setError("Password minimal 6 karakter")
      return
    }

    try {
      await register(formData.username, formData.email, formData.password)
    } catch (err: any) {
      setError(err.response?.data?.error || "Registrasi gagal. Silakan coba lagi.")
    }
  }

  const handleGoogleRegister = async () => {
    setIsGoogleLoading(true)
    try {
      const response = await googleAPI.googleLogin()
      const authUrl = response.data.auth_url
      window.location.href = authUrl
    } catch (error: any) {
      console.error("Google register error:", error)
      toast({
        title: "Gagal",
        description: error.response?.data?.error || "Gagal mendaftar dengan Google",
        variant: "destructive",
      })
      setIsGoogleLoading(false)
    }
  }

  const isPasswordValid = passwordStrength.length && passwordStrength.number && passwordStrength.letter
  const isFormValid = isPasswordValid && formData.password === formData.confirmPassword && formData.password !== ""

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
              <User className="w-7 h-7 text-white" />
            </motion.div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-japanese-500 to-japanese-700 bg-clip-text text-transparent">
              Mulai Belajar
            </CardTitle>
            <CardDescription className="text-base">
              Buat akun Pipinipon dan mulai perjalanan belajarmu
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
                    <div className="w-4 h-4 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    </div>
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <Label htmlFor="username" className="text-foreground font-medium">Username</Label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-japanese-500 transition-colors" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="john_doe"
                    className="pl-10 bg-background border-input focus:ring-2 focus:ring-japanese-500 transition-all hover:border-japanese-300"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    disabled={isLoading}
                    autoFocus
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground font-medium">Email</Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-japanese-500 transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@example.com"
                    className="pl-10 bg-background border-input focus:ring-2 focus:ring-japanese-500 transition-all hover:border-japanese-300"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={isLoading}
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
                    className="pl-10 pr-10 bg-background border-input focus:ring-2 focus:ring-japanese-500 transition-all hover:border-japanese-300"
                    value={formData.password}
                    onChange={(e) => {
                      setFormData({ ...formData, password: e.target.value })
                      checkPasswordStrength(e.target.value)
                    }}
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

                <AnimatePresence>
                  {formData.password && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2 mt-2 p-3 rounded-lg bg-muted/30"
                    >
                      <p className="text-xs text-muted-foreground font-medium">Kekuatan password:</p>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs">
                          {passwordStrength.length ? (
                            <CheckCircle className="h-3 w-3 text-green-500" />
                          ) : (
                            <XCircle className="h-3 w-3 text-muted-foreground" />
                          )}
                          <span className={passwordStrength.length ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}>
                            Minimal 6 karakter
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          {passwordStrength.number ? (
                            <CheckCircle className="h-3 w-3 text-green-500" />
                          ) : (
                            <XCircle className="h-3 w-3 text-muted-foreground" />
                          )}
                          <span className={passwordStrength.number ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}>
                            Mengandung angka
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          {passwordStrength.letter ? (
                            <CheckCircle className="h-3 w-3 text-green-500" />
                          ) : (
                            <XCircle className="h-3 w-3 text-muted-foreground" />
                          )}
                          <span className={passwordStrength.letter ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}>
                            Mengandung huruf
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground font-medium">Konfirmasi Password</Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-japanese-500 transition-colors" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10 bg-background border-input focus:ring-2 focus:ring-japanese-500 transition-all hover:border-japanese-300"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-japanese-500 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <AnimatePresence mode="wait">
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-xs text-red-500 flex items-center gap-1"
                    >
                      <XCircle className="h-3 w-3" />
                      Password tidak cocok
                    </motion.p>
                  )}
                  {formData.confirmPassword && formData.password === formData.confirmPassword && formData.password && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-xs text-green-500 flex items-center gap-1"
                    >
                      <CheckCircle className="h-3 w-3" />
                      Password cocok
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pb-8">
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-japanese-500 to-japanese-600 hover:from-japanese-600 hover:to-japanese-700 text-white shadow-lg transition-all duration-200 h-11 text-base font-medium"
                disabled={isLoading || !isFormValid}
              >
                {isLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Mendaftar...
                  </>
                ) : (
                  "Daftar Sekarang"
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
                onClick={handleGoogleRegister}
                disabled={isGoogleLoading}
                className="w-full h-11 gap-2 border-border hover:bg-muted/50 transition-all duration-200"
              >
                {isGoogleLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-japanese-500 border-t-transparent" />
                ) : (
                  <GoogleIcon />
                )}
                <span>Daftar dengan Google</span>
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Sudah punya akun?{" "}
                <Link
                  href="/login"
                  className="text-japanese-600 hover:text-japanese-700 dark:text-japanese-400 dark:hover:text-japanese-300 font-semibold transition-colors inline-flex items-center gap-1"
                >
                  Masuk di sini
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="text-center text-xs text-muted-foreground mt-6"
        >
          Dengan mendaftar, Anda menyetujui{" "}
          <Link href="/terms" className="text-japanese-600 hover:text-japanese-700 transition-colors">Syarat & Ketentuan</Link>
          {" "}dan{" "}
          <Link href="/privacy" className="text-japanese-600 hover:text-japanese-700 transition-colors">Kebijakan Privasi</Link>
        </motion.p>
      </motion.div>
    </div>
  )
}