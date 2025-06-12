"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"

interface DateRangePickerProps {
  isOpen: boolean
  onClose: () => void
  onDateRangeSelect: (startDate: Date, endDate: Date) => void
  currentRange: { start: Date; end: Date } | null
}

export default function DateRangePicker({ isOpen, onClose, onDateRangeSelect, currentRange }: DateRangePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedStart, setSelectedStart] = useState<Date | null>(currentRange?.start || null)
  const [selectedEnd, setSelectedEnd] = useState<Date | null>(currentRange?.end || null)

  const monthNames = [
    "Январь",
    "Февраль",
    "Март",
    "Апрель",
    "Май",
    "Июнь",
    "Июль",
    "Август",
    "Сентябрь",
    "Октябрь",
    "Ноябрь",
    "Декабрь",
  ]

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const handleDateClick = (date: Date) => {
    if (!selectedStart || (selectedStart && selectedEnd)) {
      setSelectedStart(date)
      setSelectedEnd(null)
    } else if (selectedStart && !selectedEnd) {
      if (date < selectedStart) {
        setSelectedStart(date)
        setSelectedEnd(selectedStart)
      } else {
        setSelectedEnd(date)
      }
    }
  }

  const handleApply = () => {
    if (selectedStart && selectedEnd) {
      onDateRangeSelect(selectedStart, selectedEnd)
      onClose()
    }
  }

  const handleQuickSelect = (days: number) => {
    const end = new Date()
    const start = new Date()
    start.setDate(end.getDate() - days)
    setSelectedStart(start)
    setSelectedEnd(end)
  }

  const isDateInRange = (date: Date) => {
    if (!selectedStart || !selectedEnd) return false
    return date >= selectedStart && date <= selectedEnd
  }

  const isDateSelected = (date: Date) => {
    return (
      (selectedStart && date.getTime() === selectedStart.getTime()) ||
      (selectedEnd && date.getTime() === selectedEnd.getTime())
    )
  }

  const days = getDaysInMonth(currentMonth)

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed left-1/2 top-1/2 z-50 w-96 -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-[#1F2937] p-6 shadow-2xl"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-medium text-[#E5E7EB] font-inter">Выбор периода</h3>
              <Calendar className="h-5 w-5 text-[#6B7280]" />
            </div>

            {/* Quick Select */}
            <div className="mb-4 flex gap-2">
              {[
                { label: "7 дней", days: 7 },
                { label: "30 дней", days: 30 },
                { label: "90 дней", days: 90 },
              ].map((option) => (
                <button
                  key={option.days}
                  onClick={() => handleQuickSelect(option.days)}
                  className="rounded-lg bg-[#374151] px-3 py-1 text-xs text-[#E5E7EB] transition-colors hover:bg-[#4A5568] font-inter"
                >
                  {option.label}
                </button>
              ))}
            </div>

            {/* Calendar Header */}
            <div className="mb-4 flex items-center justify-between">
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                className="rounded-lg p-1 text-[#6B7280] transition-colors hover:bg-[#374151] hover:text-[#E5E7EB]"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm font-medium text-[#E5E7EB] font-inter">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </span>
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                className="rounded-lg p-1 text-[#6B7280] transition-colors hover:bg-[#374151] hover:text-[#E5E7EB]"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="mb-4">
              {/* Days of week */}
              <div className="mb-2 grid grid-cols-7 gap-1">
                {["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"].map((day) => (
                  <div key={day} className="text-center text-xs text-[#6B7280] font-inter">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-1">
                {days.map((date, index) => (
                  <button
                    key={index}
                    onClick={() => date && handleDateClick(date)}
                    disabled={!date}
                    className={`h-8 w-8 rounded-lg text-xs font-inter transition-colors ${
                      !date
                        ? "cursor-default"
                        : isDateSelected(date)
                          ? "bg-[#3B82F6] text-white"
                          : isDateInRange(date)
                            ? "bg-[#3B82F6]/20 text-[#3B82F6]"
                            : "text-[#E5E7EB] hover:bg-[#374151]"
                    }`}
                  >
                    {date?.getDate()}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 rounded-lg bg-[#374151] py-2 text-[#E5E7EB] transition-colors hover:bg-[#4A5568] font-inter"
              >
                Отмена
              </button>
              <button
                onClick={handleApply}
                disabled={!selectedStart || !selectedEnd}
                className="flex-1 rounded-lg bg-[#3B82F6] py-2 text-white transition-colors hover:bg-[#2563EB] disabled:opacity-50 font-inter"
              >
                Применить
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
