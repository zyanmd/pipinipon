"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { readingAPI } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  BookOpen, Eye, Search, ChevronLeft, ChevronRight,
  Clock, GraduationCap, Sparkles, BookMarked, User,
  CalendarDays, ArrowRight, TrendingUp, Flame, Zap,
  Star, ChevronRight as ChevronRightIcon, Hash,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/components/ui/use-toast"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { getReadingImageUrl } from "@/lib/image-helper"
import { useTheme } from "@/components/providers/theme-provider"

// ─── Helpers ──────────────────────────────────────────────────────────────────

const LEVEL_META: Record<string, { color: string; dot: string; label: string }> = {
  N5: { color: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400",     dot: "bg-green-500",  label: "Pemula" },
  N4: { color: "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-400",             dot: "bg-sky-500",    label: "Dasar" },
  N3: { color: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",     dot: "bg-amber-500",  label: "Menengah" },
  N2: { color: "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400", dot: "bg-orange-500", label: "Mahir" },
  N1: { color: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400",         dot: "bg-rose-500",   label: "Lanjut" },
}

function getLevelMeta(level: string) {
  return LEVEL_META[level] ?? { color: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400", dot: "bg-gray-400", label: "" }
}

function formatDate(dateString: string) {
  if (!dateString) return "Baru"
  const d = Math.ceil(Math.abs(Date.now() - new Date(dateString).getTime()) / 86_400_000)
  if (d === 1) return "Kemarin"
  if (d < 7) return `${d} hari lalu`
  if (d < 30) return `${Math.floor(d / 7)} minggu lalu`
  if (d < 365) return `${Math.floor(d / 30)} bulan lalu`
  return `${Math.floor(d / 365)} tahun lalu`
}

function isNew(dateString: string) {
  if (!dateString) return false
  return Math.ceil(Math.abs(Date.now() - new Date(dateString).getTime()) / 86_400_000) <= 7
}

// ─── Popular Slider (Horizontal dengan thumbnail full) ─────────────────────────

const ANIM_TIME = 500
const AUTO_DELAY = 6000

function PopularSlider({ readings }: { readings: any[] }) {
  const total = readings.length
  const sliderRef = useRef<HTMLDivElement>(null)
  const curSlide = useRef(0)
  const animating = useRef(false)
  const autoTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const diffRef = useRef(0)

  const [activeDot, setActiveDot] = useState(0)
  const [activeSlide, setActiveSlide] = useState(0)
  const [leftInactive, setLeftInactive] = useState(true)
  const [rightInactive, setRightInactive] = useState(total <= 1)

  const applyTransform = useCallback((diff = 0) => {
    const idx = curSlide.current
    if (sliderRef.current) {
      sliderRef.current.style.transform = `translate3d(${-idx * 100 - diff}%,0,0)`
    }
  }, [])

  const scheduleAuto = useCallback(() => {
    if (autoTimer.current) clearTimeout(autoTimer.current)
    if (total <= 1) return
    autoTimer.current = setTimeout(() => {
      if (!animating.current) {
        curSlide.current = (curSlide.current + 1) % total
        go()
      }
    }, AUTO_DELAY)
  }, [total])

  const go = useCallback((instant = false) => {
    const idx = curSlide.current
    if (!instant) {
      animating.current = true
      sliderRef.current?.classList.add("is-animating")
      setActiveSlide(idx)
      setTimeout(() => {
        sliderRef.current?.classList.remove("is-animating")
        animating.current = false
      }, ANIM_TIME)
    }
    setActiveDot(idx)
    setLeftInactive(idx === 0)
    setRightInactive(idx === total - 1)
    applyTransform()
    diffRef.current = 0
    scheduleAuto()
  }, [applyTransform, scheduleAuto, total])

  const navigateLeft = useCallback(() => {
    if (animating.current || curSlide.current === 0) return
    curSlide.current--
    go()
  }, [go])

  const navigateRight = useCallback(() => {
    if (animating.current || curSlide.current === total - 1) return
    curSlide.current++
    go()
  }, [go, total])

  // Auto slide effect
  useEffect(() => {
    if (total <= 1) return
    scheduleAuto()
    return () => { if (autoTimer.current) clearTimeout(autoTimer.current) }
  }, [scheduleAuto, total])

  // Drag / swipe - Perbaikan untuk Android
  useEffect(() => {
    const slider = sliderRef.current
    if (!slider || total <= 1) return

    let startX = 0
    let startY = 0
    let startTime = 0
    let isDragging = false
    let isSwiping = false

    function onStart(e: MouseEvent | TouchEvent) {
      if (animating.current) return
      
      // Jangan prevent default pada touch start agar link tetap bisa diklik
      // Hanya prevent jika memang akan drag
      const touch = "touches" in e ? e.touches[0] : null
      startX = touch ? touch.pageX : (e as MouseEvent).pageX
      startY = touch ? touch.pageY : (e as MouseEvent).pageY
      startTime = Date.now()
      isDragging = true
      isSwiping = false
      diffRef.current = 0
      
      if (autoTimer.current) clearTimeout(autoTimer.current)
    }

    function onMove(e: MouseEvent | TouchEvent) {
      if (!isDragging) return
      
      const touch = "touches" in e ? e.touches[0] : null
      const x = touch ? touch.pageX : (e as MouseEvent).pageX
      const y = touch ? touch.pageY : (e as MouseEvent).pageY
      
      const deltaX = Math.abs(startX - x)
      const deltaY = Math.abs(startY - y)
      
      // Deteksi apakah ini swipe horizontal
      if (!isSwiping && (deltaX > 10 || deltaY > 10)) {
        isSwiping = deltaX > deltaY
      }
      
      // Jika ini swipe horizontal, prevent default agar tidak scroll
      if (isSwiping) {
        e.preventDefault()
        
        const windowWidth = window.innerWidth
        let diff = ((startX - x) / windowWidth) * 70
        
        const idx = curSlide.current
        if ((idx === 0 && diff < 0) || (idx === total - 1 && diff > 0)) {
          diff /= 2
        }
        diffRef.current = diff
        
        if (sliderRef.current) {
          sliderRef.current.style.transform = `translate3d(${-idx * 100 - diffRef.current}%,0,0)`
        }
      }
    }

    function onEnd() {
      if (!isDragging) return
      
      const wasSwiping = isSwiping
      isDragging = false
      isSwiping = false
      
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("touchmove", onMove)
      window.removeEventListener("mouseup", onEnd)
      window.removeEventListener("touchend", onEnd)
      
      if (animating.current) return
      
      // Jika bukan swipe, jangan lakukan apa-apa (biarkan link bisa diklik)
      if (!wasSwiping) {
        scheduleAuto()
        return
      }
      
      const velocity = Math.abs(diffRef.current) / (Date.now() - startTime) * 100
      const threshold = 8
      
      if (Math.abs(diffRef.current) < threshold && velocity < 0.5) {
        go(true)
        return
      }
      
      if (diffRef.current <= -threshold) {
        navigateLeft()
      } else if (diffRef.current >= threshold) {
        navigateRight()
      } else {
        go(true)
      }
    }

    slider.addEventListener("mousedown", onStart)
    slider.addEventListener("touchstart", onStart, { passive: true })
    window.addEventListener("mousemove", onMove)
    window.addEventListener("touchmove", onMove, { passive: false })
    window.addEventListener("mouseup", onEnd)
    window.addEventListener("touchend", onEnd)
    
    return () => {
      slider.removeEventListener("mousedown", onStart)
      slider.removeEventListener("touchstart", onStart)
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("touchmove", onMove)
      window.removeEventListener("mouseup", onEnd)
      window.removeEventListener("touchend", onEnd)
    }
  }, [go, navigateLeft, navigateRight, total, scheduleAuto])

  if (readings.length === 0) return null

  return (
    <div className="relative w-full h-[440px] md:h-[500px] rounded-3xl overflow-hidden">
      {/* Navigation buttons - Tetap ada untuk desktop */}
      <button
        onClick={navigateLeft}
        disabled={leftInactive}
        className={`absolute left-0 top-0 h-full w-[12%] z-30 transition-opacity duration-300 focus:outline-none ${
          leftInactive ? "opacity-0 pointer-events-none" : "opacity-0 md:opacity-0 md:hover:opacity-100"
        }`}
        style={{ background: "linear-gradient(to right, rgba(0,0,0,0.22) 0%, transparent 100%)" }}
        aria-label="Previous"
      >
        <ChevronLeft className="h-8 w-8 text-white mx-auto drop-shadow-lg" />
      </button>

      <button
        onClick={navigateRight}
        disabled={rightInactive}
        className={`absolute right-0 top-0 h-full w-[12%] z-30 transition-opacity duration-300 focus:outline-none ${
          rightInactive ? "opacity-0 pointer-events-none" : "opacity-0 md:opacity-0 md:hover:opacity-100"
        }`}
        style={{ background: "linear-gradient(to left, rgba(0,0,0,0.22) 0%, transparent 100%)" }}
        aria-label="Next"
      >
        <ChevronRight className="h-8 w-8 text-white mx-auto drop-shadow-lg" />
      </button>

      {/* Pagination dots */}
      <ul className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
        {readings.map((_, i) => (
          <li key={i}>
            <button
              onClick={() => { if (!animating.current && total > 1) { curSlide.current = i; go() } }}
              className="relative w-4 h-4 rounded-full border-2 border-white focus:outline-none group"
              aria-label={`Slide ${i + 1}`}
            >
              <span className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white transition-transform duration-300 ${
                activeDot === i ? "scale-100" : "scale-0 group-hover:scale-100"
              }`} />
            </button>
          </li>
        ))}
      </ul>

      {/* Slider track */}
      <div
        ref={sliderRef}
        className="relative h-full [&.is-animating]:transition-transform [&.is-animating]:duration-500 [&.is-animating]:[will-change:transform]"
        style={{ transform: "translate3d(0,0,0)" }}
      >
        {readings.map((reading, i) => {
          const imageUrl = getReadingImageUrl(reading.thumbnail)
          const lm = getLevelMeta(reading.level)
          const isActive = activeSlide === i

          return (
            <div
              key={reading.id}
              className="absolute top-0 w-full h-full overflow-hidden"
              style={{ left: `${i * 100}%` }}
            >
              {/* Link wrapper untuk seluruh slide - PERBAIKAN UTAMA */}
              <Link 
                href={`/reading/${reading.slug}`}
                className="absolute inset-0 z-10"
                aria-label={`Baca artikel: ${reading.title}`}
              >
                {/* Background image full - pindahkan pointer-events ke auto */}
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={reading.title}
                    draggable={false}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-800 to-gray-900" />
                )}

                {/* Dark overlay */}
                <div className="absolute inset-0 bg-black/40" />

                {/* Orange gradient overlay from left */}
                <div 
                  className="absolute inset-0 bg-gradient-to-r from-orange-600/80 via-orange-600/40 to-transparent"
                  style={{
                    opacity: isActive ? 1 : 0,
                    transition: "opacity 0.5s 0.3s",
                  }}
                />

                {/* Text overlay */}
                <div
                  className="absolute left-[8%] bottom-[12%] w-[90%] md:w-[45%] text-white"
                  style={{
                    opacity: isActive ? 1 : 0,
                    transform: isActive ? "translateY(0)" : "translateY(-50%)",
                    transition: "transform 0.5s 0.5s, opacity 0.5s 0.5s",
                  }}
                >
                  {/* Level badge */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500 text-white text-[11px] font-black uppercase tracking-wider">
                      <Flame className="h-3 w-3" /> #{i + 1} Populer
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold backdrop-blur-sm ${lm.color}`}>
                      {reading.level}
                    </span>
                  </div>

                  <p className="text-[11px] font-bold uppercase tracking-widest mb-1.5 opacity-80">
                    {reading.category || "Artikel"}
                  </p>

                  <h2 className="font-extrabold text-2xl md:text-3xl lg:text-4xl leading-tight mb-3 drop-shadow-sm line-clamp-2">
                    {reading.title}
                  </h2>

                  <div className="flex items-center gap-1.5 mb-3 text-white/70 text-xs">
                    <User className="h-3 w-3" />
                    <span>{reading.author_name || "Pipinipon"}</span>
                  </div>

                  <p className="text-white/60 text-xs leading-relaxed mb-4 line-clamp-3 hidden md:block">
                    {reading.excerpt || reading.content?.replace(/<[^>]*>/g, "").substring(0, 140) + "…"}
                  </p>

                  {/* Stats row */}
                  <div className="flex items-center gap-4 text-white/50 text-xs mb-4">
                    <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{reading.views?.toLocaleString() || 0}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{reading.reading_time || "5–10 menit"}</span>
                    <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{formatDate(reading.published_at || reading.created_at)}</span>
                  </div>

                  {/* CTA button - Hapus e.stopPropagation() */}
                  <span className="group/link inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-xl transition-all duration-300 hover:gap-3">
                    Baca Artikel
                    <ArrowRight className="h-4 w-4 transition-transform group-hover/link:translate-x-1" />
                  </span>
                </div>

                {/* Right side metadata */}
                <div
                  className="absolute right-8 top-1/2 -translate-y-1/2 text-right hidden lg:flex flex-col items-end gap-2"
                  style={{
                    opacity: isActive ? 1 : 0,
                    transition: "opacity 0.5s 0.7s",
                  }}
                >
                  <span className="text-white/30 text-[10px] font-mono tabular-nums">
                    {String(i + 1).padStart(2, "0")} / {String(readings.length).padStart(2, "0")}
                  </span>
                  <div className="w-px h-12 bg-white/20 self-end" />
                  <div className="flex flex-col items-end gap-1 text-white/40 text-[11px]">
                    <span>{reading.views?.toLocaleString() || 0} views</span>
                  </div>
                </div>
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Other Card Variants ──────────────────────────────────────────────────────

function HeroCard({ reading, isDark }: { reading: any; isDark: boolean }) {
  const imageUrl = getReadingImageUrl(reading.thumbnail)
  const lm = getLevelMeta(reading.level)
  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Link href={`/reading/${reading.slug}`}>
        <div className={`group relative rounded-3xl overflow-hidden cursor-pointer h-[380px] md:h-[460px] ${isDark ? 'ring-1 ring-white/10' : 'shadow-xl shadow-black/10'}`}>
          {imageUrl
            ? <img src={imageUrl} alt={reading.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            : <div className="absolute inset-0 bg-gradient-to-br from-orange-900 to-gray-900" />}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
          <div className="absolute top-5 left-5 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/90 backdrop-blur-sm text-white text-xs font-bold tracking-wide uppercase">
              <Sparkles className="h-3 w-3" /> Pilihan Editor
            </span>
            <span className={`px-2.5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm ${lm.color}`}>{reading.level}</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <p className="text-orange-400 text-xs font-semibold uppercase tracking-widest mb-2">{reading.category || "Artikel"}</p>
            <h2 className="text-white font-extrabold text-2xl md:text-3xl lg:text-4xl leading-tight mb-3 line-clamp-2 group-hover:text-orange-300 transition-colors">{reading.title}</h2>
            <p className="text-white/60 text-sm line-clamp-2 mb-4 max-w-2xl">{reading.excerpt || reading.content?.replace(/<[^>]*>/g, '').substring(0, 140) + '...'}</p>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-4 text-white/50 text-xs">
                <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" />{reading.author_name || "Pipinipon"}</span>
                <span className="flex items-center gap-1.5"><Eye className="h-3.5 w-3.5" />{reading.views?.toLocaleString() || 0}</span>
                <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{reading.reading_time || "5-10 menit"}</span>
              </div>
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/15 backdrop-blur-sm text-white text-xs font-semibold group-hover:bg-orange-500/80 transition-all">
                Baca Sekarang <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

function NewCard({ reading, isDark }: { reading: any; isDark: boolean }) {
  const imageUrl = getReadingImageUrl(reading.thumbnail)
  const lm = getLevelMeta(reading.level)
  return (
    <Link href={`/reading/${reading.slug}`}>
      <div className={`group flex gap-4 p-3.5 rounded-2xl cursor-pointer transition-all duration-200 ${isDark ? 'hover:bg-gray-800/60' : 'hover:bg-gray-50'}`}>
        <div className="relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
          {imageUrl
            ? <img src={imageUrl} alt={reading.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            : <div className="w-full h-full flex items-center justify-center"><BookMarked className="w-6 h-6 text-gray-300 dark:text-gray-700" /></div>}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-orange-500 text-white text-[10px] font-bold uppercase tracking-wide">
              <Zap className="h-2.5 w-2.5" /> Baru
            </span>
            <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-semibold ${lm.color}`}>{reading.level}</span>
          </div>
          <h4 className={`font-semibold text-sm line-clamp-2 leading-snug mb-1 transition-colors ${isDark ? 'text-white group-hover:text-orange-400' : 'text-gray-900 group-hover:text-orange-600'}`}>{reading.title}</h4>
          <p className={`text-[11px] flex items-center gap-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            <CalendarDays className="h-3 w-3" />{formatDate(reading.published_at || reading.created_at)}
          </p>
        </div>
      </div>
    </Link>
  )
}

function ArticleCard({ reading, index, isDark }: { reading: any; index: number; isDark: boolean }) {
  const imageUrl = getReadingImageUrl(reading.thumbnail)
  const lm = getLevelMeta(reading.level)
  const _isNew = isNew(reading.published_at || reading.created_at)
  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06, duration: 0.4 }} whileHover={{ y: -3 }}>
      <Link href={`/reading/${reading.slug}`}>
        <div className={`group rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer border ${isDark ? 'bg-gray-900/60 hover:bg-gray-900 border-white/5 hover:border-orange-500/20' : 'bg-white hover:bg-gray-50/80 border-gray-100 shadow-sm hover:shadow-lg'}`}>
          <div className="flex flex-col sm:flex-row">
            <div className="relative sm:w-64 h-48 sm:h-auto flex-shrink-0 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
              {imageUrl
                ? <img src={imageUrl} alt={reading.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                : <div className="w-full h-full flex items-center justify-center"><BookMarked className="w-10 h-10 text-gray-300 dark:text-gray-700" /></div>}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold backdrop-blur-sm ${lm.color}`}>{reading.level}</span>
                {_isNew && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-orange-500 text-white"><Zap className="h-2.5 w-2.5" /> Baru</span>}
              </div>
            </div>
            <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-widest">{reading.category || "Artikel"}</span>
                  <span className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-300'}`}>•</span>
                  <span className={`flex items-center gap-1 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}><CalendarDays className="h-3 w-3" />{formatDate(reading.published_at || reading.created_at)}</span>
                </div>
                <h3 className={`font-bold text-lg sm:text-xl mb-2 line-clamp-2 leading-snug transition-colors ${isDark ? 'text-white group-hover:text-orange-400' : 'text-gray-900 group-hover:text-orange-600'}`}>{reading.title}</h3>
                <div className={`flex items-center gap-1.5 mb-3 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}><User className="h-3 w-3" /><span>{reading.author_name || "Pipinipon"}</span></div>
                <p className={`text-sm leading-relaxed line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{reading.excerpt || reading.content?.replace(/<[^>]*>/g, '').substring(0, 130) + '...'}</p>
              </div>
              <div className="flex items-center justify-between mt-4 flex-wrap gap-2">
                <div className={`flex items-center gap-3 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{reading.views?.toLocaleString() || 0}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{reading.reading_time || "5-10 menit"}</span>
                </div>
                <span className={`inline-flex items-center gap-1 text-xs font-semibold transition-all group-hover:gap-2 ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
                  Baca Selengkapnya <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

function CategoryCard({ reading, isDark }: { reading: any; isDark: boolean }) {
  const imageUrl = getReadingImageUrl(reading.thumbnail)
  const lm = getLevelMeta(reading.level)
  const _isNew = isNew(reading.published_at || reading.created_at)
  return (
    <Link href={`/reading/${reading.slug}`}>
      <div className={`group rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 ${isDark ? 'bg-gray-900 ring-1 ring-white/8 hover:ring-orange-500/20' : 'bg-white shadow-sm hover:shadow-lg'}`}>
        <div className="relative h-40 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
          {imageUrl
            ? <img src={imageUrl} alt={reading.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            : <div className="w-full h-full flex items-center justify-center"><BookMarked className="w-8 h-8 text-gray-300 dark:text-gray-700" /></div>}
          <div className="absolute top-2.5 left-2.5 flex gap-1.5">
            <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold backdrop-blur-sm ${lm.color}`}>{reading.level}</span>
            {_isNew && <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-orange-500 text-white">Baru</span>}
          </div>
        </div>
        <div className="p-4">
          <p className="text-orange-600 dark:text-orange-400 text-[10px] font-bold uppercase tracking-widest mb-1.5">{reading.category || "Artikel"}</p>
          <h4 className={`font-bold text-sm leading-snug line-clamp-2 mb-3 transition-colors ${isDark ? 'text-white group-hover:text-orange-400' : 'text-gray-900 group-hover:text-orange-600'}`}>{reading.title}</h4>
          <div className={`flex items-center justify-between text-[11px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{reading.views?.toLocaleString() || 0}</span>
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{reading.reading_time || "5 mnt"}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ArticleSkeleton({ isDark }: { isDark: boolean }) {
  const bg = isDark ? 'bg-gray-800' : 'bg-gray-200'
  return (
    <div className={`rounded-2xl overflow-hidden border ${isDark ? 'bg-gray-900 border-white/5' : 'bg-white border-gray-100'}`}>
      <div className="flex flex-col sm:flex-row">
        <Skeleton className={`sm:w-64 h-48 ${bg}`} />
        <div className="flex-1 p-5 space-y-3">
          <Skeleton className={`h-3 w-20 ${bg}`} />
          <Skeleton className={`h-5 w-4/5 ${bg}`} />
          <Skeleton className={`h-3 w-24 ${bg}`} />
          <Skeleton className={`h-12 w-full ${bg}`} />
          <div className="flex justify-between pt-2">
            <Skeleton className={`h-3 w-20 ${bg}`} />
            <Skeleton className={`h-3 w-28 ${bg}`} />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Shared UI ────────────────────────────────────────────────────────────────

function SectionHeader({ icon, title, subtitle, isDark, href }: { icon: React.ReactNode; title: string; subtitle?: string; isDark: boolean; href?: string }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>{icon}</div>
        <div>
          <h2 className={`font-extrabold text-base sm:text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h2>
          {subtitle && <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{subtitle}</p>}
        </div>
      </div>
      {href && (
        <Link href={href} className={`inline-flex items-center gap-1 text-xs font-semibold transition-colors ${isDark ? 'text-orange-400 hover:text-orange-300' : 'text-orange-600 hover:text-orange-700'}`}>
          Lihat Semua <ChevronRightIcon className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  )
}

const CATEGORIES = [
  { value: "",        label: "Semua",   icon: <Hash className="h-3.5 w-3.5" /> },
  { value: "artikel", label: "Artikel", icon: <BookOpen className="h-3.5 w-3.5" /> },
  { value: "cerita",  label: "Cerita",  icon: <BookMarked className="h-3.5 w-3.5" /> },
  { value: "berita",  label: "Berita",  icon: <Sparkles className="h-3.5 w-3.5" /> },
]

const LEVELS = [
  { value: "",   label: "Semua Level" },
  { value: "N5", label: "N5 – Pemula" },
  { value: "N4", label: "N4 – Dasar" },
  { value: "N3", label: "N3 – Menengah" },
  { value: "N2", label: "N2 – Mahir" },
  { value: "N1", label: "N1 – Lanjut" },
]

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ReadingListPage() {
  const { theme } = useTheme()
  const { toast } = useToast()
  const isDark = theme === "dark"

  const [mounted, setMounted]               = useState(false)
  const [readings, setReadings]             = useState<any[]>([])
  const [popularReadings, setPopularReadings] = useState<any[]>([])
  const [newReadings, setNewReadings]       = useState<any[]>([])
  const [loading, setLoading]               = useState(true)
  const [loadingSections, setLoadingSections] = useState(true)

  const [pagination, setPagination] = useState({ total: 0, page: 1, per_page: 8, pages: 0, has_prev: false, has_next: false })
  const [level,    setLevel]    = useState("")
  const [category, setCategory] = useState("")
  const [search,   setSearch]   = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 500)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    const fetchSections = async () => {
      setLoadingSections(true)
      try {
        const [popRes, newRes] = await Promise.all([
          readingAPI.getAll({ page: 1, per_page: 6, published_only: true, sort: "views" }),
          readingAPI.getAll({ page: 1, per_page: 4, published_only: true, sort: "newest" }),
        ])
        if (popRes.data.success) setPopularReadings(popRes.data.data.readings)
        if (newRes.data.success) setNewReadings(newRes.data.data.readings)
      } catch (e) { console.error(e) } finally { setLoadingSections(false) }
    }
    fetchSections()
  }, [])

  const fetchReadings = async () => {
    setLoading(true)
    try {
      const res = await readingAPI.getAll({
        page: pagination.page, per_page: pagination.per_page,
        level: level || undefined, category: category || undefined,
        search: debouncedSearch || undefined, published_only: true,
      })
      if (res.data.success) {
        setReadings(res.data.data.readings)
        setPagination(p => ({ ...p, ...res.data.data.pagination }))
      }
    } catch {
      toast({ title: "Error", description: "Gagal memuat artikel.", variant: "destructive" })
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchReadings() }, [pagination.page, level, category, debouncedSearch])

  const handlePageChange = (p: number) => {
    setPagination(prev => ({ ...prev, page: p }))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const hasFilters = !!(level || category || debouncedSearch)

  if (!mounted) return null

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>

      {/* ── Page Hero ── */}
      <div className={`relative overflow-hidden border-b ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-sky-500/8 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-10 md:py-14 text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400 text-xs font-semibold mb-4">
              <Sparkles className="h-3 w-3" /> Koleksi Artikel
            </span>
            <h1 className={`text-3xl md:text-4xl font-extrabold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Artikel Bacaan JLPT
            </h1>
            <p className={`text-sm sm:text-base max-w-xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Tingkatkan kemampuan membaca dengan artikel ber-furigana dari level N5 hingga N1
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-12">

        {/* ── Featured Hero ── */}
        {!hasFilters && !loadingSections && popularReadings[0] && (
          <section>
            <SectionHeader icon={<Star className="h-4 w-4 text-amber-500" />} title="Artikel Pilihan" subtitle="Pilihan terbaik hari ini" isDark={isDark} />
            <HeroCard reading={popularReadings[0]} isDark={isDark} />
          </section>
        )}

        {/* ── Populer Slider ── */}
        {!hasFilters && (
          <section>
            <SectionHeader
              icon={<Flame className="h-4 w-4 text-rose-500" />}
              title="Populer"
              subtitle="Paling banyak dibaca"
              isDark={isDark}
            />
            {loadingSections ? (
              <Skeleton className={`w-full h-[440px] md:h-[500px] rounded-3xl ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`} />
            ) : (
              <PopularSlider readings={popularReadings} />
            )}
          </section>
        )}

        {/* ── Two-column: Terbaru + Kategori Cerita ── */}
        {!hasFilters && (
          <div className="grid md:grid-cols-2 gap-8">
            <section>
              <SectionHeader icon={<Zap className="h-4 w-4 text-orange-500" />} title="Artikel Terbaru" subtitle="Baru ditambahkan" isDark={isDark} />
              <div className={`rounded-2xl overflow-hidden border divide-y ${isDark ? 'bg-gray-900/60 border-white/5 divide-white/5' : 'bg-white border-gray-100 divide-gray-50 shadow-sm'}`}>
                {loadingSections ? (
                  [...Array(4)].map((_, i) => (
                    <div key={i} className="flex gap-4 p-3.5">
                      <Skeleton className={`flex-shrink-0 w-20 h-20 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`} />
                      <div className="flex-1 space-y-2">
                        <Skeleton className={`h-2.5 w-12 ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`} />
                        <Skeleton className={`h-4 w-full ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`} />
                        <Skeleton className={`h-4 w-2/3 ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`} />
                      </div>
                    </div>
                  ))
                ) : newReadings.length > 0
                  ? newReadings.map(r => <NewCard key={r.id} reading={r} isDark={isDark} />)
                  : <div className="p-8 text-center text-sm text-gray-400">Belum ada artikel baru</div>
                }
              </div>
            </section>

            <section>
              <SectionHeader icon={<TrendingUp className="h-4 w-4 text-sky-500" />} title="Kategori Cerita" subtitle="Fiksi & narasi menarik" isDark={isDark} />
              <div className="grid grid-cols-2 gap-3">
                {loadingSections
                  ? [...Array(4)].map((_, i) => (
                    <div key={i} className={`rounded-2xl overflow-hidden ${isDark ? 'bg-gray-900' : 'bg-white shadow-sm'}`}>
                      <Skeleton className={`h-32 w-full ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`} />
                      <div className="p-3 space-y-2">
                        <Skeleton className={`h-2.5 w-12 ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`} />
                        <Skeleton className={`h-4 w-full ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`} />
                      </div>
                    </div>
                  ))
                  : popularReadings.slice(1, 5).map(r => <CategoryCard key={r.id} reading={r} isDark={isDark} />)
                }
              </div>
            </section>
          </div>
        )}

        {/* ── Divider ── */}
        {!hasFilters && (
          <div className={`flex items-center gap-4 ${isDark ? 'text-gray-700' : 'text-gray-200'}`}>
            <div className="flex-1 h-px bg-current" />
            <span className={`text-xs font-semibold uppercase tracking-widest ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>Semua Artikel</span>
            <div className="flex-1 h-px bg-current" />
          </div>
        )}

        {/* ── Filters ── */}
        <section>
          <div className="flex items-center gap-2 flex-wrap mb-4">
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                onClick={() => { setCategory(cat.value); setPagination(p => ({ ...p, page: 1 })) }}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  category === cat.value
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                    : isDark ? 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white' : 'bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-900 border border-gray-100'
                }`}
              >{cat.icon}{cat.label}</button>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <Input
                placeholder="Cari artikel..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPagination(p => ({ ...p, page: 1 })) }}
                className={`pl-10 h-11 rounded-xl border-0 ${isDark ? 'bg-gray-800 text-white placeholder:text-gray-500' : 'bg-white text-gray-900 placeholder:text-gray-400 shadow-sm'}`}
              />
            </div>
            <Select value={level} onValueChange={v => { setLevel(v); setPagination(p => ({ ...p, page: 1 })) }}>
              <SelectTrigger className={`w-full sm:w-44 h-11 rounded-xl border-0 ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900 shadow-sm'}`}>
                <GraduationCap className="h-4 w-4 mr-2 text-gray-400" />
                <SelectValue placeholder="Level JLPT" />
              </SelectTrigger>
              <SelectContent className={isDark ? 'bg-gray-800 border-gray-700' : ''}>
                {LEVELS.map(l => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <p className={`text-xs mt-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
            Menampilkan {readings.length} dari {pagination.total} artikel
          </p>
        </section>

        {/* ── Article List ── */}
        <section>
          {loading ? (
            <div className="space-y-4">{[...Array(4)].map((_, i) => <ArticleSkeleton key={i} isDark={isDark} />)}</div>
          ) : readings.length === 0 ? (
            <div className="text-center py-20">
              <div className={`w-16 h-16 mx-auto rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-gray-100'} flex items-center justify-center mb-4`}>
                <BookOpen className={`w-8 h-8 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
              </div>
              <h3 className={`font-bold text-base mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>Artikel Tidak Ditemukan</h3>
              <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Coba ubah filter atau kata kunci pencarian.</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div key={`${category}-${level}-${debouncedSearch}-${pagination.page}`} className="space-y-4">
                {readings.map((r, i) => <ArticleCard key={r.id} reading={r} index={i} isDark={isDark} />)}
              </motion.div>
            </AnimatePresence>
          )}
        </section>

        {/* ── Pagination ── */}
        {pagination.pages > 1 && (
          <div className="flex justify-center items-center gap-2 pt-4">
            <Button variant="outline" size="sm" onClick={() => handlePageChange(pagination.page - 1)} disabled={!pagination.has_prev}
              className={`rounded-xl h-9 px-4 ${isDark ? 'border-gray-800 hover:bg-gray-800 text-gray-300' : 'border-gray-200 hover:bg-gray-50'}`}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Sebelumnya
            </Button>
            <div className="flex gap-1.5">
              {(() => {
                const total = pagination.pages, cur = pagination.page
                let pages: number[]
                if (total <= 5) pages = Array.from({ length: total }, (_, i) => i + 1)
                else if (cur <= 3) pages = [1,2,3,4,5]
                else if (cur >= total-2) pages = [total-4,total-3,total-2,total-1,total]
                else pages = [cur-2,cur-1,cur,cur+1,cur+2]
                return pages.map(p => (
                  <Button key={p} size="sm" variant={cur===p?"default":"outline"} onClick={() => handlePageChange(p)}
                    className={`w-9 h-9 rounded-xl text-xs ${cur===p?'bg-orange-500 hover:bg-orange-600 text-white border-0':isDark?'border-gray-800 hover:bg-gray-800 text-gray-300':'border-gray-200 hover:bg-gray-50'}`}>
                    {p}
                  </Button>
                ))
              })()}
            </div>
            <Button variant="outline" size="sm" onClick={() => handlePageChange(pagination.page + 1)} disabled={!pagination.has_next}
              className={`rounded-xl h-9 px-4 ${isDark ? 'border-gray-800 hover:bg-gray-800 text-gray-300' : 'border-gray-200 hover:bg-gray-50'}`}>
              Selanjutnya <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}

      </div>
    </div>
  )
}