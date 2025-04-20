"use client"

import { motion } from "framer-motion"
import { DM_Serif_Display } from "next/font/google"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { ScreenLabel } from "@/components/screen-label"
import { ContinueButton } from "@/components/continue-button"
import { containerVariants, itemVariants } from "@/lib/animation-variants"
import { apiClient } from "@/app/api/client"

const dmSerif = DM_Serif_Display({ weight: "400", subsets: ["latin"], variable: "--font-dm-serif" })

export function FinalWelcomeScreen() {
  const router = useRouter()
  
  const handleStartJournaling = () => {
    console.log("Start journaling")
    //updateOnboardedStatus
    apiClient.updateOnboardedStatus(true).then(() => {
      console.log("Onboarded status updated")
      router.push("/")
    })
  }

  return (
    <motion.div
      key="welcome"
      className="flex flex-col items-center justify-center text-center space-y-8 px-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <ScreenLabel number={6} />
      <motion.h1 className={cn("text-3xl md:text-4xl text-[#3a3a3a]", dmSerif.className)} variants={itemVariants}>
        Welcome to your space.
      </motion.h1>
      <motion.p className="text-[#5a5a5a] text-lg max-w-md" variants={itemVariants}>
        When you're ready, we'll guide you through your first step.
      </motion.p>
      <ContinueButton onClick={handleStartJournaling}>Start Journaling</ContinueButton>
    </motion.div>
  )
}
