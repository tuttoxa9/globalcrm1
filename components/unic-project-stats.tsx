"use client"

import { motion } from "framer-motion"
import { TrendingUp, Clock, CheckCircle, XCircle, Calendar, CalendarDays, BarChart3 } from "lucide-react"
import { useState } from "react"
import DateRangePicker from "./date-range-picker"
import AdvancedStatsModal from "./advanced-stats-modal"

interface UnicProjectStatsProps {
  statistics: any
  period: "all" | "today" | "week" | "month" | "custom"
  onPeriodChange: (period: "all" | "today" | "week" | "month" | "custom") => void
  customDateRange?: { start: Date; end: Date } | null
  onCustomDateRangeChange?: (start: Date, end: Date) => void
}

export default function UnicProjectStats({
  statistics,
  period,
  onPeriodChange,
  customDateRange,
  onCustomDateRangeChange,
}: UnicProjectStatsProps) {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [isAdvancedStatsOpen, setIsAdvancedStatsOpen] = useState(false)

  if (!statistics) {
    return (
      <motion.div
        className="max-w-5xl mx-auto space-y-4"
        initial={{ opacity: 0, filter: "blur(10px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="h-8 bg-[#374151] rounded mb-4 opacity-50"></div>
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-[#374151] rounded opacity-50"></div>
          ))}
        </div>
      </motion.div>
    )
  }

  const { total, today, thisWeek, thisMonth } = statistics

  // Выбираем данные в зависимости от периода
  const currentStats = (() => {
    switch (period) {
      case "today":
        return today
      case "week":
        return thisWeek
      case "month":
        return thisMonth
      default:
        return total
    }
  })()

  const statItems = [
    {
      label: "Всего",
      value: currentStats.count || currentStats.all || 0,
      icon: TrendingUp,
      color: "#3B82F6",
      bgColor: "rgba(59, 130, 246, 0.1)",
      description: `${currentStats.count || currentStats.all || 0} заявок`,
    },
    {
      label: "Новые",
      value: currentStats.new || 0,
      icon: Clock,
      color: "#F59E0B",
      bgColor: "rgba(245, 158, 11, 0.1)",
      description: `${Math.round(((currentStats.new || 0) / Math.max(currentStats.count || currentStats.all || 1, 1)) * 100)}%`,
    },
    {
      label: "Принято",
      value: currentStats.accepted || 0,
      icon: CheckCircle,
      color: "#10B981",
      bgColor: "rgba(16, 185, 129, 0.1)",
      description: `${currentStats.acceptanceRate || Math.round(((currentStats.accepted || 0) / Math.max(currentStats.count || currentStats.all || 1, 1)) * 100)}%`,
    },
    {
      label: "Отказано",
      value: currentStats.rejected || 0,
      icon: XCircle,
      color: "#EF4444",
      bgColor: "rgba(239, 68, 68, 0.1)",
      description: `${currentStats.rejectionRate || Math.round(((currentStats.rejected || 0) / Math.max(currentStats.count || currentStats.all || 1, 1)) * 100)}%`,
    },
  ]

  // Дополнительная статистика по источникам и устройствам
  const additionalStats = [
    {
      label: "Mobile",
      value: currentStats.mobile || 0,
      color: "#10B981",
      description: "Мобильные устройства"
    },
    {
      label: "Desktop",
      value: currentStats.desktop || 0,
      color: "#6366F1",
      description: "Настольные компьютеры"
    },
    {
      label: "Яндекс",
      value: currentStats.yandex || 0,
      color: "#FF0000",
      description: "Переходы с Яндекса"
    },
    {
      label: "Google",
      value: currentStats.google || 0,
      color: "#4285F4",
      description: "Переходы с Google"
    }
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

          <motion.button
            onClick={() => setIsAdvancedStatsOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-[#4A5568] px-3 py-2 text-sm font-medium text-[#CBD5E0] transition-all hover:bg-[#374151]"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <BarChart3 className="h-4 w-4" />
            Подробнее
          </motion.button>
        </div>

        {/* Информация о сегодняшних заявках */}
        {period === "all" && today.count > 0 && (
          <div className="flex items-center gap-2 rounded-lg bg-[#1F2937] px-4 py-2 border border-[#4A5568]">
            <Calendar className="h-4 w-4 text-[#3B82F6]" />
            <span className="text-sm text-[#E5E7EB] font-inter">
              Сегодня: <span className="font-semibold text-[#3B82F6]">{today.count}</span> новых
            </span>
          </div>
        )}
      </div>

      {/* Основные карточки статистики */}
      <div className="grid grid-cols-4 gap-4">
        {statItems.map((item, index) => (
          <motion.div
            key={item.label}
            className="group relative rounded-xl bg-gradient-to-br from-[#1F2937] to-[#111827] p-3 shadow-lg border border-[#374151]"
            initial={{ opacity: 0, filter: "blur(10px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            whileHover={{ y: -2, scale: 1.02 }}
          >
            {/* Цветная полоска сверху */}
            <div className="absolute left-0 top-0 h-1 w-full rounded-t-xl" style={{ backgroundColor: item.color }} />

            <div className="space-y-2">
              {/* Иконка и значение */}
              <div className="flex items-center justify-between">
                <motion.div
                  className="rounded-lg p-1.5"
                  style={{ backgroundColor: item.bgColor }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 + 0.2, duration: 0.2 }}
                >
                  <item.icon className="h-3.5 w-3.5" style={{ color: item.color }} />
                </motion.div>

                <motion.p
                  className="text-xl font-bold text-[#E5E7EB] font-inter"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 + 0.3, duration: 0.2 }}
                >
                  {item.value}
                </motion.p>
              </div>

              {/* Название и описание */}
              <div>
                <p className="text-sm font-medium text-[#E5E7EB] font-inter">{item.label}</p>
                <p className="text-xs text-[#9CA3AF] font-inter">{item.description}</p>
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

      {/* Дополнительная статистика */}
      <div className="space-y-3">
        <h4 className="text-lg font-semibold text-[#E5E7EB] font-inter flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-[#6366F1]" />
          Детальная аналитика
        </h4>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {additionalStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="bg-[#374151] rounded-lg p-3 border border-[#4A5568] hover:border-[#6B7280] transition-colors"
              initial={{ opacity: 0, filter: "blur(10px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              transition={{ delay: (statItems.length * 0.05) + (index * 0.05), duration: 0.3 }}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: stat.color }}
                />
                <span className="text-lg font-bold text-[#E5E7EB] font-inter">
                  {stat.value}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-[#E5E7EB] font-inter">{stat.label}</p>
                <p className="text-xs text-[#9CA3AF] font-inter">{stat.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Date Range Picker */}
      <DateRangePicker
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        onDateRangeSelect={handleDateRangeSelect}
        currentRange={customDateRange}
      />

      {/* Advanced Stats Modal */}
      <AdvancedStatsModal
        isOpen={isAdvancedStatsOpen}
        onClose={() => setIsAdvancedStatsOpen(false)}
        statistics={statistics}
      />
    </div>
  )
}
