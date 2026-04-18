// app/sitemap.ts
import { MetadataRoute } from 'next'
import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.pipinipon.site/api'
const SITE_URL = 'https://pipinipon.web.id'

export const revalidate = 3600

// Interface untuk response data
interface VocabItem {
  id: number
  updated_at?: string
  jlpt_level?: string
  slug: string
}

interface GrammarItem {
  id: number
  updated_at?: string
  level?: string
  slug?: string
}

interface ReadingItem {
  id: number
  slug: string
  title: string
  level: string
  updated_at?: string
  published_at?: string
}

interface CategoryItem {
  id: number
  slug: string
  name?: string
}

// Function untuk mengekstrak array vocab dari response
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

// Function untuk ekstrak array grammar
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

// Function untuk fetch reading articles
async function fetchReadingList(): Promise<ReadingItem[]> {
  try {
    const response = await axios.get(`${API_BASE_URL}/reading/`, {
      params: { per_page: 1000, published_only: true },
      timeout: 30000
    })
    
    const data = response.data
    // Cek struktur response reading
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

// Function untuk fetch categories
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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  console.log('🚀 Generating sitemap...')
  
  // Fetch all data in parallel
  let vocabList: VocabItem[] = []
  let readingList: ReadingItem[] = []
  let grammarList: GrammarItem[] = []
  let categories: CategoryItem[] = []
  
  try {
    const [vocabResponse, readingResponse, grammarResponse, categoriesResponse] = await Promise.all([
      axios.get(`${API_BASE_URL}/vocab/`, { params: { per_page: 1000 }, timeout: 30000 }).catch(e => ({ data: null })),
      fetchReadingList(),
      fetchGrammarList(),
      fetchCategories()
    ])
    
    vocabList = extractVocabArray(vocabResponse.data)
    readingList = readingResponse
    grammarList = grammarResponse
    categories = categoriesResponse
    
    console.log(`✅ Fetched ${vocabList.length} vocab items`)
    console.log(`✅ Fetched ${readingList.length} reading articles`)
    console.log(`✅ Fetched ${grammarList.length} grammar items`)
    console.log(`✅ Fetched ${categories.length} categories`)
  } catch (error) {
    console.error('❌ Error fetching data:', error)
  }

  const currentDate = new Date().toISOString().split('T')[0]

  // Static URLs
  const staticUrls: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: currentDate, changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE_URL}/vocabulary`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/grammar`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/reading`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/study`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/leaderboard`, lastModified: currentDate, changeFrequency: 'daily', priority: 0.7 },
    { url: `${SITE_URL}/dashboard`, lastModified: currentDate, changeFrequency: 'daily', priority: 0.6 },
    { url: `${SITE_URL}/about`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/contact`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/login`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/register`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.5 },
  ]

  // Dynamic vocabulary URLs (detail pages)
  const vocabUrls: MetadataRoute.Sitemap = vocabList.map((vocab: VocabItem) => ({
    url: vocab.slug 
      ? `${SITE_URL}/vocabulary/${vocab.slug}`
      : `${SITE_URL}/vocabulary/${vocab.id}`,
    lastModified: vocab.updated_at ? vocab.updated_at.split('T')[0] : currentDate,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  // Dynamic reading article URLs
  const readingUrls: MetadataRoute.Sitemap = readingList.map((reading: ReadingItem) => ({
    url: `${SITE_URL}/reading/${reading.slug}`,
    lastModified: reading.published_at ? reading.published_at.split('T')[0] : (reading.updated_at ? reading.updated_at.split('T')[0] : currentDate),
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

  // Reading level filter URLs
  const readingLevels = ['N5', 'N4', 'N3', 'N2', 'N1']
  const readingLevelUrls: MetadataRoute.Sitemap = readingLevels.map((level) => ({
    url: `${SITE_URL}/reading?level=${level}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  // Reading category filter URLs (jika ada kategori khusus untuk reading)
  const readingCategories = ['artikel', 'cerita', 'berita']
  const readingCategoryUrls: MetadataRoute.Sitemap = readingCategories.map((category) => ({
    url: `${SITE_URL}/reading?category=${category}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  // Category filter URLs (untuk vocabulary)
  const categoryUrls: MetadataRoute.Sitemap = categories.map((category: CategoryItem) => ({
    url: `${SITE_URL}/vocabulary?category=${category.slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  // JLPT Level filter URLs (untuk vocabulary)
  const jlptLevels = ['n5', 'n4', 'n3', 'n2', 'n1']
  const levelUrls: MetadataRoute.Sitemap = jlptLevels.map((level) => ({
    url: `${SITE_URL}/vocabulary?level=${level}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  const allUrls = [
    ...staticUrls, 
    ...vocabUrls, 
    ...readingUrls, 
    ...grammarUrls, 
    ...categoryUrls, 
    ...levelUrls,
    ...readingLevelUrls,
    ...readingCategoryUrls
  ]
  
  console.log(`📝 Total URLs in sitemap: ${allUrls.length}`)
  console.log(`   - Static: ${staticUrls.length}`)
  console.log(`   - Vocab details: ${vocabUrls.length}`)
  console.log(`   - Reading articles: ${readingUrls.length}`)
  console.log(`   - Grammar details: ${grammarUrls.length}`)
  console.log(`   - Category filters: ${categoryUrls.length}`)
  console.log(`   - Level filters: ${levelUrls.length}`)
  console.log(`   - Reading level filters: ${readingLevelUrls.length}`)
  console.log(`   - Reading category filters: ${readingCategoryUrls.length}`)

  return allUrls
}