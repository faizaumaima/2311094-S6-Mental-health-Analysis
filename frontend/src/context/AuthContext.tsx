
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"

import type { User, LoginInput, RegisterInput } from "../types/auth"
import {
  login as loginService,
  register as registerService,
  getCurrentUser,
  logout as logoutService,
} from "../services/auth"
import { clearTokens } from "../services/http"

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (input: LoginInput) => Promise<void>
  signUp: (input: RegisterInput) => Promise<User>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function restoreSession() {
      try {
        const currentUser = await getCurrentUser()
        if (active) setUser(currentUser)
      } catch {
        clearTokens()
        if (active) setUser(null)
      } finally {
        if (active) setLoading(false)
      }
    }

    restoreSession()

    return () => {
      active = false
    }
  }, [])

  async function signIn(input: LoginInput) {
    await loginService(input)
    const currentUser = await getCurrentUser()
    setUser(currentUser)
  }

  async function signUp(input: RegisterInput) {
    return registerService(input)
  }

  async function signOut() {
    try {
      await logoutService()
    } finally {
      setUser(null)
    }
  }

  async function refreshUser() {
    const currentUser = await getCurrentUser()
    setUser(currentUser)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider")
  }

  return context
}
