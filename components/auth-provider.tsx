"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"

interface AuthContextType {
  isAuthenticated: boolean
  login: (username: string, password: string) => boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const VALID_CREDENTIALS = [
  { username: "user1", password: "password1" },
  { username: "admin", password: "adminpassword" },
  { username: "test", password: "testpassword" },
]

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("auth_token")
    if (token === "authenticated") {
      setIsAuthenticated(true)
    }
  }, [])

  const login = (username: string, password: string) => {
    const isValid = VALID_CREDENTIALS.some((cred) => cred.username === username && cred.password === password)
    if (isValid) {
      localStorage.setItem("auth_token", "authenticated")
      setIsAuthenticated(true)
      router.push("/analyzer") // Redirect to analyzer page on successful login
      return true
    }
    return false
  }

  const logout = () => {
    localStorage.removeItem("auth_token")
    setIsAuthenticated(false)
    router.push("/login")
  }

  return <AuthContext.Provider value={{ isAuthenticated, login, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
