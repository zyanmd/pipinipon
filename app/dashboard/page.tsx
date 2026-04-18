"use client"

import React, { useState, useEffect } from "react"
import { useAuth } from "@/lib/hooks/use-auth"
import { studyAPI, vocabAPI, readingAPI } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CalendarStreak } from "@/components/ui/calendar-streak"
import { BookOpen, GraduationCap, Trophy, TrendingUp, Target, Sparkles, Clock, CheckCircle, Medal, Star, Zap, Newspaper, BookMarked, ChevronRight, Eye, Clock as ClockIcon, User } from "lucide-react"
import { motion, useInView } from "framer-motion"
import { formatRelativeTime } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { VerifyEmailBanner } from "@/components/verify-email-banner"
import { useTheme } from "@/components/providers/theme-provider"

// Helper function untuk mendapatkan URL gambar yang valid
function getValidImageUrl(url: string | null | undefined): string | null {
  if (!url) return null
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  if (url.startsWith('/')) {
    return url
  }
  return `/${url}`
}

// Komponen animasi angka
function AnimatedNumber({ value, duration = 1000, delay = 0 }: { value: number; duration?: number; delay?: number }) {
  const [count, setCount] = useState(0)
  const ref = React.useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  useEffect(() => {
    if (!isInView) return

    let startTime: number
    let animationFrame: number

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const currentValue = Math.floor(easeOutQuart * value)
      
      setCount(currentValue)
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    const timeout = setTimeout(() => {
      animationFrame = requestAnimationFrame(animate)
    }, delay)

    return () => {
      clearTimeout(timeout)
      if (animationFrame) cancelAnimationFrame(animationFrame)
    }
  }, [value, duration, delay, isInView])

  return <span ref={ref}>{count.toLocaleString()}</span>
}

// Komponen Reading Card dengan tema
function ReadingCard({ reading, index, onPress, isDark }: { reading: any; index: number; onPress?: () => void; isDark: boolean }) {
  const [isPressed, setIsPressed] = useState(false)
  const [imgError, setImgError] = useState(false)
  
  const getLevelColor = (level: string) => {
    switch(level) {
      case 'N5': return 'from-emerald-400 to-emerald-500'
      case 'N4': return 'from-sky-400 to-sky-500'
      case 'N3': return 'from-amber-400 to-amber-500'
      case 'N2': return 'from-orange-400 to-orange-500'
      case 'N1': return 'from-rose-400 to-rose-500'
      default: return 'from-gray-400 to-gray-500'
    }
  }
  
  const getLevelBg = (level: string) => {
    switch(level) {
      case 'N5': return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
      case 'N4': return 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300'
      case 'N3': return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
      case 'N2': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
      case 'N1': return 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300'
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
    }
  }

  const validImageUrl = getValidImageUrl(reading.thumbnail)
  const showImage = validImageUrl && !imgError

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onTapStart={() => setIsPressed(true)}
      onTap={() => {
        setIsPressed(false)
        onPress?.()
      }}
      onTapCancel={() => setIsPressed(false)}
      className="cursor-pointer"
    >
      <div className="group relative">
        <motion.div 
          className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          animate={{ opacity: isPressed ? 0.1 : 0 }}
        />
        
        <div className={`relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border ${
          isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'
        }`}>
          <div className="flex flex-row">
            {/* Thumbnail Image */}
            <div className={`relative w-28 h-28 md:w-32 md:h-32 flex-shrink-0 overflow-hidden ${
              isDark ? 'bg-gray-800' : 'bg-gray-100'
            }`}>
              <div className={`absolute inset-0 bg-gradient-to-br ${getLevelColor(reading.level)} opacity-10`} />
              {showImage ? (
                <img
                  src={validImageUrl}
                  alt={reading.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                  <Newspaper className="w-10 h-10 text-white/50" />
                </div>
              )}
              <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-semibold ${getLevelBg(reading.level)} backdrop-blur-sm z-10`}>
                {reading.level}
              </div>
            </div>
            
            {/* Content */}
            <div className="flex-1 p-3 md:p-4">
              <h3 className={`font-semibold text-sm md:text-base line-clamp-2 transition-colors ${
                isDark ? 'text-white group-hover:text-emerald-400' : 'text-gray-900 group-hover:text-emerald-600'
              }`}>
                {reading.title}
              </h3>
              <p className={`text-xs mt-1 line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {reading.description || "Tingkatkan kemampuan membaca Anda dengan artikel ber-furigana"}
              </p>
              <div className={`flex items-center gap-3 mt-2 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <AnimatedNumber value={reading.views || 0} duration={500} />
                </span>
                <span className="flex items-center gap-1">
                  <ClockIcon className="w-3 h-3" />
                  {reading.reading_time || "5-10 menit"}
                </span>
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {reading.author || "Pipinipon"}
                </span>
              </div>
            </div>
            
            {/* Arrow indicator */}
            <div className="flex items-center pr-3 md:pr-4">
              <ChevronRight className={`w-4 h-4 transition-colors ${
                isDark ? 'text-gray-600 group-hover:text-emerald-400' : 'text-gray-400 group-hover:text-emerald-500'
              }`} />
            </div>
          </div>
          
          {reading.completed && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-emerald-600" />
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth()
  const { theme } = useTheme()
  const { toast } = useToast()
  const [masteredCount, setMasteredCount] = useState(0)
  const [totalStudied, setTotalStudied] = useState(0)
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statsByLevel, setStatsByLevel] = useState<any[]>([])
  const [streakData, setStreakData] = useState<any[]>([])
  const [currentStreak, setCurrentStreak] = useState(0)
  const [longestStreak, setLongestStreak] = useState(0)
  const [fetchError, setFetchError] = useState(false)
  const [recentReadings, setRecentReadings] = useState<any[]>([])
  const [readingStats, setReadingStats] = useState<any>({ total_readings: 0, completed_readings: 0, completion_rate: 0 })
  const [mounted, setMounted] = useState(false)

  const isDark = theme === "dark"

  useEffect(() => {
    setMounted(true)
  }, [])

  const calculateLevel = (xp: number) => {
    const level = Math.floor(xp / 100) + 1
    return Math.min(level, 100)
  }

  const calculateNextLevelXP = (xp: number) => {
    const currentLevel = calculateLevel(xp)
    const nextLevelXP = currentLevel * 100
    const xpNeeded = nextLevelXP - xp
    const xpInCurrentLevel = xp - ((currentLevel - 1) * 100)
    const progress = (xpInCurrentLevel / 100) * 100
    
    return {
      currentLevel,
      nextLevelXP,
      xpNeeded,
      xpInCurrentLevel,
      progress
    }
  }

  const defaultLevelInfo = {
    currentLevel: 1,
    nextLevelXP: 100,
    xpNeeded: 100,
    xpInCurrentLevel: 0,
    progress: 0
  }

  const levelInfo = user ? calculateNextLevelXP(user.xp || 0) : defaultLevelInfo

  const getRank = (level: number) => {
    if (level >= 50) return { name: "Master Jepang", icon: Medal, color: "from-purple-500 to-pink-500" }
    if (level >= 30) return { name: "Ahli Bahasa", icon: Star, color: "from-blue-500 to-cyan-500" }
    if (level >= 15) return { name: "Pembelajar Mahir", icon: Trophy, color: "from-green-500 to-emerald-500" }
    if (level >= 5) return { name: "Pembelajar Aktif", icon: Zap, color: "from-yellow-500 to-orange-500" }
    return { name: "Pemula", icon: BookOpen, color: "from-gray-500 to-gray-600" }
  }

  const rankInfo = user ? getRank(levelInfo.currentLevel) : { name: "Pemula", icon: BookOpen, color: "from-gray-500 to-gray-600" }
  const RankIcon = rankInfo.icon

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) {
        setLoading(false)
        return
      }
      
      setFetchError(false)
      
      try {
        let progress = []
        try {
          const progressResponse = await studyAPI.getProgress()
          progress = progressResponse?.data?.data?.progress || []
        } catch (err) {
          console.log("Progress API not available yet")
          progress = []
        }
        
        let statsByLevelData = []
        try {
          const statsResponse = await studyAPI.getStatsByLevel()
          statsByLevelData = statsResponse?.data?.data || []
        } catch (err) {
          console.log("Stats by level API not available yet")
          statsByLevelData = []
        }
        
        let streakDataArr = []
        try {
          const streakResponse = await studyAPI.getStreakCalendar?.()
          streakDataArr = streakResponse?.data?.data || []
        } catch (err) {
          console.log("Streak calendar API not available yet")
          streakDataArr = []
        }
        
        let readingStatsData = { total_readings: 0, completed_readings: 0, completion_rate: 0 }
        try {
          const readingStatsResponse = await readingAPI.getStats()
          readingStatsData = readingStatsResponse?.data?.data || readingStatsData
        } catch (err) {
          console.log("Reading stats API not available yet")
        }
        
        let recentReadingsData = []
        try {
          const readingsResponse = await readingAPI.getAll({ page: 1, per_page: 6, published_only: true })
          recentReadingsData = readingsResponse?.data?.data?.readings?.slice(0, 6) || []
        } catch (err) {
          console.log("Reading articles API not available yet")
          recentReadingsData = []
        }
        
        const mastered = progress.filter((p: any) => p.mastered === 1).length
        const studied = progress.length
        
        setMasteredCount(mastered)
        setTotalStudied(studied)
        setStatsByLevel(statsByLevelData)
        setCurrentStreak(user.streak || 0)
        setReadingStats(readingStatsData)
        setRecentReadings(recentReadingsData)
        
        if (Array.isArray(streakDataArr) && streakDataArr.length > 0) {
          setStreakData(streakDataArr)
          let maxStreak = 0
          let current = 0
          streakDataArr.forEach((day: any) => {
            if (day.studied) {
              current++
              maxStreak = Math.max(maxStreak, current)
            } else {
              current = 0
            }
          })
          setLongestStreak(maxStreak)
        }
        
        const recent = [...progress]
          .sort((a, b) => new Date(b.last_studied).getTime() - new Date(a.last_studied).getTime())
          .slice(0, 5)
        
        if (recent.length > 0) {
          const vocabIds = [...new Set(recent.map((p: any) => p.vocab_id))]
          const vocabPromises = vocabIds.map(id => vocabAPI.getById(id).catch(() => ({ data: { data: { vocab: null } } })))
          const vocabResponses = await Promise.all(vocabPromises)
          const map = new Map()
          vocabResponses.forEach(response => {
            const vocab = response?.data?.data?.vocab
            if (vocab) map.set(vocab.id, vocab)
          })
          
          const activityWithVocab = recent
            .map(activity => ({
              ...activity,
              vocab: map.get(activity.vocab_id)
            }))
            .filter(a => a.vocab)
          
          setRecentActivity(activityWithVocab)
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        setFetchError(true)
        toast({
          title: "Gagal Memuat Data",
          description: "Tidak dapat terhubung ke server. Silakan coba lagi nanti.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchDashboardData()
  }, [user, toast])

  const stats = [
    {
      title: "Kosakata Dipelajari",
      value: totalStudied,
      icon: BookOpen,
      color: "from-blue-500 to-cyan-500",
      link: "/vocabulary?mastered_status=all",
      description: "Total kosakata yang telah dipelajari",
    },
    {
      title: "Kosakata Dihafal",
      value: masteredCount,
      icon: CheckCircle,
      color: "from-green-500 to-emerald-500",
      link: "/vocabulary?mastered_status=mastered",
      description: "Kosakata yang sudah dihafal",
    },
    {
      title: "XP Terkumpul",
      value: user?.xp || 0,
      icon: Trophy,
      color: "from-yellow-500 to-orange-500",
      link: "/study",
      description: "Total pengalaman belajar",
    },
    {
      title: "Streak",
      value: `${currentStreak} hari`,
      icon: TrendingUp,
      color: "from-purple-500 to-pink-500",
      link: "/study",
      description: "Konsistensi belajar harian",
    },
  ]

  const getLevelProgress = (level: string) => {
    const levelStats = statsByLevel.find(s => s.level === level)
    if (levelStats) {
      return {
        mastered: levelStats.mastered || 0,
        total: levelStats.total_vocab || 0,
        percentage: levelStats.mastery_rate || 0
      }
    }
    return { mastered: 0, total: 0, percentage: 0 }
  }

  if (!mounted || authLoading || loading) {
    return (
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <Skeleton className="h-32 w-full" />
          </div>
          <Skeleton className="h-32 w-full" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Silakan Login</h2>
            <p className="text-muted-foreground mb-4">Anda harus login untuk melihat dashboard</p>
            <Link href="/login">
              <Button variant="japanese">Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* BANNER VERIFIKASI EMAIL */}
        {user.is_verified !== 1 && (
          <VerifyEmailBanner email={user.email} />
        )}

        {/* Error Banner */}
        {fetchError && (
          <div className="mb-4 p-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
            <p className="font-medium">Gagal memuat data dashboard</p>
            <p className="text-xs mt-1">Silakan refresh halaman atau coba lagi nanti.</p>
          </div>
        )}

        {/* Welcome Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2"
          >
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />
              <h1 className={`text-3xl md:text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Selamat Datang, {user?.username}!
              </h1>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Lanjutkan perjalanan belajarmu di sini
              </p>
              {user.is_verified !== 1 && (
                <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Verifikasi email Anda segera untuk mengaktifkan fitur lengkap
                </p>
              )}
              {user.is_verified === 1 && (
                <p className="text-sm text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Akun terverifikasi
                </p>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30 rounded-2xl shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${rankInfo.color} flex items-center justify-center shadow-md`}>
                      <RankIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Peringkat</p>
                      <p className="font-semibold">{rankInfo.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Level</p>
                    <p className="text-2xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                      {levelInfo.currentLevel}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">XP menuju level {levelInfo.currentLevel + 1}</span>
                    <span className="font-medium">
                      <AnimatedNumber value={levelInfo.xpInCurrentLevel} duration={800} delay={200} />/100 XP
                    </span>
                  </div>
                  <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${levelInfo.progress}%` }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    <AnimatedNumber value={levelInfo.xpNeeded} duration={800} delay={400} /> XP lagi untuk naik level
                  </p>
                </div>

                <div className="mt-3 pt-3 border-t border-yellow-500/20 flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total XP</span>
                  <span className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
                    <AnimatedNumber value={user?.xp || 0} duration={1000} delay={100} /> XP
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={stat.link}>
                <Card className={`cursor-pointer hover:shadow-lg transition-all duration-300 rounded-2xl border-0 shadow-md ${
                  isDark ? 'bg-gray-900' : 'bg-white'
                }`}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {stat.title}
                    </CardTitle>
                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center shadow-sm`}>
                      <stat.icon className="w-4 h-4 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {stat.title === "Streak" ? (
                        <AnimatedNumber value={currentStreak} duration={800} delay={index * 100} /> 
                      ) : stat.title === "XP Terkumpul" ? (
                        <AnimatedNumber value={stat.value as number} duration={1000} delay={index * 100} />
                      ) : (
                        <AnimatedNumber value={stat.value as number} duration={800} delay={index * 100} />
                      )}
                      {stat.title === "Streak" && " hari"}
                    </div>
                    <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{stat.description}</p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Calendar Streak Section */}
        {streakData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <CalendarStreak 
              streakData={streakData}
              currentStreak={currentStreak}
              longestStreak={longestStreak}
              totalStudyDays={totalStudied}
            />
          </motion.div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className={`rounded-2xl border-0 shadow-md h-full ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-emerald-500" />
                  <CardTitle className={isDark ? 'text-white' : 'text-gray-900'}>Rekomendasi Belajar</CardTitle>
                </div>
                <CardDescription>
                  Mulai belajar dengan materi yang sesuai untukmu
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/vocabulary?jlpt_level=N5">
                  <Button variant="outline" className={`w-full justify-start rounded-xl transition-all duration-300 ${
                    isDark ? 'hover:bg-emerald-950/20 border-gray-700' : 'hover:bg-emerald-50'
                  }`}>
                    <BookOpen className="mr-2 h-4 w-4" />
                    Pelajari Kosakata N5
                  </Button>
                </Link>
                <Link href="/grammar?level=N5">
                  <Button variant="outline" className={`w-full justify-start rounded-xl transition-all duration-300 ${
                    isDark ? 'hover:bg-emerald-950/20 border-gray-700' : 'hover:bg-emerald-50'
                  }`}>
                    <GraduationCap className="mr-2 h-4 w-4" />
                    Pelajari Tata Bahasa N5
                  </Button>
                </Link>
                <Link href="/reading">
                  <Button variant="outline" className={`w-full justify-start rounded-xl transition-all duration-300 ${
                    isDark ? 'hover:bg-emerald-950/20 border-gray-700' : 'hover:bg-emerald-50'
                  }`}>
                    <Newspaper className="mr-2 h-4 w-4" />
                    Baca Artikel Bahasa Jepang
                  </Button>
                </Link>
                <Link href="/study">
                  <Button variant="outline" className={`w-full justify-start rounded-xl transition-all duration-300 ${
                    isDark ? 'hover:bg-emerald-950/20 border-gray-700' : 'hover:bg-emerald-50'
                  }`}>
                    <Target className="mr-2 h-4 w-4" />
                    Latihan Soal
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className={`rounded-2xl border-0 shadow-md h-full ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-emerald-500" />
                  <CardTitle className={isDark ? 'text-white' : 'text-gray-900'}>Aktivitas Terbaru</CardTitle>
                </div>
                <CardDescription>
                  Lihat perkembangan belajarmu di sini
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentActivity.length > 0 ? (
                  <div className="space-y-2">
                    {recentActivity.map((activity) => (
                      <Link 
                        key={activity.id} 
                        href={`/vocabulary/${activity.vocab_id}`}
                      >
                        <motion.div 
                          className={`flex items-center justify-between p-3 rounded-xl transition-all duration-300 ${
                            isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
                          }`}
                          whileHover={{ x: 4 }}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${activity.mastered === 1 ? 'bg-green-500' : 'bg-yellow-500'}`} />
                            <div>
                              <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {activity.vocab?.kanji || 'Loading...'}
                              </p>
                              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {activity.vocab?.arti || ''}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex gap-2 text-xs">
                              <span className="text-green-600 dark:text-green-400">
                                <AnimatedNumber value={activity.correct_count || 0} duration={500} /> benar
                              </span>
                              <span className="text-red-600 dark:text-red-400">
                                <AnimatedNumber value={activity.wrong_count || 0} duration={500} /> salah
                              </span>
                            </div>
                            <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                              {formatRelativeTime(activity.last_studied)}
                            </p>
                          </div>
                        </motion.div>
                      </Link>
                    ))}
                    <Link href="/study">
                      <Button variant="ghost" className="w-full mt-2 rounded-xl">
                        Lihat semua aktivitas
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Belum ada riwayat belajar</p>
                    <p className="text-sm mt-1">Mulai belajar sekarang untuk melihat progressmu!</p>
                    <Link href="/study">
                      <Button variant="japanese" className="mt-4 rounded-xl">
                        Mulai Belajar
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Japanese Reading Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="mb-6"
        >
          <Card className={`rounded-2xl border-0 shadow-md overflow-hidden ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 flex items-center justify-center">
                    <Newspaper className="h-4 w-4 text-white" />
                  </div>
                  <CardTitle className={isDark ? 'text-white' : 'text-gray-900'}>Artikel Bacaan</CardTitle>
                </div>
                <Link href="/reading">
                  <Button variant="ghost" size="sm" className="text-emerald-600 rounded-xl">
                    Lihat semua →
                  </Button>
                </Link>
              </div>
              <CardDescription>
                Tingkatkan kemampuan membaca dengan artikel ber-furigana
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentReadings.length > 0 ? (
                <div className="space-y-3">
                  {recentReadings.map((reading, idx) => (
                    <ReadingCard 
                      key={reading.id} 
                      reading={reading} 
                      index={idx}
                      isDark={isDark}
                      onPress={() => window.location.href = `/reading/${reading.id}`}
                    />
                  ))}
                  
                  <div className={`mt-4 pt-4 border-t flex justify-between text-sm ${
                    isDark ? 'border-gray-800 text-gray-400' : 'border-gray-100 text-gray-500'
                  }`}>
                    <span>Total dibaca: <AnimatedNumber value={readingStats.total_readings} duration={800} /></span>
                    <span>Selesai: <AnimatedNumber value={readingStats.completed_readings} duration={800} /></span>
                    <span>Progress: <AnimatedNumber value={readingStats.completion_rate} duration={800} />%</span>
                  </div>
                </div>
              ) : (
                <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Newspaper className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Belum ada artikel yang dibaca</p>
                  <Link href="/reading">
                    <Button variant="japanese" size="sm" className="mt-4 rounded-xl">
                      Mulai Membaca
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Level Progress Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-6"
        >
          <Card className={`rounded-2xl border-0 shadow-md ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
            <CardHeader>
              <CardTitle className={isDark ? 'text-white' : 'text-gray-900'}>Progress Level JLPT</CardTitle>
              <CardDescription>
                Pantau perkembangan belajarmu di setiap level
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {["N5", "N4", "N3", "N2", "N1"].map((level) => {
                  const progress = getLevelProgress(level)
                  return (
                    <Link key={level} href={`/vocabulary?jlpt_level=${level}`}>
                      <motion.div 
                        className={`text-center p-3 rounded-xl transition-all duration-300 cursor-pointer ${
                          isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
                        }`}
                        whileHover={{ y: -4 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="text-lg font-bold bg-gradient-to-r from-emerald-500 to-emerald-600 bg-clip-text text-transparent">
                          {level}
                        </div>
                        <div className={`text-2xl font-bold mt-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          <AnimatedNumber value={progress.percentage} duration={800} />%
                        </div>
                        <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          <AnimatedNumber value={progress.mastered} duration={500} />/{progress.total} dihafal
                        </div>
                        <div className="mt-2 h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress.percentage}%` }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                          />
                        </div>
                      </motion.div>
                    </Link>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Mastering Tips */}
        {masteredCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-6"
          >
            <Card className={`rounded-2xl border-0 shadow-md ${
              isDark ? 'bg-emerald-950/20 border border-emerald-800/30' : 'bg-emerald-50'
            }`}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 flex-wrap justify-between">
                  <div>
                    <h3 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Selamat! Kamu sudah menghafal <AnimatedNumber value={masteredCount} duration={1000} /> kosakata!
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Terus pertahankan konsistensi belajarmu setiap hari.
                    </p>
                  </div>
                  <Link href="/study">
                    <Button variant="japanese" size="sm" className="rounded-xl">
                      Lanjutkan Belajar
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}