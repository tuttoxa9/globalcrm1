import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy } from "firebase/firestore"
import { db } from "./firebase"

export interface Project {
  id: string
  name: string
  color: string
  newRequests: number
  totalRequests: number
  accepted: number
  rejected: number
  userId: string
  createdAt: Date
}

export interface Request {
  id: string
  projectId: string
  title: string
  description: string
  status: "new" | "accepted" | "rejected"
  createdAt: Date
  updatedAt: Date
}

// Projects
// Изменим функцию getProjects, чтобы не требовался составной индекс
export const getProjects = async (userId: string): Promise<Project[]> => {
  try {
    // Убираем orderBy из запроса и будем сортировать на клиенте
    const q = query(collection(db, "projects"), where("userId", "==", userId))
    const querySnapshot = await getDocs(q)

    // Получаем данные и сортируем их на стороне клиента
    const projects = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as Project[]

    // Сортируем по убыванию даты создания
    return projects.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  } catch (error) {
    console.error("Error getting projects:", error)
    return []
  }
}

export const addProject = async (project: Omit<Project, "id">) => {
  try {
    const docRef = await addDoc(collection(db, "projects"), {
      ...project,
      createdAt: new Date(),
    })
    return { id: docRef.id, error: null }
  } catch (error: any) {
    return { id: null, error: error.message }
  }
}

export const updateProject = async (projectId: string, updates: Partial<Project>) => {
  try {
    await updateDoc(doc(db, "projects", projectId), updates)
    return { error: null }
  } catch (error: any) {
    return { error: error.message }
  }
}

export const deleteProject = async (projectId: string) => {
  try {
    await deleteDoc(doc(db, "projects", projectId))
    return { error: null }
  } catch (error: any) {
    return { error: error.message }
  }
}

// Requests
export const getRequests = async (projectId: string): Promise<Request[]> => {
  try {
    const q = query(collection(db, "requests"), where("projectId", "==", projectId), orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Request[]
  } catch (error) {
    console.error("Error getting requests:", error)
    return []
  }
}

export const addRequest = async (request: Omit<Request, "id">) => {
  try {
    const docRef = await addDoc(collection(db, "requests"), {
      ...request,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    return { id: docRef.id, error: null }
  } catch (error: any) {
    return { id: null, error: error.message }
  }
}

export const updateRequestStatus = async (requestId: string, status: "new" | "accepted" | "rejected") => {
  try {
    await updateDoc(doc(db, "requests", requestId), {
      status,
      updatedAt: new Date(),
    })
    return { error: null }
  } catch (error: any) {
    return { error: error.message }
  }
}
