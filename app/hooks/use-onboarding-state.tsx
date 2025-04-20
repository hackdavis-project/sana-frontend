"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface OnboardingState {
  situation: string
  setSituation: (situation: string) => void
  expressionMethod: "speak" | "write" | null
  setExpressionMethod: (method: "speak" | "write" | null) => void
  comfortLevel: string | null
  setComfortLevel: (level: string | null) => void
}

const OnboardingContext = createContext<OnboardingState | undefined>(undefined)

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [situation, setSituation] = useState("")
  const [expressionMethod, setExpressionMethod] = useState<"speak" | "write" | null>(null)
  const [comfortLevel, setComfortLevel] = useState<string | null>(null)

  return (
    <OnboardingContext.Provider
      value={{
        situation,
        setSituation,
        expressionMethod,
        setExpressionMethod,
        comfortLevel,
        setComfortLevel,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboardingState() {
  const context = useContext(OnboardingContext)
  if (context === undefined) {
    throw new Error("useOnboardingState must be used within an OnboardingProvider")
  }
  return context
}
