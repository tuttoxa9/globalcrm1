"use client"
import { motion, AnimatePresence } from "framer-motion"
import { X, TrendingUp, Calendar, Clock, BarChart3, PieChart } from "lucide-react"

interface AdvancedStatsModalProps {
  isOpen: boolean
  onClose: () => void
  statistics: any
}

export default function AdvancedStatsModal({ isOpen, onClose, statistics }: AdvancedStatsModalProps) {
  if (!statistics) return null

  const { total, today, thisWeek, thisMonth, hourlyStats, dailyStats } = statistics

  // Найти пиковые часы
  const peakHour = hourlyStats.reduce(
    (max: any, current: any) => (current.count > max.count ? current : max),
    hourlyStats[0],
  )

  // Средние показатели
  const avgDaily = Math.round(thisMonth.count / 30)
  const avgWeekly = Math.round(thisWeek.count / 7)

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
            className="fixed left-1/2 top-1/2 z-50 h-[90vh] w-[95vw] max-w-6xl -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-[#1F2937] shadow-2xl"
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
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Общая статистика */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[#E5E7EB] font-inter flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-[#3B82F6]" />
                    Общие показатели
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-[#111827] p-4 border border-[#374151]">
                      <div className="text-2xl font-bold text-[#E5E7EB] font-inter">{total.all}</div>
                      <div className="text-sm text-[#9CA3AF] font-inter">Всего заявок</div>
                    </div>

                    <div className="rounded-lg bg-[#111827] p-4 border border-[#374151]">
                      <div className="text-2xl font-bold text-[#10B981] font-inter">{total.acceptanceRate}%</div>
                      <div className="text-sm text-[#9CA3AF] font-inter">Принято</div>
                    </div>

                    <div className="rounded-lg bg-[#111827] p-4 border border-[#374151]">
                      <div className="text-2xl font-bold text-[#EF4444] font-inter">{total.rejectionRate}%</div>
                      <div className="text-sm text-[#9CA3AF] font-inter">Отказано</div>
                    </div>

                    <div className="rounded-lg bg-[#111827] p-4 border border-[#374151]">
                      <div className="text-2xl font-bold text-[#F59E0B] font-inter">{total.new}</div>
                      <div className="text-sm text-[#9CA3AF] font-inter">В ожидании</div>
                    </div>
                  </div>
                </div>

                {/* Периодическая статистика */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[#E5E7EB] font-inter flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-[#3B82F6]" />
                    По периодам
                  </h3>

                  <div className="space-y-3">
                    <div className="rounded-lg bg-[#111827] p-4 border border-[#374151]">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-[#E5E7EB] font-inter">Сегодня</span>
                        <span className="text-lg font-bold text-[#3B82F6] font-inter">{today.count}</span>
                      </div>
                      <div className="flex gap-4 text-xs text-[#9CA3AF]">
                        <span>Принято: {today.accepted}</span>
                        <span>Отказано: {today.rejected}</span>
                        <span>Новые: {today.new}</span>
                      </div>
                    </div>

                    <div className="rounded-lg bg-[#111827] p-4 border border-[#374151]">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-[#E5E7EB] font-inter">Эта неделя</span>
                        <span className="text-lg font-bold text-[#3B82F6] font-inter">{thisWeek.count}</span>
                      </div>
                      <div className="flex gap-4 text-xs text-[#9CA3AF]">
                        <span>Принято: {thisWeek.accepted}</span>
                        <span>Отказано: {thisWeek.rejected}</span>
                        <span>Новые: {thisWeek.new}</span>
                      </div>
                    </div>

                    <div className="rounded-lg bg-[#111827] p-4 border border-[#374151]">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-[#E5E7EB] font-inter">Этот месяц</span>
                        <span className="text-lg font-bold text-[#3B82F6] font-inter">{thisMonth.count}</span>
                      </div>
                      <div className="flex gap-4 text-xs text-[#9CA3AF]">
                        <span>Принято: {thisMonth.accepted}</span>
                        <span>Отказано: {thisMonth.rejected}</span>
                        <span>Новые: {thisMonth.new}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Аналитика по времени */}
                <div className="space-y-4">
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
                  </div>
                </div>

                {/* График по дням (последние 7 дней) */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[#E5E7EB] font-inter flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-[#3B82F6]" />
                    Последние 7 дней
                  </h3>

                  <div className="rounded-lg bg-[#111827] p-4 border border-[#374151]">
                    <div className="space-y-2">
                      {dailyStats.slice(-7).map((day, index) => {
                        const maxCount = Math.max(...dailyStats.slice(-7).map((d) => d.count))
                        const percentage = maxCount > 0 ? (day.count / maxCount) * 100 : 0

                        return (
                          <div key={day.date} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-[#9CA3AF] font-inter">
                                {new Date(day.date).toLocaleDateString("ru-RU", {
                                  weekday: "short",
                                  day: "2-digit",
                                  month: "2-digit",
                                })}
                              </span>
                              <span className="text-[#E5E7EB] font-medium">{day.count}</span>
                            </div>
                            <div className="h-2 bg-[#374151] rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-[#3B82F6] rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
