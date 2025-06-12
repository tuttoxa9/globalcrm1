"use client"

import React from "react"
import { motion } from "framer-motion"
import { useState } from "react"
import { Calendar, MessageCircle, Phone, Check, X, PhoneOff } from "lucide-react"

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

interface RequestStackProps {
  requests: Request[]
  onRequestStatusChange: (requestId: string, newStatus: "new" | "accepted" | "rejected") => void
  cardDimensions?: { width: number; height: number }
}

export default function RequestStack({
  requests,
  onRequestStatusChange,
  cardDimensions = { width: 320, height: 320 }, // Квадратные карточки
}: RequestStackProps) {
  const [cards, setCards] = useState(requests.filter((r) => r.status === "new"))
  const [currentIndex, setCurrentIndex] = useState(0)

  // Update cards when requests change
  React.useEffect(() => {
    setCards(requests.filter((r) => r.status === "new"))
    setCurrentIndex(0)
  }, [requests])

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handleStatusChange = (requestId: string, newStatus: "new" | "accepted" | "rejected") => {
    onRequestStatusChange(requestId, newStatus)
    // Automatically show next card
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
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

        return (
          <motion.div
            key={request.id}
            className="absolute left-0 top-0"
            initial={false}
            animate={{
              y: index * 8, // Only offset vertically
              zIndex: visibleCards - index,
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
          >
            <div
              className="relative rounded-xl bg-[#4A5568] p-4 shadow-lg"
              style={{
                width: cardDimensions.width,
                height: cardDimensions.height,
              }}
            >
              {/* Orange lines at the top for cards behind the top card */}
              {!isTopCard && (
                <div className="absolute left-0 top-0 w-full">
                  {Array.from({ length: 3 }).map((_, lineIndex) => (
                    <div
                      key={lineIndex}
                      className="mb-1 h-0.5 w-full bg-[#F59E0B]"
                      style={{
                        opacity: 0.7 - lineIndex * 0.2,
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Card Content - only fully visible for the top card */}
              <div className={`flex h-full flex-col ${isTopCard ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                {/* Title */}
                <h3 className="mb-2 text-base font-medium text-[#E5E7EB] font-inter line-clamp-2">{request.title}</h3>

                {/* Client Name */}
                <div className="mb-3 text-lg font-semibold text-[#F7FAFC] font-inter">{request.clientName}</div>

                {/* Phone and Date */}
                <div className="mb-3 space-y-1">
                  <div className="flex items-center gap-2 text-sm text-[#CBD5E0]">
                    <Phone className="h-3 w-3 flex-shrink-0" />
                    <span className="font-inter text-xs">{request.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#CBD5E0]">
                    <Calendar className="h-3 w-3 flex-shrink-0" />
                    <span className="font-inter text-xs">{formatDate(request.createdAt)}</span>
                  </div>
                </div>

                {/* Comment */}
                {request.comment && (
                  <div className="mb-3 flex-1 min-h-0">
                    <div className="flex items-start gap-2 text-xs text-[#A0AEC0]">
                      <MessageCircle className="mt-0.5 h-3 w-3 flex-shrink-0" />
                      <p className="font-inter leading-relaxed line-clamp-4">{request.comment}</p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStatusChange(request.id, "accepted")}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#374151] text-[#E5E7EB] transition-all hover:bg-[#4A5568]"
                      title="Принять"
                    >
                      <Check className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => handleStatusChange(request.id, "rejected")}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#374151] text-[#E5E7EB] transition-all hover:bg-[#4A5568]"
                      title="Отказать"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <button
                    onClick={handleNext}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#374151] text-[#E5E7EB] transition-all hover:bg-[#4A5568]"
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
        <div className="absolute -bottom-6 right-0 rounded-full bg-[#1F2937] px-2 py-1 text-xs text-[#E5E7EB]">
          {currentIndex + 1} / {cards.length}
        </div>
      )}
    </div>
  )
}
