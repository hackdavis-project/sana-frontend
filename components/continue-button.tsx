"use client"

import type React from "react"

import { motion } from "framer-motion"
import { ChevronRight } from "lucide-react"
import { buttonVariants } from "@/lib/animation-variants"

interface ContinueButtonProps {
  onClick: () => void
  disabled?: boolean
  children?: React.ReactNode
  variant?: "default" | "minimal"
}

export function ContinueButton({
  onClick,
  disabled = false,
  children = "Continue",
  variant = "default",
}: ContinueButtonProps) {
  if (variant === "minimal") {
    return (
      <motion.button
        className="mt-8 bg-[#ede9e3] text-[#3a3a3a] px-12 py-3 rounded-full shadow-sm"
        onClick={onClick}
        variants={buttonVariants}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        disabled={disabled}
      >
        <span>{children}</span>
      </motion.button>
    )
  }

  return (
    <motion.button
      className="mt-8 bg-[#f7f4ef] text-[#3a3a3a] px-8 py-3 rounded-full shadow-sm flex items-center space-x-2"
      onClick={onClick}
      variants={buttonVariants}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      disabled={disabled}
    >
      <span>{children}</span>
      <ChevronRight size={16} />
    </motion.button>
  )
}
