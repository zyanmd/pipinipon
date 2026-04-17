// app/sitemap.ts
import { MetadataRoute } from 'next'
import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.pipinipon.site/api'
const SITE_URL = 'https://pipinipon.web.id'

export const revalidate = 3600  // ← DI SINI

// Interface untuk response data
interface VocabItem {
  id: number
  updated_at?: string
  jlpt_level?: string
}

interface GrammarItem {
  id: number
  updated_at?: string
  level?: string
  slug?: string
}

interface CategoryItem {
  id: number
  slug: string
  updated_at?: string
}

interface UserItem {
  username: string
  updated_at?: string
}

async function fetchVocabList(): Promise<VocabItem[]> {
  try {
    const response = await axios.get(`${API_BASE_URL}/vocab/`, {
      params: { per_page: 1000 },
      timeout: 30000
    })
    return response.data.data || response.data || []
  } catch (error) {
    console.error('Error fetching vocab list:', error)
    return []
  }
}

async function fetchGrammarList(): Promise<GrammarItem[]> {
  try {
    const response = await axios.get(`${API_BASE_URL}/grammar/`, {
      params: { per_page: 1000, is_published: 1 },
      timeout: 30000
    })
    return response.data.data || response.data || []
  } catch (error) {
    console.error('Error fetching grammar list:', error)
    return []
  }
}

async function fetchCategories(): Promise<CategoryItem[]> {
  try {
    const response = await axios.get(`${API_BASE_URL}/categories/`, {
      timeout: 30000
    })
    return response.data.data || response.data || []
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

async function fetchUsers(): Promise<UserItem[]> {
  try {
    const response = await axios.get(`${API_BASE_URL}/users/`, {
      params: { per_page: 100 },
      timeout: 30000
    })
    return response.data.data || response.data || []
  } catch (error) {
    console.error('Error fetching users:', error)
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch data dari API
  const [vocabList, grammarList, categories, users] = await Promise.all([
    fetchVocabList(),
    fetchGrammarList(),
    fetchCategories(),
    fetchUsers()
  ])

  const currentDate = new Date().toISOString()

  // Static URLs
  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/vocabulary`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/grammar`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/study`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/leaderboard`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/login`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/register`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]

  // Dynamic vocabulary URLs
  const vocabUrls: MetadataRoute.Sitemap = vocabList.map((vocab: VocabItem) => ({
    url: `${SITE_URL}/vocabulary/${vocab.id}`,
    lastModified: vocab.updated_at ? vocab.updated_at.split('T')[0] : currentDate,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  // Dynamic grammar URLs
  const grammarUrls: MetadataRoute.Sitemap = grammarList.map((grammar: GrammarItem) => ({
    url: grammar.slug 
      ? `${SITE_URL}/grammar/${grammar.slug}`
      : `${SITE_URL}/grammar/${grammar.id}`,
    lastModified: grammar.updated_at ? grammar.updated_at.split('T')[0] : currentDate,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  // Category URLs
  const categoryUrls: MetadataRoute.Sitemap = categories.map((category: CategoryItem) => ({
    url: `${SITE_URL}/vocabulary?category=${category.slug}`,
    lastModified: category.updated_at ? category.updated_at.split('T')[0] : currentDate,
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  // User profile URLs (optional - bisa diaktifkan jika ingin)
  const userUrls: MetadataRoute.Sitemap = users.map((user: UserItem) => ({
    url: `${SITE_URL}/profile/${user.username}`,
    lastModified: user.updated_at ? user.updated_at.split('T')[0] : currentDate,
    changeFrequency: 'weekly',
    priority: 0.4,
  }))

  // JLPT Level filter URLs
  const jlptLevels = ['n5', 'n4', 'n3', 'n2', 'n1']
  const levelUrls: MetadataRoute.Sitemap = jlptLevels.map((level) => ({
    url: `${SITE_URL}/vocabulary?level=${level}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  // Combine all URLs
  return [
    ...staticUrls,
    ...vocabUrls,
    ...grammarUrls,
    ...categoryUrls,
    ...levelUrls,
    ...userUrls,
  ]
}