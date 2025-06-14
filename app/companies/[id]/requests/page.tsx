"use client"

import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Building2, Search, Download, Calendar, Phone, User, Mail, FileText, Filter } from "lucide-react"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/hooks/useAuth"
import { getUnicRequestsByCompany, type UnicRequest } from "@/lib/unic-firestore"
import { getCompanies, type Company } from "@/lib/companies-firestore"
import { toast } from "sonner"
import * as XLSX from "xlsx"

export default function CompanyRequestsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const companyId = params.id as string

  const [company, setCompany] = useState<Company | null>(null)
  const [requests, setRequests] = useState<UnicRequest[]>([])
  const [filteredRequests, setFilteredRequests] = useState<UnicRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("all")

  useEffect(() => {
    loadData()
  }, [companyId])

  useEffect(() => {
    filterRequests()
  }, [requests, searchQuery, statusFilter, dateFilter])

  const loadData = async () => {
    try {
      setLoading(true)

      // Загружаем компанию и заявки параллельно
      const [companiesData, requestsData] = await Promise.all([
        getCompanies(),
        getUnicRequestsByCompany(companyId)
      ])

      const foundCompany = companiesData.find(c => c.id === companyId)
      if (!foundCompany) {
        toast.error("Компания не найдена")
        router.push("/companies")
        return
      }

      setCompany(foundCompany)
      setRequests(requestsData)
    } catch (error) {
      console.error("Error loading data:", error)
      toast.error("Ошибка загрузки данных")
    } finally {
      setLoading(false)
    }
  }

  const filterRequests = () => {
    let filtered = [...requests]

    // Фильтр по поисковому запросу
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter(request =>
        request.fullName.toLowerCase().includes(query) ||
        request.phone.toLowerCase().includes(query) ||
        (request.comment && request.comment.toLowerCase().includes(query))
      )
    }

    // Фильтр по статусу
    if (statusFilter !== "all") {
      filtered = filtered.filter(request => request.status === statusFilter)
    }

    // Фильтр по дате
    if (dateFilter !== "all") {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

      filtered = filtered.filter(request => {
        const requestDate = new Date(request.createdAt)
        const requestDay = new Date(requestDate.getFullYear(), requestDate.getMonth(), requestDate.getDate())

        switch (dateFilter) {
          case "today":
            return requestDay.getTime() === today.getTime()
          case "week":
            const weekAgo = new Date(today)
            weekAgo.setDate(today.getDate() - 7)
            return requestDay >= weekAgo
          case "month":
            const monthAgo = new Date(today)
            monthAgo.setMonth(today.getMonth() - 1)
            return requestDay >= monthAgo
          default:
            return true
        }
      })
    }

    setFilteredRequests(filtered)
  }

  const exportToExcel = () => {
    if (filteredRequests.length === 0) {
      toast.error("Нет данных для экспорта")
      return
    }

    try {
      const exportData = filteredRequests.map(request => ({
        "ID": request.id,
        "ФИО": request.fullName,
        "Телефон": request.phone,
        "Дата рождения": request.birthDate || "",
        "Статус": getStatusDisplayName(request.status),
        "Источник": request.source || "",
        "Комментарий": request.comment || "",
        "Дата создания": new Date(request.createdAt).toLocaleString("ru-RU"),
        "Дата обновления": new Date(request.updatedAt || request.createdAt).toLocaleString("ru-RU"),
      }))

      const ws = XLSX.utils.json_to_sheet(exportData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, "Заявки")

      const filename = `${company?.name || "Company"}_requests_${new Date().toISOString().split('T')[0]}.xlsx`
      XLSX.writeFile(wb, filename)

      toast.success("Файл успешно экспортирован")
    } catch (error) {
      console.error("Error exporting to Excel:", error)
      toast.error("Ошибка при экспорте файла")
    }
  }

  const getStatusDisplayName = (status: string) => {
    switch (status) {
      case "new": return "Новая"
      case "accepted": return "Принята"
      case "rejected": return "Отклонена"
      case "no_answer": return "Не ответили"
      default: return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new": return "bg-[#3B82F6]"
      case "accepted": return "bg-[#10B981]"
      case "rejected": return "bg-[#EF4444]"
      case "no_answer": return "bg-[#F59E0B]"
      default: return "bg-[#6B7280]"
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

  const handleBack = () => {
    router.push("/companies")
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
            Загрузка заявок...
          </div>
        </motion.div>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-[#111827]">
        <div className="text-center">
          <h1 className="text-2xl font-light text-[#E5E7EB] font-montserrat">Компания не найдена</h1>
          <button onClick={handleBack} className="mt-4 text-[#E5E7EB] hover:text-white transition-colors font-inter">
            Вернуться к компаниям
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen w-full bg-[#111827] p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-[#CBD5E0] transition-colors hover:text-[#E5E7EB]"
            >
              <ArrowLeft className="h-5 w-5" />
              Назад к компаниям
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-[#3B82F6] p-2">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-light text-[#E5E7EB] font-montserrat">
                {company.name}
              </h1>
              <p className="text-sm text-[#9CA3AF] font-inter">
                Заявки компании • {filteredRequests.length} из {requests.length}
              </p>
            </div>
          </div>

          <Button
            onClick={exportToExcel}
            disabled={filteredRequests.length === 0}
            className="bg-[#10B981] text-white hover:bg-[#059669] disabled:opacity-50"
          >
            <Download className="mr-2 h-4 w-4" />
            Экспорт в Excel
          </Button>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid gap-4 sm:grid-cols-4"
        >
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-[#6B7280]" />
            <Input
              placeholder="Поиск по ФИО, телефону..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-[#1F2937] border-[#374151] text-[#E5E7EB] placeholder:text-[#6B7280]"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-[#1F2937] border-[#374151] text-[#E5E7EB]">
              <SelectValue placeholder="Статус" />
            </SelectTrigger>
            <SelectContent className="bg-[#1F2937] border-[#374151]">
              <SelectItem value="all" className="text-[#E5E7EB]">Все статусы</SelectItem>
              <SelectItem value="new" className="text-[#E5E7EB]">Новые</SelectItem>
              <SelectItem value="accepted" className="text-[#E5E7EB]">Принятые</SelectItem>
              <SelectItem value="rejected" className="text-[#E5E7EB]">Отклоненные</SelectItem>
              <SelectItem value="no_answer" className="text-[#E5E7EB]">Не ответили</SelectItem>
            </SelectContent>
          </Select>

          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="bg-[#1F2937] border-[#374151] text-[#E5E7EB]">
              <SelectValue placeholder="Период" />
            </SelectTrigger>
            <SelectContent className="bg-[#1F2937] border-[#374151]">
              <SelectItem value="all" className="text-[#E5E7EB]">Все время</SelectItem>
              <SelectItem value="today" className="text-[#E5E7EB]">Сегодня</SelectItem>
              <SelectItem value="week" className="text-[#E5E7EB]">Неделя</SelectItem>
              <SelectItem value="month" className="text-[#E5E7EB]">Месяц</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2 text-sm text-[#9CA3AF]">
            <Filter className="h-4 w-4" />
            Найдено: {filteredRequests.length}
          </div>
        </motion.div>
      </motion.div>

      {/* Requests Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
      >
        {filteredRequests.map((request, index) => (
          <motion.div
            key={request.id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="bg-[#1F2937] border-[#374151] hover:border-[#4B5563] transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg font-semibold text-[#E5E7EB] font-inter">
                    {request.fullName}
                  </CardTitle>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(request.status)}`}>
                    {getStatusDisplayName(request.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-[#CBD5E0]">
                    <Phone className="h-4 w-4 text-[#10B981]" />
                    <span className="font-inter">{request.phone}</span>
                  </div>

                  {request.birthDate && (
                    <div className="flex items-center gap-2 text-sm text-[#CBD5E0]">
                      <User className="h-4 w-4 text-[#F59E0B]" />
                      <span className="font-inter text-xs">{request.birthDate}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm text-[#CBD5E0]">
                    <Calendar className="h-4 w-4 text-[#6366F1]" />
                    <span className="font-inter text-xs">{formatDate(request.createdAt)}</span>
                  </div>

                  {request.source && (
                    <div className="flex items-center gap-2 text-sm text-[#CBD5E0]">
                      <FileText className="h-4 w-4 text-[#8B5CF6]" />
                      <span className="font-inter text-xs">{request.source}</span>
                    </div>
                  )}
                </div>

                {request.comment && (
                  <div className="mt-3 pt-3 border-t border-[#374151]">
                    <p className="text-sm text-[#9CA3AF] font-inter line-clamp-2">
                      {request.comment}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {filteredRequests.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full text-center py-12"
          >
            <FileText className="mx-auto h-12 w-12 text-[#6B7280] mb-4" />
            <h3 className="text-lg font-semibold text-[#E5E7EB] font-inter mb-2">
              {requests.length === 0 ? "Нет заявок" : "Заявки не найдены"}
            </h3>
            <p className="text-[#9CA3AF] font-inter">
              {requests.length === 0
                ? "В эту компанию пока не поступало заявок"
                : "Попробуйте изменить параметры поиска"
              }
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
