"use client"

import { motion, AnimatePresence } from "framer-motion"
import { LogOut, Plus } from "lucide-react"
import { useState, useEffect } from "react"
import BackgroundBlob from "@/components/background-blob"
import ProjectCard from "@/components/project-card"
import CreateProjectModal from "@/components/create-project-modal"
import { useAuth } from "@/hooks/useAuth"
import { signOut } from "@/lib/auth"
import { getProjects, type Project } from "@/lib/firestore"
import { getUnicStatistics } from "@/lib/unic-firestore"
import { useRouter } from "next/navigation"

// Demo data for when user is not authenticated
const demoProjects = [
  {
    id: "demo-1",
    name: "Курьеры",
    color: "#2D3748",
    newRequests: 12,
    totalRequests: 45,
    accepted: 28,
    rejected: 5,
    userId: "demo",
    createdAt: new Date(),
  },
  {
    id: "demo-2",
    name: "Мебель",
    color: "#10B981",
    newRequests: 8,
    totalRequests: 32,
    accepted: 20,
    rejected: 4,
    userId: "demo",
    createdAt: new Date(),
  },
  {
    id: "demo-3",
    name: "Вахта",
    color: "#F59E0B",
    newRequests: 15,
    totalRequests: 67,
    accepted: 42,
    rejected: 10,
    userId: "demo",
    createdAt: new Date(),
  },
  {
    id: "demo-4",
    name: "Доставка",
    color: "#8B5CF6",
    newRequests: 6,
    totalRequests: 28,
    accepted: 18,
    rejected: 4,
    userId: "demo",
    createdAt: new Date(),
  },
  {
    id: "demo-5",
    name: "Клининг",
    color: "#EF4444",
    newRequests: 9,
    totalRequests: 38,
    accepted: 24,
    rejected: 5,
    userId: "demo",
    createdAt: new Date(),
  },
  {
    id: "demo-6",
    name: "Ремонт",
    color: "#06B6D4",
    newRequests: 4,
    totalRequests: 19,
    accepted: 12,
    rejected: 3,
    userId: "demo",
    createdAt: new Date(),
  },
  {
    id: "unic-requests",
    name: "Юник заявки",
    color: "#3B82F6",
    newRequests: 0, // Будет загружено из БД
    totalRequests: 0,
    accepted: 0,
    rejected: 0,
    userId: "demo",
    createdAt: new Date(),
  },
]

export default function ProjectsPage() {
  const { user, loading } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [projectsLoading, setProjectsLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [cardPosition, setCardPosition] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const router = useRouter()

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setProjectsLoading(true)
        let projectsToShow = demoProjects

        if (user) {
          const userProjects = await getProjects(user.uid)
          projectsToShow = userProjects.length > 0 ? userProjects : demoProjects
        }

        // Загружаем реальные данные для проекта "Юник заявки"
        try {
          const unicStats = await getUnicStatistics()
          projectsToShow = projectsToShow.map(project => {
            if (project.id === "unic-requests" || project.name === "Юник заявки") {
              return {
                ...project,
                newRequests: unicStats?.total?.new || 0,
                totalRequests: unicStats?.total?.all || 0,
                accepted: unicStats?.total?.accepted || 0,
                rejected: unicStats?.total?.rejected || 0,
              }
            }
            return project
          })
        } catch (unicError) {
          console.error("Error loading Unic statistics:", unicError)
        }

        setProjects(projectsToShow)
      } catch (error) {
        console.error("Error loading projects:", error)
        setProjects(demoProjects)
      } finally {
        setProjectsLoading(false)
        // Добавляем небольшую задержку для плавного появления контента
        setTimeout(() => {
          setIsPageLoading(false)
        }, 300)
      }
    }

    if (!loading) {
      loadProjects()
    }
  }, [user, loading])

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  const handleProjectCreated = async () => {
    // Перезагружаем проекты после создания нового
    let projectsToShow = demoProjects

    if (user) {
      const userProjects = await getProjects(user.uid)
      projectsToShow = userProjects.length > 0 ? userProjects : demoProjects
    }

    // Загружаем реальные данные для проекта "Юник заявки"
    try {
      const unicStats = await getUnicStatistics()
      projectsToShow = projectsToShow.map(project => {
        if (project.id === "unic-requests" || project.name === "Юник заявки") {
          return {
            ...project,
            newRequests: unicStats?.total?.new || 0,
            totalRequests: unicStats?.total?.all || 0,
            accepted: unicStats?.total?.accepted || 0,
            rejected: unicStats?.total?.rejected || 0,
          }
        }
        return project
      })
    } catch (unicError) {
      console.error("Error loading Unic statistics:", unicError)
    }

    setProjects(projectsToShow)
  }

  const handleProjectClick = (project: Project, element: HTMLElement) => {
    // Получаем точную позицию карточки
    const rect = element.getBoundingClientRect()
    setCardPosition({
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height,
    })

    setSelectedProject(project)
    setIsTransitioning(true)

    // Переход на страницу проекта после анимации (уменьшено до 300ms)
    setTimeout(() => {
      router.push(`/projects/${project.id}`)
    }, 300)
  }

  if (loading || projectsLoading) {
    return (
      <div className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-[#111827]">
        <BackgroundBlob seed={123} />
        <motion.div
          initial={{ opacity: 0, filter: "blur(20px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="z-10 text-center"
        >
          <div className="text-lg font-light text-[#E5E7EB] font-montserrat">
            MNG
          </div>
          <div className="mt-2 text-sm text-[#6B7280] font-inter">
            Загрузка проектов...
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#111827]">
      <BackgroundBlob seed={123} />

      <AnimatePresence>
        {!isTransitioning && (
          <motion.div
            initial={{ opacity: 0, filter: "blur(20px)" }}
            animate={{
              opacity: isPageLoading ? 0 : 1,
              filter: isPageLoading ? "blur(20px)" : "blur(0px)",
            }}
            exit={{
              opacity: 0,
              filter: "blur(20px)",
              scale: 0.95,
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative z-10"
          >
            {/* Header */}
            <motion.header
              className="flex items-center justify-between px-6 py-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <div className="text-lg font-light text-[#E5E7EB] font-montserrat">
                MNG
                {user && <span className="ml-2 text-sm text-[#6B7280]">({user.email})</span>}
              </div>
              <div className="flex items-center gap-4">
                {user && (
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 text-[#6B7280] transition-colors hover:text-[#2D3748]"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="font-inter text-sm">Новый проект</span>
                  </button>
                )}
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 text-[#6B7280] transition-colors hover:text-[#E5E7EB]"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="font-inter text-sm">Выход</span>
                </button>
              </div>
            </motion.header>

            {/* Main Content */}
            <div className="px-6 pb-6">
              <motion.h1
                className="mb-6 text-center text-2xl font-light text-[#E5E7EB] font-montserrat"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: 0.1, duration: 0.5 }}
              >
                Ваши проекты
              </motion.h1>

              {/* Projects Grid */}
              <div className="mx-auto grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {projects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    transition={{
                      delay: index * 0.05,
                      duration: 0.4,
                      ease: "easeOut",
                    }}
                  >
                    <ProjectCard
                      project={project}
                      onProjectClick={handleProjectClick}
                      isSelected={selectedProject?.id === project.id}
                    />
                  </motion.div>
                ))}
              </div>

              {projects.length === 0 && (
                <motion.div
                  className="text-center text-[#6B7280] font-inter"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  У вас пока нет проектов. Создайте первый проект!
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* iOS-style Card Expansion Animation */}
      <AnimatePresence>
        {selectedProject && isTransitioning && (
          <motion.div
            className="fixed z-50 bg-[#1F2937] flex items-center justify-center"
            initial={{
              left: cardPosition.x,
              top: cardPosition.y,
              width: cardPosition.width,
              height: cardPosition.height,
              borderRadius: "12px",
            }}
            animate={{
              left: 0,
              top: 0,
              width: "100vw",
              height: "100vh",
              borderRadius: "0px",
            }}
            transition={{
              duration: 0.4,
              ease: [0.32, 0.72, 0, 1],
            }}
          >
            {/* Scaled Project Card Content */}
            <motion.div
              className="flex flex-col items-center justify-center"
              initial={{ scale: 1 }}
              animate={{ scale: 2.5 }}
              transition={{
                duration: 0.4,
                ease: [0.32, 0.72, 0, 1],
              }}
            >
              {/* DonutChart - увеличенная версия */}
              <div className="mb-4">
                <div className="relative">
                  <svg height={64} width={64} className="transform -rotate-90">
                    {/* Background circle */}
                    <circle
                      stroke="#374151"
                      fill="transparent"
                      strokeWidth={6}
                      r={26}
                      cx={32}
                      cy={32}
                    />
                    {/* Progress circle - всегда заполнен */}
                    <circle
                      stroke="#3B82F6"
                      fill="transparent"
                      strokeWidth={6}
                      strokeLinecap="round"
                      r={26}
                      cx={32}
                      cy={32}
                      strokeDasharray={`${((selectedProject?.newRequests || 0) / Math.max(selectedProject?.totalRequests || 1, 1)) * 163} 163`}
                    />
                  </svg>
                  {/* Center number */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold font-inter text-white">
                      {selectedProject?.newRequests || 0}
                    </span>
                  </div>
                </div>
              </div>
              {/* Project Name */}
              <h3 className="text-center text-sm font-medium text-[#E5E7EB] font-inter">
                {selectedProject?.name}
              </h3>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  )
}
