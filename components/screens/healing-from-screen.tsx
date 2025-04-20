"use client"

import { useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DM_Serif_Display } from "next/font/google"
import { cn } from "@/lib/utils"
import { ScreenLabel } from "@/components/screen-label"
import { ContinueButton } from "@/components/continue-button"
import { containerVariants, itemVariants, textVariants } from "@/lib/animation-variants"
import { useHealingExamples } from "./use-healing-examples"
import { useOnboardingState } from "@/hooks/use-onboarding-state"
import { TypewriterEffect } from "@/components/typewriter-effect"

const dmSerif = DM_Serif_Display({ weight: "400", subsets: ["latin"], variable: "--font-dm-serif" })

interface HealingFromScreenProps {
  onNext: () => void
}

export function HealingFromScreen({ onNext }: HealingFromScreenProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const { situation, setSituation } = useOnboardingState()
  const { exampleIndex, isFocused, setIsFocused, healingExamples } = useHealingExamples()

  return (
    <motion.div
      key="healing-examples"
      className="flex flex-col items-center justify-between h-full py-16 px-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <ScreenLabel number={3} />

      <div className="flex flex-col items-center space-y-8">
        <motion.h2 className={cn("text-2xl md:text-3xl text-amber-800", dmSerif.className)} variants={itemVariants}>
          I want to start healing from
        </motion.h2>

        <motion.div
          className="w-full max-w-md"
          variants={itemVariants}
          onClick={() => {
            if (inputRef.current) {
              inputRef.current.focus()
            }
          }}
        >
          <div className="relative">
            <textarea
              ref={inputRef}
              className="w-full p-4 border border-amber-200 rounded-xl bg-transparent focus:outline-none focus:ring-1 focus:ring-amber-300 resize-none text-center min-h-[80px]"
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              rows={3}
            />

            {!isFocused && !situation && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden px-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={exampleIndex}
                    className="text-gray-500/60 text-lg px-4"
                    initial="enter"
                    animate="center"
                    exit="exit"
                    variants={textVariants}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                  >
                    <TypewriterEffect 
                      text={healingExamples[exampleIndex]} 
                      typingSpeed={40} 
                      delayAfterComplete={3000} 
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <ContinueButton onClick={onNext} disabled={!situation.trim()} variant="amber">
        continue
      </ContinueButton>
    </motion.div>
  )
}
