"use client"

import React from "react"

import { motion, AnimatePresence } from "framer-motion"
import {
  X,
  Search,
  Phone,
  Check,
  XCircle,
  User,
  Cake,
  Monitor,
  ExternalLink,
  Smartphone,
  Chrome,
  ChromeIcon as Firefox,
  AppleIcon as Safari,
  RotateCcw,
  Trash2,
} from "lucide-react"
import { useState } from "react"
import { updateUnicRequestStatus, deleteUnicRequest } from "@/lib/unic-firestore"

interface Request {
  id: string
  fullName: string
  phone: string
  birthDate?: string
  status: "new" | "accepted" | "rejected" | "no_answer"
  createdAt: Date
  updatedAt?: Date
  source?: string
  referrer?: string
  userAgent?: string
  // Для совместимости
  projectId?: string
  title?: string
  clientName?: string
  comment?: string
}

interface ProcessedRequestsPanelProps {
  isOpen: boolean
  onClose: () => void
  requests: Request[]
  type: "accepted" | "rejected"
  onRequestUpdate?: () => void
}

export default function ProcessedRequestsPanel({ isOpen, onClose, requests, type, onRequestUpdate }: ProcessedRequestsPanelProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)

  const filteredRequests = requests
    .filter((r) => r.status === type)
    .filter(
      (r) =>
        (r.fullName || r.clientName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.phone || "").includes(searchQuery) ||
        (r.birthDate || "").includes(searchQuery),
    )
    .sort((a, b) => (b.updatedAt || b.createdAt).getTime() - (a.updatedAt || a.createdAt).getTime())

  const handleReturnToNew = async (requestId: string) => {
    if (isUpdating) return

    setIsUpdating(true)
    try {
      const { error } = await updateUnicRequestStatus(requestId, "new")
      if (!error) {
        onRequestUpdate?.()
      } else {
        console.error("Error returning request to new:", error)
        alert("Ошибка при возврате заявки")
      }
    } catch (error) {
      console.error("Error returning request to new:", error)
      alert("Ошибка при возврате заявки")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteRequest = async (requestId: string) => {
    if (isUpdating) return

    // Подтверждение удаления
    if (!confirm("Вы уверены, что хотите удалить эту заявку? Это действие нельзя отменить.")) {
      return
    }

    setIsUpdating(true)
    try {
      const { error } = await deleteUnicRequest(requestId)
      if (!error) {
        onRequestUpdate?.()
      } else {
        console.error("Error deleting request:", error)
        alert("Ошибка при удалении заявки")
      }
    } catch (error) {
      console.error("Error deleting request:", error)
      alert("Ошибка при удалении заявки")
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

  const getDomainFromUrl = (url: string) => {
    try {
      return new URL(url).hostname
    } catch {
      return url
    }
  }

  const title = type === "accepted" ? "Принятые заявки" : "Отказанные заявки"
  const icon = type === "accepted" ? Check : XCircle
  const color = type === "accepted" ? "#10B981" : "#EF4444"

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

          {/* Panel */}
          <motion.div
            className="fixed left-0 top-0 z-50 h-full w-[480px] bg-[#1F2937] shadow-2xl"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#374151] p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg p-2" style={{ backgroundColor: `${color}20` }}>
                  {React.createElement(icon, { className: "h-5 w-5", style: { color } })}
                </div>
                <div>
                  <h2 className="text-lg font-medium text-[#E5E7EB] font-inter">{title}</h2>
                  <p className="text-sm text-[#9CA3AF] font-inter">{filteredRequests.length} заявок</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1 text-[#6B7280] transition-colors hover:bg-[#374151] hover:text-[#E5E7EB]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Search */}
            <div className="border-b border-[#374151] p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 w-full rounded-lg bg-[#374151] pl-10 pr-4 text-[#E5E7EB] outline-none transition-all duration-200 font-inter focus:shadow-[0_0_0_2px_rgba(59,130,246,0.5)]"
                  placeholder="Поиск по имени, телефону..."
                />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {filteredRequests.length === 0 ? (
                <motion.div
                  className="flex h-32 flex-col items-center justify-center text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {React.createElement(icon, { className: "mb-2 h-8 w-8 text-[#6B7280]" })}
                  <p className="text-[#6B7280] font-inter">
                    {searchQuery
                      ? "Ничего не найдено"
                      : `Нет ${type === "accepted" ? "принятых" : "отказанных"} заявок`}
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  {filteredRequests.map((request, index) => {
                    const deviceInfo = getDeviceInfo(request.userAgent || "")
                    const BrowserIcon = getBrowserIcon(request.userAgent || "")

                    return (
                      <motion.div
                        key={request.id}
                        className="relative rounded-xl bg-[#111827] p-4 border border-[#374151]"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        {/* Status Bar */}
                        <div
                          className="absolute left-0 top-0 h-1 w-full rounded-t-xl"
                          style={{ backgroundColor: color }}
                        />

                        {/* Content */}
                        <div className="space-y-3">
                          {/* Header */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-[#3B82F6]" />
                              <span className="text-xs text-[#9CA3AF]">ID: {request.id.slice(-6)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-[#9CA3AF]">
                                {formatDate(request.updatedAt || request.createdAt)}
                              </span>
                              <button
                                onClick={() => handleReturnToNew(request.id)}
                                disabled={isUpdating}
                                className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#3B82F6] text-white transition-all hover:bg-[#2563EB] disabled:opacity-50"
                                title="Вернуть в новые"
                              >
                                <RotateCcw className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => handleDeleteRequest(request.id)}
                                disabled={isUpdating}
                                className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#EF4444] text-white transition-all hover:bg-[#DC2626] disabled:opacity-50"
                                title="Удалить заявку"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>

                          {/* Full Name */}
                          <h3 className="font-semibold text-[#F7FAFC] font-inter text-lg">
                            {request.fullName || request.clientName}
                          </h3>

                          {/* Contact Info */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-[#CBD5E0]">
                              <Phone className="h-3 w-3 flex-shrink-0 text-[#10B981]" />
                              <span className="font-inter font-medium">{request.phone}</span>
                            </div>

                            {request.birthDate && (
                              <div className="flex items-center gap-2 text-sm text-[#CBD5E0]">
                                <Cake className="h-3 w-3 flex-shrink-0 text-[#F59E0B]" />
                                <span className="font-inter">{formatBirthDate(request.birthDate)}</span>
                              </div>
                            )}
                          </div>

                          {/* Referrer */}
                          {request.referrer && (
                            <div className="flex items-center gap-2 text-sm text-[#CBD5E0]">
                              <ExternalLink className="h-3 w-3 flex-shrink-0 text-[#8B5CF6]" />
                              <span className="font-inter text-xs">
                                Переход с: {getDomainFromUrl(request.referrer)}
                              </span>
                            </div>
                          )}

                          {/* Device Info */}
                          {request.userAgent && (
                            <div className="rounded-lg bg-[#1F2937] p-2">
                              <div className="flex items-center gap-2 mb-1">
                                <BrowserIcon className="h-3 w-3 text-[#3B82F6]" />
                                <span className="text-xs font-medium text-[#E5E7EB]">Устройство</span>
                              </div>
                              <div className="flex items-center gap-4 text-xs text-[#9CA3AF]">
                                <div className="flex items-center gap-1">
                                  {deviceInfo.device === "Mobile" ? (
                                    <Smartphone className="h-3 w-3" />
                                  ) : (
                                    <Monitor className="h-3 w-3" />
                                  )}
                                  <span>{deviceInfo.device}</span>
                                </div>
                                <span>{deviceInfo.os}</span>
                                <span>{deviceInfo.browser}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
