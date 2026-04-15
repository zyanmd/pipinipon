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

  const isAdmin = user?.role === "admin"

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
    if (!user) return
    
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
  }, [user])

  useEffect(() => {
    if (user) {
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
  }, [fetchNotifications, user])

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
    router.push("/login")
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
      {/* Header container dengan efek sticky dan iPhone mode */}
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
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="font-bold text-lg gradient-text hidden sm:inline-block">
                Pipinipon
              </span>
            </Link>

            {/* Navigation - Desktop */}
            {user && (
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
              
              {user && (
                <>
                  {/* Notification Bell */}
                  <div className="relative" ref={popupRef}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "relative h-10 w-10 transition-all duration-200",
                        isIphoneMode ? "rounded-xl" : "rounded-md",
                        "hover:bg-muted/50"
                      )}
                      onClick={() => setShowNotificationPopup(!showNotificationPopup)}
                    >
                      <Bell className="h-5 w-5" />
                      {totalUnread > 0 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs flex items-center justify-center shadow-lg"
                        >
                          {totalUnread > 9 ? "9+" : totalUnread}
                        </motion.span>
                      )}
                    </Button>

                    <AnimatePresence>
                      {showNotificationPopup && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute right-0 mt-2 w-[calc(100vw-2rem)] max-w-sm sm:w-96 bg-popover rounded-2xl shadow-2xl border border-border/50 z-50 overflow-hidden"
                        >
                          <div className="p-3 border-b bg-muted/30 flex items-center justify-between">
                            <h3 className="font-semibold text-sm">Notifikasi</h3>
                            {totalUnread > 0 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs gap-1 rounded-xl"
                                onClick={handleMarkAllRead}
                              >
                                <CheckCheck className="h-3 w-3" />
                                Tandai semua
                              </Button>
                            )}
                          </div>

                          <div className="flex border-b">
                            <button
                              className={cn(
                                "flex-1 px-3 py-2.5 text-xs sm:text-sm font-medium transition-all duration-200",
                                activeTab === "mentions"
                                  ? "text-japanese-500 border-b-2 border-japanese-500"
                                  : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                              )}
                              onClick={() => setActiveTab("mentions")}
                            >
                              <div className="flex items-center justify-center gap-1.5">
                                <AtSign className="h-3.5 w-3.5" />
                                <span>Mentions</span>
                                {mentionUnread > 0 && (
                                  <span className="px-1.5 py-0.5 text-xs rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-white">
                                    {mentionUnread}
                                  </span>
                                )}
                              </div>
                            </button>
                            <button
                              className={cn(
                                "flex-1 px-3 py-2.5 text-xs sm:text-sm font-medium transition-all duration-200",
                                activeTab === "replies"
                                  ? "text-japanese-500 border-b-2 border-japanese-500"
                                  : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                              )}
                              onClick={() => setActiveTab("replies")}
                            >
                              <div className="flex items-center justify-center gap-1.5">
                                <MessageSquareReply className="h-3.5 w-3.5" />
                                <span>Balasan</span>
                                {replyUnread > 0 && (
                                  <span className="px-1.5 py-0.5 text-xs rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-white">
                                    {replyUnread}
                                  </span>
                                )}
                              </div>
                            </button>
                          </div>

                          <div className="max-h-80 overflow-y-auto">
                            {fetchError && (
                              <div className="p-8 text-center text-muted-foreground">
                                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">Gagal memuat notifikasi</p>
                                <Button 
                                  variant="link" 
                                  size="sm" 
                                  className="mt-2"
                                  onClick={() => fetchNotifications()}
                                >
                                  Coba lagi
                                </Button>
                              </div>
                            )}
                            
                            {!fetchError && activeTab === "mentions" && (
                              <>
                                {recentMentions.length === 0 ? (
                                  <div className="p-8 text-center text-muted-foreground">
                                    <AtSign className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">Tidak ada mention baru</p>
                                  </div>
                                ) : (
                                  <div className="divide-y divide-border/50">
                                    {recentMentions.map((mention) => (
                                      <div
                                        key={mention.id}
                                        className="group p-3 hover:bg-muted/30 transition-all duration-200 cursor-pointer"
                                        onClick={() => {
                                          router.push("/chat")
                                          setShowNotificationPopup(false)
                                        }}
                                      >
                                        <div className="flex items-start gap-3">
                                          <Avatar className="h-8 w-8 ring-2 ring-border/50 flex-shrink-0">
                                            <AvatarFallback className="bg-gradient-to-br from-japanese-500 to-japanese-600 text-white text-xs">
                                              {mention.mentioned_by?.charAt(0).toUpperCase() || "?"}
                                            </AvatarFallback>
                                          </Avatar>
                                          <div className="flex-1 min-w-0">
                                            <p className="text-xs sm:text-sm">
                                              <span className="font-medium">{mention.mentioned_by}</span>{" "}
                                              <span className="text-muted-foreground">mentions you</span>
                                            </p>
                                            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                                              {mention.message}
                                            </p>
                                            <p className="text-xs text-muted-foreground/70 mt-0.5">
                                              {new Date(mention.created_at).toLocaleString('id-ID', {
                                                day: 'numeric',
                                                month: 'short',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                              })}
                                            </p>
                                          </div>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 flex-shrink-0"
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              handleMarkMentionAsRead(mention.id, e)
                                            }}
                                          >
                                            <CheckCheck className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </>
                            )}

                            {!fetchError && activeTab === "replies" && (
                              <>
                                {recentReplies.length === 0 ? (
                                  <div className="p-8 text-center text-muted-foreground">
                                    <MessageSquareReply className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">Tidak ada balasan baru</p>
                                  </div>
                                ) : (
                                  <div className="divide-y divide-border/50">
                                    {recentReplies.map((reply) => (
                                      <div
                                        key={reply.id}
                                        className="group p-3 hover:bg-muted/30 transition-all duration-200 cursor-pointer"
                                        onClick={() => {
                                          router.push("/chat")
                                          setShowNotificationPopup(false)
                                        }}
                                      >
                                        <div className="flex items-start gap-3">
                                          <Avatar className="h-8 w-8 ring-2 ring-border/50 flex-shrink-0">
                                            <AvatarFallback className="bg-gradient-to-br from-japanese-500 to-japanese-600 text-white text-xs">
                                              {reply.replied_by?.charAt(0).toUpperCase() || "?"}
                                            </AvatarFallback>
                                          </Avatar>
                                          <div className="flex-1 min-w-0">
                                            <p className="text-xs sm:text-sm">
                                              <span className="font-medium">{reply.replied_by}</span>{" "}
                                              <span className="text-muted-foreground">membalas pesanmu</span>
                                            </p>
                                            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                                              {reply.reply_message}
                                            </p>
                                            <p className="text-xs text-muted-foreground/70 mt-0.5">
                                              {new Date(reply.created_at).toLocaleString('id-ID', {
                                                day: 'numeric',
                                                month: 'short',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                              })}
                                            </p>
                                          </div>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 flex-shrink-0"
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              handleMarkReplyAsRead(reply.id, e)
                                            }}
                                          >
                                            <CheckCheck className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </>
                            )}
                          </div>

                          {(recentMentions.length > 0 || recentReplies.length > 0) && (
                            <div className="p-2 border-t bg-muted/30">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full text-xs rounded-xl"
                                onClick={handleViewAll}
                              >
                                Lihat semua di Chat
                              </Button>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

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
                      <SheetHeader className="p-5 border-b">
                        <div className="flex items-center justify-between">
                          <SheetTitle className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                              <span className="text-white font-bold text-xs">P</span>
                            </div>
                            <span>Menu</span>
                          </SheetTitle>
                          <SheetClose asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                              <X className="h-4 w-4" />
                            </Button>
                          </SheetClose>
                        </div>
                      </SheetHeader>
                      
                      <div className="flex flex-col p-4 space-y-1 overflow-y-auto">
                        {/* User Info Section */}
                        <div className="flex items-center gap-3 p-4 mb-3 rounded-xl bg-muted/30">
                          <Avatar className="h-12 w-12 ring-2 ring-border/50 flex-shrink-0">
                            <AvatarImage src={getAvatarUrl(user.avatar)} alt={user.username} />
                            <AvatarFallback className="bg-gradient-to-br from-japanese-500 to-japanese-600 text-white">
                              {user.username?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="font-semibold text-sm truncate">{user.username}</p>
                              {(user as any).verified_badge === 1 && <VerifiedBadge size="sm" />}
                            </div>
                            <p className="text-xs text-muted-foreground truncate mt-0.5">{user.email}</p>
                          </div>
                        </div>
                        
                        {/* Navigation Links */}
                        {navItems.map((item) => {
                          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
                          return (
                            <SheetClose asChild key={item.href}>
                              <Link href={item.href}>
                                <Button
                                  variant={isActive ? "japanese" : "ghost"}
                                  className={cn(
                                    "w-full justify-start gap-3 rounded-xl h-11",
                                    isActive && "shadow-md"
                                  )}
                                >
                                  <item.icon className="h-5 w-5 flex-shrink-0" />
                                  {item.label}
                                </Button>
                              </Link>
                            </SheetClose>
                          )
                        })}
                        
                        {/* Admin Link */}
                        {isAdmin && (
                          <SheetClose asChild>
                            <Link href="/admin">
                              <Button
                                variant={pathname === "/admin" ? "japanese" : "ghost"}
                                className={cn(
                                  "w-full justify-start gap-3 rounded-xl h-11",
                                  pathname === "/admin" && "shadow-md"
                                )}
                              >
                                <Shield className="h-5 w-5 flex-shrink-0" />
                                Admin
                              </Button>
                            </Link>
                          </SheetClose>
                        )}
                        
                        <div className="h-px bg-border my-2" />
                        
                        {/* Settings and Profile */}
                        <SheetClose asChild>
                          <Link href={`/profile/${user.username}`}>
                            <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl h-11">
                              <User className="h-5 w-5 flex-shrink-0" />
                              Profil
                            </Button>
                          </Link>
                        </SheetClose>
                        
                        <SheetClose asChild>
                          <Link href="/settings">
                            <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl h-11">
                              <Settings className="h-5 w-5 flex-shrink-0" />
                              Pengaturan
                            </Button>
                          </Link>
                        </SheetClose>
                        
                        <div className="h-px bg-border my-2" />
                        
                        {/* Logout Button */}
                        <Button
                          variant="ghost"
                          className="w-full justify-start gap-3 rounded-xl h-11 text-red-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                          onClick={handleLogout}
                        >
                          <LogOut className="h-5 w-5 flex-shrink-0" />
                          Keluar
                        </Button>
                      </div>
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
                          src={getAvatarUrl(user.avatar)}
                          alt={user.username}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-japanese-500 to-japanese-600 text-white">
                          {user.username?.charAt(0).toUpperCase()}
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
                              <p className="text-sm font-semibold leading-none">{user.username}</p>
                              {(user as any).verified_badge === 1 && <VerifiedBadge size="sm" />}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1.5 truncate">
                              {user.email}
                            </p>
                          </div>

                          <div className="p-1.5">
                            <Link
                              href={`/profile/${user.username}`}
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
              
              {!user && !isLoading && (
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

      {/* Spacer untuk konten agar tidak tertutup header fixed */}
      <div className="h-16" />
    </>
  )
}