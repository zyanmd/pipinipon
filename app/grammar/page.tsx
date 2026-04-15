"use client"

import { useState, useEffect, useCallback } from "react"
import { useInView } from "react-intersection-observer"
import { grammarAPI } from "@/lib/api"
import { GrammarCard } from "@/components/grammar/grammar-card"
import { GrammarFilter } from "@/components/grammar/grammar-filter"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Filter, BookOpen } from "lucide-react"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/lib/hooks/use-auth"

export default function GrammarPage() {
  const [grammar, setGrammar] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [total, setTotal] = useState(0)
  const [filters, setFilters] = useState({
    search: "",
    level: "",
    category: "",
  })
  const [showFilters, setShowFilters] = useState(false)
  const [categories, setCategories] = useState<string[]>([])
  
  const { user } = useAuth()
  const { ref: inViewRef, inView } = useInView()

  // Fetch categories for filter
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await grammarAPI.getAll({ per_page: 100 })
        const grammarList = response.data.data.grammar || []
        // Perbaikan: menggunakan reduce untuk mengumpulkan kategori unik
        const uniqueCategories = grammarList.reduce((acc: string[], item: any) => {
          if (item.category && typeof item.category === 'string' && !acc.includes(item.category)) {
            acc.push(item.category)
          }
          return acc
        }, [])
        setCategories(uniqueCategories)
      } catch (error) {
        console.error("Error fetching categories:", error)
      }
    }
    fetchCategories()
  }, [])

  const fetchGrammar = useCallback(async (pageNum: number, isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true)
      } else {
        setLoading(true)
      }

      const params: any = {
        page: pageNum,
        per_page: 20,
      }
      
      if (filters.search) params.search = filters.search
      if (filters.level) params.level = filters.level
      if (filters.category) params.category = filters.category

      const response = await grammarAPI.getAll(params)
      const newGrammar = response.data.data.grammar || []
      const pagination = response.data.data.pagination

      if (isLoadMore) {
        setGrammar(prev => [...prev, ...newGrammar])
      } else {
        setGrammar(newGrammar)
      }

      setTotal(pagination.total)
      setHasMore(pageNum < pagination.pages)
    } catch (error) {
      console.error("Error fetching grammar:", error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [filters])

  useEffect(() => {
    setPage(1)
    setGrammar([])
    fetchGrammar(1, false)
  }, [filters, fetchGrammar])

  useEffect(() => {
    if (inView && !loading && !loadingMore && hasMore) {
      const nextPage = page + 1
      setPage(nextPage)
      fetchGrammar(nextPage, true)
    }
  }, [inView, loading, loadingMore, hasMore, page, fetchGrammar])

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }))
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleResetFilters = () => {
    setFilters({
      search: "",
      level: "",
      category: "",
    })
    setShowFilters(false)
  }

  const hasActiveFilters = filters.level !== "" || filters.category !== ""

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center sm:text-left"
      >
        <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold gradient-text">
            Tata Bahasa Jepang
          </h1>
        </div>
        <p className="text-muted-foreground">
          Pelajari pola kalimat dan tata bahasa Jepang dari level N5 hingga N1
        </p>
      </motion.div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari tata bahasa (pola, arti, atau penjelasan)..."
            value={filters.search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="sm:w-auto"
        >
          <Filter className="mr-2 h-4 w-4" />
          Filter
          {hasActiveFilters && (
            <span className="ml-2 w-2 h-2 rounded-full bg-green-500" />
          )}
        </Button>
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
            <GrammarFilter
              filters={filters}
              categories={categories}
              onFilterChange={handleFilterChange}
              onReset={handleResetFilters}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-muted-foreground">
          Menampilkan <span className="font-medium text-foreground">{grammar.length}</span> dari{" "}
          <span className="font-medium text-foreground">{total}</span> materi
        </div>
        {grammar.length > 0 && (
          <div className="text-xs text-muted-foreground">
            {Math.ceil((grammar.length / total) * 100)}% ditampilkan
          </div>
        )}
      </div>

      {/* Grammar Grid */}
      {!loading && grammar.length === 0 && !filters.search && !hasActiveFilters ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <BookOpen className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">Belum ada materi tata bahasa</h3>
          <p className="text-muted-foreground">
            Materi tata bahasa akan ditambahkan secara berkala oleh admin
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {grammar.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: Math.min(index * 0.03, 0.5) }}
              >
                <GrammarCard grammar={item} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-80 rounded-lg" />
          ))}
        </div>
      )}

      {/* Load more trigger */}
      {hasMore && !loading && grammar.length > 0 && (
        <div ref={inViewRef} className="flex justify-center py-8">
          {loadingMore && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span>Memuat lebih banyak...</span>
            </div>
          )}
        </div>
      )}

      {/* No results */}
      {!loading && grammar.length === 0 && (filters.search || hasActiveFilters) && (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <Search className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">Tidak ada hasil</h3>
          <p className="text-muted-foreground">
            Tidak ditemukan materi tata bahasa yang sesuai dengan pencarian Anda
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={handleResetFilters}
          >
            Hapus filter
          </Button>
        </div>
      )}
    </div>
  )
}