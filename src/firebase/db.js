// src/firebase/db.js
import { db } from './config'
import {
  addDoc,
  collection,
  serverTimestamp,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore'

// ----------------------------------------------------
// SAVE HELPERS
// ----------------------------------------------------

// Create a new ingredient scan and return the saved doc (id + data)
export const saveIngredientScan = async (userId, data) => {
  if (!userId) return null

  const docData = {
    userId,
    uid: userId, // keep for backwards compatibility

    title:
      (data.title && data.title.trim()) ||
      data.foodName ||
      data.productName ||
      data.name ||
      'Ingredient list',

    overallVerdict: data.overallVerdict || data.verdict || null,
    text: data.text || data.rawText || '',
    items: Array.isArray(data.items) ? data.items : [],

    ...data,
    createdAt: serverTimestamp(),
  }

  const ref = await addDoc(collection(db, 'ingredientScans'), docData)
  return { id: ref.id, ...docData }
}

// Update an existing ingredient scan (used for re-analysis & renaming)
export const updateIngredientScan = async (userId, scanId, patch) => {
  if (!scanId) return
  const ref = doc(db, 'ingredientScans', scanId)
  // we ignore userId here, but the signature matches your components
  await updateDoc(ref, { ...patch })
}

// Create a new diet plan
export const saveDietPlan = async (userId, data) => {
  if (!userId) return
  await addDoc(collection(db, 'dietPlans'), {
    userId,
    uid: userId,
    ...data,
    createdAt: serverTimestamp(),
  })
}

// Save a favourite food
export const saveFavoriteFood = async (userId, food) => {
  if (!userId) return
  await addDoc(collection(db, 'favoriteFoods'), {
    userId,
    uid: userId,
    ...food,
    createdAt: serverTimestamp(),
  })
}

// ----------------------------------------------------
// SINGLE-DOC HELPERS (open / rename / delete)
// ----------------------------------------------------

// Get a single ingredient scan by id (optionally verify it belongs to userId)
export const getIngredientScanById = async (userId, scanId) => {
  if (!scanId) return null
  const ref = doc(db, 'ingredientScans', scanId)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null

  const data = snap.data()
  // extra safety: only return if it belongs to this user
  if (
    userId &&
    data.userId &&
    data.userId !== userId &&
    data.uid &&
    data.uid !== userId
  ) {
    return null
  }

  return { id: snap.id, ...data }
}

// Delete a scan by id (used by the red dustbin on Dashboard)
export const deleteIngredientScan = async (userId, scanId) => {
  if (!scanId) return
  const ref = doc(db, 'ingredientScans', scanId)
  // userId parameter kept just to match your call signature
  await deleteDoc(ref)
}

// ----------------------------------------------------
// INTERNAL HELPERS
// ----------------------------------------------------

// Count docs matching this user (supports userId + uid, but avoids double counting)
const countForUser = async (colName, userId) => {
  const colRef = collection(db, colName)

  // Prefer the newer "userId" field
  const qUserId = query(colRef, where('userId', '==', userId))
  const snapUserId = await getDocs(qUserId)
  if (!snapUserId.empty) {
    return snapUserId.size
  }

  // Fallback for very old documents that only have "uid"
  const qUid = query(colRef, where('uid', '==', userId))
  const snapUid = await getDocs(qUid)
  return snapUid.size
}

// Fetch recent docs for a user and sort them locally by createdAt,
// but do NOT merge userId + uid sets (prevents duplicates).
const recentForUser = async (colName, userId, max = 5) => {
  try {
    const colRef = collection(db, colName)

    // Prefer userId
    const qUserId = query(colRef, where('userId', '==', userId))
    let snap = await getDocs(qUserId)

    // Fallback to uid if no userId docs exist (very old data)
    if (snap.empty) {
      const qUid = query(colRef, where('uid', '==', userId))
      snap = await getDocs(qUid)
    }

    const docs = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }))

    docs.sort((a, b) => {
      const ta = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0
      const tb = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0
      return tb - ta
    })

    return docs.slice(0, max)
  } catch (err) {
    console.error(`recentForUser(${colName}) failed`, err)
    return []
  }
}

// ----------------------------------------------------
// PUBLIC API USED BY DASHBOARD / PROFILE
// ----------------------------------------------------

// Stats for profile + top of dashboard
export const getUserStats = async (userId) => {
  if (!userId) return { scans: 0, plans: 0, favorites: 0 }

  const [scans, plans, favorites] = await Promise.all([
    countForUser('ingredientScans', userId),
    countForUser('dietPlans', userId),
    countForUser('favoriteFoods', userId),
  ])

  return { scans, plans, favorites }
}

// Recent scans + diet plans for dashboard
export const getRecentItems = async (userId) => {
  if (!userId) return { scans: [], plans: [] }

  try {
    const [scans, plans] = await Promise.all([
      recentForUser('ingredientScans', userId, 5),
      recentForUser('dietPlans', userId, 5),
    ])

    return { scans, plans }
  } catch (err) {
    console.error('getRecentItems failed', err)
    return { scans: [], plans: [] }
  }
}
