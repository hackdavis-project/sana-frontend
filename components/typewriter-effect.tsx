"use client"

import { useState, useEffect } from "react"

interface TypewriterEffectProps {
  text: string
  className?: string
  typingSpeed?: number
  delayAfterComplete?: number
  onComplete?: () => void
}

export function TypewriterEffect({
  text,
  className = "",
  typingSpeed = 50,
  delayAfterComplete = 1000,
  onComplete,
}: TypewriterEffectProps) {
  const [displayText, setDisplayText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    // Reset when text changes
    setDisplayText("")
    setCurrentIndex(0)
    setIsComplete(false)
  }, [text])

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex])
        setCurrentIndex((prev) => prev + 1)
      }, typingSpeed)
      
      return () => clearTimeout(timeout)
    } else if (!isComplete) {
      setIsComplete(true)
      
      if (onComplete) {
        const completeTimeout = setTimeout(() => {
          onComplete()
        }, delayAfterComplete)
        
        return () => clearTimeout(completeTimeout)
      }
    }
  }, [currentIndex, text, typingSpeed, delayAfterComplete, onComplete, isComplete])

  return <span className={className}>{displayText}</span>
}
