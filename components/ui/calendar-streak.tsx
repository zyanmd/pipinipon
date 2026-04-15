"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Flame, CalendarDays, CheckCircle2, XCircle } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface StreakDay {
  date: string
  studied: boolean
  count: number
}

interface CalendarStreakProps {
  streakData?: StreakDay[]
  currentStreak?: number
  longestStreak?: number
  totalStudyDays?: number
}

// Helper untuk mendapatkan tanggal lokal (WIB)
const getLocalDate = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function CalendarStreak({ 
  streakData = [], 
  currentStreak = 0, 
  longestStreak = 0, 
  totalStudyDays = 0
}: CalendarStreakProps) {
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [calendarDays, setCalendarDays] = useState<(StreakDay | null)[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Generate calendar days for current month
  useEffect(() => {
    const year = selectedMonth.getFullYear()
    const month = selectedMonth.getMonth()
    
    const firstDayOfMonth = new Date(year, month, 1)
    const lastDayOfMonth = new Date(year, month + 1, 0)
    const startingDayOfWeek = firstDayOfMonth.getDay()
    
    const days: (StreakDay | null)[] = []
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add days of the month
    for (let d = 1; d <= lastDayOfMonth.getDate(); d++) {
      const date = new Date(year, month, d)
      const dateStr = getLocalDate(date)
      const streak = streakData.find(s => s.date === dateStr)
      
      days.push({
        date: dateStr,
        studied: streak?.studied || false,
        count: streak?.count || 0
      })
    }
    
    setCalendarDays(days)
  }, [selectedMonth, streakData])

  const changeMonth = (increment: number) => {
    setSelectedMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + increment, 1))
  }

  const getStreakColor = (studied: boolean, count: number) => {
    if (!studied) return "bg-muted hover:bg-muted/80"
    if (count >= 20) return "bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600"
    if (count >= 10) return "bg-orange-500 hover:bg-orange-600 dark:bg-orange-400 dark:hover:bg-orange-500"
    if (count >= 5) return "bg-orange-400 hover:bg-orange-500 dark:bg-orange-300 dark:hover:bg-orange-400"
    return "bg-orange-300 hover:bg-orange-400 dark:bg-orange-200 dark:hover:bg-orange-300"
  }

  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
  ]
  
  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"]

  // Calculate stats for current month
  const currentMonthStats = calendarDays.filter(day => day?.studied).length
  const totalDaysInMonth = calendarDays.filter(day => day !== null).length
  const completionRate = totalDaysInMonth > 0 ? (currentMonthStats / totalDaysInMonth) * 100 : 0

  // Get today's date in local time
  const todayStr = getLocalDate(new Date())
  const todayStudied = streakData.find(s => s.date === todayStr)?.studied || false

  if (!mounted) {
    return null
  }

  return (
    <TooltipProvider>
      <Card className="w-full border-border bg-card">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-red-500">
                <Flame className="h-3.5 w-3.5 text-white" />
              </div>
              <div>
                <CardTitle className="text-sm text-foreground">Streak Belajar</CardTitle>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-center">
                <p className="text-lg font-bold text-orange-500">{currentStreak}</p>
                <p className="text-[10px] text-muted-foreground">Streak</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-green-500">{longestStreak}</p>
                <p className="text-[10px] text-muted-foreground">Terbaik</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-blue-500">{totalStudyDays}</p>
                <p className="text-[10px] text-muted-foreground">Total</p>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {/* Today's Status */}
          <div className="mb-2 p-1.5 rounded-lg bg-muted/50">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <CalendarDays className="h-3 w-3 text-muted-foreground" />
                <span className="font-medium text-foreground">Hari ini</span>
              </div>
              {todayStudied ? (
                <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Sudah belajar</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                  <Flame className="h-3 w-3" />
                  <span>Belum belajar</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => changeMonth(-1)}
              className="p-1 rounded hover:bg-muted transition-colors text-foreground"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className="flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                {monthNames[selectedMonth.getMonth()]} {selectedMonth.getFullYear()}
              </span>
            </div>
            
            <button
              onClick={() => changeMonth(1)}
              className="p-1 rounded hover:bg-muted transition-colors text-foreground"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          {/* Month Stats */}
          <div className="mb-2 p-1.5 rounded-lg bg-muted/30">
            <div className="flex justify-between items-center text-xs">
              <span className="text-foreground">Aktivitas bulan ini</span>
              <span className="text-muted-foreground">
                {currentMonthStats}/{totalDaysInMonth} ({Math.round(completionRate)}%)
              </span>
            </div>
            <div className="mt-1 h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
          
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {dayNames.map(day => (
              <div key={day} className="text-center text-[10px] font-medium text-muted-foreground py-1">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-0.5">
            {calendarDays.map((day, index) => {
              const isToday = day?.date === todayStr
              return (
                <div key={index}>
                  {day ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className={cn(
                            "aspect-square rounded-md transition-all duration-200 cursor-pointer flex items-center justify-center",
                            getStreakColor(day.studied, day.count),
                            isToday && "ring-2 ring-orange-500 ring-offset-1 ring-offset-background dark:ring-offset-background"
                          )}
                        >
                          <span className={cn(
                            "text-[11px] font-medium",
                            day.studied && "text-white",
                            !day.studied && "text-foreground"
                          )}>
                            {new Date(day.date).getDate()}
                          </span>
                        </motion.div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs bg-popover text-popover-foreground border-border">
                        <div className="text-center">
                          <p className="font-medium">
                            {new Date(day.date).toLocaleDateString('id-ID', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long'
                            })}
                          </p>
                          {day.studied ? (
                            <>
                              <p className="text-green-600 dark:text-green-400 flex items-center gap-1 justify-center mt-1">
                                <CheckCircle2 className="h-3 w-3" />
                                Belajar! ({day.count} soal)
                              </p>
                            </>
                          ) : (
                            <p className="text-red-600 dark:text-red-400 flex items-center gap-1 justify-center mt-1">
                              <XCircle className="h-3 w-3" />
                              Tidak belajar
                            </p>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <div className="aspect-square rounded-md bg-transparent" />
                  )}
                </div>
              )
            })}
          </div>
          
          {/* Motivation Message */}
          {currentStreak > 0 && (
            <div className="mt-2 p-1.5 rounded-lg bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 border border-orange-200 dark:border-orange-800/50">
              <div className="flex items-center gap-1.5">
                <Flame className="h-3 w-3 text-orange-500" />
                <p className="text-xs text-foreground">
                  {currentStreak === 1 
                    ? "Pertahankan streak-mu besok!"
                    : currentStreak < 7 
                      ? `${currentStreak} hari berturut-turut! 🔥`
                      : currentStreak < 30
                        ? `${currentStreak} hari streak! Konsisten! 🎉`
                        : `${currentStreak} hari streak! Luar biasa! 🏆`
                  }
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}