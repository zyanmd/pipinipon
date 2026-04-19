// app/sitemap.ts
import { MetadataRoute } from 'next'
import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.pipinipon.site/api'
const SITE_URL = 'https://pipinipon.web.id'

export const revalidate = 3600 // Revalidate every hour

// Interfaces
interface VocabItem {
  id: number
  updated_at?: string
  jlpt_level?: string
  slug: string
  arti?: string
}

interface GrammarItem {
  id: number
  updated_at?: string
  level?: string
  slug?: string
  title?: string
}

interface ReadingItem {
  id: number
  slug: string
  title: string
  level: string
  updated_at?: string
  published_at?: string
  category?: string
}

interface CategoryItem {
  id: number
  slug: string
  name?: string
}

interface UserItem {
  id: number
  username: string
  updated_at?: string
}

// Helper functions
function extractVocabArray(data: any): VocabItem[] {
  if (!data) return []
  if (data?.data?.vocab && Array.isArray(data.data.vocab)) {
    return data.data.vocab
  }
  if (Array.isArray(data)) return data
  if (data?.data && Array.isArray(data.data)) return data.data
  if (data?.vocab && Array.isArray(data.vocab)) return data.vocab
  return []
}

async function fetchGrammarList(): Promise<GrammarItem[]> {
  try {
    const response = await axios.get(`${API_BASE_URL}/grammar/`, {
      params: { per_page: 1000, is_published: 1 },
      timeout: 30000
    })
    
    const data = response.data
    if (data?.data?.grammar && Array.isArray(data.data.grammar)) {
      return data.data.grammar
    }
    if (data?.data && Array.isArray(data.data)) {
      return data.data
    }
    if (Array.isArray(data)) {
      return data
    }
    
    console.warn('Unexpected grammar response structure')
    return []
  } catch (error) {
    console.error('Error fetching grammar list:', error)
    return []
  }
}

async function fetchReadingList(): Promise<ReadingItem[]> {
  try {
    const response = await axios.get(`${API_BASE_URL}/reading/`, {
      params: { per_page: 1000, published_only: true },
      timeout: 30000
    })
    
    const data = response.data
    if (data?.data?.readings && Array.isArray(data.data.readings)) {
      return data.data.readings
    }
    if (data?.data && Array.isArray(data.data)) {
      return data.data
    }
    if (Array.isArray(data)) {
      return data
    }
    
    console.warn('Unexpected reading response structure')
    return []
  } catch (error) {
    console.error('Error fetching reading list:', error)
    return []
  }
}

async function fetchCategories(): Promise<CategoryItem[]> {
  try {
    const response = await axios.get(`${API_BASE_URL}/categories/`, {
      timeout: 30000
    })
    
    const data = response.data
    if (data?.data?.categories && Array.isArray(data.data.categories)) {
      return data.data.categories
    }
    if (data?.data && Array.isArray(data.data)) {
      return data.data
    }
    if (Array.isArray(data)) {
      return data
    }
    
    return []
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
    
    const data = response.data
    if (data?.data?.users && Array.isArray(data.data.users)) {
      return data.data.users
    }
    if (data?.users && Array.isArray(data.users)) {
      return data.users
    }
    return []
  } catch (error) {
    console.error('Error fetching users:', error)
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  console.log('🚀 Generating sitemap...')
  
  // Fetch all data in parallel
  let vocabList: VocabItem[] = []
  let readingList: ReadingItem[] = []
  let grammarList: GrammarItem[] = []
  let categories: CategoryItem[] = []
  let users: UserItem[] = []
  
  try {
    const [vocabResponse, readingResponse, grammarResponse, categoriesResponse, usersResponse] = await Promise.all([
      axios.get(`${API_BASE_URL}/vocab/`, { params: { per_page: 1000 }, timeout: 30000 }).catch(e => ({ data: null })),
      fetchReadingList(),
      fetchGrammarList(),
      fetchCategories(),
      fetchUsers()
    ])
    
    vocabList = extractVocabArray(vocabResponse.data)
    readingList = readingResponse
    grammarList = grammarResponse
    categories = categoriesResponse
    users = usersResponse
    
    console.log(`✅ Fetched ${vocabList.length} vocab items`)
    console.log(`✅ Fetched ${readingList.length} reading articles`)
    console.log(`✅ Fetched ${grammarList.length} grammar items`)
    console.log(`✅ Fetched ${categories.length} categories`)
    console.log(`✅ Fetched ${users.length} users`)
  } catch (error) {
    console.error('❌ Error fetching data:', error)
  }

  const currentDate = new Date().toISOString().split('T')[0]
  const today = new Date()

  // ==================== STATIC URLS ====================
  const staticUrls: MetadataRoute.Sitemap = [
    // Main pages
    { url: `${SITE_URL}/`, lastModified: currentDate, changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE_URL}/vocabulary`, lastModified: currentDate, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/grammar`, lastModified: currentDate, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/reading`, lastModified: currentDate, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/study`, lastModified: currentDate, changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/leaderboard`, lastModified: currentDate, changeFrequency: 'daily', priority: 0.7 },
    { url: `${SITE_URL}/dashboard`, lastModified: currentDate, changeFrequency: 'daily', priority: 0.6 },
    { url: `${SITE_URL}/chat`, lastModified: currentDate, changeFrequency: 'daily', priority: 0.6 },
    
    // Static informational pages
    { url: `${SITE_URL}/about`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/contact`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/faq`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/terms`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${SITE_URL}/privacy`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${SITE_URL}/cookie-policy`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.3 },
    
    // Auth pages
    { url: `${SITE_URL}/login`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.5 },
    { url: `${SITE_URL}/register`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.5 },
    { url: `${SITE_URL}/forgot-password`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.4 },
  ]

  // ==================== DYNAMIC VOCABULARY URLS ====================
  const vocabUrls: MetadataRoute.Sitemap = vocabList.map((vocab: VocabItem) => ({
    url: vocab.slug 
      ? `${SITE_URL}/vocabulary/${vocab.slug}`
      : `${SITE_URL}/vocabulary/${vocab.id}`,
    lastModified: vocab.updated_at ? vocab.updated_at.split('T')[0] : currentDate,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  // ==================== DYNAMIC READING URLS ====================
  const readingUrls: MetadataRoute.Sitemap = readingList.map((reading: ReadingItem) => ({
    url: `${SITE_URL}/reading/${reading.slug}`,
    lastModified: reading.published_at ? reading.published_at.split('T')[0] : (reading.updated_at ? reading.updated_at.split('T')[0] : currentDate),
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  // ==================== DYNAMIC GRAMMAR URLS ====================
  const grammarUrls: MetadataRoute.Sitemap = grammarList.map((grammar: GrammarItem) => ({
    url: grammar.slug 
      ? `${SITE_URL}/grammar/${grammar.slug}`
      : `${SITE_URL}/grammar/${grammar.id}`,
    lastModified: grammar.updated_at ? grammar.updated_at.split('T')[0] : currentDate,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  // ==================== USER PROFILE URLS ====================
  const userUrls: MetadataRoute.Sitemap = users.map((user: UserItem) => ({
    url: `${SITE_URL}/profile/${user.username}`,
    lastModified: user.updated_at ? user.updated_at.split('T')[0] : currentDate,
    changeFrequency: 'weekly',
    priority: 0.5,
  }))

  // ==================== FILTER URLS ====================
  
  // JLPT Level filters for Vocabulary
  const jlptLevels = ['N5', 'N4', 'N3', 'N2', 'N1']
  const vocabLevelUrls: MetadataRoute.Sitemap = jlptLevels.map((level) => ({
    url: `${SITE_URL}/vocabulary?jlpt_level=${level}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  // Category filters for Vocabulary
  const categoryUrls: MetadataRoute.Sitemap = categories.map((category: CategoryItem) => ({
    url: `${SITE_URL}/vocabulary?category=${category.slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  // Reading level filters
  const readingLevelUrls: MetadataRoute.Sitemap = jlptLevels.map((level) => ({
    url: `${SITE_URL}/reading?level=${level}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  // Reading category filters
  const readingCategories = ['artikel', 'cerita', 'berita', 'wisata', 'budaya', 'makanan']
  const readingCategoryUrls: MetadataRoute.Sitemap = readingCategories.map((category) => ({
    url: `${SITE_URL}/reading?category=${category}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  // Grammar level filters
  const grammarLevelUrls: MetadataRoute.Sitemap = jlptLevels.map((level) => ({
    url: `${SITE_URL}/grammar?level=${level}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  // ==================== PAGINATION URLS ====================
  const paginationUrls: MetadataRoute.Sitemap = []
  
  // Vocabulary pagination (pages 1-10)
  for (let i = 1; i <= 10; i++) {
    paginationUrls.push({
      url: `${SITE_URL}/vocabulary?page=${i}`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.5,
    })
  }
  
  // Reading pagination (pages 1-5)
  for (let i = 1; i <= 5; i++) {
    paginationUrls.push({
      url: `${SITE_URL}/reading?page=${i}`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.5,
    })
  }

  // ==================== BLOG / ARTICLE CATEGORIES ====================
  const blogCategories = ['tips-belajar', 'jlpt-preparation', 'culture', 'grammar-tips', 'vocabulary-tips']
  const blogCategoryUrls: MetadataRoute.Sitemap = blogCategories.map((category) => ({
    url: `${SITE_URL}/blog/category/${category}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.5,
  }))

  // ==================== SPECIAL FEATURES ====================
  const specialUrls: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/study/daily-challenge`, lastModified: currentDate, changeFrequency: 'daily', priority: 0.7 },
    { url: `${SITE_URL}/study/quiz`, lastModified: currentDate, changeFrequency: 'daily', priority: 0.7 },
    { url: `${SITE_URL}/study/flashcards`, lastModified: currentDate, changeFrequency: 'daily', priority: 0.7 },
    { url: `${SITE_URL}/kanji-practice`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${SITE_URL}/writing-practice`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${SITE_URL}/listening-practice`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.6 },
  ]

  // ==================== COMBINE ALL URLS ====================
  const allUrls = [
    ...staticUrls,
    ...vocabUrls,
    ...readingUrls,
    ...grammarUrls,
    ...userUrls,
    ...vocabLevelUrls,
    ...categoryUrls,
    ...readingLevelUrls,
    ...readingCategoryUrls,
    ...grammarLevelUrls,
    ...paginationUrls,
    ...blogCategoryUrls,
    ...specialUrls,
  ]
  
  // Remove duplicates (just in case)
  const uniqueUrls = Array.from(new Map(allUrls.map(item => [item.url, item])).values())
  
  // Sort by priority (highest first)
  uniqueUrls.sort((a, b) => (b.priority || 0) - (a.priority || 0))
  
  console.log(`📝 Total URLs in sitemap: ${uniqueUrls.length}`)
  console.log(`   - Static: ${staticUrls.length}`)
  console.log(`   - Vocab details: ${vocabUrls.length}`)
  console.log(`   - Reading articles: ${readingUrls.length}`)
  console.log(`   - Grammar details: ${grammarUrls.length}`)
  console.log(`   - User profiles: ${userUrls.length}`)
  console.log(`   - Filter pages: ${vocabLevelUrls.length + categoryUrls.length + readingLevelUrls.length + readingCategoryUrls.length + grammarLevelUrls.length}`)
  console.log(`   - Pagination: ${paginationUrls.length}`)
  console.log(`   - Special features: ${specialUrls.length}`)

  return uniqueUrls
}