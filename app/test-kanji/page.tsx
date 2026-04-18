// app/test-kanji/page.tsx
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Play, RefreshCw, CheckCircle, XCircle, Info } from "lucide-react"
import { KanjiVG } from 'kanjivg-js'
import { KanjiCard } from 'kanjivg-js/react'

export default function TestKanjiPage() {
  const [kanji, setKanji] = useState("日")
  const [loading, setLoading] = useState(false)
  const [kanjiData, setKanjiData] = useState<any>(null)
  const [error, setError] = useState<string>("")
  const [libraryReady, setLibraryReady] = useState(false)
  const [kvInstance, setKvInstance] = useState<KanjiVG | null>(null)

  // Initialize KanjiVG
  useEffect(() => {
    const initKanjiVG = async () => {
      try {
        const kv = new KanjiVG()
        setKvInstance(kv)
        setLibraryReady(true)
        console.log("KanjiVG library initialized")
      } catch (err) {
        console.error("Failed to initialize KanjiVG:", err)
        setError("Gagal menginisialisasi library KanjiVG")
      }
    }
    
    initKanjiVG()
  }, [])

  // Load kanji data
  const loadKanji = async () => {
    if (!kvInstance) {
      setError("Library belum siap")
      return
    }
    
    setLoading(true)
    setError("")
    setKanjiData(null)
    
    try {
      const data = await kvInstance.getKanji(kanji)
      if (data && data.length > 0) {
        setKanjiData(data[0]) // Ambil data pertama (biasanya yang utama)
        console.log("Kanji data loaded:", data[0])
      } else {
        setError(`Kanji "${kanji}" tidak ditemukan dalam database`)
      }
    } catch (err) {
      console.error("Error loading kanji:", err)
      setError(`Gagal memuat kanji "${kanji}". Pastikan kanji tersebut ada dalam database.`)
    } finally {
      setLoading(false)
    }
  }

  const handleLoad = () => {
    loadKanji()
  }

  // Test dengan beberapa kanji populer
  const quickTests = ["日", "本", "語", "愛", "車", "電", "食", "飲", "行", "来"]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-500 to-emerald-600 bg-clip-text text-transparent mb-2">
            Test KanjiVG JS
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Uji coba kanji stroke order animation dengan library kanjivg-js
          </p>
        </div>

        {/* Library Status */}
        <Card className="mb-6 bg-white dark:bg-gray-900 border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Status Library</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
              <span className="font-mono text-sm">kanjivg-js</span>
              {libraryReady ? (
                <div className="flex items-center gap-2 text-green-500">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-xs">Ready</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-yellow-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-xs">Initializing...</span>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Library kanjivg-js menyediakan data stroke order dari KanjiVG
            </p>
          </CardContent>
        </Card>

        {/* Input Section */}
        <Card className="mb-6 bg-white dark:bg-gray-900 border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Input Kanji</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input
                value={kanji}
                onChange={(e) => setKanji(e.target.value)}
                placeholder="Masukkan kanji (contoh: 日, 本, 語, 愛)"
                className="flex-1 font-mono text-lg"
                maxLength={1}
              />
              <Button 
                onClick={handleLoad} 
                disabled={loading || !libraryReady} 
                className="bg-emerald-500 hover:bg-emerald-600"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                Load
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="text-xs text-gray-500 mr-2">Test cepat:</span>
              {quickTests.map((k) => (
                <button
                  key={k}
                  onClick={() => {
                    setKanji(k)
                    setTimeout(() => loadKanji(), 100)
                  }}
                  className="px-2 py-1 text-sm bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  {k}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Kanji Display */}
        <Card className="bg-white dark:bg-gray-900 border-0 shadow-md">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-gray-900 dark:text-white">Preview Kanji</CardTitle>
              {kanjiData && (
                <div className="text-sm text-gray-500">
                  {kanjiData.strokeCount} coretan
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-3" />
                <p className="text-sm text-gray-500">Memuat data kanji...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <XCircle className="w-8 h-8 text-red-500" />
                </div>
                <p className="text-red-500">{error}</p>
                <p className="text-xs text-gray-500 mt-2">
                  Tips: Coba kanji lain seperti "日", "本", "語"
                </p>
              </div>
            ) : kanjiData ? (
              <div className="flex flex-col items-center">
                <KanjiCard 
                  kanji={kanjiData}
                  animationOptions={{
                    strokeSpeed: 800,
                    strokeDelay: 400,
                    showNumbers: true,
                    showTrace: false,
                    strokeStyling: {
                      strokeColour: '#10b981',
                      strokeThickness: 4,
                      strokeRadius: 0,
                    },
                    numberStyling: {
                      fontColour: '#ef4444',
                      fontWeight: 600,
                      fontSize: 12,
                    }
                  }}
                  infoPanel={{
                    showInfo: true,
                    location: 'bottom',
                    style: {
                      backgroundColor: '#f3f4f6',
                      borderRadius: '12px',
                      padding: '1rem',
                      marginTop: '1rem',
                      width: '100%'
                    }
                  }}
                  className="w-80 h-80"
                />
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    💡 Kanji akan dianimasikan secara otomatis dengan urutan coretan yang benar
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Angka merah menunjukkan urutan coretan
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <span className="text-3xl">{kanji}</span>
                </div>
                <p className="text-gray-500">Klik "Load" untuk memuat kanji</p>
                <p className="text-xs text-gray-400 mt-2">
                  Pastikan library sudah siap (status hijau)
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Panel */}
        {kanjiData && (
          <Card className="mt-6 bg-emerald-50 dark:bg-emerald-950/20 border-0 shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-emerald-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Informasi Kanji: {kanjiData.character}
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Unicode:</span>
                      <span className="ml-2 font-mono">{kanjiData.unicode}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Jumlah Coretan:</span>
                      <span className="ml-2 font-semibold">{kanjiData.strokeCount}</span>
                    </div>
                    {kanjiData.radicalInfo && (
                      <div className="col-span-2">
                        <span className="text-gray-500">Radikal:</span>
                        <span className="ml-2">{kanjiData.radicalInfo.radical}</span>
                        <span className="ml-2 text-gray-400">
                          (posisi: {kanjiData.radicalInfo.positions?.join(', ')})
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}