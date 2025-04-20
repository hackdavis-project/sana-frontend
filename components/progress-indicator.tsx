"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface ProgressIndicatorProps {
  totalSteps: number
  currentStep: number
}

export function ProgressIndicator({ totalSteps, currentStep }: ProgressIndicatorProps) {
  return (
    <div className="flex justify-center mb-12">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <motion.div
          key={index}
          className={cn("h-1 rounded-full mx-1", index <= currentStep ? "bg-[#ede9e3] w-8" : "bg-[#ede9e3]/30 w-4")}
          animate={{
            width: index <= currentStep ? 32 : 16,
            backgroundColor: index <= currentStep ? "rgba(237, 233, 227, 1)" : "rgba(237, 233, 227, 0.3)",
          }}
          transition={{ duration: 0.3 }}
        />
      ))}
    </div>
  )
}
