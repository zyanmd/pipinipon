"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Eye, Calendar, BookOpen, ImageIcon } from "lucide-react"
import { cn, getJLPTColor, getJLPTLabel, formatDate } from "@/lib/utils"
import { getGrammarThumbnailUrl } from "@/lib/image-helper"

interface GrammarCardProps {
  grammar: {
    id: number
    title: string
    slug: string
    pattern: string
    meaning: string
    level: string
    category: string
    thumbnail?: string | null
    thumbnail_alt?: string | null
    view_count: number
    created_at: string
  }
}

// Lazy load image component
function LazyImage({ src, alt, className, onError }: { 
  src: string; 
  alt: string; 
  className: string; 
  onError: () => void 
}) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)
  const placeholderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            observer.disconnect()
          }
        })
      },
      {
        rootMargin: '200px',
        threshold: 0.01
      }
    )

    if (placeholderRef.current) {
      observer.observe(placeholderRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div ref={placeholderRef} className="relative w-full h-full">
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 animate-pulse flex items-center justify-center">
          <ImageIcon className="h-8 w-8 text-gray-400 dark:text-gray-500" />
        </div>
      )}
      
      {isInView && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          className={cn(
            className,
            "transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => setIsLoaded(true)}
          onError={onError}
          loading="lazy"
        />
      )}
    </div>
  )
}

export function GrammarCard({ grammar }: GrammarCardProps) {
  const [imgError, setImgError] = useState(false)
  
  // Gunakan helper getGrammarThumbnailUrl dari image-helper
  const thumbnailUrl = grammar.thumbnail && !imgError
    ? getGrammarThumbnailUrl(grammar.thumbnail)
    : null

  const viewCountFormatted = grammar.view_count?.toLocaleString() || 0

  return (
    <Link href={`/grammar/${grammar.slug}`}>
      <Card className="group h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
        {thumbnailUrl ? (
          <div className="relative h-40 w-full overflow-hidden bg-muted">
            <LazyImage
              src={thumbnailUrl}
              alt={grammar.thumbnail_alt || grammar.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={() => setImgError(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            <Badge 
              className={cn(
                "absolute top-3 left-3 z-10 text-white border-none shadow-md",
                getJLPTColor(grammar.level)
              )}
            >
              {grammar.level}
            </Badge>
          </div>
        ) : (
          <div className="relative h-40 w-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
            <BookOpen className="h-12 w-12 text-white/30 transition-transform duration-300 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            <Badge 
              className={cn(
                "absolute top-3 left-3 z-10 text-white border-none shadow-md",
                getJLPTColor(grammar.level)
              )}
            >
              {grammar.level}
            </Badge>
          </div>
        )}
        
        <CardHeader className="pb-2 pt-4">
          <div className="flex flex-wrap gap-2 mb-2">
            <Badge variant="outline">{getJLPTLabel(grammar.level)}</Badge>
            {grammar.category && (
              <Badge variant="secondary" className="text-xs">
                {grammar.category}
              </Badge>
            )}
          </div>
          <h3 className="text-lg font-bold line-clamp-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
            {grammar.title}
          </h3>
          <p className="text-sm font-mono text-muted-foreground line-clamp-1 mt-1">
            {grammar.pattern}
          </p>
        </CardHeader>
        
        <CardContent className="pb-2">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {grammar.meaning}
          </p>
        </CardContent>
        
        <CardFooter className="pt-2 text-xs text-muted-foreground border-t">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span>{viewCountFormatted}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(grammar.created_at)}</span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}