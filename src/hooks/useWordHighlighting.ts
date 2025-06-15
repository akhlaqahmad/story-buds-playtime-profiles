
import { useState, useRef } from 'react'

export const useWordHighlighting = () => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const words = useRef<string[]>([])
  const highlightInterval = useRef<NodeJS.Timeout | null>(null)

  const startHighlighting = (content: string, durationMs: number) => {
    // Split content into words for highlighting
    words.current = content
      .replace(/[.!?]+/g, " .")
      .split(/\s+/)
      .filter((w) => w.length > 0)

    const highlightMs = durationMs / words.current.length
    let index = 0

    highlightInterval.current = setInterval(() => {
      setCurrentWordIndex(index)
      index++
      if (index >= words.current.length) {
        clearInterval(highlightInterval.current!)
      }
    }, highlightMs)
  }

  const stopHighlighting = () => {
    if (highlightInterval.current) {
      clearInterval(highlightInterval.current)
      highlightInterval.current = null
    }
  }

  const resetHighlighting = () => {
    stopHighlighting()
    setCurrentWordIndex(0)
  }

  return {
    currentWordIndex,
    words: words.current,
    startHighlighting,
    stopHighlighting,
    resetHighlighting
  }
}
