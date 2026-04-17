// app/sitemap.ts
import { MetadataRoute } from 'next'
import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.pipinipon.site/api'
const SITE_URL = 'https://pipinipon.web.id'

export const revalidate = 3600

// Interface untuk response data (disesuaikan)
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

interface CategoryItem {
  id: number
  slug: string
  name?: string
}

// Function untuk mengekstrak array vocab dari response
function extractVocabArray(data: any): VocabItem[] {
  if (!data) return []
  // Cek struktur: response.data.data.vocab
  if (data?.data?.vocab && Array.isArray(data.data.vocab)) {
    return data.data.vocab
  }
  // Fallback untuk kemungkinan struktur lain
  if (Array.isArray(data)) return data
  if (data?.data && Array.isArray(data.data)) return data.data
  if (data?.vocab && Array.isArray(data.vocab)) return data.vocab
  return []
}

// Function untuk ekstrak array grammar (sesuaikan nanti)
async function fetchGrammarList(): Promise<GrammarItem[]> {
  try {
    const response = await axios.get(`${API_BASE_URL}/grammar/`, {
      params: { per_page: 1000, is_published: 1 },
      timeout: 30000
    })
    
    // Cek struktur response grammar (asumsikan mirip vocab)
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

// Function untuk fetch categories (sesuaikan dengan struktur API Anda)
async function fetchCategories(): Promise<CategoryItem[]> {
  try {
    const response = await axios.get(`${API_BASE_URL}/categories/`, {
      timeout: 30000
    })
    
    const data = response.data
    // Asumsikan response categories mirip dengan vocab
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
  
  // Fetch data dengan extractor yang benar
  let vocabList: VocabItem[] = []
  try {
    const response = await axios.get(`${API_BASE_URL}/vocab/`, {
      params: { per_page: 1000 },
      timeout: 30000
    })
    vocabList = extractVocabArray(response.data)
    console.log(`✅ Fetched ${vocabList.length} vocab items`)
  } catch (error) {
    console.error('❌ Error fetching vocab:', error)
  }

  const [grammarList, categories] = await Promise.all([
    fetchGrammarList(),
    fetchCategories()
  ])

  console.log(`📊 Summary: ${vocabList.length} vocab, ${grammarList.length} grammar, ${categories.length} categories`)

  const currentDate = new Date().toISOString().split('T')[0]

  // Static URLs
  const staticUrls: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: currentDate, changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE_URL}/vocabulary`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/grammar`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/study`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/leaderboard`, lastModified: currentDate, changeFrequency: 'daily', priority: 0.7 },
    { url: `${SITE_URL}/about`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/contact`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/login`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/register`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.5 },
  ]

  // Dynamic vocabulary URLs (detail pages) - menggunakan slug atau id
  const vocabUrls: MetadataRoute.Sitemap = vocabList.map((vocab: VocabItem) => ({
    url: vocab.slug 
      ? `${SITE_URL}/vocabulary/${vocab.slug}`
      : `${SITE_URL}/vocabulary/${vocab.id}`,
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

  // Category filter URLs
  const categoryUrls: MetadataRoute.Sitemap = categories.map((category: CategoryItem) => ({
    url: `${SITE_URL}/vocabulary?category=${category.slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  // JLPT Level filter URLs
  const jlptLevels = ['n5', 'n4', 'n3', 'n2', 'n1']
  const levelUrls: MetadataRoute.Sitemap = jlptLevels.map((level) => ({
    url: `${SITE_URL}/vocabulary?level=${level}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  const allUrls = [...staticUrls, ...vocabUrls, ...grammarUrls, ...categoryUrls, ...levelUrls]
  
  console.log(`📝 Total URLs in sitemap: ${allUrls.length}`)
  console.log(`   - Static: ${staticUrls.length}`)
  console.log(`   - Vocab details: ${vocabUrls.length}`)
  console.log(`   - Grammar details: ${grammarUrls.length}`)
  console.log(`   - Category filters: ${categoryUrls.length}`)
  console.log(`   - Level filters: ${levelUrls.length}`)

  return allUrls
}