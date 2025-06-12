"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2 } from "lucide-react"
import { db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"

interface ConnectionIndicatorProps {
  isVisible: boolean
}

export default function ConnectionIndicator({ isVisible }: ConnectionIndicatorProps) {
  const [ping, setPing] = useState<number | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [isConnected, setIsConnected] = useState(true)

  const checkConnection = async () => {
    setIsChecking(true)
    const startTime = Date.now()

    try {
      // Пытаемся получить документ из Firestore для измерения пинга
      await getDoc(doc(db, "ping-test", "test"))
      const endTime = Date.now()
      const pingTime = endTime - startTime

      setPing(pingTime)
      setIsConnected(true)
    } catch (error) {
      console.error("Connection check failed:", error)
      setIsConnected(false)
      setPing(null)
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    if (isVisible) {
      // Автоматическая проверка при появлении
      setTimeout(() => {
        checkConnection()
      }, 500)
    }
  }, [isVisible])

  if (!isVisible) return null

  return (
    <motion.div
      className="fixed bottom-6 left-6 z-50"
      layoutId="login-form"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.button
        onClick={checkConnection}
        className="relative flex h-12 w-12 items-center justify-center rounded-full bg-[#1F2937] shadow-lg transition-all duration-200 hover:scale-110"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        style={{
          boxShadow: isConnected ? "0 0 20px rgba(16, 185, 129, 0.3)" : "0 0 20px rgba(239, 68, 68, 0.3)",
        }}
      >
        <AnimatePresence mode="wait">
          {isChecking ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, rotate: 0 }}
              animate={{ opacity: 1, rotate: 360 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Loader2 className="h-5 w-5 animate-spin text-[#3B82F6]" />
            </motion.div>
          ) : (
            <motion.div
              key="ping"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="text-xs font-bold text-[#E5E7EB] font-inter"
            >
              {ping !== null ? `${ping}` : isConnected ? "OK" : "ERR"}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </motion.div>
  )
}
