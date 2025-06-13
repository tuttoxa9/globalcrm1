"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Download, FileSpreadsheet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UnicRequest } from "@/lib/unic-firestore"
import * as XLSX from "xlsx"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { toast } from "sonner"

interface ExportExcelButtonProps {
  requests: UnicRequest[]
  className?: string
}

export default function ExportExcelButton({ requests, className = "" }: ExportExcelButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  const getSourceDisplayName = (source: string) => {
    switch (source) {
      case "yandex_search":
        return "Яндекс.Поиск"
      case "google_search":
        return "Google Поиск"
      case "phone_call":
        return "По телефону"
      default:
        return source || "Не указан"
    }
  }

  const getStatusDisplayName = (status: string) => {
    switch (status) {
      case "new":
        return "Новая"
      case "accepted":
        return "Принята"
      case "rejected":
        return "Отклонена"
      case "no_answer":
        return "Не отвечает"
      default:
        return status || "Неизвестно"
    }
  }

  const handleExport = async () => {
    if (requests.length === 0) {
      toast.error("Нет данных для экспорта")
      return
    }

    setIsExporting(true)

    try {
      // Подготавливаем данные для экспорта
      const exportData = requests.map((request, index) => ({
        "№": index + 1,
        "ID заявки": request.id,
        "Дата создания": request.createdAt ? format(new Date(request.createdAt), "dd.MM.yyyy HH:mm", { locale: ru }) : "",
        "ФИО клиента": request.fullName || "",
        "Номер телефона": request.phone || "",
        "Дата рождения": request.birthDate || "",
        "Источник заявки": getSourceDisplayName(request.source || ""),
        "Статус заявки": getStatusDisplayName(request.status),
        "Назначенный курьер": request.assignedTo || "Не назначен",
        "Приоритет": request.priority === "high" ? "Высокий" : request.priority === "low" ? "Низкий" : "Средний",
        "Теги": request.tags?.join(", ") || "",
        "Комментарий": request.comment || "",
        "Referrer": request.referrer || "",
        "User Agent": request.userAgent || "",
        "Дата обновления": request.updatedAt ? format(new Date(request.updatedAt), "dd.MM.yyyy HH:mm", { locale: ru }) : "",
      }))

      // Создаем рабочую книгу
      const workbook = XLSX.utils.book_new()

      // Создаем лист с данными
      const worksheet = XLSX.utils.json_to_sheet(exportData)

      // Настраиваем ширину колонок
      const columnWidths = [
        { wch: 5 },   // №
        { wch: 20 },  // ID заявки
        { wch: 18 },  // Дата создания
        { wch: 25 },  // ФИО клиента
        { wch: 18 },  // Номер телефона
        { wch: 15 },  // Дата рождения
        { wch: 18 },  // Источник заявки
        { wch: 15 },  // Статус заявки
        { wch: 20 },  // Назначенный курьер
        { wch: 12 },  // Приоритет
        { wch: 20 },  // Теги
        { wch: 30 },  // Комментарий
        { wch: 20 },  // Referrer
        { wch: 25 },  // User Agent
        { wch: 18 },  // Дата обновления
      ]
      worksheet["!cols"] = columnWidths

      // Добавляем лист в книгу
      XLSX.utils.book_append_sheet(workbook, worksheet, "Заявки")

      // Создаем лист с общей статистикой
      const stats = {
        "Общее количество заявок": requests.length,
        "Новые заявки": requests.filter(r => r.status === "new").length,
        "Принятые заявки": requests.filter(r => r.status === "accepted").length,
        "Отклоненные заявки": requests.filter(r => r.status === "rejected").length,
        "Не отвечают": requests.filter(r => r.status === "no_answer").length,
      }

      const statsData = Object.entries(stats).map(([key, value]) => ({
        "Показатель": key,
        "Значение": value,
      }))

      const statsWorksheet = XLSX.utils.json_to_sheet(statsData)
      statsWorksheet["!cols"] = [{ wch: 25 }, { wch: 15 }]
      XLSX.utils.book_append_sheet(workbook, statsWorksheet, "Статистика")

      // Генерируем имя файла с текущей датой
      const fileName = `заявки_${format(new Date(), "dd-MM-yyyy_HH-mm")}.xlsx`

      // Сохраняем файл
      XLSX.writeFile(workbook, fileName)

      toast.success("Экспорт завершен", {
        description: `Файл ${fileName} успешно загружен`,
      })
    } catch (error) {
      console.error("Export error:", error)
      toast.error("Ошибка экспорта", {
        description: "Не удалось экспортировать данные",
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <motion.div whileTap={{ scale: 0.98 }}>
      <Button
        onClick={handleExport}
        disabled={isExporting || requests.length === 0}
        className={`bg-[#10B981] text-white hover:bg-[#059669] disabled:opacity-50 ${className}`}
      >
        <motion.div
          animate={isExporting ? { rotate: 360 } : { rotate: 0 }}
          transition={{ duration: 1, repeat: isExporting ? Infinity : 0, ease: "linear" }}
        >
          {isExporting ? (
            <FileSpreadsheet className="mr-2 h-4 w-4" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
        </motion.div>
        {isExporting ? "Экспорт..." : "Экспорт в Excel"}
      </Button>
    </motion.div>
  )
}
