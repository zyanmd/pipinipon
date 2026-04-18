"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Head from "next/head"
import { readingAPI } from "@/lib/api"
import { useAuth } from "@/lib/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import {
  Bookmark,
  BookmarkCheck,
  Eye,
  Calendar,
  GraduationCap,
  ArrowLeft,
  CheckCircle,
  Share2,
  Check,
  Link2,
  X
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { getReadingImageUrl } from "@/lib/image-helper"

// Fungsi untuk parsing furigana (format: [text]{reading})
function parseFurigana(text: string) {
  if (!text) return text
  
  const furiganaRegex = /\[(.*?)\]{(.*?)}/g
  const parts = []
  let lastIndex = 0
  let match
  
  while ((match = furiganaRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index))
    }
    parts.push(
      <ruby key={match.index}>
        {match[1]}
        <rp>(</rp>
        <rt>{match[2]}</rt>
        <rp>)</rp>
      </ruby>
    )
    lastIndex = match.index + match[0].length
  }
  
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex))
  }
  
  return parts
}

// Komponen Share Modal
function ShareModal({ isOpen, onClose, url, title }: { isOpen: boolean; onClose: () => void; url: string; title: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Bagikan Artikel</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Salin link artikel ini untuk dibagikan ke teman-temanmu
        </p>

        <div className="relative">
          <div className="flex items-center gap-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-xl">
            <input
              type="text"
              value={url}
              readOnly
              className="flex-1 bg-transparent text-sm text-gray-600 dark:text-gray-400 px-2 outline-none"
            />
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-medium hover:from-emerald-600 hover:to-emerald-700 transition-all"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>Tersalin!</span>
                </>
              ) : (
                <>
                  <Link2 className="h-4 w-4" />
                  <span>Salin Link</span>
                </>
              )}
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-500 text-center mt-4">
          Bagikan ke WhatsApp, Telegram, atau media sosial lainnya
        </p>
      </div>
    </div>
  )
}

export default function ReadingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const contentRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null)
  const [hasReached100, setHasReached100] = useState(false)
  
  const [reading, setReading] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [progress, setProgress] = useState({ last_position: 0, progress_percent: 0, completed: false })
  const [showShareModal, setShowShareModal] = useState(false)
  const [initialLoadDone, setInitialLoadDone] = useState(false)

  const slug = params.slug as string
  const [shareUrl, setShareUrl] = useState('')
  const [fullImageUrl, setFullImageUrl] = useState<string>('')
  const [siteUrl, setSiteUrl] = useState('https://pipinipon.site')

  useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined') {
      setShareUrl(window.location.href)
      setSiteUrl(window.location.origin)
    }
  }, [])

  const fetchReading = async () => {
    setLoading(true)
    try {
      const response = await readingAPI.getBySlug(slug)
      if (response.data.success) {
        const data = response.data.data
        setReading(data)
        setIsBookmarked(data.is_bookmarked || false)
        
        // Set full image URL for OG image
        if (data.thumbnail) {
          const imgUrl = getReadingImageUrl(data.thumbnail)
          setFullImageUrl(imgUrl || '')
        }
        
        if (data.progress) {
          const isCompleted = data.progress.completed || false
          setProgress({
            last_position: data.progress.last_position || 0,
            progress_percent: data.progress.progress_percent || 0,
            completed: isCompleted
          })
          setHasReached100(isCompleted)
        }
      }
    } catch (error) {
      console.error("Error fetching reading:", error)
      toast({
        title: "Error",
        description: "Gagal memuat artikel. Silakan coba lagi.",
        variant: "destructive",
      })
      router.push("/reading")
    } finally {
      setLoading(false)
      setInitialLoadDone(true)
    }
  }

  useEffect(() => {
    if (slug) {
      fetchReading()
    }
  }, [slug])

  // Fungsi untuk menghitung progress berdasarkan scroll
  const calculateScrollProgress = useCallback(() => {
    const windowHeight = window.innerHeight
    const documentHeight = document.documentElement.scrollHeight
    const scrollTop = window.scrollY
    
    const maxScroll = documentHeight - windowHeight
    let percent = 0
    
    if (maxScroll > 0) {
      percent = (scrollTop / maxScroll) * 100
      percent = Math.min(Math.max(percent, 0), 100)
    }
    
    return {
      percent: Math.floor(percent),
      scrollTop: Math.floor(scrollTop)
    }
  }, [])

  // Fungsi untuk menyimpan progress ke backend
  const saveProgress = useCallback(async (percent: number, scrollTop: number, isCompleted: boolean) => {
    if (!reading || !user) return
    
    try {
      await readingAPI.updateProgress(reading.id, {
        last_position: scrollTop,
        completed: isCompleted
      })
      console.log(`Progress saved: ${percent}%, completed: ${isCompleted}`)
    } catch (error) {
      console.error("Failed to save progress:", error)
    }
  }, [reading, user])

  // Handle scroll event dengan debounce - TANPA AUTO SCROLL
  useEffect(() => {
    if (!reading || !user || !mounted || !initialLoadDone) return

    const handleScroll = () => {
      const { percent, scrollTop } = calculateScrollProgress()
      
      let finalPercent = percent
      let isCompleted = progress.completed || hasReached100 || percent >= 95
      
      if (hasReached100) {
        finalPercent = 100
        isCompleted = true
      } else if (percent >= 95) {
        finalPercent = 100
        isCompleted = true
        setHasReached100(true)
      } else {
        finalPercent = Math.max(percent, progress.progress_percent)
        isCompleted = false
      }
      
      if (finalPercent !== progress.progress_percent || isCompleted !== progress.completed) {
        setProgress(prev => ({
          ...prev,
          progress_percent: finalPercent,
          last_position: scrollTop,
          completed: isCompleted
        }))
      }
      
      if (saveTimeout) {
        clearTimeout(saveTimeout)
      }
      
      const timeout = setTimeout(() => {
        saveProgress(finalPercent, scrollTop, isCompleted)
      }, 2000)
      
      setSaveTimeout(timeout)
    }

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
      if (saveTimeout) {
        clearTimeout(saveTimeout)
      }
    }
  }, [reading, user, mounted, initialLoadDone, calculateScrollProgress, saveProgress, saveTimeout, progress.progress_percent, progress.completed, hasReached100])

  const handleBookmark = async () => {
    if (!user) {
      toast({
        title: "Login Diperlukan",
        description: "Silakan login untuk menyimpan bookmark.",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    try {
      if (isBookmarked) {
        const bookmarksRes = await readingAPI.getBookmarks()
        const bookmark = bookmarksRes.data.data.find((b: any) => b.reading_id === reading.id)
        if (bookmark) {
          await readingAPI.removeBookmark(bookmark.id)
        }
        setIsBookmarked(false)
        toast({ title: "Bookmark dihapus", description: "Artikel dihapus dari bookmark" })
      } else {
        await readingAPI.addBookmark(reading.id)
        setIsBookmarked(true)
        toast({ title: "Bookmark ditambahkan", description: "Artikel disimpan ke bookmark" })
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error)
      toast({
        title: "Error",
        description: "Gagal menyimpan bookmark. Silakan coba lagi.",
        variant: "destructive",
      })
    }
  }

  const handleShare = () => {
    setShowShareModal(true)
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

  // Get clean description for meta tags
  const getCleanDescription = () => {
    if (reading?.excerpt) return reading.excerpt
    if (reading?.content) {
      const cleanText = reading.content.replace(/<[^>]*>/g, '').substring(0, 160)
      return cleanText
    }
    return "Baca artikel menarik tentang bahasa Jepang di Pipinipon"
  }

  // Get clean title for meta tags
  const getCleanTitle = () => {
    return `${reading?.title || "Artikel"} | Pipinipon - Belajar Bahasa Jepang`
  }

  // Get absolute image URL
  const getAbsoluteImageUrl = () => {
    if (fullImageUrl) return fullImageUrl
    if (reading?.thumbnail) {
      const imgUrl = getReadingImageUrl(reading.thumbnail)
      if (imgUrl && imgUrl.startsWith('http')) return imgUrl
      if (imgUrl) return `${siteUrl}${imgUrl}`
    }
    return `${siteUrl}/og-image.jpg`
  }

  // JSON-LD Schema untuk SEO
  const jsonLdSchema = reading ? {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": reading.title,
    "description": getCleanDescription(),
    "image": getAbsoluteImageUrl(),
    "datePublished": reading.published_at || reading.created_at,
    "dateModified": reading.updated_at || reading.published_at || reading.created_at,
    "author": {
      "@type": "Person",
      "name": reading.author_name || "Pipinipon",
      "url": siteUrl
    },
    "publisher": {
      "@type": "Organization",
      "name": "Pipinipon",
      "logo": {
        "@type": "ImageObject",
        "url": `${siteUrl}/logo.png`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": shareUrl
    },
    "keywords": `belajar bahasa jepang, ${reading.level}, membaca bahasa jepang, furigana, ${reading.category}`,
    "educationalLevel": reading.level,
    "inLanguage": "id",
    "about": {
      "@type": "Thing",
      "name": "Bahasa Jepang"
    }
  } : null

  // Social media share URLs
  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(reading?.title || '')}&url=${encodeURIComponent(shareUrl)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${reading?.title || ''} - ${shareUrl}`)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(reading?.title || '')}`,
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(reading?.title || '')}`,
  }

  if (!mounted || loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Skeleton className="h-8 w-32 mb-4" />
        <Skeleton className="h-12 w-3/4 mb-4" />
        <div className="flex gap-4 mb-8">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-20" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!reading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Artikel Tidak Ditemukan</h1>
        <Button onClick={() => router.push("/reading")}>Kembali ke Daftar Artikel</Button>
      </div>
    )
  }

  const imageUrl = getReadingImageUrl(reading.thumbnail)
  const isCompleted = progress.completed || hasReached100
  const cleanDescription = getCleanDescription()
  const cleanTitle = getCleanTitle()
  const absoluteImageUrl = getAbsoluteImageUrl()

  return (
    <>
      <Head>
        {/* Basic Meta Tags */}
        <title>{cleanTitle}</title>
        <meta name="description" content={cleanDescription} />
        <meta name="keywords" content={`belajar bahasa jepang, ${reading.level}, membaca bahasa jepang, furigana, ${reading.category}`} />
        <meta name="author" content={reading.author_name || "Pipinipon"} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={shareUrl} />
        <meta property="og:title" content={reading.title} />
        <meta property="og:description" content={cleanDescription} />
        <meta property="og:image" content={absoluteImageUrl} />
        <meta property="og:image:secure_url" content={absoluteImageUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={reading.thumbnail_alt || reading.title} />
        <meta property="og:site_name" content="Pipinipon" />
        <meta property="og:locale" content="id_ID" />
        <meta property="article:published_time" content={reading.published_at || reading.created_at} />
        <meta property="article:modified_time" content={reading.updated_at || reading.published_at || reading.created_at} />
        <meta property="article:author" content={reading.author_name || "Pipinipon"} />
        <meta property="article:section" content={reading.category} />
        <meta property="article:tag" content={`${reading.level}, ${reading.category}, belajar bahasa jepang`} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={shareUrl} />
        <meta name="twitter:title" content={reading.title} />
        <meta name="twitter:description" content={cleanDescription} />
        <meta name="twitter:image" content={absoluteImageUrl} />
        <meta name="twitter:image:alt" content={reading.thumbnail_alt || reading.title} />
        <meta name="twitter:site" content="@pipinipon" />
        <meta name="twitter:creator" content="@pipinipon" />
        
        {/* WhatsApp specific (uses Open Graph) */}
        {/* Telegram specific (uses Open Graph) */}
        {/* LinkedIn specific (uses Open Graph) */}
        
        {/* Additional meta tags */}
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <link rel="canonical" href={shareUrl} />
        
        {/* Pinterest */}
        <meta name="pinterest-rich-pin" content="true" />
      </Head>

      {/* JSON-LD Schema */}
      {jsonLdSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
        />
      )}

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        url={shareUrl}
        title={reading.title}
      />

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        {/* Progress Bar - sticky top */}
        <div className="sticky top-0 left-0 right-0 z-50">
          <Progress value={progress.progress_percent} className="h-1 rounded-none" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => router.push("/reading")}
            className="mb-6 -ml-3"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>

          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-3 mb-4">
              <Badge className={getLevelColor(reading.level)}>
                <GraduationCap className="h-3 w-3 mr-1" />
                {reading.level}
              </Badge>
              <Badge variant="secondary" className="capitalize">
                {reading.category}
              </Badge>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Eye className="h-4 w-4" />
                <span>{reading.views} dilihat</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  {new Date(reading.published_at || reading.created_at).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-4">{reading.title}</h1>
            
            {reading.author_name && (
              <p className="text-muted-foreground">
                Oleh: {reading.author_name}
              </p>
            )}
          </div>

          {/* Thumbnail */}
          {imageUrl && (
            <div className="relative h-64 md:h-96 w-full mb-8 rounded-lg overflow-hidden bg-muted">
              <img
                src={imageUrl}
                alt={reading.thumbnail_alt || reading.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                }}
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 mb-8">
            <Button
              variant={isBookmarked ? "japanese" : "outline"}
              onClick={handleBookmark}
            >
              {isBookmarked ? (
                <BookmarkCheck className="h-4 w-4 mr-2" />
              ) : (
                <Bookmark className="h-4 w-4 mr-2" />
              )}
              {isBookmarked ? "Tersimpan" : "Simpan"}
            </Button>
            
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Bagikan
            </Button>
          </div>

          {/* Reading Progress Indicator Card */}
          <div className="mb-6 p-4 bg-muted/30 rounded-lg">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">Progress Membaca</span>
              <span className="font-bold text-japanese-600">{progress.progress_percent}%</span>
            </div>
            <Progress value={progress.progress_percent} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>Mulai</span>
              <span>Scroll ke bawah →</span>
              <span>Selesai</span>
            </div>
            {isCompleted && (
              <p className="text-sm text-green-600 mt-3 flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                ✅ Selamat! Anda telah menyelesaikan artikel ini.
              </p>
            )}
            {!isCompleted && progress.progress_percent > 0 && (
              <p className="text-xs text-muted-foreground mt-3">
                Lanjutkan membaca untuk meningkatkan progress Anda
              </p>
            )}
            {!isCompleted && progress.progress_percent === 0 && (
              <p className="text-xs text-muted-foreground mt-3">
                Mulai scroll ke bawah untuk mencatat progress membaca Anda
              </p>
            )}
          </div>

          {/* Content with Furigana */}
          <div 
            ref={contentRef}
            className="prose prose-lg dark:prose-invert max-w-none"
          >
            {reading.content?.split('\n').map((paragraph: string, idx: number) => (
              <p key={idx} className="mb-4 leading-relaxed">
                {parseFurigana(paragraph)}
              </p>
            ))}
          </div>

          {/* Social Share Buttons */}
          <div className="mt-8 pt-6 border-t">
            <h3 className="text-lg font-semibold mb-4">Bagikan ke Media Sosial</h3>
            <div className="flex flex-wrap gap-3">
              <a
                href={shareUrls.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-[#1877F2] text-white rounded-lg hover:bg-[#1664d8] transition-colors text-sm font-medium"
              >
                Facebook
              </a>
              <a
                href={shareUrls.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
              >
                Twitter
              </a>
              <a
                href={shareUrls.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-[#25D366] text-white rounded-lg hover:bg-[#20b859] transition-colors text-sm font-medium"
              >
                WhatsApp
              </a>
              <a
                href={shareUrls.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-[#0088cc] text-white rounded-lg hover:bg-[#0077b3] transition-colors text-sm font-medium"
              >
                Telegram
              </a>
              <a
                href={shareUrls.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-[#0A66C2] text-white rounded-lg hover:bg-[#0955a3] transition-colors text-sm font-medium"
              >
                LinkedIn
              </a>
            </div>
          </div>

          {/* Footer Navigation */}
          <div className="mt-8 pt-8 border-t">
            <Button onClick={() => router.push("/reading")} variant="outline" className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali ke Daftar Artikel
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}