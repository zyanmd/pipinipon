"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useTheme } from "@/components/providers/theme-provider"
import { useAuth } from "@/lib/hooks/use-auth"
import { leaderboardAPI } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Trophy, Medal, Crown, Star, TrendingUp, Award, Users, Zap, RefreshCw, Flame } from "lucide-react"
import { motion, useInView } from "framer-motion"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// ==================== ANIMATED NUMBER COMPONENT ====================
const AnimatedNumber = ({ value, duration = 1000 }: { value: number; duration?: number }) => {
  const [displayValue, setDisplayValue] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.5 })

  useEffect(() => {
    if (isInView) {
      let startTime: number
      let animationFrame: number
      
      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime
        const progress = Math.min((currentTime - startTime) / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        setDisplayValue(Math.floor(eased * value))
        
        if (progress < 1) {
          animationFrame = requestAnimationFrame(animate)
        }
      }
      
      animationFrame = requestAnimationFrame(animate)
      return () => cancelAnimationFrame(animationFrame)
    } else if (!isInView && displayValue !== 0) {
      setDisplayValue(0)
    }
  }, [isInView, value, duration])

  return <span ref={ref}>{displayValue.toLocaleString()}</span>
}

// ==================== INTERFACES ====================
interface XPLeaderboardUser {
  rank: number
  user_id: number
  username: string
  name: string
  avatar: string | null
  xp: number
  level: string
  streak: number
  role?: string
}

// ==================== HELPER FUNCTIONS ====================
const getImageUrl = (path: string | null | undefined): string => {
  if (!path) return ''
  if (path.startsWith('http')) return path
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://api.pipinipon.site'
  return `${baseUrl}/uploads/${path}`
}

const getLevelBgClass = (level: string, isDark: boolean = false): string => {
  const lightClasses: Record<string, string> = {
    N5: "bg-green-100 text-green-700",
    N4: "bg-sky-100 text-sky-700",
    N3: "bg-amber-100 text-amber-700",
    N2: "bg-orange-100 text-orange-700",
    N1: "bg-rose-100 text-rose-700"
  }
  const darkClasses: Record<string, string> = {
    N5: "bg-green-950/50 text-green-400 border border-green-500/30",
    N4: "bg-sky-950/50 text-sky-400 border border-sky-500/30",
    N3: "bg-amber-950/50 text-amber-400 border border-amber-500/30",
    N2: "bg-orange-950/50 text-orange-400 border border-orange-500/30",
    N1: "bg-rose-950/50 text-rose-400 border border-rose-500/30"
  }
  return isDark ? (darkClasses[level] || "bg-gray-800 text-gray-400") : (lightClasses[level] || "bg-gray-100 text-gray-600")
}

const getLevelLabel = (level: string): string => {
  const labels: Record<string, string> = {
    N5: "Pemula",
    N4: "Dasar",
    N3: "Menengah",
    N2: "Mahir",
    N1: "Lanjut"
  }
  return labels[level] || level
}

// ==================== MAIN COMPONENT ====================
export default function LeaderboardPage() {
  const { user } = useAuth()
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const [activeTab, setActiveTab] = useState("xp")
  const [xpLeaderboard, setXpLeaderboard] = useState<XPLeaderboardUser[]>([])
  const [streakLeaderboard, setStreakLeaderboard] = useState<XPLeaderboardUser[]>([])
  const [masteryLeaderboard, setMasteryLeaderboard] = useState<XPLeaderboardUser[]>([])
  const [readingLeaderboard, setReadingLeaderboard] = useState<XPLeaderboardUser[]>([])
  const [combinedLeaderboard, setCombinedLeaderboard] = useState<XPLeaderboardUser[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null)
  const [period, setPeriod] = useState("all")
  const [levelFilter, setLevelFilter] = useState("")

  const fetchLeaderboards = async () => {
    setLoading(true)
    try {
      const [xpRes, streakRes, masteryRes, readingRes, combinedRes] = await Promise.all([
        leaderboardAPI.getXPLeaderboard({ limit: 100, period }),
        leaderboardAPI.getStreakLeaderboard({ limit: 100 }),
        leaderboardAPI.getMasteryLeaderboard({ limit: 100, level: levelFilter || undefined }),
        leaderboardAPI.getReadingLeaderboard({ limit: 100 }),
        leaderboardAPI.getCombinedLeaderboard({ limit: 100 })
      ])

      if (xpRes.data.success) {
        setXpLeaderboard(xpRes.data.data.leaderboard)
        if (activeTab === "xp") {
          setCurrentUserRank(xpRes.data.data.current_user_rank)
        }
      }
      if (streakRes.data.success) {
        setStreakLeaderboard(streakRes.data.data.leaderboard)
      }
      if (masteryRes.data.success) {
        setMasteryLeaderboard(masteryRes.data.data.leaderboard)
      }
      if (readingRes.data.success) {
        setReadingLeaderboard(readingRes.data.data.leaderboard)
      }
      if (combinedRes.data.success) {
        setCombinedLeaderboard(combinedRes.data.data.leaderboard)
      }
    } catch (error) {
      console.error("Error fetching leaderboards:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchLeaderboards()
  }, [period, levelFilter])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchLeaderboards()
  }

  const getCurrentLeaderboard = () => {
    switch (activeTab) {
      case "xp": return xpLeaderboard
      case "streak": return streakLeaderboard
      case "mastery": return masteryLeaderboard
      case "reading": return readingLeaderboard
      case "combined": return combinedLeaderboard
      default: return xpLeaderboard
    }
  }

  const getLeaderboardTitle = () => {
    switch (activeTab) {
      case "xp": return "Peringkat XP"
      case "streak": return "Peringkat Streak"
      case "mastery": return "Peringkat Penguasaan Kosakata"
      case "reading": return "Peringkat Pembaca Artikel"
      case "combined": return "Peringkat Keseluruhan"
      default: return "Peringkat XP"
    }
  }

  const getLeaderboardDescription = () => {
    switch (activeTab) {
      case "xp": return "Berdasarkan total XP yang dikumpulkan"
      case "streak": return "Berdasarkan konsistensi belajar harian"
      case "mastery": return "Berdasarkan jumlah kosakata yang dikuasai"
      case "reading": return "Berdasarkan jumlah artikel yang selesai dibaca"
      case "combined": return "Kombinasi XP, Streak, Mastery, dan Bacaan"
      default: return "Berdasarkan total XP yang dikumpulkan"
    }
  }

  const getStatValue = (user: XPLeaderboardUser) => {
    switch (activeTab) {
      case "xp": return user.xp
      case "streak": return user.streak
      case "mastery": return (user as any).mastered_count || 0
      case "reading": return (user as any).completed_count || 0
      case "combined": return (user as any).combined_score || user.xp
      default: return user.xp
    }
  }

  const getStatLabel = () => {
    switch (activeTab) {
      case "xp": return "XP"
      case "streak": return "hari"
      case "mastery": return "kosakata"
      case "reading": return "artikel"
      case "combined": return "poin"
      default: return "XP"
    }
  }

  const getStatIcon = () => {
    switch (activeTab) {
      case "xp": return <Star className="h-4 w-4 text-yellow-500" />
      case "streak": return <Flame className="h-4 w-4 text-orange-500" />
      case "mastery": return <Award className="h-4 w-4 text-green-500" />
      case "reading": return <Trophy className="h-4 w-4 text-blue-500" />
      case "combined": return <Zap className="h-4 w-4 text-purple-500" />
      default: return <Star className="h-4 w-4 text-yellow-500" />
    }
  }

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return { bg: "from-yellow-500 to-amber-500", text: "text-white", icon: <Crown className="h-5 w-5" /> }
      case 2:
        return { bg: "from-gray-400 to-gray-500", text: "text-white", icon: <Medal className="h-5 w-5" /> }
      case 3:
        return { bg: "from-amber-600 to-orange-600", text: "text-white", icon: <Medal className="h-5 w-5" /> }
      default:
        return { bg: "from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-800", text: "text-gray-700 dark:text-gray-300", icon: null }
    }
  }

  const currentLeaderboard = getCurrentLeaderboard()
  const top3 = currentLeaderboard.slice(0, 3)
  const restUsers = currentLeaderboard.slice(3)

  if (loading) {
    return (
      <div className={cn("min-h-screen", isDark ? "bg-gray-950" : "bg-gray-50")}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <Skeleton className={cn("h-12 w-64 mx-auto mb-4", isDark ? "bg-gray-800" : "bg-gray-200")} />
            <Skeleton className={cn("h-4 w-96 mx-auto", isDark ? "bg-gray-800" : "bg-gray-200")} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className={cn("h-64 rounded-xl", isDark ? "bg-gray-800" : "bg-gray-200")} />
            ))}
          </div>
          <Skeleton className={cn("h-96 w-full rounded-xl", isDark ? "bg-gray-800" : "bg-gray-200")} />
        </div>
      </div>
    )
  }

  return (
    <div className={cn("min-h-screen", isDark ? "bg-gray-950" : "bg-gray-50")}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-4",
            isDark ? "bg-yellow-500/10 border-yellow-500/20" : "bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/20"
          )}>
            <Trophy className="h-4 w-4 text-yellow-500" />
            <span className={cn("text-sm font-medium", isDark ? "text-yellow-400" : "text-yellow-600")}>
              Papan Peringkat
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent mb-4">
            Leaderboard
          </h1>
          <p className={cn("max-w-2xl mx-auto", isDark ? "text-gray-400" : "text-gray-600")}>
            Lihat peringkat pengguna teraktif dan raih posisi teratas!
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="mt-4 rounded-full"
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
            Refresh
          </Button>
        </motion.div>

        {/* Tabs */}
        <div className="mb-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className={cn("w-full justify-start mb-6", isDark ? "bg-gray-800" : "bg-gray-100")}>
              <TabsTrigger value="xp" className="flex items-center gap-2">
                <Star className="h-4 w-4" /> Top XP
              </TabsTrigger>
              <TabsTrigger value="streak" className="flex items-center gap-2">
                <Flame className="h-4 w-4" /> Top Streak
              </TabsTrigger>
              <TabsTrigger value="mastery" className="flex items-center gap-2">
                <Award className="h-4 w-4" /> Top Mastery
              </TabsTrigger>
              <TabsTrigger value="reading" className="flex items-center gap-2">
                <Trophy className="h-4 w-4" /> Top Pembaca
              </TabsTrigger>
              <TabsTrigger value="combined" className="flex items-center gap-2">
                <Zap className="h-4 w-4" /> Keseluruhan
              </TabsTrigger>
            </TabsList>

            {/* Filters for mastery tab */}
            {activeTab === "mastery" && (
              <div className="flex gap-2 flex-wrap mb-6">
                {['', 'N5', 'N4', 'N3', 'N2', 'N1'].map((level) => (
                  <button
                    key={level || 'all'}
                    onClick={() => setLevelFilter(level)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
                      levelFilter === level
                        ? 'bg-orange-500 text-white'
                        : isDark 
                          ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    )}
                  >
                    {level || 'Semua Level'}
                  </button>
                ))}
              </div>
            )}

            {/* Period filter for XP tab */}
            {activeTab === "xp" && (
              <div className="flex gap-2 flex-wrap mb-6">
                {['all', 'weekly', 'monthly'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
                      period === p
                        ? 'bg-orange-500 text-white'
                        : isDark 
                          ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    )}
                  >
                    {p === 'all' ? 'Semua Waktu' : p === 'weekly' ? 'Mingguan' : 'Bulanan'}
                  </button>
                ))}
              </div>
            )}
          </Tabs>
        </div>

        {/* Total Users Stats */}
        <div className="text-center mb-8">
          <p className={cn("text-sm", isDark ? "text-gray-500" : "text-gray-400")}>
            Menampilkan {currentLeaderboard.length} pengguna teratas
          </p>
        </div>

        {/* Podium Section */}
        {top3.length >= 3 && top3[0]?.xp > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-16"
          >
            <div className="relative flex justify-center items-end gap-4 flex-wrap">
              {/* 2nd Place (Left) */}
              <div className="flex-1 min-w-[250px] max-w-[280px] text-center order-first">
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="relative"
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-10">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center shadow-lg">
                      <Medal className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <Link href={`/profile/${top3[1]?.username}`}>
                    <div className={cn(
                      "rounded-t-2xl p-6 pt-8 shadow-xl border cursor-pointer hover:scale-105 transition-transform duration-300",
                      isDark 
                        ? "bg-gray-800/50 border-gray-700 hover:bg-gray-800"
                        : "bg-gradient-to-b from-gray-100 to-gray-200 border-gray-200"
                    )}>
                      <Avatar className="w-20 h-20 mx-auto mb-3 ring-4 ring-gray-400 dark:ring-gray-600">
                        <AvatarImage src={getImageUrl(top3[1]?.avatar)} />
                        <AvatarFallback className="bg-gradient-to-br from-gray-400 to-gray-500 text-white text-2xl">
                          {top3[1]?.username?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <p className={cn("font-bold text-lg", isDark ? "text-white" : "text-gray-900")}>
                          {top3[1]?.username}
                        </p>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">Peringkat 2</p>
                      <div className="flex items-center justify-center gap-2 text-yellow-500">
                        {getStatIcon()}
                        <span className="font-bold text-xl">
                          <AnimatedNumber value={getStatValue(top3[1])} />
                        </span>
                        <span className="text-xs">{getStatLabel()}</span>
                      </div>
                      <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-gray-200 dark:bg-gray-700">
                        {getLevelLabel(top3[1]?.level)}
                      </div>
                    </div>
                  </Link>
                  <div className={cn("h-4 rounded-b-lg", isDark ? "bg-gray-800" : "bg-gradient-to-b from-gray-200 to-gray-300")} />
                </motion.div>
              </div>

              {/* 1st Place (Center - Tallest) */}
              <div className="flex-1 min-w-[280px] max-w-[340px] text-center">
                <motion.div
                  initial={{ y: 60, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="relative"
                >
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-10">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center shadow-lg animate-pulse">
                      <Crown className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <Link href={`/profile/${top3[0]?.username}`}>
                    <div className={cn(
                      "rounded-t-2xl p-6 pt-10 shadow-2xl border cursor-pointer hover:scale-105 transition-transform duration-300",
                      isDark 
                        ? "bg-gradient-to-b from-yellow-950/20 to-amber-950/10 border-yellow-800/50"
                        : "bg-gradient-to-b from-yellow-50 to-amber-50 border-yellow-200"
                    )}>
                      <Avatar className="w-28 h-28 mx-auto mb-3 ring-4 ring-yellow-500">
                        <AvatarImage src={getImageUrl(top3[0]?.avatar)} />
                        <AvatarFallback className="bg-gradient-to-br from-yellow-500 to-amber-500 text-white text-3xl">
                          {top3[0]?.username?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <p className={cn("font-bold text-xl", isDark ? "text-white" : "text-gray-900")}>
                          {top3[0]?.username}
                        </p>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">Peringkat 1</p>
                      <div className="flex items-center justify-center gap-2 text-yellow-500">
                        {getStatIcon()}
                        <span className="font-bold text-2xl">
                          <AnimatedNumber value={getStatValue(top3[0])} duration={1500} />
                        </span>
                        <span className="text-xs">{getStatLabel()}</span>
                      </div>
                      <div className="mt-3 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">
                        <Zap className="h-3 w-3" />
                        Top Leader
                      </div>
                    </div>
                  </Link>
                  <div className={cn("h-6 rounded-b-lg", isDark ? "bg-yellow-900/30" : "bg-gradient-to-b from-yellow-100 to-yellow-200")} />
                </motion.div>
              </div>

              {/* 3rd Place (Right) */}
              <div className="flex-1 min-w-[250px] max-w-[280px] text-center order-last">
                <motion.div
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="relative"
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-10">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-600 to-orange-600 dark:from-amber-700 dark:to-orange-700 flex items-center justify-center shadow-lg">
                      <Medal className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <Link href={`/profile/${top3[2]?.username}`}>
                    <div className={cn(
                      "rounded-t-2xl p-6 pt-8 shadow-xl border cursor-pointer hover:scale-105 transition-transform duration-300",
                      isDark 
                        ? "bg-gradient-to-b from-amber-950/20 to-orange-950/10 border-amber-800/50"
                        : "bg-gradient-to-b from-amber-50 to-orange-50 border-amber-200"
                    )}>
                      <Avatar className="w-20 h-20 mx-auto mb-3 ring-4 ring-amber-600">
                        <AvatarImage src={getImageUrl(top3[2]?.avatar)} />
                        <AvatarFallback className="bg-gradient-to-br from-amber-600 to-orange-600 text-white text-2xl">
                          {top3[2]?.username?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <p className={cn("font-bold text-lg", isDark ? "text-white" : "text-gray-900")}>
                          {top3[2]?.username}
                        </p>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">Peringkat 3</p>
                      <div className="flex items-center justify-center gap-2 text-amber-600 dark:text-amber-400">
                        {getStatIcon()}
                        <span className="font-bold text-xl">
                          <AnimatedNumber value={getStatValue(top3[2])} />
                        </span>
                        <span className="text-xs">{getStatLabel()}</span>
                      </div>
                      <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-amber-100 dark:bg-amber-900/30">
                        {getLevelLabel(top3[2]?.level)}
                      </div>
                    </div>
                  </Link>
                  <div className={cn("h-4 rounded-b-lg", isDark ? "bg-amber-900/30" : "bg-gradient-to-b from-amber-100 to-amber-200")} />
                </motion.div>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="text-center py-12 mb-8">
            <Trophy className={cn("w-16 h-16 mx-auto mb-4 opacity-30", isDark ? "text-gray-700" : "text-gray-300")} />
            <p className={cn(isDark ? "text-gray-500" : "text-gray-400")}>Belum ada data leaderboard</p>
          </div>
        )}

        {/* Full Leaderboard Table */}
        {restUsers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className={cn("border", isDark ? "bg-gray-900/50 border-gray-800" : "bg-white border-gray-200")}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-orange-500" />
                  {getLeaderboardTitle()}
                </CardTitle>
                <CardDescription className={isDark ? "text-gray-400" : "text-gray-500"}>
                  {getLeaderboardDescription()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className={cn("border-b", isDark ? "border-gray-800" : "border-gray-200")}>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Peringkat</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Pengguna</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Level</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-500">{getLeaderboardTitle()}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {restUsers.map((u, idx) => {
                        const rank = idx + 4
                        const rankBadge = getRankBadge(rank)
                        return (
                          <motion.tr
                            key={u.user_id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.05 * idx }}
                            className={cn(
                              "border-b transition-colors",
                              isDark ? "border-gray-800 hover:bg-gray-800/50" : "border-gray-100 hover:bg-gray-50",
                              user?.id === u.user_id && (isDark ? "bg-orange-950/20" : "bg-orange-50")
                            )}
                          >
                            <td className="py-3 px-4">
                              <div className={cn(
                                "w-8 h-8 rounded-full bg-gradient-to-r flex items-center justify-center font-bold",
                                rankBadge.bg,
                                rankBadge.text
                              )}>
                                {rankBadge.icon ? rankBadge.icon : rank}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <Link href={`/profile/${u.username}`}>
                                <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
                                  <Avatar className="h-10 w-10">
                                    <AvatarImage src={getImageUrl(u.avatar)} />
                                    <AvatarFallback className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                                      {u.username?.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="flex items-center gap-1">
                                      <span className={cn("font-medium", isDark ? "text-white" : "text-gray-900")}>
                                        {u.username}
                                      </span>
                                      {(u as any).role === 'admin' && (
                                        <span className="text-xs px-1.5 py-0.5 rounded bg-purple-500 text-white">Admin</span>
                                      )}
                                    </div>
                                    <p className="text-xs text-gray-500">{u.name || u.username}</p>
                                  </div>
                                </div>
                              </Link>
                            </td>
                            <td className="py-3 px-4">
                              <span className={cn(
                                "text-xs px-2 py-1 rounded-full",
                                getLevelBgClass(u.level, isDark)
                              )}>
                                {getLevelLabel(u.level)}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1">
                                {getStatIcon()}
                                <span className={cn("font-bold", isDark ? "text-white" : "text-gray-900")}>
                                  <AnimatedNumber value={getStatValue(u)} />
                                </span>
                                <span className="text-xs text-gray-500">{getStatLabel()}</span>
                              </div>
                            </td>
                          </motion.tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* User's Rank Card */}
        {user && currentUserRank && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-6"
          >
            <Card className={cn(
              "border",
              isDark 
                ? "border-orange-800 bg-gradient-to-r from-orange-950/30 to-amber-900/20" 
                : "border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50"
            )}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <Link href={`/profile/${user.username}`}>
                    <div className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-lg">
                        #{currentUserRank}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className={cn("font-semibold", isDark ? "text-white" : "text-gray-900")}>
                            Peringkat Anda
                          </p>
                        </div>
                        <p className="text-sm text-gray-500">
                          Total XP: {user.xp || 0} | Streak: {user.streak || 0} hari
                        </p>
                      </div>
                    </div>
                  </Link>
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-orange-500" />
                    <span className={cn("font-medium", isDark ? "text-white" : "text-gray-900")}>
                      {currentUserRank}
                    </span>
                    <span className="text-gray-500">dari {currentLeaderboard.length} pengguna</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}