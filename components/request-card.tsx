"use client"

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

interface RequestCardProps {
  request: Request
  columnColor: string
  onStatusChange: (requestId: string, newStatus: "new" | "accepted" | "rejected") => void
}

export default function RequestCard({ request, columnColor, onStatusChange }: RequestCardProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const handleAccept = () => {
    onStatusChange(request.id, "accepted")
  }

  const handleReject = () => {
    onStatusChange(request.id, "rejected")
  }

  const handleNoAnswer = () => {
    // Логика для "не дозвонились"
    console.log(`No answer for request ${request.id}`)
  }

  return (
    <div className="group relative rounded-lg bg-[#4A5568] shadow-sm transition-all duration-200">
      {/* Status Color Bar */}
      <div
        className="absolute left-0 top-0 h-1 w-full rounded-t-lg"
        style={{ backgroundColor: columnColor }}
      />

      {/* Card Content */}
      <div className="p-3">
        {/* Title */}
        <h3 className="mb-1 text-sm font-medium text-[#E5E7EB] font-inter line-clamp-1">{request.title}</h3>

        {/* Client Name */}
        <div className="mb-2 text-base font-medium text-[#F7FAFC] font-inter line-clamp-1">{request.clientName}</div>

        {/* Phone and Date */}
        <div className="mb-2 flex flex-col space-y-1">
          <div className="flex items-center gap-1 text-xs text-[#CBD5E0]">
            <Phone className="h-3 w-3 flex-shrink-0" />
            <span className="font-inter truncate">{request.phone}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-[#CBD5E0]">
            <Calendar className="h-3 w-3 flex-shrink-0" />
            <span className="font-inter">{formatDate(request.createdAt)}</span>
          </div>
        </div>

        {/* Comment */}
        {request.comment && (
          <div className="mb-2 flex items-start gap-1 text-xs text-[#A0AEC0]">
            <MessageCircle className="mt-0.5 h-3 w-3 flex-shrink-0" />
            <p className="font-inter leading-relaxed line-clamp-2">{request.comment}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between">

          <div className="flex gap-1">
            <button
              onClick={handleAccept}
              className="flex h-6 w-6 items-center justify-center rounded-md bg-[#10B981] text-white transition-all hover:bg-[#059669]"
              title="Принять"
            >
              <Check className="h-3 w-3" />
            </button>

            <button
              onClick={handleReject}
              className="flex h-6 w-6 items-center justify-center rounded-md bg-[#EF4444] text-white transition-all hover:bg-[#DC2626]"
              title="Отказать"
            >
              <X className="h-3 w-3" />
            </button>
          </div>

          <button
            onClick={handleNoAnswer}
            className="flex h-6 w-6 items-center justify-center rounded-md bg-[#F59E0B] text-white transition-all hover:bg-[#D97706]"
            title="Не дозвонились"
          >
            <PhoneOff className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  )
}
