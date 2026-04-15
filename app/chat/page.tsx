"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useInView } from "react-intersection-observer"
import { chatAPI } from "@/lib/api"
import { ChatMessages } from "@/components/chat/chat-messages"
import { ChatInput } from "@/components/chat/chat-input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Bell, MessageCircle, Users, Loader2, AlertCircle } from "lucide-react"
import { motion } from "framer-motion"
import { useAuth } from "@/lib/hooks/use-auth"
import { useToast } from "@/components/ui/use-toast"
import { getAvatarUrl } from "@/lib/image-helper"

export default function ChatPage() {
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

  // Proses messages untuk menambahkan avatar URL yang benar
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

  // Scroll ke bawah saat load pertama atau ada pesan baru (jika user di bawah)
  useEffect(() => {
    if (!isFirstLoad.current && isScrolledToBottom) {
      scrollToBottom()
    }
    isFirstLoad.current = false
  }, [messages, isScrolledToBottom, scrollToBottom])

  // Fetch messages
  const fetchMessages = useCallback(async (pageNum: number, isLoadMore = false) => {
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
        // Load more: tambahkan pesan lama di atas
        setMessages(prev => [...processedMessages.reverse(), ...prev])
        // Simpan posisi scroll
        const container = containerRef.current
        if (container) {
          const oldScrollHeight = container.scrollHeight
          setTimeout(() => {
            const newScrollHeight = container.scrollHeight
            container.scrollTop = newScrollHeight - oldScrollHeight
          }, 50)
        }
      } else {
        // First load: urutkan dari lama ke baru
        const sortedMessages = processedMessages.reverse()
        setMessages(sortedMessages)
        // Scroll ke bawah setelah load pertama
        setTimeout(() => scrollToBottom("auto"), 100)
      }

      setUnreadCount(response.data.data.unread_count || 0)
      setHasMore(pageNum < pagination.pages)
    } catch (error: any) {
      console.error("Error fetching messages:", error)
      setError(error.response?.data?.error || "Gagal memuat pesan")
      toast({
        title: "Error",
        description: "Gagal memuat pesan chat",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [scrollToBottom, toast, processMessages])

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
    try {
      const response = await chatAPI.getNotificationSummary()
      if (response.data.success) {
        setMentionUnread(response.data.data.unread_mentions || 0)
      }
    } catch (error) {
      console.error("Error fetching notification summary:", error)
    }
  }, [])

  // Polling untuk pesan baru
  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
    }

    pollingIntervalRef.current = setInterval(async () => {
      if (!pollingEnabled) return
      
      try {
        const response = await chatAPI.getMessages({ page: 1, per_page: 30 })
        if (response.data.success) {
          const newMessages = response.data.data.messages || []
          const processedMessages = processMessages(newMessages)
          const latestMessages = processedMessages.reverse()
          
          setMessages(prev => {
            // Cek jika ada pesan baru
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
        // Jangan stop polling, tetap coba lagi nanti
      }
    }, 10000) // Polling setiap 10 detik

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [pollingEnabled, fetchNotificationSummary, processMessages])

  // Initial load
  useEffect(() => {
    const loadInitialData = async () => {
      await Promise.all([
        fetchMessages(1, false),
        fetchChatInfo(),
        fetchNotificationSummary()
      ])
    }
    
    loadInitialData()
    
    // Start polling
    const cleanupPolling = startPolling()

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
      cleanupPolling()
    }
  }, [fetchMessages, fetchChatInfo, fetchNotificationSummary, startPolling])

  // Load more saat scroll ke atas
  useEffect(() => {
    if (inView && !loading && !loadingMore && hasMore && messages.length > 0) {
      const nextPage = page + 1
      setPage(nextPage)
      fetchMessages(nextPage, true)
    }
  }, [inView, loading, loadingMore, hasMore, page, fetchMessages, messages.length])

  // Send message
  const handleSendMessage = async (message: string, replyToId?: number) => {
    if (!message.trim() || sending) return

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
        
        // Tambahkan pesan baru ke akhir array
        setMessages(prev => [...prev, processedMessage])
        setReplyTo(null)
        await fetchNotificationSummary()
        
        // Scroll ke bawah
        setTimeout(() => scrollToBottom("smooth"), 100)
        
        toast({
          title: "Pesan terkirim",
          description: "Pesan Anda telah berhasil dikirim",
        })
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

  // Mark all as read
  const handleMarkAllRead = async () => {
    try {
      await chatAPI.markAllAsRead()
      setUnreadCount(0)
      setMentionUnread(0)
      toast({
        title: "Berhasil",
        description: "Semua notifikasi telah ditandai dibaca",
      })
    } catch (error) {
      console.error("Error marking all as read:", error)
      toast({
        title: "Gagal",
        description: "Gagal menandai notifikasi",
        variant: "destructive",
      })
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

  // Toggle polling
  const togglePolling = () => {
    setPollingEnabled(prev => !prev)
    toast({
      title: pollingEnabled ? "Polling dimatikan" : "Polling diaktifkan",
      description: pollingEnabled ? "Pesan baru tidak akan otomatis muncul" : "Pesan baru akan otomatis muncul",
    })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:w-80"
        >
          <Card className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-japanese-500 to-japanese-600 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-semibold">{chatInfo?.name || "Global Chat"}</h2>
                <p className="text-xs text-muted-foreground">
                  {chatInfo?.total_users || 0} anggota aktif
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  <span className="text-sm">Notifikasi</span>
                </div>
                {mentionUnread > 0 && (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-red-500 text-white">
                    {mentionUnread}
                  </span>
                )}
              </div>

              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllRead}
                  className="w-full"
                >
                  Tandai semua sudah dibaca ({unreadCount})
                </Button>
              )}

              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>Gunakan @username untuk mention</span>
                </div>
                <button
                  onClick={togglePolling}
                  className="mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {pollingEnabled ? "🔔 Auto-refresh ON" : "🔕 Auto-refresh OFF"}
                </button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Chat Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1"
        >
          <Card className="flex flex-col h-[calc(100vh-12rem)]">
            {/* Messages Container */}
            <div 
              ref={containerRef}
              className="flex-1 overflow-y-auto p-4"
            >
              {/* Error state */}
              {error && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
                  <p className="text-muted-foreground mb-4">{error}</p>
                  <Button 
                    variant="outline" 
                    onClick={() => fetchMessages(1, false)}
                  >
                    Coba lagi
                  </Button>
                </div>
              )}

              {/* Load more trigger di atas */}
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

              {/* Pesan ditampilkan dari lama ke baru */}
              {!error && (
                <div className="space-y-4">
                  <ChatMessages
                    messages={messages}
                    currentUserId={user?.id}
                    onReply={handleReply}
                  />
                </div>
              )}

              {/* Anchor untuk scroll ke bawah */}
              <div ref={messagesEndRef} />

              {/* Loading skeleton */}
              {loading && messages.length === 0 && !error && (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
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
          </Card>
        </motion.div>
      </div>
    </div>
  )
}