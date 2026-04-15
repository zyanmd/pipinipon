"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bookmark, CheckCircle, Circle, Volume2, Eye, EyeOff, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface VocabCardProps {
  vocab: {
    id: number
    kanji: string
    hiragana: string
    romaji?: string
    arti: string
    contoh_kalimat?: string
    contoh_arti?: string
    jlpt_level: string
    mastered?: boolean
    correct_count?: number
    wrong_count?: number
  }
  onToggleMastered?: (id: number, mastered: boolean) => void
  onBookmark?: (id: number) => void
  isBookmarked?: boolean
  isToggling?: boolean
}

export function VocabCard({ vocab, onToggleMastered, onBookmark, isBookmarked, isToggling }: VocabCardProps) {
  const [showMeaning, setShowMeaning] = useState(false)
  const [showExample, setShowExample] = useState(false)

  const getJLPTColor = (level: string) => {
    const colors = {
      N5: "bg-green-500",
      N4: "bg-blue-500",
      N3: "bg-yellow-500",
      N2: "bg-orange-500",
      N1: "bg-red-500",
    }
    return colors[level as keyof typeof colors] || "bg-gray-500"
  }

  const handleSpeak = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = "ja-JP"
      window.speechSynthesis.cancel()
      window.speechSynthesis.speak(utterance)
    }
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="h-full overflow-hidden border-2 hover:shadow-lg transition-all duration-200">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <Badge className={cn(getJLPTColor(vocab.jlpt_level), "text-white")}>
              {vocab.jlpt_level}
            </Badge>
            <div className="flex gap-1">
              {onBookmark && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onBookmark(vocab.id)}
                >
                  <Bookmark className={cn("h-4 w-4", isBookmarked && "fill-japanese-500 text-japanese-500")} />
                </Button>
              )}
              {onToggleMastered && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onToggleMastered(vocab.id, !vocab.mastered)}
                  disabled={isToggling}
                >
                  {isToggling ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : vocab.mastered ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <h3 className="text-2xl font-bold japanese-text">{vocab.kanji}</h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleSpeak(vocab.kanji)}
              >
                <Volume2 className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">{vocab.hiragana}</p>
            {vocab.romaji && <p className="text-xs text-muted-foreground">{vocab.romaji}</p>}
          </div>

          <div className="text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMeaning(!showMeaning)}
              className="w-full"
            >
              {showMeaning ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
              {showMeaning ? "Sembunyikan Arti" : "Tampilkan Arti"}
            </Button>
            
            {showMeaning && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 p-3 rounded-lg bg-muted/50"
              >
                <p className="font-medium text-center">{vocab.arti}</p>
              </motion.div>
            )}
          </div>

          {vocab.contoh_kalimat && (
            <div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowExample(!showExample)}
                className="w-full text-xs"
              >
                {showExample ? "Sembunyikan Contoh" : "Tampilkan Contoh Kalimat"}
              </Button>
              
              {showExample && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 p-3 rounded-lg bg-muted/30 text-sm"
                >
                  <p className="japanese-text">{vocab.contoh_kalimat}</p>
                  <p className="text-xs text-muted-foreground mt-1">{vocab.contoh_arti}</p>
                </motion.div>
              )}
            </div>
          )}
        </CardContent>

        {vocab.correct_count !== undefined && vocab.wrong_count !== undefined && (
          <CardFooter className="pt-0">
            <div className="flex gap-4 text-xs text-muted-foreground w-full justify-center">
              <span className="text-green-600 dark:text-green-400">✓ {vocab.correct_count}</span>
              <span className="text-red-600 dark:text-red-400">✗ {vocab.wrong_count}</span>
            </div>
          </CardFooter>
        )}
      </Card>
    </motion.div>
  )
}