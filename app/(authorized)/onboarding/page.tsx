"use client"

import { useState } from "react"
import { AnimatePresence } from "framer-motion"
import { ProgressIndicator } from "@/components/progress-indicator"
import { WelcomeScreen } from "@/components/screens/welcome-screen"
import { GentleFramingScreen } from "@/components/screens/gentle-framing-screen"
import { HealingFromScreen } from "@/components/screens/healing-from-screen"
import { ExpressionMethodScreen } from "@/components/screens/expression-method-screen"
import { EmotionalBoundariesScreen } from "@/components/screens/emotional-boundaries-screen"
import { FinalWelcomeScreen } from "@/components/screens/final-welcome-screen"
import { OnboardingProvider, useOnboardingState } from "@/hooks/use-onboarding-state"

function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState(0)
  const { situation, expressionMethod, comfortLevel } = useOnboardingState()

  const nextStep = () => {
    setCurrentStep((prev) => prev + 1)
  }

  const screens = [
    <WelcomeScreen key="welcome" onNext={nextStep} />,
    <GentleFramingScreen key="framing" onNext={nextStep} />,
    <HealingFromScreen key="healing" onNext={nextStep} />,
    <ExpressionMethodScreen key="expression" onNext={nextStep} />,
    <EmotionalBoundariesScreen key="boundaries" onNext={nextStep} />,
    <FinalWelcomeScreen key="final" />,
  ]

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        <ProgressIndicator totalSteps={screens.length} currentStep={currentStep} />

        <div className="relative h-[500px] flex items-center justify-center">
          <AnimatePresence mode="wait">{screens[currentStep]}</AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <OnboardingProvider>
      <OnboardingFlow />
    </OnboardingProvider>
  )
}
