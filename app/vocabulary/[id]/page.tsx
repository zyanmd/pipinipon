"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { vocabAPI, studyAPI } from "@/lib/api"
import { useAuth } from "@/lib/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  ArrowLeft, 
  Volume2, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  XCircle,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  RotateCcw,
  Loader2
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn, getJLPTColor, getJLPTLabel } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"

export default function VocabularyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const vocabId = parseInt(params.id as string)
  const { user } = useAuth()
  
  const [vocab, setVocab] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFlipped, setIsFlipped] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [studyProgress, setStudyProgress] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)

  // Fungsi TTS yang lebih baik untuk bahasa Jepang
  const handleSpeak = async (text: string) => {
    if (!text) return
    
    setIsSpeaking(true)
    
    try {
      // Cek apakah browser support Web Speech API
      if (!window.speechSynthesis) {
        toast({
          title: "Tidak didukung",
          description: "Browser Anda tidak mendukung fitur text-to-speech",
          variant: "destructive",
        })
        setIsSpeaking(false)
        return
      }

      // Hentikan suara yang sedang berjalan
      window.speechSynthesis.cancel()
      
      // Buat utterance baru
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = "ja-JP"
      utterance.rate = 0.9
      utterance.pitch = 1.0
      utterance.volume = 1.0
      
      // Cari voice bahasa Jepang yang tersedia
      const loadVoices = () => {
        return new Promise<SpeechSynthesisVoice[]>((resolve) => {
          const voices = window.speechSynthesis.getVoices()
          if (voices.length) {
            resolve(voices)
          } else {
            window.speechSynthesis.onvoiceschanged = () => {
              resolve(window.speechSynthesis.getVoices())
            }
          }
        })
      }
      
      const voices = await loadVoices()
      const japaneseVoice = voices.find(voice => 
        voice.lang === 'ja-JP' || 
        voice.lang === 'ja' ||
        voice.name.includes('Google 日本語') ||
        voice.name.includes('Samantha') ||
        voice.name.includes('Kyoko')
      )
      
      if (japaneseVoice) {
        utterance.voice = japaneseVoice
        console.log("Using voice:", japaneseVoice.name)
      } else {
        console.log("No Japanese voice found, using default")
      }
      
      utterance.onend = () => {
        setIsSpeaking(false)
      }
      
      utterance.onerror = (event) => {
        console.error("Speech synthesis error:", event)
        setIsSpeaking(false)
        toast({
          title: "Gagal memutar suara",
          description: "Silakan coba lagi",
          variant: "destructive",
        })
      }
      
      window.speechSynthesis.speak(utterance)
      
    } catch (error) {
      console.error("Error in speech synthesis:", error)
      setIsSpeaking(false)
      toast({
        title: "Gagal memutar suara",
        description: "Terjadi kesalahan, silakan coba lagi",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        const vocabResponse = await vocabAPI.getById(vocabId)
        setVocab(vocabResponse.data.data.vocab)
        
        if (user) {
          try {
            const progressResponse = await studyAPI.getProgressByVocab(vocabId)
            setStudyProgress(progressResponse.data.data.progress)
          } catch (err) {
            console.log("Belum ada riwayat belajar untuk kosakata ini")
          }
        }
      } catch (err) {
        console.error("Error fetching vocabulary:", err)
        setError("Kosakata tidak ditemukan")
      } finally {
        setLoading(false)
      }
    }
    
    if (vocabId) {
      fetchData()
    }
  }, [vocabId, user])

  // Pre-load voices saat komponen mount
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      // Panggil getVoices untuk memuat voices
      window.speechSynthesis.getVoices()
    }
  }, [])

  const handleAnswer = async (isCorrect: boolean) => {
    if (!user || isSubmitting) return

    setIsSubmitting(true)
    try {
      const response = await studyAPI.updateProgress({
        vocab_id: vocabId,
        is_correct: isCorrect
      })
      
      setStudyProgress(response.data.data.progress)
      
      if (response.data.data.xp_earned > 0) {
        toast({
          title: "🎉 +" + response.data.data.xp_earned + " XP",
          description: isCorrect ? "Jawaban benar! Terus semangat belajar!" : "Tetap semangat, lain kali pasti bisa!",
          variant: "default",
        })
      }
    } catch (error) {
      console.error("Error updating progress:", error)
      toast({
        title: "Oops!",
        description: "Gagal menyimpan progres. Coba lagi ya.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  const handleNext = () => {
    router.push(`/vocabulary/${vocabId + 1}`)
  }

  const handlePrev = () => {
    if (vocabId > 1) {
      router.push(`/vocabulary/${vocabId - 1}`)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
    )
  }

  if (error || !vocab) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Kosakata Tidak Ditemukan</h1>
        <p className="text-muted-foreground mb-6">{error || "Kosakata yang kamu cari tidak ada dalam database kami."}</p>
        <Button onClick={() => router.push("/vocabulary")}>
          Kembali ke Daftar Kosakata
        </Button>
      </div>
    )
  }

  const isMastered = studyProgress?.mastered === 1
  const correctCount = studyProgress?.correct_count || 0
  const wrongCount = studyProgress?.wrong_count || 0

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Navigasi */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/vocabulary">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
        </Link>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrev}
            disabled={vocabId <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Sebelumnya
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
          >
            Selanjutnya
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Kartu Flashcard */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="perspective-1000"
      >
        <div
          className="relative w-full cursor-pointer"
          style={{ minHeight: "500px" }}
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
                    <div className="flex justify-between items-start mb-6">
                      <Badge className={cn(getJLPTColor(vocab.jlpt_level), "text-white")}>
                        {vocab.jlpt_level} - {getJLPTLabel(vocab.jlpt_level)}
                      </Badge>
                      {isMastered && (
                        <Badge variant="success" className="bg-green-500 text-white">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Sudah Dihafal
                        </Badge>
                      )}
                    </div>
                    
                    {/* Kanji dengan Tombol Suara */}
                    <div className="flex items-center justify-center gap-3 mb-6">
                      <h2 className="text-5xl md:text-6xl font-bold japanese-text">
                        {vocab.kanji}
                      </h2>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={isSpeaking}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSpeak(vocab.kanji)
                        }}
                        className="relative"
                      >
                        {isSpeaking ? (
                          <Loader2 className="h-6 w-6 animate-spin" />
                        ) : (
                          <Volume2 className="h-6 w-6" />
                        )}
                      </Button>
                    </div>
                    
                    {/* Hiragana & Romaji */}
                    <p className="text-xl text-muted-foreground mb-2">
                      {vocab.hiragana}
                    </p>
                    {vocab.romaji && (
                      <p className="text-sm text-muted-foreground">
                        {vocab.romaji}
                      </p>
                    )}

                    {user && (correctCount > 0 || wrongCount > 0) && (
                      <div className="mt-6 flex justify-center gap-4 text-sm">
                        <span className="text-green-600 dark:text-green-400">
                          ✓ Benar: {correctCount}
                        </span>
                        <span className="text-red-600 dark:text-red-400">
                          ✗ Salah: {wrongCount}
                        </span>
                      </div>
                    )}

                    <div className="mt-8">
                      <Button variant="ghost" onClick={(e) => {
                        e.stopPropagation()
                        handleFlip()
                      }}>
                        <Eye className="mr-2 h-4 w-4" />
                        Lihat Arti
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
                    <div className="flex justify-between items-start mb-6">
                      <Badge className={cn(getJLPTColor(vocab.jlpt_level), "text-white")}>
                        {vocab.jlpt_level} - {getJLPTLabel(vocab.jlpt_level)}
                      </Badge>
                      {isMastered && (
                        <Badge variant="success" className="bg-green-500 text-white">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Sudah Dihafal
                        </Badge>
                      )}
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-4 gradient-text">
                      Arti
                    </h3>
                    <p className="text-2xl mb-6">
                      {vocab.arti}
                    </p>

                    {vocab.contoh_kalimat && (
                      <div className="mt-6 p-4 rounded-lg bg-muted/50 text-left">
                        <p className="text-sm font-medium mb-2">Contoh Kalimat:</p>
                        <div className="flex items-center gap-2">
                          <p className="text-md japanese-text mb-2 flex-1">
                            {vocab.contoh_kalimat}
                          </p>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSpeak(vocab.contoh_kalimat)
                            }}
                            disabled={isSpeaking}
                          >
                            {isSpeaking ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Volume2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {vocab.contoh_arti}
                        </p>
                      </div>
                    )}

                    <div className="mt-8">
                      <Button variant="ghost" onClick={(e) => {
                        e.stopPropagation()
                        handleFlip()
                      }}>
                        <EyeOff className="mr-2 h-4 w-4" />
                        Tutup Arti
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Tombol Aksi Belajar */}
      {user && (
        <div className="flex gap-4 justify-center mt-8">
          <Button
            size="lg"
            variant="outline"
            className="flex-1 max-w-xs border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
            onClick={() => handleAnswer(false)}
            disabled={isSubmitting}
          >
            <XCircle className="mr-2 h-5 w-5" />
            Belum Hafal
          </Button>
          <Button
            size="lg"
            variant="japanese"
            className="flex-1 max-w-xs"
            onClick={() => handleAnswer(true)}
            disabled={isSubmitting}
          >
            <CheckCircle className="mr-2 h-5 w-5" />
            Sudah Hafal
          </Button>
        </div>
      )}

      {/* Tips Belajar */}
      <div className="mt-8 p-4 rounded-lg bg-muted/30 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-yellow-500" />
          <span className="text-sm font-medium">Tips Belajar</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Balik kartu untuk melihat arti. Klik ikon speaker untuk mendengar pengucapan dalam bahasa Jepang.
          Semakin sering kamu berlatih, semakin banyak XP yang akan kamu kumpulkan!
        </p>
      </div>
    </div>
  )
}