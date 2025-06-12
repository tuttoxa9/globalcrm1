import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore"
import { db } from "./firebase"

export interface UnicRequest {
  id: string
  fullName: string
  phone: string
  birthDate?: string
  status: "new" | "accepted" | "rejected" | "no_answer"
  createdAt: Date
  updatedAt?: Date
  source?: string
  referrer?: string
  userAgent?: string
  priority?: "low" | "medium" | "high"
  assignedTo?: string
  tags?: string[]
  // Дополнительные поля для совместимости
  title?: string
  clientName?: string
  comment?: string
}

// Получение всех заявок из коллекции "unic"
export const getUnicRequests = async (): Promise<UnicRequest[]> => {
  try {
    const q = query(collection(db, "unic"), orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        fullName: data.fullName || data.clientName || "",
        phone: data.phone || "",
        birthDate: data.birthDate || "",
        status: data.status || "new",
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        source: data.source || "",
        referrer: data.referrer || "",
        userAgent: data.userAgent || "",
        priority: data.priority || "medium",
        assignedTo: data.assignedTo || "",
        tags: data.tags || [],
        // Для совместимости со старыми компонентами
        title: data.title || data.fullName || "",
        clientName: data.fullName || data.clientName || "",
        comment: data.comment || "",
      }
    }) as UnicRequest[]
  } catch (error) {
    console.error("Error getting unic requests:", error)
    return []
  }
}

// Получение заявок по статусу
export const getUnicRequestsByStatus = async (status: string): Promise<UnicRequest[]> => {
  try {
    const q = query(collection(db, "unic"), where("status", "==", status), orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        fullName: data.fullName || data.clientName || "",
        phone: data.phone || "",
        birthDate: data.birthDate || "",
        status: data.status || "new",
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        source: data.source || "",
        referrer: data.referrer || "",
        userAgent: data.userAgent || "",
        priority: data.priority || "medium",
        assignedTo: data.assignedTo || "",
        tags: data.tags || [],
        title: data.title || data.fullName || "",
        clientName: data.fullName || data.clientName || "",
        comment: data.comment || "",
      }
    }) as UnicRequest[]
  } catch (error) {
    console.error("Error getting unic requests by status:", error)
    return []
  }
}

// Получение заявок за определенный период
export const getUnicRequestsByDateRange = async (startDate: Date, endDate: Date): Promise<UnicRequest[]> => {
  try {
    const q = query(
      collection(db, "unic"),
      where("createdAt", ">=", startDate),
      where("createdAt", "<=", endDate),
      orderBy("createdAt", "desc"),
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        fullName: data.fullName || data.clientName || "",
        phone: data.phone || "",
        birthDate: data.birthDate || "",
        status: data.status || "new",
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        source: data.source || "",
        referrer: data.referrer || "",
        userAgent: data.userAgent || "",
        priority: data.priority || "medium",
        assignedTo: data.assignedTo || "",
        tags: data.tags || [],
        title: data.title || data.fullName || "",
        clientName: data.fullName || data.clientName || "",
        comment: data.comment || "",
      }
    }) as UnicRequest[]
  } catch (error) {
    console.error("Error getting unic requests by date range:", error)
    return []
  }
}

// Добавление новой заявки
export const addUnicRequest = async (request: Omit<UnicRequest, "id">) => {
  try {
    const docRef = await addDoc(collection(db, "unic"), {
      ...request,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    return { id: docRef.id, error: null }
  } catch (error: any) {
    return { id: null, error: error.message }
  }
}

// Обновление статуса заявки
export const updateUnicRequestStatus = async (
  requestId: string,
  status: "new" | "accepted" | "rejected" | "no_answer",
) => {
  try {
    await updateDoc(doc(db, "unic", requestId), {
      status,
      updatedAt: new Date(),
    })
    return { error: null }
  } catch (error: any) {
    return { error: error.message }
  }
}

// Удаление заявки
export const deleteUnicRequest = async (requestId: string) => {
  try {
    await deleteDoc(doc(db, "unic", requestId))
    return { error: null }
  } catch (error: any) {
    return { error: error.message }
  }
}

// Подписка на изменения в реальном времени
export const subscribeToUnicRequests = (callback: (requests: UnicRequest[]) => void) => {
  const q = query(collection(db, "unic"), orderBy("createdAt", "desc"))

  return onSnapshot(
    q,
    (querySnapshot) => {
      const requests = querySnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          fullName: data.fullName || data.clientName || "",
          phone: data.phone || "",
          birthDate: data.birthDate || "",
          status: data.status || "new",
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          source: data.source || "",
          referrer: data.referrer || "",
          userAgent: data.userAgent || "",
          priority: data.priority || "medium",
          assignedTo: data.assignedTo || "",
          tags: data.tags || [],
          title: data.title || data.fullName || "",
          clientName: data.fullName || data.clientName || "",
          comment: data.comment || "",
        }
      }) as UnicRequest[]

      callback(requests)
    },
    (error) => {
      console.error("Error in unic requests subscription:", error)
    },
  )
}

// Получение статистики
export const getUnicStatistics = async () => {
  try {
    const requests = await getUnicRequests()
    const now = new Date()

    // Общая статистика
    const total = requests.length
    const newRequests = requests.filter((r) => r.status === "new").length
    const accepted = requests.filter((r) => r.status === "accepted").length
    const rejected = requests.filter((r) => r.status === "rejected").length
    const noAnswer = requests.filter((r) => r.status === "no_answer").length

    // Статистика за сегодня
    const today = requests.filter((r) => {
      const requestDate = new Date(r.createdAt)
      return requestDate.toDateString() === now.toDateString()
    })

    // Статистика за неделю
    const weekAgo = new Date(now)
    weekAgo.setDate(now.getDate() - 7)
    const thisWeek = requests.filter((r) => new Date(r.createdAt) >= weekAgo)

    // Статистика за месяц
    const monthAgo = new Date(now)
    monthAgo.setMonth(now.getMonth() - 1)
    const thisMonth = requests.filter((r) => new Date(r.createdAt) >= monthAgo)

    // Статистика по часам (последние 24 часа)
    const hourlyStats = Array.from({ length: 24 }, (_, hour) => {
      const hourStart = new Date(now)
      hourStart.setHours(hour, 0, 0, 0)
      const hourEnd = new Date(now)
      hourEnd.setHours(hour, 59, 59, 999)

      const hourRequests = requests.filter((r) => {
        const requestDate = new Date(r.createdAt)
        return requestDate >= hourStart && requestDate <= hourEnd && requestDate.toDateString() === now.toDateString()
      })

      return {
        hour,
        count: hourRequests.length,
        accepted: hourRequests.filter((r) => r.status === "accepted").length,
        rejected: hourRequests.filter((r) => r.status === "rejected").length,
      }
    })

    // Статистика по дням (последние 30 дней)
    const dailyStats = Array.from({ length: 30 }, (_, dayIndex) => {
      const date = new Date(now)
      date.setDate(now.getDate() - dayIndex)
      date.setHours(0, 0, 0, 0)

      const dayEnd = new Date(date)
      dayEnd.setHours(23, 59, 59, 999)

      const dayRequests = requests.filter((r) => {
        const requestDate = new Date(r.createdAt)
        return requestDate >= date && requestDate <= dayEnd
      })

      return {
        date: date.toISOString().split("T")[0],
        count: dayRequests.length,
        accepted: dayRequests.filter((r) => r.status === "accepted").length,
        rejected: dayRequests.filter((r) => r.status === "rejected").length,
        new: dayRequests.filter((r) => r.status === "new").length,
      }
    }).reverse()

    return {
      total: {
        all: total,
        new: newRequests,
        accepted,
        rejected,
        noAnswer,
        acceptanceRate: total > 0 ? Math.round((accepted / total) * 100) : 0,
        rejectionRate: total > 0 ? Math.round((rejected / total) * 100) : 0,
      },
      today: {
        count: today.length,
        new: today.filter((r) => r.status === "new").length,
        accepted: today.filter((r) => r.status === "accepted").length,
        rejected: today.filter((r) => r.status === "rejected").length,
      },
      thisWeek: {
        count: thisWeek.length,
        new: thisWeek.filter((r) => r.status === "new").length,
        accepted: thisWeek.filter((r) => r.status === "accepted").length,
        rejected: thisWeek.filter((r) => r.status === "rejected").length,
      },
      thisMonth: {
        count: thisMonth.length,
        new: thisMonth.filter((r) => r.status === "new").length,
        accepted: thisMonth.filter((r) => r.status === "accepted").length,
        rejected: thisMonth.filter((r) => r.status === "rejected").length,
      },
      hourlyStats,
      dailyStats,
    }
  } catch (error) {
    console.error("Error getting unic statistics:", error)
    return null
  }
}
