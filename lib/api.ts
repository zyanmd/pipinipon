import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.pipinipon.site/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor untuk menambahkan token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor untuk handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        const refreshToken = localStorage.getItem('refresh_token')
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
          headers: { Authorization: `Bearer ${refreshToken}` }
        })
        
        const { access_token } = response.data
        localStorage.setItem('access_token', access_token)
        
        originalRequest.headers.Authorization = `Bearer ${access_token}`
        return api(originalRequest)
      } catch (refreshError) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }
    
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  register: (data: { username: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  refresh: () => api.post('/auth/refresh'),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
}

// Vocabulary API
export const vocabAPI = {
  getAll: (params?: {
    page?: number
    per_page?: number
    search?: string
    jlpt_level?: string
    mastered_status?: string
  }) => api.get('/vocab/', { params }),
  getById: (id: number) => api.get(`/vocab/${id}`),
  getMastered: (params?: { page?: number; per_page?: number }) =>
    api.get('/vocab/mastered', { params }),
  getNotMastered: (params?: { page?: number; per_page?: number }) =>
    api.get('/vocab/not-mastered', { params }),
  toggleMastered: (id: number, mastered: boolean) =>
    api.post(`/vocab/toggle-mastered/${id}`, { mastered }),
  getStats: () => api.get('/vocab/mastered-stats'),
  search: (q: string, page?: number, per_page?: number) =>
    api.get('/vocab/search', { params: { q, page, per_page } }),
}

// Grammar API
export const grammarAPI = {
  getAll: (params?: {
    page?: number
    per_page?: number
    level?: string
    category?: string
  }) => api.get('/grammar/', { params }),
  getById: (id: number) => api.get(`/grammar/${id}`),
  getBySlug: (slug: string) => api.get(`/grammar/slug/${slug}`),
  getByLevel: (level: string) => api.get(`/grammar/by-level/${level}`),
  getPopular: (limit?: number) => api.get('/grammar/popular', { params: { limit } }),
  search: (q: string, page?: number, per_page?: number) =>
    api.get('/grammar/search', { params: { q, page, per_page } }),
}

// Study API
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
}

// Chat API
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
  getNotificationSummary: () => api.get('/chat/notifications/summary'),
  markAllAsRead: () => api.post('/chat/read-all'),
  searchUsers: (q: string) => api.get('/chat/users/search', { params: { q } }),
}

// User API
export const userAPI = {
  getAll: (params?: { page?: number; per_page?: number }) =>
    api.get('/users/', { params }),
  getByUsername: (username: string) => api.get(`/users/${username}`),
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

// Category API
export const categoryAPI = {
  getAll: () => api.get('/categories/'),
  getById: (id: number) => api.get(`/categories/${id}`),
  getWithCount: () => api.get('/categories/with-count'),
}

// Bookmark API
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

export default api