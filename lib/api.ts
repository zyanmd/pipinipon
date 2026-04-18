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
    const originalRequest = error.config
    const errorData = error.response?.data
    const status = error.response?.status
    
    console.error(`[API Error] ${originalRequest?.url} - Status: ${status}`, errorData)
    
    // SPECIAL CASE: Jika error karena email belum diverifikasi
    if (status === 401 && errorData?.requires_verification === true) {
      console.log('[API] Email not verified, showing verification modal')
      return Promise.reject(error)
    }
    
    // Cegah infinite loop dan hanya handle 401 untuk token expired
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      if (typeof window !== 'undefined') {
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
            return Promise.reject(error)
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
  googleLogin: (idToken: string) => {
    console.log('[Google API] Calling googleLogin')
    if (!idToken) {
      console.error('[Google API] No token provided!')
      return Promise.reject(new Error('No token provided'))
    }
    return api.post('/auth/google/token', { id_token: idToken })
  },
  linkGoogle: (idToken: string) => api.post('/auth/link-google', { id_token: idToken }),
  unlinkGoogle: () => api.post('/auth/unlink-google'),
}

// ==================== JAPANESE READING API ====================
export const readingAPI = {
  getAll: (params?: any) => api.get('/reading/', { params }),
  getById: (id: number) => api.get(`/reading/${id}`),
  getBySlug: (slug: string) => api.get(`/reading/slug/${slug}`),
  create: (data: any) => api.post('/reading/', data),
  update: (id: number, data: any) => api.put(`/reading/${id}`, data),
  delete: (id: number) => api.delete(`/reading/${id}`),
  getBookmarks: () => api.get('/reading/bookmarks'),
  addBookmark: (readingId: number, notes?: string) => 
    api.post(`/reading/${readingId}/bookmark`, { notes }),
  removeBookmark: (bookmarkId: number) => 
    api.delete(`/reading/bookmarks/${bookmarkId}`),
  getProgress: (readingId: number) => api.get(`/reading/${readingId}/progress`),
  updateProgress: (readingId: number, data: any) => 
    api.post(`/reading/${readingId}/progress`, data),
  getStats: () => api.get('/reading/stats'),
}

// ==================== VOCABULARY API ====================
export const vocabAPI = {
  getAll: (params?: any) => api.get('/vocab/', { params }),
  getById: (id: number) => api.get(`/vocab/${id}`),
  getByLevel: (level: string) => api.get(`/vocab/by-level/${level}`),
  getByCategory: (categoryId: number) => api.get(`/vocab/categories/${categoryId}`),
  getMastered: (params?: any) => api.get('/vocab/mastered', { params }),
  getNotMastered: (params?: any) => api.get('/vocab/not-mastered', { params }),
  toggleMastered: (id: number, mastered: boolean) =>
    api.post(`/vocab/toggle-mastered/${id}`, { mastered }),
  getMasteredStats: () => api.get('/vocab/mastered-stats'),
  search: (q: string, page?: number, per_page?: number) =>
    api.get('/vocab/search', { params: { q, page, per_page } }),
  create: (data: any) => api.post('/vocab/', data),
  update: (id: number, data: any) => api.put(`/vocab/${id}`, data),
  delete: (id: number) => api.delete(`/vocab/${id}`),
}

// ==================== GRAMMAR API ====================
export const grammarAPI = {
  getAll: (params?: any) => api.get('/grammar/', { params }),
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
  getAll: (params?: any) => api.get('/grammar/admin', { params }),
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
  updateProgress: (data: any) => api.post('/study/progress', data),
  resetProgress: (vocabId: number) => api.post(`/study/progress/${vocabId}/reset`),
  markMastered: (vocabId: number, mastered: boolean) =>
    api.post(`/study/progress/${vocabId}/mastered`, { mastered }),
  getStats: () => api.get('/study/stats'),
  getStatsByLevel: () => api.get('/study/stats/by-level'),
  getRecommendations: (params?: any) => api.get('/study/recommendations', { params }),
  getDashboard: () => api.get('/study/dashboard'),
  getStreak: () => api.get('/study/streak'),
  getStreakCalendar: () => api.get('/study/streak-calendar'),
}

// ==================== CHAT API ====================
export const chatAPI = {
  getInfo: () => api.get('/chat/info'),
  getMessages: (params?: any) => api.get('/chat/messages', { params }),
  sendMessage: (data: any) => api.post('/chat/messages', data),
  editMessage: (messageId: number, message: string) =>
    api.put(`/chat/messages/${messageId}`, { message }),
  deleteMessage: (messageId: number) => api.delete(`/chat/messages/${messageId}`),
  getMentions: (params?: any) => api.get('/chat/mentions', { params }),
  markMentionRead: (mentionId: number) => api.patch(`/chat/mentions/${mentionId}/read`),
  markAllMentionsRead: () => api.post('/chat/mentions/read-all'),
  getReplyNotifications: (params?: any) => api.get('/chat/reply-notifications', { params }),
  markReplyNotificationRead: (notifId: number) => 
    api.patch(`/chat/reply-notifications/${notifId}/read`),
  markAllReplyNotificationsRead: () => api.post('/chat/reply-notifications/read-all'),
  getNotificationSummary: () => api.get('/chat/notifications/summary'),
  markAllAsRead: () => api.post('/chat/read-all'),
  searchUsers: (q: string) => api.get('/chat/users/search', { params: { q } }),
}

// ==================== USER API ====================
export const userAPI = {
  getAll: (params?: any) => api.get('/users/', { params }),
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
  create: (data: any) => api.post('/categories/', data),
  update: (id: number, data: any) => api.put(`/categories/${id}`, data),
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
  getUsers: (params?: any) => api.get('/admin/users', { params }),
  getUserByUsername: (username: string) => api.get(`/admin/users/${username}`),
  updateUser: (username: string, data: any) => api.put(`/admin/users/${username}`, data),
  deleteUser: (username: string) => api.delete(`/admin/users/${username}`),
  changeUserRole: (username: string, role: string) => 
    api.patch(`/admin/users/${username}/role`, { role }),
  getStats: () => api.get('/admin/stats'),
  getVocab: (params?: any) => api.get('/admin/vocab', { params }),
  createVocab: (data: any) => api.post('/admin/vocab', data),
  updateVocab: (id: number, data: any) => api.put(`/admin/vocab/${id}`, data),
  deleteVocab: (id: number) => api.delete(`/admin/vocab/${id}`),
  getGrammar: (params?: any) => adminGrammarAPI.getAll(params),
  getGrammarById: (id: number) => adminGrammarAPI.getById(id),
  createGrammar: (data: any) => adminGrammarAPI.create(data),
  updateGrammar: (id: number, data: any) => adminGrammarAPI.update(id, data),
  deleteGrammar: (id: number) => adminGrammarAPI.delete(id),
  publishGrammar: (id: number, isPublished: boolean) => adminGrammarAPI.publish(id, isPublished),
  uploadGrammarThumbnail: (file: File) => adminGrammarAPI.uploadThumbnail(file),
  deleteGrammarThumbnail: (filename: string) => adminGrammarAPI.deleteThumbnail(filename),
  getCategories: () => api.get('/admin/categories'),
  createCategory: (data: any) => api.post('/admin/categories', data),
  updateCategory: (id: number, data: any) => api.put(`/admin/categories/${id}`, data),
  deleteCategory: (id: number) => api.delete(`/admin/categories/${id}`),
  checkStreaks: () => api.post('/admin/check-streaks'),
  checkReminders: () => api.post('/admin/check-reminders'),
}

// Helper untuk mendapatkan URL gambar
export const getImageUrl = (path: string | null | undefined, type: 'avatar' | 'cover' | 'grammar' | 'reading' = 'avatar'): string => {
  if (!path) {
    if (type === 'avatar') return '/default-avatar.jpg'
    if (type === 'cover') return '/default-cover.jpg'
    if (type === 'grammar') return '/default-grammar.jpg'
    if (type === 'reading') return '/default-reading.jpg'
    return '/default-image.jpg'
  }
  
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://api.pipinipon.site'
  
  if (path.startsWith('http')) return path
  if (path.includes('uploads/')) return `${baseUrl}/${path}`
  if (type === 'avatar') return `${baseUrl}/uploads/avatars/${path}`
  if (type === 'cover') return `${baseUrl}/uploads/covers/${path}`
  if (type === 'grammar') return `${baseUrl}/uploads/grammar/${path}`
  if (type === 'reading') return `${baseUrl}/uploads/readings/${path}`
  
  return `${baseUrl}/uploads/${path}`
}

export const getGrammarThumbnailUrl = (thumbnail: string | null | undefined): string => {
  return getImageUrl(thumbnail, 'grammar')
}

export const getReadingThumbnailUrl = (thumbnail: string | null | undefined): string => {
  return getImageUrl(thumbnail, 'reading')
}

export default api