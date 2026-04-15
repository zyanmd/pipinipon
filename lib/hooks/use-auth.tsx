"use client"

import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from "react"
import { authAPI, userAPI, googleAPI } from "@/lib/api"

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const tokenCheckInterval = useRef<NodeJS.Timeout | null>(null)

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await authAPI.login({ email, password })
      const { access_token, refresh_token, user } = response.data
      localStorage.setItem("access_token", access_token)
      localStorage.setItem("refresh_token", refresh_token)
      setUser(user)
      
      startTokenCheck()
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
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const loginWithGoogle = async (idToken: string) => {
    setIsLoading(true)
    try {
      const response = await googleAPI.loginWithGoogleToken(idToken)
      const { access_token, refresh_token, user } = response.data
      localStorage.setItem("access_token", access_token)
      localStorage.setItem("refresh_token", refresh_token)
      setUser(user)
      
      startTokenCheck()
    } catch (error) {
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
            throw new Error("No refresh token")
          }
          
          const response = await authAPI.refresh()
          const { access_token } = response.data
          localStorage.setItem("access_token", access_token)
          console.log("Token refreshed successfully")
        } catch (refreshError) {
          console.error("Failed to refresh token, logging out...")
          logout()
          if (typeof window !== "undefined") {
            window.location.href = "/login"
          }
        }
      }
    }, 3600000) // 1 jam
  }

  useEffect(() => {
    return () => {
      if (tokenCheckInterval.current) {
        clearInterval(tokenCheckInterval.current)
      }
    }
  }, [])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

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
      checkToken 
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