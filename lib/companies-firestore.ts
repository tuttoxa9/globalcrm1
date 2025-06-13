import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore"
import { db } from "./firebase"

export interface Company {
  id: string
  name: string
  description?: string
  address?: string
  phone?: string
  email?: string
  website?: string
  createdAt: Date
  updatedAt?: Date
  isActive: boolean
}

export interface Courier {
  id: string
  fullName: string
  phone: string
  email?: string
  companyId?: string
  isActive: boolean
  createdAt: Date
  updatedAt?: Date
}

// Функции для работы с компаниями

// Получение всех компаний
export const getCompanies = async (): Promise<Company[]> => {
  try {
    const q = query(collection(db, "companies"), orderBy("name", "asc"))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        name: data.name || "",
        description: data.description || "",
        address: data.address || "",
        phone: data.phone || "",
        email: data.email || "",
        website: data.website || "",
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        isActive: data.isActive !== false,
      }
    }) as Company[]
  } catch (error) {
    console.error("Error getting companies:", error)
    return []
  }
}

// Добавление новой компании
export const addCompany = async (company: Omit<Company, "id">) => {
  try {
    const docRef = await addDoc(collection(db, "companies"), {
      ...company,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    return { id: docRef.id, error: null }
  } catch (error: any) {
    return { id: null, error: error.message }
  }
}

// Обновление компании
export const updateCompany = async (companyId: string, updates: Partial<Company>) => {
  try {
    await updateDoc(doc(db, "companies", companyId), {
      ...updates,
      updatedAt: new Date(),
    })
    return { error: null }
  } catch (error: any) {
    return { error: error.message }
  }
}

// Удаление компании
export const deleteCompany = async (companyId: string) => {
  try {
    await deleteDoc(doc(db, "companies", companyId))
    return { error: null }
  } catch (error: any) {
    return { error: error.message }
  }
}

// Подписка на изменения компаний в реальном времени
export const subscribeToCompanies = (callback: (companies: Company[]) => void) => {
  const q = query(collection(db, "companies"), orderBy("name", "asc"))

  return onSnapshot(
    q,
    (querySnapshot) => {
      const companies = querySnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          name: data.name || "",
          description: data.description || "",
          address: data.address || "",
          phone: data.phone || "",
          email: data.email || "",
          website: data.website || "",
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          isActive: data.isActive !== false,
        }
      }) as Company[]

      callback(companies)
    },
    (error) => {
      console.error("Error in companies subscription:", error)
    },
  )
}

// Функции для работы с курьерами

// Получение всех курьеров
export const getCouriers = async (): Promise<Courier[]> => {
  try {
    const q = query(collection(db, "couriers"), orderBy("fullName", "asc"))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        fullName: data.fullName || "",
        phone: data.phone || "",
        email: data.email || "",
        companyId: data.companyId || "",
        isActive: data.isActive !== false,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      }
    }) as Courier[]
  } catch (error) {
    console.error("Error getting couriers:", error)
    return []
  }
}

// Добавление нового курьера
export const addCourier = async (courier: Omit<Courier, "id">) => {
  try {
    const docRef = await addDoc(collection(db, "couriers"), {
      ...courier,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    return { id: docRef.id, error: null }
  } catch (error: any) {
    return { id: null, error: error.message }
  }
}

// Обновление курьера
export const updateCourier = async (courierId: string, updates: Partial<Courier>) => {
  try {
    await updateDoc(doc(db, "couriers", courierId), {
      ...updates,
      updatedAt: new Date(),
    })
    return { error: null }
  } catch (error: any) {
    return { error: error.message }
  }
}

// Удаление курьера
export const deleteCourier = async (courierId: string) => {
  try {
    await deleteDoc(doc(db, "couriers", courierId))
    return { error: null }
  } catch (error: any) {
    return { error: error.message }
  }
}

// Подписка на изменения курьеров в реальном времени
export const subscribeToCouriers = (callback: (couriers: Courier[]) => void) => {
  const q = query(collection(db, "couriers"), orderBy("fullName", "asc"))

  return onSnapshot(
    q,
    (querySnapshot) => {
      const couriers = querySnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          fullName: data.fullName || "",
          phone: data.phone || "",
          email: data.email || "",
          companyId: data.companyId || "",
          isActive: data.isActive !== false,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        }
      }) as Courier[]

      callback(couriers)
    },
    (error) => {
      console.error("Error in couriers subscription:", error)
    },
  )
}
