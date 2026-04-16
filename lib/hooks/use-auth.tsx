"use client"

import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from "react"
import { authAPI, userAPI, googleAPI } from "@/lib/api"
import { useRouter, usePathname } from "next/navigation"

interface User {
  id: number
  username: string
  email: string
  avatar: string | null
  cover_photo?: string | null
  role: string
  xp: number
  rank: string
  streak: number
  is_verified?: number
  verified_badge?: number
  bio?: string
  website?: string
  location?: string
  created_at?: string
  updated_at?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  loginWithGoogle: (idToken: string) => Promise<void>
  logout: () => void
  fetchUser: () => Promise<void>
  updateUser: (data: Partial<User>) => void
  checkToken: () => Promise<boolean>
  setUser: (user: User | null) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const tokenCheckInterval = useRef<NodeJS.Timeout | null>(null)

  // Handle callback URL dari Google (redirect method)
  useEffect(() => {
    if (typeof window !== 'undefined' && pathname === '/auth/callback') {
      const params = new URLSearchParams(window.location.search)
      const accessToken = params.get('access_token')
      const refreshToken = params.get('refresh_token')
      const userData = params.get('user')
      const errorMsg = params.get('error')
      
      console.log("Callback detected - access_token:", !!accessToken)
      console.log("Callback detected - error:", errorMsg)
      
      if (errorMsg) {
        console.error("Callback error:", errorMsg)
        router.replace('/login?error=' + encodeURIComponent(errorMsg))
        return
      }
      
      if (accessToken && refreshToken) {
        localStorage.setItem('access_token', accessToken)
        localStorage.setItem('refresh_token', refreshToken)
        console.log("Tokens saved from callback URL")
        
        if (userData) {
          try {
            const parsedUser = JSON.parse(decodeURIComponent(userData))
            setUser(parsedUser)
            console.log("User set from callback:", parsedUser.username)
          } catch (e) {
            console.error("Error parsing user data:", e)
          }
        }
        
        // Hapus query params dan redirect ke dashboard
        router.replace('/dashboard')
        return
      }
    }
  }, [pathname, router])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await authAPI.login({ email, password })
      const { access_token, refresh_token, user } = response.data
      localStorage.setItem("access_token", access_token)
      localStorage.setItem("refresh_token", refresh_token)
      setUser(user)
      startTokenCheck()
      router.push("/dashboard")
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (username: string, email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await authAPI.register({ username, email, password })
      const { access_token, refresh_token, user } = response.data
      localStorage.setItem("access_token", access_token)
      localStorage.setItem("refresh_token", refresh_token)
      setUser(user)
      startTokenCheck()
      router.push("/dashboard")
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const loginWithGoogle = async (idToken: string) => {
    setIsLoading(true)
    try {
      console.log("Sending Google token to backend...")
      
      const response = await googleAPI.googleLogin(idToken)
      
      console.log("Response:", response?.data)
      
      if (!response || !response.data) {
        throw new Error("No response from server")
      }
      
      const { access_token, refresh_token, user: userData } = response.data
      
      if (!access_token) {
        throw new Error("No access token received")
      }
      
      localStorage.setItem("access_token", access_token)
      if (refresh_token) {
        localStorage.setItem("refresh_token", refresh_token)
      }
      if (userData) {
        setUser(userData)
      }
      
      startTokenCheck()
      router.push("/dashboard")
    } catch (error: any) {
      console.error("Google login error:", error.response?.data || error.message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    if (tokenCheckInterval.current) {
      clearInterval(tokenCheckInterval.current)
      tokenCheckInterval.current = null
    }
    
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    setUser(null)
    router.push("/login")
  }

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem("access_token")
    
    if (!token) {
      setIsLoading(false)
      return
    }

    try {
      const response = await userAPI.getMyProfile()
      setUser(response.data.data.user)
      startTokenCheck()
    } catch (error) {
      console.error("Error fetching user:", error)
      localStorage.removeItem("access_token")
      localStorage.removeItem("refresh_token")
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateUser = useCallback((data: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...data } : null)
  }, [])

  const checkToken = async (): Promise<boolean> => {
    const token = localStorage.getItem("access_token")
    if (!token) return false
    
    try {
      const response = await authAPI.verifyToken()
      return response.data.valid === true
    } catch (error) {
      return false
    }
  }

  const startTokenCheck = () => {
    if (tokenCheckInterval.current) {
      clearInterval(tokenCheckInterval.current)
    }
    
    tokenCheckInterval.current = setInterval(async () => {
      const isValid = await checkToken()
      if (!isValid && user) {
        console.log("Token expired, attempting to refresh...")
        
        try {
          const refreshToken = localStorage.getItem("refresh_token")
          if (!refreshToken) {
            console.log("No refresh token, logging out...")
            logout()
            return
          }
          
          const response = await authAPI.refresh()
          const { access_token } = response.data
          localStorage.setItem("access_token", access_token)
          console.log("Token refreshed successfully")
        } catch (refreshError) {
          console.error("Failed to refresh token, logging out...")
          logout()
        }
      }
    }, 3600000)
  }

  useEffect(() => {
    return () => {
      if (tokenCheckInterval.current) {
        clearInterval(tokenCheckInterval.current)
      }
    }
  }, [])

  useEffect(() => {
    // Jangan fetch user di halaman callback (biar URL params yang handle)
    if (pathname !== '/auth/callback') {
      fetchUser()
    } else {
      setIsLoading(false)
    }
  }, [fetchUser, pathname])

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      login, 
      register, 
      loginWithGoogle,
      logout, 
      fetchUser, 
      updateUser, 
      checkToken,
      setUser
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}