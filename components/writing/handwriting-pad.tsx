"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Check, X, ThumbsUp, ThumbsDown, Eye, EyeOff } from "lucide-react"

interface HandwritingPadProps {
  targetKanji: string
  targetMeaning: string
  targetReading?: string
  onCorrect: () => void
  onIncorrect: () => void
  disabled?: boolean
}

export function HandwritingPad({ 
  targetKanji, 
  targetMeaning, 
  targetReading, 
  onCorrect, 
  onIncorrect, 
  disabled 
}: HandwritingPadProps) {
  const [userAnswer, setUserAnswer] = useState("")
  const [showGuide, setShowGuide] = useState(true)
  const [showSelfAssessment, setShowSelfAssessment] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)

  const handleSubmit = () => {
    // Compare user answer with target kanji (case insensitive, trim whitespace)
    const normalizedAnswer = userAnswer.trim().toLowerCase()
    const normalizedTarget = targetKanji.trim().toLowerCase()
    
    // Exact match
    const isExactMatch = normalizedAnswer === normalizedTarget
    
    // Check if answer matches reading (hiragana/romaji)
    let isReadingMatch = false
    if (targetReading) {
      const normalizedReading = targetReading.trim().toLowerCase()
      isReadingMatch = normalizedAnswer === normalizedReading
    }
    
    // For multi-character, check character by character
    let isCloseMatch = false
    if (targetKanji.length > 1 && normalizedAnswer.length === targetKanji.length) {
      let matchCount = 0
      for (let i = 0; i < targetKanji.length; i++) {
        if (normalizedAnswer[i] === targetKanji[i]) matchCount++
      }
      isCloseMatch = matchCount >= targetKanji.length * 0.7
    }
    
    if (isExactMatch || isReadingMatch || isCloseMatch) {
      onCorrect()
    } else {
      onIncorrect()
    }
  }

  const openSelfAssessment = () => {
    setShowSelfAssessment(true)
  }

  const handleSelfCorrect = () => {
    onCorrect()
    setShowSelfAssessment(false)
  }

  const handleSelfIncorrect = () => {
    onIncorrect()
    setShowSelfAssessment(false)
  }

  return (
    <div className="space-y-4">
      {/* Soal - Arti dalam Bahasa Indonesia */}
      <div className="text-center p-5 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
        <p className="text-sm text-muted-foreground mb-2">Apa bahasa Jepangnya?</p>
        <p className="text-2xl md:text-3xl font-bold text-foreground">
          {targetMeaning}
        </p>
        {showGuide && targetReading && (
          <div className="mt-3 p-2 bg-white/50 dark:bg-black/20 rounded-lg">
            <p className="text-xs text-muted-foreground">
              Petunjuk: 
              <span className="font-medium text-orange-600 dark:text-orange-400 ml-1">
                {targetReading}
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="space-y-3">
        <Label htmlFor="kanji-input" className="text-sm font-medium">
          Tulis jawaban dalam Bahasa Jepang
        </Label>
        <Input
          id="kanji-input"
          type="text"
          placeholder="Contoh: 日本, にほん, nihon"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          disabled={disabled}
          className="text-lg font-japanese"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !disabled && userAnswer.trim()) {
              handleSubmit()
            }
          }}
        />
        <p className="text-xs text-muted-foreground">
          💡 Tips: Kamu bisa menulis dalam Kanji, Hiragana, atau Romaji
        </p>
      </div>

      {/* Show Answer Button */}
      <div className="flex justify-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAnswer(!showAnswer)}
          className="text-xs text-muted-foreground"
        >
          <Eye className="h-3 w-3 mr-1" />
          {showAnswer ? "Sembunyikan" : "Lihat"} jawaban
        </Button>
      </div>

      {showAnswer && (
        <div className="p-3 bg-muted/30 rounded-lg text-center">
          <p className="text-sm text-muted-foreground">Jawaban:</p>
          <p className="text-2xl font-japanese font-bold text-japanese-700 dark:text-japanese-300">
            {targetKanji}
          </p>
          {targetReading && (
            <p className="text-xs text-muted-foreground mt-1">({targetReading})</p>
          )}
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex flex-wrap gap-2 justify-center">
        <Button 
          variant="outline" 
          onClick={() => setShowGuide(!showGuide)} 
          disabled={disabled}
          size="sm"
        >
          {showGuide ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
          {showGuide ? "Sembunyikan Petunjuk" : "Tampilkan Petunjuk"}
        </Button>
        
        <Button 
          variant="outline" 
          onClick={() => setUserAnswer("")} 
          disabled={disabled || !userAnswer}
          size="sm"
        >
          <X className="h-4 w-4 mr-2" />
          Hapus
        </Button>
        
        <Button 
          variant="japanese" 
          onClick={handleSubmit}
          disabled={disabled || !userAnswer.trim()}
          size="sm"
          className="bg-gradient-to-r from-orange-500 to-red-500"
        >
          <Check className="h-4 w-4 mr-2" />
          Cek Jawaban
        </Button>
      </div>

      {/* Or use self-assessment */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-background px-2 text-muted-foreground">atau</span>
        </div>
      </div>

      <Button 
        variant="outline" 
        onClick={openSelfAssessment}
        disabled={disabled}
        size="sm"
        className="w-full"
      >
        Nilai Sendiri (Self Assessment)
      </Button>

      {/* Self Assessment Modal */}
      {showSelfAssessment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold mb-2">Nilai Jawaban Kamu</h3>
              <p className="text-muted-foreground text-sm">
                Bandingkan jawabanmu dengan jawaban yang benar
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="font-medium text-center mb-2">Soal:</p>
                <p className="text-lg font-bold text-center">{targetMeaning}</p>
                
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-muted-foreground text-center">Jawaban kamu:</p>
                  <p className="text-xl font-japanese text-center mt-1">{userAnswer || "(kosong)"}</p>
                </div>
                
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-muted-foreground text-center">Jawaban yang benar:</p>
                  <p className="text-2xl font-japanese font-bold text-center text-green-600 dark:text-green-400">
                    {targetKanji}
                  </p>
                  {targetReading && (
                    <p className="text-xs text-muted-foreground text-center mt-1">({targetReading})</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={handleSelfCorrect}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  Jawaban Saya Benar
                </Button>
                <Button 
                  onClick={handleSelfIncorrect}
                  variant="destructive"
                  className="flex-1"
                >
                  <ThumbsDown className="h-4 w-4 mr-2" />
                  Masih Salah
                </Button>
              </div>

              <Button 
                variant="outline" 
                onClick={() => setShowSelfAssessment(false)}
                className="w-full"
              >
                Batal
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="text-center text-xs text-muted-foreground">
        💡 Tips: Ketik jawaban dalam Bahasa Jepang (Kanji, Hiragana, atau Romaji)
      </div>
    </div>
  )
}