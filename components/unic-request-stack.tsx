"use client"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
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
} from "lucide-react"
import { type UnicRequest, updateUnicRequestStatus } from "@/lib/unic-firestore"

interface UnicRequestStackProps {
  requests: UnicRequest[]
  onRequestUpdate: () => void
  cardDimensions?: { width: number; height: number }
}

export default function UnicRequestStack({
  requests,
  onRequestUpdate,
  cardDimensions = { width: 380, height: 320 }, // Сбалансированный размер карточки
}: UnicRequestStackProps) {
  const [cards, setCards] = useState<UnicRequest[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isUpdating, setIsUpdating] = useState(false)

  // Функция для безопасного получения значений
  const safeString = (value: any): string => {
    return value || ""
  }

  // Update cards when requests change
  useEffect(() => {
    const newCards = requests.filter((r) => r.status === "new")
    setCards(newCards)
    setCurrentIndex(0)
  }, [requests])

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handleStatusChange = async (requestId: string, newStatus: "accepted" | "rejected" | "no_answer") => {
    if (isUpdating) return

    setIsUpdating(true)
    try {
      const { error } = await updateUnicRequestStatus(requestId, newStatus)
      if (!error) {
        onRequestUpdate()
        // Automatically show next card
        if (currentIndex < cards.length - 1) {
          setCurrentIndex(currentIndex + 1)
        }
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

  const formatBirthDate = (birthDate: string) => {
    if (!birthDate) return ""

    try {
      // Парсим дату в формате DD.MM.YYYY
      const [day, month, year] = birthDate.split(".")
      const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1, Number.parseInt(day))

      // Вычисляем возраст
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

    // Определяем устройство
    let device = "Desktop"
    if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone")) {
      device = "Mobile"
    } else if (ua.includes("tablet") || ua.includes("ipad")) {
      device = "Tablet"
    }

    // Определяем ОС
    let os = "Unknown"
    if (ua.includes("windows")) os = "Windows"
    else if (ua.includes("mac")) os = "macOS"
    else if (ua.includes("linux")) os = "Linux"
    else if (ua.includes("android")) os = "Android"
    else if (ua.includes("ios") || ua.includes("iphone") || ua.includes("ipad")) os = "iOS"

    // Определяем браузер
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

  if (cards.length === 0) {
    return (
      <div
        className="relative flex items-center justify-center rounded-xl border-2 border-dashed border-[#4A5568] text-[#A0AEC0]"
        style={{
          width: cardDimensions.width,
          height: cardDimensions.height,
        }}
      >
        <div className="text-center">
          <Phone className="mx-auto mb-2 h-8 w-8" />
          <p className="font-inter">Новых заявок нет</p>
        </div>
      </div>
    )
  }

  // Calculate how many cards to show in the stack (max 3)
  const visibleCards = Math.min(cards.length - currentIndex, 3)

  return (
    <div
      className="relative"
      style={{
        width: cardDimensions.width,
        height: cardDimensions.height,
      }}
    >
      {/* Stack of cards */}
      {Array.from({ length: visibleCards }).map((_, index) => {
        const cardIndex = currentIndex + index
        const request = cards[cardIndex]
        const isTopCard = index === 0
        const deviceInfo = getDeviceInfo(request.userAgent || "")
        const BrowserIcon = getBrowserIcon(request.userAgent || "")

        return (
          <motion.div
            key={request.id}
            className="absolute left-0 top-0"
            initial={false}
            animate={{
              y: index * 8,
              zIndex: visibleCards - index,
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
          >
            <div
              className="relative rounded-xl bg-[#4A5568] shadow-lg overflow-hidden"
              style={{
                width: cardDimensions.width,
                height: cardDimensions.height,
              }}
            >
              {/* Status indicator for cards behind */}
              {!isTopCard && (
                <div className="absolute left-0 top-0 w-full">
                  {Array.from({ length: 3 }).map((_, lineIndex) => (
                    <div
                      key={lineIndex}
                      className="mb-1 h-0.5 w-full bg-[#3B82F6]"
                      style={{
                        opacity: 0.7 - lineIndex * 0.2,
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Card Content - only fully visible for the top card */}
              <div
                className={`flex h-full flex-col justify-between p-3 ${isTopCard ? "opacity-100" : "opacity-0 pointer-events-none"}`}
              >
                <div className="space-y-2">
                  {/* Header with status indicator */}
                  <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-[#3B82F6]" />
                    <span className="text-xs font-medium text-[#3B82F6] uppercase tracking-wide">Новая заявка</span>
                  </div>
                  <div className="text-xs text-[#9CA3AF] font-inter">ID: {request.id.slice(-6)}</div>
                </div>

                {/* Full Name */}
                <div className="mb-2">
                  <h3 className="text-lg font-semibold text-[#F7FAFC] font-inter leading-tight">
                    {safeString(request.fullName)}
                  </h3>
                </div>

                {/* Contact Info */}
                <div className="mb-2 space-y-1.5">
                  <div className="flex items-center gap-2 text-sm text-[#CBD5E0]">
                    <Phone className="h-3 w-3 flex-shrink-0 text-[#10B981]" />
                    <span className="font-inter font-medium">{safeString(request.phone)}</span>
                  </div>

                  {request.birthDate && (
                    <div className="flex items-center gap-2 text-sm text-[#CBD5E0]">
                      <Cake className="h-3 w-3 flex-shrink-0 text-[#F59E0B]" />
                      <span className="font-inter">{formatBirthDate(request.birthDate)}</span>
                    </div>
                  )}
                </div>

                {/* Date and Time */}
                <div className="mb-2 flex items-center gap-2 text-sm text-[#CBD5E0]">
                  <Calendar className="h-3 w-3 flex-shrink-0 text-[#6366F1]" />
                  <span className="font-inter">{formatDate(request.createdAt)}</span>
                </div>

                {/* Source Information */}
                {request.source && request.source !== "hero_form" && (
                  <div className="mb-2">
                    <div className="rounded-lg bg-[#374151] p-2">
                      <div className="text-xs text-[#9CA3AF] mb-1">Источник заявки:</div>
                      <div className="text-sm text-[#E5E7EB] font-medium">{getSourceDisplayName(request.source)}</div>
                    </div>
                  </div>
                )}

                {/* Referrer */}
                {request.referrer && (
                  <div className="mb-2">
                    <div className="flex items-center gap-2 text-sm text-[#CBD5E0]">
                      <ExternalLink className="h-3 w-3 flex-shrink-0 text-[#8B5CF6]" />
                      <span className="font-inter text-xs">Переход с: {getDomainFromUrl(request.referrer)}</span>
                    </div>
                  </div>
                )}

                {/* Device and Browser Info */}
                {request.userAgent && (
                  <div className="mb-2">
                    <div className="rounded-lg bg-[#374151] p-2">
                      <div className="flex items-center gap-2 mb-2">
                        <BrowserIcon className="h-4 w-4 text-[#3B82F6]" />
                        <span className="text-xs font-medium text-[#E5E7EB]">Устройство</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {deviceInfo.device === "Mobile" ? (
                            <Smartphone className="h-3 w-3 text-[#10B981]" />
                          ) : (
                            <Monitor className="h-3 w-3 text-[#10B981]" />
                          )}
                          <span className="text-xs text-[#CBD5E0]">
                            {deviceInfo.device} • {deviceInfo.os}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Globe className="h-3 w-3 text-[#6366F1]" />
                          <span className="text-xs text-[#CBD5E0]">{deviceInfo.browser}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-[#374151]">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStatusChange(request.id, "accepted")}
                      disabled={isUpdating}
                      className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#10B981] text-white transition-all hover:bg-[#059669] disabled:opacity-50 shadow-md"
                      title="Принять"
                    >
                      <Check className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => handleStatusChange(request.id, "rejected")}
                      disabled={isUpdating}
                      className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EF4444] text-white transition-all hover:bg-[#DC2626] disabled:opacity-50 shadow-md"
                      title="Отказать"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleStatusChange(request.id, "no_answer")}
                    disabled={isUpdating}
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F59E0B] text-white transition-all hover:bg-[#D97706] disabled:opacity-50 shadow-md"
                    title="Не дозвонились"
                  >
                    <PhoneOff className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )
      })}

      {/* Counter indicator */}
      {cards.length > 1 && (
        <div className="absolute -bottom-6 right-0 rounded-full bg-[#1F2937] px-3 py-1 text-sm text-[#E5E7EB] shadow-lg">
          {currentIndex + 1} / {cards.length}
        </div>
      )}
    </div>
  )
}
