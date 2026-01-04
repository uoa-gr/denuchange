import { createContext, useContext, type ReactNode } from "react"

type Theme = "light" | "dark" | "system"

type ThemeProviderContextType = {
  theme: Theme
  resolvedTheme: "light" | "dark"
  setTheme: (theme: Theme) => void
}

const ThemeProviderContext = createContext<ThemeProviderContextType>({
  theme: "light",
  resolvedTheme: "light",
  setTheme: () => {},
})

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Simple light-only theme for this workshop site
  return (
    <ThemeProviderContext.Provider
      value={{
        theme: "light",
        resolvedTheme: "light",
        setTheme: () => {},
      }}
    >
      {children}
    </ThemeProviderContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeProviderContext)
}

