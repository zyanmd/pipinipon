"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/hooks/use-auth"
import { studyAPI, vocabAPI } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CalendarStreak } from "@/components/ui/calendar-streak"
import { BookOpen, GraduationCap, Trophy, TrendingUp, Calendar, Target, Sparkles, Clock, CheckCircle, Medal, Star, Zap } from "lucide-react"
import { motion } from "framer-motion"
import { formatRelativeTime } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"

export default function DashboardPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [masteredCount, setMasteredCount] = useState(0)
  const [totalStudied, setTotalStudied] = useState(0)
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statsByLevel, setStatsByLevel] = useState<any[]>([])
  const [streakData, setStreakData] = useState<any[]>([])
  const [currentStreak, setCurrentStreak] = useState(0)
  const [longestStreak, setLongestStreak] = useState(0)

  // Hitung level berdasarkan XP
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
      if (!user) return
      
      try {
        const [progressResponse, statsResponse, streakResponse] = await Promise.all([
          studyAPI.getProgress(),
          studyAPI.getStatsByLevel(),
          studyAPI.getStreakCalendar?.() || Promise.resolve({ data: { data: [] } })
        ])
        
        const progress = progressResponse.data.data.progress || []
        const mastered = progress.filter((p: any) => p.mastered === 1).length
        const studied = progress.length
        
        setMasteredCount(mastered)
        setTotalStudied(studied)
        setStatsByLevel(statsResponse.data.data || [])
        setCurrentStreak(user.streak || 0)
        
        // Process streak data for calendar
        if (streakResponse.data.data && Array.isArray(streakResponse.data.data)) {
          setStreakData(streakResponse.data.data)
          let maxStreak = 0
          let current = 0
          streakResponse.data.data.forEach((day: any) => {
            if (day.studied) {
              current++
              maxStreak = Math.max(maxStreak, current)
            } else {
              current = 0
            }
          })
          setLongestStreak(maxStreak)
        }
        
        // Get recent activity
        const recent = [...progress]
          .sort((a, b) => new Date(b.last_studied).getTime() - new Date(a.last_studied).getTime())
          .slice(0, 5)
        
        if (recent.length > 0) {
          const vocabIds = [...new Set(recent.map((p: any) => p.vocab_id))]
          const vocabPromises = vocabIds.map(id => vocabAPI.getById(id))
          const vocabResponses = await Promise.all(vocabPromises)
          const map = new Map()
          vocabResponses.forEach(response => {
            const vocab = response.data.data.vocab
            map.set(vocab.id, vocab)
          })
          
          const activityWithVocab = recent.map(activity => ({
            ...activity,
            vocab: map.get(activity.vocab_id)
          })).filter(a => a.vocab)
          
          setRecentActivity(activityWithVocab)
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchDashboardData()
  }, [user])

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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section with XP Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2"
        >
          <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2">
            Selamat Datang, {user?.username}!
          </h1>
          <p className="text-muted-foreground">
            Lanjutkan perjalanan belajarmu di sini
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${rankInfo.color} flex items-center justify-center`}>
                    <RankIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Peringkat</p>
                    <p className="font-semibold">{rankInfo.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Level</p>
                  <p className="text-2xl font-bold gradient-text">{levelInfo.currentLevel}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">XP menuju level {levelInfo.currentLevel + 1}</span>
                  <span className="font-medium">{levelInfo.xpInCurrentLevel}/100 XP</span>
                </div>
                <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${levelInfo.progress}%` }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  {levelInfo.xpNeeded} XP lagi untuk naik ke level {levelInfo.currentLevel + 1}
                </p>
              </div>

              <div className="mt-3 pt-3 border-t border-yellow-500/20 flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total XP</span>
                <span className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
                  {user?.xp || 0} XP
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
              <Card className="cursor-pointer card-hover h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-4 h-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Calendar Streak Section - tanpa reminder */}
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

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-japanese-500" />
                <CardTitle>Rekomendasi Belajar</CardTitle>
              </div>
              <CardDescription>
                Mulai belajar dengan materi yang sesuai untukmu
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/vocabulary?jlpt_level=N5">
                <Button variant="outline" className="w-full justify-start hover:bg-japanese-50 dark:hover:bg-japanese-950/20 transition-colors">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Pelajari Kosakata N5
                </Button>
              </Link>
              <Link href="/grammar?level=N5">
                <Button variant="outline" className="w-full justify-start hover:bg-japanese-50 dark:hover:bg-japanese-950/20 transition-colors">
                  <GraduationCap className="mr-2 h-4 w-4" />
                  Pelajari Tata Bahasa N5
                </Button>
              </Link>
              <Link href="/study">
                <Button variant="outline" className="w-full justify-start hover:bg-japanese-50 dark:hover:bg-japanese-950/20 transition-colors">
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
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-japanese-500" />
                <CardTitle>Aktivitas Terbaru</CardTitle>
              </div>
              <CardDescription>
                Lihat perkembangan belajarmu di sini
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {recentActivity.map((activity) => (
                    <Link 
                      key={activity.id} 
                      href={`/vocabulary/${activity.vocab_id}`}
                      className="block"
                    >
                      <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${activity.mastered === 1 ? 'bg-green-500' : 'bg-yellow-500'}`} />
                          <div>
                            <p className="font-medium">{activity.vocab?.kanji || 'Loading...'}</p>
                            <p className="text-xs text-muted-foreground">{activity.vocab?.arti || ''}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex gap-2 text-xs">
                            <span className="text-green-600 dark:text-green-400">✓ {activity.correct_count}</span>
                            <span className="text-red-600 dark:text-red-400">✗ {activity.wrong_count}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatRelativeTime(activity.last_studied)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                  <Link href="/study">
                    <Button variant="ghost" className="w-full mt-2">
                      Lihat semua aktivitas
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Belum ada riwayat belajar</p>
                  <p className="text-sm mt-1">Mulai belajar sekarang untuk melihat progressmu!</p>
                  <Link href="/study">
                    <Button variant="japanese" className="mt-4">
                      Mulai Belajar
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Level Progress Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-8"
      >
        <Card>
          <CardHeader>
            <CardTitle>Progress Level JLPT</CardTitle>
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
                    <div className="text-center p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className="text-lg font-bold gradient-text">{level}</div>
                      <div className="text-2xl font-bold mt-2">{progress.percentage}%</div>
                      <div className="text-xs text-muted-foreground">
                        {progress.mastered}/{progress.total} dihafal
                      </div>
                      <div className="mt-2 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-japanese-500 to-japanese-600 rounded-full transition-all duration-500"
                          style={{ width: `${progress.percentage}%` }}
                        />
                      </div>
                    </div>
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
          <Card className="bg-gradient-to-r from-japanese-50 to-japanese-100 dark:from-japanese-950/30 dark:to-japanese-900/20 border-japanese-200 dark:border-japanese-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 flex-wrap justify-between">
                <div>
                  <h3 className="font-semibold mb-1">🎉 Selamat! Kamu sudah menghafal {masteredCount} kosakata!</h3>
                  <p className="text-sm text-muted-foreground">
                    Terus pertahankan konsistensi belajarmu setiap hari.
                  </p>
                </div>
                <Link href="/study">
                  <Button variant="japanese" size="sm">
                    Lanjutkan Belajar
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}