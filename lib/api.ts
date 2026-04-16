import axios from 'axios'

// Gunakan URL lokal untuk development, dan production URL untuk production
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.pipinipon.site/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})

// Flag untuk mencegah multiple refresh requests
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: unknown) => void
  reject: (reason?: unknown) => void
}> = []

const processQueue = (error: any = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve()
    }
  })
  failedQueue = []
}

// Request interceptor untuk menambahkan token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor untuk handle token refresh
api.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.config.url} - Status: ${response.status}`)
    return response
  },
  async (error) => {
    console.error(`[API Error] ${error.config?.url} - Status: ${error.response?.status}`, error.response?.data)
    
    const originalRequest = error.config
    
    // Cegah infinite loop dan hanya handle 401
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      if (typeof window !== 'undefined') {
        // Jika sedang refreshing, queue request
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject })
          })
            .then(() => api(originalRequest))
            .catch(err => Promise.reject(err))
        }
        
        isRefreshing = true
        
        try {
          const refreshToken = localStorage.getItem('refresh_token')
          if (!refreshToken) {
            console.warn('No refresh token available, redirecting to login')
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
              window.location.href = '/login'
            }
            return
          }
          
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
            headers: { Authorization: `Bearer ${refreshToken}` }
          })
          
          const { access_token } = response.data
          if (access_token) {
            localStorage.setItem('access_token', access_token)
            originalRequest.headers.Authorization = `Bearer ${access_token}`
            processQueue()
            return api(originalRequest)
          } else {
            throw new Error('Refresh response missing access_token')
          }
        } catch (refreshError) {
          console.error('Refresh token failed:', refreshError)
          processQueue(refreshError)
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
            window.location.href = '/login'
          }
          return Promise.reject(refreshError)
        } finally {
          isRefreshing = false
        }
      }
    }
    
    return Promise.reject(error)
  }
)

// ==================== AUTH API ====================
export const authAPI = {
  register: (data: { username: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  refresh: () => api.post('/auth/refresh'),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  verifyToken: () => api.post('/auth/verify-token'),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  verifyResetOtp: (email: string, otp: string) => 
    api.post('/auth/verify-reset-otp', { email, otp }),
  resetPassword: (token: string, newPassword: string) => 
    api.post('/auth/reset-password', { token, new_password: newPassword }),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post('/auth/change-password', { current_password: currentPassword, new_password: newPassword }),
  sendVerification: (email?: string) => api.post('/auth/send-verification', { email }),
  verifyEmail: (code: string, email?: string) => api.post('/auth/verify-email', { code, email }),
}

// ==================== GOOGLE OAUTH API ====================
export const googleAPI = {
  googleLogin: () => {
    console.log('[Google API] Calling googleLogin')
    return api.get('/auth/google/login')
  },
  googleCallback: (code: string) => {
    console.log('[Google API] Calling googleCallback with code:', code?.substring(0, 20))
    return api.get('/auth/google/callback', { params: { code } })
  },
  loginWithGoogleToken: (idToken: string) => {
    console.log('[Google API] Calling loginWithGoogleToken')
    console.log('[Google API] Token length:', idToken?.length)
    console.log('[Google API] Token preview:', idToken?.substring(0, 50) + '...')
    return api.post('/auth/google/token', { id_token: idToken })
  },
  linkGoogle: (idToken: string) => {
    console.log('[Google API] Calling linkGoogle')
    return api.post('/auth/link-google', { id_token: idToken })
  },
  unlinkGoogle: () => {
    console.log('[Google API] Calling unlinkGoogle')
    return api.post('/auth/unlink-google')
  },
}

// ==================== VOCABULARY API ====================
export const vocabAPI = {
  getAll: (params?: {
    page?: number
    per_page?: number
    search?: string
    jlpt_level?: string
    kategori_id?: number
    mastered_status?: string
  }) => api.get('/vocab/', { params }),
  getById: (id: number) => api.get(`/vocab/${id}`),
  getByLevel: (level: string) => api.get(`/vocab/by-level/${level}`),
  getByCategory: (categoryId: number) => api.get(`/vocab/categories/${categoryId}`),
  getMastered: (params?: { page?: number; per_page?: number }) =>
    api.get('/vocab/mastered', { params }),
  getNotMastered: (params?: { page?: number; per_page?: number }) =>
    api.get('/vocab/not-mastered', { params }),
  toggleMastered: (id: number, mastered: boolean) =>
    api.post(`/vocab/toggle-mastered/${id}`, { mastered }),
  getMasteredStats: () => api.get('/vocab/mastered-stats'),
  search: (q: string, page?: number, per_page?: number) =>
    api.get('/vocab/search', { params: { q, page, per_page } }),
  getWritingPractice: (level?: string, limit?: number) => {
    const params = new URLSearchParams()
    if (level) params.append('level', level)
    if (limit) params.append('limit', limit.toString())
    return api.get(`/vocab/writing-practice?${params.toString()}`)
  },
  submitWritingPractice: (data: { vocab_id: number; user_writing: string; is_correct: boolean }) =>
    api.post('/vocab/writing-practice/submit', data),
  create: (data: any) => api.post('/vocab/', data),
  update: (id: number, data: any) => api.put(`/vocab/${id}`, data),
  delete: (id: number) => api.delete(`/vocab/${id}`),
}

// ==================== GRAMMAR API ====================
export const grammarAPI = {
  getAll: (params?: {
    page?: number
    per_page?: number
    level?: string
    category?: string
    is_published?: number
  }) => api.get('/grammar/', { params }),
  getById: (id: number) => api.get(`/grammar/${id}`),
  getBySlug: (slug: string) => api.get(`/grammar/slug/${slug}`),
  getByLevel: (level: string) => api.get(`/grammar/by-level/${level}`),
  getByCategory: (category: string) => api.get(`/grammar/by-category/${category}`),
  getPopular: (limit?: number) => api.get('/grammar/popular', { params: { limit } }),
  search: (q: string, page?: number, per_page?: number) =>
    api.get('/grammar/search', { params: { q, page, per_page } }),
}

// ==================== ADMIN GRAMMAR API ====================
export const adminGrammarAPI = {
  getAll: (params?: {
    page?: number
    per_page?: number
    level?: string
    category?: string
    is_published?: number
  }) => api.get('/grammar/admin', { params }),
  getById: (id: number) => api.get(`/grammar/admin/${id}`),
  create: (data: any) => api.post('/grammar/admin', data),
  update: (id: number, data: any) => api.put(`/grammar/admin/${id}`, data),
  delete: (id: number) => api.delete(`/grammar/admin/${id}`),
  publish: (id: number, isPublished: boolean) => 
    api.patch(`/grammar/admin/${id}/publish`, { is_published: isPublished ? 1 : 0 }),
  uploadThumbnail: (file: File) => {
    const formData = new FormData()
    formData.append('thumbnail', file)
    return api.post('/grammar/admin/upload-thumbnail', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  deleteThumbnail: (filename: string) => 
    api.delete('/grammar/admin/upload-thumbnail', { data: { filename } }),
}

// ==================== STUDY API ====================
export const studyAPI = {
  getProgress: () => api.get('/study/progress'),
  getProgressByVocab: (vocabId: number) => api.get(`/study/progress/${vocabId}`),
  updateProgress: (data: { vocab_id: number; is_correct: boolean }) =>
    api.post('/study/progress', data),
  resetProgress: (vocabId: number) => api.post(`/study/progress/${vocabId}/reset`),
  markMastered: (vocabId: number, mastered: boolean) =>
    api.post(`/study/progress/${vocabId}/mastered`, { mastered }),
  getStats: () => api.get('/study/stats'),
  getStatsByLevel: () => api.get('/study/stats/by-level'),
  getRecommendations: (params?: { limit?: number; level?: string }) =>
    api.get('/study/recommendations', { params }),
  getDashboard: () => api.get('/study/dashboard'),
  getStreak: () => api.get('/study/streak'),
  getStreakCalendar: () => api.get('/study/streak-calendar'),
  getReminderSettings: () => api.get('/study/reminder/settings'),
  updateReminderSettings: (data: { enabled: boolean; time?: string }) =>
    api.post('/study/reminder/settings', data),
  sendReminderNow: () => api.post('/study/reminder/send-now'),
  sendReminder: () => api.post('/study/send-reminder'),
}

// ==================== CHAT API ====================
export const chatAPI = {
  getInfo: () => api.get('/chat/info'),
  getMessages: (params?: {
    page?: number
    per_page?: number
    before?: string
    after?: string
    search?: string
  }) => api.get('/chat/messages', { params }),
  sendMessage: (data: { message: string; reply_to_id?: number }) =>
    api.post('/chat/messages', data),
  editMessage: (messageId: number, message: string) =>
    api.put(`/chat/messages/${messageId}`, { message }),
  deleteMessage: (messageId: number) => api.delete(`/chat/messages/${messageId}`),
  getMentions: (params?: { is_read?: number; page?: number; per_page?: number }) =>
    api.get('/chat/mentions', { params }),
  markMentionRead: (mentionId: number) => api.patch(`/chat/mentions/${mentionId}/read`),
  markAllMentionsRead: () => api.post('/chat/mentions/read-all'),
  getReplyNotifications: (params?: { is_read?: number; page?: number; per_page?: number }) =>
    api.get('/chat/reply-notifications', { params }),
  markReplyNotificationRead: (notifId: number) => 
    api.patch(`/chat/reply-notifications/${notifId}/read`),
  markAllReplyNotificationsRead: () => 
    api.post('/chat/reply-notifications/read-all'),
  getNotificationSummary: () => api.get('/chat/notifications/summary'),
  markAllAsRead: () => api.post('/chat/read-all'),
  searchUsers: (q: string) => api.get('/chat/users/search', { params: { q } }),
}

// ==================== USER API ====================
export const userAPI = {
  getAll: (params?: { page?: number; per_page?: number }) =>
    api.get('/users/', { params }),
  getByUsername: (username: string) => api.get(`/users/${username}`),
  getBySlug: (slug: string) => api.get(`/users/by-slug/${slug}`),
  updateUser: (username: string, data: any) => api.put(`/users/${username}`, data),
  deleteUser: (username: string) => api.delete(`/users/${username}`),
  uploadAvatar: (username: string, file: File) => {
    const formData = new FormData()
    formData.append('avatar', file)
    return api.post(`/users/${username}/avatar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  uploadCover: (username: string, file: File) => {
    const formData = new FormData()
    formData.append('cover', file)
    return api.post(`/users/${username}/cover`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  deleteAvatar: (username: string) => api.delete(`/users/${username}/avatar`),
  deleteCover: (username: string) => api.delete(`/users/${username}/cover`),
  getMyProfile: () => api.get('/users/profile/me'),
  updateMyProfile: (data: any) => api.put('/users/profile/me', data),
  deleteMyAccount: () => api.delete('/users/profile/me'),
  getUserStats: (username: string) => api.get(`/users/${username}/stats`),
}

// ==================== CATEGORY API ====================
export const categoryAPI = {
  getAll: () => api.get('/categories/'),
  getById: (id: number) => api.get(`/categories/${id}`),
  getBySlug: (slug: string) => api.get(`/categories/by-slug/${slug}`),
  getWithCount: () => api.get('/categories/with-count'),
  create: (data: { name: string; slug?: string }) => api.post('/categories/', data),
  update: (id: number, data: { name?: string; slug?: string }) => 
    api.put(`/categories/${id}`, data),
  delete: (id: number) => api.delete(`/categories/${id}`),
}

// ==================== BOOKMARK API ====================
export const bookmarkAPI = {
  getVocabBookmarks: () => api.get('/bookmarks/vocab'),
  addVocabBookmark: (vocabId: number, notes?: string) =>
    api.post('/bookmarks/vocab', { vocab_id: vocabId, notes }),
  updateVocabBookmark: (bookmarkId: number, notes: string) =>
    api.put(`/bookmarks/vocab/${bookmarkId}`, { notes }),
  deleteVocabBookmark: (bookmarkId: number) =>
    api.delete(`/bookmarks/vocab/${bookmarkId}`),
  checkVocabBookmark: (vocabId: number) =>
    api.get(`/bookmarks/vocab/check/${vocabId}`),
  getGrammarFavorites: () => api.get('/bookmarks/grammar'),
  addGrammarFavorite: (grammarId: number) =>
    api.post('/bookmarks/grammar', { grammar_id: grammarId }),
  deleteGrammarFavorite: (favoriteId: number) =>
    api.delete(`/bookmarks/grammar/${favoriteId}`),
  checkGrammarFavorite: (grammarId: number) =>
    api.get(`/bookmarks/grammar/check/${grammarId}`),
  getStats: () => api.get('/bookmarks/stats'),
}

// ==================== ADMIN API ====================
export const adminAPI = {
  getUsers: (params?: { page?: number; per_page?: number; search?: string; role?: string; is_verified?: number }) =>
    api.get('/admin/users', { params }),
  getUserByUsername: (username: string) => api.get(`/admin/users/${username}`),
  updateUser: (username: string, data: any) => api.put(`/admin/users/${username}`, data),
  deleteUser: (username: string) => api.delete(`/admin/users/${username}`),
  changeUserRole: (username: string, role: string) => 
    api.patch(`/admin/users/${username}/role`, { role }),
  getStats: () => api.get('/admin/stats'),
  getVocab: (params?: { page?: number; per_page?: number; search?: string; jlpt_level?: string }) =>
    api.get('/admin/vocab', { params }),
  createVocab: (data: any) => api.post('/admin/vocab', data),
  updateVocab: (id: number, data: any) => api.put(`/admin/vocab/${id}`, data),
  deleteVocab: (id: number) => api.delete(`/admin/vocab/${id}`),
  getGrammar: (params?: { page?: number; per_page?: number; level?: string; category?: string; is_published?: number }) =>
    adminGrammarAPI.getAll(params),
  getGrammarById: (id: number) => adminGrammarAPI.getById(id),
  createGrammar: (data: any) => adminGrammarAPI.create(data),
  updateGrammar: (id: number, data: any) => adminGrammarAPI.update(id, data),
  deleteGrammar: (id: number) => adminGrammarAPI.delete(id),
  publishGrammar: (id: number, isPublished: boolean) => adminGrammarAPI.publish(id, isPublished),
  uploadGrammarThumbnail: (file: File) => adminGrammarAPI.uploadThumbnail(file),
  deleteGrammarThumbnail: (filename: string) => adminGrammarAPI.deleteThumbnail(filename),
  getCategories: () => api.get('/admin/categories'),
  createCategory: (data: { name: string; slug?: string }) => api.post('/admin/categories', data),
  updateCategory: (id: number, data: { name?: string; slug?: string }) => 
    api.put(`/admin/categories/${id}`, data),
  deleteCategory: (id: number) => api.delete(`/admin/categories/${id}`),
  checkStreaks: () => api.post('/admin/check-streaks'),
  checkReminders: () => api.post('/admin/check-reminders'),
}

// Helper untuk mendapatkan URL gambar
export const getImageUrl = (path: string | null | undefined, type: 'avatar' | 'cover' | 'grammar' = 'avatar'): string => {
  if (!path) {
    if (type === 'avatar') return '/default-avatar.jpg'
    if (type === 'cover') return '/default-cover.jpg'
    return '/default-grammar.jpg'
  }
  
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://api.pipinipon.site'
  
  if (path.startsWith('http')) return path
  if (path.includes('uploads/')) return `${baseUrl}/${path}`
  if (type === 'avatar') return `${baseUrl}/uploads/avatars/${path}`
  if (type === 'cover') return `${baseUrl}/uploads/covers/${path}`
  if (type === 'grammar') return `${baseUrl}/uploads/grammar/${path}`
  
  return `${baseUrl}/uploads/${path}`
}

export const getGrammarThumbnailUrl = (thumbnail: string | null | undefined): string => {
  if (!thumbnail) return '/default-grammar.jpg'
  
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://api.pipinipon.site'
  
  if (thumbnail.startsWith('http')) return thumbnail
  if (thumbnail.includes('grammar/')) {
    return `${baseUrl}/${thumbnail}`
  }
  
  return `${baseUrl}/uploads/grammar/${thumbnail}`
}

export default api