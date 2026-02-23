import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react"
import { api, type AppUser } from "./api"

interface AuthContextValue {
  user: AppUser | null
  setUser: (u: AppUser | null) => void
  pendingEmail: string
  setPendingEmail: (e: string) => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<AppUser | null>(null)
  const [pendingEmail, setPendingEmailState] = useState<string>(
    () => sessionStorage.getItem("denuchange_pending_email") ?? ""
  )
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    api
      .me()
      .then((u) => setUserState(u))
      .catch(() => setUserState(null))
      .finally(() => setIsLoading(false))
  }, [])

  function setUser(u: AppUser | null) {
    setUserState(u)
  }

  function setPendingEmail(e: string) {
    sessionStorage.setItem("denuchange_pending_email", e)
    setPendingEmailState(e)
  }

  return (
    <AuthContext.Provider value={{ user, setUser, pendingEmail, setPendingEmail, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
