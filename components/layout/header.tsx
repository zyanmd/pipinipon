"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/lib/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "./theme-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getAvatarUrl } from "@/lib/image-helper"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet"
import { 
  BookOpen, 
  GraduationCap, 
  MessageCircle, 
  LayoutDashboard, 
  LogOut, 
  User, 
  Settings, 
  Bell, 
  AtSign,
  MessageSquareReply,
  CheckCheck,
  PenTool,
  Shield,
  Menu,
  X
} from "lucide-react"
import { motion, AnimatePresence, useMotionValueEvent, useScroll } from "framer-motion"
import { useEffect, useState, useCallback, useRef } from "react"
import { chatAPI } from "@/lib/api"
import { cn } from "@/lib/utils"
import { useTheme } from "@/components/providers/theme-provider"
import { VerifiedBadge } from "@/components/ui/verified-badge"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/vocabulary", label: "Kosakata", icon: BookOpen },
  { href: "/grammar", label: "Tata Bahasa", icon: GraduationCap },
  { href: "/study", label: "Belajar", icon: GraduationCap },
  { href: "/writing-practice", label: "Menulis", icon: PenTool },
  { href: "/chat", label: "Chat", icon: MessageCircle },
]

const adminNavItem = { href: "/admin", label: "Admin", icon: Shield }

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout, isLoading } = useAuth()
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isIphoneMode, setIsIphoneMode] = useState(false)
  const [mentionUnread, setMentionUnread] = useState(0)
  const [replyUnread, setReplyUnread] = useState(0)
  const [showNotificationPopup, setShowNotificationPopup] = useState(false)
  const [recentMentions, setRecentMentions] = useState<any[]>([])
  const [recentReplies, setRecentReplies] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<"mentions" | "replies">("mentions")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [fetchError, setFetchError] = useState(false)
  const [avatarDropdownOpen, setAvatarDropdownOpen] = useState(false)
  const popupRef = useRef<HTMLDivElement>(null)
  const avatarDropdownRef = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()

  const currentUser = user
  const isLoggedIn = !!user
  const isAdmin = currentUser?.role === "admin"

  useEffect(() => {
    setMounted(true)
  }, [])

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 20) {
      setIsIphoneMode(true)
    } else {
      setIsIphoneMode(false)
    }
  })

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setShowNotificationPopup(false)
      }
      if (avatarDropdownRef.current && !avatarDropdownRef.current.contains(event.target as Node)) {
        setAvatarDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const fetchNotifications = useCallback(async () => {
    if (!isLoggedIn) return
    
    setFetchError(false)
    
    try {
      const summaryResponse = await chatAPI.getNotificationSummary()
      if (summaryResponse?.data?.data) {
        setMentionUnread(summaryResponse.data.data.unread_mentions || 0)
        setReplyUnread(summaryResponse.data.data.unread_replies || 0)
      }
      
      try {
        const mentionsResponse = await chatAPI.getMentions({ is_read: 0, per_page: 10 })
        if (mentionsResponse?.data?.data?.mentions) {
          setRecentMentions(mentionsResponse.data.data.mentions)
        } else {
          setRecentMentions([])
        }
      } catch (mentionError) {
        console.warn("Could not fetch mentions:", mentionError)
        setRecentMentions([])
      }
      
      try {
        const repliesResponse = await chatAPI.getReplyNotifications({ is_read: 0, per_page: 10 })
        if (repliesResponse?.data?.data?.notifications) {
          setRecentReplies(repliesResponse.data.data.notifications)
        } else {
          setRecentReplies([])
        }
      } catch (replyError) {
        console.warn("Could not fetch replies:", replyError)
        setRecentReplies([])
      }
      
    } catch (error) {
      console.error("Error fetching notifications:", error)
      setFetchError(true)
      setMentionUnread(0)
      setReplyUnread(0)
      setRecentMentions([])
      setRecentReplies([])
    }
  }, [isLoggedIn])

  useEffect(() => {
    if (isLoggedIn) {
      const timer = setTimeout(() => {
        fetchNotifications()
      }, 1000)
      
      const interval = setInterval(() => {
        fetchNotifications()
      }, 30000)
      
      return () => {
        clearTimeout(timer)
        clearInterval(interval)
      }
    }
  }, [fetchNotifications, isLoggedIn])

  const handleMarkMentionAsRead = async (mentionId: number, event?: React.MouseEvent) => {
    if (event) event.stopPropagation()
    try {
      await chatAPI.markMentionRead(mentionId)
      setMentionUnread(prev => Math.max(0, prev - 1))
      setRecentMentions(prev => prev.filter(m => m.id !== mentionId))
    } catch (error) {
      console.error("Error marking mention as read:", error)
    }
  }

  const handleMarkReplyAsRead = async (notifId: number, event?: React.MouseEvent) => {
    if (event) event.stopPropagation()
    try {
      await chatAPI.markReplyNotificationRead(notifId)
      setReplyUnread(prev => Math.max(0, prev - 1))
      setRecentReplies(prev => prev.filter(r => r.id !== notifId))
    } catch (error) {
      console.error("Error marking reply as read:", error)
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await Promise.allSettled([
        chatAPI.markAllMentionsRead(),
        chatAPI.markAllReplyNotificationsRead()
      ])
      setMentionUnread(0)
      setReplyUnread(0)
      setRecentMentions([])
      setRecentReplies([])
    } catch (error) {
      console.error("Error marking all as read:", error)
    }
  }

  const handleViewAll = () => {
    router.push("/chat")
    setShowNotificationPopup(false)
  }

  const handleLogout = () => {
    logout()
    setMobileMenuOpen(false)
    setAvatarDropdownOpen(false)
  }

  const totalUnread = mentionUnread + replyUnread

  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 w-full bg-background border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="h-16" />
        </div>
      </header>
    )
  }

  return (
    <>
      <div className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        isIphoneMode ? "px-4 pt-4" : "bg-background border-b border-border"
      )}>
        <div className="mx-auto max-w-7xl">
          <motion.div
            animate={{
              borderRadius: isIphoneMode ? "1rem" : "0rem",
              backgroundColor: isIphoneMode ? "var(--background)" : "transparent",
              backdropFilter: isIphoneMode ? "blur(12px)" : "blur(0px)",
              border: isIphoneMode ? "1px solid var(--border)" : "0px solid transparent",
              boxShadow: isIphoneMode ? "0 4px 20px rgba(0, 0, 0, 0.05)" : "none",
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={cn(
              "flex h-16 items-center justify-between transition-all duration-300",
              isIphoneMode ? "px-4" : "px-4 sm:px-6 lg:px-8"
            )}
          >
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 flex-shrink-0 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-md">
                <span className="text-white font-black text-sm">P</span>
              </div>
              <span className="font-black text-xl bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                Pipinipon
              </span>
            </Link>

            {/* Navigation - Desktop */}
            {isLoggedIn && (
              <nav className="hidden lg:flex items-center justify-center space-x-1 flex-1 mx-4">
                {navItems.map((item) => {
                  const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
                  return (
                    <Link key={item.href} href={item.href}>
                      <Button
                        variant={isActive ? "japanese" : "ghost"}
                        size="sm"
                        className={cn(
                          "transition-all duration-200",
                          isIphoneMode ? "rounded-xl" : "rounded-md",
                          isActive ? "shadow-md" : "hover:bg-muted/50"
                        )}
                      >
                        <item.icon className="mr-2 h-4 w-4" />
                        {item.label}
                      </Button>
                    </Link>
                  )
                })}
                
                {isAdmin && (
                  <Link href={adminNavItem.href}>
                    <Button
                      variant={pathname === "/admin" ? "japanese" : "ghost"}
                      size="sm"
                      className={cn(
                        "transition-all duration-200",
                        isIphoneMode ? "rounded-xl" : "rounded-md",
                        pathname === "/admin" ? "shadow-md" : "hover:bg-muted/50"
                      )}
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      Admin
                    </Button>
                  </Link>
                )}
              </nav>
            )}

            {/* Right Side */}
            <div className="flex items-center space-x-1.5 sm:space-x-2 flex-shrink-0">
              <ThemeToggle />
              
              {isLoggedIn && currentUser && (
                <>
                  {/* Notification Bell - sama seperti sebelumnya */}
                  {/* ... kode notifikasi tetap sama ... */}
                  
                  {/* Mobile Menu Button */}
                  <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                    <SheetTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "lg:hidden h-10 w-10 transition-all duration-200",
                          isIphoneMode ? "rounded-xl" : "rounded-md",
                          "hover:bg-muted/50"
                        )}
                      >
                        <Menu className="h-5 w-5" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[300px] sm:w-[360px] p-0">
                      {/* konten mobile menu */}
                    </SheetContent>
                  </Sheet>

                  {/* Desktop Avatar Dropdown */}
                  <div className="relative hidden lg:block" ref={avatarDropdownRef}>
                    <button
                      onClick={() => setAvatarDropdownOpen(!avatarDropdownOpen)}
                      className={cn(
                        "relative h-10 w-10 flex items-center justify-center transition-colors duration-200 focus:outline-none",
                        isIphoneMode ? "rounded-xl" : "rounded-md",
                        "hover:bg-muted/50"
                      )}
                    >
                      <Avatar className="h-9 w-9 ring-2 ring-border/50">
                        <AvatarImage
                          src={getAvatarUrl(currentUser.avatar)}
                          alt={currentUser.username}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-japanese-500 to-japanese-600 text-white">
                          {currentUser.username?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </button>

                    <AnimatePresence>
                      {avatarDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -8, scale: 0.95 }}
                          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                          className="absolute right-0 mt-2 w-56 bg-popover rounded-2xl shadow-2xl border border-border/50 z-50 overflow-hidden"
                        >
                          <div className="px-3 py-3 border-b border-border/50">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold leading-none">{currentUser.username}</p>
                              {currentUser.verified_badge === 1 && <VerifiedBadge size="sm" />}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1.5 truncate">
                              {currentUser.email}
                            </p>
                          </div>

                          <div className="p-1.5">
                            <Link
                              href={`/profile/${currentUser.username}`}
                              onClick={() => setAvatarDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-2.5 py-2 text-sm rounded-xl hover:bg-muted/60 transition-colors duration-150"
                            >
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span>Profil</span>
                            </Link>

                            <Link
                              href="/settings"
                              onClick={() => setAvatarDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-2.5 py-2 text-sm rounded-xl hover:bg-muted/60 transition-colors duration-150"
                            >
                              <Settings className="h-4 w-4 text-muted-foreground" />
                              <span>Pengaturan</span>
                            </Link>

                            <div className="my-1 h-px bg-border/60" />

                            <button
                              onClick={() => {
                                setAvatarDropdownOpen(false)
                                handleLogout()
                              }}
                              className="flex items-center gap-2.5 px-2.5 py-2 text-sm rounded-xl w-full text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors duration-150"
                            >
                              <LogOut className="h-4 w-4" />
                              <span>Keluar</span>
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              )}
              
              {!isLoggedIn && !isLoading && (
                <div className="flex items-center space-x-2">
                  <Link href="/login">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={cn(
                        "text-sm",
                        isIphoneMode ? "rounded-xl" : "rounded-md"
                      )}
                    >
                      Masuk
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button 
                      variant="japanese" 
                      size="sm" 
                      className={cn(
                        "shadow-md text-sm",
                        isIphoneMode ? "rounded-xl" : "rounded-md"
                      )}
                    >
                      Daftar
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Spacer */}
      <div className="h-16" />
    </>
  )
}