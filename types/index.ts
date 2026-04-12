export interface User {
  id: number
  username: string
  email: string
  slug: string
  bio?: string
  website?: string
  location?: string
  avatar: string
  cover_photo: string
  role: 'user' | 'admin'
  xp: number
  rank: string
  streak: number
  is_verified: boolean
  verified_badge: boolean
  created_at: string
  updated_at: string
  last_activity: string
}

export interface Vocab {
  id: number
  kanji: string
  hiragana: string
  romaji?: string
  arti: string
  contoh_kalimat?: string
  contoh_arti?: string
  kategori_id?: number
  jlpt_level: string
  slug: string
  created_at: string
  updated_at: string
  mastered?: boolean
  correct_count?: number
  wrong_count?: number
  has_studied?: boolean
}

export interface Grammar {
  id: number
  title: string
  slug: string
  pattern: string
  meaning: string
  explanation?: string
  level: string
  category?: string
  example_sentences?: any
  conversations?: any
  thumbnail?: string
  thumbnail_alt?: string
  notes?: string
  related_grammars?: any
  view_count: number
  is_published: number
  created_by?: number
  created_at: string
  updated_at: string
}

export interface StudyProgress {
  id: number
  user_id: number
  vocab_id: number
  correct_count: number
  wrong_count: number
  mastered: number
  last_studied: string
  created_at: string
  updated_at: string
}

export interface ChatMessage {
  id: number
  user_id: number
  username: string
  avatar?: string
  message: string
  mentions: Array<{ id: number; username: string; avatar?: string }>
  reply_to?: {
    id: number
    message: string
    username: string
  }
  is_edited: boolean
  is_deleted: boolean
  created_at: string
  updated_at?: string
}

export interface Category {
  id: number
  name: string
  slug: string
  created_at: string
  vocab_count?: number
}

export interface PaginatedResponse<T> {
  success: boolean
  data: {
    items?: T[]
    data?: T[]
    vocab?: T[]
    grammar?: T[]
    messages?: T[]
    pagination: {
      total: number
      page: number
      per_page: number
      pages: number
      has_prev: boolean
      has_next: boolean
    }
  }
}