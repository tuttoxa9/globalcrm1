"use client"

import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, User, Plus, Edit, Trash2, Building2, Phone, Mail } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/useAuth"
import {
  getCompanies,
  getCouriers,
  addCourier,
  updateCourier,
  deleteCourier,
  type Company,
  type Courier
} from "@/lib/companies-firestore"
import { toast } from "sonner"

interface CourierFormData {
  fullName: string
  phone: string
  email: string
  companyId: string
}

export default function CouriersPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [couriers, setCouriers] = useState<Courier[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingCourier, setEditingCourier] = useState<Courier | null>(null)
  const [formData, setFormData] = useState<CourierFormData>({
    fullName: "",
    phone: "",
    email: "",
    companyId: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [couriersData, companiesData] = await Promise.all([
        getCouriers(),
        getCompanies(),
      ])
      setCouriers(couriersData)
      setCompanies(companiesData)
    } catch (error) {
      console.error("Error loading data:", error)
      toast.error("Ошибка загрузки данных")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.fullName.trim()) {
      toast.error("ФИО курьера обязательно")
      return
    }

    if (!formData.phone.trim()) {
      toast.error("Номер телефона обязателен")
      return
    }

    setIsSubmitting(true)

    try {
      const courierData = {
        ...formData,
        isActive: true,
        createdAt: new Date(),
      }

      let result
      if (editingCourier) {
        result = await updateCourier(editingCourier.id, courierData)
      } else {
        result = await addCourier(courierData)
      }

      if (result.error) {
        toast.error("Ошибка сохранения", {
          description: result.error,
        })
      } else {
        toast.success(
          editingCourier ? "Курьер обновлен" : "Курьер создан",
          { description: `${formData.fullName} успешно сохранен` }
        )
        await loadData()
        handleCloseModal()
      }
    } catch (error) {
      console.error("Error saving courier:", error)
      toast.error("Ошибка сохранения курьера")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (courier: Courier) => {
    if (!confirm(`Вы уверены, что хотите удалить курьера "${courier.fullName}"?`)) {
      return
    }

    try {
      const result = await deleteCourier(courier.id)
      if (result.error) {
        toast.error("Ошибка удаления", {
          description: result.error,
        })
      } else {
        toast.success("Курьер удален", {
          description: `${courier.fullName} успешно удален`,
        })
        await loadData()
      }
    } catch (error) {
      console.error("Error deleting courier:", error)
      toast.error("Ошибка удаления курьера")
    }
  }

  const handleEdit = (courier: Courier) => {
    setEditingCourier(courier)
    setFormData({
      fullName: courier.fullName,
      phone: courier.phone,
      email: courier.email || "",
      companyId: courier.companyId || "",
    })
    setIsCreateModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsCreateModalOpen(false)
    setEditingCourier(null)
    setFormData({
      fullName: "",
      phone: "",
      email: "",
      companyId: "",
    })
  }

  const getCompanyName = (companyId: string) => {
    if (!companyId) return "Не назначена"
    const company = companies.find(c => c.id === companyId)
    return company?.name || "Компания не найдена"
  }

  const handleBack = () => {
    router.push("/projects")
  }

  if (loading) {
    return (
      <div className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-[#111827]">
        <motion.div
          initial={{ opacity: 0, filter: "blur(20px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center"
        >
          <div className="text-lg font-light text-[#E5E7EB] font-montserrat">
            MNG
          </div>
          <div className="mt-2 text-sm text-[#6B7280] font-inter">
            Загрузка курьеров...
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen w-full bg-[#111827] p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-[#CBD5E0] transition-colors hover:text-[#E5E7EB]"
          >
            <ArrowLeft className="h-5 w-5" />
            Назад к проектам
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-[#8B5CF6] p-2">
            <User className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-light text-[#E5E7EB] font-montserrat">
              Управление курьерами
            </h1>
            <p className="text-sm text-[#9CA3AF] font-inter">
              Создавайте и управляйте курьерами
            </p>
          </div>
        </div>

        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-[#8B5CF6] text-white hover:bg-[#7C3AED]"
        >
          <Plus className="mr-2 h-4 w-4" />
          Добавить курьера
        </Button>
      </motion.div>

      {/* Couriers Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {couriers.map((courier, index) => (
          <motion.div
            key={courier.id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="bg-[#1F2937] border-[#374151] hover:border-[#4B5563] transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-[#8B5CF6] p-2">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-[#E5E7EB] font-inter">
                        {courier.fullName}
                      </CardTitle>
                      <p className="text-sm text-[#9CA3AF] font-inter">
                        {getCompanyName(courier.companyId || "")}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(courier)}
                      className="h-8 w-8 p-0 text-[#9CA3AF] hover:text-[#E5E7EB] hover:bg-[#374151]"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(courier)}
                      className="h-8 w-8 p-0 text-[#9CA3AF] hover:text-[#EF4444] hover:bg-[#374151]"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-[#6B7280]" />
                    <span className="text-sm text-[#CBD5E0] font-inter">
                      {courier.phone}
                    </span>
                  </div>
                  {courier.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-[#6B7280]" />
                      <span className="text-sm text-[#CBD5E0] font-inter">
                        {courier.email}
                      </span>
                    </div>
                  )}
                  {courier.companyId && (
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-[#6B7280]" />
                      <span className="text-sm text-[#CBD5E0] font-inter">
                        {getCompanyName(courier.companyId)}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {couriers.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full text-center py-12"
          >
            <User className="mx-auto h-12 w-12 text-[#6B7280] mb-4" />
            <h3 className="text-lg font-semibold text-[#E5E7EB] font-inter mb-2">
              Нет курьеров
            </h3>
            <p className="text-[#9CA3AF] font-inter mb-4">
              Создайте первого курьера для работы с заявками
            </p>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-[#8B5CF6] text-white hover:bg-[#7C3AED]"
            >
              <Plus className="mr-2 h-4 w-4" />
              Создать курьера
            </Button>
          </motion.div>
        )}
      </motion.div>

      {/* Create/Edit Courier Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={handleCloseModal}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md rounded-xl bg-[#1F2937] p-6 shadow-xl"
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-[#E5E7EB] font-inter">
                  {editingCourier ? "Редактировать курьера" : "Создать курьера"}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCloseModal}
                  className="h-8 w-8 p-0 text-[#9CA3AF] hover:text-[#E5E7EB]"
                >
                  ✕
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="fullName" className="text-sm font-medium text-[#E5E7EB]">
                    ФИО *
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Фамилия Имя Отчество"
                    className="mt-1 bg-[#374151] border-[#4B5563] text-[#E5E7EB] placeholder:text-[#6B7280]"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-sm font-medium text-[#E5E7EB]">
                    Номер телефона *
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+7 (000) 000-00-00"
                    className="mt-1 bg-[#374151] border-[#4B5563] text-[#E5E7EB] placeholder:text-[#6B7280]"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-[#E5E7EB]">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="courier@example.com"
                    className="mt-1 bg-[#374151] border-[#4B5563] text-[#E5E7EB] placeholder:text-[#6B7280]"
                  />
                </div>

                <div>
                  <Label htmlFor="companyId" className="text-sm font-medium text-[#E5E7EB]">
                    Компания
                  </Label>
                  <Select
                    value={formData.companyId}
                    onValueChange={(value) => setFormData({ ...formData, companyId: value })}
                  >
                    <SelectTrigger className="mt-1 bg-[#374151] border-[#4B5563] text-[#E5E7EB]">
                      <SelectValue placeholder="Выберите компанию" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1F2937] border-[#4B5563]">
                      <SelectItem value="" className="text-[#E5E7EB] focus:bg-[#374151]">
                        Не назначена
                      </SelectItem>
                      {companies.map((company) => (
                        <SelectItem
                          key={company.id}
                          value={company.id}
                          className="text-[#E5E7EB] focus:bg-[#374151]"
                        >
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseModal}
                    className="flex-1 bg-transparent border-[#4B5563] text-[#9CA3AF] hover:bg-[#374151] hover:text-[#E5E7EB]"
                  >
                    Отмена
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-[#8B5CF6] text-white hover:bg-[#7C3AED] disabled:opacity-50"
                  >
                    {isSubmitting ? "Сохранение..." : editingCourier ? "Обновить" : "Создать"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
