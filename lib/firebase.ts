import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getAnalytics } from "firebase/analytics"

const firebaseConfig = {
  apiKey: "AIzaSyAQupIv5k8i53KI-CyaENNkWEyXA9k4cIA",
  authDomain: "globalcrm-db5f8.firebaseapp.com",
  projectId: "globalcrm-db5f8",
  storageBucket: "globalcrm-db5f8.firebasestorage.app",
  messagingSenderId: "905787181763",
  appId: "1:905787181763:web:88ae2482f9760fd5903076",
  measurementId: "G-E31VB2MQZ3",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)

// Initialize Analytics only on client side
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null

export default app
