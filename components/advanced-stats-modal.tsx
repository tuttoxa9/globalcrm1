"use client"
import { motion, AnimatePresence } from "framer-motion"
import { X, TrendingUp, Calendar, Clock, BarChart3, PieChart, Check, XCircle, Phone } from "lucide-react"

interface AdvancedStatsModalProps {
  isOpen: boolean
  onClose: () => void
  statistics: any
}

export default function AdvancedStatsModal({ isOpen, onClose, statistics }: AdvancedStatsModalProps) {
  if (!statistics) return null

  const { total, today, thisWeek, thisMonth, hourlyStats, dailyStats } = statistics

  // Найти пиковые часы
  const peakHour = hourlyStats?.reduce(
    (max: any, current: any) => (current.count > max.count ? current : max),
    hourlyStats[0],
  ) || { hour: 0, count: 0 }

  // Средние показатели
  const avgDaily = Math.round((thisMonth?.count || 0) / 30)
  const avgWeekly = Math.round((thisWeek?.count || 0) / 7)

  // Статистика конверсии
  const totalRequests = total?.all || 0
  const acceptanceRate = totalRequests > 0 ? Math.round(((total?.accepted || 0) / totalRequests) * 100) : 0
  const rejectionRate = totalRequests > 0 ? Math.round(((total?.rejected || 0) / totalRequests) * 100) : 0
  const newRate = totalRequests > 0 ? Math.round(((total?.new || 0) / totalRequests) * 100) : 0

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
              className="relative h-[90vh] w-full max-w-6xl rounded-2xl bg-[#1F2937] shadow-2xl border border-[#374151]"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#374151] p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-[#3B82F6] p-2">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-[#E5E7EB] font-inter">Расширенная статистика</h2>
                    <p className="text-sm text-[#9CA3AF] font-inter">Детальная аналитика заявок</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-lg p-2 text-[#6B7280] transition-colors hover:bg-[#374151] hover:text-[#E5E7EB]"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* Main statistics cards */}
                <div className="grid grid-cols-4 gap-6 mb-8">
                  <motion.div
                    className="bg-[#111827] rounded-xl p-6 border border-[#374151]"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="rounded-lg bg-[#3B82F6]/20 p-2">
                        <TrendingUp className="h-5 w-5 text-[#3B82F6]" />
                      </div>
                      <span className="text-sm font-medium text-[#9CA3AF]">Всего заявок</span>
                    </div>
                    <div className="text-3xl font-bold text-[#E5E7EB] mb-2">{totalRequests}</div>
                    <div className="text-xs text-[#6B7280]">За всё время</div>
                  </motion.div>

                  <motion.div
                    className="bg-[#111827] rounded-xl p-6 border border-[#374151]"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="rounded-lg bg-[#10B981]/20 p-2">
                        <Check className="h-5 w-5 text-[#10B981]" />
                      </div>
                      <span className="text-sm font-medium text-[#9CA3AF]">Принято</span>
                    </div>
                    <div className="text-3xl font-bold text-[#10B981] mb-2">{acceptanceRate}%</div>
                    <div className="text-xs text-[#6B7280]">{total?.accepted || 0} заявок</div>
                  </motion.div>

                  <motion.div
                    className="bg-[#111827] rounded-xl p-6 border border-[#374151]"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="rounded-lg bg-[#EF4444]/20 p-2">
                        <XCircle className="h-5 w-5 text-[#EF4444]" />
                      </div>
                      <span className="text-sm font-medium text-[#9CA3AF]">Отказано</span>
                    </div>
                    <div className="text-3xl font-bold text-[#EF4444] mb-2">{rejectionRate}%</div>
                    <div className="text-xs text-[#6B7280]">{total?.rejected || 0} заявок</div>
                  </motion.div>

                  <motion.div
                    className="bg-[#111827] rounded-xl p-6 border border-[#374151]"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="rounded-lg bg-[#F59E0B]/20 p-2">
                        <Phone className="h-5 w-5 text-[#F59E0B]" />
                      </div>
                      <span className="text-sm font-medium text-[#9CA3AF]">Новые</span>
                    </div>
                    <div className="text-3xl font-bold text-[#F59E0B] mb-2">{newRate}%</div>
                    <div className="text-xs text-[#6B7280]">{total?.new || 0} заявок</div>
                  </motion.div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Периодическая статистика */}
                  <motion.div
                    className="space-y-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h3 className="text-lg font-semibold text-[#E5E7EB] font-inter flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-[#3B82F6]" />
                      По периодам
                    </h3>

                    <div className="space-y-3">
                      <div className="rounded-lg bg-[#111827] p-4 border border-[#374151]">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-[#E5E7EB] font-inter">Сегодня</span>
                          <span className="text-lg font-bold text-[#3B82F6] font-inter">{today?.count || 0}</span>
                        </div>
                        <div className="flex gap-4 text-xs text-[#9CA3AF]">
                          <span>Принято: {today?.accepted || 0}</span>
                          <span>Отказано: {today?.rejected || 0}</span>
                          <span>Новые: {today?.new || 0}</span>
                        </div>
                      </div>

                      <div className="rounded-lg bg-[#111827] p-4 border border-[#374151]">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-[#E5E7EB] font-inter">Эта неделя</span>
                          <span className="text-lg font-bold text-[#3B82F6] font-inter">{thisWeek?.count || 0}</span>
                        </div>
                        <div className="flex gap-4 text-xs text-[#9CA3AF]">
                          <span>Принято: {thisWeek?.accepted || 0}</span>
                          <span>Отказано: {thisWeek?.rejected || 0}</span>
                          <span>Новые: {thisWeek?.new || 0}</span>
                        </div>
                      </div>

                      <div className="rounded-lg bg-[#111827] p-4 border border-[#374151]">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-[#E5E7EB] font-inter">Этот месяц</span>
                          <span className="text-lg font-bold text-[#3B82F6] font-inter">{thisMonth?.count || 0}</span>
                        </div>
                        <div className="flex gap-4 text-xs text-[#9CA3AF]">
                          <span>Принято: {thisMonth?.accepted || 0}</span>
                          <span>Отказано: {thisMonth?.rejected || 0}</span>
                          <span>Новые: {thisMonth?.new || 0}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Аналитика по времени */}
                  <motion.div
                    className="space-y-4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 }}
                  >
                    <h3 className="text-lg font-semibold text-[#E5E7EB] font-inter flex items-center gap-2">
                      <Clock className="h-5 w-5 text-[#3B82F6]" />
                      Временная аналитика
                    </h3>

                    <div className="space-y-3">
                      <div className="rounded-lg bg-[#111827] p-4 border border-[#374151]">
                        <div className="text-sm font-medium text-[#E5E7EB] font-inter mb-2">Пиковый час</div>
                        <div className="text-xl font-bold text-[#F59E0B] font-inter">
                          {peakHour.hour}:00 - {peakHour.hour + 1}:00
                        </div>
                        <div className="text-xs text-[#9CA3AF] font-inter">{peakHour.count} заявок</div>
                      </div>

                      <div className="rounded-lg bg-[#111827] p-4 border border-[#374151]">
                        <div className="text-sm font-medium text-[#E5E7EB] font-inter mb-2">Средние показатели</div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-[#9CA3AF]">В день:</span>
                            <span className="text-[#E5E7EB] font-medium">{avgDaily} заявок</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-[#9CA3AF]">В неделю:</span>
                            <span className="text-[#E5E7EB] font-medium">{avgWeekly} заявок</span>
                          </div>
                        </div>
                      </div>

                      {/* Дополнительная статистика по источникам */}
                      <div className="rounded-lg bg-[#111827] p-4 border border-[#374151]">
                        <div className="text-sm font-medium text-[#E5E7EB] font-inter mb-3">Источники трафика</div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="text-center">
                            <div className="text-lg font-bold text-[#10B981] font-inter">{total?.mobile || 0}</div>
                            <div className="text-xs text-[#9CA3AF]">Mobile</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-[#6366F1] font-inter">{total?.desktop || 0}</div>
                            <div className="text-xs text-[#9CA3AF]">Desktop</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-[#EF4444] font-inter">{total?.yandex || 0}</div>
                            <div className="text-xs text-[#9CA3AF]">Яндекс</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-[#4285F4] font-inter">{total?.google || 0}</div>
                            <div className="text-xs text-[#9CA3AF]">Google</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* График по дням (последние 7 дней) */}
                {dailyStats && dailyStats.length > 0 && (
                  <motion.div
                    className="mt-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <h3 className="text-lg font-semibold text-[#E5E7EB] font-inter flex items-center gap-2 mb-4">
                      <PieChart className="h-5 w-5 text-[#3B82F6]" />
                      Последние 7 дней
                    </h3>

                    <div className="rounded-lg bg-[#111827] p-6 border border-[#374151]">
                      <div className="grid grid-cols-7 gap-4">
                        {dailyStats.slice(-7).map((day, index) => {
                          const maxCount = Math.max(...dailyStats.slice(-7).map((d) => d.count))
                          const percentage = maxCount > 0 ? (day.count / maxCount) * 100 : 0

                          return (
                            <div key={day.date} className="text-center">
                              <div className="text-xs text-[#9CA3AF] font-inter mb-2">
                                {new Date(day.date).toLocaleDateString("ru-RU", {
                                  weekday: "short",
                                  day: "2-digit",
                                })}
                              </div>
                              <div className="h-20 bg-[#374151] rounded-lg overflow-hidden flex items-end">
                                <motion.div
                                  className="w-full bg-[#3B82F6] rounded-t-lg"
                                  initial={{ height: 0 }}
                                  animate={{ height: `${percentage}%` }}
                                  transition={{ duration: 0.5, delay: index * 0.1 }}
                                />
                              </div>
                              <div className="text-sm font-medium text-[#E5E7EB] mt-2">{day.count}</div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
