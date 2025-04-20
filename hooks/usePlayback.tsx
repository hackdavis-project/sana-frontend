"use client"

import { useState, useEffect } from "react"

export function usePlayback(isSaved: boolean, playButtonReady: boolean) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPlayButtonLoading, setIsPlayButtonLoading] = useState(false)
  const [playbackTime, setPlaybackTime] = useState(0)
  const [playbackInterval, setPlaybackInterval] = useState<NodeJS.Timeout | null>(null)

  // Handle play button click
  const handlePlayClick = () => {
    if (!isSaved || !playButtonReady) return

    setIsPlaying(!isPlaying)

    if (!isPlaying) {
      // Start listening and timer
      alert("Starting to listen to journal entry")
      setPlaybackTime(0)
      const interval = setInterval(() => {
        setPlaybackTime((prev) => prev + 1)
      }, 1000)
      setPlaybackInterval(interval)
    } else {
      // Stop listening and timer
      alert("Stopping listening")
      if (playbackInterval) {
        clearInterval(playbackInterval)
        setPlaybackInterval(null)
      }
      setPlaybackTime(0)
    }
  }

  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  // Cleanup playback interval on unmount
  useEffect(() => {
    return () => {
      if (playbackInterval) {
        clearInterval(playbackInterval)
      }
    }
  }, [playbackInterval])

  return {
    isPlaying,
    isPlayButtonLoading,
    playbackTime,
    formatTime,
    handlePlayClick,
    setIsPlaying,
    setIsPlayButtonLoading,
  }
}
