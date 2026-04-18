"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Mail, Send, AlertCircle, ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"
import { useToast } from "@/components/ui/use-toast"
import { authAPI } from "@/lib/api"

export default function ResendVerificationPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

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
      setError("Format email tidak valid")
      return
    }
    
    setIsLoading(true)
    try {
      await authAPI.sendVerification(email)
      setSuccess(true)
      toast({
        title: "Kode Dikirim!",
        description: `Kode verifikasi telah dikirim ke ${email}`,
      })
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || "Gagal mengirim kode verifikasi"
      setError(errorMsg)
      toast({
        title: "Gagal",
        description: errorMsg,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 bg-gradient-to-br from-background via-background to-muted/20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Kirim Ulang Kode Verifikasi</CardTitle>
            <CardDescription>
              Masukkan email Anda untuk menerima kode verifikasi baru
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 text-red-600 text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}
              
              {success && (
                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 text-green-600 text-sm">
                  <p>✅ Kode verifikasi telah dikirim!</p>
                  <p className="text-xs mt-1">Silakan cek email Anda dan masukkan kode di halaman verifikasi.</p>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Alamat Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@example.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-3">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Mengirim...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Kirim Ulang Kode
                  </>
                )}
              </Button>
              
              {success && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push(`/verify-email?email=${encodeURIComponent(email)}`)}
                >
                  Lanjut ke Verifikasi
                </Button>
              )}
              
              <Link href="/login" className="text-sm text-muted-foreground hover:text-japanese-600 text-center">
                ← Kembali ke Login
              </Link>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  )
}