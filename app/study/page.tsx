"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/lib/hooks/use-auth"
import { studyAPI } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  BookOpen, 
  Volume2, 
  CheckCircle, 
  XCircle, 
  RotateCcw, 
  Trophy,
  Sparkles,
  Eye,
  EyeOff,
  AlertCircle,
  Zap
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn, getJLPTColor, getJLPTLabel } from "@/lib/utils"

export default function StudyPage() {
  const { user, updateUser } = useAuth()
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    studied: 0,
    correct: 0,
    wrong: 0,
    xpEarned: 0
  })
  const [isFlipped, setIsFlipped] = useState(false)
  const [sessionComplete, setSessionComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showXpNotification, setShowXpNotification] = useState(false)
  const [lastXpEarned, setLastXpEarned] = useState(0)

  useEffect(() => {
    if (user) {
      fetchRecommendations()
      fetchStats()
    }
  }, [user])

  // Auto hide XP notification after 2 seconds
  useEffect(() => {
    if (showXpNotification) {
      const timer = setTimeout(() => setShowXpNotification(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [showXpNotification])

  const fetchRecommendations = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await studyAPI.getRecommendations({ limit: 20 })
      setRecommendations(response.data.data.recommendations || [])
    } catch (error: any) {
      console.error("Error fetching recommendations:", error)
      setError(error.response?.data?.error || error.message || "Gagal memuat rekomendasi belajar")
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await studyAPI.getStats()
      setStats(prev => ({
        ...prev,
        studied: response.data.data.stats.total_studied || 0,
        correct: response.data.data.stats.total_correct || 0,
        wrong: response.data.data.stats.total_wrong || 0
      }))
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const currentVocab = recommendations[currentIndex]

  const handleSpeak = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = "ja-JP"
      window.speechSynthesis.cancel()
      window.speechSynthesis.speak(utterance)
    }
  }

  const handleAnswer = async (isCorrect: boolean) => {
    if (!currentVocab || isSubmitting) return

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await studyAPI.updateProgress({
        vocab_id: currentVocab.id,
        is_correct: isCorrect
      })
      
      const xpEarned = response.data.data.xp_earned || 0
      
      // Update stats
      setStats(prev => ({
        studied: prev.studied + 1,
        correct: prev.correct + (isCorrect ? 1 : 0),
        wrong: prev.wrong + (isCorrect ? 0 : 1),
        xpEarned: prev.xpEarned + xpEarned
      }))

      // Show XP notification if earned
      if (xpEarned > 0) {
        setLastXpEarned(xpEarned)
        setShowXpNotification(true)
        // Update local user XP
        if (user) {
          updateUser({ xp: (user.xp || 0) + xpEarned })
        }
      }

      // Move to next card
      if (currentIndex + 1 < recommendations.length) {
        setCurrentIndex(prev => prev + 1)
        setIsFlipped(false)
      } else {
        setSessionComplete(true)
      }
    } catch (error: any) {
      console.error("Error updating progress:", error)
      setError(error.response?.data?.error || "Gagal menyimpan jawaban. Silakan coba lagi.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setCurrentIndex(0)
    setIsFlipped(false)
    setSessionComplete(false)
    setError(null)
    setStats({
      studied: 0,
      correct: 0,
      wrong: 0,
      xpEarned: 0
    })
    fetchRecommendations()
    fetchStats()
  }

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Skeleton className="h-96 rounded-lg" />
          </div>
          <div>
            <Skeleton className="h-64 rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  if (error && recommendations.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <h3 className="text-lg font-medium mb-2">Gagal Memuat Data</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={fetchRecommendations} variant="japanese">
          Coba Lagi
        </Button>
      </div>
    )
  }

  if (sessionComplete) {
    const accuracy = stats.studied > 0 ? (stats.correct / stats.studied) * 100 : 0
    
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
            <Trophy className="w-12 h-12 text-white" />
          </div>
          
          <h1 className="text-3xl font-bold mb-4 gradient-text">
            Sesi Belajar Selesai! 🎉
          </h1>
          
          <p className="text-muted-foreground mb-8">
            Kamu telah menyelesaikan {recommendations.length} kosakata
          </p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.correct}
                </div>
                <p className="text-xs text-muted-foreground">Benar</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {stats.wrong}
                </div>
                <p className="text-xs text-muted-foreground">Salah</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {accuracy.toFixed(0)}%
                </div>
                <p className="text-xs text-muted-foreground">Akurasi</p>
              </CardContent>
            </Card>
          </div>

          {stats.xpEarned > 0 && (
            <div className="mb-8 p-4 rounded-lg bg-yellow-100 dark:bg-yellow-950/30">
              <p className="text-yellow-800 dark:text-yellow-300">
                ✨ Kamu mendapatkan {stats.xpEarned} XP dari sesi ini!
              </p>
            </div>
          )}

          <div className="flex gap-4 justify-center">
            <Button onClick={handleReset} variant="japanese">
              <RotateCcw className="mr-2 h-4 w-4" />
              Belajar Lagi
            </Button>
            <Button onClick={() => window.location.href = "/dashboard"} variant="outline">
              Kembali ke Dashboard
            </Button>
          </div>
        </motion.div>
      </div>
    )
  }

  if (!currentVocab) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <p className="text-muted-foreground">Tidak ada kosakata untuk dipelajari</p>
        <Button onClick={handleReset} className="mt-4" variant="japanese">
          Muat Ulang
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* XP Notification */}
      <AnimatePresence>
        {showXpNotification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 right-4 z-50"
          >
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg">
              <Zap className="h-5 w-5" />
              <span>+{lastXpEarned} XP!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Flashcard Section */}
        <div className="lg:col-span-2">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Progress Belajar</span>
              <span>{currentIndex + 1} / {recommendations.length}</span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-japanese-500 to-japanese-600 rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / recommendations.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Flashcard */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="perspective-1000"
          >
            <div
              className="relative w-full cursor-pointer"
              style={{ minHeight: "400px" }}
              onClick={handleFlip}
            >
              <AnimatePresence mode="wait">
                {!isFlipped ? (
                  <motion.div
                    key="front"
                    initial={{ rotateY: 0 }}
                    animate={{ rotateY: 0 }}
                    exit={{ rotateY: -180 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 backface-hidden"
                  >
                    <Card className="h-full border-2 shadow-xl hover:shadow-2xl transition-all">
                      <CardContent className="p-8 text-center">
                        <div className="mb-4">
                          <Badge className={cn(getJLPTColor(currentVocab.jlpt_level), "text-white")}>
                            {currentVocab.jlpt_level} - {getJLPTLabel(currentVocab.jlpt_level)}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-center gap-2 mb-6">
                          <h2 className="text-4xl md:text-5xl font-bold japanese-text">
                            {currentVocab.kanji}
                          </h2>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSpeak(currentVocab.kanji)
                            }}
                          >
                            <Volume2 className="h-5 w-5" />
                          </Button>
                        </div>
                        
                        <p className="text-lg text-muted-foreground mb-2">
                          {currentVocab.hiragana}
                        </p>
                        {currentVocab.romaji && (
                          <p className="text-sm text-muted-foreground">
                            {currentVocab.romaji}
                          </p>
                        )}

                        <div className="mt-8">
                          <Button variant="ghost" onClick={(e) => {
                            e.stopPropagation()
                            handleFlip()
                          }}>
                            <Eye className="mr-2 h-4 w-4" />
                            Tampilkan Arti
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ) : (
                  <motion.div
                    key="back"
                    initial={{ rotateY: 180 }}
                    animate={{ rotateY: 0 }}
                    exit={{ rotateY: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 backface-hidden"
                  >
                    <Card className="h-full border-2 shadow-xl hover:shadow-2xl transition-all bg-gradient-to-br from-japanese-50 to-japanese-100 dark:from-japanese-950/30 dark:to-japanese-900/20">
                      <CardContent className="p-8 text-center">
                        <div className="mb-4">
                          <Badge className={cn(getJLPTColor(currentVocab.jlpt_level), "text-white")}>
                            {currentVocab.jlpt_level} - {getJLPTLabel(currentVocab.jlpt_level)}
                          </Badge>
                        </div>
                        
                        <h3 className="text-2xl font-bold mb-4 gradient-text">
                          Arti
                        </h3>
                        <p className="text-xl mb-6">
                          {currentVocab.arti}
                        </p>

                        {currentVocab.contoh_kalimat && (
                          <div className="mt-6 p-4 rounded-lg bg-muted/50">
                            <p className="text-sm japanese-text mb-2">
                              {currentVocab.contoh_kalimat}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {currentVocab.contoh_arti}
                            </p>
                          </div>
                        )}

                        <div className="mt-8">
                          <Button variant="ghost" onClick={(e) => {
                            e.stopPropagation()
                            handleFlip()
                          }}>
                            <EyeOff className="mr-2 h-4 w-4" />
                            Sembunyikan Arti
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center mt-6">
            <Button
              size="lg"
              variant="outline"
              className="flex-1 border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
              onClick={() => handleAnswer(false)}
              disabled={isSubmitting}
            >
              <XCircle className="mr-2 h-5 w-5" />
              Belum Hafal
            </Button>
            <Button
              size="lg"
              variant="japanese"
              className="flex-1"
              onClick={() => handleAnswer(true)}
              disabled={isSubmitting}
            >
              <CheckCircle className="mr-2 h-5 w-5" />
              Sudah Hafal
            </Button>
          </div>
        </div>

        {/* Stats Section */}
        <div>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                <h3 className="font-semibold">Statistik Sesi Ini</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Diproses</span>
                  <span className="font-medium">{stats.studied}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground text-green-600 dark:text-green-400">Benar</span>
                  <span className="font-medium text-green-600 dark:text-green-400">{stats.correct}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground text-red-600 dark:text-red-400">Salah</span>
                  <span className="font-medium text-red-600 dark:text-red-400">{stats.wrong}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-sm font-medium">XP Didapat</span>
                  <span className="font-bold text-yellow-600 dark:text-yellow-400">{stats.xpEarned}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="h-5 w-5 text-japanese-500" />
                <h3 className="font-semibold">Tips Belajar</h3>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Balik kartu untuk melihat arti</li>
                <li>• Klik "Sudah Hafal" jika kamu mengingat artinya</li>
                <li>• Klik "Belum Hafal" jika masih lupa</li>
                <li>• Gunakan tombol speaker untuk mendengar pengucapan</li>
                <li>• Semakin sering belajar, semakin banyak XP!</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}