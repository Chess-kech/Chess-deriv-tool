"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"

interface AuthContextType {
  isAuthenticated: boolean
  login: (username: string, password: string) => boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const VALID_CREDENTIALS = [
  { username: "user1", password: "pass1" },
  { username: "user2", password: "pass2" },
  { username: "admin", password: "adminpassword" },
]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const storedAuth = localStorage.getItem("deriv-auth")
    if (storedAuth === "authenticated") {
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [])

  const login = useCallback(
    (username: string, password: string) => {
      const isValid = VALID_CREDENTIALS.some((cred) => cred.username === username && cred.password === password)
      if (isValid) {
        setIsAuthenticated(true)
        localStorage.setItem("deriv-auth", "authenticated")
        router.push("/analyzer") // Redirect to analyzer page on successful login
        return true
      }
      return false
    },
    [router],
  )

  const logout = useCallback(() => {
    setIsAuthenticated(false)
    localStorage.removeItem("deriv-auth")
    router.push("/login") // Redirect to login page on logout
  }, [router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return <AuthContext.Provider value={{ isAuthenticated, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
