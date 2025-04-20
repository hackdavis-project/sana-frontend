"use client"

import { motion } from "framer-motion"
import { DM_Serif_Display } from "next/font/google"
import { cn } from "@/lib/utils"
import { ScreenLabel } from "@/components/screen-label"
import { ContinueButton } from "@/components/continue-button"
import { containerVariants, itemVariants, optionVariants } from "@/lib/animation-variants"
import { useOnboardingState } from "@/hooks/use-onboarding-state"

const dmSerif = DM_Serif_Display({ weight: "400", subsets: ["latin"], variable: "--font-dm-serif" })

interface EmotionalBoundariesScreenProps {
  onNext: () => void
}

export function EmotionalBoundariesScreen({ onNext }: EmotionalBoundariesScreenProps) {
  const { comfortLevel, setComfortLevel } = useOnboardingState()

  const comfortOptions = ["Light / hopeful tone only", "Honest but not graphic", "I'll decide on a case-by-case basis"]

  return (
    <motion.div
      key="boundaries"
      className="flex flex-col items-center justify-center text-center space-y-8 px-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <ScreenLabel number={5} />
      <motion.h2 className={cn("text-2xl md:text-3xl text-[#3a3a3a]", dmSerif.className)} variants={itemVariants}>
        What kind of stories are you comfortable seeing from others?
      </motion.h2>
      <motion.div className="flex flex-col space-y-3 w-full max-w-md" variants={itemVariants}>
        {comfortOptions.map((option) => (
          <motion.div
            key={option}
            className={cn(
              "p-4 rounded-xl cursor-pointer flex items-center",
              comfortLevel === option ? "bg-[#f7f4ef] ring-2 ring-[#ede9e3]" : "bg-white",
            )}
            variants={optionVariants}
            animate={comfortLevel === option ? "selected" : "unselected"}
            onClick={() => setComfortLevel(option)}
            whileHover={{ scale: 1.01 }}
          >
            <div
              className={cn(
                "w-5 h-5 rounded-full mr-3 border-2 border-[#ede9e3] flex items-center justify-center",
                comfortLevel === option ? "border-[#ede9e3]" : "",
              )}
            >
              {comfortLevel === option && <div className="w-3 h-3 rounded-full bg-[#ede9e3]" />}
            </div>
            <p>{option}</p>
          </motion.div>
        ))}
      </motion.div>
      <motion.p className="text-sm text-[#8a8a8a]" variants={itemVariants}>
        You can always change this later.
      </motion.p>
      <ContinueButton onClick={onNext} disabled={!comfortLevel}>
        Set Preferences
      </ContinueButton>
    </motion.div>
  )
}
