"use client"

import { motion } from "framer-motion"
import { ArrowLeft, Phone, Check, XCircle, RefreshCw } from "lucide-react"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import UnicRequestStack from "@/components/unic-request-stack"
import UnansweredPanel from "@/components/unanswered-panel"
import ProcessedRequestsPanel from "@/components/processed-requests-panel"
import UnicProjectStats from "@/components/unic-project-stats"
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
  const [period, setPeriod] = useState<"all" | "today" | "week" | "month" | "custom">("all")
  const [customDateRange, setCustomDateRange] = useState<{ start: Date; end: Date } | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

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

  const handleCustomDateRangeChange = (start: Date, end: Date) => {
    setCustomDateRange({ start, end })
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
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="h-8 w-8 rounded-full border-2 border-t-transparent border-[#3B82F6]"
        />
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
    <div className="relative min-h-screen w-full overflow-hidden bg-[#2D3748]">
      <motion.div
        initial={{ opacity: 0, filter: "blur(20px)", scale: 1.02 }}
        animate={{
          opacity: isPageLoaded ? 1 : 0,
          filter: isPageLoaded ? "blur(0px)" : "blur(20px)",
          scale: isPageLoaded ? 1 : 1.02,
        }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10"
      >
        {/* Header */}
        <motion.header
          className="flex items-center justify-between px-6 py-6 max-w-6xl mx-auto"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-[#CBD5E0] transition-colors hover:text-[#E5E7EB]"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-xl font-light text-[#E5E7EB] font-montserrat">{project.name}</h1>
              {user && <span className="text-sm text-[#A0AEC0]">({user.email})</span>}
              <div className="text-xs text-[#6B7280] font-inter">Реальные данные из Firebase</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <motion.button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 rounded-lg bg-[#4A5568] px-3 py-2 text-[#E5E7EB] transition-all hover:bg-[#374151] disabled:opacity-50"
              whileTap={{ scale: 0.98 }}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              <span className="font-inter text-sm">Обновить</span>
            </motion.button>

            <motion.button
              onClick={() => handleOpenPanel("accepted")}
              className="flex items-center gap-2 rounded-lg bg-[#4A5568] px-4 py-2 text-[#E5E7EB] transition-all hover:bg-[#374151]"
              whileTap={{ scale: 0.98 }}
            >
              <Check className="h-4 w-4" />
              <span className="font-inter">Принятые</span>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#10B981] text-xs font-medium text-white">
                {requests.filter((r) => r.status === "accepted").length}
              </span>
            </motion.button>

            <motion.button
              onClick={() => handleOpenPanel("rejected")}
              className="flex items-center gap-2 rounded-lg bg-[#4A5568] px-4 py-2 text-[#E5E7EB] transition-all hover:bg-[#374151]"
              whileTap={{ scale: 0.98 }}
            >
              <XCircle className="h-4 w-4" />
              <span className="font-inter">Отказанные</span>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#EF4444] text-xs font-medium text-white">
                {requests.filter((r) => r.status === "rejected").length}
              </span>
            </motion.button>

            <motion.button
              onClick={() => handleOpenPanel("unanswered")}
              className="relative flex items-center gap-2 rounded-lg bg-[#4A5568] px-4 py-2 text-[#E5E7EB] transition-all hover:bg-[#374151]"
              whileTap={{ scale: 0.98 }}
            >
              <Phone className="h-4 w-4" />
              <span className="font-inter">Не ответили</span>
              {unansweredRequests.length > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#F59E0B] text-xs font-medium text-white">
                  {unansweredRequests.length}
                </span>
              )}
            </motion.button>
          </div>
        </motion.header>

        {/* Project Stats */}
        <motion.div
          className="mb-8 px-6 max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <UnicProjectStats
            statistics={statistics}
            period={period}
            onPeriodChange={setPeriod}
            customDateRange={customDateRange}
            onCustomDateRangeChange={handleCustomDateRangeChange}
          />
        </motion.div>

        {/* Request Stack */}
        <motion.div
          className="flex justify-center px-6 pb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <UnicRequestStack requests={requests} onRequestUpdate={handleRequestUpdate} />
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
      />

      <ProcessedRequestsPanel
        isOpen={isRejectedOpen}
        onClose={() => setIsRejectedOpen(false)}
        requests={requests}
        type="rejected"
      />
    </div>
  )
}
