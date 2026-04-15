"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft, Key, Mail, Shield } from "lucide-react"
import { authAPI } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  
  const [mounted, setMounted] = useState(false)
  const [step, setStep] = useState<"email" | "otp" | "password">("email")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [canResend, setCanResend] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [resetToken, setResetToken] = useState("")

  // Set mounted dan inisialisasi email dari URL setelah client mount
  useEffect(() => {
    const emailFromUrl = searchParams?.get("email") || ""
    if (emailFromUrl) {
      setEmail(emailFromUrl)
      setStep("otp")
    }
    setMounted(true)
  }, [searchParams])

  // Countdown timer
  useEffect(() => {
    if (!canResend && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(prev => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (countdown === 0 && !canResend) {
      setCanResend(true)
    }
  }, [countdown, canResend])

  const startCountdown = (seconds: number) => {
    setCanResend(false)
    setCountdown(seconds)
  }

  // Step 1: Kirim OTP ke email
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

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
      setStep("otp")
      startCountdown(60)
      toast({
        title: "Kode OTP terkirim!",
        description: `Kode verifikasi 6 digit telah dikirim ke ${email}`,
      })
    } catch (err: any) {
      setError(err.response?.data?.error || "Gagal mengirim kode OTP. Silakan coba lagi.")
    } finally {
      setIsLoading(false)
    }
  }

  // Step 2: Verifikasi OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const otpCode = otp.join("")
    if (otpCode.length !== 6) {
      setError("Masukkan kode OTP 6 digit")
      return
    }

    setIsLoading(true)

    try {
      const response = await authAPI.verifyResetOtp(email, otpCode)
      setResetToken(response.data.data.reset_token)
      setStep("password")
      toast({
        title: "Kode valid!",
        description: "Silakan buat password baru Anda",
      })
    } catch (err: any) {
      setError(err.response?.data?.error || "Kode OTP tidak valid atau sudah kadaluwarsa")
    } finally {
      setIsLoading(false)
    }
  }

  // Resend OTP
  const handleResendOtp = async () => {
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
      setError(err.response?.data?.error || "Gagal mengirim ulang kode")
    } finally {
      setIsLoading(false)
    }
  }

  // Step 3: Reset password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.password) {
      setError("Password harus diisi")
      return
    }

    if (formData.password.length < 6) {
      setError("Password minimal 6 karakter")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Konfirmasi password tidak cocok")
      return
    }

    setIsLoading(true)

    try {
      await authAPI.resetPassword(resetToken, formData.password)
      setSuccess(true)
      toast({
        title: "Password berhasil diubah!",
        description: "Silakan login dengan password baru Anda",
      })
      setTimeout(() => {
        router.push("/login")
      }, 3000)
    } catch (err: any) {
      setError(err.response?.data?.error || "Gagal mereset password. Silakan coba lagi.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return
    if (!/^\d*$/.test(value)) return
    
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      prevInput?.focus()
    }
  }

  // Jangan render apa-apa sampai mounted untuk menghindari hydration mismatch
  if (!mounted) {
    return (
      <Card className="border shadow-2xl bg-card/80 backdrop-blur-sm overflow-hidden w-full max-w-md">
        <CardContent className="py-12 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-japanese-500 border-t-transparent mx-auto" />
          <p className="mt-4 text-muted-foreground">Memuat...</p>
        </CardContent>
      </Card>
    )
  }

  // ==================== STEP 1: EMAIL ====================
  if (step === "email") {
    return (
      <Card className="border shadow-2xl bg-card/80 backdrop-blur-sm overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-japanese-500 to-japanese-600" />
        
        <CardHeader className="space-y-1 text-center pt-8">
          <div className="mx-auto w-14 h-14 rounded-full bg-gradient-to-r from-japanese-500 to-japanese-600 flex items-center justify-center mb-4 shadow-lg">
            <Mail className="w-7 h-7 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-japanese-500 to-japanese-700 bg-clip-text text-transparent">
            Lupa Password?
          </CardTitle>
          <CardDescription>
            Masukkan email Anda untuk menerima kode OTP
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSendOtp}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Alamat Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@example.com"
                  className="pl-10 bg-background border-input focus:ring-2 focus:ring-japanese-500"
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
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pb-8">
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-japanese-500 to-japanese-600 hover:from-japanese-600 hover:to-japanese-700 text-white shadow-md transition-all duration-200 h-11"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Mengirim...
                </>
              ) : (
                "Kirim Kode OTP"
              )}
            </Button>

            <Link
              href="/login"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-japanese-600 transition-colors"
            >
              <ArrowLeft className="h-3 w-3" />
              Kembali ke Login
            </Link>
          </CardFooter>
        </form>
      </Card>
    )
  }

  // ==================== STEP 2: OTP VERIFICATION ====================
  if (step === "otp") {
    const otpCode = otp.join("")
    const isOtpComplete = otpCode.length === 6

    return (
      <Card className="border shadow-2xl bg-card/80 backdrop-blur-sm overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-japanese-500 to-japanese-600" />
        
        <CardHeader className="space-y-1 text-center pt-8">
          <div className="mx-auto w-14 h-14 rounded-full bg-gradient-to-r from-japanese-500 to-japanese-600 flex items-center justify-center mb-4 shadow-lg">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-japanese-500 to-japanese-700 bg-clip-text text-transparent">
            Verifikasi Kode OTP
          </CardTitle>
          <CardDescription>
            Masukkan kode 6 digit yang dikirim ke email Anda
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleVerifyOtp}>
          <CardContent className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-4">
              <Label className="text-center block text-foreground">Kode OTP</Label>
              <div className="flex justify-center gap-2 sm:gap-3">
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 sm:w-14 sm:h-14 text-center text-2xl font-bold focus:ring-2 focus:ring-japanese-500"
                    disabled={isLoading}
                    autoFocus={index === 0}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Kode dikirim ke <span className="font-medium text-foreground">{email}</span>
              </p>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={!canResend || isLoading}
                className={cn(
                  "text-sm transition-colors",
                  canResend 
                    ? "text-japanese-600 hover:text-japanese-700 dark:text-japanese-400" 
                    : "text-muted-foreground cursor-not-allowed"
                )}
              >
                {canResend ? "Kirim Ulang Kode OTP" : `Kirim ulang dalam ${countdown}s`}
              </button>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pb-8">
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-japanese-500 to-japanese-600 hover:from-japanese-600 hover:to-japanese-700 text-white shadow-md transition-all duration-200 h-11"
              disabled={isLoading || !isOtpComplete}
            >
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Memverifikasi...
                </>
              ) : (
                "Verifikasi Kode OTP"
              )}
            </Button>

            <button
              type="button"
              onClick={() => setStep("email")}
              className="text-sm text-muted-foreground hover:text-japanese-600 transition-colors"
            >
              Gunakan email lain
            </button>
          </CardFooter>
        </form>
      </Card>
    )
  }

  // ==================== STEP 3: NEW PASSWORD ====================
  return (
    <Card className="border shadow-2xl bg-card/80 backdrop-blur-sm overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500" />
      
      <CardHeader className="space-y-1 text-center pt-8">
        <div className="mx-auto w-14 h-14 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center mb-4 shadow-lg">
          <Lock className="w-7 h-7 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
          Buat Password Baru
        </CardTitle>
        <CardDescription>
          Masukkan password baru untuk akun Anda
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleResetPassword}>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 text-sm">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Password berhasil diubah!</p>
                  <p className="text-xs mt-1">
                    Mengalihkan ke halaman login...
                  </p>
                </div>
              </div>
            </div>
          )}

          {!success && (
            <>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">Password Baru</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10 bg-background border-input focus:ring-2 focus:ring-green-500"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">Minimal 6 karakter</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground">Konfirmasi Password Baru</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10 bg-background border-input focus:ring-2 focus:ring-green-500"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </>
          )}
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 pb-8">
          {!success ? (
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-md transition-all duration-200 h-11"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Memproses...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => router.push("/login")}
              className="w-full bg-gradient-to-r from-japanese-500 to-japanese-600 hover:from-japanese-600 hover:to-japanese-700 text-white shadow-md transition-all duration-200 h-11"
            >
              Kembali ke Login
            </Button>
          )}

          <Link
            href="/login"
            className="text-center text-sm text-muted-foreground hover:text-japanese-600 transition-colors"
          >
            Kembali ke Login
          </Link>
        </CardFooter>
      </form>
    </Card>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-background via-background to-muted/20">
      <div className="w-full max-w-md">
        <Suspense fallback={
          <Card className="border shadow-2xl bg-card/80 backdrop-blur-sm overflow-hidden">
            <CardContent className="py-12 text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-japanese-500 border-t-transparent mx-auto" />
              <p className="mt-4 text-muted-foreground">Memuat...</p>
            </CardContent>
          </Card>
        }>
          <ResetPasswordContent />
        </Suspense>
      </div>
    </div>
  )
}