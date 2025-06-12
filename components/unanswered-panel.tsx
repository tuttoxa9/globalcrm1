"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, Phone, Clock, AlertCircle, Check } from "lucide-react"

interface UnansweredRequest {
  id: string
  clientName: string
  phone: string
  comment: string
  missedCalls: number
  lastCallTime: Date
}

interface UnansweredPanelProps {
  isOpen: boolean
  onClose: () => void
  requests: UnansweredRequest[]
  onAction: (requestId: string, action: "accepted" | "rejected") => void
}

export default function UnansweredPanel({ isOpen, onClose, requests, onAction }: UnansweredPanelProps) {
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const getTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 60) {
      return `${diffInMinutes} мин назад`
    } else {
      const hours = Math.floor(diffInMinutes / 60)
      return `${hours} ч назад`
    }
  }

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
            className="fixed right-0 top-0 z-50 h-full w-96 bg-[#1F2937] shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#374151] p-6">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-[#F59E0B]" />
                <h2 className="text-lg font-medium text-[#E5E7EB] font-inter">Не ответили</h2>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#F59E0B] text-xs font-medium text-white">
                  {requests.length}
                </span>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1 text-[#6B7280] transition-colors hover:bg-[#374151] hover:text-[#E5E7EB]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {requests.length === 0 ? (
                <motion.div
                  className="flex h-32 flex-col items-center justify-center text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Phone className="mb-2 h-8 w-8 text-[#6B7280]" />
                  <p className="text-[#6B7280] font-inter">Все звонки отвечены</p>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  {requests.map((request, index) => (
                    <motion.div
                      key={request.id}
                      className="relative rounded-xl bg-[#111827] p-4"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {/* Top Bar */}
                      <div className="absolute left-0 top-0 h-1 w-full rounded-t-xl bg-[#F59E0B]" />

                      {/* Client Info */}
                      <div className="mb-3">
                        <h3 className="font-medium text-[#E5E7EB] font-inter">{request.clientName}</h3>
                        <div className="flex items-center gap-1 text-sm text-[#9CA3AF]">
                          <Phone className="h-3 w-3" />
                          <span className="font-inter">{request.phone}</span>
                        </div>
                      </div>

                      {/* Missed Calls Info */}
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-[#F59E0B]">
                          <AlertCircle className="h-4 w-4" />
                          <span className="font-inter">
                            {request.missedCalls} пропущенных {request.missedCalls === 1 ? "звонок" : "звонка"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-[#6B7280]">
                          <Clock className="h-3 w-3" />
                          <span className="font-inter">{getTimeAgo(request.lastCallTime)}</span>
                        </div>
                      </div>

                      {/* Comment */}
                      {request.comment && (
                        <p className="mb-3 text-sm text-[#9CA3AF] font-inter leading-relaxed">{request.comment}</p>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <motion.button
                          onClick={() => onAction(request.id, "accepted")}
                          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#10B981] py-2 text-sm font-medium text-white transition-colors hover:bg-[#059669]"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Check className="h-4 w-4" />
                          Принять
                        </motion.button>

                        <motion.button
                          onClick={() => onAction(request.id, "rejected")}
                          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#EF4444] py-2 text-sm font-medium text-white transition-colors hover:bg-[#DC2626]"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <X className="h-4 w-4" />
                          Отказать
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
