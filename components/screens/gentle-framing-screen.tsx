"use client"

import { motion } from "framer-motion"
import { DM_Serif_Display } from "next/font/google"
import { cn } from "@/lib/utils"
import { ScreenLabel } from "@/components/screen-label"
import { ContinueButton } from "@/components/continue-button"
import { containerVariants, itemVariants } from "@/lib/animation-variants"

const dmSerif = DM_Serif_Display({ weight: "400", subsets: ["latin"], variable: "--font-dm-serif" })

interface GentleFramingScreenProps {
  onNext: () => void
}

export function GentleFramingScreen({ onNext }: GentleFramingScreenProps) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center text-center space-y-8 px-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <ScreenLabel number={2} />
      <motion.h2 className={cn("text-2xl md:text-3xl text-amber-800", dmSerif.className)} variants={itemVariants}>
        You don't have to explain everything now.
      </motion.h2>
      <motion.p className="text-gray-600 text-lg max-w-md" variants={itemVariants}>
        Over time, you'll have space to speak your truth, reflect on what happened, and explore similar stories from
        others who've felt like you.
      </motion.p>
      <ContinueButton onClick={onNext} variant="amber">Next</ContinueButton>
    </motion.div>
  )
}
