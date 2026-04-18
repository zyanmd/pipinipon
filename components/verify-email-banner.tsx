"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Mail, AlertCircle, Send } from "lucide-react"
import { useState } from "react"
import { authAPI } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"

interface VerifyEmailBannerProps {
  email: string
}

export function VerifyEmailBanner({ email }: VerifyEmailBannerProps) {
  const { toast } = useToast()
  const [isResending, setIsResending] = useState(false)

  const handleResendCode = async () => {
    setIsResending(true)
    try {
      await authAPI.sendVerification(email)
      toast({
        title: "Kode Dikirim!",
        description: `Kode verifikasi baru telah dikirim ke ${email}`,
      })
    } catch (error: any) {
      toast({
        title: "Gagal",
        description: error.response?.data?.error || "Gagal mengirim kode verifikasi",
        variant: "destructive",
      })
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="mb-4 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/50 flex items-center justify-center">
            <Mail className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-yellow-800 dark:text-yellow-300 text-sm">
            Verifikasi Email Anda
          </h3>
          <p className="text-sm text-yellow-700 dark:text-yellow-400/80 mt-0.5">
            Email <strong>{email}</strong> belum diverifikasi. 
            Silakan verifikasi email Anda untuk mengaktifkan semua fitur.
          </p>
          <div className="flex gap-3 mt-3">
            <Link href={`/verify-email?email=${encodeURIComponent(email)}`}>
              <Button size="sm" variant="outline" className="border-yellow-300 text-yellow-700 hover:bg-yellow-50">
                Verifikasi Sekarang
              </Button>
            </Link>
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-yellow-600"
              onClick={handleResendCode}
              disabled={isResending}
            >
              <Send className="h-3 w-3 mr-1" />
              {isResending ? "Mengirim..." : "Kirim Ulang Kode"}
            </Button>
          </div>
        </div>
        <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
      </div>
    </div>
  )
}