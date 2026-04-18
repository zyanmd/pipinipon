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
  Shield,
  Menu,
  Newspaper,
  Home,
  Sparkles,
  BookMarked,
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
  { href: "/study", label: "Belajar", icon: Sparkles },
  { href: "/reading", label: "Membaca", icon: Newspaper },
  { href: "/chat", label: "Chat", icon: MessageCircle },
]

const adminNavItem = { href: "/admin", label: "Admin", icon: Shield }

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout, isLoading } = useAuth()
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
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
    setIsScrolled(latest > 20)
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
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="h-16 bg-transparent" />
      </header>
    )
  }

  const isDark = theme === "dark"

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 px-4 pt-4 pointer-events-none">
        <div className="mx-auto max-w-7xl pointer-events-auto">
          <motion.div
            animate={{
              backgroundColor: isScrolled 
                ? isDark ? "rgba(28, 28, 30, 0.85)" : "rgba(255, 255, 255, 0.85)"
                : "rgba(0, 0, 0, 0)",
              backdropFilter: isScrolled ? "blur(20px)" : "blur(0px)",
              borderColor: isScrolled 
                ? isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)"
                : "rgba(0, 0, 0, 0)",
              boxShadow: isScrolled 
                ? "0 8px 32px rgba(0, 0, 0, 0.08)"
                : "none",
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="rounded-2xl border h-14 flex items-center justify-between px-4"
          >
            {/* Logo - iPhone style */}
            <Link href="/" className="flex items-center space-x-2 flex-shrink-0 group">
              <motion.div 
                className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-white font-bold text-xs">P</span>
              </motion.div>
              <span className={`font-bold text-lg ${isDark ? "text-white" : "text-gray-900"}`}>
                Pipinipon
              </span>
            </Link>

            {/* Navigation - Desktop (iPhone style) */}
            {isLoggedIn && (
              <nav className="hidden lg:flex items-center justify-center space-x-0.5 flex-1 mx-4">
                {navItems.map((item) => {
                  const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
                  return (
                    <Link key={item.href} href={item.href}>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "rounded-xl transition-all duration-200",
                            isActive 
                              ? isDark ? "bg-white/10 text-white" : "bg-gray-100 text-gray-900"
                              : "hover:bg-gray-100 dark:hover:bg-white/10",
                            "text-sm font-medium"
                          )}
                        >
                          <item.icon className="mr-2 h-4 w-4" />
                          {item.label}
                        </Button>
                      </motion.div>
                    </Link>
                  )
                })}
                
                {isAdmin && (
                  <Link href={adminNavItem.href}>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "rounded-xl transition-all duration-200",
                          pathname === "/admin" 
                            ? isDark ? "bg-white/10 text-white" : "bg-gray-100 text-gray-900"
                            : "hover:bg-gray-100 dark:hover:bg-white/10",
                          "text-sm font-medium"
                        )}
                      >
                        <Shield className="mr-2 h-4 w-4" />
                        Admin
                      </Button>
                    </motion.div>
                  </Link>
                )}
              </nav>
            )}

            {/* Right Side - iPhone style */}
            <div className="flex items-center space-x-1 flex-shrink-0">
              <ThemeToggle />
              
              {isLoggedIn && currentUser && (
                <>
                  {/* Notification Bell */}
                  <div className="relative" ref={popupRef}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowNotificationPopup(!showNotificationPopup)}
                      className={cn(
                        "relative h-9 w-9 rounded-xl flex items-center justify-center transition-all duration-200",
                        isDark ? "hover:bg-white/10" : "hover:bg-gray-100"
                      )}
                    >
                      <Bell className={`h-4 w-4 ${isDark ? "text-white" : "text-gray-700"}`} />
                      {totalUnread > 0 && (
                        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
                      )}
                    </motion.button>

                    <AnimatePresence>
                      {showNotificationPopup && (
                        <motion.div
                          initial={{ opacity: 0, y: -8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -8, scale: 0.95 }}
                          transition={{ duration: 0.18 }}
                          className={`absolute right-0 mt-2 w-80 rounded-2xl shadow-xl z-50 overflow-hidden ${
                            isDark ? "bg-gray-900 border border-gray-800" : "bg-white border border-gray-100"
                          }`}
                        >
                          <div className={`flex items-center justify-between px-4 py-3 border-b ${isDark ? "border-gray-800" : "border-gray-100"}`}>
                            <h3 className={`font-semibold text-sm ${isDark ? "text-white" : "text-gray-900"}`}>
                              Notifikasi
                            </h3>
                            {totalUnread > 0 && (
                              <button
                                onClick={handleMarkAllRead}
                                className={`text-xs transition-colors flex items-center gap-1 ${
                                  isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"
                                }`}
                              >
                                <CheckCheck className="h-3 w-3" />
                                Tandai semua
                              </button>
                            )}
                          </div>

                          <div className={`flex border-b ${isDark ? "border-gray-800" : "border-gray-100"}`}>
                            <button
                              onClick={() => setActiveTab("mentions")}
                              className={cn(
                                "flex-1 px-4 py-2 text-xs font-medium transition-colors relative",
                                activeTab === "mentions"
                                  ? isDark ? "text-white" : "text-gray-900"
                                  : isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"
                              )}
                            >
                              <div className="flex items-center justify-center gap-1.5">
                                <AtSign className="h-3.5 w-3.5" />
                                Mention
                                {mentionUnread > 0 && (
                                  <span className="ml-1 bg-red-500 text-white text-[10px] rounded-full px-1.5 py-0.5 min-w-[18px]">
                                    {mentionUnread}
                                  </span>
                                )}
                              </div>
                              {activeTab === "mentions" && (
                                <motion.div
                                  layoutId="activeTab"
                                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-red-500"
                                />
                              )}
                            </button>
                            <button
                              onClick={() => setActiveTab("replies")}
                              className={cn(
                                "flex-1 px-4 py-2 text-xs font-medium transition-colors relative",
                                activeTab === "replies"
                                  ? isDark ? "text-white" : "text-gray-900"
                                  : isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"
                              )}
                            >
                              <div className="flex items-center justify-center gap-1.5">
                                <MessageSquareReply className="h-3.5 w-3.5" />
                                Balasan
                                {replyUnread > 0 && (
                                  <span className="ml-1 bg-red-500 text-white text-[10px] rounded-full px-1.5 py-0.5 min-w-[18px]">
                                    {replyUnread}
                                  </span>
                                )}
                              </div>
                              {activeTab === "replies" && (
                                <motion.div
                                  layoutId="activeTab"
                                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-red-500"
                                />
                              )}
                            </button>
                          </div>

                          <div className="max-h-[400px] overflow-y-auto">
                            {fetchError ? (
                              <div className={`p-8 text-center text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                Gagal memuat notifikasi
                              </div>
                            ) : activeTab === "mentions" ? (
                              recentMentions.length === 0 ? (
                                <div className={`p-8 text-center text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                  Tidak ada mention baru
                                </div>
                              ) : (
                                recentMentions.map((mention) => (
                                  <div
                                    key={mention.id}
                                    className={`px-4 py-3 transition-colors cursor-pointer border-b ${
                                      isDark ? "border-gray-800 hover:bg-gray-800/50" : "border-gray-100 hover:bg-gray-50"
                                    } last:border-0`}
                                    onClick={() => {
                                      router.push(`/chat?messageId=${mention.message_id}`)
                                      setShowNotificationPopup(false)
                                    }}
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex-1 min-w-0">
                                        <p className={`text-sm ${isDark ? "text-white" : "text-gray-900"}`}>
                                          <span className="font-medium">{mention.mentioned_by_username}</span>
                                          {" "}mentions you
                                        </p>
                                        <p className={`text-xs mt-1 truncate ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                          {mention.message}
                                        </p>
                                        <p className={`text-xs mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                                          {new Date(mention.created_at).toLocaleDateString()}
                                        </p>
                                      </div>
                                      {!mention.is_read && (
                                        <button
                                          onClick={(e) => handleMarkMentionAsRead(mention.id, e)}
                                          className="h-5 w-5 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center text-[10px] hover:bg-blue-500/30 transition-colors"
                                        >
                                          ✓
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                ))
                              )
                            ) : (
                              recentReplies.length === 0 ? (
                                <div className={`p-8 text-center text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                  Tidak ada balasan baru
                                </div>
                              ) : (
                                recentReplies.map((reply) => (
                                  <div
                                    key={reply.id}
                                    className={`px-4 py-3 transition-colors cursor-pointer border-b ${
                                      isDark ? "border-gray-800 hover:bg-gray-800/50" : "border-gray-100 hover:bg-gray-50"
                                    } last:border-0`}
                                    onClick={() => {
                                      router.push(`/chat?messageId=${reply.message_id}`)
                                      setShowNotificationPopup(false)
                                    }}
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex-1 min-w-0">
                                        <p className={`text-sm ${isDark ? "text-white" : "text-gray-900"}`}>
                                          <span className="font-medium">{reply.replied_by_username}</span>
                                          {" "}replied to you
                                        </p>
                                        <p className={`text-xs mt-1 truncate ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                          {reply.reply_message}
                                        </p>
                                        <p className={`text-xs mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                                          {new Date(reply.created_at).toLocaleDateString()}
                                        </p>
                                      </div>
                                      {!reply.is_read && (
                                        <button
                                          onClick={(e) => handleMarkReplyAsRead(reply.id, e)}
                                          className="h-5 w-5 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center text-[10px] hover:bg-blue-500/30 transition-colors"
                                        >
                                          ✓
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                ))
                              )
                            )}
                          </div>

                          <div className={`p-3 border-t ${isDark ? "border-gray-800" : "border-gray-100"}`}>
                            <button
                              onClick={handleViewAll}
                              className={`w-full text-center text-sm transition-colors ${
                                isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"
                              }`}
                            >
                              Lihat semua di Chat
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  {/* Mobile Menu Button */}
                  <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                    <SheetTrigger asChild>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={cn(
                          "lg:hidden h-9 w-9 rounded-xl flex items-center justify-center transition-all duration-200",
                          isDark ? "hover:bg-white/10" : "hover:bg-gray-100"
                        )}
                      >
                        <Menu className={`h-4 w-4 ${isDark ? "text-white" : "text-gray-700"}`} />
                      </motion.button>
                    </SheetTrigger>
                    <SheetContent side="right" className={`w-[300px] sm:w-[360px] p-0 ${isDark ? "bg-gray-900" : "bg-white"}`}>
                      <SheetHeader className={`p-4 border-b ${isDark ? "border-gray-800" : "border-gray-100"}`}>
                        <SheetTitle className={`text-left flex items-center gap-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                            <span className="text-white font-black text-[10px]">P</span>
                          </div>
                          <span className="text-base">Menu</span>
                        </SheetTitle>
                      </SheetHeader>
                      
                      <div className="flex flex-col p-4 gap-1">
                        {navItems.map((item) => {
                          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              <Button
                                variant="ghost"
                                className={cn(
                                  "w-full justify-start rounded-xl transition-all duration-200",
                                  isActive 
                                    ? isDark ? "bg-white/10 text-white" : "bg-gray-100 text-gray-900"
                                    : isDark ? "text-gray-300 hover:bg-white/10" : "text-gray-700 hover:bg-gray-100"
                                )}
                              >
                                <item.icon className="mr-2 h-4 w-4" />
                                {item.label}
                              </Button>
                            </Link>
                          )
                        })}
                        
                        {isAdmin && (
                          <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                            <Button
                              variant="ghost"
                              className={cn(
                                "w-full justify-start rounded-xl",
                                pathname === "/admin" 
                                  ? isDark ? "bg-white/10 text-white" : "bg-gray-100 text-gray-900"
                                  : isDark ? "text-gray-300 hover:bg-white/10" : "text-gray-700 hover:bg-gray-100"
                              )}
                            >
                              <Shield className="mr-2 h-4 w-4" />
                              Admin
                            </Button>
                          </Link>
                        )}
                        
                        <div className={`h-px my-2 ${isDark ? "bg-gray-800" : "bg-gray-200"}`} />
                        
                        <Link href={`/profile/${currentUser?.username}`} onClick={() => setMobileMenuOpen(false)}>
                          <Button variant="ghost" className={`w-full justify-start rounded-xl ${isDark ? "text-gray-300 hover:bg-white/10" : "text-gray-700 hover:bg-gray-100"}`}>
                            <User className="mr-2 h-4 w-4" />
                            Profil
                          </Button>
                        </Link>
                        
                        <Link href="/settings" onClick={() => setMobileMenuOpen(false)}>
                          <Button variant="ghost" className={`w-full justify-start rounded-xl ${isDark ? "text-gray-300 hover:bg-white/10" : "text-gray-700 hover:bg-gray-100"}`}>
                            <Settings className="mr-2 h-4 w-4" />
                            Pengaturan
                          </Button>
                        </Link>
                        
                        <div
                          onClick={handleLogout}
                          className={cn(
                            "flex items-center gap-2.5 px-3 py-2 text-sm rounded-xl w-full cursor-pointer transition-colors duration-150",
                            "text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                          )}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              handleLogout()
                            }
                          }}
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Keluar</span>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>

                  {/* Desktop Avatar Dropdown - iPhone style */}
                  <div className="relative hidden lg:block" ref={avatarDropdownRef}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setAvatarDropdownOpen(!avatarDropdownOpen)}
                      className={cn(
                        "relative h-9 w-9 rounded-xl flex items-center justify-center transition-colors duration-200 focus:outline-none",
                        isDark ? "hover:bg-white/10" : "hover:bg-gray-100"
                      )}
                    >
                      <Avatar className="h-8 w-8 ring-2 ring-offset-0 ring-orange-500/50">
                        <AvatarImage
                          src={getAvatarUrl(currentUser.avatar)}
                          alt={currentUser.username}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-500 text-white text-xs">
                          {currentUser.username?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </motion.button>

                    <AnimatePresence>
                      {avatarDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -8, scale: 0.95 }}
                          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                          className={`absolute right-0 mt-2 w-56 rounded-2xl shadow-xl z-50 overflow-hidden ${
                            isDark ? "bg-gray-900 border border-gray-800" : "bg-white border border-gray-100"
                          }`}
                        >
                          <div className={`px-3 py-3 border-b ${isDark ? "border-gray-800" : "border-gray-100"}`}>
                            <div className="flex items-center gap-2">
                              <p className={`text-sm font-semibold leading-none ${isDark ? "text-white" : "text-gray-900"}`}>
                                {currentUser.username}
                              </p>
                              {currentUser.verified_badge === 1 && <VerifiedBadge size="sm" />}
                            </div>
                            <p className={`text-xs mt-1.5 truncate ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                              {currentUser.email}
                            </p>
                          </div>

                          <div className="p-1.5">
                            <Link
                              href={`/profile/${currentUser.username}`}
                              onClick={() => setAvatarDropdownOpen(false)}
                              className={`flex items-center gap-2.5 px-2.5 py-2 text-sm rounded-xl transition-colors duration-150 ${
                                isDark ? "hover:bg-white/10 text-gray-300" : "hover:bg-gray-100 text-gray-700"
                              }`}
                            >
                              <User className="h-4 w-4" />
                              <span>Profil</span>
                            </Link>

                            <Link
                              href="/settings"
                              onClick={() => setAvatarDropdownOpen(false)}
                              className={`flex items-center gap-2.5 px-2.5 py-2 text-sm rounded-xl transition-colors duration-150 ${
                                isDark ? "hover:bg-white/10 text-gray-300" : "hover:bg-gray-100 text-gray-700"
                              }`}
                            >
                              <Settings className="h-4 w-4" />
                              <span>Pengaturan</span>
                            </Link>

                            <div className={`my-1 h-px ${isDark ? "bg-gray-800" : "bg-gray-200"}`} />

                            <div
                              onClick={() => {
                                setAvatarDropdownOpen(false)
                                handleLogout()
                              }}
                              className="flex items-center gap-2.5 px-2.5 py-2 text-sm rounded-xl w-full cursor-pointer text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors duration-150"
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault()
                                  setAvatarDropdownOpen(false)
                                  handleLogout()
                                }
                              }}
                            >
                              <LogOut className="h-4 w-4" />
                              <span>Keluar</span>
                            </div>
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
                        "rounded-xl text-sm",
                        isDark ? "text-white hover:bg-white/10" : "text-gray-700 hover:bg-gray-100"
                      )}
                    >
                      Masuk
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button 
                      variant="default"
                      size="sm" 
                      className="rounded-xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-md text-sm"
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
      <div className="h-20" />
    </>
  )
}