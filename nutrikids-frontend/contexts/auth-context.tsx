"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { authService, type UserOut } from "@/lib/auth"

interface AuthContextType {
  user: UserOut | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserOut | null>(null)
  const [loading, setLoading] = useState(true)

  const isAuthenticated = !!user && authService.isAuthenticated()

  useEffect(() => {
    checkAuthStatus()

    // Escuchar evento de logout desde cualquier parte de la app
    const handleLogoutEvent = () => {
      logout()
    }

    window.addEventListener("logout", handleLogoutEvent)

    return () => {
      window.removeEventListener("logout", handleLogoutEvent)
    }
  }, [])

  const checkAuthStatus = async () => {
    try {
      if (authService.isAuthenticated()) {
        const userData = await authService.getCurrentUser()
        setUser(userData)
      }
    } catch (error) {
      console.error("Error checking auth status:", error)
      authService.logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      await authService.login({ email, password })
      const userData = await authService.getCurrentUser()
      setUser(userData)
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated,
      }}
    >
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
