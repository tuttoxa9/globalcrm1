"use client"
import { motion, AnimatePresence } from "framer-motion"
import { X, TrendingUp, Calendar, Clock, BarChart3, PieChart, Check, XCircle, Phone, Users, Globe, Monitor, Smartphone, UserCheck, Filter } from "lucide-react"
import { useState, useMemo } from "react"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePickerWithRange } from "@/components/date-range-picker"
import { subDays, format, isWithinInterval, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns"
import { ru } from "date-fns/locale"
import { DateRange } from "react-day-picker"

interface EnhancedStatsModalProps {
  isOpen: boolean
  onClose: () => void
  statistics: Record<string, unknown>
  requests?: Record<string, unknown>[]
}

type Period = 'today' | 'yesterday' | 'week' | 'month' | 'quarter' | 'year' | 'custom'

export default function EnhancedStatsModal({ isOpen, onClose, statistics, requests = [] }: EnhancedStatsModalProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('week')
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 7),
    to: new Date()
  })

  // Фильтрация данных по выбранному периоду
  const filteredData = useMemo(() => {
    if (!requests.length) return { requests: [], stats: null }

    let from: Date
    let to: Date = new Date()

    switch (selectedPeriod) {
      case 'today':
        from = new Date()
        from.setHours(0, 0, 0, 0)
        to.setHours(23, 59, 59, 999)
        break
      case 'yesterday':
        from = subDays(new Date(), 1)
        from.setHours(0, 0, 0, 0)
        to = subDays(new Date(), 1)
        to.setHours(23, 59, 59, 999)
        break
      case 'week':
        from = startOfWeek(new Date(), { weekStartsOn: 1 })
        to = endOfWeek(new Date(), { weekStartsOn: 1 })
        break
      case 'month':
        from = startOfMonth(new Date())
        to = endOfMonth(new Date())
        break
      case 'quarter':
        const quarterStart = new Date()
        quarterStart.setMonth(Math.floor(quarterStart.getMonth() / 3) * 3, 1)
        quarterStart.setHours(0, 0, 0, 0)
        from = quarterStart
        const quarterEnd = new Date(quarterStart)
        quarterEnd.setMonth(quarterEnd.getMonth() + 3, 0)
        quarterEnd.setHours(23, 59, 59, 999)
        to = quarterEnd
        break
      case 'year':
        from = startOfYear(new Date())
        to = endOfYear(new Date())
        break
      case 'custom':
        if (!dateRange?.from || !dateRange?.to) return { requests: [], stats: null }
        from = dateRange.from
        to = dateRange.to
        break
      default:
        from = subDays(new Date(), 7)
    }

    const filteredRequests = requests.filter(request => {
      const requestDate = new Date(request.createdAt)
      return isWithinInterval(requestDate, { start: from, end: to })
    })

    // Вычисляем статистику для отфильтрованных данных
    const stats = {
      total: filteredRequests.length,
      accepted: filteredRequests.filter(r => r.status === 'accepted').length,
      rejected: filteredRequests.filter(r => r.status === 'rejected').length,
      new: filteredRequests.filter(r => r.status === 'new' || r.status === 'no_answer').length,
      conversionRate: filteredRequests.length > 0
        ? (filteredRequests.filter(r => r.status === 'accepted').length / filteredRequests.length) * 100
        : 0
    }

    return { requests: filteredRequests, stats, period: { from, to } }
  }, [requests, selectedPeriod, dateRange])

  // Расширенная аналитика по отфильтрованным данным
  const getExtendedAnalytics = () => {
    if (!filteredData.requests || filteredData.requests.length === 0) return {}

    const reqs = filteredData.requests

    // Анализ по источникам
    const sourceStats = reqs.reduce((acc, req) => {
      const source = req.source || 'Неизвестно'
      acc[source] = (acc[source] || 0) + 1
      return acc
    }, {})

    // Анализ по приоритетам
    const priorityStats = reqs.reduce((acc, req) => {
      const priority = req.priority || 'medium'
      acc[priority] = (acc[priority] || 0) + 1
      return acc
    }, {})

    // Анализ по устройствам
    const deviceStats = reqs.reduce((acc, req) => {
      if (!req.userAgent) {
        acc['unknown'] = (acc['unknown'] || 0) + 1
        return acc
      }

      const ua = req.userAgent.toLowerCase()
      if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
        acc['mobile'] = (acc['mobile'] || 0) + 1
      } else if (ua.includes('tablet') || ua.includes('ipad')) {
        acc['tablet'] = (acc['tablet'] || 0) + 1
      } else {
        acc['desktop'] = (acc['desktop'] || 0) + 1
      }
      return acc
    }, {})

    // Анализ по браузерам
    const browserStats = reqs.reduce((acc, req) => {
      if (!req.userAgent) {
        acc['unknown'] = (acc['unknown'] || 0) + 1
        return acc
      }

      const ua = req.userAgent.toLowerCase()
      if (ua.includes('chrome') && !ua.includes('edg')) acc['chrome'] = (acc['chrome'] || 0) + 1
      else if (ua.includes('firefox')) acc['firefox'] = (acc['firefox'] || 0) + 1
      else if (ua.includes('safari') && !ua.includes('chrome')) acc['safari'] = (acc['safari'] || 0) + 1
      else if (ua.includes('edge')) acc['edge'] = (acc['edge'] || 0) + 1
      else acc['other'] = (acc['other'] || 0) + 1
      return acc
    }, {})

    // Анализ по времени создания (по часам)
    const timeStats = reqs.reduce((acc, req) => {
      const hour = new Date(req.createdAt).getHours()
      acc[hour] = (acc[hour] || 0) + 1
      return acc
    }, {})

    // Анализ по дням недели
    const dayStats = reqs.reduce((acc, req) => {
      const day = new Date(req.createdAt).getDay()
      const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
      const dayName = dayNames[day]
      acc[dayName] = (acc[dayName] || 0) + 1
      return acc
    }, {})

    // Анализ по возрастным группам
    const ageStats = reqs.reduce((acc, req) => {
      if (req.birthDate) {
        try {
          const [day, month, year] = req.birthDate.split('.')
          const birthDate = new Date(Number(year), Number(month) - 1, Number(day))
          const age = new Date().getFullYear() - birthDate.getFullYear()

          if (age < 18) acc['<18'] = (acc['<18'] || 0) + 1
          else if (age < 25) acc['18-24'] = (acc['18-24'] || 0) + 1
          else if (age < 35) acc['25-34'] = (acc['25-34'] || 0) + 1
          else if (age < 45) acc['35-44'] = (acc['35-44'] || 0) + 1
          else if (age < 55) acc['45-54'] = (acc['45-54'] || 0) + 1
          else acc['55+'] = (acc['55+'] || 0) + 1
        } catch {
          acc['unknown'] = (acc['unknown'] || 0) + 1
        }
      } else {
        acc['unknown'] = (acc['unknown'] || 0) + 1
      }
      return acc
    }, {})

    return {
      sourceStats,
      priorityStats,
      deviceStats,
      browserStats,
      timeStats,
      dayStats,
      ageStats
    }
  }

  const analytics = getExtendedAnalytics()

  const StatCard = ({ title, value, subtitle, icon: Icon, color = "#3B82F6" }) => (
    <motion.div
      className="bg-[#111827] rounded-lg p-4 border border-[#374151]"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-5 w-5" style={{ color }} />
        <span className="text-sm font-medium text-[#9CA3AF]">{title}</span>
      </div>
      <div className="text-2xl font-bold text-[#E5E7EB]">{value}</div>
      {subtitle && <div className="text-xs text-[#6B7280]">{subtitle}</div>}
    </motion.div>
  )

  const ChartCard = ({ title, data, icon: Icon }) => (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-[#E5E7EB] flex items-center gap-2">
        <Icon className="h-4 w-4 text-[#3B82F6]" />
        {title}
      </h4>
      <div className="bg-[#111827] rounded-lg p-4 border border-[#374151]">
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(data).slice(0, 6).map(([key, value]) => {
            const maxValue = Math.max(...Object.values(data) as number[])
            const percentage = maxValue > 0 ? ((value as number) / maxValue) * 100 : 0

            return (
              <div key={key} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#9CA3AF] capitalize">{key}</span>
                  <span className="text-sm font-medium text-[#E5E7EB]">{value as number}</span>
                </div>
                <div className="h-2 bg-[#374151] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-[#3B82F6] rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )

  if (!filteredData.stats) return null

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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              className="relative h-[95vh] w-full max-w-7xl rounded-2xl bg-[#1F2937] shadow-2xl border border-[#374151] overflow-hidden"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#374151] p-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-[#3B82F6] p-2">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-[#E5E7EB] font-inter">Расширенная аналитика</h2>
                    <p className="text-sm text-[#9CA3AF] font-inter">
                      {filteredData.period && (
                        `${format(filteredData.period.from, 'dd.MM.yyyy', { locale: ru })} - ${format(filteredData.period.to, 'dd.MM.yyyy', { locale: ru })}`
                      )}
                    </p>
                  </div>
                </div>

                {/* Period Selection */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-[#9CA3AF]" />
                    <Select value={selectedPeriod} onValueChange={(value: Period) => setSelectedPeriod(value)}>
                      <SelectTrigger className="w-32 bg-[#374151] border-[#4B5563] text-[#E5E7EB]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#374151] border-[#4B5563]">
                        <SelectItem value="today" className="text-[#E5E7EB]">Сегодня</SelectItem>
                        <SelectItem value="yesterday" className="text-[#E5E7EB]">Вчера</SelectItem>
                        <SelectItem value="week" className="text-[#E5E7EB]">Неделя</SelectItem>
                        <SelectItem value="month" className="text-[#E5E7EB]">Месяц</SelectItem>
                        <SelectItem value="quarter" className="text-[#E5E7EB]">Квартал</SelectItem>
                        <SelectItem value="year" className="text-[#E5E7EB]">Год</SelectItem>
                        <SelectItem value="custom" className="text-[#E5E7EB]">Выбрать</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedPeriod === 'custom' && (
                    <DatePickerWithRange
                      date={dateRange}
                      onDateChange={setDateRange}
                      className="bg-[#374151] border-[#4B5563] text-[#E5E7EB]"
                    />
                  )}

                  <button
                    onClick={onClose}
                    className="rounded-lg p-2 text-[#6B7280] transition-colors hover:bg-[#374151] hover:text-[#E5E7EB]"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* Main Statistics Cards */}
                <div className="grid grid-cols-5 gap-4 mb-8">
                  <StatCard
                    title="Всего заявок"
                    value={filteredData.stats.total}
                    subtitle="За период"
                    icon={TrendingUp}
                    color="#3B82F6"
                  />
                  <StatCard
                    title="Принято"
                    value={filteredData.stats.accepted}
                    subtitle={`${Math.round((filteredData.stats.accepted / filteredData.stats.total) * 100 || 0)}%`}
                    icon={Check}
                    color="#10B981"
                  />
                  <StatCard
                    title="Отказано"
                    value={filteredData.stats.rejected}
                    subtitle={`${Math.round((filteredData.stats.rejected / filteredData.stats.total) * 100 || 0)}%`}
                    icon={XCircle}
                    color="#EF4444"
                  />
                  <StatCard
                    title="Новые"
                    value={filteredData.stats.new}
                    subtitle={`${Math.round((filteredData.stats.new / filteredData.stats.total) * 100 || 0)}%`}
                    icon={Phone}
                    color="#F59E0B"
                  />
                  <StatCard
                    title="Конверсия"
                    value={`${filteredData.stats.conversionRate.toFixed(1)}%`}
                    subtitle="Принято/Всего"
                    icon={UserCheck}
                    color="#8B5CF6"
                  />
                </div>

                <div className="grid grid-cols-3 gap-6">
                  {/* Первая колонка */}
                  <div className="space-y-6">
                    {analytics.sourceStats && Object.keys(analytics.sourceStats).length > 0 && (
                      <ChartCard title="Источники трафика" data={analytics.sourceStats} icon={Globe} />
                    )}

                    {analytics.deviceStats && Object.keys(analytics.deviceStats).length > 0 && (
                      <ChartCard title="Типы устройств" data={analytics.deviceStats} icon={Smartphone} />
                    )}
                  </div>

                  {/* Вторая колонка */}
                  <div className="space-y-6">
                    {analytics.timeStats && Object.keys(analytics.timeStats).length > 0 && (
                      <ChartCard title="Активность по часам" data={analytics.timeStats} icon={Clock} />
                    )}

                    {analytics.dayStats && Object.keys(analytics.dayStats).length > 0 && (
                      <ChartCard title="Активность по дням" data={analytics.dayStats} icon={Calendar} />
                    )}
                  </div>

                  {/* Третья колонка */}
                  <div className="space-y-6">
                    {analytics.browserStats && Object.keys(analytics.browserStats).length > 0 && (
                      <ChartCard title="Браузеры" data={analytics.browserStats} icon={Monitor} />
                    )}

                    {analytics.ageStats && Object.keys(analytics.ageStats).length > 0 && (
                      <ChartCard title="Возрастные группы" data={analytics.ageStats} icon={Users} />
                    )}
                  </div>
                </div>

                {/* Conversion Funnel */}
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-[#E5E7EB] mb-4 flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-[#3B82F6]" />
                    Воронка конверсии
                  </h3>
                  <div className="bg-[#111827] rounded-lg p-6 border border-[#374151]">
                    <div className="grid grid-cols-4 gap-4">
                      {[
                        { label: 'Все заявки', value: filteredData.stats.total, color: '#3B82F6', percentage: 100 },
                        { label: 'Новые', value: filteredData.stats.new, color: '#F59E0B', percentage: (filteredData.stats.new / filteredData.stats.total) * 100 || 0 },
                        { label: 'Принятые', value: filteredData.stats.accepted, color: '#10B981', percentage: (filteredData.stats.accepted / filteredData.stats.total) * 100 || 0 },
                        { label: 'Отказанные', value: filteredData.stats.rejected, color: '#EF4444', percentage: (filteredData.stats.rejected / filteredData.stats.total) * 100 || 0 }
                      ].map((stage, index) => (
                        <motion.div
                          key={stage.label}
                          className="text-center"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <div className="relative">
                            <div className="w-20 h-20 mx-auto rounded-full border-4 flex items-center justify-center text-lg font-bold text-white"
                                 style={{ borderColor: stage.color, backgroundColor: `${stage.color}20` }}>
                              {stage.value}
                            </div>
                            {index < 3 && (
                              <div className="absolute top-1/2 -right-6 transform -translate-y-1/2 text-[#6B7280]">
                                →
                              </div>
                            )}
                          </div>
                          <div className="mt-2">
                            <div className="text-sm font-medium text-[#E5E7EB]">{stage.label}</div>
                            <div className="text-xs text-[#9CA3AF]">{stage.percentage.toFixed(1)}%</div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
