"use client"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useMemo } from "react"
import {
  Calendar,
  Phone,
  Check,
  X,
  PhoneOff,
  User,
  Cake,
  Globe,
  Monitor,
  ExternalLink,
  Smartphone,
  Chrome,
  ChromeIcon as Firefox,
  AppleIcon as Safari,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { type UnicRequest, updateUnicRequestStatus } from "@/lib/unic-firestore"

interface DateGroupedRequestsProps {
  requests: UnicRequest[]
  onRequestUpdate: () => void
}

export default function DateGroupedRequests({
  requests,
  onRequestUpdate,
}: DateGroupedRequestsProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set())

  // Функция для безопасного получения значений
  const safeString = (value: any): string => {
    return value || ""
  }

  // Группируем заявки по датам
  const groupedRequests = useMemo(() => {
    const groups: { [key: string]: UnicRequest[] } = {}

    requests
      .filter(r => r.status === "new")
      .forEach(request => {
        const date = new Date(request.createdAt)
        const dateKey = date.toDateString()

        if (!groups[dateKey]) {
          groups[dateKey] = []
        }
        groups[dateKey].push(request)
      })

    // Сортируем группы по дате (новые сверху)
    const sortedGroups = Object.entries(groups).sort(([a], [b]) =>
      new Date(b).getTime() - new Date(a).getTime()
    )

    return sortedGroups
  }, [requests])

  const handleStatusChange = async (requestId: string, newStatus: "accepted" | "rejected" | "no_answer") => {
    if (isUpdating) return

    setIsUpdating(true)
    try {
      const { error } = await updateUnicRequestStatus(requestId, newStatus)
      if (!error) {
        onRequestUpdate()
      } else {
        console.error("Error updating request status:", error)
      }
    } catch (error) {
      console.error("Error updating request status:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const formatDateGroup = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Сегодня"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Вчера"
    } else {
      return new Intl.DateTimeFormat("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(date)
    }
  }

  const formatBirthDate = (birthDate: string) => {
    if (!birthDate) return ""

    try {
      const [day, month, year] = birthDate.split(".")
      const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1, Number.parseInt(day))

      const today = new Date()
      let age = today.getFullYear() - date.getFullYear()
      const monthDiff = today.getMonth() - date.getMonth()

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
        age--
      }

      return `${birthDate} (${age} лет)`
    } catch {
      return birthDate
    }
  }

  const getBrowserIcon = (userAgent: string) => {
    const ua = userAgent.toLowerCase()
    if (ua.includes("chrome") && !ua.includes("edg")) return Chrome
    if (ua.includes("firefox")) return Firefox
    if (ua.includes("safari") && !ua.includes("chrome")) return Safari
    return Monitor
  }

  const getDeviceInfo = (userAgent: string) => {
    const ua = userAgent.toLowerCase()

    let device = "Desktop"
    if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone")) {
      device = "Mobile"
    } else if (ua.includes("tablet") || ua.includes("ipad")) {
      device = "Tablet"
    }

    let os = "Unknown"
    if (ua.includes("windows")) os = "Windows"
    else if (ua.includes("mac")) os = "macOS"
    else if (ua.includes("linux")) os = "Linux"
    else if (ua.includes("android")) os = "Android"
    else if (ua.includes("ios") || ua.includes("iphone") || ua.includes("ipad")) os = "iOS"

    let browser = "Unknown"
    if (ua.includes("chrome") && !ua.includes("edg")) browser = "Chrome"
    else if (ua.includes("firefox")) browser = "Firefox"
    else if (ua.includes("safari") && !ua.includes("chrome")) browser = "Safari"
    else if (ua.includes("edge") || ua.includes("edg")) browser = "Edge"

    return { device, os, browser }
  }

  const getSourceDisplayName = (source: string) => {
    switch (source) {
      case "hero_form":
        return "Главная форма"
      case "contact_form":
        return "Форма контактов"
      case "popup_form":
        return "Всплывающая форма"
      default:
        return source || "Неизвестно"
    }
  }

  const getDomainFromUrl = (url: string) => {
    try {
      return new URL(url).hostname
    } catch {
      return url
    }
  }

  const toggleDateExpansion = (dateKey: string) => {
    const newExpanded = new Set(expandedDates)
    if (newExpanded.has(dateKey)) {
      newExpanded.delete(dateKey)
    } else {
      newExpanded.add(dateKey)
    }
    setExpandedDates(newExpanded)
  }

  if (groupedRequests.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-[#4A5568] text-[#A0AEC0] h-64">
        <div className="text-center">
          <Phone className="mx-auto mb-2 h-8 w-8" />
          <p className="font-inter">Новых заявок нет</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <Calendar className="h-5 w-5 text-[#6366F1]" />
        <h3 className="text-lg font-semibold text-[#E5E7EB] font-montserrat">
          Новые заявки по датам
        </h3>
      </div>

      {groupedRequests.map(([dateKey, dayRequests], groupIndex) => {
        const isExpanded = expandedDates.has(dateKey)

        return (
          <motion.div
            key={dateKey}
            initial={{ opacity: 0, filter: "blur(10px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.4, delay: groupIndex * 0.1 }}
            className="space-y-3"
          >
            {/* Date Header - Clickable */}
            <motion.button
              onClick={() => toggleDateExpansion(dateKey)}
              className="w-full flex items-center justify-between p-4 rounded-lg bg-[#374151] hover:bg-[#4A5568] transition-colors border border-[#4A5568]"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-[#6366F1]" />
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-[#E5E7EB] font-montserrat">
                    {formatDateGroup(dateKey)}
                  </span>
                  <div className="flex items-center justify-center rounded-full bg-[#3B82F6] text-white text-xs font-medium px-2 py-1 min-w-[24px]">
                    {dayRequests.length}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-[#9CA3AF] font-inter">
                  {dayRequests.length} заявок
                </span>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-[#9CA3AF]" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-[#9CA3AF]" />
                )}
              </div>
            </motion.button>

            {/* Expandable Requests List */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                    {dayRequests.map((request, index) => {
                      const deviceInfo = getDeviceInfo(request.userAgent || "")
                      const BrowserIcon = getBrowserIcon(request.userAgent || "")

                      return (
                        <motion.div
                          key={request.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="bg-[#4A5568] rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow border border-[#6B7280]"
                        >
                          {/* Header */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-[#3B82F6]" />
                              <span className="text-xs font-medium text-[#3B82F6] uppercase tracking-wide">
                                Новая заявка
                              </span>
                            </div>
                            <div className="text-xs text-[#9CA3AF] font-inter">
                              ID: {request.id.slice(-6)}
                            </div>
                          </div>

                          {/* Name */}
                          <h4 className="text-lg font-semibold text-[#F7FAFC] font-inter mb-3 leading-tight">
                            {safeString(request.fullName)}
                          </h4>

                          {/* Contact Info */}
                          <div className="space-y-2 mb-3">
                            <div className="flex items-center gap-2 text-sm text-[#CBD5E0]">
                              <Phone className="h-3 w-3 flex-shrink-0 text-[#10B981]" />
                              <span className="font-inter font-medium">{safeString(request.phone)}</span>
                            </div>

                            {request.birthDate && (
                              <div className="flex items-center gap-2 text-sm text-[#CBD5E0]">
                                <Cake className="h-3 w-3 flex-shrink-0 text-[#F59E0B]" />
                                <span className="font-inter text-xs">{formatBirthDate(request.birthDate)}</span>
                              </div>
                            )}

                            <div className="flex items-center gap-2 text-sm text-[#CBD5E0]">
                              <Calendar className="h-3 w-3 flex-shrink-0 text-[#6366F1]" />
                              <span className="font-inter text-xs">{formatDate(request.createdAt)}</span>
                            </div>
                          </div>

                          {/* Device Info */}
                          {request.userAgent && (
                            <div className="mb-3">
                              <div className="rounded-lg bg-[#374151] p-2">
                                <div className="flex items-center gap-2 mb-1">
                                  <BrowserIcon className="h-3 w-3 text-[#3B82F6]" />
                                  <span className="text-xs text-[#E5E7EB]">
                                    {deviceInfo.device === "Mobile" ? (
                                      <Smartphone className="h-3 w-3 inline mr-1 text-[#10B981]" />
                                    ) : (
                                      <Monitor className="h-3 w-3 inline mr-1 text-[#10B981]" />
                                    )}
                                    {deviceInfo.device} • {deviceInfo.browser}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex items-center justify-between pt-3 border-t border-[#374151]">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleStatusChange(request.id, "accepted")}
                                disabled={isUpdating}
                                className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#10B981] text-white transition-all hover:bg-[#059669] disabled:opacity-50 shadow-md"
                                title="Принять"
                              >
                                <Check className="h-4 w-4" />
                              </button>

                              <button
                                onClick={() => handleStatusChange(request.id, "rejected")}
                                disabled={isUpdating}
                                className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EF4444] text-white transition-all hover:bg-[#DC2626] disabled:opacity-50 shadow-md"
                                title="Отказать"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>

                            <button
                              onClick={() => handleStatusChange(request.id, "no_answer")}
                              disabled={isUpdating}
                              className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F59E0B] text-white transition-all hover:bg-[#D97706] disabled:opacity-50 shadow-md"
                              title="Не дозвонились"
                            >
                              <PhoneOff className="h-4 w-4" />
                            </button>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )
      })}
    </div>
  )
}
