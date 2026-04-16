"use client"

import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from "react"
import { authAPI, userAPI, googleAPI } from "@/lib/api"
import { useRouter } from "next/navigation"

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
      console.log("Token length:", idToken?.length)
      
      const response = await googleAPI.loginWithGoogleToken(idToken)
      
      console.log("Raw response:", response)
      console.log("Response data:", response?.data)
      
      if (!response) {
        throw new Error("No response from server - possible network error")
      }
      
      if (!response.data) {
        throw new Error("No data in response - backend error")
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
      console.error("Google login error FULL:", error)
      console.error("Error message:", error.message)
      console.error("Error response:", error.response)
      console.error("Error response data:", error.response?.data)
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