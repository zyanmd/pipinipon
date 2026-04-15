"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/hooks/use-auth"
import { vocabAPI } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import { HandwritingPad } from "@/components/writing/handwriting-pad"
import { 
  PenTool, 
  Trophy, 
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  BookOpen,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react"
import { cn } from "@/lib/utils"

interface WritingItem {
  id: number
  kanji: string
  hiragana: string
  romaji: string
  arti: string
  jlpt_level: string
}

export default function WritingPracticePage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [items, setItems] = useState<WritingItem[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [result, setResult] = useState<{ isCorrect: boolean; xpEarned: number; message: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [level, setLevel] = useState("")
  const [limit, setLimit] = useState(5)
  const [stats, setStats] = useState({ correct: 0, total: 0, totalXp: 0 })
  const [completed, setCompleted] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Load writing practice items
  const loadItems = async () => {
    setLoading(true)
    setErrorMessage(null)
    try {
      const response = await vocabAPI.getWritingPractice(level, limit)
      if (response.data.success) {
        const newItems = response.data.data.items
        if (newItems.length === 0) {
          setErrorMessage("Tidak ada kosakata untuk level yang dipilih. Coba pilih level lain.")
        }
        setItems(newItems)
        setCurrentIndex(0)
        setShowResult(false)
        setResult(null)
        setCompleted(false)
        setStats({ correct: 0, total: 0, totalXp: 0 })
        toast({
          title: "✍️ Siap berlatih!",
          description: `Kamu akan menulis ${newItems.length} kosakata dalam Bahasa Jepang`,
        })
      }
    } catch (error) {
      console.error("Error loading writing practice:", error)
      setErrorMessage("Gagal memuat soal. Silakan coba lagi.")
      toast({
        title: "❌ Gagal memuat soal",
        description: "Silakan coba lagi",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle correct answer
  const handleCorrect = async () => {
    setSubmitting(true)
    const currentItem = items[currentIndex]

    try {
      const response = await vocabAPI.submitWritingPractice({
        vocab_id: currentItem.id,
        user_writing: "[writing]",
        is_correct: true
      })

      if (response.data.success) {
        const data = response.data.data
        setResult({
          isCorrect: true,
          xpEarned: data.xp_earned,
          message: data.message
        })
        setShowResult(true)
        setStats(prev => ({
          correct: prev.correct + 1,
          total: prev.total + 1,
          totalXp: prev.totalXp + data.xp_earned
        }))
        
        toast({
          title: "✅ Bagus!",
          description: data.message,
        })
      }
    } catch (error) {
      console.error("Error submitting:", error)
      toast({
        title: "❌ Gagal menyimpan",
        description: "Silakan coba lagi",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Handle incorrect answer
  const handleIncorrect = async () => {
    setSubmitting(true)
    const currentItem = items[currentIndex]

    try {
      const response = await vocabAPI.submitWritingPractice({
        vocab_id: currentItem.id,
        user_writing: "[writing]",
        is_correct: false
      })

      if (response.data.success) {
        const data = response.data.data
        setResult({
          isCorrect: false,
          xpEarned: data.xp_earned,
          message: data.message
        })
        setShowResult(true)
        setStats(prev => ({
          correct: prev.correct,
          total: prev.total + 1,
          totalXp: prev.totalXp + data.xp_earned
        }))
        
        toast({
          title: "📝 Terus berlatih!",
          description: data.message,
        })
      }
    } catch (error) {
      console.error("Error submitting:", error)
      toast({
        title: "❌ Gagal menyimpan",
        description: "Silakan coba lagi",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Next question
  const nextQuestion = () => {
    if (currentIndex + 1 < items.length) {
      setCurrentIndex(currentIndex + 1)
      setShowResult(false)
      setResult(null)
    } else {
      setCompleted(true)
    }
  }

  // Previous question
  const prevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setShowResult(false)
      setResult(null)
    }
  }

  // Restart practice
  const restartPractice = () => {
    loadItems()
  }

  // Change level
  const handleLevelChange = (newLevel: string) => {
    setLevel(newLevel)
  }

  // Initial load
  useEffect(() => {
    if (user) {
      loadItems()
    }
  }, [level, limit, user])

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
          <PenTool className="w-10 h-10 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold mb-4">Silakan Login</h1>
        <p className="text-muted-foreground">Login untuk berlatih menulis huruf Jepang</p>
        <Button variant="japanese" className="mt-6" onClick={() => window.location.href = "/login"}>
          Login Sekarang
        </Button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-[500px] w-full rounded-lg" />
      </div>
    )
  }

  if (completed) {
    const percentage = stats.total === 0 ? 0 : Math.round((stats.correct / stats.total) * 100)
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 mb-6">
            <Trophy className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Latihan Selesai! 🎉</h1>
          <p className="text-muted-foreground mb-8">Kamu telah menyelesaikan semua latihan menulis</p>
          
          <Card className="max-w-md mx-auto mb-8">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-3xl font-bold text-green-600">{stats.correct}</div>
                  <div className="text-sm text-muted-foreground">Benar</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-red-600">{stats.total - stats.correct}</div>
                  <div className="text-sm text-muted-foreground">Salah</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-yellow-600">{stats.totalXp}</div>
                  <div className="text-sm text-muted-foreground">XP Didapat</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-600">{percentage}%</div>
                  <div className="text-sm text-muted-foreground">Akurasi</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4 justify-center">
            <Button onClick={restartPractice} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Latihan Lagi
            </Button>
            <Button onClick={() => window.location.href = "/vocabulary"} variant="japanese">
              <BookOpen className="mr-2 h-4 w-4" />
              Lihat Kosakata
            </Button>
          </div>
        </motion.div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <PenTool className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h1 className="text-2xl font-bold mb-2">Belum Ada Kosakata</h1>
        <p className="text-muted-foreground mb-6">
          {errorMessage || "Tidak ada kosakata untuk level yang dipilih. Coba pilih level lain."}
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Select value={level} onValueChange={handleLevelChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Pilih Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Semua Level</SelectItem>
              <SelectItem value="N5">N5</SelectItem>
              <SelectItem value="N4">N4</SelectItem>
              <SelectItem value="N3">N3</SelectItem>
              <SelectItem value="N2">N2</SelectItem>
              <SelectItem value="N1">N1</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={loadItems}>Muat Ulang</Button>
        </div>
      </div>
    )
  }

  const currentItem = items[currentIndex]
  const progress = ((currentIndex + (showResult ? 1 : 0)) / items.length) * 100

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
          <div>
            <h1 className="text-2xl font-bold gradient-text">Latihan Menulis Bahasa Jepang</h1>
            <p className="text-sm text-muted-foreground">
              Tulis huruf Jepang berdasarkan arti dalam Bahasa Indonesia
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={level} onValueChange={handleLevelChange}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Semua</SelectItem>
                <SelectItem value="N5">N5</SelectItem>
                <SelectItem value="N4">N4</SelectItem>
                <SelectItem value="N3">N3</SelectItem>
                <SelectItem value="N2">N2</SelectItem>
                <SelectItem value="N1">N1</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-sm text-muted-foreground">
              Soal {currentIndex + 1} / {items.length}
            </div>
          </div>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Writing Pad */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <PenTool className="h-5 w-5 text-orange-500" />
                  Tulis Jawaban
                </CardTitle>
                {currentItem.jlpt_level && (
                  <span className="px-2 py-1 text-xs rounded-full bg-japanese-100 dark:bg-japanese-900 text-japanese-700 dark:text-japanese-300">
                    {currentItem.jlpt_level}
                  </span>
                )}
              </div>
              <CardDescription>
                Tulis dalam Kanji, Hiragana, atau Romaji
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!showResult ? (
                <HandwritingPad
                  targetKanji={currentItem.kanji}
                  targetMeaning={currentItem.arti}
                  targetReading={currentItem.hiragana || currentItem.romaji}
                  onCorrect={handleCorrect}
                  onIncorrect={handleIncorrect}
                  disabled={submitting}
                />
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "p-6 rounded-lg text-center",
                    result?.isCorrect 
                      ? "bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800"
                      : "bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800"
                  )}
                >
                  {result?.isCorrect ? (
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  ) : (
                    <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                  )}
                  <p className="font-medium mb-2">{result?.message}</p>
                  {!result?.isCorrect && (
                    <div className="text-sm">
                      <p className="text-muted-foreground">Jawaban yang benar:</p>
                      <p className="text-2xl font-japanese font-bold text-green-600 dark:text-green-400">
                        {currentItem.kanji}
                      </p>
                      {currentItem.hiragana && (
                        <p className="text-xs text-muted-foreground mt-1">({currentItem.hiragana})</p>
                      )}
                    </div>
                  )}
                  <div className="mt-4 flex items-center justify-center gap-1 text-yellow-600">
                    <Sparkles className="w-4 h-4" />
                    <span className="font-medium">+{result?.xpEarned} XP</span>
                  </div>
                  <Button onClick={nextQuestion} className="mt-4" variant="japanese">
                    {currentIndex + 1 === items.length ? "Selesai" : "Soal Berikutnya"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Stats Panel */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Statistik Sesi Ini</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{stats.correct}</div>
                  <div className="text-xs text-muted-foreground">Benar</div>
                </div>
                <div className="text-center p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{stats.total - stats.correct}</div>
                  <div className="text-xs text-muted-foreground">Salah</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{stats.totalXp}</div>
                  <div className="text-xs text-muted-foreground">XP Didapat</div>
                </div>
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.total === 0 ? 0 : Math.round((stats.correct / stats.total) * 100)}%
                  </div>
                  <div className="text-xs text-muted-foreground">Akurasi</div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-start gap-2 text-sm">
                  <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">
                    Kamu bisa menulis dalam Kanji, Hiragana, atau Romaji. Sistem akan mencocokkan dengan jawaban yang benar.
                  </span>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  onClick={prevQuestion}
                  disabled={currentIndex === 0 || showResult}
                  className="flex-1"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Sebelumnya
                </Button>
                <Button 
                  variant="outline" 
                  onClick={restartPractice}
                  className="flex-1"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Ulangi
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}