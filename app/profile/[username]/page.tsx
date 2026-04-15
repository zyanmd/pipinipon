'use client'

import { userAPI } from "@/lib/api"

// Generate static params untuk static export (HARUS setelah 'use client'? TIDAK!)
// generateStaticParams TIDAK BISA digunakan dengan 'use client'
// Untuk static export dengan 'use client', Anda harus menghapus generateStaticParams
// atau menggunakan cara lain.

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/lib/hooks/use-auth"
import { studyAPI, vocabAPI } from "@/lib/api" // Hapus userAPI dari sini karena sudah diimport di atas
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  MapPin, 
  Link2, 
  Calendar, 
  Trophy, 
  BookOpen, 
  CheckCircle, 
  TrendingUp,
  MessageCircle,
  Edit,
  Mail,
  Globe,
  Award,
  Users,
  Star,
  Flame,
  Info
} from "lucide-react"
import { motion } from "framer-motion"
import { formatDate } from "@/lib/utils"
import { getAvatarUrl, getCoverUrl } from "@/lib/image-helper"
import { VerifiedBadge } from "@/components/ui/verified-badge"

// HAPUS generateStaticParams karena tidak bisa digunakan dengan 'use client'
// Untuk static export, Anda harus menghapus 'use client' atau tidak menggunakan static export

export default function ProfilePage() {
  const params = useParams()
  const router = useRouter()
  const username = params.username as string
  const { user: currentUser } = useAuth()
  
  const [profileUser, setProfileUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userStats, setUserStats] = useState<any>(null)
  const [statsByLevel, setStatsByLevel] = useState<any[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [isOwnProfile, setIsOwnProfile] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        
        // Fetch user data
        const userResponse = await userAPI.getByUsername(username)
        const userData = userResponse.data.data.user
        setProfileUser(userData)
        
        if (currentUser && currentUser.username === username) {
          setIsOwnProfile(true)
        }
        
        // Fetch user stats (bookmarks, etc)
        try {
          const statsResponse = await userAPI.getUserStats(username)
          setUserStats(statsResponse.data.data)
        } catch (err) {
          console.log("Stats not available")
        }
        
        // Fetch study stats by level for this user
        try {
          if (currentUser && currentUser.username === username) {
            const levelStatsResponse = await studyAPI.getStatsByLevel()
            setStatsByLevel(levelStatsResponse.data.data || [])
          } else {
            setStatsByLevel(userStats?.stats_by_level || [])
          }
        } catch (err) {
          console.log("Level stats not available")
        }
        
        // Fetch recent activity
        try {
          if (currentUser && currentUser.username === username) {
            const progressResponse = await studyAPI.getProgress()
            if (progressResponse.data.data.progress) {
              const recent = [...progressResponse.data.data.progress]
                .sort((a, b) => new Date(b.last_studied).getTime() - new Date(a.last_studied).getTime())
                .slice(0, 5)
              
              const vocabPromises = recent.map(activity => 
                vocabAPI.getById(activity.vocab_id).catch(() => null)
              )
              const vocabResponses = await Promise.all(vocabPromises)
              
              const activityWithVocab = recent.map((activity, index) => ({
                ...activity,
                vocab: vocabResponses[index]?.data.data.vocab
              })).filter(a => a.vocab)
              
              setRecentActivity(activityWithVocab)
            }
          }
        } catch (err) {
          console.log("Activity not available")
        }
        
      } catch (err) {
        console.error("Error fetching profile:", err)
        setError("Pengguna tidak ditemukan")
      } finally {
        setLoading(false)
      }
    }
    
    if (username) {
      fetchProfile()
    }
  }, [username, currentUser])

  if (!mounted) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Skeleton className="h-40 w-full" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center sm:flex-row sm:items-end gap-4 -mt-12 mb-6">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="text-center sm:text-left">
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !profileUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Pengguna Tidak Ditemukan</h1>
          <p className="text-muted-foreground mb-6">{error || "Pengguna yang Anda cari tidak ada."}</p>
          <Button onClick={() => router.push("/")}>Kembali ke Beranda</Button>
        </div>
      </div>
    )
  }

  const stats = [
    {
      label: "Total Dipelajari",
      value: userStats?.study_stats?.total_studied || 0,
      icon: BookOpen,
      color: "from-blue-500 to-cyan-500"
    },
    {
      label: "Kosakata Dihafal",
      value: userStats?.study_stats?.mastered || 0,
      icon: CheckCircle,
      color: "from-green-500 to-emerald-500"
    },
    {
      label: "XP",
      value: profileUser.xp || 0,
      icon: Trophy,
      color: "from-yellow-500 to-orange-500"
    },
    {
      label: "Streak",
      value: `${profileUser.streak || 0} hari`,
      icon: Flame,
      color: "from-orange-500 to-red-500"
    },
  ]

  const levelStats = statsByLevel.length > 0 
    ? statsByLevel 
    : (userStats?.stats_by_level || [])

  const getLevelProgress = (level: string) => {
    const levelStat = levelStats.find((s: any) => s.level === level)
    if (levelStat) {
      return {
        mastered: levelStat.mastered || 0,
        total: levelStat.total_vocab || 0,
        percentage: levelStat.mastery_rate || 0
      }
    }
    const defaultTotals: Record<string, number> = {
      N5: 496,
      N4: 470,
      N3: 523,
      N2: 288,
      N1: 218
    }
    return {
      mastered: 0,
      total: defaultTotals[level] || 0,
      percentage: 0
    }
  }

  const masteryRate = userStats?.study_stats?.mastery_rate || 
    (levelStats.reduce((acc: number, curr: any) => acc + (curr.mastery_rate || 0), 0) / 5) || 0

  const level = Math.floor((profileUser.xp || 0) / 100) + 1
  const nextLevelXP = level * 100
  const currentLevelXP = (level - 1) * 100
  const xpProgress = ((profileUser.xp || 0) - currentLevelXP) / 100 * 100

  const jlptLevels = ["N5", "N4", "N3", "N2", "N1"]

  const coverImageUrl = getCoverUrl(profileUser.cover_photo)
  const avatarImageUrl = getAvatarUrl(profileUser.avatar)

  return (
    <div className="min-h-screen bg-background">
      {/* Cover Photo */}
      <div className="relative h-32 sm:h-48 w-full overflow-hidden bg-gradient-to-r from-japanese-500 to-japanese-600">
        {coverImageUrl && (
          <img
            src={coverImageUrl}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="flex flex-col items-center sm:flex-row sm:items-end gap-4 -mt-12 sm:-mt-16 mb-6">
          <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-background shadow-lg flex-shrink-0">
            <AvatarImage src={avatarImageUrl} />
            <AvatarFallback className="bg-gradient-to-r from-japanese-500 to-japanese-600 text-white text-3xl">
              {profileUser.username?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground break-words max-w-full">
                {profileUser.username}
              </h1>
              {profileUser.verified_badge === 1 && <VerifiedBadge size="md" />}
              {profileUser.role === 'admin' && (
                <Badge className="bg-red-500 text-white">Admin</Badge>
              )}
            </div>
            
            <div className="flex flex-wrap justify-center sm:justify-start gap-3 text-sm text-muted-foreground">
              {profileUser.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 flex-shrink-0" />
                  <span className="break-words">{profileUser.location}</span>
                </div>
              )}
              {profileUser.website && (
                <div className="flex items-center gap-1 min-w-0">
                  <Link2 className="h-3 w-3 flex-shrink-0" />
                  <a 
                    href={profileUser.website} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:text-primary truncate max-w-[200px] sm:max-w-none break-words"
                  >
                    {profileUser.website}
                  </a>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 flex-shrink-0" />
                <span>Bergabung {formatDate(profileUser.created_at)}</span>
              </div>
            </div>
          </div>
          
          {isOwnProfile && (
            <Button variant="outline" onClick={() => router.push("/settings")} className="mt-2 sm:mt-0 flex-shrink-0">
              <Edit className="mr-2 h-4 w-4" />
              Edit Profil
            </Button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="text-center">
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-center justify-center mb-2">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                      <stat.icon className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-foreground">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Level Progress Bar */}
        <Card className="mb-8">
          <CardContent className="pt-4">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium text-foreground">Level {level}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {profileUser.xp || 0} / {nextLevelXP} XP
              </span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(xpProgress, 100)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">
              {nextLevelXP - (profileUser.xp || 0)} XP lagi ke level {level + 1}
            </p>
          </CardContent>
        </Card>

        {/* JLPT Level Progress Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Progress Level JLPT</CardTitle>
            <p className="text-sm text-muted-foreground">
              Pantau perkembangan belajarmu di setiap level
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {jlptLevels.map((level) => {
                const progress = getLevelProgress(level)
                return (
                  <div key={level} className="text-center p-3 rounded-lg bg-muted/30">
                    <div className="text-lg font-bold gradient-text">{level}</div>
                    <div className="text-2xl font-bold mt-2 text-foreground">{progress.percentage}%</div>
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
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="activity" className="mb-8">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
            <TabsTrigger value="activity">Aktivitas</TabsTrigger>
            <TabsTrigger value="stats">Statistik</TabsTrigger>
            <TabsTrigger value="about">Tentang</TabsTrigger>
          </TabsList>
          
          <TabsContent value="activity" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Aktivitas Belajar Terbaru</CardTitle>
              </CardHeader>
              <CardContent>
                {recentActivity.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Belum ada aktivitas belajar</p>
                    {isOwnProfile && (
                      <Button variant="japanese" className="mt-4" onClick={() => router.push("/study")}>
                        Mulai Belajar
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${activity.mastered === 1 ? 'bg-green-500' : 'bg-yellow-500'}`} />
                          <div className="min-w-0">
                            <p className="font-medium text-foreground break-words">{activity.vocab?.kanji || 'Kosakata'}</p>
                            <p className="text-xs text-muted-foreground break-words">{activity.vocab?.arti}</p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="flex gap-2 text-xs">
                            <span className="text-green-600 dark:text-green-400">✓ {activity.correct_count}</span>
                            <span className="text-red-600 dark:text-red-400">✗ {activity.wrong_count}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(activity.last_studied).toLocaleDateString('id-ID')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="stats" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Statistik Belajar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-foreground">Tingkat Penguasaan</span>
                    <span className="text-sm font-medium text-foreground">{Math.round(masteryRate)}%</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(masteryRate, 100)}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-3 text-foreground">Progress per Level JLPT</h4>
                  <div className="space-y-3">
                    {jlptLevels.map((level) => {
                      const progress = getLevelProgress(level)
                      return (
                        <div key={level}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-foreground">{level}</span>
                            <span className="text-muted-foreground">{progress.mastered}/{progress.total}</span>
                          </div>
                          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-japanese-500 to-japanese-600 rounded-full transition-all duration-500"
                              style={{ width: `${progress.percentage}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="about" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-japanese-500" />
                  <CardTitle className="text-lg">Tentang {profileUser.username}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {profileUser.bio ? (
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-sm text-foreground whitespace-pre-wrap break-words">
                      {profileUser.bio}
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Belum ada bio</p>
                    {isOwnProfile && (
                      <Button 
                        variant="link" 
                        className="mt-2 text-japanese-500"
                        onClick={() => router.push("/settings")}
                      >
                        Tambahkan bio sekarang
                      </Button>
                    )}
                  </div>
                )}
                
                <div>
                  <h4 className="text-sm font-medium mb-2 text-foreground">Informasi</h4>
                  <div className="space-y-2 text-sm">
                    {profileUser.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-foreground break-words">{profileUser.location}</span>
                      </div>
                    )}
                    {profileUser.website && (
                      <div className="flex items-center gap-2 min-w-0">
                        <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <a 
                          href={profileUser.website} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-primary hover:underline truncate max-w-[250px] sm:max-w-none break-words"
                        >
                          {profileUser.website}
                        </a>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-foreground">Bergabung {formatDate(profileUser.created_at)}</span>
                    </div>
                    {profileUser.role === 'admin' && (
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-foreground">Administrator</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {!isOwnProfile && (
                  <div className="pt-4 flex flex-col sm:flex-row gap-3">
                    <Button variant="outline" className="flex-1" onClick={() => router.push("/chat")}>
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Kirim Pesan
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Mail className="mr-2 h-4 w-4" />
                      Kirim Email
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}