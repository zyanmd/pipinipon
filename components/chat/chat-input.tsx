"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, X, AtSign, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { chatAPI } from "@/lib/api"
import { MentionSuggestions } from "./mention-suggestions"

interface ChatInputProps {
  onSendMessage: (message: string, replyToId?: number) => Promise<void>
  disabled?: boolean
  replyTo?: {
    id: number
    username: string
    message: string
  } | null
  onCancelReply?: () => void
}

export function ChatInput({ onSendMessage, disabled, replyTo, onCancelReply }: ChatInputProps) {
  const [message, setMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [showMentions, setShowMentions] = useState(false)
  const [mentionQuery, setMentionQuery] = useState("")
  const [mentionPosition, setMentionPosition] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSend = async () => {
    if (!message.trim() || isSending || disabled) return

    setIsSending(true)
    try {
      await onSendMessage(message, replyTo?.id)
      setMessage("")
      if (onCancelReply) onCancelReply()
      inputRef.current?.focus()
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setMessage(value)

    // Check for @ mention
    const cursorPosition = e.target.selectionStart || 0
    const textBeforeCursor = value.slice(0, cursorPosition)
    const lastAtIndex = textBeforeCursor.lastIndexOf("@")

    if (lastAtIndex !== -1) {
      const query = textBeforeCursor.slice(lastAtIndex + 1)
      if (query.length <= 20 && !query.includes(" ")) {
        setMentionQuery(query)
        setMentionPosition(lastAtIndex)
        setShowMentions(true)
        return
      }
    }
    setShowMentions(false)
  }

  const handleSelectMention = (username: string) => {
    const beforeMention = message.slice(0, mentionPosition)
    const afterMention = message.slice(mentionPosition + mentionQuery.length + 1)
    const newMessage = `${beforeMention}@${username} ${afterMention}`
    setMessage(newMessage)
    setShowMentions(false)
    inputRef.current?.focus()
  }

  return (
    <div className="border-t p-4 bg-background">
      {/* Reply Preview */}
      {replyTo && (
        <div className="mb-3 p-2 rounded-lg bg-muted/50 flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Membalas @{replyTo.username}</p>
            <p className="text-sm line-clamp-1">{replyTo.message}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onCancelReply}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Input Area */}
      <div className="relative flex gap-2">
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ketik pesan... Gunakan @ untuk mention"
            disabled={disabled || isSending}
            className="pr-10"
          />
          <AtSign className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>

        <Button
          onClick={handleSend}
          disabled={!message.trim() || disabled || isSending}
          variant="japanese"
          size="icon"
        >
          {isSending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>

        {/* Mention Suggestions */}
        {showMentions && (
          <div className="absolute bottom-full left-0 mb-2 w-64">
            <MentionSuggestions
              query={mentionQuery}
              onSelect={handleSelectMention}
              onClose={() => setShowMentions(false)}
            />
          </div>
        )}
      </div>
    </div>
  )
}