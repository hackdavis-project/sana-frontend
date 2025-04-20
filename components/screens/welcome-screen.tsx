"use client"

import { motion } from "framer-motion"
import { DM_Serif_Display } from "next/font/google"
import { cn } from "@/lib/utils"
import { ScreenLabel } from "@/components/screen-label"
import { ContinueButton } from "@/components/continue-button"
import { containerVariants, itemVariants } from "@/lib/animation-variants"

const dmSerif = DM_Serif_Display({ weight: "400", subsets: ["latin"], variable: "--font-dm-serif" })

interface WelcomeScreenProps {
  onNext: () => void
}

export function WelcomeScreen({ onNext }: WelcomeScreenProps) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center text-center space-y-8 px-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <ScreenLabel number={1} />
      <motion.h1 className={cn("text-3xl md:text-4xl text-[#3a3a3a]", dmSerif.className)} variants={itemVariants}>
        Your story matters.
      </motion.h1>
      <motion.p className="text-[#5a5a5a] text-lg max-w-md" variants={itemVariants}>
        This space was created to help you understand, express, and heal from what you've been through.
      </motion.p>
      <ContinueButton onClick={onNext}>Begin</ContinueButton>
    </motion.div>
  )
}
