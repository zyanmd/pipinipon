"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { chatAPI } from "@/lib/api"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface MentionSuggestionsProps {
  query: string
  onSelect: (username: string) => void
  onClose: () => void
}

export function MentionSuggestions({ query, onSelect, onClose }: MentionSuggestionsProps) {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => {
    const fetchUsers = async () => {
      if (query.length < 1) {
        setUsers([])
        return
      }

      setLoading(true)
      try {
        const response = await chatAPI.searchUsers(query)
        setUsers(response.data.data.users || [])
        setSelectedIndex(0)
      } catch (error) {
        console.error("Error fetching users:", error)
      } finally {
        setLoading(false)
      }
    }

    const debounce = setTimeout(fetchUsers, 300)
    return () => clearTimeout(debounce)
  }, [query])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedIndex(prev => Math.min(prev + 1, users.length - 1))
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedIndex(prev => Math.max(prev - 1, 0))
      } else if (e.key === "Enter" && users[selectedIndex]) {
        e.preventDefault()
        onSelect(users[selectedIndex].username)
      } else if (e.key === "Escape") {
        onClose()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [users, selectedIndex, onSelect, onClose])

  if (loading) {
    return (
      <div className="bg-popover rounded-lg shadow-lg border p-2">
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      </div>
    )
  }

  if (users.length === 0) {
    return null
  }

  return (
    <div className="bg-popover rounded-lg shadow-lg border overflow-hidden">
      <div className="p-2 border-b">
        <p className="text-xs text-muted-foreground">Mention pengguna</p>
      </div>
      <div className="max-h-64 overflow-y-auto">
        {users.map((user, index) => (
          <button
            key={user.id}
            className={cn(
              "w-full flex items-center gap-3 p-2 hover:bg-muted transition-colors text-left",
              index === selectedIndex && "bg-muted"
            )}
            onClick={() => onSelect(user.username)}
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar ? `/uploads/${user.avatar}` : undefined} />
              <AvatarFallback className="bg-japanese-500 text-white text-xs">
                {user.username?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{user.username}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}