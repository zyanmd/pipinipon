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
import { BookOpen, Eye, Search, Filter, ChevronLeft, ChevronRight, Newspaper, Clock, GraduationCap, Sparkles, TrendingUp, BookMarked } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/components/ui/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getReadingImageUrl } from "@/lib/image-helper"
import { useTheme } from "@/components/providers/theme-provider"

// Komponen Reading Card gaya iOS
function ReadingCard({ reading, index, isDark }: { reading: any; index: number; isDark: boolean }) {
  const imageUrl = getReadingImageUrl(reading.thumbnail)
  
  const getLevelColor = (level: string) => {
    switch (level) {
      case "N5": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
      case "N4": return "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-400"
      case "N3": return "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
      case "N2": return "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400"
      case "N1": return "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400"
      default: return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      whileHover={{ y: -4 }}
    >
      <Link href={`/reading/${reading.slug}`}>
        <div className={`group rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer ${
          isDark 
            ? 'bg-gray-900/50 hover:bg-gray-900 border border-gray-800' 
            : 'bg-white hover:bg-gray-50 border border-gray-100 shadow-sm hover:shadow-md'
        }`}>
          {/* Thumbnail */}
          <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={reading.thumbnail_alt || reading.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <BookMarked className="w-12 h-12 text-gray-300 dark:text-gray-700" />
              </div>
            )}
            
            {/* Badges overlay */}
            <div className="absolute top-3 left-3 flex gap-2">
              <span className={`px-2 py-1 rounded-lg text-xs font-medium backdrop-blur-sm ${getLevelColor(reading.level)}`}>
                {reading.level}
              </span>
              <span className="px-2 py-1 rounded-lg text-xs font-medium bg-black/50 backdrop-blur-sm text-white capitalize">
                {reading.category}
              </span>
            </div>
            
            {/* Views counter */}
            <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/50 backdrop-blur-sm text-white text-xs">
              <Eye className="h-3 w-3" />
              <span>{reading.views?.toLocaleString() || 0}</span>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-4">
            <h3 className={`font-semibold text-base line-clamp-2 mb-1 transition-colors ${
              isDark ? 'text-white group-hover:text-emerald-400' : 'text-gray-900 group-hover:text-emerald-600'
            }`}>
              {reading.title}
            </h3>
            
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
              <Clock className="h-3 w-3" />
              <span>
                {new Date(reading.published_at || reading.created_at).toLocaleDateString('id-ID', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
              {reading.excerpt || reading.content?.replace(/<[^>]*>/g, '').substring(0, 100) + '...'}
            </p>
            
            <div className="flex items-center justify-between">
              <span className={`text-xs font-medium transition-colors ${
                isDark ? 'text-emerald-400' : 'text-emerald-600'
              }`}>
                Baca Selengkapnya
              </span>
              <ChevronRight className={`h-4 w-4 transition-transform group-hover:translate-x-1 ${
                isDark ? 'text-emerald-400' : 'text-emerald-600'
              }`} />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export default function ReadingListPage() {
  const { user } = useAuth()
  const { theme } = useTheme()
  const { toast } = useToast()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  
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

  const isDark = theme === "dark"

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
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

  if (!mounted) return null

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
      {/* iOS Style Hero Section */}
      <div className={`relative overflow-hidden ${isDark ? 'bg-gray-900' : 'bg-white'} border-b ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-sky-500/10 to-transparent rounded-full blur-3xl" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="text-center max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-sm font-medium mb-4">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Bacaan Berkualitas</span>
              </div>
              <h1 className={`text-3xl md:text-4xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Artikel Bacaan
              </h1>
              <p className={`text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Tingkatkan kemampuan membaca Anda dengan artikel ber-furigana dari berbagai level JLPT
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* iOS Style Filters */}
        <div className="sticky top-20 z-10 mb-8">
          <div className={`rounded-2xl p-4 backdrop-blur-xl ${
            isScrolled 
              ? isDark ? 'bg-gray-900/80 border border-gray-800' : 'bg-white/80 border border-gray-100 shadow-sm'
              : 'bg-transparent'
          } transition-all duration-300`}>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  <Input
                    placeholder="Cari artikel..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className={`pl-10 rounded-xl border-0 ${
                      isDark 
                        ? 'bg-gray-800 text-white placeholder:text-gray-500' 
                        : 'bg-gray-100 text-gray-900 placeholder:text-gray-400'
                    }`}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={level} onValueChange={setLevel}>
                  <SelectTrigger className={`w-[130px] rounded-xl border-0 ${
                    isDark ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'
                  }`}>
                    <GraduationCap className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Level" />
                  </SelectTrigger>
                  <SelectContent className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
                    <SelectItem value="Semua Level">Semua Level</SelectItem>
                    <SelectItem value="N5">N5 (Pemula)</SelectItem>
                    <SelectItem value="N4">N4 (Dasar)</SelectItem>
                    <SelectItem value="N3">N3 (Menengah)</SelectItem>
                    <SelectItem value="N2">N2 (Mahir)</SelectItem>
                    <SelectItem value="N1">N1 (Lanjut)</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className={`w-[130px] rounded-xl border-0 ${
                    isDark ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'
                  }`}>
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Kategori" />
                  </SelectTrigger>
                  <SelectContent className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
                    <SelectItem value="Semua">Semua</SelectItem>
                    <SelectItem value="artikel">Artikel</SelectItem>
                    <SelectItem value="cerita">Cerita</SelectItem>
                    <SelectItem value="berita">Berita</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 flex justify-between items-center">
          <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            Menampilkan {readings.length} dari {pagination.total} artikel
          </p>
        </div>

        {/* Reading Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className={`rounded-2xl overflow-hidden ${isDark ? 'bg-gray-900' : 'bg-white'} border ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
                <Skeleton className={`h-48 w-full ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`} />
                <div className="p-4">
                  <Skeleton className={`h-5 w-3/4 mb-2 ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`} />
                  <Skeleton className={`h-3 w-1/2 mb-3 ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`} />
                  <Skeleton className={`h-16 w-full ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`} />
                </div>
              </div>
            ))}
          </div>
        ) : readings.length === 0 ? (
          <div className="text-center py-16">
            <div className={`w-20 h-20 mx-auto rounded-full ${isDark ? 'bg-gray-800' : 'bg-gray-100'} flex items-center justify-center mb-4`}>
              <BookOpen className={`w-10 h-10 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Belum Ada Artikel
            </h3>
            <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              Belum ada artikel yang tersedia. Silakan cek kembali nanti.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {readings.map((reading, index) => (
              <ReadingCard key={reading.id} reading={reading} index={index} isDark={isDark} />
            ))}
          </div>
        )}

        {/* Pagination - iOS Style */}
        {pagination.pages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            <Button
              variant="outline"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={!pagination.has_prev}
              className={`rounded-xl ${isDark ? 'border-gray-800 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-50'}`}
            >
              <ChevronLeft className="h-4 w-4" />
              Sebelumnya
            </Button>
            <div className="flex gap-1.5">
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
                    variant={pagination.page === pageNum ? "default" : "outline"}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-10 rounded-xl ${
                      pagination.page === pageNum 
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700'
                        : isDark ? 'border-gray-800 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-50'
                    }`}
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
              className={`rounded-xl ${isDark ? 'border-gray-800 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-50'}`}
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