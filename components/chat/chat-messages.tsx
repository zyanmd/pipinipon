"use client"

import { useEffect, useRef, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn, formatRelativeTime, formatFullDateTime } from "@/lib/utils"
import { getAvatarUrl } from "@/lib/image-helper"
import { motion } from "framer-motion"
import { Reply, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ChatMessagesProps {
  messages: any[]
  currentUserId?: number
  onReply?: (messageId: number) => void
}

export function ChatMessages({ messages, currentUserId, onReply }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, mounted])

  if (!mounted) {
    return null
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground py-12">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <MessageCircle className="w-8 h-8" />
        </div>
        <p className="text-lg font-medium">Belum ada pesan</p>
        <p className="text-sm">Jadilah yang pertama untuk mengirim pesan!</p>
      </div>
    )
  }

  // Helper untuk mendapatkan avatar URL
  const getMessageAvatarUrl = (message: any) => {
    // Jika sudah ada avatarUrl dari parent component
    if (message.avatarUrl) {
      return message.avatarUrl
    }
    // Jika ada avatar langsung
    if (message.avatar) {
      return getAvatarUrl(message.avatar)
    }
    return undefined
  }

  return (
    <div className="space-y-4">
      {messages.map((message, index) => {
        const isOwnMessage = message.user_id === currentUserId
        const hasMentions = message.mentions && message.mentions.length > 0
        const timeAgo = formatRelativeTime(message.created_at)
        const fullTime = formatFullDateTime(message.created_at)
        const avatarUrl = getMessageAvatarUrl(message)

        return (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(index * 0.02, 0.5) }}
            className={cn("flex gap-3", isOwnMessage && "flex-row-reverse")}
          >
            {/* Avatar */}
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarImage 
                src={avatarUrl} 
                alt={message.username}
              />
              <AvatarFallback className="bg-gradient-to-r from-japanese-500 to-japanese-600 text-white">
                {message.username?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* Message Content */}
            <div className={cn("flex-1 max-w-[70%]", isOwnMessage && "items-end")}>
              {/* Sender Info */}
              <div className={cn("flex items-center gap-2 mb-1 flex-wrap", isOwnMessage && "justify-end")}>
                <span className="text-sm font-medium">{message.username}</span>
                <time 
                  className="text-xs text-muted-foreground" 
                  dateTime={message.created_at}
                  title={fullTime}
                >
                  {timeAgo}
                </time>
                {message.is_edited && (
                  <span className="text-xs text-muted-foreground">(diedit)</span>
                )}
              </div>

              {/* Reply To */}
              {message.reply_to && (
                <div className={cn(
                  "mb-2 p-2 rounded-lg bg-muted/50 text-sm",
                  isOwnMessage ? "text-right" : "text-left"
                )}>
                  <span className="text-xs text-muted-foreground">Membalas:</span>
                  <p className="text-sm line-clamp-2">@{message.reply_to.username}: {message.reply_to.message}</p>
                </div>
              )}

              {/* Message Bubble */}
              <div
                className={cn(
                  "relative rounded-lg p-3",
                  isOwnMessage
                    ? "bg-gradient-to-r from-japanese-500 to-japanese-600 text-white"
                    : "bg-muted",
                  hasMentions && !isOwnMessage && "border-l-4 border-japanese-500"
                )}
              >
                <p className="whitespace-pre-wrap break-words">{message.message}</p>

                {/* Mentions Badges */}
                {hasMentions && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {message.mentions.map((mention: any) => (
                      <span
                        key={mention.id}
                        className="text-xs px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/10"
                      >
                        @{mention.username}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              {onReply && (
                <div className={cn("mt-1", isOwnMessage ? "text-right" : "text-left")}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => onReply(message.id)}
                  >
                    <Reply className="h-3 w-3 mr-1" />
                    Balas
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )
      })}
      <div ref={messagesEndRef} />
    </div>
  )
}