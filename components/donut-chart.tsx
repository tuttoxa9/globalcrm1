"use client"

import { motion } from "framer-motion"

interface DonutChartProps {
  newRequests: number
  accepted: number
  rejected: number
  color: string
  isHovered: boolean
}

export default function DonutChart({ newRequests, accepted, rejected, color, isHovered }: DonutChartProps) {
  // Проверяем и нормализуем входные данные
  const safeNewRequests = Math.max(0, Number(newRequests) || 0)
  const safeAccepted = Math.max(0, Number(accepted) || 0)
  const safeRejected = Math.max(0, Number(rejected) || 0)

  const total = safeNewRequests + safeAccepted + safeRejected
  const radius = 32 // Уменьшено с 45 до 32
  const strokeWidth = 6 // Уменьшено с 8 до 6
  const normalizedRadius = radius - strokeWidth * 2
  const circumference = normalizedRadius * 2 * Math.PI

  // Если нет данных, показываем пустой круг
  if (total === 0) {
    return (
      <div className="relative">
        <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            stroke="#374151"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>

        {/* Center number */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{
            scale: isHovered ? 1.1 : 1,
          }}
          transition={{ duration: 0.3 }}
        >
          <span
            className="text-lg font-bold font-inter text-white" // Уменьшено с text-2xl до text-lg, цвет изменен на белый
            style={{
              textShadow: isHovered ? `0 0 10px #ffffff60` : "none",
            }}
          >
            0
          </span>
        </motion.div>
      </div>
    )
  }

  // Calculate percentages
  const newPercentage = (safeNewRequests / total) * 100
  const acceptedPercentage = (safeAccepted / total) * 100
  const rejectedPercentage = (safeRejected / total) * 100

  // Calculate stroke dash arrays - добавляем проверки на NaN
  const newStrokeDasharray = isNaN(newPercentage)
    ? `0 ${circumference}`
    : `${(newPercentage / 100) * circumference} ${circumference}`

  const acceptedStrokeDasharray = isNaN(acceptedPercentage)
    ? `0 ${circumference}`
    : `${(acceptedPercentage / 100) * circumference} ${circumference}`

  const rejectedStrokeDasharray = isNaN(rejectedPercentage)
    ? `0 ${circumference}`
    : `${(rejectedPercentage / 100) * circumference} ${circumference}`

  // Calculate stroke dash offsets - добавляем проверки на NaN
  const acceptedOffset = isNaN(newPercentage) ? 0 : -((newPercentage / 100) * circumference)

  const rejectedOffset = isNaN(newPercentage + acceptedPercentage)
    ? 0
    : -(((newPercentage + acceptedPercentage) / 100) * circumference)

  return (
    <div className="relative">
      <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          stroke="#374151"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />

        {/* Rejected segment */}
        {safeRejected > 0 && (
          <motion.circle
            stroke="#3B82F6"
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={rejectedStrokeDasharray}
            strokeDashoffset={rejectedOffset}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            initial={{ strokeDasharray: rejectedStrokeDasharray }}
            animate={{
              strokeDasharray: isHovered
                ? `${(rejectedPercentage / 100) * ((normalizedRadius + 2) * 2 * Math.PI)} ${(normalizedRadius + 2) * 2 * Math.PI}`
                : rejectedStrokeDasharray,
              r: isHovered ? normalizedRadius + 2 : normalizedRadius,
              strokeDashoffset: isHovered
                ? -((newPercentage + acceptedPercentage) / 100) * ((normalizedRadius + 2) * 2 * Math.PI)
                : rejectedOffset
            }}
            transition={{ duration: 0.3 }}
          />
        )}

        {/* Accepted segment */}
        {safeAccepted > 0 && (
          <motion.circle
            stroke="#3B82F6"
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={acceptedStrokeDasharray}
            strokeDashoffset={acceptedOffset}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            initial={{ strokeDasharray: acceptedStrokeDasharray }}
            animate={{
              strokeDasharray: isHovered
                ? `${(acceptedPercentage / 100) * ((normalizedRadius + 2) * 2 * Math.PI)} ${(normalizedRadius + 2) * 2 * Math.PI}`
                : acceptedStrokeDasharray,
              r: isHovered ? normalizedRadius + 2 : normalizedRadius,
              strokeDashoffset: isHovered
                ? -(newPercentage / 100) * ((normalizedRadius + 2) * 2 * Math.PI)
                : acceptedOffset
            }}
            transition={{ duration: 0.3 }}
          />
        )}

        {/* New requests segment (highlighted) */}
        {safeNewRequests > 0 && (
          <motion.circle
            stroke="#3B82F6"
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={newStrokeDasharray}
            strokeDashoffset={0}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            initial={{ strokeDasharray: newStrokeDasharray }}
            animate={{
              strokeDasharray: isHovered
                ? `${(newPercentage / 100) * ((normalizedRadius + 2) * 2 * Math.PI)} ${(normalizedRadius + 2) * 2 * Math.PI}`
                : newStrokeDasharray,
              r: isHovered ? normalizedRadius + 2 : normalizedRadius,
            }}
            transition={{ duration: 0.3 }}
            style={{
              filter: isHovered ? `drop-shadow(0 0 8px #3B82F660)` : "none",
            }}
          />
        )}
      </svg>

      {/* Center number */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{
          scale: isHovered ? 1.1 : 1,
        }}
        transition={{ duration: 0.3 }}
      >
        <span
          className="text-lg font-bold font-inter text-white" // Уменьшено с text-2xl до text-lg, цвет изменен на белый
          style={{
            textShadow: isHovered ? `0 0 10px #ffffff60` : "none",
          }}
        >
          {safeNewRequests}
        </span>
      </motion.div>
    </div>
  )
}
