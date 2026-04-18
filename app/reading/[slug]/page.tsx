"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { readingAPI } from "@/lib/api"
import { useAuth } from "@/lib/hooks/use-auth"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { BookOpen, Eye, Search, Filter, ChevronLeft, ChevronRight, Newspaper, Clock, GraduationCap } from "lucide-react"
import { motion } from "framer-motion"
import { useToast } from "@/components/ui/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getReadingImageUrl } from "@/lib/image-helper"

export default function ReadingListPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  
  const [readings, setReadings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    per_page: 12,
    pages: 0,
    has_prev: false,
    has_next: false
  })
  
  // Filters
  const [level, setLevel] = useState<string>("")
  const [category, setCategory] = useState<string>("")
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  useEffect(() => {
    setMounted(true)
  }, [])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 500)
    return () => clearTimeout(timer)
  }, [search])

  const fetchReadings = async () => {
    setLoading(true)
    try {
      const response = await readingAPI.getAll({
        page: pagination.page,
        per_page: pagination.per_page,
        level: level || undefined,
        category: category || undefined,
        search: debouncedSearch || undefined,
        published_only: true
      })
      
      if (response.data.success) {
        setReadings(response.data.data.readings)
        setPagination(prev => ({
          ...prev,
          total: response.data.data.pagination.total,
          pages: response.data.data.pagination.pages,
          has_prev: response.data.data.pagination.has_prev,
          has_next: response.data.data.pagination.has_next
        }))
      }
    } catch (error) {
      console.error("Error fetching readings:", error)
      toast({
        title: "Error",
        description: "Gagal memuat artikel. Silakan coba lagi.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReadings()
  }, [pagination.page, level, category, debouncedSearch])

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case "N5": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
      case "N4": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
      case "N3": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
      case "N2": return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
      case "N1": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "artikel": return <Newspaper className="h-3 w-3" />
      case "cerita": return <BookOpen className="h-3 w-3" />
      default: return <Newspaper className="h-3 w-3" />
    }
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-japanese-600 to-japanese-800 text-white py-16">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Artikel Bacaan Bahasa Jepang
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
            Tingkatkan kemampuan membaca Anda dengan artikel ber-furigana dari berbagai level JLPT
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari artikel..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger className="w-[130px]">
                  <GraduationCap className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Semua Level</SelectItem>
                  <SelectItem value="N5">N5 (Pemula)</SelectItem>
                  <SelectItem value="N4">N4 (Dasar)</SelectItem>
                  <SelectItem value="N3">N3 (Menengah)</SelectItem>
                  <SelectItem value="N2">N2 (Mahir)</SelectItem>
                  <SelectItem value="N1">N1 (Lanjut)</SelectItem>
                </SelectContent>
              </Select>

              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-[130px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Semua</SelectItem>
                  <SelectItem value="artikel">Artikel</SelectItem>
                  <SelectItem value="cerita">Cerita</SelectItem>
                  <SelectItem value="berita">Berita</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Menampilkan {readings.length} dari {pagination.total} artikel
          </p>
        </div>

        {/* Reading Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-16 w-full" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : readings.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Belum Ada Artikel</h3>
            <p className="text-muted-foreground">
              Belum ada artikel yang tersedia. Silakan cek kembali nanti.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {readings.map((reading, index) => {
              const imageUrl = getReadingImageUrl(reading.thumbnail)
              return (
                <motion.div
                  key={reading.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link href={`/reading/${reading.slug}`}>
                    <Card className="h-full cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden group">
                      <div className="relative h-48 overflow-hidden bg-muted">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={reading.thumbnail_alt || reading.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-japanese-100 to-japanese-200 dark:from-japanese-900/50 dark:to-japanese-800/50 flex items-center justify-center">
                            <BookOpen className="w-12 h-12 text-japanese-400" />
                          </div>
                        )}
                        <div className="absolute top-3 left-3 flex gap-2">
                          <Badge className={getLevelColor(reading.level)}>
                            {reading.level}
                          </Badge>
                          <Badge variant="secondary" className="gap-1">
                            {getCategoryIcon(reading.category)}
                            <span className="capitalize">{reading.category}</span>
                          </Badge>
                        </div>
                        <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                          <Eye className="h-3 w-3" />
                          <span>{reading.views || 0}</span>
                        </div>
                      </div>
                      
                      <CardHeader>
                        <CardTitle className="line-clamp-2 text-xl group-hover:text-japanese-600 transition-colors">
                          {reading.title}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 text-xs">
                          <Clock className="h-3 w-3" />
                          {new Date(reading.published_at || reading.created_at).toLocaleDateString('id-ID', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent>
                        <p className="text-muted-foreground line-clamp-3 text-sm">
                          {reading.excerpt || reading.content?.replace(/<[^>]*>/g, '').substring(0, 150) + '...'}
                        </p>
                      </CardContent>
                      
                      <CardFooter>
                        <Button variant="ghost" className="w-full group-hover:bg-japanese-50 dark:group-hover:bg-japanese-950/20">
                          Baca Selengkapnya →
                        </Button>
                      </CardFooter>
                    </Card>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <Button
              variant="outline"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={!pagination.has_prev}
            >
              <ChevronLeft className="h-4 w-4" />
              Sebelumnya
            </Button>
            <div className="flex gap-1">
              {[...Array(Math.min(pagination.pages, 5))].map((_, i) => {
                let pageNum = pagination.page
                if (pagination.pages <= 5) {
                  pageNum = i + 1
                } else if (pagination.page <= 3) {
                  pageNum = i + 1
                } else if (pagination.page >= pagination.pages - 2) {
                  pageNum = pagination.pages - 4 + i
                } else {
                  pageNum = pagination.page - 2 + i
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={pagination.page === pageNum ? "japanese" : "outline"}
                    onClick={() => handlePageChange(pageNum)}
                    className="w-10"
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>
            <Button
              variant="outline"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={!pagination.has_next}
            >
              Selanjutnya
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}