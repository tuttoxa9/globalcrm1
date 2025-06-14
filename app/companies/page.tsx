"use client"

import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Building2, Plus, Edit, Trash2, Users, FileText } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/useAuth"
import {
  getCompanies,
  getCouriers,
  addCompany,
  updateCompany,
  deleteCompany,
  type Company,
  type Courier
} from "@/lib/companies-firestore"
import { toast } from "sonner"

interface CompanyFormData {
  name: string
  description: string
  address: string
  phone: string
  email: string
  website: string
}

export default function CompaniesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [companies, setCompanies] = useState<Company[]>([])
  const [couriers, setCouriers] = useState<Courier[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)
  const [formData, setFormData] = useState<CompanyFormData>({
    name: "",
    description: "",
    address: "",
    phone: "",
    email: "",
    website: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [companiesData, couriersData] = await Promise.all([
        getCompanies(),
        getCouriers(),
      ])
      setCompanies(companiesData)
      setCouriers(couriersData)
    } catch (error) {
      console.error("Error loading data:", error)
      toast.error("Ошибка загрузки данных")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error("Название компании обязательно")
      return
    }

    setIsSubmitting(true)

    try {
      const companyData = {
        ...formData,
        isActive: true,
        createdAt: new Date(),
      }

      let result
      if (editingCompany) {
        result = await updateCompany(editingCompany.id, companyData)
      } else {
        result = await addCompany(companyData)
      }

      if (result.error) {
        toast.error("Ошибка сохранения", {
          description: result.error,
        })
      } else {
        toast.success(
          editingCompany ? "Компания обновлена" : "Компания создана",
          { description: `${formData.name} успешно сохранена` }
        )
        await loadData()
        handleCloseModal()
      }
    } catch (error) {
      console.error("Error saving company:", error)
      toast.error("Ошибка сохранения компании")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (company: Company) => {
    if (!confirm(`Вы уверены, что хотите удалить компанию "${company.name}"?`)) {
      return
    }

    try {
      const result = await deleteCompany(company.id)
      if (result.error) {
        toast.error("Ошибка удаления", {
          description: result.error,
        })
      } else {
        toast.success("Компания удалена", {
          description: `${company.name} успешно удалена`,
        })
        await loadData()
      }
    } catch (error) {
      console.error("Error deleting company:", error)
      toast.error("Ошибка удаления компании")
    }
  }

  const handleEdit = (company: Company) => {
    setEditingCompany(company)
    setFormData({
      name: company.name,
      description: company.description || "",
      address: company.address || "",
      phone: company.phone || "",
      email: company.email || "",
      website: company.website || "",
    })
    setIsCreateModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsCreateModalOpen(false)
    setEditingCompany(null)
    setFormData({
      name: "",
      description: "",
      address: "",
      phone: "",
      email: "",
      website: "",
    })
  }

  const getCompanyCouriersCount = (companyId: string) => {
    return couriers.filter(courier => courier.companyId === companyId && courier.isActive).length
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
            Загрузка компаний...
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
          <div className="rounded-lg bg-[#3B82F6] p-2">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-light text-[#E5E7EB] font-montserrat">
              Управление компаниями
            </h1>
            <p className="text-sm text-[#9CA3AF] font-inter">
              Создавайте и управляйте компаниями
            </p>
          </div>
        </div>

        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-[#3B82F6] text-white hover:bg-[#2563EB]"
        >
          <Plus className="mr-2 h-4 w-4" />
          Добавить компанию
        </Button>
      </motion.div>

      {/* Companies Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {companies.map((company, index) => (
          <motion.div
            key={company.id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="bg-[#1F2937] border-[#374151] hover:border-[#4B5563] transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg font-semibold text-[#E5E7EB] font-inter line-clamp-2">
                    {company.name}
                  </CardTitle>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(company)}
                      className="h-8 w-8 p-0 text-[#9CA3AF] hover:text-[#E5E7EB] hover:bg-[#374151]"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(company)}
                      className="h-8 w-8 p-0 text-[#9CA3AF] hover:text-[#EF4444] hover:bg-[#374151]"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {company.description && (
                  <p className="text-sm text-[#9CA3AF] font-inter line-clamp-2">
                    {company.description}
                  </p>
                )}
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {company.phone && (
                    <p className="text-sm text-[#CBD5E0] font-inter">
                      📞 {company.phone}
                    </p>
                  )}
                  {company.email && (
                    <p className="text-sm text-[#CBD5E0] font-inter">
                      ✉️ {company.email}
                    </p>
                  )}
                  {company.address && (
                    <p className="text-sm text-[#CBD5E0] font-inter line-clamp-2">
                      📍 {company.address}
                    </p>
                  )}
                  <div className="space-y-2 mt-3 pt-2 border-t border-[#374151]">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-[#6B7280]" />
                      <span className="text-sm text-[#9CA3AF] font-inter">
                        {getCompanyCouriersCount(company.id)} курьеров
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/companies/${company.id}/requests`)}
                      className="w-full bg-transparent border-[#4B5563] text-[#9CA3AF] hover:bg-[#374151] hover:text-[#E5E7EB] text-xs"
                    >
                      <FileText className="mr-2 h-3 w-3" />
                      Посмотреть заявки
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {companies.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full text-center py-12"
          >
            <Building2 className="mx-auto h-12 w-12 text-[#6B7280] mb-4" />
            <h3 className="text-lg font-semibold text-[#E5E7EB] font-inter mb-2">
              Нет компаний
            </h3>
            <p className="text-[#9CA3AF] font-inter mb-4">
              Создайте первую компанию для управления курьерами
            </p>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-[#3B82F6] text-white hover:bg-[#2563EB]"
            >
              <Plus className="mr-2 h-4 w-4" />
              Создать компанию
            </Button>
          </motion.div>
        )}
      </motion.div>

      {/* Create/Edit Company Modal */}
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
              className="relative w-full max-w-lg rounded-xl bg-[#1F2937] p-6 shadow-xl"
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-[#E5E7EB] font-inter">
                  {editingCompany ? "Редактировать компанию" : "Создать компанию"}
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
                  <Label htmlFor="name" className="text-sm font-medium text-[#E5E7EB]">
                    Название компании *
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Название компании"
                    className="mt-1 bg-[#374151] border-[#4B5563] text-[#E5E7EB] placeholder:text-[#6B7280]"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-sm font-medium text-[#E5E7EB]">
                    Описание
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Описание компании"
                    className="mt-1 bg-[#374151] border-[#4B5563] text-[#E5E7EB] placeholder:text-[#6B7280]"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium text-[#E5E7EB]">
                      Телефон
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+7 (000) 000-00-00"
                      className="mt-1 bg-[#374151] border-[#4B5563] text-[#E5E7EB] placeholder:text-[#6B7280]"
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
                      placeholder="company@example.com"
                      className="mt-1 bg-[#374151] border-[#4B5563] text-[#E5E7EB] placeholder:text-[#6B7280]"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address" className="text-sm font-medium text-[#E5E7EB]">
                    Адрес
                  </Label>
                  <Input
                    id="address"
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Адрес компании"
                    className="mt-1 bg-[#374151] border-[#4B5563] text-[#E5E7EB] placeholder:text-[#6B7280]"
                  />
                </div>

                <div>
                  <Label htmlFor="website" className="text-sm font-medium text-[#E5E7EB]">
                    Веб-сайт
                  </Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://example.com"
                    className="mt-1 bg-[#374151] border-[#4B5563] text-[#E5E7EB] placeholder:text-[#6B7280]"
                  />
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
                    className="flex-1 bg-[#3B82F6] text-white hover:bg-[#2563EB] disabled:opacity-50"
                  >
                    {isSubmitting ? "Сохранение..." : editingCompany ? "Обновить" : "Создать"}
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
