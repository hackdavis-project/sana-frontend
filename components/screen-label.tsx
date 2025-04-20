"use client"

import { motion } from "framer-motion"

interface ScreenLabelProps {
  number: number
}

export function ScreenLabel({ number }: ScreenLabelProps) {
  return (
    <motion.div className="absolute top-4 left-4 bg-[#ede9e3] px-3 py-1 rounded-full text-sm text-[#5a5a5a]">
      Screen {number}
    </motion.div>
  )
}
