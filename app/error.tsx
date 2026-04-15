"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Home, RefreshCw, ArrowLeft, Bug } from "lucide-react"
import { motion } from "framer-motion"

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log error ke console
    console.error("Application error:", error)
  }, [error])

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
              <Bug className="w-10 h-10 text-red-600 dark:text-red-400" />
            </motion.div>
            <CardTitle className="text-3xl font-bold text-red-600 dark:text-red-400">
              Terjadi Kesalahan
            </CardTitle>
            <CardDescription className="text-base">
              Maaf, terjadi kesalahan pada aplikasi
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400 font-mono break-all">
                {error.message || "Terjadi kesalahan yang tidak diketahui"}
              </p>
              {error.digest && (
                <p className="text-xs text-red-500 dark:text-red-500 mt-2">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Tim kami telah diberitahu tentang masalah ini. Silakan coba lagi nanti.
            </p>
          </CardContent>

          <CardFooter className="flex flex-col space-y-3 pb-8">
            <Button
              onClick={reset}
              className="w-full bg-gradient-to-r from-japanese-500 to-japanese-600 hover:from-japanese-600 hover:to-japanese-700"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Coba Lagi
            </Button>
            <Link href="/" className="w-full">
              <Button variant="outline" className="w-full">
                <Home className="mr-2 h-4 w-4" />
                Kembali ke Beranda
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}