"use client"
import { motion, AnimatePresence } from "framer-motion"
import { X, TrendingUp, Calendar, Clock, BarChart3, PieChart, Check, XCircle, Phone, Users, Globe, Monitor, Smartphone, Tag, AlertCircle, UserCheck } from "lucide-react"

interface AdvancedStatsModalProps {
  isOpen: boolean
  onClose: () => void
  statistics: any
  requests?: any[]
}

export default function AdvancedStatsModal({ isOpen, onClose, statistics, requests = [] }: AdvancedStatsModalProps) {
  if (!statistics) return null

  const { total, today, thisWeek, thisMonth, hourlyStats, dailyStats } = statistics

  // Расширенная аналитика по всем полям БД
  const getExtendedAnalytics = () => {
    if (!requests || requests.length === 0) return {}

    // Анализ по источникам
    const sourceStats = requests.reduce((acc, req) => {
      const source = req.source || 'Неизвестно'
      acc[source] = (acc[source] || 0) + 1
      return acc
    }, {})

    // Анализ по приоритетам
    const priorityStats = requests.reduce((acc, req) => {
      const priority = req.priority || 'medium'
      acc[priority] = (acc[priority] || 0) + 1
      return acc
    }, {})

    // Анализ по устройствам
    const deviceStats = requests.reduce((acc, req) => {
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
    const browserStats = requests.reduce((acc, req) => {
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

    // Анализ по тегам
    const tagStats = requests.reduce((acc, req) => {
      if (req.tags && Array.isArray(req.tags)) {
        req.tags.forEach(tag => {
          acc[tag] = (acc[tag] || 0) + 1
        })
      }
      return acc
    }, {})

    // Анализ по времени создания (по часам)
    const timeStats = requests.reduce((acc, req) => {
      const hour = new Date(req.createdAt).getHours()
      acc[hour] = (acc[hour] || 0) + 1
      return acc
    }, {})

    // Анализ по возрастным группам (если есть дата рождения)
    const ageStats = requests.reduce((acc, req) => {
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
      tagStats,
      timeStats,
      ageStats
    }
  }

  const analytics = getExtendedAnalytics()

  // Статистика конверсии
  const totalRequests = total?.all || 0
  const acceptanceRate = totalRequests > 0 ? Math.round(((total?.accepted || 0) / totalRequests) * 100) : 0
  const rejectionRate = totalRequests > 0 ? Math.round(((total?.rejected || 0) / totalRequests) * 100) : 0
  const newRate = totalRequests > 0 ? Math.round(((total?.new || 0) / totalRequests) * 100) : 0

  const StatCard = ({ title, value, subtitle, icon: Icon, color = "#3B82F6" }) => (
    <div className="bg-[#111827] rounded-lg p-3 border border-[#374151]">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="h-4 w-4" style={{ color }} />
        <span className="text-xs font-medium text-[#9CA3AF]">{title}</span>
      </div>
      <div className="text-lg font-bold text-[#E5E7EB]">{value}</div>
      {subtitle && <div className="text-xs text-[#6B7280]">{subtitle}</div>}
    </div>
  )

  const StatGrid = ({ title, data, icon: Icon }) => (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-[#E5E7EB] flex items-center gap-2">
        <Icon className="h-4 w-4 text-[#3B82F6]" />
        {title}
      </h4>
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(data).slice(0, 4).map(([key, value]) => (
          <div key={key} className="bg-[#111827] rounded p-2 border border-[#374151]">
            <div className="text-sm font-medium text-[#E5E7EB]">{value as number}</div>
            <div className="text-xs text-[#6B7280] capitalize">{key}</div>
          </div>
        ))}
      </div>
    </div>
  )

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
              <div className="flex items-center justify-between border-b border-[#374151] p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-[#3B82F6] p-2">
                    <BarChart3 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-[#E5E7EB] font-inter">Полная аналитика</h2>
                    <p className="text-sm text-[#9CA3AF] font-inter">Детальная статистика по всем данным</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-lg p-2 text-[#6B7280] transition-colors hover:bg-[#374151] hover:text-[#E5E7EB]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4">
                {/* Main statistics cards */}
                <div className="grid grid-cols-6 gap-3 mb-6">
                  <StatCard
                    title="Всего заявок"
                    value={totalRequests}
                    subtitle="За всё время"
                    icon={TrendingUp}
                    color="#3B82F6"
                  />
                  <StatCard
                    title="Принято"
                    value={`${acceptanceRate}%`}
                    subtitle={`${total?.accepted || 0} заявок`}
                    icon={Check}
                    color="#10B981"
                  />
                  <StatCard
                    title="Отказано"
                    value={`${rejectionRate}%`}
                    subtitle={`${total?.rejected || 0} заявок`}
                    icon={XCircle}
                    color="#EF4444"
                  />
                  <StatCard
                    title="Новые"
                    value={`${newRate}%`}
                    subtitle={`${total?.new || 0} заявок`}
                    icon={Phone}
                    color="#F59E0B"
                  />
                  <StatCard
                    title="Сегодня"
                    value={today?.count || 0}
                    subtitle="Новых заявок"
                    icon={Calendar}
                    color="#6366F1"
                  />
                  <StatCard
                    title="За неделю"
                    value={thisWeek?.count || 0}
                    subtitle="Заявок"
                    icon={Clock}
                    color="#8B5CF6"
                  />
                </div>

                <div className="grid grid-cols-4 gap-4">
                  {/* Левая колонка */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-[#E5E7EB] font-inter flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-[#3B82F6]" />
                      По периодам
                    </h3>

                    <div className="space-y-2">
                      <div className="bg-[#111827] rounded-lg p-3 border border-[#374151]">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-[#E5E7EB]">Сегодня</span>
                          <span className="text-lg font-bold text-[#3B82F6]">{today?.count || 0}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-1 text-xs text-[#9CA3AF]">
                          <span>✓ {today?.accepted || 0}</span>
                          <span>✗ {today?.rejected || 0}</span>
                          <span>⏳ {today?.new || 0}</span>
                        </div>
                      </div>

                      <div className="bg-[#111827] rounded-lg p-3 border border-[#374151]">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-[#E5E7EB]">Неделя</span>
                          <span className="text-lg font-bold text-[#3B82F6]">{thisWeek?.count || 0}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-1 text-xs text-[#9CA3AF]">
                          <span>✓ {thisWeek?.accepted || 0}</span>
                          <span>✗ {thisWeek?.rejected || 0}</span>
                          <span>⏳ {thisWeek?.new || 0}</span>
                        </div>
                      </div>

                      <div className="bg-[#111827] rounded-lg p-3 border border-[#374151]">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-[#E5E7EB]">Месяц</span>
                          <span className="text-lg font-bold text-[#3B82F6]">{thisMonth?.count || 0}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-1 text-xs text-[#9CA3AF]">
                          <span>✓ {thisMonth?.accepted || 0}</span>
                          <span>✗ {thisMonth?.rejected || 0}</span>
                          <span>⏳ {thisMonth?.new || 0}</span>
                        </div>
                      </div>
                    </div>

                    {analytics.ageStats && Object.keys(analytics.ageStats).length > 0 && (
                      <StatGrid title="Возрастные группы" data={analytics.ageStats} icon={Users} />
                    )}
                  </div>

                  {/* Вторая колонка */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-[#E5E7EB] font-inter flex items-center gap-2">
                      <Monitor className="h-5 w-5 text-[#3B82F6]" />
                      Устройства
                    </h3>

                    {analytics.deviceStats && Object.keys(analytics.deviceStats).length > 0 && (
                      <StatGrid title="Типы устройств" data={analytics.deviceStats} icon={Smartphone} />
                    )}

                    {analytics.browserStats && Object.keys(analytics.browserStats).length > 0 && (
                      <StatGrid title="Браузеры" data={analytics.browserStats} icon={Globe} />
                    )}

                    {analytics.priorityStats && Object.keys(analytics.priorityStats).length > 0 && (
                      <StatGrid title="Приоритеты" data={analytics.priorityStats} icon={AlertCircle} />
                    )}
                  </div>

                  {/* Третья колонка */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-[#E5E7EB] font-inter flex items-center gap-2">
                      <Globe className="h-5 w-5 text-[#3B82F6]" />
                      Источники
                    </h3>

                    {analytics.sourceStats && Object.keys(analytics.sourceStats).length > 0 && (
                      <StatGrid title="Источники трафика" data={analytics.sourceStats} icon={TrendingUp} />
                    )}

                    {analytics.tagStats && Object.keys(analytics.tagStats).length > 0 && (
                      <StatGrid title="Теги" data={analytics.tagStats} icon={Tag} />
                    )}
                  </div>

                  {/* Четвертая колонка - График по дням */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-[#E5E7EB] font-inter flex items-center gap-2">
                      <PieChart className="h-5 w-5 text-[#3B82F6]" />
                      График (7 дней)
                    </h3>

                    {dailyStats && dailyStats.length > 0 && (
                      <div className="bg-[#111827] rounded-lg p-3 border border-[#374151]">
                        <div className="grid grid-cols-7 gap-1">
                          {dailyStats.slice(-7).map((day, index) => {
                            const maxCount = Math.max(...dailyStats.slice(-7).map((d) => d.count))
                            const percentage = maxCount > 0 ? (day.count / maxCount) * 100 : 0

                            return (
                              <div key={day.date} className="text-center">
                                <div className="text-xs text-[#9CA3AF] mb-1">
                                  {new Date(day.date).toLocaleDateString("ru-RU", {
                                    day: "2-digit",
                                  })}
                                </div>
                                <div className="h-12 bg-[#374151] rounded overflow-hidden flex items-end">
                                  <motion.div
                                    className="w-full bg-[#3B82F6] rounded-t"
                                    initial={{ height: 0 }}
                                    animate={{ height: `${percentage}%` }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                  />
                                </div>
                                <div className="text-xs font-medium text-[#E5E7EB] mt-1">{day.count}</div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Временная статистика */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-[#E5E7EB] flex items-center gap-2">
                        <Clock className="h-4 w-4 text-[#3B82F6]" />
                        Пиковые часы
                      </h4>
                      {analytics.timeStats && (
                        <div className="bg-[#111827] rounded p-2 border border-[#374151]">
                          {Object.entries(analytics.timeStats)
                            .sort(([,a], [,b]) => (b as number) - (a as number))
                            .slice(0, 3)
                            .map(([hour, count]) => (
                              <div key={hour} className="flex justify-between text-xs mb-1">
                                <span className="text-[#9CA3AF]">{hour}:00</span>
                                <span className="text-[#E5E7EB] font-medium">{count as number}</span>
                              </div>
                            ))}
                        </div>
                      )}
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
