"use client"

import { useEffect, useRef, useState, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  AnimatePresence,
  useMotionValue,
  useSpring,
  MotionValue,
} from "framer-motion"
import {
  BookOpen,
  GraduationCap,
  MessageCircle,
  Zap,
  ChevronRight,
  Play,
  Star,
  Globe,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react"
import { useTheme } from "@/components/providers/theme-provider"

// ─── DATA ────────────────────────────────────────────────────────────────────

const stats = [
  { value: "50.000+", label: "Pelajar Aktif" },
  { value: "1.200+", label: "Kosakata" },
  { value: "N5–N1", label: "Level JLPT" },
]

const featureItems = [
  {
    title: "Belajar Kosakata dengan Metode Spaced Repetition",
    description:
      "Sistem pengulangan terjadwal yang terbukti secara ilmiah membantu memindahkan kosakata dari memori jangka pendek ke jangka panjang. Pelajari 1.200+ kata dengan contoh kalimat kontekstual dan audio native speaker.",
    image: "/1.png",
    alt: "Belajar kosakata bahasa Jepang",
    badge: "Metode Terbukti",
    color: "#E53E3E",
    icon: BookOpen,
  },
  {
    title: "Tata Bahasa Terstruktur dari N5 hingga N1",
    description:
      "Materi tata bahasa disusun secara sistematis mengikuti standar JLPT internasional. Setiap pola kalimat dilengkapi penjelasan dalam Bahasa Indonesia, contoh penggunaan, dan latihan interaktif.",
    image: "/2.png",
    alt: "Tata bahasa Jepang terstruktur",
    badge: "Kurikulum JLPT",
    color: "#D69E2E",
    icon: GraduationCap,
  },
  {
    title: "Latihan Adaptif Berbasis AI",
    description:
      "Teknologi AI canggih yang menyesuaikan tingkat kesulitan soal berdasarkan performamu. Fokus pada area yang masih lemah dan percepat proses belajarmu hingga 2x lebih efektif.",
    image: "/ai-feature.png",
    alt: "Latihan adaptif AI",
    badge: "AI-Powered",
    color: "#2B6CB0",
    icon: Zap,
  },
  {
    title: "Komunitas Belajar Terbesar di Indonesia",
    description:
      "Bergabung dengan lebih dari 50.000 pelajar aktif. Diskusikan materi, tanyakan soal sulit, dan dapatkan motivasi dari sesama pembelajar bahasa Jepang di forum eksklusif kami.",
    image: "/community-feature.png",
    alt: "Komunitas belajar bahasa Jepang",
    badge: "50k+ Anggota",
    color: "#276749",
    icon: MessageCircle,
  },
]

const levels = [
  { name: "N5", desc: "Pemula",   kanji: "五", words: "800 kata",    color: "from-emerald-400 to-teal-500",  glow: "#10b981" },
  { name: "N4", desc: "Dasar",    kanji: "四", words: "1.500 kata",  color: "from-blue-400 to-cyan-500",     glow: "#3b82f6" },
  { name: "N3", desc: "Menengah", kanji: "三", words: "3.750 kata",  color: "from-violet-500 to-purple-600", glow: "#8b5cf6" },
  { name: "N2", desc: "Mahir",    kanji: "二", words: "6.000 kata",  color: "from-orange-400 to-amber-500",  glow: "#f59e0b" },
  { name: "N1", desc: "Lanjutan", kanji: "一", words: "10.000 kata", color: "from-rose-500 to-red-600",      glow: "#ef4444" },
]

const testimonials = [
  {
    name: "Arinda Putri",
    role: "Mahasiswa Sastra Jepang",
    avatar: "AP",
    rating: 5,
    text: "Setelah 3 bulan belajar di Pipinipon, nilai JLPT N4 saya lulus dengan nilai hampir sempurna. Metode belajarnya sangat efektif!",
    accent: "#e53e3e",
  },
  {
    name: "Budi Santoso",
    role: "Profesional IT",
    avatar: "BS",
    rating: 5,
    text: "Saya bisa belajar di sela-sela waktu kerja. Materi terstruktur dan latihan interaktif membuat belajar bahasa Jepang jadi menyenangkan.",
    accent: "#2b6cb0",
  },
  {
    name: "Citra Dewi",
    role: "Penggemar Anime & Manga",
    avatar: "CD",
    rating: 5,
    text: "Akhirnya bisa nonton anime tanpa subtitle! Kosakata yang diajarkan relevan banget dengan kehidupan sehari-hari.",
    accent: "#805ad5",
  },
]

const activities = [
  { title: "Belajar Kosakata",  desc: "Pelajari 1.200+ kata dengan kartu interaktif dan audio native speaker", badge: "Mulai dari N5", color: "#E53E3E", href: "/vocabulary" },
  { title: "Quiz Adaptif",       desc: "Uji kemampuanmu dengan latihan soal yang menyesuaikan level",           badge: "AI-powered",  color: "#D69E2E", href: "/quiz" },
  { title: "Listening Practice", desc: "Latih pendengaran dengan audio asli dari native speaker Jepang",        badge: "Native audio", color: "#2B6CB0", href: "/listening" },
]

// ─── MORPH TEXT ───────────────────────────────────────────────────────────────

const MORPH_WORDS = ["日本語", "Kosakata", "Budaya", "Anime", "JLPT", "Kanji"]

function MorphText() {
  const [index, setIndex] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setIndex(i => (i + 1) % MORPH_WORDS.length), 2200)
    return () => clearInterval(id)
  }, [])
  return (
    <span className="relative inline-block overflow-hidden" style={{ minWidth: "4ch" }}>
      <AnimatePresence mode="wait">
        <motion.span
          key={MORPH_WORDS[index]}
          initial={{ y: 60, opacity: 0, filter: "blur(12px)" }}
          animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
          exit={{ y: -60, opacity: 0, filter: "blur(12px)" }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="block bg-gradient-to-r from-red-400 via-orange-300 to-yellow-300 bg-clip-text text-transparent"
        >
          {MORPH_WORDS[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

// ─── SCROLL-REVEAL TEXT (efek memutih dari bawah ke atas per huruf) ───────────

function ScrollRevealCharacter({
  char,
  progress,
  charIndex,
  totalChars,
  startOffset,
  endOffset,
  isDark,
}: {
  char: string
  progress: MotionValue<number>
  charIndex: number
  totalChars: number
  startOffset: number
  endOffset: number
  isDark: boolean
}) {
  const t = charIndex / (totalChars - 1 || 1)
  const charStart = startOffset + t * (endOffset - startOffset) * 0.7
  const charEnd = startOffset + t * (endOffset - startOffset) + 0.15
  
  const opacity = useTransform(progress, [charStart, charEnd], [0.15, 1])
  const y = useTransform(progress, [charStart, charEnd], [15, 0])
  const color = useTransform(
    progress,
    [charStart, charEnd],
    [isDark ? "#52525b" : "#94a3b8", isDark ? "#ffffff" : "#0f172a"]
  )
  
  if (char === " ") {
    return <span style={{ display: "inline-block", width: "0.28em" }}> </span>
  }
  
  return (
    <motion.span
      style={{
        opacity,
        y,
        color,
        display: "inline-block",
      }}
      className="will-change-transform"
    >
      {char}
    </motion.span>
  )
}

function ScrollRevealText({
  text,
  className,
  progress,
  isDark,
  startOffset = 0.1,
  endOffset = 0.9,
}: {
  text: string
  className?: string
  progress: MotionValue<number>
  isDark: boolean
  startOffset?: number
  endOffset?: number
}) {
  const characters = text.split("")
  
  return (
    <span className={className} style={{ display: "inline-block", whiteSpace: "normal" }}>
      {characters.map((char, i) => (
        <ScrollRevealCharacter
          key={i}
          char={char}
          progress={progress}
          charIndex={i}
          totalChars={characters.length}
          startOffset={startOffset}
          endOffset={endOffset}
          isDark={isDark}
        />
      ))}
    </span>
  )
}

// ─── MAGNETIC BUTTON ──────────────────────────────────────────────────────────

function MagneticButton({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0), y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 300, damping: 20 })
  const sy = useSpring(y, { stiffness: 300, damping: 20 })
  const onMove = (e: React.MouseEvent) => {
    const r = ref.current!.getBoundingClientRect()
    x.set((e.clientX - (r.left + r.width  / 2)) * 0.3)
    y.set((e.clientY - (r.top  + r.height / 2)) * 0.3)
  }
  return (
    <motion.div ref={ref} style={{ x: sx, y: sy }} onMouseMove={onMove}
      onMouseLeave={() => { x.set(0); y.set(0) }} className={className}>
      {children}
    </motion.div>
  )
}

// ─── FEATURE CARD ─────────────────────────────────────────────────────────────

function FeatureCard({
  feature,
  index,
  isDark,
}: {
  feature: typeof featureItems[0]
  index: number
  isDark: boolean
}) {
  const ref    = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })
  const isEven = index % 2 === 0

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className={`flex flex-col lg:flex-row ${isEven ? "lg:flex-row" : "lg:flex-row-reverse"} items-center gap-12 lg:gap-20`}>
     {/* Gambar - Background Statis Tanpa Efek Apapun */}
<div className="w-full lg:w-1/2">
  <div className="relative">
    {/* Menghapus shadow-lg dan bg-transparent agar tidak ada residu warna hitam/abu */}
    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden"> 
      <img
        src={feature.image}
        alt={feature.alt}
        /* 1. Menghapus transisi animasi.
           2. Menambahkan scale-105 untuk membuang 'margin kotor' di pinggir gambar asli.
        */
        className="absolute inset-0 w-full h-full object-cover scale-105"
        loading="lazy"
        decoding="async"
      />
    </div>

    {/* Badge Statis */}
    <div className="absolute -top-4 -right-4 z-10">
      <span
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-white text-sm font-bold shadow-md"
        style={{ background: feature.color }}
      >
        <Sparkles className="w-3.5 h-3.5" />
        {feature.badge}
      </span>
    </div>
  </div>
</div>

        {/* Content */}
        <div className="w-full lg:w-1/2 space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.1, type: "spring" }}
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: `${feature.color}15` }}
          >
            <feature.icon className="w-7 h-7" style={{ color: feature.color }} />
          </motion.div>

          <motion.h3
            className={`text-3xl md:text-4xl font-black leading-tight ${isDark ? "text-white" : "text-slate-900"}`}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {feature.title}
          </motion.h3>

          <motion.p
            className={`text-base leading-relaxed ${isDark ? "text-white/58" : "text-slate-600"}`}
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.3 }}
          >
            {feature.description}
          </motion.p>

          <motion.div
            className="flex flex-wrap gap-x-5 gap-y-2 pt-1"
            initial={{ opacity: 0, y: 14 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4 }}
          >
            {[
              { text: "100% Gratis untuk pemula", icon: CheckCircle },
              { text: "Akses seumur hidup",       icon: Target },
              { text: "Sertifikat kelulusan",     icon: TrendingUp },
            ].map((item, i) => (
              <span key={i} className={`flex items-center gap-1.5 text-sm ${isDark ? "text-white/45" : "text-slate-600"}`}>
                <item.icon className="w-3.5 h-3.5 shrink-0" style={{ color: feature.color }} />
                {item.text}
              </span>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -14 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.5 }}
          >
            <Link href="/register">
              <Button
                className="group/btn h-11 px-6 rounded-full font-semibold transition-all duration-300 hover:shadow-lg hover:opacity-90"
                style={{ background: feature.color, color: "white" }}
              >
                Pelajari Lebih Lanjut
                <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>

      {index < featureItems.length - 1 && (
        <div className={`mt-24 pt-12 border-t ${isDark ? "border-white/8" : "border-slate-200"}`} />
      )}
    </motion.div>
  )
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const { theme } = useTheme()
  const [isDark, setIsDark] = useState(true)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setIsDark(theme === "dark")
    const t = setTimeout(() => setReady(true), 60)
    return () => clearTimeout(t)
  }, [theme])

  // Section refs
  const featuresRef     = useRef<HTMLElement>(null)
  const activitiesRef   = useRef<HTMLElement>(null)
  const levelsRef       = useRef<HTMLElement>(null)
  const testimonialsRef = useRef<HTMLElement>(null)
  const ctaRef          = useRef<HTMLElement>(null)

  // Scroll progress
  const { scrollYProgress } = useScroll()

  // Hero parallax
  const heroY       = useTransform(scrollYProgress, [0, 0.25], ["0%", "20%"])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.17], [1, 0])
  const heroScale   = useTransform(scrollYProgress, [0, 0.25], [1, 1.07])

  // Scroll-reveal untuk features section - animasi selesai di 45%
  const featuresReveal = useTransform(scrollYProgress, [0.08, 0.45], [0, 1])

  // useInView per section
  const isFeaturesInView     = useInView(featuresRef,     { once: true, margin: "-60px" })
  const isActivitiesInView   = useInView(activitiesRef,   { once: true, margin: "-60px" })
  const isLevelsInView       = useInView(levelsRef,       { once: true, margin: "-60px" })
  const isTestimonialsInView = useInView(testimonialsRef, { once: true, margin: "-60px" })
  const isCtaInView          = useInView(ctaRef,          { once: true, margin: "-60px" })

  // Animation variants
  const stagger = {
    hidden:  { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
  }
  const fadeUp = {
    hidden:  { opacity: 0, y: 36 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as any } },
  }

  // Theme classes
  const textPri  = isDark ? "text-white"      : "text-slate-900"
  const textMut  = isDark ? "text-white/55"   : "text-slate-500"
  const heroBg   = isDark ? "bg-slate-950"    : "bg-slate-50"
  const badgeCls = isDark ? "bg-white/10 border-white/15 text-white/80" : "bg-black/5 border-slate-200 text-slate-700"
  const statsCls = isDark ? "bg-white/5 border-white/10" : "bg-white/80 border-slate-200"
  const divCls   = isDark ? "divide-white/10" : "divide-slate-200"
  const secAlt   = isDark ? "bg-gray-900/50"   : "bg-gray-100"
  const secMain  = isDark ? "bg-gray-950"      : "bg-white"
  const cardCls  = isDark ? "border-white/10 bg-gray-900" : "border-slate-200 bg-white"

  return (
    <div
      className={`min-h-screen overflow-x-hidden transition-colors duration-300 ${isDark ? "bg-gray-950" : "bg-white"}`}
      style={{ fontFamily: "'Noto Sans JP', sans-serif" }}
      suppressHydrationWarning
    >
      {/* ════════════════════════════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <motion.div className="absolute inset-0 z-0" style={{ y: heroY, scale: heroScale }}>
          <div className={`absolute inset-0 ${heroBg}`} />
        </motion.div>

        <motion.div
          className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-44"
          style={{ opacity: heroOpacity }}
        >
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={ready ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.15, duration: 0.5 }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md border ${badgeCls} text-sm font-medium mb-8`}
            >
              <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              Platform belajar bahasa Jepang #1 di Indonesia
            </motion.div>

            <motion.h1
              className={`text-6xl md:text-7xl xl:text-8xl font-black ${textPri} leading-[0.9] tracking-tight mb-6`}
              initial={{ opacity: 0, y: 30 }}
              animate={ready ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.25, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            >
              Kuasai
              <br />
              <MorphText />
              <br />
              <span className={isDark ? "text-white/90" : "text-slate-800"}>Hari Ini.</span>
            </motion.h1>

            <motion.p
              className={`text-lg ${textMut} mb-10 max-w-md leading-relaxed`}
              initial={{ opacity: 0, y: 16 }}
              animate={ready ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4, duration: 0.55 }}
            >
              Belajar bahasa Jepang dengan metode modern yang terbukti efektif — dari N5 hingga N1, bersama lebih dari 50.000 pelajar aktif.
            </motion.p>

            <motion.div
              className="flex flex-wrap gap-3"
              initial={{ opacity: 0, y: 16 }}
              animate={ready ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <MagneticButton>
                <Link href="/register">
                  <Button className="h-14 px-9 text-base font-bold bg-red-600 hover:bg-red-500 text-white border-0 rounded-full shadow-2xl shadow-red-900/40 transition-all duration-300">
                    Mulai Gratis
                    <ChevronRight className="ml-1.5 h-5 w-5" />
                  </Button>
                </Link>
              </MagneticButton>
              <MagneticButton>
                <Link href="/vocabulary">
                  <Button
                    variant="outline"
                    className={`h-14 px-9 text-base font-semibold rounded-full transition-all duration-300 ${
                      isDark
                        ? "border-white/20 bg-white/8 backdrop-blur-sm text-white hover:bg-white/14"
                        : "border-slate-300 bg-white/60 backdrop-blur-sm text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Lihat Demo
                  </Button>
                </Link>
              </MagneticButton>
            </motion.div>

            <motion.div
              className="flex flex-wrap gap-5 mt-9"
              initial={{ opacity: 0 }}
              animate={ready ? { opacity: 1 } : {}}
              transition={{ delay: 0.65 }}
            >
              {["Gratis untuk pemula", "Tanpa kartu kredit", "Akses seumur hidup"].map(t => (
                <span key={t} className={`flex items-center gap-1.5 text-sm ${isDark ? "text-white/40" : "text-slate-500"}`}>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  {t}
                </span>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          className={`absolute bottom-0 left-0 right-0 z-20 backdrop-blur-2xl border-t ${statsCls}`}
          initial={{ y: 70, opacity: 0 }}
          animate={ready ? { y: 0, opacity: 1 } : {}}
          transition={{ delay: 0.85, duration: 0.55 }}
        >
          <div className="max-w-7xl mx-auto px-4">
            <div className={`grid grid-cols-3 divide-x ${divCls}`}>
              {stats.map((s, i) => (
                <motion.div
                  key={s.label}
                  className="py-5 px-6 text-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={ready ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.95 + i * 0.07 }}
                >
                  <p className={`text-2xl md:text-3xl font-black ${textPri}`}>{s.value}</p>
                  <p className={`text-xs ${textMut} mt-0.5 font-medium uppercase tracking-widest`}>{s.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          FEATURES - dengan efek scroll reveal per karakter
      ════════════════════════════════════════════════════════════════════ */}
      <section ref={featuresRef} className={`py-32 ${secMain} relative transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-24">
            <motion.p
              className="text-red-500 font-bold text-xs uppercase tracking-[0.25em] mb-4 inline-flex items-center gap-2"
              initial={{ opacity: 0, y: 10 }}
              animate={isFeaturesInView ? { opacity: 1, y: 0 } : {}}
            >
              <Sparkles className="w-3 h-3" /> Fitur Unggulan <Sparkles className="w-3 h-3" />
            </motion.p>

            <div className="text-4xl md:text-6xl font-black leading-tight tracking-tight mb-5">
              <ScrollRevealText
                text="Belajar Jadi Lebih Mudah"
                progress={featuresReveal}
                isDark={isDark}
                startOffset={0.05}
                endOffset={0.09}
              />
            </div>

            <div className="max-w-2xl mx-auto text-lg leading-relaxed">
              <ScrollRevealText
                text="Metode pembelajaran yang dirancang khusus untuk membantu kamu menguasai bahasa Jepang dengan cepat dan menyenangkan"
                progress={featuresReveal}
                isDark={isDark}
                startOffset={0.15}
                endOffset={0.09}
              />
            </div>
          </div>

          <div className="space-y-32">
            {featureItems.map((feature, index) => (
              <FeatureCard key={feature.title} feature={feature} index={index} isDark={isDark} />
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          ACTIVITIES
      ════════════════════════════════════════════════════════════════════ */}
      <section ref={activitiesRef} className={`py-32 ${secAlt} relative transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={isActivitiesInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55 }}
            className="text-center mb-20"
          >
            <p className="text-red-500 font-bold text-xs uppercase tracking-[0.25em] mb-3">Aktivitas Belajar</p>
            <h2 className={`text-4xl md:text-6xl font-black ${textPri} leading-tight`}>
              Apa yang kamu pelajari?
            </h2>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={stagger}
            initial="hidden"
            animate={isActivitiesInView ? "visible" : "hidden"}
          >
            {activities.map((act) => (
              <motion.div key={act.title} variants={fadeUp}>
                <Link href={act.href}>
                  <motion.div
                    whileHover={{ y: -10, scale: 1.015 }}
                    transition={{ duration: 0.22 }}
                    className={`group relative rounded-[2rem] overflow-hidden border cursor-pointer h-full transition-colors duration-300 ${cardCls}`}
                  >
                    <div className="p-8" style={{ background: `linear-gradient(135deg, ${act.color}08, transparent)` }}>
                      <span className="inline-block text-xs font-bold px-3 py-1.5 rounded-full text-white mb-4"
                        style={{ background: act.color }}>
                        {act.badge}
                      </span>
                      <h3 className={`text-xl font-black mb-2 ${isDark ? "text-foreground" : "text-slate-900"}`}>{act.title}</h3>
                      <p className={`text-sm leading-relaxed mb-4 ${isDark ? "text-muted-foreground" : "text-slate-600"}`}>{act.desc}</p>
                      <span className="inline-flex items-center gap-1.5 text-sm font-bold" style={{ color: act.color }}>
                        Mulai belajar <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                      </span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-[3px] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full"
                      style={{ background: act.color }} />
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          JLPT LEVELS
      ════════════════════════════════════════════════════════════════════ */}
      <section ref={levelsRef} className={`py-32 ${secMain} transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={isLevelsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55 }}
            className="text-center mb-20"
          >
            <p className="text-red-500 font-bold text-xs uppercase tracking-[0.25em] mb-3">Kurikulum JLPT</p>
            <h2 className={`text-4xl md:text-6xl font-black ${textPri}`}>Dari nol sampai mahir</h2>
            <p className={`${textMut} mt-4 max-w-xl mx-auto`}>
              Materi mengikuti standar resmi JLPT, memastikan kamu siap menghadapi ujian sertifikasi internasional.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-5"
            variants={stagger}
            initial="hidden"
            animate={isLevelsInView ? "visible" : "hidden"}
          >
            {levels.map((level) => (
              <motion.div key={level.name} variants={fadeUp}>
                <Link href={`/vocabulary?jlpt_level=${level.name}`}>
                  <motion.div
                    whileHover={{ y: -10, scale: 1.04 }}
                    transition={{ duration: 0.22 }}
                    className={`group relative rounded-3xl border p-7 text-center cursor-pointer overflow-hidden transition-colors duration-300 ${cardCls}`}
                  >
                    <span className="absolute -right-2 -bottom-3 text-8xl font-black opacity-[0.07] select-none pointer-events-none"
                      style={{ color: level.glow }}>
                      {level.kanji}
                    </span>
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className={`w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br ${level.color} flex items-center justify-center mb-4 shadow-lg`}
                    >
                      <span className="text-xl font-black text-white">{level.name}</span>
                    </motion.div>
                    <p className={`font-black text-lg ${isDark ? "text-foreground" : "text-slate-900"}`}>{level.name}</p>
                    <p className={`text-sm ${isDark ? "text-muted-foreground" : "text-slate-600"}`}>{level.desc}</p>
                    <p className={`text-xs mt-1.5 font-semibold ${isDark ? "text-muted-foreground" : "text-slate-500"}`}>{level.words}</p>
                    <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <span className="text-xs font-bold flex items-center justify-center gap-1" style={{ color: level.glow }}>
                        Mulai <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          TESTIMONIALS
      ════════════════════════════════════════════════════════════════════ */}
      <section ref={testimonialsRef} className={`py-32 ${secAlt} transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={isTestimonialsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55 }}
            className="text-center mb-20"
          >
            <p className="text-red-500 font-bold text-xs uppercase tracking-[0.25em] mb-3">Testimoni</p>
            <h2 className={`text-4xl md:text-6xl font-black ${textPri}`}>Mereka sudah merasakannya</h2>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={stagger}
            initial="hidden"
            animate={isTestimonialsInView ? "visible" : "hidden"}
          >
            {testimonials.map((t) => (
              <motion.div
                key={t.name}
                variants={fadeUp}
                whileHover={{ y: -7 }}
                className={`relative p-8 rounded-3xl border overflow-hidden group transition-colors duration-300 ${cardCls}`}
              >
                <div className="flex gap-0.5 mb-5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className={`leading-relaxed mb-6 text-[15px] relative z-10 ${isDark ? "text-white/78" : "text-slate-700"}`}>
                  "{t.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white shrink-0"
                    style={{ background: t.accent }}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className={`font-bold text-sm ${isDark ? "text-foreground" : "text-slate-900"}`}>{t.name}</p>
                    <p className={`text-xs ${isDark ? "text-muted-foreground" : "text-slate-500"}`}>{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          CTA
      ════════════════════════════════════════════════════════════════════ */}
      <section ref={ctaRef} className="py-32 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 36 }}
            animate={isCtaInView ? { opacity: 1, scale: 1, y: 0 } : {}}
            transition={{ duration: 0.75, type: "spring", stiffness: 90 }}
            className="relative rounded-[2.5rem] overflow-hidden p-12 md:p-20 text-center"
            style={{ background: "linear-gradient(135deg, #dc2626, #b91c1c, #7f1d1d)" }}
          >
            <div className="relative z-10">
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 border border-white/20 text-white/90 text-sm font-semibold mb-6"
                whileHover={{ scale: 1.04 }}
              >
                <Globe className="w-4 h-4" />
                Bergabunglah dengan 50.000+ pelajar
              </motion.div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
                Siap memulai<br />perjalananmu?
              </h2>
              <p className="text-white/60 mb-10 max-w-md mx-auto text-lg">
                Daftar gratis hari ini dan dapatkan akses ke ratusan materi belajar bahasa Jepang.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <MagneticButton>
                  <Link href="/register">
                    <Button className="h-14 px-10 text-base font-bold rounded-full bg-white text-red-700 hover:bg-red-50 shadow-2xl transition-all">
                      Daftar Sekarang — Gratis
                      <ChevronRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </MagneticButton>
                <MagneticButton>
                  <Link href="/vocabulary">
                    <Button variant="outline" className="h-14 px-10 text-base font-bold rounded-full border-white/25 bg-white/10 text-white hover:bg-white/20 transition-all">
                      Jelajahi Kosakata
                    </Button>
                  </Link>
                </MagneticButton>
              </div>
              <p className="text-white/35 text-sm mt-7">Tidak perlu kartu kredit · Batalkan kapan saja</p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}