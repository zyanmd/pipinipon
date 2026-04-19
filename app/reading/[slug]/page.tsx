"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Head from "next/head"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
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
  X,
  ZoomIn,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { getReadingImageUrl } from "@/lib/image-helper"
import { useTheme } from "@/components/providers/theme-provider"

// ─── Share Modal ──────────────────────────────────────────────────────────────
function ShareModal({
  isOpen,
  onClose,
  url,
  title,
}: {
  isOpen: boolean
  onClose: () => void
  url: string
  title: string
}) {
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
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Salin link artikel ini untuk dibagikan ke teman-temanmu
        </p>

        <div className="flex items-center gap-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-xl">
          <input
            type="text"
            value={url}
            readOnly
            className="flex-1 bg-transparent text-sm text-gray-600 dark:text-gray-300 px-2 outline-none"
          />
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-medium hover:from-emerald-600 hover:to-emerald-700 transition-all shrink-0"
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

        <p className="text-xs text-gray-500 dark:text-gray-500 text-center mt-4">
          Bagikan ke WhatsApp, Telegram, atau media sosial lainnya
        </p>
      </div>
    </div>
  )
}

// ─── Lightbox Modal ───────────────────────────────────────────────────────────
function LightboxModal({
  isOpen,
  onClose,
  src,
  alt,
}: {
  isOpen: boolean
  onClose: () => void
  src: string
  alt: string
}) {
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
        aria-label="Tutup"
      >
        <X className="h-6 w-6" />
      </button>
      <img
        src={src}
        alt={alt}
        className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  )
}

// ─── Markdown Content ─────────────────────────────────────────────────────────
function MarkdownContent({ content }: { content: string }) {
  const processedContent = content.replace(/\[(.*?)\]{(.*?)}/g, (_, text, reading) => {
    return `<ruby>${text}<rp>(</rp><rt>${reading}</rt><rp>)</rp></ruby>`
  })

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      components={{
        ruby: ({ children, ...props }) => <ruby {...props}>{children}</ruby>,
        rt: ({ children, ...props }) => <rt {...props}>{children}</rt>,

        h1: ({ children, ...props }) => (
          <h1
            className="text-3xl md:text-4xl font-bold mt-8 mb-4 pb-2 border-b border-gray-200 dark:border-gray-700"
            style={{ color: "var(--reading-heading)" }}
            {...props}
          >
            {children}
          </h1>
        ),
        h2: ({ children, ...props }) => (
          <h2
            className="text-2xl md:text-3xl font-semibold mt-6 mb-3"
            style={{ color: "var(--reading-heading)" }}
            {...props}
          >
            {children}
          </h2>
        ),
        h3: ({ children, ...props }) => (
          <h3
            className="text-xl md:text-2xl font-semibold mt-5 mb-2"
            style={{ color: "var(--reading-heading)" }}
            {...props}
          >
            {children}
          </h3>
        ),
        h4: ({ children, ...props }) => (
          <h4
            className="text-lg md:text-xl font-semibold mt-4 mb-2"
            style={{ color: "var(--reading-heading)" }}
            {...props}
          >
            {children}
          </h4>
        ),
        p: ({ children, ...props }) => (
          <p
            className="mb-4 leading-relaxed"
            style={{ color: "var(--reading-body)" }}
            {...props}
          >
            {children}
          </p>
        ),
        ul: ({ children, ...props }) => (
          <ul
            className="list-disc list-inside mb-4 space-y-1"
            style={{ color: "var(--reading-body)" }}
            {...props}
          >
            {children}
          </ul>
        ),
        ol: ({ children, ...props }) => (
          <ol
            className="list-decimal list-inside mb-4 space-y-1"
            style={{ color: "var(--reading-body)" }}
            {...props}
          >
            {children}
          </ol>
        ),
        li: ({ children, ...props }) => (
          <li className="ml-4" style={{ color: "var(--reading-body)" }} {...props}>
            {children}
          </li>
        ),
        blockquote: ({ children, ...props }) => (
          <blockquote
            className="border-l-4 border-emerald-500 pl-4 py-2 my-4 rounded-r-lg italic"
            style={{
              backgroundColor: "var(--reading-quote-bg)",
              color: "var(--reading-quote-text)",
            }}
            {...props}
          >
            {children}
          </blockquote>
        ),
        code: ({ children, className, ...props }) => {
          const match = /language-(\w+)/.exec(className || "")
          const language = match ? match[1] : ""
          const isInline = !className

          if (!isInline) {
            return (
              <div className="rounded-lg my-4 overflow-hidden">
                {language && (
                  <div className="bg-gray-800 dark:bg-gray-700 px-4 py-2 text-xs text-gray-300 border-b border-gray-700">
                    {language}
                  </div>
                )}
                <pre className="bg-gray-900 p-4 overflow-x-auto text-sm">
                  <code className="text-gray-200 font-mono" {...props}>
                    {children}
                  </code>
                </pre>
              </div>
            )
          }

          return (
            <code
              className="px-1.5 py-0.5 rounded text-sm font-mono"
              style={{
                backgroundColor: "var(--reading-code-bg)",
                color: "var(--reading-code-text)",
              }}
              {...props}
            >
              {children}
            </code>
          )
        },
        table: ({ children, ...props }) => (
          <div className="overflow-x-auto my-4">
            <table
              className="min-w-full border-collapse"
              style={{ borderColor: "var(--reading-border)" }}
              {...props}
            >
              {children}
            </table>
          </div>
        ),
        th: ({ children, ...props }) => (
          <th
            className="px-4 py-2 font-semibold text-left border"
            style={{
              borderColor: "var(--reading-border)",
              backgroundColor: "var(--reading-th-bg)",
              color: "var(--reading-heading)",
            }}
            {...props}
          >
            {children}
          </th>
        ),
        td: ({ children, ...props }) => (
          <td
            className="px-4 py-2 border"
            style={{
              borderColor: "var(--reading-border)",
              color: "var(--reading-body)",
            }}
            {...props}
          >
            {children}
          </td>
        ),
        a: ({ children, href, ...props }) => (
          <a
            href={href}
            className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 underline"
            target="_blank"
            rel="noopener noreferrer"
            {...props}
          >
            {children}
          </a>
        ),
        img: ({ src, alt, ...props }) => (
          <img
            src={src}
            alt={alt}
            className="max-w-full h-auto rounded-lg my-4 shadow-md"
            loading="lazy"
            {...props}
          />
        ),
        hr: () => (
          <hr
            className="my-8 border-t"
            style={{ borderColor: "var(--reading-border)" }}
          />
        ),
      }}
    >
      {processedContent}
    </ReactMarkdown>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ReadingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { theme } = useTheme()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null)
  const [hasReached100, setHasReached100] = useState(false)

  const [reading, setReading] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [progress, setProgress] = useState({ last_position: 0, progress_percent: 0, completed: false })
  const [showShareModal, setShowShareModal] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [initialLoadDone, setInitialLoadDone] = useState(false)

  const slug = params.slug as string
  const [shareUrl, setShareUrl] = useState("")
  const [fullImageUrl, setFullImageUrl] = useState<string>("")
  const [siteUrl, setSiteUrl] = useState("https://pipinipon.site")

  const isDark = mounted ? theme === "dark" : false

  // ── CSS variables untuk warna tema ──────────────────────────────────────────
  const themeVars = isDark
    ? {
        "--reading-heading": "#f9fafb",       // gray-50
        "--reading-body": "#d1d5db",           // gray-300
        "--reading-quote-bg": "rgba(31,41,55,0.5)",
        "--reading-quote-text": "#d1d5db",
        "--reading-code-bg": "#1f2937",        // gray-800
        "--reading-code-text": "#d1d5db",
        "--reading-border": "#374151",         // gray-700
        "--reading-th-bg": "#1f2937",
        "--reading-page-bg": "#111827",        // gray-900
        "--reading-card-bg": "rgba(31,41,55,0.3)",
        "--reading-muted": "#9ca3af",          // gray-400
        "--reading-muted-bg": "rgba(255,255,255,0.05)",
      }
    : {
        "--reading-heading": "#111827",        // gray-900
        "--reading-body": "#1f2937",           // gray-800
        "--reading-quote-bg": "#f9fafb",
        "--reading-quote-text": "#374151",
        "--reading-code-bg": "#f3f4f6",        // gray-100
        "--reading-code-text": "#1f2937",
        "--reading-border": "#e5e7eb",         // gray-200
        "--reading-th-bg": "#f9fafb",
        "--reading-page-bg": "#ffffff",
        "--reading-card-bg": "rgba(0,0,0,0.03)",
        "--reading-muted": "#6b7280",          // gray-500
        "--reading-muted-bg": "rgba(0,0,0,0.04)",
      }

  useEffect(() => {
    setMounted(true)
    if (typeof window !== "undefined") {
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

        if (data.thumbnail) {
          const imgUrl = getReadingImageUrl(data.thumbnail)
          setFullImageUrl(imgUrl || "")
        }

        if (data.progress) {
          const isCompleted = data.progress.completed || false
          setProgress({
            last_position: data.progress.last_position || 0,
            progress_percent: data.progress.progress_percent || 0,
            completed: isCompleted,
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
    if (slug) fetchReading()
  }, [slug])

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
    return { percent: Math.floor(percent), scrollTop: Math.floor(scrollTop) }
  }, [])

  const saveProgress = useCallback(
    async (percent: number, scrollTop: number, isCompleted: boolean) => {
      if (!reading || !user) return
      try {
        await readingAPI.updateProgress(reading.id, {
          last_position: scrollTop,
          completed: isCompleted,
        })
      } catch (error) {
        console.error("Failed to save progress:", error)
      }
    },
    [reading, user]
  )

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
        setProgress((prev) => ({
          ...prev,
          progress_percent: finalPercent,
          last_position: scrollTop,
          completed: isCompleted,
        }))
      }

      if (saveTimeout) clearTimeout(saveTimeout)
      const timeout = setTimeout(() => {
        saveProgress(finalPercent, scrollTop, isCompleted)
      }, 2000)
      setSaveTimeout(timeout)
    }

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
      if (saveTimeout) clearTimeout(saveTimeout)
    }
  }, [
    reading, user, mounted, initialLoadDone,
    calculateScrollProgress, saveProgress, saveTimeout,
    progress.progress_percent, progress.completed, hasReached100,
  ])

  const handleBookmark = async () => {
    if (!user) {
      toast({ title: "Login Diperlukan", description: "Silakan login untuk menyimpan bookmark.", variant: "destructive" })
      router.push("/login")
      return
    }
    try {
      if (isBookmarked) {
        const bookmarksRes = await readingAPI.getBookmarks()
        const bookmark = bookmarksRes.data.data.find((b: any) => b.reading_id === reading.id)
        if (bookmark) await readingAPI.removeBookmark(bookmark.id)
        setIsBookmarked(false)
        toast({ title: "Bookmark dihapus", description: "Artikel dihapus dari bookmark" })
      } else {
        await readingAPI.addBookmark(reading.id)
        setIsBookmarked(true)
        toast({ title: "Bookmark ditambahkan", description: "Artikel disimpan ke bookmark" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Gagal menyimpan bookmark.", variant: "destructive" })
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case "N5": return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
      case "N4": return "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300"
      case "N3": return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
      case "N2": return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
      case "N1": return "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300"
      default:   return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const getCleanDescription = () => {
    if (reading?.excerpt) return reading.excerpt
    if (reading?.content) return reading.content.replace(/<[^>]*>/g, "").substring(0, 160)
    return "Baca artikel menarik tentang bahasa Jepang di Pipinipon"
  }

  const getAbsoluteImageUrl = () => {
    if (fullImageUrl) return fullImageUrl
    if (reading?.thumbnail) {
      const imgUrl = getReadingImageUrl(reading.thumbnail)
      if (imgUrl?.startsWith("http")) return imgUrl
      if (imgUrl) return `${siteUrl}${imgUrl}`
    }
    return `${siteUrl}/og-image.jpg`
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
  const cleanTitle = `${reading.title} | Pipinipon - Belajar Bahasa Jepang`
  const absoluteImageUrl = getAbsoluteImageUrl()

  const shareUrls = {
    facebook:  `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    twitter:   `https://twitter.com/intent/tweet?text=${encodeURIComponent(reading.title)}&url=${encodeURIComponent(shareUrl)}`,
    whatsapp:  `https://wa.me/?text=${encodeURIComponent(`${reading.title} - ${shareUrl}`)}`,
    telegram:  `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(reading.title)}`,
    linkedin:  `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(reading.title)}`,
  }

  const jsonLdSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": reading.title,
    "description": cleanDescription,
    "image": absoluteImageUrl,
    "datePublished": reading.published_at || reading.created_at,
    "dateModified": reading.updated_at || reading.published_at || reading.created_at,
    "author": { "@type": "Person", "name": reading.author_name || "Pipinipon", "url": siteUrl },
    "publisher": { "@type": "Organization", "name": "Pipinipon", "logo": { "@type": "ImageObject", "url": `${siteUrl}/logo.png` } },
    "mainEntityOfPage": { "@type": "WebPage", "@id": shareUrl },
    "keywords": `belajar bahasa jepang, ${reading.level}, membaca bahasa jepang, furigana, ${reading.category}`,
    "educationalLevel": reading.level,
    "inLanguage": "id",
  }

  return (
    <>
      <Head>
        <title>{cleanTitle}</title>
        <meta name="description" content={cleanDescription} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={shareUrl} />
        <meta property="og:title" content={reading.title} />
        <meta property="og:description" content={cleanDescription} />
        <meta property="og:image" content={absoluteImageUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Pipinipon" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={reading.title} />
        <meta name="twitter:description" content={cleanDescription} />
        <meta name="twitter:image" content={absoluteImageUrl} />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <link rel="canonical" href={shareUrl} />
      </Head>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
      />

      {/* Modals */}
      <ShareModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} url={shareUrl} title={reading.title} />
      {imageUrl && (
        <LightboxModal
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          src={imageUrl}
          alt={reading.thumbnail_alt || reading.title}
        />
      )}

      {/* ── Page ── */}
      <div
        className="min-h-screen transition-colors duration-300"
        style={{
          ...(themeVars as React.CSSProperties),
          backgroundColor: "var(--reading-page-bg)",
        }}
      >
        {/* Progress bar */}
        <div className="sticky top-0 left-0 right-0 z-50">
          <Progress value={progress.progress_percent} className="h-1 rounded-none" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back button */}
          <Button
            variant="ghost"
            onClick={() => router.push("/reading")}
            className="mb-6 -ml-3"
            style={{ color: "var(--reading-muted)" }}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>

          {/* Meta badges */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-3 mb-4">
              <Badge className={getLevelColor(reading.level)}>
                <GraduationCap className="h-3 w-3 mr-1" />
                {reading.level}
              </Badge>
              <Badge variant="secondary" className="capitalize">{reading.category}</Badge>
              <div className="flex items-center gap-1 text-sm" style={{ color: "var(--reading-muted)" }}>
                <Eye className="h-4 w-4" />
                <span>{reading.views} dilihat</span>
              </div>
              <div className="flex items-center gap-1 text-sm" style={{ color: "var(--reading-muted)" }}>
                <Calendar className="h-4 w-4" />
                <span>
                  {new Date(reading.published_at || reading.created_at).toLocaleDateString("id-ID", {
                    year: "numeric", month: "long", day: "numeric",
                  })}
                </span>
              </div>
            </div>

            {/* Judul — warna eksplisit via CSS var, bukan Tailwind dark: */}
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight"
              style={{ color: "var(--reading-heading)" }}
            >
              {reading.title}
            </h1>

            {reading.author_name && (
              <p className="text-sm" style={{ color: "var(--reading-muted)" }}>
                Oleh: {reading.author_name}
              </p>
            )}
          </div>

          {/* Thumbnail — klik buka lightbox */}
          {imageUrl && (
            <div
              className="relative h-64 md:h-96 w-full mb-8 rounded-xl overflow-hidden cursor-zoom-in group"
              style={{ backgroundColor: "var(--reading-muted-bg)" }}
              onClick={() => setLightboxOpen(true)}
            >
              <img
                src={imageUrl}
                alt={reading.thumbnail_alt || reading.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <span className="flex items-center gap-2 px-4 py-2 bg-black/60 text-white text-sm font-medium rounded-full backdrop-blur-sm">
                  <ZoomIn className="h-4 w-4" />
                  Perbesar gambar
                </span>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 mb-8">
            <Button variant={isBookmarked ? "japanese" : "outline"} onClick={handleBookmark}>
              {isBookmarked
                ? <><BookmarkCheck className="h-4 w-4 mr-2" />Tersimpan</>
                : <><Bookmark className="h-4 w-4 mr-2" />Simpan</>
              }
            </Button>
            <Button variant="outline" onClick={() => setShowShareModal(true)}>
              <Share2 className="h-4 w-4 mr-2" />
              Bagikan
            </Button>
          </div>

          {/* Reading progress card */}
          <div
            className="mb-6 p-4 rounded-xl"
            style={{ backgroundColor: "var(--reading-muted-bg)" }}
          >
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium" style={{ color: "var(--reading-body)" }}>
                Progress Membaca
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {progress.progress_percent}%
              </span>
            </div>
            <Progress value={progress.progress_percent} className="h-2" />
            <div className="flex justify-between text-xs mt-2" style={{ color: "var(--reading-muted)" }}>
              <span>Mulai</span>
              <span>Scroll ke bawah →</span>
              <span>Selesai</span>
            </div>
            {isCompleted && (
              <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-3 flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                Selamat! Anda telah menyelesaikan artikel ini.
              </p>
            )}
          </div>

          {/* Article content */}
          <article>
            <MarkdownContent content={reading.content} />
          </article>

          {/* Social share */}
          <div
            className="mt-8 pt-6 border-t"
            style={{ borderColor: "var(--reading-border)" }}
          >
            <h3
              className="text-lg font-semibold mb-4"
              style={{ color: "var(--reading-heading)" }}
            >
              Bagikan ke Media Sosial
            </h3>
            <div className="flex flex-wrap gap-3">
              <a href={shareUrls.facebook} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-[#1877F2] hover:bg-[#1664d8] text-white rounded-lg transition-colors text-sm font-medium">Facebook</a>
              <a href={shareUrls.twitter}  target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-lg transition-colors text-sm font-medium">Twitter / X</a>
              <a href={shareUrls.whatsapp} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-[#25D366] hover:bg-[#20b859] text-white rounded-lg transition-colors text-sm font-medium">WhatsApp</a>
              <a href={shareUrls.telegram} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-[#0088cc] hover:bg-[#0077b3] text-white rounded-lg transition-colors text-sm font-medium">Telegram</a>
              <a href={shareUrls.linkedin} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-[#0A66C2] hover:bg-[#0955a3] text-white rounded-lg transition-colors text-sm font-medium">LinkedIn</a>
            </div>
          </div>

          {/* Back button bottom */}
          <div
            className="mt-8 pt-8 border-t"
            style={{ borderColor: "var(--reading-border)" }}
          >
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