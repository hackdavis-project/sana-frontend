"use client"

import { useState, useEffect } from "react"
import { useOnboardingState } from "@/hooks/use-onboarding-state"

export function useHealingExamples() {
  const [exampleIndex, setExampleIndex] = useState(0)
  const [isFocused, setIsFocused] = useState(false)
  const { situation } = useOnboardingState()

  const healingExamples = [
    "…something I still haven't told anyone.",
    "…a relationship that made me feel small.",
    "…a situation I didn't realize was trauma until later.",
    "…the way I was treated by someone close to me.",
    "…emotional abuse that still affects me.",
    "…feeling manipulated and silenced.",
    "…something I've been carrying for too long.",
    "…words that hurt more than they should have.",
    "…feeling like I was never allowed to speak up.",
    "…a toxic dynamic I escaped.",
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isFocused && !situation) {
        setExampleIndex((prev) => (prev + 1) % healingExamples.length)
      }
    }, 6000) // Increased from 3000ms to 6000ms for slower transitions

    return () => clearInterval(interval)
  }, [isFocused, situation, healingExamples.length])

  return {
    exampleIndex,
    isFocused,
    setIsFocused,
    healingExamples,
  }
}
