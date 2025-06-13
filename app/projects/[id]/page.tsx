"use client"

import { motion } from "framer-motion"
import { ArrowLeft, Phone, Check, XCircle, RefreshCw, TrendingUp, Calculator } from "lucide-react"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import DateGroupedRequests from "@/components/date-grouped-requests"
import UnansweredPanel from "@/components/unanswered-panel"
import ProcessedRequestsPanel from "@/components/processed-requests-panel"
import AdvancedStatsModal from "@/components/advanced-stats-modal"
import EnhancedStatsModal from "@/components/enhanced-stats-modal"
import CalculationPanel from "@/components/calculation-panel"
import { useAuth } from "@/hooks/useAuth"
import { getProjects, type Project } from "@/lib/firestore"
import { getUnicRequests, getUnicStatistics, subscribeToUnicRequests, type UnicRequest } from "@/lib/unic-firestore"

export default function ProjectPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [project, setProject] = useState<Project | null>(null)
  const [requests, setRequests] = useState<UnicRequest[]>([])
  const [statistics, setStatistics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isUnansweredOpen, setIsUnansweredOpen] = useState(false)
  const [isAcceptedOpen, setIsAcceptedOpen] = useState(false)
  const [isRejectedOpen, setIsRejectedOpen] = useState(false)
  const [isPageLoaded, setIsPageLoaded] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isAdvancedStatsOpen, setIsAdvancedStatsOpen] = useState(false)
  const [isEnhancedStatsOpen, setIsEnhancedStatsOpen] = useState(false)
  const [isCalculationOpen, setIsCalculationOpen] = useState(false)

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true)

        // Load project info
        if (user) {
          const userProjects = await getProjects(user.uid)
          const foundProject = userProjects.find((p) => p.id === params.id)
          if (foundProject) {
            setProject(foundProject)
          } else {
            // Fallback to demo project for Unic
            setProject({
              id: params.id as string,
              name: "Юник заявки",
              color: "#2D3748",
              newRequests: 0,
              totalRequests: 0,
              accepted: 0,
              rejected: 0,
              userId: "demo",
              createdAt: new Date(),
            })
          }
        } else {
          // Demo project for Unic
          setProject({
            id: params.id as string,
            name: "Юник заявки",
            color: "#2D3748",
            newRequests: 0,
            totalRequests: 0,
            accepted: 0,
            rejected: 0,
            userId: "demo",
            createdAt: new Date(),
          })
        }

        // Load Unic requests and statistics
        await loadUnicData()
      } catch (error) {
        console.error("Error loading initial data:", error)
      } finally {
        setLoading(false)
        setTimeout(() => {
          setIsPageLoaded(true)
        }, 100)
      }
    }

    loadInitialData()
  }, [params.id, user])

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = subscribeToUnicRequests((updatedRequests) => {
      setRequests(updatedRequests)
      // Update statistics when requests change
      loadStatistics()
    })

    return () => unsubscribe()
  }, [])

  const loadUnicData = async () => {
    try {
      const [requestsData, statisticsData] = await Promise.all([getUnicRequests(), getUnicStatistics()])

      setRequests(requestsData)
      setStatistics(statisticsData)
    } catch (error) {
      console.error("Error loading Unic data:", error)
    }
  }

  const loadStatistics = async () => {
    try {
      const statisticsData = await getUnicStatistics()
      setStatistics(statisticsData)
    } catch (error) {
      console.error("Error loading statistics:", error)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await loadUnicData()
    setIsRefreshing(false)
  }

  const handleRequestUpdate = () => {
    // Data will be updated automatically via subscription
    loadStatistics()
  }

  const handleBack = () => {
    router.push("/projects")
  }

  // Закрываем все боковые панели при открытии новой
  const handleOpenPanel = (panel: "unanswered" | "accepted" | "rejected") => {
    setIsUnansweredOpen(panel === "unanswered")
    setIsAcceptedOpen(panel === "accepted")
    setIsRejectedOpen(panel === "rejected")
  }

  // Mock unanswered requests (можно заменить на реальные данные)
  const unansweredRequests = requests
    .filter((r) => r.status === "no_answer")
    .map((r) => ({
      id: r.id,
      clientName: r.clientName,
      phone: r.phone,
      comment: r.comment,
      missedCalls: 1,
      lastCallTime: r.updatedAt,
    }))

  if (loading) {
    return (
      <div className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-[#2D3748]">
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
            Загрузка проекта...
          </div>
        </motion.div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-[#2D3748]">
        <div className="z-10 text-center">
          <h1 className="text-2xl font-light text-[#E5E7EB] font-montserrat">Проект не найден</h1>
          <button onClick={handleBack} className="mt-4 text-[#E5E7EB] hover:text-white transition-colors font-inter">
            Вернуться к проектам
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#2D3748] flex">
      {/* Left Sidebar - Control Panel */}
      <motion.div
        initial={{ opacity: 0, filter: "blur(20px)" }}
        animate={{
          opacity: isPageLoaded ? 1 : 0,
          filter: isPageLoaded ? "blur(0px)" : "blur(20px)",
        }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-80 min-h-screen bg-[#1A202C] border-r border-[#4A5568] flex flex-col"
      >
        {/* Header in Sidebar */}
        <div className="p-6 border-b border-[#4A5568]">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-[#CBD5E0] transition-colors hover:text-[#E5E7EB]"
            >
              <ArrowLeft className="h-5 w-5" />
              Назад к проектам
            </button>
          </div>
          <div>
            <h1 className="text-xl font-light text-[#E5E7EB] font-montserrat">{project.name}</h1>
            {user && <span className="text-sm text-[#A0AEC0]">({user.email})</span>}
            <div className="text-xs text-[#6B7280] font-inter">Реальные данные из Firebase</div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="p-6 space-y-4 flex-1">
          <motion.button
            onClick={() => setIsEnhancedStatsOpen(true)}
            className="w-full flex items-center gap-3 rounded-lg bg-[#4A5568] px-4 py-3 text-[#E5E7EB] transition-all hover:bg-[#374151]"
            whileTap={{ scale: 0.98 }}
          >
            <TrendingUp className="h-5 w-5" />
            <span className="font-inter">Статистика</span>
          </motion.button>

          <motion.button
            onClick={() => handleOpenPanel("accepted")}
            className="w-full flex items-center justify-between rounded-lg bg-[#4A5568] px-4 py-3 text-[#E5E7EB] transition-all hover:bg-[#374151]"
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5" />
              <span className="font-inter">Принятые заявки</span>
            </div>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#10B981] text-xs font-medium text-white">
              {requests.filter((r) => r.status === "accepted").length}
            </span>
          </motion.button>

          <motion.button
            onClick={() => handleOpenPanel("rejected")}
            className="w-full flex items-center justify-between rounded-lg bg-[#4A5568] px-4 py-3 text-[#E5E7EB] transition-all hover:bg-[#374151]"
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-3">
              <XCircle className="h-5 w-5" />
              <span className="font-inter">Отказанные заявки</span>
            </div>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#EF4444] text-xs font-medium text-white">
              {requests.filter((r) => r.status === "rejected").length}
            </span>
          </motion.button>

          <motion.button
            onClick={() => handleOpenPanel("unanswered")}
            className="w-full flex items-center justify-between rounded-lg bg-[#4A5568] px-4 py-3 text-[#E5E7EB] transition-all hover:bg-[#374151]"
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5" />
              <span className="font-inter">Не ответили</span>
            </div>
            {unansweredRequests.length > 0 && (
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#F59E0B] text-xs font-medium text-white">
                {unansweredRequests.length}
              </span>
            )}
          </motion.button>

          <motion.button
            onClick={() => setIsCalculationOpen(true)}
            className="w-full flex items-center gap-3 rounded-lg bg-[#4A5568] px-4 py-3 text-[#E5E7EB] transition-all hover:bg-[#374151]"
            whileTap={{ scale: 0.98 }}
          >
            <Calculator className="h-5 w-5" />
            <span className="font-inter">Расчёт</span>
          </motion.button>
        </div>

        {/* Compact Statistics at bottom */}
        {statistics && (
          <div className="p-6 border-t border-[#4A5568]">
            <motion.button
              onClick={() => setIsEnhancedStatsOpen(true)}
              className="w-full text-left"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="h-5 w-5 text-[#3B82F6]" />
                <h3 className="text-lg font-semibold text-[#E5E7EB] font-inter">Быстрая статистика</h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#374151] rounded-lg p-3">
                  <div className="text-lg font-bold text-[#E5E7EB] font-inter">{statistics.total?.all || 0}</div>
                  <div className="text-xs text-[#9CA3AF] font-inter">Всего</div>
                </div>

                <div className="bg-[#374151] rounded-lg p-3">
                  <div className="text-lg font-bold text-[#E5E7EB] font-inter">{statistics.today?.count || 0}</div>
                  <div className="text-xs text-[#9CA3AF] font-inter">Сегодня</div>
                </div>

                <div className="bg-[#374151] rounded-lg p-3">
                  <div className="text-lg font-bold text-[#10B981] font-inter">{statistics.total?.accepted || 0}</div>
                  <div className="text-xs text-[#9CA3AF] font-inter">Принято</div>
                </div>

                <div className="bg-[#374151] rounded-lg p-3">
                  <div className="text-lg font-bold text-[#EF4444] font-inter">{statistics.total?.rejected || 0}</div>
                  <div className="text-xs text-[#9CA3AF] font-inter">Отказано</div>
                </div>
              </div>
            </motion.button>
          </div>
        )}
      </motion.div>

      {/* Main Content Area - Only Date Grouped Requests */}
      <motion.div
        initial={{ opacity: 0, filter: "blur(20px)" }}
        animate={{
          opacity: isPageLoaded ? 1 : 0,
          filter: isPageLoaded ? "blur(0px)" : "blur(20px)",
        }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex-1 relative z-10"
      >
        {/* Header for main content */}
        <div className="p-6 border-b border-[#4A5568]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[#3B82F6] p-2">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[#E5E7EB] font-inter">Статистика</h3>
                <p className="text-sm text-[#9CA3AF] font-inter">За всё время</p>
              </div>
            </div>


          </div>
        </div>



        {/* Request Cards by Date */}
        <motion.div
          className="px-6 pb-8"
          initial={{ opacity: 0, filter: "blur(10px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <DateGroupedRequests requests={requests} onRequestUpdate={handleRequestUpdate} />
        </motion.div>
      </motion.div>

      {/* Side Panels */}
      <UnansweredPanel
        isOpen={isUnansweredOpen}
        onClose={() => setIsUnansweredOpen(false)}
        requests={unansweredRequests}
        onAction={(requestId, action) => {
          console.log(`Unanswered request ${requestId} marked as ${action}`)
        }}
      />

      <ProcessedRequestsPanel
        isOpen={isAcceptedOpen}
        onClose={() => setIsAcceptedOpen(false)}
        requests={requests}
        type="accepted"
        onRequestUpdate={handleRequestUpdate}
      />

      <ProcessedRequestsPanel
        isOpen={isRejectedOpen}
        onClose={() => setIsRejectedOpen(false)}
        requests={requests}
        type="rejected"
        onRequestUpdate={handleRequestUpdate}
      />

      {/* Advanced Stats Modal */}
      <AdvancedStatsModal
        isOpen={isAdvancedStatsOpen}
        onClose={() => setIsAdvancedStatsOpen(false)}
        statistics={statistics}
        requests={requests}
      />

      {/* Enhanced Stats Modal */}
      <EnhancedStatsModal
        isOpen={isEnhancedStatsOpen}
        onClose={() => setIsEnhancedStatsOpen(false)}
        statistics={statistics}
        requests={requests}
      />

      {/* Calculation Panel */}
      <CalculationPanel
        isOpen={isCalculationOpen}
        onClose={() => setIsCalculationOpen(false)}
        requests={requests}
      />
    </div>
  )
}
