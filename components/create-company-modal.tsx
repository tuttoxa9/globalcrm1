"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Building2, Phone, Mail, Globe, MapPin, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { addCompany } from "@/lib/companies-firestore"
import { toast } from "sonner"

interface CreateCompanyModalProps {
  isOpen: boolean
  onClose: () => void
  onCompanyCreated: () => void
}

export default function CreateCompanyModal({
  isOpen,
  onClose,
  onCompanyCreated,
}: CreateCompanyModalProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [address, setAddress] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [website, setWebsite] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    // Проверяем обязательное поле - название компании
    if (!name.trim()) {
      newErrors.name = "Название компании обязательно для заполнения"
    }

    // Валидация email (если заполнен)
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "Некорректный формат email"
    }

    // Валидация телефона (если заполнен)
    if (phone.trim() && !/^[\+]?[0-9\s\-\(\)]{7,20}$/.test(phone.trim())) {
      newErrors.phone = "Некорректный формат номера телефона"
    }

    // Валидация сайта (если заполнен)
    if (website.trim() && !/^https?:\/\/.+/.test(website.trim())) {
      newErrors.website = "URL должен начинаться с http:// или https://"
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
      const companyData = {
        name: name.trim(),
        description: description.trim(),
        address: address.trim(),
        phone: phone.trim(),
        email: email.trim(),
        website: website.trim(),
        isActive: true,
        createdAt: new Date(),
      }

      const result = await addCompany(companyData)

      if (result.error) {
        toast.error("Ошибка при создании компании", {
          description: result.error,
        })
      } else {
        toast.success("Компания успешно создана", {
          description: `Компания "${name}" добавлена в систему`,
        })
        onCompanyCreated()
        handleClose()
      }
    } catch (error) {
      console.error("Error creating company:", error)
      toast.error("Ошибка при создании компании", {
        description: "Произошла неожиданная ошибка",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setName("")
    setDescription("")
    setAddress("")
    setPhone("")
    setEmail("")
    setWebsite("")
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
            className="relative w-full max-w-lg rounded-xl bg-[#1F2937] p-6 shadow-xl max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-[#3B82F6] p-2">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-[#E5E7EB] font-inter">
                  Создать компанию
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
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Название компании */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-[#E5E7EB]">
                  Название компании *
                </Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3 h-4 w-4 text-[#6B7280]" />
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ООО 'Название компании'"
                    className="pl-10 bg-[#374151] border-[#4B5563] text-[#E5E7EB] placeholder:text-[#6B7280] focus:border-[#3B82F6]"
                  />
                </div>
                {errors.name && (
                  <p className="text-sm text-[#EF4444]">{errors.name}</p>
                )}
              </div>

              {/* Описание */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-[#E5E7EB]">
                  Описание
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Краткое описание деятельности компании"
                  className="bg-[#374151] border-[#4B5563] text-[#E5E7EB] placeholder:text-[#6B7280] focus:border-[#3B82F6] resize-none"
                  rows={3}
                />
              </div>

              {/* Адрес */}
              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-medium text-[#E5E7EB]">
                  Адрес
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-[#6B7280]" />
                  <Input
                    id="address"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="г. Москва, ул. Примерная, д. 1"
                    className="pl-10 bg-[#374151] border-[#4B5563] text-[#E5E7EB] placeholder:text-[#6B7280] focus:border-[#3B82F6]"
                  />
                </div>
              </div>

              {/* Телефон */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-[#E5E7EB]">
                  Телефон
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

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-[#E5E7EB]">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-[#6B7280]" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="info@company.ru"
                    className="pl-10 bg-[#374151] border-[#4B5563] text-[#E5E7EB] placeholder:text-[#6B7280] focus:border-[#3B82F6]"
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-[#EF4444]">{errors.email}</p>
                )}
              </div>

              {/* Сайт */}
              <div className="space-y-2">
                <Label htmlFor="website" className="text-sm font-medium text-[#E5E7EB]">
                  Сайт
                </Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 h-4 w-4 text-[#6B7280]" />
                  <Input
                    id="website"
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://company.ru"
                    className="pl-10 bg-[#374151] border-[#4B5563] text-[#E5E7EB] placeholder:text-[#6B7280] focus:border-[#3B82F6]"
                  />
                </div>
                {errors.website && (
                  <p className="text-sm text-[#EF4444]">{errors.website}</p>
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
                  {isSubmitting ? "Создание..." : "Создать компанию"}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
