"use client"

import { AnimatePresence, motion } from "motion/react"
import { CheckCircle, Sparkles } from "lucide-react"
import React, { useEffect } from "react"

import type { LevelUpToastProps } from "../../types/Toasts.types"

const LevelUpToast: React.FC<LevelUpToastProps> = ({
  level,
  show,
  onClose,
}) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 4000)
      return () => clearTimeout(timer)
    }
    return undefined // or return () => {} (an empty function)
  }, [show, onClose])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-4 rounded-xl bg-gradient-to-r from-green-600 to-blue-500 px-6 py-4 text-white shadow-xl"
        >
          <Sparkles size={32} className="animate-ping-slow text-yellow-300" />
          <div>
            <h4 className="text-lg font-bold">🎉 Level Up!</h4>
            <p className="text-sm">You’ve reached Level {level}!</p>
          </div>
          <CheckCircle size={24} className="ml-2 text-white" />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default LevelUpToast
