"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/hooks/use-auth"
import { userAPI } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Trophy, Medal, Crown, Star, TrendingUp, Award, Users, Zap, RefreshCw } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { VerifiedBadge } from "@/components/ui/verified-badge"

interface LeaderboardUser {
  id: number
  username: string
  email: string
  avatar: string | null
  xp: number
  streak: number
  rank: string
  is_verified: number
  verified_badge: number
}

export default function LeaderboardPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState<LeaderboardUser[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchAllUsers = async () => {
    setLoading(true)
    try {
      let allUsers: LeaderboardUser[] = []
      let page = 1
      let hasMore = true
      const perPage = 100
      
      // Fetch all pages to get complete user list
      while (hasMore) {
        try {
          const response = await userAPI.getAll({ page, per_page: perPage })
          const usersData = response.data.data.users || []
          allUsers = [...allUsers, ...usersData]
          
          // Check if there are more pages
          const pagination = response.data.data.pagination
          hasMore = pagination && page < pagination.pages
          page++
        } catch (error) {
          console.error("Error fetching page:", error)
          hasMore = false
        }
      }
      
      console.log(`Total users fetched: ${allUsers.length}`)
      
      // Urutkan berdasarkan XP tertinggi ke terendah (pastikan XP adalah number)
      const sortedUsers = [...allUsers].sort((a, b) => {
        const xpA = typeof a.xp === 'number' ? a.xp : 0
        const xpB = typeof b.xp === 'number' ? b.xp : 0
        return xpB - xpA
      })
      
      // Log top 5 users for debugging
      console.log("Top 5 users by XP:")
      sortedUsers.slice(0, 5).forEach((u, idx) => {
        console.log(`${idx + 1}. ${u.username}: ${u.xp} XP`)
      })
      
      setUsers(sortedUsers)
    } catch (error) {
      console.error("Error fetching leaderboard:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchAllUsers()
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchAllUsers()
  }

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 0:
        return { bg: "from-yellow-500 to-amber-500", text: "text-white", label: "1st" }
      case 1:
        return { bg: "from-gray-400 to-gray-500", text: "text-white", label: "2nd" }
      case 2:
        return { bg: "from-amber-600 to-orange-600", text: "text-white", label: "3rd" }
      default:
        return { bg: "from-muted to-muted", text: "text-muted-foreground", label: `${rank + 1}th` }
    }
  }

  const top3 = users.slice(0, 3)
  const restUsers = users.slice(3)

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <Skeleton className="h-12 w-64 mx-auto mb-4" />
          <Skeleton className="h-4 w-96 mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 mb-4">
            <Trophy className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Papan Peringkat</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black gradient-text mb-4">
            Leaderboard
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Lihat peringkat pengguna teraktif berdasarkan total XP yang terkumpul
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

        {/* Total Users Stats */}
        <div className="text-center mb-8">
          <p className="text-sm text-muted-foreground">
            Total {users.length} pengguna terdaftar
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
                    <div className="bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-800/50 dark:to-gray-900/50 rounded-t-2xl p-6 pt-8 shadow-xl border border-gray-200 dark:border-gray-700 cursor-pointer hover:scale-105 transition-transform duration-300">
                      <Avatar className="w-20 h-20 mx-auto mb-3 ring-4 ring-gray-400 dark:ring-gray-600">
                        <AvatarImage src={top3[1]?.avatar ? `http://localhost:5000/uploads/${top3[1].avatar}` : undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-gray-400 to-gray-500 dark:from-gray-600 dark:to-gray-700 text-white text-2xl">
                          {top3[1]?.username?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <p className="font-bold text-lg text-foreground">{top3[1]?.username}</p>
                        {top3[1]?.verified_badge === 1 && <VerifiedBadge size="sm" />}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">Peringkat 2</p>
                      <div className="flex items-center justify-center gap-2 text-yellow-600 dark:text-yellow-400">
                        <Star className="h-4 w-4 fill-yellow-500" />
                        <span className="font-bold text-xl">{top3[1]?.xp || 0}</span>
                        <span className="text-xs">XP</span>
                      </div>
                    </div>
                  </Link>
                  <div className="h-4 bg-gradient-to-b from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-900 rounded-b-lg" />
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
                    <div className="bg-gradient-to-b from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/10 rounded-t-2xl p-6 pt-10 shadow-2xl border border-yellow-200 dark:border-yellow-800/50 cursor-pointer hover:scale-105 transition-transform duration-300">
                      <Avatar className="w-28 h-28 mx-auto mb-3 ring-4 ring-yellow-500 dark:ring-yellow-600">
                        <AvatarImage src={top3[0]?.avatar ? `http://localhost:5000/uploads/${top3[0].avatar}` : undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-yellow-500 to-amber-500 text-white text-3xl">
                          {top3[0]?.username?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <p className="font-bold text-xl text-foreground">{top3[0]?.username}</p>
                        {top3[0]?.verified_badge === 1 && <VerifiedBadge size="sm" />}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">Peringkat 1</p>
                      <div className="flex items-center justify-center gap-2 text-yellow-600 dark:text-yellow-400">
                        <Trophy className="h-5 w-5" />
                        <span className="font-bold text-2xl">{top3[0]?.xp || 0}</span>
                        <span className="text-xs">XP</span>
                      </div>
                      <div className="mt-3 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs">
                        <Zap className="h-3 w-3" />
                        Top Leader
                      </div>
                    </div>
                  </Link>
                  <div className="h-6 bg-gradient-to-b from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/30 rounded-b-lg" />
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
                    <div className="bg-gradient-to-b from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/10 rounded-t-2xl p-6 pt-8 shadow-xl border border-amber-200 dark:border-amber-800/50 cursor-pointer hover:scale-105 transition-transform duration-300">
                      <Avatar className="w-20 h-20 mx-auto mb-3 ring-4 ring-amber-600 dark:ring-amber-700">
                        <AvatarImage src={top3[2]?.avatar ? `http://localhost:5000/uploads/${top3[2].avatar}` : undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-amber-600 to-orange-600 dark:from-amber-700 dark:to-orange-700 text-white text-2xl">
                          {top3[2]?.username?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <p className="font-bold text-lg text-foreground">{top3[2]?.username}</p>
                        {top3[2]?.verified_badge === 1 && <VerifiedBadge size="sm" />}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">Peringkat 3</p>
                      <div className="flex items-center justify-center gap-2 text-amber-600 dark:text-amber-400">
                        <Medal className="h-4 w-4" />
                        <span className="font-bold text-xl">{top3[2]?.xp || 0}</span>
                        <span className="text-xs">XP</span>
                      </div>
                    </div>
                  </Link>
                  <div className="h-4 bg-gradient-to-b from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30 rounded-b-lg" />
                </motion.div>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="text-center py-12 mb-8">
            <Trophy className="w-16 h-16 mx-auto text-muted-foreground opacity-30 mb-4" />
            <p className="text-muted-foreground">Belum ada data leaderboard</p>
          </div>
        )}

        {/* Full Leaderboard Table */}
        {restUsers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-japanese-500" />
                  Semua Peringkat
                </CardTitle>
                <CardDescription>
                  Daftar lengkap peringkat pengguna berdasarkan total XP
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Peringkat</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Pengguna</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Gelar</th>
                        <th className="text-right py-3 px-4 font-medium text-muted-foreground">Total XP</th>
                        <th className="text-right py-3 px-4 font-medium text-muted-foreground">Streak</th>
                       </tr>
                    </thead>
                    <tbody>
                      {restUsers.map((u, idx) => {
                        const rank = idx + 4
                        const rankBadge = getRankBadge(rank - 1)
                        return (
                          <motion.tr
                            key={u.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.05 * idx }}
                            className={cn(
                              "border-b border-border hover:bg-muted/50 transition-colors",
                              user?.id === u.id && "bg-japanese-50 dark:bg-japanese-950/20"
                            )}
                          >
                            <td className="py-3 px-4">
                              <div className={cn(
                                "w-8 h-8 rounded-full bg-gradient-to-r flex items-center justify-center font-bold",
                                rankBadge.bg,
                                rankBadge.text
                              )}>
                                {rank}
                              </div>
                             </td>
                            <td className="py-3 px-4">
                              <Link href={`/profile/${u.username}`}>
                                <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
                                  <Avatar className="h-10 w-10">
                                    <AvatarImage src={u.avatar ? `http://localhost:5000/uploads/${u.avatar}` : undefined} />
                                    <AvatarFallback className="bg-gradient-to-br from-japanese-500 to-japanese-600 text-white">
                                      {u.username?.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="flex items-center gap-1">
                                      <span className="font-medium text-foreground">{u.username}</span>
                                      {u.verified_badge === 1 && <VerifiedBadge size="sm" />}
                                    </div>
                                    <p className="text-xs text-muted-foreground">{u.rank || "Pemula"}</p>
                                  </div>
                                </div>
                              </Link>
                             </td>
                            <td className="py-3 px-4">
                              <span className="text-sm text-muted-foreground">{u.rank || "Ashigaru V"}</span>
                             </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Star className="h-4 w-4 text-yellow-500" />
                                <span className="font-bold text-foreground">{u.xp || 0}</span>
                                <span className="text-xs text-muted-foreground">XP</span>
                              </div>
                             </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <TrendingUp className="h-4 w-4 text-orange-500" />
                                <span className="font-medium text-foreground">{u.streak || 0}</span>
                                <span className="text-xs text-muted-foreground">hari</span>
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
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-6"
          >
            <Card className="border-japanese-200 dark:border-japanese-800 bg-gradient-to-r from-japanese-50 to-japanese-100 dark:from-japanese-950/30 dark:to-japanese-900/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <Link href={`/profile/${user.username}`}>
                    <div className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-japanese-500 to-japanese-600 flex items-center justify-center text-white font-bold text-lg">
                        #{users.findIndex(u => u.id === user.id) + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground">Peringkat Anda</p>
                          {(user as any).verified_badge === 1 && <VerifiedBadge size="sm" />}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Total XP: {user.xp || 0} | Streak: {user.streak || 0} hari
                        </p>
                      </div>
                    </div>
                  </Link>
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-japanese-500" />
                    <span className="font-medium text-foreground">{users.findIndex(u => u.id === user.id) + 1}</span>
                    <span className="text-muted-foreground">dari {users.length} pengguna</span>
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