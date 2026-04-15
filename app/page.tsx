"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { motion, useScroll, useTransform, useInView } from "framer-motion"
import {
  BookOpen,
  GraduationCap,
  MessageCircle,
  Trophy,
  Sparkles,
  ChevronRight,
  Play,
  Users,
  Star,
  Zap,
  Globe,
  CheckCircle,
  ArrowRight,
} from "lucide-react"

const stats = [
  { value: "50.000+", label: "Pelajar Aktif" },
  { value: "1.200+", label: "Kosakata" },
  { value: "98%", label: "Tingkat Kepuasan" },
  { value: "N5–N1", label: "Level JLPT" },
]

const features = [
  {
    icon: BookOpen,
    title: "Kosakata Lengkap",
    description:
      "Lebih dari 1.200 kosakata terstruktur dengan audio native speaker, contoh kalimat, dan kartu belajar interaktif.",
    badge: "1.200+ kata",
    color: "#E53E3E",
  },
  {
    icon: GraduationCap,
    title: "Tata Bahasa Terstruktur",
    description:
      "Materi tata bahasa dari N5 hingga N1 dengan penjelasan Bahasa Indonesia yang mudah dipahami dan latihan langsung.",
    badge: "N5 → N1",
    color: "#D69E2E",
  },
  {
    icon: Zap,
    title: "Latihan Adaptif",
    description:
      "Sistem latihan yang menyesuaikan diri dengan kemampuanmu, memastikan kamu belajar hal yang tepat di waktu yang tepat.",
    badge: "AI-powered",
    color: "#2B6CB0",
  },
  {
    icon: MessageCircle,
    title: "Komunitas Aktif",
    description:
      "Bergabung dengan ribuan pelajar lain untuk diskusi, tanya jawab, dan saling mendukung dalam perjalanan belajar.",
    badge: "50k+ anggota",
    color: "#276749",
  },
]

const levels = [
  {
    name: "N5",
    desc: "Pemula",
    kanji: "五",
    words: "800 kata",
    color: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-200 dark:border-emerald-800",
  },
  {
    name: "N4",
    desc: "Dasar",
    kanji: "四",
    words: "1.500 kata",
    color: "from-blue-500 to-cyan-600",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-blue-200 dark:border-blue-800",
  },
  {
    name: "N3",
    desc: "Menengah",
    kanji: "三",
    words: "3.750 kata",
    color: "from-violet-500 to-purple-600",
    bg: "bg-violet-50 dark:bg-violet-950/30",
    border: "border-violet-200 dark:border-violet-800",
  },
  {
    name: "N2",
    desc: "Mahir",
    kanji: "二",
    words: "6.000 kata",
    color: "from-orange-500 to-amber-600",
    bg: "bg-orange-50 dark:bg-orange-950/30",
    border: "border-orange-200 dark:border-orange-800",
  },
  {
    name: "N1",
    desc: "Lanjutan",
    kanji: "一",
    words: "10.000 kata",
    color: "from-rose-500 to-red-600",
    bg: "bg-rose-50 dark:bg-rose-950/30",
    border: "border-rose-200 dark:border-rose-800",
  },
]

const testimonials = [
  {
    name: "Arinda Putri",
    role: "Mahasiswa Sastra Jepang",
    avatar: "AP",
    rating: 5,
    text: "Setelah 3 bulan belajar di Pipinipon, nilai JLPT N4 saya lulus dengan nilai hampir sempurna. Metode belajarnya sangat efektif!",
    color: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  },
  {
    name: "Budi Santoso",
    role: "Profesional IT",
    avatar: "BS",
    rating: 5,
    text: "Saya bisa belajar di sela-sela waktu kerja. Materi yang terstruktur dan latihan interaktif membuat belajar bahasa Jepang jadi menyenangkan.",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  },
  {
    name: "Citra Dewi",
    role: "Penggemar Anime & Manga",
    avatar: "CD",
    rating: 5,
    text: "Akhirnya bisa nonton anime tanpa subtitle! Kosakata yang diajarkan relevan banget dengan kehidupan sehari-hari.",
    color: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  },
]

// Animasi variants dengan tipe yang benar
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
}

const scaleOnHover = {
  whileHover: { scale: 1.05, transition: { duration: 0.2 } },
  whileTap: { scale: 0.95 }
}

export default function Home() {
  const heroRef = useRef<HTMLElement>(null)
  const featuresRef = useRef<HTMLElement>(null)
  const levelsRef = useRef<HTMLElement>(null)
  const testimonialsRef = useRef<HTMLElement>(null)
  const ctaRef = useRef<HTMLElement>(null)

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  })

  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  const isFeaturesInView = useInView(featuresRef, { once: true, margin: "-100px" })
  const isLevelsInView = useInView(levelsRef, { once: true, margin: "-100px" })
  const isTestimonialsInView = useInView(testimonialsRef, { once: true, margin: "-100px" })
  const isCtaInView = useInView(ctaRef, { once: true, margin: "-100px" })

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* ───────────────── HERO ───────────────── */}
      <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden">
        {/* Animated Background */}
        <motion.div 
          className="absolute inset-0 z-0"
          style={{ y: heroY }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-background" />
          
          {/* Animated gradient orbs */}
          <motion.div 
            className="absolute top-20 left-10 w-72 h-72 bg-red-500/20 rounded-full blur-3xl"
            animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute bottom-20 right-10 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl"
            animate={{ x: [0, -40, 0], y: [0, -20, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>

        <motion.div 
          className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32"
          style={{ opacity: heroOpacity }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-4xl"
          >
            <motion.div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm font-medium mb-8"
              whileHover={{ scale: 1.05 }}
            >
              <Sparkles className="w-4 h-4 text-yellow-300" />
              Platform belajar bahasa Jepang terpercaya di Indonesia
            </motion.div>

            <motion.h1 
              className="text-6xl md:text-8xl font-black text-white leading-[0.95] tracking-tight mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Kuasai
              <br />
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-red-400 via-orange-300 to-yellow-300 bg-clip-text text-transparent">
                  日本語
                </span>
              </span>
              <br />
              Mulai Hari Ini.
            </motion.h1>

            <motion.p 
              className="text-xl text-white/70 mb-10 max-w-xl leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Belajar bahasa Jepang dengan metode modern yang terbukti efektif — dari N5 hingga N1, bersama lebih dari 50.000 pelajar aktif.
            </motion.p>

            <motion.div 
              className="flex flex-wrap gap-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Link href="/register">
                <motion.div {...scaleOnHover}>
                  <Button
                    size="lg"
                    className="h-14 px-8 text-base font-semibold bg-red-600 hover:bg-red-700 text-white border-0 rounded-full shadow-2xl shadow-red-900/50 transition-all duration-200"
                  >
                    Mulai Gratis Sekarang
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </motion.div>
              </Link>
              <Link href="/vocabulary">
                <motion.div {...scaleOnHover}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-14 px-8 text-base font-semibold rounded-full border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all duration-200"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Lihat Demo
                  </Button>
                </motion.div>
              </Link>
            </motion.div>

            {/* Trust badges */}
            <motion.div 
              className="flex flex-wrap items-center gap-6 mt-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <div className="flex items-center gap-1.5 text-white/60 text-sm">
                <CheckCircle className="w-4 h-4 text-green-400" />
                Gratis untuk pemula
              </div>
              <div className="flex items-center gap-1.5 text-white/60 text-sm">
                <CheckCircle className="w-4 h-4 text-green-400" />
                Tanpa kartu kredit
              </div>
              <div className="flex items-center gap-1.5 text-white/60 text-sm">
                <CheckCircle className="w-4 h-4 text-green-400" />
                Akses seumur hidup
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Stats bar */}
        <motion.div 
          className="absolute bottom-0 left-0 right-0 z-20 bg-background/90 backdrop-blur-xl border-t border-border"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
              {stats.map((stat, i) => (
                <motion.div 
                  key={stat.label} 
                  className="py-5 px-6 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.9 + i * 0.1 }}
                >
                  <p className="text-2xl md:text-3xl font-black text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 font-medium uppercase tracking-wider">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ───────────────── FEATURES ───────────────── */}
      <section ref={featuresRef} className="py-28 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isFeaturesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6 }}
            className="mb-16 text-center"
          >
            <p className="text-red-600 font-bold text-sm uppercase tracking-widest mb-3">Kenapa Pipinipon?</p>
            <h2 className="text-4xl md:text-5xl font-black text-foreground leading-tight max-w-2xl mx-auto">
              Semua yang kamu butuhkan untuk fasih berbahasa Jepang
            </h2>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            variants={staggerContainer}
            initial="hidden"
            animate={isFeaturesInView ? "visible" : "hidden"}
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={fadeInUp}
                whileHover={{ y: -8 }}
                transition={{ duration: 0.2 }}
                className="group relative p-8 rounded-3xl border border-border bg-card hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
              >
                <div
                  className="absolute top-0 left-8 right-8 h-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: feature.color }}
                />

                <div className="flex items-start gap-5">
                  <motion.div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: feature.color + "18" }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <feature.icon className="w-7 h-7" style={{ color: feature.color }} />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-foreground">{feature.title}</h3>
                      <span
                        className="text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={{ background: feature.color + "18", color: feature.color }}
                      >
                        {feature.badge}
                      </span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ───────────────── LEVELS ───────────────── */}
      <section ref={levelsRef} className="py-28 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isLevelsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <p className="text-red-600 font-bold text-sm uppercase tracking-widest mb-3">Kurikulum JLPT</p>
            <h2 className="text-4xl md:text-5xl font-black text-foreground">
              Dari nol sampai mahir
            </h2>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
              Materi disusun mengikuti standar resmi JLPT, memastikan kamu siap menghadapi ujian sertifikasi internasional.
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4"
            variants={staggerContainer}
            initial="hidden"
            animate={isLevelsInView ? "visible" : "hidden"}
          >
            {levels.map((level) => (
              <motion.div key={level.name} variants={fadeInUp}>
                <Link href={`/vocabulary?jlpt_level=${level.name}`}>
                  <motion.div
                    whileHover={{ y: -8 }}
                    className={`group relative rounded-3xl border ${level.border} ${level.bg} p-6 text-center cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden`}
                  >
                    <span className="absolute -right-2 -bottom-4 text-8xl font-black opacity-10 select-none pointer-events-none">
                      {level.kanji}
                    </span>

                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${level.color} flex items-center justify-center mb-4 shadow-lg`}
                    >
                      <span className="text-2xl font-black text-white">{level.name}</span>
                    </motion.div>
                    <p className="font-bold text-foreground">{level.name}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{level.desc}</p>
                    <p className="text-xs text-muted-foreground mt-2 font-medium">{level.words}</p>

                    <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <span className="text-xs font-semibold text-foreground/60 flex items-center justify-center gap-1">
                        Mulai belajar <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ───────────────── SOCIAL PROOF ───────────────── */}
      <section ref={testimonialsRef} className="py-28 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isTestimonialsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <p className="text-red-600 font-bold text-sm uppercase tracking-widest mb-3">Testimoni</p>
            <h2 className="text-4xl md:text-5xl font-black text-foreground">
              Mereka sudah merasakannya
            </h2>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="hidden"
            animate={isTestimonialsInView ? "visible" : "hidden"}
          >
            {testimonials.map((t) => (
              <motion.div
                key={t.name}
                variants={fadeInUp}
                whileHover={{ y: -8 }}
                className="relative p-8 rounded-3xl border border-border bg-card cursor-pointer"
              >
                <div className="flex gap-1 mb-5">
                  {Array.from({ length: t.rating }).map((_, idx) => (
                    <Star key={idx} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                <p className="text-foreground leading-relaxed mb-6 text-[15px]">"{t.text}"</p>

                <div className="flex items-center gap-3">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center font-bold text-sm flex-shrink-0`}
                  >
                    {t.avatar}
                  </motion.div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{t.name}</p>
                    <p className="text-muted-foreground text-xs">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ───────────────── CTA ───────────────── */}
      <section ref={ctaRef} className="py-28 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isCtaInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.6, type: "spring" }}
            className="relative rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-red-600 via-red-700 to-rose-900 p-12 md:p-16 text-center"
          >
            <div className="absolute inset-0 overflow-hidden pointer-events-none select-none opacity-10">
              {["始", "め", "よ", "う"].map((c, i) => (
                <span
                  key={i}
                  className="absolute text-white font-black"
                  style={{
                    fontSize: "140px",
                    left: `${i * 28}%`,
                    top: "-10%",
                    opacity: 0.6,
                  }}
                >
                  {c}
                </span>
              ))}
            </div>

            <div className="relative z-10">
              <motion.div 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 border border-white/20 text-white/90 text-sm font-medium mb-6"
                whileHover={{ scale: 1.05 }}
              >
                <Globe className="w-4 h-4" />
                Bergabunglah dengan 50.000+ pelajar
              </motion.div>

              <motion.h2 
                className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={isCtaInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ delay: 0.2 }}
              >
                Siap memulai perjalananmu?
              </motion.h2>
              
              <motion.p 
                className="text-white/70 mb-10 max-w-xl mx-auto text-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={isCtaInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ delay: 0.3 }}
              >
                Daftar gratis hari ini dan dapatkan akses ke ratusan materi belajar bahasa Jepang.
              </motion.p>

              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={isCtaInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ delay: 0.4 }}
              >
                <Link href="/register">
                  <motion.div {...scaleOnHover}>
                    <Button
                      size="lg"
                      className="h-14 px-10 text-base font-bold rounded-full bg-white text-red-700 hover:bg-red-50 shadow-2xl transition-all duration-200"
                    >
                      Daftar Sekarang — Gratis
                      <ChevronRight className="ml-2 h-5 w-5" />
                    </Button>
                  </motion.div>
                </Link>
                <Link href="/vocabulary">
                  <motion.div {...scaleOnHover}>
                    <Button
                      size="lg"
                      variant="outline"
                      className="h-14 px-10 text-base font-bold rounded-full border-white/30 bg-white/10 text-white hover:bg-white/20 transition-all duration-200"
                    >
                      Jelajahi Kosakata
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>

              <motion.p 
                className="text-white/50 text-sm mt-6"
                initial={{ opacity: 0 }}
                animate={isCtaInView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ delay: 0.5 }}
              >
                Tidak perlu kartu kredit · Batalkan kapan saja
              </motion.p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}