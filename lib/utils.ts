import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ==================== TIME HELPER ====================

// Konversi UTC ke WIB (UTC+7)
export function toLocalTime(dateString: string): Date {
  const date = new Date(dateString)
  // Tambahkan 7 jam untuk WIB
  return new Date(date.getTime() + (7 * 60 * 60 * 1000))
}

// Format tanggal ke waktu lokal Indonesia
export function formatDate(date: string) {
  const localDate = toLocalTime(date)
  return localDate.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

// Format waktu relatif dengan waktu lokal
export function formatRelativeTime(dateString: string) {
  const date = toLocalTime(dateString)
  const now = new Date()
  
  const diffMs = now.getTime() - date.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffSecs < 10) {
    return "Baru saja"
  }
  
  if (diffSecs < 60) {
    return `${diffSecs} detik lalu`
  }
  
  if (diffMins < 60) {
    return `${diffMins} menit lalu`
  }
  
  if (diffHours < 24) {
    return `${diffHours} jam lalu`
  }
  
  if (diffDays < 7) {
    return `${diffDays} hari lalu`
  }
  
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Format waktu lengkap lokal
export function formatFullDateTime(dateString: string) {
  const localDate = toLocalTime(dateString)
  return localDate.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// Format waktu untuk chat (lokal)
export function formatChatTime(dateString: string) {
  const localDate = toLocalTime(dateString)
  return localDate.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Format waktu lengkap dengan hari
export function formatFullLocalDate(dateString: string) {
  const localDate = toLocalTime(dateString)
  return localDate.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Format waktu ago (alternatif)
export function formatTimeAgo(date: string) {
  const localDate = toLocalTime(date)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - localDate.getTime()) / 1000)
  
  let interval = seconds / 31536000
  if (interval > 1) return Math.floor(interval) + ' tahun lalu'
  
  interval = seconds / 2592000
  if (interval > 1) return Math.floor(interval) + ' bulan lalu'
  
  interval = seconds / 86400
  if (interval > 1) return Math.floor(interval) + ' hari lalu'
  
  interval = seconds / 3600
  if (interval > 1) return Math.floor(interval) + ' jam lalu'
  
  interval = seconds / 60
  if (interval > 1) return Math.floor(interval) + ' menit lalu'
  
  if (seconds < 10) return 'Baru saja'
  return Math.floor(seconds) + ' detik lalu'
}

// ==================== URL / IMAGE HELPER ====================

// Get base URL untuk uploads (backend)
export function getBaseUrl(): string {
  // Gunakan URL backend, bukan frontend
  return process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'
}

// Get full URL untuk gambar
export function getImageUrl(path: string | null | undefined): string | undefined {
  if (!path) {
    return undefined
  }
  
  // Jika sudah URL lengkap, return langsung
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  
  // Jika default avatar/cover, return undefined (akan ditampilkan fallback)
  if (path === 'default-avatar.jpg' || path === 'default-cover.jpg') {
    return undefined
  }
  
  // Build URL untuk uploads di BACKEND (bukan frontend)
  const baseUrl = getBaseUrl()
  const imageUrl = `${baseUrl}/uploads/${path}`
  
  console.log("Generated image URL:", imageUrl) // Debugging
  
  return imageUrl
}

// Get URL untuk avatar (dengan fallback ke default)
export function getAvatarUrl(avatar: string | null | undefined): string {
  const imageUrl = getImageUrl(avatar)
  if (imageUrl) {
    return imageUrl
  }
  return '/default-avatar.png'
}

// Get URL untuk cover photo (dengan fallback ke default)
export function getCoverUrl(cover: string | null | undefined): string {
  const imageUrl = getImageUrl(cover)
  if (imageUrl) {
    return imageUrl
  }
  return '/default-cover.png'
}

// ==================== JLPT HELPER ====================

export function getJLPTColor(level: string) {
  const colors: Record<string, string> = {
    N5: 'bg-green-500',
    N4: 'bg-blue-500',
    N3: 'bg-yellow-500',
    N2: 'bg-orange-500',
    N1: 'bg-red-500'
  }
  return colors[level] || 'bg-gray-500'
}

export function getJLPTBadgeVariant(level: string) {
  const variants: Record<string, string> = {
    N5: 'success',
    N4: 'info',
    N3: 'warning',
    N2: 'destructive',
    N1: 'destructive'
  }
  return variants[level] || 'default'
}

export function getJLPTLabel(level: string) {
  const labels: Record<string, string> = {
    N5: 'Pemula',
    N4: 'Dasar',
    N3: 'Menengah',
    N2: 'Mahir',
    N1: 'Lanjutan'
  }
  return labels[level] || level
}

// ==================== TEXT HELPER ====================

export function truncateText(text: string, maxLength: number) {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function capitalize(str: string) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export function capitalizeWords(str: string) {
  if (!str) return ''
  return str.split(' ').map(word => capitalize(word)).join(' ')
}

export function generateSlug(text: string) {
  if (!text) return ''
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim()
}

// Ekstrak mentions dari text
export function extractMentions(text: string): string[] {
  const mentionRegex = /@(\w+)/g
  const mentions = text.match(mentionRegex)
  if (!mentions) return []
  return mentions.map(m => m.slice(1))
}

// ==================== NUMBER HELPER ====================

export function formatNumber(num: number): string {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B'
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

// ==================== COLOR HELPER ====================

export function stringToColor(str: string) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = hash % 360
  return `hsl(${hue}, 70%, 55%)`
}

// ==================== DEBOUNCE ====================

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), delay)
  }
}

// ==================== VALIDATION ====================

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidUsername(username: string): boolean {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
  return usernameRegex.test(username)
}

export function isValidPassword(password: string): boolean {
  return password.length >= 6
}