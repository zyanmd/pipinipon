"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Head from "next/head"
import { grammarAPI, bookmarkAPI } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Eye, Calendar, Bookmark, Share2, BookOpen, Quote, ImageIcon, CheckCircle, AlertCircle, Heart } from "lucide-react"
import { motion } from "framer-motion"
import { cn, getJLPTColor, getJLPTLabel, formatDate } from "@/lib/utils"
import { useAuth } from "@/lib/hooks/use-auth"
import { useTheme } from "@/components/providers/theme-provider"
import { toast } from "@/components/ui/use-toast"
import { getGrammarThumbnailUrl } from "@/lib/image-helper"

export default function GrammarDetailPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const { user } = useAuth()
  const { theme } = useTheme()
  
  const [grammar, setGrammar] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isBookmarking, setIsBookmarking] = useState(false)
  const [thumbnailError, setThumbnailError] = useState(false)
  const [thumbnailLoading, setThumbnailLoading] = useState(true)

  // Fetch grammar data
  useEffect(() => {
    const fetchGrammar = async () => {
      try {
        setLoading(true)
        const response = await grammarAPI.getBySlug(slug)
        const grammarData = response.data.data.grammar
        setGrammar(grammarData)
        setThumbnailError(false)
        setThumbnailLoading(true)
        
        // Update document title dan meta description untuk SEO
        document.title = `${grammarData.title} - Pipinipon | Belajar Tata Bahasa Jepang`
        
        // Update meta description
        let metaDescription = document.querySelector('meta[name="description"]')
        if (!metaDescription) {
          metaDescription = document.createElement('meta')
          metaDescription.setAttribute('name', 'description')
          document.head.appendChild(metaDescription)
        }
        metaDescription.setAttribute('content', `${grammarData.meaning} Pelajari tata bahasa Jepang ${grammarData.title} untuk level ${grammarData.level}. Dilengkapi pola kalimat, contoh, dan penjelasan lengkap.`)
        
        // Update keywords
        let metaKeywords = document.querySelector('meta[name="keywords"]')
        if (!metaKeywords) {
          metaKeywords = document.createElement('meta')
          metaKeywords.setAttribute('name', 'keywords')
          document.head.appendChild(metaKeywords)
        }
        metaKeywords.setAttribute('content', `${grammarData.title}, tata bahasa Jepang, JLPT ${grammarData.level}, belajar bahasa Jepang, grammar Jepang, pola kalimat Jepang`)
        
        // Update Open Graph
        let ogTitle = document.querySelector('meta[property="og:title"]')
        if (!ogTitle) {
          ogTitle = document.createElement('meta')
          ogTitle.setAttribute('property', 'og:title')
          document.head.appendChild(ogTitle)
        }
        ogTitle.setAttribute('content', `${grammarData.title} - Pipinipon`)
        
        let ogDescription = document.querySelector('meta[property="og:description"]')
        if (!ogDescription) {
          ogDescription = document.createElement('meta')
          ogDescription.setAttribute('property', 'og:description')
          document.head.appendChild(ogDescription)
        }
        ogDescription.setAttribute('content', grammarData.meaning)
        
        let ogUrl = document.querySelector('meta[property="og:url"]')
        if (!ogUrl) {
          ogUrl = document.createElement('meta')
          ogUrl.setAttribute('property', 'og:url')
          document.head.appendChild(ogUrl)
        }
        ogUrl.setAttribute('content', `https://www.pipinipon.web.id/grammar/${slug}`)
        
        let ogType = document.querySelector('meta[property="og:type"]')
        if (!ogType) {
          ogType = document.createElement('meta')
          ogType.setAttribute('property', 'og:type')
          document.head.appendChild(ogType)
        }
        ogType.setAttribute('content', 'article')
        
        let ogImage = document.querySelector('meta[property="og:image"]')
        if (!ogImage) {
          ogImage = document.createElement('meta')
          ogImage.setAttribute('property', 'og:image')
          document.head.appendChild(ogImage)
        }
        const thumbnailFullUrl = grammarData.thumbnail ? getGrammarThumbnailUrl(grammarData.thumbnail) : "https://www.pipinipon.web.id/og-image.jpg"
        ogImage.setAttribute('content', thumbnailFullUrl)
        
        // Twitter Card
        let twitterCard = document.querySelector('meta[name="twitter:card"]')
        if (!twitterCard) {
          twitterCard = document.createElement('meta')
          twitterCard.setAttribute('name', 'twitter:card')
          document.head.appendChild(twitterCard)
        }
        twitterCard.setAttribute('content', 'summary_large_image')
        
        let twitterTitle = document.querySelector('meta[name="twitter:title"]')
        if (!twitterTitle) {
          twitterTitle = document.createElement('meta')
          twitterTitle.setAttribute('name', 'twitter:title')
          document.head.appendChild(twitterTitle)
        }
        twitterTitle.setAttribute('content', `${grammarData.title} - Pipinipon`)
        
        let twitterDescription = document.querySelector('meta[name="twitter:description"]')
        if (!twitterDescription) {
          twitterDescription = document.createElement('meta')
          twitterDescription.setAttribute('name', 'twitter:description')
          document.head.appendChild(twitterDescription)
        }
        twitterDescription.setAttribute('content', grammarData.meaning)
        
        let twitterImage = document.querySelector('meta[name="twitter:image"]')
        if (!twitterImage) {
          twitterImage = document.createElement('meta')
          twitterImage.setAttribute('name', 'twitter:image')
          document.head.appendChild(twitterImage)
        }
        twitterImage.setAttribute('content', thumbnailFullUrl)
        
        // Canonical URL
        let canonical = document.querySelector('link[rel="canonical"]')
        if (!canonical) {
          canonical = document.createElement('link')
          canonical.setAttribute('rel', 'canonical')
          document.head.appendChild(canonical)
        }
        canonical.setAttribute('href', `https://www.pipinipon.web.id/grammar/${slug}`)
        
        // Schema.org untuk grammar lesson - PERBAIKI
        let scriptSchema = document.querySelector('#grammar-schema')
        if (!scriptSchema) {
          scriptSchema = document.createElement('script')
          scriptSchema.setAttribute('id', 'grammar-schema')
          scriptSchema.setAttribute('type', 'application/ld+json')
          document.head.appendChild(scriptSchema)
        }
        
        // Parse example sentences for citation
        let exampleSentencesList: any[] = []
        if (grammarData.example_sentences) {
          try {
            const parsed = typeof grammarData.example_sentences === 'string' 
              ? JSON.parse(grammarData.example_sentences) 
              : grammarData.example_sentences
            if (Array.isArray(parsed)) {
              exampleSentencesList = parsed
            }
          } catch (e) {
            console.error("Error parsing example sentences:", e)
          }
        }
        
        // Buat citation items
        const citationItems = exampleSentencesList.slice(0, 3).map((sentence: any, idx: number) => ({
          "@type": "CreativeWork",
          "name": `Contoh Kalimat ${idx + 1}`,
          "text": sentence.japanese,
          "inLanguage": "ja",
          "about": {
            "@type": "Thing",
            "name": sentence.indonesian
          }
        }))
        
        const schemaData: any = {
          "@context": "https://schema.org",
          "@type": "LearningResource",
          "name": grammarData.title,
          "description": grammarData.meaning,
          "educationalLevel": grammarData.level,
          "teaches": grammarData.pattern,
          "inLanguage": "id",
          "url": `https://www.pipinipon.web.id/grammar/${slug}`,
          "datePublished": grammarData.created_at,
          "dateModified": grammarData.updated_at,
          "author": {
            "@type": "Organization",
            "name": "Pipinipon",
            "url": "https://www.pipinipon.web.id"
          },
          "provider": {
            "@type": "Organization",
            "name": "Pipinipon",
            "url": "https://www.pipinipon.web.id"
          },
          "about": {
            "@type": "Thing",
            "name": "Tata Bahasa Jepang",
            "description": grammarData.meaning
          },
          "audience": {
            "@type": "EducationalAudience",
            "educationalRole": "student",
            "audienceType": "Pembelajar Bahasa Jepang"
          },
          "learningResourceType": "Grammar Lesson",
          "interactivityType": "expositive",
          "isAccessibleForFree": true,
          "image": thumbnailFullUrl,
          "mainEntityOfPage": `https://www.pipinipon.web.id/grammar/${slug}`,
          "keywords": `${grammarData.title}, JLPT ${grammarData.level}, tata bahasa Jepang, grammar Jepang, belajar Jepang`
        }
        
        // Add citation if available
        if (citationItems.length > 0) {
          schemaData.citation = citationItems
        }
        
        // Add aggregate rating if view_count > 0
        if (grammarData.view_count > 0) {
          schemaData.aggregateRating = {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "ratingCount": Math.min(grammarData.view_count, 1000),
            "bestRating": "5",
            "worstRating": "1"
          }
        }
        
        scriptSchema.textContent = JSON.stringify(schemaData, null, 2)
        
        // Breadcrumb schema
        let breadcrumbSchema = document.querySelector('#breadcrumb-schema')
        if (!breadcrumbSchema) {
          breadcrumbSchema = document.createElement('script')
          breadcrumbSchema.setAttribute('id', 'breadcrumb-schema')
          breadcrumbSchema.setAttribute('type', 'application/ld+json')
          document.head.appendChild(breadcrumbSchema)
        }
        
        const breadcrumbData = {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Beranda",
              "item": "https://www.pipinipon.web.id"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Tata Bahasa",
              "item": "https://www.pipinipon.web.id/grammar"
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": grammarData.title,
              "item": `https://www.pipinipon.web.id/grammar/${slug}`
            }
          ]
        }
        breadcrumbSchema.textContent = JSON.stringify(breadcrumbData, null, 2)
        
        // Check if grammar is bookmarked by user
        if (user) {
          try {
            const bookmarkCheck = await bookmarkAPI.checkGrammarFavorite(grammarData.id)
            setIsBookmarked(bookmarkCheck.data.data.is_favorited)
          } catch (err) {
            console.error("Error checking bookmark status:", err)
          }
        }
      } catch (err) {
        console.error("Error fetching grammar:", err)
        setError("Materi tata bahasa tidak ditemukan")
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchGrammar()
    }
  }, [slug, user])

  // Handle bookmark toggle
  const handleBookmark = async () => {
    if (!user) {
      toast({
        title: "Info",
        description: "Silakan login untuk menyimpan materi",
        variant: "default"
      })
      router.push("/login")
      return
    }

    setIsBookmarking(true)
    try {
      if (isBookmarked) {
        const favoritesRes = await bookmarkAPI.getGrammarFavorites()
        const favorite = favoritesRes.data.data.favorites.find(
          (f: any) => f.grammar_id === grammar.id
        )
        if (favorite) {
          await bookmarkAPI.deleteGrammarFavorite(favorite.id)
          setIsBookmarked(false)
          toast({
            title: "Success",
            description: "Materi dihapus dari favorit"
          })
        }
      } else {
        await bookmarkAPI.addGrammarFavorite(grammar.id)
        setIsBookmarked(true)
        toast({
          title: "Success",
          description: "Materi disimpan ke favorit"
        })
      }
    } catch (error: any) {
      console.error("Error toggling bookmark:", error)
      toast({
        title: "Error",
        description: error.response?.data?.error || "Gagal menyimpan materi",
        variant: "destructive"
      })
    } finally {
      setIsBookmarking(false)
    }
  }

  // Share handler
  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: grammar.title,
          text: grammar.meaning,
          url: window.location.href,
        })
      } catch (err) {
        console.log("Share cancelled")
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Link disalin",
        description: "Link materi telah disalin ke clipboard"
      })
    }
  }

  // Parse JSON fields
  const parseJsonField = (field: any) => {
    if (!field) return []
    if (typeof field === 'string') {
      try {
        return JSON.parse(field)
      } catch {
        return []
      }
    }
    return field
  }

  const exampleSentences = parseJsonField(grammar?.example_sentences)
  const conversations = parseJsonField(grammar?.conversations)

  const isDark = theme === "dark"
  const thumbnailUrl = grammar?.thumbnail ? getGrammarThumbnailUrl(grammar.thumbnail) : null

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
        <Skeleton className="h-64 w-full rounded-xl mb-6" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4 rounded-lg" />
          <Skeleton className="h-4 w-full rounded-lg" />
          <Skeleton className="h-4 w-2/3 rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
      </div>
    )
  }

  if (error || !grammar) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md w-full mx-4 text-center">
          <CardContent className="pt-6">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Materi Tidak Ditemukan</h2>
            <p className="text-muted-foreground mb-6">
              {error || "Materi tata bahasa yang Anda cari tidak tersedia."}
            </p>
            <Button onClick={() => router.push("/grammar")} variant="japanese">
              Kembali ke Daftar Grammar
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{grammar.title} - Pipinipon | Belajar Tata Bahasa Jepang</title>
        <meta name="description" content={`${grammar.meaning} Pelajari tata bahasa Jepang ${grammar.title} untuk level ${grammar.level}. Dilengkapi pola kalimat, contoh, dan penjelasan lengkap.`} />
        <meta name="keywords" content={`${grammar.title}, tata bahasa Jepang, JLPT ${grammar.level}, belajar bahasa Jepang, grammar Jepang, pola kalimat Jepang`} />
        <meta property="og:title" content={`${grammar.title} - Pipinipon`} />
        <meta property="og:description" content={grammar.meaning} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://www.pipinipon.web.id/grammar/${slug}`} />
        <meta property="og:image" content={thumbnailUrl || "https://www.pipinipon.web.id/og-image.jpg"} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${grammar.title} - Pipinipon`} />
        <meta name="twitter:description" content={grammar.meaning} />
        <meta name="twitter:image" content={thumbnailUrl || "https://www.pipinipon.web.id/og-image.jpg"} />
        <link rel="canonical" href={`https://www.pipinipon.web.id/grammar/${slug}`} />
      </Head>
      
      <div className={cn(
        "min-h-screen",
        isDark ? "bg-background" : "bg-gradient-to-b from-white to-gray-50"
      )}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6"
          >
            <Link href="/grammar">
              <Button 
                variant="ghost" 
                size="sm"
                className={cn(
                  "gap-1 transition-all duration-200 rounded-full",
                  isDark ? "hover:bg-muted" : "hover:bg-gray-100"
                )}
              >
                <ArrowLeft className="h-4 w-4" />
                Kembali
              </Button>
            </Link>
          </motion.div>

          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className={cn(
                "h-px flex-1",
                isDark ? "bg-border" : "bg-gradient-to-r from-transparent to-gray-300"
              )} />
              <span className={cn(
                "text-[10px] tracking-[0.3em] uppercase font-bold",
                isDark ? "text-muted-foreground" : "text-gray-400"
              )}>
                文法
              </span>
              <div className={cn(
                "h-px flex-1",
                isDark ? "bg-border" : "bg-gradient-to-l from-transparent to-gray-300"
              )} />
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <Badge className={cn(getJLPTColor(grammar.level), "text-white px-3 py-1 text-xs font-medium shadow-sm")}>
                {grammar.level}
              </Badge>
              <Badge 
                variant="outline" 
                className={cn(
                  "px-3 py-1 text-xs font-medium",
                  isDark ? "border-border" : "border-gray-300"
                )}
              >
                {getJLPTLabel(grammar.level)}
              </Badge>
              {grammar.category && (
                <Badge 
                  variant="secondary" 
                  className="px-3 py-1 text-xs font-medium"
                >
                  {grammar.category}
                </Badge>
              )}
            </div>

            <h1 className={cn(
              "text-4xl md:text-5xl font-bold mb-4 leading-tight",
              isDark ? "text-foreground" : "text-gray-900"
            )}>
              {grammar.title}
            </h1>

            <p className={cn(
              "text-lg md:text-xl mb-4 leading-relaxed",
              isDark ? "text-muted-foreground" : "text-gray-600"
            )}>
              {grammar.meaning}
            </p>

            <div className={cn(
              "flex flex-wrap items-center gap-4 text-sm",
              isDark ? "text-muted-foreground" : "text-gray-500"
            )}>
              <div className="flex items-center gap-1.5">
                <Eye className="h-4 w-4" />
                <span>{grammar.view_count?.toLocaleString() || 0} dilihat</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(grammar.created_at)}</span>
              </div>
            </div>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-10 rounded-2xl overflow-hidden shadow-xl"
          >
            {thumbnailUrl && !thumbnailError ? (
              <div className="relative h-64 md:h-96 w-full bg-muted">
                {thumbnailLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted z-10">
                    <div className="animate-pulse flex flex-col items-center gap-2">
                      <BookOpen className="h-12 w-12 text-muted-foreground/40" />
                      <p className="text-sm text-muted-foreground/60">Memuat gambar...</p>
                    </div>
                  </div>
                )}
                <img
                  src={thumbnailUrl}
                  alt={grammar.thumbnail_alt || grammar.title}
                  className="w-full h-full object-cover transition-opacity duration-300"
                  onLoad={() => setThumbnailLoading(false)}
                  onError={() => {
                    console.error("Failed to load image:", thumbnailUrl)
                    setThumbnailError(true)
                    setThumbnailLoading(false)
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              </div>
            ) : (
              <div className={cn(
                "h-64 md:h-96 w-full flex flex-col items-center justify-center gap-3 rounded-2xl",
                isDark ? "bg-muted" : "bg-gradient-to-br from-emerald-500 to-teal-600"
              )}>
                <ImageIcon className="h-16 w-16 text-white/40" />
                <p className="text-white/60 text-sm">Gambar tidak tersedia</p>
              </div>
            )}
          </motion.div>

          {/* Pattern Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-10"
          >
            <div className={cn(
              "p-6 rounded-2xl text-center border-2 transition-all duration-300 hover:shadow-lg",
              isDark 
                ? "bg-muted/30 border-border" 
                : "bg-white border-emerald-200 shadow-md"
            )}>
              <p className={cn(
                "text-xs font-medium uppercase tracking-wider mb-3",
                isDark ? "text-muted-foreground" : "text-emerald-600"
              )}>
                Pola Kalimat
              </p>
              <p className={cn(
                "text-2xl md:text-3xl font-bold font-japanese",
                isDark ? "text-foreground" : "text-gray-900"
              )}>
                {grammar.pattern}
              </p>
            </div>
          </motion.div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {grammar.explanation && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h2 className={cn(
                    "text-xl font-semibold mb-4 pb-2 border-b",
                    isDark ? "border-border" : "border-gray-200"
                  )}>
                    Penjelasan
                  </h2>
                  <div className="prose dark:prose-invert max-w-none">
                    <p className={cn(
                      "leading-relaxed whitespace-pre-wrap",
                      isDark ? "text-muted-foreground" : "text-gray-700"
                    )}>
                      {grammar.explanation}
                    </p>
                  </div>
                </motion.div>
              )}

              {exampleSentences.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h2 className={cn(
                    "text-xl font-semibold mb-4 pb-2 border-b",
                    isDark ? "border-border" : "border-gray-200"
                  )}>
                    Contoh Kalimat
                  </h2>
                  <div className="space-y-4">
                    {exampleSentences.map((sentence: any, index: number) => (
                      <div 
                        key={index} 
                        className={cn(
                          "p-5 rounded-xl transition-all duration-200 hover:shadow-md",
                          isDark ? "bg-muted/30 border border-border" : "bg-white border border-gray-100 shadow-sm"
                        )}
                      >
                        <p className="text-lg font-medium font-japanese mb-2">
                          {sentence.japanese}
                        </p>
                        <p className={cn(
                          "text-sm",
                          isDark ? "text-muted-foreground" : "text-gray-600"
                        )}>
                          {sentence.indonesian}
                        </p>
                        {sentence.romaji && (
                          <p className={cn(
                            "text-xs mt-2 italic",
                            isDark ? "text-muted-foreground/60" : "text-gray-400"
                          )}>
                            {sentence.romaji}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {conversations.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h2 className={cn(
                    "text-xl font-semibold mb-4 pb-2 border-b",
                    isDark ? "border-border" : "border-gray-200"
                  )}>
                    Percakapan
                  </h2>
                  <div className="space-y-4">
                    {conversations.map((conv: any, index: number) => (
                      <div 
                        key={index} 
                        className={cn(
                          "p-5 rounded-xl transition-all duration-200 hover:shadow-md",
                          isDark ? "bg-muted/30 border border-border" : "bg-white border border-gray-100 shadow-sm"
                        )}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                            isDark ? "bg-muted text-foreground" : "bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                          )}>
                            {conv.speaker?.charAt(0) || "?"}
                          </div>
                          <span className="text-sm font-medium">{conv.speaker}</span>
                        </div>
                        <p className="font-japanese mb-2">{conv.japanese}</p>
                        <p className={cn(
                          "text-sm",
                          isDark ? "text-muted-foreground" : "text-gray-600"
                        )}>
                          {conv.indonesian}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {grammar.notes && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <h2 className={cn(
                    "text-xl font-semibold mb-4 pb-2 border-b",
                    isDark ? "border-border" : "border-gray-200"
                  )}>
                    Catatan
                  </h2>
                  <div className={cn(
                    "p-5 rounded-xl",
                    isDark ? "bg-muted/30 border border-border" : "bg-amber-50 border border-amber-100"
                  )}>
                    <p className={cn(
                      "leading-relaxed whitespace-pre-wrap text-sm",
                      isDark ? "text-muted-foreground" : "text-amber-800"
                    )}>
                      {grammar.notes}
                    </p>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 }}
                className={cn(
                  "p-5 rounded-xl",
                  isDark ? "bg-muted/30 border border-border" : "bg-white border border-gray-100 shadow-sm"
                )}
              >
                <p className={cn(
                  "text-xs font-bold uppercase tracking-wider mb-4 pb-2 border-b",
                  isDark ? "text-muted-foreground border-border" : "text-gray-500 border-gray-100"
                )}>
                  Info Singkat
                </p>
                <dl className="space-y-3">
                  <div className="flex justify-between items-center">
                    <dt className="text-xs uppercase tracking-wider">Level</dt>
                    <dd className="text-sm font-bold">{grammar.level}</dd>
                  </div>
                  {grammar.category && (
                    <div className="flex justify-between items-center">
                      <dt className="text-xs uppercase tracking-wider">Kategori</dt>
                      <dd className="text-sm font-bold">{grammar.category}</dd>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <dt className="text-xs uppercase tracking-wider">Dilihat</dt>
                    <dd className="text-sm font-bold">{grammar.view_count?.toLocaleString() || 0}×</dd>
                  </div>
                  <div className="flex justify-between items-center">
                    <dt className="text-xs uppercase tracking-wider">Terbit</dt>
                    <dd className="text-xs">{formatDate(grammar.created_at)}</dd>
                  </div>
                </dl>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 }}
                className={cn(
                  "p-5 rounded-xl text-center transition-all duration-200",
                  isDark ? "bg-muted/20 border border-border" : "bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100"
                )}
              >
                <Quote className={cn(
                  "h-6 w-6 mx-auto mb-3",
                  isDark ? "text-muted-foreground" : "text-emerald-500"
                )} />
                <p className={cn(
                  "text-base font-medium italic leading-relaxed",
                  isDark ? "text-foreground" : "text-gray-700"
                )}>
                  &ldquo;{grammar.meaning}&rdquo;
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 }}
                className="space-y-3"
              >
                <button
                  onClick={handleBookmark}
                  disabled={isBookmarking}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-all duration-200 rounded-xl",
                    isBookmarked
                      ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md"
                      : isDark
                        ? "bg-muted text-foreground hover:bg-muted/80 border border-border"
                        : "bg-white text-gray-700 hover:bg-gray-800 hover:text-white border border-gray-200"
                  )}
                >
                  {isBookmarked ? (
                    <>
                      <Heart className="h-4 w-4 fill-current" />
                      Tersimpan
                    </>
                  ) : (
                    <>
                      <Bookmark className="h-4 w-4" />
                      Simpan
                    </>
                  )}
                </button>
                <button
                  onClick={handleShare}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-all duration-200 rounded-xl",
                    isDark
                      ? "bg-muted text-foreground hover:bg-muted/80 border border-border"
                      : "bg-white text-gray-500 hover:text-gray-700 border border-gray-200 hover:border-gray-300"
                  )}
                >
                  <Share2 className="h-4 w-4" />
                  Bagikan
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.55 }}
                className="text-center"
              >
                <Link href={`/grammar?level=${grammar.level}`}>
                  <span className={cn(
                    "text-xs inline-flex items-center gap-1 transition-colors",
                    isDark ? "text-muted-foreground hover:text-foreground" : "text-gray-400 hover:text-emerald-600"
                  )}>
                    Lihat grammar level {grammar.level} lainnya
                    <ArrowLeft className="h-3 w-3 rotate-180" />
                  </span>
                </Link>
              </motion.div>
            </div>
          </div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-12 pt-6"
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                "h-px flex-1",
                isDark ? "bg-border" : "bg-gradient-to-r from-transparent to-gray-300"
              )} />
              <Link href="/grammar">
                <span className={cn(
                  "text-xs tracking-wider uppercase font-medium flex items-center gap-1 cursor-pointer transition-colors",
                  isDark ? "text-muted-foreground hover:text-foreground" : "text-gray-500 hover:text-gray-700"
                )}>
                  <ArrowLeft className="h-3 w-3" />
                  Kembali ke Daftar
                </span>
              </Link>
              <div className={cn(
                "h-px flex-1",
                isDark ? "bg-border" : "bg-gradient-to-l from-transparent to-gray-300"
              )} />
            </div>
          </motion.div>
        </div>
      </div>
    </>
  )
}