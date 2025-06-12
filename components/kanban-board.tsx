"use client"

import { motion } from "framer-motion"
import RequestCard from "./request-card"

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

interface KanbanBoardProps {
  requests: Request[]
  onRequestStatusChange: (requestId: string, newStatus: "new" | "accepted" | "rejected") => void
  projectColor: string
}

const columns = [
  { id: "new", title: "Новые", color: "#2D3748" },
  { id: "accepted", title: "Принято", color: "#10B981" },
  { id: "rejected", title: "Отказ", color: "#EF4444" },
] as const

export default function KanbanBoard({ requests, onRequestStatusChange, projectColor }: KanbanBoardProps) {
  const getRequestsByStatus = (status: string) => {
    return requests.filter((req) => req.status === status).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {columns.map((column) => {
          const columnRequests = getRequestsByStatus(column.id)

          return (
            <motion.div
              key={column.id}
              className="flex flex-col"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              {/* Column Header */}
              <div className="mb-3 flex items-center gap-2">
                <h2 className="text-base font-medium text-[#E5E7EB] font-inter">{column.title}</h2>
                <span
                  className="flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs font-medium text-white"
                  style={{ backgroundColor: column.color }}
                >
                  {columnRequests.length}
                </span>
              </div>

              {/* Cards Container */}
              <div className="space-y-3">
                {columnRequests.map((request, index) => (
                  <motion.div
                    key={request.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.3,
                      delay: index * 0.03,
                      layout: { duration: 0.3 },
                    }}
                  >
                    <RequestCard request={request} columnColor={column.color} onStatusChange={onRequestStatusChange} />
                  </motion.div>
                ))}

                {columnRequests.length === 0 && (
                  <motion.div
                    className="flex h-20 items-center justify-center rounded-lg border-2 border-dashed border-[#4A5568] text-[#A0AEC0]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <span className="text-sm font-inter">Пусто</span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
