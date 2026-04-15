"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Home, Search, ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"

export default function NotFoundPage() {
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
          
          <CardHeader className="text-center pt-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="mx-auto w-20 h-20 rounded-full bg-japanese-100 dark:bg-japanese-950/50 flex items-center justify-center mb-4"
            >
              <Search className="w-10 h-10 text-japanese-600 dark:text-japanese-400" />
            </motion.div>
            <CardTitle className="text-3xl font-bold">404</CardTitle>
            <CardTitle className="text-xl">Halaman Tidak Ditemukan</CardTitle>
            <CardDescription className="text-base">
              Maaf, halaman yang Anda cari tidak ada
            </CardDescription>
          </CardHeader>

          <CardContent className="text-center">
            <p className="text-muted-foreground">
              Halaman mungkin telah dipindahkan atau dihapus.
            </p>
          </CardContent>

          <CardFooter className="flex flex-col space-y-3 pb-8">
            <Link href="/" className="w-full">
              <Button className="w-full bg-gradient-to-r from-japanese-500 to-japanese-600 hover:from-japanese-600 hover:to-japanese-700">
                <Home className="mr-2 h-4 w-4" />
                Kembali ke Beranda
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Halaman Sebelumnya
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}