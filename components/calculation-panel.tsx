"use client"
import { motion } from "framer-motion"
import { Calculator, CalendarDays, DollarSign, TrendingDown, Users, Target, Banknote } from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getUnicRequests, type UnicRequest } from "@/lib/unic-firestore"

interface CalculationPanelProps {
  isOpen: boolean
  onClose: () => void
  requests: UnicRequest[]
}

interface CalculationEntry {
  id: string
  startDate: string
  amount: number
  endDate: string
  remainingBalance: number
  results?: {
    totalRequests: number
    acceptedRequests: number
    costPerRequest: number
    costPerAccepted: number
    conversionRate: number
  }
}

export default function CalculationPanel({ isOpen, onClose, requests }: CalculationPanelProps) {
  const [calculations, setCalculations] = useState<CalculationEntry[]>([])
  const [currentEntry, setCurrentEntry] = useState({
    startDate: "",
    amount: 0,
    endDate: "",
    remainingBalance: 0,
    isCalculating: false
  })

  // Загружаем сохраненные расчеты из localStorage при инициализации
  useEffect(() => {
    const saved = localStorage.getItem('crm-calculations')
    if (saved) {
      try {
        setCalculations(JSON.parse(saved))
      } catch (error) {
        console.error('Error loading calculations:', error)
      }
    }
  }, [])

  // Сохраняем расчеты в localStorage при изменении
  useEffect(() => {
    if (calculations.length > 0) {
      localStorage.setItem('crm-calculations', JSON.stringify(calculations))
    }
  }, [calculations])

  const handleStartCalculation = () => {
    if (!currentEntry.startDate || currentEntry.amount <= 0) {
      alert('Пожалуйста, заполните дату и сумму')
      return
    }

    setCurrentEntry({
      ...currentEntry,
      isCalculating: true
    })
  }

  const handleCompleteCalculation = () => {
    if (!currentEntry.isCalculating) return

    const startDate = new Date(currentEntry.startDate)
    const endDate = new Date() // Текущая дата - расчёт в любое время

    // Фильтруем заявки от даты старта до текущего момента
    const periodRequests = requests.filter(request => {
      const requestDate = new Date(request.createdAt)
      return requestDate >= startDate && requestDate <= endDate
    })

    const totalRequests = periodRequests.length
    const acceptedRequests = periodRequests.filter(r => r.status === 'accepted').length
    const spentAmount = currentEntry.amount - currentEntry.remainingBalance

    const costPerRequest = totalRequests > 0 ? spentAmount / totalRequests : 0
    const costPerAccepted = acceptedRequests > 0 ? spentAmount / acceptedRequests : 0
    const conversionRate = totalRequests > 0 ? (acceptedRequests / totalRequests) * 100 : 0

    const results = {
      totalRequests,
      acceptedRequests,
      costPerRequest,
      costPerAccepted,
      conversionRate
    }

    const newEntry: CalculationEntry = {
      id: Date.now().toString(),
      startDate: currentEntry.startDate,
      amount: currentEntry.amount,
      endDate: endDate.toISOString().split('T')[0],
      remainingBalance: currentEntry.remainingBalance,
      results
    }

    setCalculations(prev => [...prev, newEntry])

    // Сбрасываем текущую запись
    setCurrentEntry({
      startDate: "",
      amount: 0,
      endDate: "",
      remainingBalance: 0,
      isCalculating: false
    })
  }

  const deleteCalculation = (id: string) => {
    setCalculations(prev => prev.filter(calc => calc.id !== id))
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed right-0 top-0 z-50 h-full w-[500px] bg-[#1F2937] border-l border-[#374151] shadow-xl overflow-y-auto"
    >
      {/* Header */}
      <div className="border-b border-[#374151] p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-[#3B82F6] p-2">
              <Calculator className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[#E5E7EB] font-inter">Расчёт</h2>
              <p className="text-sm text-[#9CA3AF] font-inter">Анализ эффективности рекламы</p>
            </div>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-[#9CA3AF] hover:text-[#E5E7EB]"
          >
            ✕
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Форма нового расчета */}
        <Card className="bg-[#111827] border-[#374151]">
          <CardHeader>
            <CardTitle className="text-[#E5E7EB] flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Новый расчёт
            </CardTitle>
            <CardDescription className="text-[#9CA3AF]">
              Запустите отслеживание и рассчитайте результаты в любое время
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="start-date" className="text-[#E5E7EB]">Дата начала</Label>
              <Input
                id="start-date"
                type="date"
                value={currentEntry.startDate}
                onChange={(e) => setCurrentEntry(prev => ({ ...prev, startDate: e.target.value }))}
                className="bg-[#374151] border-[#4B5563] text-[#E5E7EB]"
              />
            </div>

            <div>
              <Label htmlFor="amount" className="text-[#E5E7EB]">Сумма рекламы (₽)</Label>
              <Input
                id="amount"
                type="number"
                value={currentEntry.amount || ""}
                onChange={(e) => setCurrentEntry(prev => ({ ...prev, amount: Number(e.target.value) }))}
                placeholder="Введите сумму"
                className="bg-[#374151] border-[#4B5563] text-[#E5E7EB]"
              />
            </div>

            {!currentEntry.isCalculating ? (
              <Button
                onClick={handleStartCalculation}
                disabled={!currentEntry.startDate || currentEntry.amount <= 0}
                className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white"
              >
                Начать отслеживание
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="p-3 bg-[#374151] rounded-lg">
                  <p className="text-sm text-[#E5E7EB]">
                    Отслеживание начато: {currentEntry.startDate}
                  </p>
                  <p className="text-xs text-[#9CA3AF]">
                    Можете нажать "Подсчёт" в любое время для расчёта результатов
                  </p>
                </div>

                <div>
                  <Label htmlFor="remaining" className="text-[#E5E7EB]">Оставшийся баланс (₽)</Label>
                  <Input
                    id="remaining"
                    type="number"
                    value={currentEntry.remainingBalance || ""}
                    onChange={(e) => setCurrentEntry(prev => ({ ...prev, remainingBalance: Number(e.target.value) }))}
                    placeholder="0 (если не указать)"
                    className="bg-[#374151] border-[#4B5563] text-[#E5E7EB]"
                  />
                </div>

                <Button
                  onClick={handleCompleteCalculation}
                  className="w-full bg-[#10B981] hover:bg-[#059669] text-white"
                >
                  Подсчёт
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* История расчетов */}
        {calculations.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#E5E7EB] flex items-center gap-2">
              <TrendingDown className="h-5 w-5" />
              История расчётов
            </h3>

            {calculations.map((calc) => (
              <Card key={calc.id} className="bg-[#111827] border-[#374151]">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-[#E5E7EB] text-sm">
                      {calc.startDate} - {calc.endDate}
                    </CardTitle>
                    <Button
                      onClick={() => deleteCalculation(calc.id)}
                      variant="ghost"
                      size="sm"
                      className="text-[#EF4444] hover:text-[#DC2626] h-6 w-6 p-0"
                    >
                      ✕
                    </Button>
                  </div>
                  <CardDescription className="text-[#9CA3AF]">
                    Потрачено: {(calc.amount - calc.remainingBalance).toLocaleString()} ₽
                  </CardDescription>
                </CardHeader>

                {calc.results && (
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-[#374151] rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Users className="h-4 w-4 text-[#3B82F6]" />
                          <span className="text-xs text-[#9CA3AF]">Заявок</span>
                        </div>
                        <div className="text-lg font-bold text-[#E5E7EB]">{calc.results.totalRequests}</div>
                      </div>

                      <div className="bg-[#374151] rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Target className="h-4 w-4 text-[#10B981]" />
                          <span className="text-xs text-[#9CA3AF]">Принято</span>
                        </div>
                        <div className="text-lg font-bold text-[#E5E7EB]">{calc.results.acceptedRequests}</div>
                      </div>

                      <div className="bg-[#374151] rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <DollarSign className="h-4 w-4 text-[#F59E0B]" />
                          <span className="text-xs text-[#9CA3AF]">₽/заявка</span>
                        </div>
                        <div className="text-lg font-bold text-[#E5E7EB]">
                          {calc.results.costPerRequest.toFixed(2)}
                        </div>
                      </div>

                      <div className="bg-[#374151] rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Banknote className="h-4 w-4 text-[#EF4444]" />
                          <span className="text-xs text-[#9CA3AF]">₽/принятый</span>
                        </div>
                        <div className="text-lg font-bold text-[#E5E7EB]">
                          {calc.results.costPerAccepted > 0 ? calc.results.costPerAccepted.toFixed(2) : '∞'}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 p-3 bg-[#1F2937] rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[#9CA3AF]">Конверсия</span>
                        <span className="text-sm font-medium text-[#E5E7EB]">
                          {calc.results.conversionRate.toFixed(1)}%
                        </span>
                      </div>
                      <div className="mt-2 h-2 bg-[#374151] rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-[#10B981] rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${calc.results.conversionRate}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
