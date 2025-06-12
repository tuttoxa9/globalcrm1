"use client"

import { useEffect, useRef } from "react"

interface BackgroundBlobProps {
  seed?: number
}

export default function BackgroundBlob({ seed = Math.random() * 1000 }: BackgroundBlobProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number
    let time = seed / 100 // Используем seed для начальной позиции

    // Set canvas dimensions
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Create gradient
    const createGradient = (x: number, y: number, radius: number) => {
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
      gradient.addColorStop(0, "rgba(79, 70, 229, 0.15)") // Indigo
      gradient.addColorStop(0.5, "rgba(59, 130, 246, 0.1)") // Blue
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)")
      return gradient
    }

    // Animation loop
    const animate = () => {
      time += 0.005
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Calculate blob position with slow movement
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const radius = Math.min(canvas.width, canvas.height) * 0.6

      const offsetX = Math.sin(time * 0.5) * canvas.width * 0.1
      const offsetY = Math.cos(time * 0.3) * canvas.height * 0.1

      const x = centerX + offsetX
      const y = centerY + offsetY

      // Draw blob
      ctx.fillStyle = createGradient(x, y, radius)
      ctx.beginPath()

      // Create a blob shape using bezier curves
      const points = 6
      const angleStep = (Math.PI * 2) / points

      for (let i = 0; i <= points; i++) {
        const angle = i * angleStep
        const radiusVariation = radius * (0.9 + Math.sin(time + i) * 0.1)

        const pointX = x + Math.cos(angle) * radiusVariation
        const pointY = y + Math.sin(angle) * radiusVariation

        if (i === 0) {
          ctx.moveTo(pointX, pointY)
        } else {
          const prevAngle = (i - 1) * angleStep
          const prevX = x + Math.cos(prevAngle) * radius * (0.9 + Math.sin(time + i - 1) * 0.1)
          const prevY = y + Math.sin(prevAngle) * radius * (0.9 + Math.sin(time + i - 1) * 0.1)

          const cp1x = prevX + (pointX - prevX) * 0.5
          const cp1y = prevY + (pointY - prevY) * 0.5

          ctx.quadraticCurveTo(cp1x, cp1y, pointX, pointY)
        }
      }

      ctx.closePath()
      ctx.fill()

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(animationFrameId)
    }
  }, [seed])

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" style={{ filter: "blur(120px)" }} />
}
