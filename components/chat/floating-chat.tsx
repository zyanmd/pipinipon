"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useInView } from "react-intersection-observer"
import { chatAPI } from "@/lib/api"
import { ChatMessages } from "@/components/chat/chat-messages"
import { ChatInput } from "@/components/chat/chat-input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MessageCircle, X, Minimize2, Maximize2, Users, Loader2, AlertCircle, Bell } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/lib/hooks/use-auth"
import { useToast } from "@/components/ui/use-toast"
import { getAvatarUrl } from "@/lib/image-helper"
import { cn } from "@/lib/utils"

interface FloatingChatProps {
  /** Posisi chat di layar */
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  /** Ukuran chat saat minimized */
  size?: 'sm' | 'md' | 'lg'
  /** Warna tema */
  theme?: 'default' | 'dark' | 'light'
  /** Judul chat */
  title?: string
  /** Auto open saat ada notifikasi */
  autoOpenOnNotification?: boolean
}

export function FloatingChat({
  position = 'bottom-right',
  size = 'md',
  theme = 'default',
  title = 'Chat Global',
  autoOpenOnNotification = true
}: FloatingChatProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const [mentionUnread, setMentionUnread] = useState(0)
  const [chatInfo, setChatInfo] = useState<any>(null)
  const [sending, setSending] = useState(false)
  const [replyTo, setReplyTo] = useState<{ id: number; username: string; message: string } | null>(null)
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pollingEnabled, setPollingEnabled] = useState(true)
  
  const { user } = useAuth()
  const { toast } = useToast()
  const { ref: inViewRef, inView } = useInView()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const isFirstLoad = useRef(true)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Posisi berdasarkan props
  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
  }

  // Ukuran berdasarkan props
  const sizeClasses = {
    sm: 'w-80 h-96',
    md: 'w-96 h-[500px]',
    lg: 'w-[450px] h-[600px]',
  }

  // Proses messages untuk menambahkan avatar URL
  const processMessages = useCallback((msgs: any[]) => {
    return msgs.map(msg => ({
      ...msg,
      avatarUrl: getAvatarUrl(msg.avatar)
    }))
  }, [])

  // Cek apakah user di posisi bawah
  const checkIfScrolledToBottom = useCallback(() => {
    const container = containerRef.current
    if (!container) return true
    
    const { scrollTop, scrollHeight, clientHeight } = container
    const isBottom = scrollHeight - scrollTop - clientHeight < 100
    setIsScrolledToBottom(isBottom)
    return isBottom
  }, [])

  // Scroll ke bawah
  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior })
  }, [])

  // Handle scroll event
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('scroll', checkIfScrolledToBottom)
    return () => container.removeEventListener('scroll', checkIfScrolledToBottom)
  }, [checkIfScrolledToBottom])

  // Scroll ke bawah saat load pertama atau ada pesan baru
  useEffect(() => {
    if (!isFirstLoad.current && isScrolledToBottom && isOpen && !isMinimized) {
      scrollToBottom()
    }
    isFirstLoad.current = false
  }, [messages, isScrolledToBottom, scrollToBottom, isOpen, isMinimized])

  // Fetch messages
  const fetchMessages = useCallback(async (pageNum: number, isLoadMore = false) => {
    if (!user) return
    
    try {
      setError(null)
      if (isLoadMore) {
        setLoadingMore(true)
      } else {
        setLoading(true)
      }

      const response = await chatAPI.getMessages({
        page: pageNum,
        per_page: 30,
      })

      const newMessages = response.data.data.messages || []
      const pagination = response.data.data.pagination
      const processedMessages = processMessages(newMessages)
      
      if (isLoadMore) {
        setMessages(prev => [...processedMessages.reverse(), ...prev])
        const container = containerRef.current
        if (container) {
          const oldScrollHeight = container.scrollHeight
          setTimeout(() => {
            const newScrollHeight = container.scrollHeight
            container.scrollTop = newScrollHeight - oldScrollHeight
          }, 50)
        }
      } else {
        const sortedMessages = processedMessages.reverse()
        setMessages(sortedMessages)
        setTimeout(() => scrollToBottom("auto"), 100)
      }

      setUnreadCount(response.data.data.unread_count || 0)
      setHasMore(pageNum < pagination.pages)
    } catch (error: any) {
      console.error("Error fetching messages:", error)
      setError(error.response?.data?.error || "Gagal memuat pesan")
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [user, scrollToBottom, processMessages])

  // Fetch chat info
  const fetchChatInfo = useCallback(async () => {
    try {
      const response = await chatAPI.getInfo()
      setChatInfo(response.data.data)
    } catch (error) {
      console.error("Error fetching chat info:", error)
    }
  }, [])

  // Fetch notification summary
  const fetchNotificationSummary = useCallback(async () => {
    if (!user) return
    
    try {
      const response = await chatAPI.getNotificationSummary()
      if (response.data.success) {
        const newMentionUnread = response.data.data.unread_mentions || 0
        setMentionUnread(newMentionUnread)
        
        // Auto open jika ada notifikasi baru dan fitur diaktifkan
        if (autoOpenOnNotification && newMentionUnread > 0 && !isOpen) {
          setIsOpen(true)
          setIsMinimized(false)
        }
      }
    } catch (error) {
      console.error("Error fetching notification summary:", error)
    }
  }, [user, autoOpenOnNotification, isOpen])

  // Polling untuk pesan baru
  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
    }

    pollingIntervalRef.current = setInterval(async () => {
      if (!pollingEnabled || !user || !isOpen || isMinimized) return
      
      try {
        const response = await chatAPI.getMessages({ page: 1, per_page: 30 })
        if (response.data.success) {
          const newMessages = response.data.data.messages || []
          const processedMessages = processMessages(newMessages)
          const latestMessages = processedMessages.reverse()
          
          setMessages(prev => {
            if (JSON.stringify(prev.slice(-10)) !== JSON.stringify(latestMessages.slice(-10))) {
              return latestMessages
            }
            return prev
          })
          setUnreadCount(response.data.data.unread_count || 0)
          fetchNotificationSummary()
        }
      } catch (error) {
        console.error("Error polling messages:", error)
      }
    }, 15000)

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [pollingEnabled, user, isOpen, isMinimized, processMessages, fetchNotificationSummary])

  // Initial load
  useEffect(() => {
    if (user && isOpen && !isMinimized) {
      const loadInitialData = async () => {
        await Promise.all([
          fetchMessages(1, false),
          fetchChatInfo(),
          fetchNotificationSummary()
        ])
      }
      loadInitialData()
    }
  }, [user, isOpen, isMinimized, fetchMessages, fetchChatInfo, fetchNotificationSummary])

  // Start polling when chat is open
  useEffect(() => {
    if (isOpen && !isMinimized && user) {
      const cleanupPolling = startPolling()
      return cleanupPolling
    }
  }, [isOpen, isMinimized, user, startPolling])

  // Load more saat scroll ke atas
  useEffect(() => {
    if (inView && !loading && !loadingMore && hasMore && messages.length > 0 && isOpen && !isMinimized) {
      const nextPage = page + 1
      setPage(nextPage)
      fetchMessages(nextPage, true)
    }
  }, [inView, loading, loadingMore, hasMore, page, fetchMessages, messages.length, isOpen, isMinimized])

  // Send message
  const handleSendMessage = async (message: string, replyToId?: number) => {
    if (!message.trim() || sending || !user) return

    setSending(true)
    setError(null)
    
    try {
      const response = await chatAPI.sendMessage({ message, reply_to_id: replyToId })
      if (response.data.success) {
        const newMessage = response.data.data.message
        const processedMessage = {
          ...newMessage,
          avatarUrl: getAvatarUrl(newMessage.avatar)
        }
        
        setMessages(prev => [...prev, processedMessage])
        setReplyTo(null)
        await fetchNotificationSummary()
        
        setTimeout(() => scrollToBottom("smooth"), 100)
      }
    } catch (error: any) {
      console.error("Error sending message:", error)
      toast({
        title: "Gagal mengirim pesan",
        description: error.response?.data?.error || "Terjadi kesalahan",
        variant: "destructive",
      })
    } finally {
      setSending(false)
    }
  }

  // Handle reply
  const handleReply = (messageId: number) => {
    const message = messages.find(m => m.id === messageId)
    if (message) {
      setReplyTo({
        id: message.id,
        username: message.username,
        message: message.message.slice(0, 100)
      })
    }
  }

  const totalUnread = mentionUnread + unreadCount

  if (!user) return null

  return (
    <>
      {/* Tombol Floating Chat */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className={cn(
              "fixed z-50 p-4 rounded-full shadow-lg transition-all duration-200",
              positionClasses[position],
              "bg-gradient-to-r from-japanese-500 to-japanese-600 text-white hover:shadow-xl"
            )}
          >
            <MessageCircle className="w-6 h-6" />
            {totalUnread > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                {totalUnread > 9 ? '9+' : totalUnread}
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={cn(
              "fixed z-50 rounded-xl shadow-2xl overflow-hidden bg-background border border-border",
              positionClasses[position],
              sizeClasses[size],
              isMinimized ? "h-14" : sizeClasses[size]
            )}
          >
            {/* Header */}
            <div className={cn(
              "flex items-center justify-between px-4 py-3 bg-gradient-to-r from-japanese-500 to-japanese-600 text-white",
              isMinimized && "cursor-pointer"
            )}>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                <span className="font-medium">{title}</span>
                {totalUnread > 0 && !isMinimized && (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-red-500 text-white">
                    {totalUnread} baru
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1 rounded-lg hover:bg-white/20 transition-colors"
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Content */}
            {!isMinimized && (
              <div className="flex flex-col h-[calc(100%-56px)]">
                {/* Messages Container */}
                <div ref={containerRef} className="flex-1 overflow-y-auto p-4">
                  {/* Error state */}
                  {error && (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
                      <p className="text-muted-foreground mb-4">{error}</p>
                      <Button variant="outline" onClick={() => fetchMessages(1, false)}>
                        Coba lagi
                      </Button>
                    </div>
                  )}

                  {/* Load more trigger */}
                  {!error && hasMore && (
                    <div ref={inViewRef} className="flex justify-center py-2">
                      {loadingMore && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Memuat pesan sebelumnya...
                        </div>
                      )}
                    </div>
                  )}

                  {/* Messages */}
                  {!error && (
                    <ChatMessages
                      messages={messages}
                      currentUserId={user?.id}
                      onReply={handleReply}
                    />
                  )}

                  <div ref={messagesEndRef} />

                  {/* Loading skeleton */}
                  {loading && messages.length === 0 && !error && (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex gap-3">
                          <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
                          <div className="flex-1">
                            <div className="h-4 w-24 bg-muted animate-pulse rounded mb-2" />
                            <div className="h-16 w-full bg-muted animate-pulse rounded" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Input Area */}
                {!error && (
                  <ChatInput
                    onSendMessage={handleSendMessage}
                    disabled={sending}
                    replyTo={replyTo}
                    onCancelReply={() => setReplyTo(null)}
                  />
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}