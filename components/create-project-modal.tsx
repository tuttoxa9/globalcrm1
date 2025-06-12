"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Palette } from "lucide-react"
import { addProject } from "@/lib/firestore"
import { useAuth } from "@/hooks/useAuth"

interface CreateProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onProjectCreated: () => void
}

const projectColors = [
  { name: "Синий", value: "#3B82F6" },
  { name: "Зеленый", value: "#10B981" },
  { name: "Янтарный", value: "#F59E0B" },
  { name: "Фиолетовый", value: "#8B5CF6" },
  { name: "Красный", value: "#EF4444" },
  { name: "Голубой", value: "#06B6D4" },
  { name: "Розовый", value: "#EC4899" },
  { name: "Индиго", value: "#6366F1" },
]

export default function CreateProjectModal({ isOpen, onClose, onProjectCreated }: CreateProjectModalProps) {
  const { user } = useAuth()
  const [name, setName] = useState("")
  const [selectedColor, setSelectedColor] = useState(projectColors[0].value)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setError("")

    const { id, error: createError } = await addProject({
      name: name.trim(),
      color: selectedColor,
      newRequests: 0,
      totalRequests: 0,
      accepted: 0,
      rejected: 0,
      userId: user.uid,
      createdAt: new Date(),
    })

    if (id) {
      setName("")
      setSelectedColor(projectColors[0].value)
      onProjectCreated()
      onClose()
    } else {
      setError(createError || "Ошибка создания проекта")
    }

    setLoading(false)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-[#1F2937] p-6 shadow-xl"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-medium text-[#E5E7EB] font-inter">Новый проект</h2>
              <button
                onClick={onClose}
                className="rounded-lg p-1 text-[#6B7280] transition-colors hover:bg-[#374151] hover:text-[#E5E7EB]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Project Name */}
              <div>
                <label className="mb-2 block text-sm font-medium text-[#E5E7EB] font-inter">Название проекта</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11 w-full rounded-lg bg-[#374151] px-3 text-[#E5E7EB] outline-none transition-all duration-200 font-inter focus:shadow-[0_0_0_2px_rgba(59,130,246,0.5)]"
                  placeholder="Введите название проекта"
                  required
                  maxLength={50}
                />
              </div>

              {/* Color Selection */}
              <div>
                <label className="mb-3 block text-sm font-medium text-[#E5E7EB] font-inter">
                  <Palette className="mr-2 inline h-4 w-4" />
                  Цвет проекта
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {projectColors.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setSelectedColor(color.value)}
                      className={`relative h-12 w-full rounded-lg transition-all duration-200 ${
                        selectedColor === color.value
                          ? "ring-2 ring-white ring-offset-2 ring-offset-[#1F2937]"
                          : "hover:scale-105"
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    >
                      {selectedColor === color.value && (
                        <motion.div
                          className="absolute inset-0 rounded-lg"
                          style={{
                            background: `radial-gradient(circle, ${color.value}40 0%, transparent 70%)`,
                          }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.2 }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {error && <div className="text-center text-sm text-[#EF4444] font-inter">{error}</div>}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-lg bg-[#374151] py-2.5 text-[#E5E7EB] transition-colors hover:bg-[#4B5563] font-inter"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={loading || !name.trim()}
                  className="flex-1 rounded-lg bg-gradient-to-r from-[#3B82F6] to-[#2563EB] py-2.5 text-white transition-all hover:from-[#2563EB] hover:to-[#1D4ED8] disabled:opacity-50 font-inter font-medium"
                >
                  {loading ? "Создание..." : "Создать"}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
