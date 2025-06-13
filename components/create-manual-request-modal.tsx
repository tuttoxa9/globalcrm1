"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Calendar, User, Phone, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { addUnicRequest } from "@/lib/unic-firestore"
import { toast } from "sonner"

interface CreateManualRequestModalProps {
  isOpen: boolean
  onClose: () => void
  onRequestCreated: () => void
}

export default function CreateManualRequestModal({
  isOpen,
  onClose,
  onRequestCreated,
}: CreateManualRequestModalProps) {
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [birthDate, setBirthDate] = useState<Date | undefined>(undefined)
  const [source, setSource] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    // Проверяем, что заполнено хотя бы одно из трех полей
    if (!fullName.trim() && !phone.trim() && !birthDate) {
      newErrors.general = "Необходимо заполнить хотя бы одно поле: ФИО, номер телефона или дату рождения"
    }

    // Проверяем обязательность источника
    if (!source) {
      newErrors.source = "Необходимо выбрать источник заявки"
    }

    // Валидация телефона (если заполнен)
    if (phone.trim() && !/^[\+]?[0-9\s\-\(\)]{7,20}$/.test(phone.trim())) {
      newErrors.phone = "Некорректный формат номера телефона"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const requestData = {
        fullName: fullName.trim(),
        phone: phone.trim(),
        birthDate: birthDate ? format(birthDate, "yyyy-MM-dd") : "",
        source,
        status: "new" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        priority: "medium" as const,
        assignedTo: "",
        tags: [],
        referrer: "manual_entry",
        userAgent: "CRM Manual Entry",
        comment: "Заявка создана вручную через CRM",
      }

      const result = await addUnicRequest(requestData)

      if (result.error) {
        toast.error("Ошибка при создании заявки", {
          description: result.error,
        })
      } else {
        toast.success("Заявка успешно создана", {
          description: `Заявка ${fullName || phone} добавлена в систему`,
        })
        onRequestCreated()
        handleClose()
      }
    } catch (error) {
      console.error("Error creating request:", error)
      toast.error("Ошибка при создании заявки", {
        description: "Произошла неожиданная ошибка",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setFullName("")
    setPhone("")
    setBirthDate(undefined)
    setSource("")
    setErrors({})
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md rounded-xl bg-[#1F2937] p-6 shadow-xl"
          >
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-[#3B82F6] p-2">
                  <Plus className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-[#E5E7EB] font-inter">
                  Создать заявку вручную
                </h2>
              </div>
              <button
                onClick={handleClose}
                className="rounded-lg p-1 text-[#9CA3AF] transition-colors hover:bg-[#374151] hover:text-[#E5E7EB]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* General Error */}
              {errors.general && (
                <div className="rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/20 p-3">
                  <p className="text-sm text-[#EF4444]">{errors.general}</p>
                </div>
              )}

              {/* ФИО */}
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-medium text-[#E5E7EB]">
                  ФИО
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-[#6B7280]" />
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Фамилия Имя Отчество"
                    className="pl-10 bg-[#374151] border-[#4B5563] text-[#E5E7EB] placeholder:text-[#6B7280] focus:border-[#3B82F6]"
                  />
                </div>
              </div>

              {/* Номер телефона */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-[#E5E7EB]">
                  Номер телефона
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-[#6B7280]" />
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+7 (000) 000-00-00"
                    className="pl-10 bg-[#374151] border-[#4B5563] text-[#E5E7EB] placeholder:text-[#6B7280] focus:border-[#3B82F6]"
                  />
                </div>
                {errors.phone && (
                  <p className="text-sm text-[#EF4444]">{errors.phone}</p>
                )}
              </div>

              {/* Дата рождения */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#E5E7EB]">
                  Дата рождения
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal bg-[#374151] border-[#4B5563] text-[#E5E7EB] hover:bg-[#4B5563]"
                    >
                      <Calendar className="mr-2 h-4 w-4 text-[#6B7280]" />
                      {birthDate ? (
                        format(birthDate, "dd MMMM yyyy", { locale: ru })
                      ) : (
                        <span className="text-[#6B7280]">Выберите дату</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-[#1F2937] border-[#4B5563]" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={birthDate}
                      onSelect={setBirthDate}
                      disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                      initialFocus
                      className="bg-[#1F2937] text-[#E5E7EB]"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Источник заявки */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-[#E5E7EB]">
                  Источник заявки *
                </Label>
                <RadioGroup value={source} onValueChange={setSource} className="space-y-3">
                  <div className="flex items-center space-x-3 rounded-lg bg-[#374151] p-3 hover:bg-[#4B5563] transition-colors">
                    <RadioGroupItem value="yandex_search" id="yandex" className="border-[#6B7280] text-[#3B82F6]" />
                    <Label htmlFor="yandex" className="text-[#E5E7EB] font-normal cursor-pointer flex-1">
                      Яндекс.Поиск
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 rounded-lg bg-[#374151] p-3 hover:bg-[#4B5563] transition-colors">
                    <RadioGroupItem value="google_search" id="google" className="border-[#6B7280] text-[#3B82F6]" />
                    <Label htmlFor="google" className="text-[#E5E7EB] font-normal cursor-pointer flex-1">
                      Google Поиск
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 rounded-lg bg-[#374151] p-3 hover:bg-[#4B5563] transition-colors">
                    <RadioGroupItem value="phone_call" id="phone" className="border-[#6B7280] text-[#3B82F6]" />
                    <Label htmlFor="phone" className="text-[#E5E7EB] font-normal cursor-pointer flex-1">
                      По телефону
                    </Label>
                  </div>
                </RadioGroup>
                {errors.source && (
                  <p className="text-sm text-[#EF4444]">{errors.source}</p>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1 bg-transparent border-[#4B5563] text-[#9CA3AF] hover:bg-[#374151] hover:text-[#E5E7EB]"
                >
                  Отмена
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-[#3B82F6] text-white hover:bg-[#2563EB] disabled:opacity-50"
                >
                  {isSubmitting ? "Создание..." : "Создать заявку"}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
