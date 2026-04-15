"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useInView } from "react-intersection-observer"
import { vocabAPI } from "@/lib/api"
import { VocabCard } from "@/components/vocabulary/vocab-card"
import { VocabFilter } from "@/components/vocabulary/vocab-filter"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Filter, BookOpen, CheckCircle, PenTool } from "lucide-react"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/lib/hooks/use-auth"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"

export default function VocabularyPage() {
  const router = useRouter()
  const [vocab, setVocab] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [total, setTotal] = useState(0)
  const [filters, setFilters] = useState({
    search: "",
    jlpt_level: "",
    mastered_status: "all",
    kategori_id: "",
  })
  const [showFilters, setShowFilters] = useState(false)
  const [togglingIds, setTogglingIds] = useState<Set<number>>(new Set())
  
  const { user } = useAuth()
  const { ref: inViewRef, inView } = useInView()

  const fetchVocab = useCallback(async (pageNum: number, isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true)
      } else {
        setLoading(true)
      }

      let response;
      const params: any = { page: pageNum, per_page: 20 }
      
      if (user && filters.mastered_status === "mastered") {
        response = await vocabAPI.getMastered(params)
      } 
      else if (user && filters.mastered_status === "not_mastered") {
        response = await vocabAPI.getNotMastered(params)
      }
      else {
        if (filters.search) params.search = filters.search
        if (filters.jlpt_level) params.jlpt_level = filters.jlpt_level
        if (filters.kategori_id) params.kategori_id = parseInt(filters.kategori_id)
        response = await vocabAPI.getAll(params)
      }

      const newVocab = response.data.data.vocab || []
      const pagination = response.data.data.pagination

      if (isLoadMore) {
        setVocab(prev => [...prev, ...newVocab])
      } else {
        setVocab(newVocab)
      }

      setTotal(pagination.total)
      setHasMore(pageNum < pagination.pages)
    } catch (error) {
      console.error("Error fetching vocab:", error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [filters, user])

  useEffect(() => {
    setPage(1)
    fetchVocab(1, false)
  }, [filters, fetchVocab])

  useEffect(() => {
    if (inView && !loading && !loadingMore && hasMore) {
      const nextPage = page + 1
      setPage(nextPage)
      fetchVocab(nextPage, true)
    }
  }, [inView, loading, loadingMore, hasMore, page, fetchVocab])

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }))
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPage(1)
  }

  const handleToggleMastered = async (vocabId: number, mastered: boolean) => {
    if (togglingIds.has(vocabId)) return
    
    setTogglingIds(prev => new Set(prev).add(vocabId))
    
    setVocab(prev => prev.map(v => 
      v.id === vocabId ? { ...v, mastered, correct_count: mastered ? 5 : 0, wrong_count: 0 } : v
    ))

    try {
      await vocabAPI.toggleMastered(vocabId, mastered)
      
      if (filters.mastered_status !== "all") {
        setTimeout(() => {
          fetchVocab(1, false)
        }, 300)
      }
    } catch (error) {
      console.error("Error toggling mastered:", error)
      setVocab(prev => prev.map(v => 
        v.id === vocabId ? { ...v, mastered: !mastered, correct_count: mastered ? 0 : 5, wrong_count: 0 } : v
      ))
    } finally {
      setTogglingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(vocabId)
        return newSet
      })
    }
  }

  const handleResetFilters = () => {
    setFilters({
      search: "",
      jlpt_level: "",
      mastered_status: "all",
      kategori_id: "",
    })
    setShowFilters(false)
  }

  const handleStartWritingPractice = () => {
    if (filters.jlpt_level) {
      router.push(`/writing-practice?level=${filters.jlpt_level}`)
    } else {
      router.push("/writing-practice")
    }
  }

  const getWritingPracticeUrl = () => {
    if (filters.jlpt_level) {
      return `/writing-practice?level=${filters.jlpt_level}`
    }
    return "/writing-practice"
  }

  const hasActiveFilters = filters.jlpt_level !== "" || filters.mastered_status !== "all" || filters.kategori_id !== ""
  const isMasteredFilter = filters.mastered_status === "mastered"
  const isNotMasteredFilter = filters.mastered_status === "not_mastered"

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center sm:text-left"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center justify-center sm:justify-start gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-japanese-500 to-japanese-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold gradient-text">
                Kosakata Jepang
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Pelajari kosakata bahasa Jepang dari level N5 hingga N1
              </p>
            </div>
          </div>

          {/* Tombol Writing Practice */}
          {user && (
            <Link href="/writing-practice">
              <Button 
                variant="japanese" 
                className="gap-2 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <PenTool className="h-4 w-4" />
                <span>Praktek Menulis</span>
              </Button>
            </Link>
          )}
        </div>
      </motion.div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari kosakata (kanji, hiragana, atau arti)..."
            value={filters.search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
            disabled={isMasteredFilter || isNotMasteredFilter}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="sm:w-auto"
          >
            <Filter className="mr-2 h-4 w-4" />
            Filter
            {hasActiveFilters && (
              <span className="ml-2 w-2 h-2 rounded-full bg-japanese-500" />
            )}
          </Button>
          
          {/* Quick Writing Practice Button for Mobile */}
          {user && (
            <Link href="/writing-practice" className="sm:hidden">
              <Button variant="outline" className="gap-2">
                <PenTool className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <VocabFilter
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-muted-foreground">
          {isMasteredFilter ? (
            <>✨ <span className="font-medium text-green-600 dark:text-green-400">{vocab.length}</span> kosakata yang sudah dihafal</>
          ) : isNotMasteredFilter ? (
            <>📚 <span className="font-medium text-orange-600 dark:text-orange-400">{vocab.length}</span> kosakata yang belum dihafal</>
          ) : (
            <>Menampilkan <span className="font-medium text-foreground">{vocab.length}</span> dari <span className="font-medium text-foreground">{total}</span> kosakata</>
          )}
        </div>
        <div className="flex gap-2">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="text-xs"
            >
              Hapus filter
            </Button>
          )}
        </div>
      </div>

      {/* Writing Practice Banner */}
      {user && vocab.length > 0 && !isMasteredFilter && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border border-orange-200 dark:border-orange-800"
        >
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                <PenTool className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Latihan Menulis Huruf Jepang</p>
                <p className="text-sm text-muted-foreground">
                  {filters.jlpt_level 
                    ? `Praktek menulis kosakata level ${filters.jlpt_level}`
                    : "Praktek menulis kosakata yang belum dihafal"}
                </p>
              </div>
            </div>
            <Link href={getWritingPracticeUrl()}>
              <Button variant="outline" className="gap-2 border-orange-300 dark:border-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950/30">
                Mulai Latihan
                <PenTool className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      )}

      {/* Vocabulary Grid */}
      {!loading && vocab.length === 0 && !filters.search && !hasActiveFilters ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <BookOpen className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">Belum ada kosakata</h3>
          <p className="text-muted-foreground">
            Kosakata akan ditambahkan secara berkala oleh admin
          </p>
        </div>
      ) : !loading && vocab.length === 0 && isMasteredFilter ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-950/30 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h3 className="text-lg font-medium mb-2">Belum ada kosakata yang dihafal</h3>
          <p className="text-muted-foreground">
            Yuk mulai belajar dan tandai kosakata yang sudah kamu hafal!
          </p>
          <div className="flex gap-3 justify-center mt-4">
            <Button
              variant="japanese"
              onClick={() => {
                setFilters({ ...filters, mastered_status: "all" })
                setShowFilters(false)
              }}
            >
              Lihat semua kosakata
            </Button>
            <Link href="/writing-practice">
              <Button variant="outline">
                <PenTool className="mr-2 h-4 w-4" />
                Latihan Menulis
              </Button>
            </Link>
          </div>
        </div>
      ) : !loading && vocab.length === 0 && isNotMasteredFilter ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-yellow-100 dark:bg-yellow-950/30 flex items-center justify-center">
            <BookOpen className="w-10 h-10 text-yellow-500" />
          </div>
          <h3 className="text-lg font-medium mb-2">Semua kosakata sudah dihafal!</h3>
          <p className="text-muted-foreground">
            Selamat! Kamu sudah menghafal semua kosakata yang tersedia.
          </p>
          <div className="flex gap-3 justify-center mt-4">
            <Button
              variant="japanese"
              onClick={() => {
                setFilters({ ...filters, mastered_status: "all" })
                setShowFilters(false)
              }}
            >
              Lihat semua kosakata
            </Button>
            <Link href="/writing-practice">
              <Button variant="outline">
                <PenTool className="mr-2 h-4 w-4" />
                Latihan Menulis
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {vocab.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: Math.min(index * 0.03, 0.5) }}
              >
                <VocabCard
                  vocab={item}
                  onToggleMastered={user ? handleToggleMastered : undefined}
                  isToggling={togglingIds.has(item.id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-lg" />
          ))}
        </div>
      )}

      {/* Load more trigger */}
      {hasMore && !loading && vocab.length > 0 && (
        <div ref={inViewRef} className="flex justify-center py-8">
          {loadingMore && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span>Memuat lebih banyak...</span>
            </div>
          )}
        </div>
      )}

      {/* No results for search */}
      {!loading && vocab.length === 0 && filters.search && (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <Search className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">Tidak ada hasil</h3>
          <p className="text-muted-foreground">
            Tidak ditemukan kosakata yang sesuai dengan pencarian "{filters.search}"
          </p>
          <div className="flex gap-3 justify-center mt-4">
            <Button
              variant="outline"
              onClick={() => setFilters(prev => ({ ...prev, search: "" }))}
            >
              Hapus pencarian
            </Button>
            <Link href="/writing-practice">
              <Button variant="outline">
                <PenTool className="mr-2 h-4 w-4" />
                Latihan Menulis
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}