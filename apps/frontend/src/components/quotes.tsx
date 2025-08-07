"use client"

import { useEffect, useState } from "react"

const QUOTES = [
  "Accountability breeds response-ability. — Stephen R. Covey",
  "Discipline is the bridge between goals and accomplishment. — Jim Rohn",
  "It takes discipline to follow through. — John C. Maxwell",
  "The price of greatness is responsibility. — Winston Churchill",
  "With great power comes great accountability. — Unknown",
] as const

const TYPING_SPEED_MS = 50
const DISPLAY_DURATION_MS = 3000

export function Quotes() {
  const [quoteIndex, setQuoteIndex] = useState(0)
  const [displayedText, setDisplayedText] = useState("")
  const [charIndex, setCharIndex] = useState(0)

  useEffect(() => {
    const current = QUOTES[quoteIndex]
    if (!current) {
      return
    }

    // TYPE each character
    if (charIndex < current.length) {
      const timer = setTimeout(() => {
        setDisplayedText((prev) => prev + current[charIndex])
        setCharIndex((prev) => prev + 1)
      }, TYPING_SPEED_MS)
      return () => clearTimeout(timer)
    }

    // PAUSE before cycling to next quote
    const pauseTimer = setTimeout(() => {
      setDisplayedText("")
      setCharIndex(0)
      setQuoteIndex((prev) => (prev + 1) % QUOTES.length)
    }, DISPLAY_DURATION_MS)
    return () => clearTimeout(pauseTimer)
  }, [charIndex, quoteIndex])

  return (
    <div
      className="mt-6 min-h-[40px] text-center"
      role="status"
      aria-live="polite"
    >
      <p className="text-lg text-muted-foreground italic">
        {displayedText}
        <span className="animate-pulse text-primary">|</span>
      </p>
    </div>
  )
}
