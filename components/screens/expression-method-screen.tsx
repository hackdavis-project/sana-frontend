"use client"

import { motion } from "framer-motion"
import { Mic, Keyboard } from "lucide-react"
import { DM_Serif_Display } from "next/font/google"
import { cn } from "@/lib/utils"
import { ScreenLabel } from "@/components/screen-label"
import { ContinueButton } from "@/components/continue-button"
import { containerVariants, itemVariants, optionVariants } from "@/lib/animation-variants"
import { useOnboardingState } from "@/hooks/use-onboarding-state"

const dmSerif = DM_Serif_Display({ weight: "400", subsets: ["latin"], variable: "--font-dm-serif" })

interface ExpressionMethodScreenProps {
  onNext: () => void
}

export function ExpressionMethodScreen({ onNext }: ExpressionMethodScreenProps) {
  const { expressionMethod, setExpressionMethod } = useOnboardingState()

  return (
    <motion.div
      key="express"
      className="flex flex-col items-center justify-center text-center space-y-8 px-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <ScreenLabel number={4} />
      <motion.h2 className={cn("text-2xl md:text-3xl text-amber-800", dmSerif.className)} variants={itemVariants}>
        How would you like to start expressing yourself?
      </motion.h2>
      <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-md" variants={itemVariants}>
        <motion.div
          className={cn(
            "p-6 rounded-xl cursor-pointer flex flex-col items-center space-y-3",
            expressionMethod === "speak" ? "ring-2 ring-amber-300 bg-amber-50" : "bg-gray-100",
          )}
          variants={optionVariants}
          animate={expressionMethod === "speak" ? "selected" : "unselected"}
          onClick={() => setExpressionMethod("speak")}
          whileHover={{ scale: 1.02 }}
        >
          <Mic size={32} className="text-amber-700" />
          <p className="text-gray-700">I want to speak it out loud</p>
        </motion.div>
        <motion.div
          className={cn(
            "p-6 rounded-xl cursor-pointer flex flex-col items-center space-y-3",
            expressionMethod === "write" ? "ring-2 ring-amber-300 bg-amber-50" : "bg-gray-100",
          )}
          variants={optionVariants}
          animate={expressionMethod === "write" ? "selected" : "unselected"}
          onClick={() => setExpressionMethod("write")}
          whileHover={{ scale: 1.02 }}
        >
          <Keyboard size={32} className="text-amber-700" />
          <p className="text-gray-700">I prefer to write it down</p>
        </motion.div>
      </motion.div>
      <ContinueButton onClick={onNext} disabled={!expressionMethod} variant="amber" />
    </motion.div>
  )
}
