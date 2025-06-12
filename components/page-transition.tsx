"use client"

import type React from "react"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

interface PageTransitionProps {
  isTransitioning: boolean
  onTransitionComplete: () => void
  children: React.ReactNode
}

export default function PageTransition({ isTransitioning, onTransitionComplete, children }: PageTransitionProps) {
  const [showContent, setShowContent] = useState(!isTransitioning)

  useEffect(() => {
    if (isTransitioning) {
      setShowContent(false)
      // Увеличенная задержка для плавной анимации трансформации
      const timer = setTimeout(() => {
        setShowContent(true)
        onTransitionComplete()
      }, 1200)
      return () => clearTimeout(timer)
    }
  }, [isTransitioning, onTransitionComplete])

  return (
    <motion.div
      className="relative h-full w-full"
      initial={{ opacity: 0, filter: "blur(10px)" }}
      animate={{
        opacity: showContent ? 1 : 0,
        filter: showContent ? "blur(0px)" : "blur(10px)",
      }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  )
}
