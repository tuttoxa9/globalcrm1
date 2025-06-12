"use client"

import { motion } from "framer-motion"
import { TrendingUp, Clock, CheckCircle, XCircle, Calendar, CalendarDays } from "lucide-react"
import { useState } from "react"
import DateRangePicker from "./date-range-picker"

interface Request {
  id: string
  projectId: string
  title: string
  clientName: string
  phone: string
  comment: string
  status: "new" | "accepted" | "rejected"
  createdAt: Date
  updatedAt: Date
}

interface ProjectStatsProps {
  requests: Request[]
  period: "all" | "today" | "week" | "month" | "custom"
  onPeriodChange: (period: "all" | "today" | "week" | "month" | "custom") => void
  customDateRange?: { start: Date; end: Date } | null
  onCustomDateRangeChange?: (start: Date, end: Date) => void
}

export default function ProjectStats({
  requests,
  period,
  onPeriodChange,
  customDateRange,
  onCustomDateRangeChange,
}: ProjectStatsProps) {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)

  // Фильтрация запросов по выбранному периоду
  const filteredRequests = requests.filter((request) => {
    const now = new Date()
    const requestDate = new Date(request.createdAt)

    switch (period) {
      case "today":
        return requestDate.toDateString() === now.toDateString()
      case "week": {
        const weekAgo = new Date(now)
        weekAgo.setDate(now.getDate() - 7)
        return requestDate >= weekAgo
      }
      case "month": {
        const monthAgo = new Date(now)
        monthAgo.setMonth(now.getMonth() - 1)
        return requestDate >= monthAgo
      }
      case "custom": {
        if (!customDateRange) return true
        return requestDate >= customDateRange.start && requestDate <= customDateRange.end
      }
      default:
        return true // "all" - показываем все
    }
  })

  const stats = {
    total: filteredRequests.length,
    new: filteredRequests.filter((r) => r.status === "new").length,
    accepted: filteredRequests.filter((r) => r.status === "accepted").length,
    rejected: filteredRequests.filter((r) => r.status === "rejected").length,
  }

  const acceptanceRate = stats.total > 0 ? Math.round((stats.accepted / stats.total) * 100) : 0
  const rejectionRate = stats.total > 0 ? Math.round((stats.rejected / stats.total) * 100) : 0
  const pendingRate = stats.total > 0 ? Math.round((stats.new / stats.total) * 100) : 0

  const todayRequests = requests.filter((r) => {
    const today = new Date()
    const requestDate = new Date(r.createdAt)
    return requestDate.toDateString() === today.toDateString()
  }).length

  const statItems = [
    {
      label: "Всего",
      value: stats.total,
      icon: TrendingUp,
      color: "#3B82F6",
      bgColor: "rgba(59, 130, 246, 0.1)",
      description: `${stats.total} заявок`,
    },
    {
      label: "Новые",
      value: stats.new,
      icon: Clock,
      color: "#F59E0B",
      bgColor: "rgba(245, 158, 11, 0.1)",
      description: `${pendingRate}%`,
    },
    {
      label: "Принято",
      value: stats.accepted,
      icon: CheckCircle,
      color: "#10B981",
      bgColor: "rgba(16, 185, 129, 0.1)",
      description: `${acceptanceRate}%`,
    },
    {
      label: "Отказано",
      value: stats.rejected,
      icon: XCircle,
      color: "#EF4444",
      bgColor: "rgba(239, 68, 68, 0.1)",
      description: `${rejectionRate}%`,
    },
  ]

  const periodLabels = {
    all: "За всё время",
    today: "За сегодня",
    week: "За неделю",
    month: "За месяц",
    custom: customDateRange
      ? `${customDateRange.start.toLocaleDateString("ru-RU")} - ${customDateRange.end.toLocaleDateString("ru-RU")}`
      : "Выбрать период",
  }

  const handleDateRangeSelect = (start: Date, end: Date) => {
    onCustomDateRangeChange?.(start, end)
    onPeriodChange("custom")
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      {/* Заголовок с выбором периода */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-[#3B82F6] p-2">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-[#E5E7EB] font-inter">Статистика</h3>
            <p className="text-sm text-[#9CA3AF] font-inter">{periodLabels[period]}</p>
          </div>
        </div>

        {/* Переключатель периода */}
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {[
              { id: "all", label: "Всё" },
              { id: "today", label: "Сегодня" },
              { id: "week", label: "Неделя" },
              { id: "month", label: "Месяц" },
            ].map((item) => (
              <motion.button
                key={item.id}
                onClick={() => onPeriodChange(item.id as "all" | "today" | "week" | "month")}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                  period === item.id
                    ? "bg-[#3B82F6] text-white shadow-md"
                    : "bg-[#4A5568] text-[#CBD5E0] hover:bg-[#374151]"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {item.label}
              </motion.button>
            ))}
          </div>

          <motion.button
            onClick={() => setIsDatePickerOpen(true)}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
              period === "custom"
                ? "bg-[#3B82F6] text-white shadow-md"
                : "bg-[#4A5568] text-[#CBD5E0] hover:bg-[#374151]"
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <CalendarDays className="h-4 w-4" />
            Период
          </motion.button>
        </div>

        {/* Информация о сегодняшних заявках */}
        {period === "all" && todayRequests > 0 && (
          <div className="flex items-center gap-2 rounded-lg bg-[#1F2937] px-4 py-2 border border-[#4A5568]">
            <Calendar className="h-4 w-4 text-[#3B82F6]" />
            <span className="text-sm text-[#E5E7EB] font-inter">
              Сегодня: <span className="font-semibold text-[#3B82F6]">{todayRequests}</span> новых
            </span>
          </div>
        )}
      </div>

      {/* Карточки статистики */}
      <div className="grid grid-cols-4 gap-4">
        {statItems.map((item, index) => (
          <motion.div
            key={item.label}
            className="group relative rounded-xl bg-gradient-to-br from-[#1F2937] to-[#111827] p-4 shadow-lg border border-[#374151]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            whileHover={{ y: -2, scale: 1.02 }}
          >
            {/* Цветная полоска сверху */}
            <div className="absolute left-0 top-0 h-1 w-full rounded-t-xl" style={{ backgroundColor: item.color }} />

            <div className="space-y-3">
              {/* Иконка и значение */}
              <div className="flex items-center justify-between">
                <motion.div
                  className="rounded-lg p-2"
                  style={{ backgroundColor: item.bgColor }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.05 + 0.2, duration: 0.2 }}
                >
                  <item.icon className="h-4 w-4" style={{ color: item.color }} />
                </motion.div>

                <motion.p
                  className="text-2xl font-bold text-[#E5E7EB] font-inter"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.05 + 0.3, duration: 0.2 }}
                >
                  {item.value}
                </motion.p>
              </div>

              {/* Название и описание */}
              <div>
                <p className="text-sm font-medium text-[#E5E7EB] font-inter">{item.label}</p>
                <p className="text-sm text-[#9CA3AF] font-inter">{item.description}</p>
              </div>
            </div>

            {/* Hover эффект */}
            <motion.div
              className="absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{
                background: `linear-gradient(135deg, ${item.color}08 0%, transparent 50%)`,
              }}
            />
          </motion.div>
        ))}
      </div>

      {/* Date Range Picker */}
      <DateRangePicker
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        onDateRangeSelect={handleDateRangeSelect}
        currentRange={customDateRange}
      />
    </div>
  )
}
