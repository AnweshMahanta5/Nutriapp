// src/pages/Dashboard.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import {
  getUserStats,
  getRecentItems,
  deleteIngredientScan,
} from '../firebase/db'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [stats, setStats] = useState({
    scans: 0,
    plans: 0,
    favorites: 0,
  })
  const [recent, setRecent] = useState({
    scans: [],
    plans: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    if (!user) {
      setStats({ scans: 0, plans: 0, favorites: 0 })
      setRecent({ scans: [], plans: [] })
      setLoading(false)
      return
    }

    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const [s, r] = await Promise.all([
          getUserStats(user.uid),
          getRecentItems(user.uid),
        ])

        if (!cancelled) {
          setStats(s || { scans: 0, plans: 0, favorites: 0 })
          setRecent(r || { scans: [], plans: [] })
        }
      } catch (err) {
        console.error('Failed to load dashboard data', err)
        if (!cancelled) setError('Could not load your latest data.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [user])

  const openScan = (scan) => {
    if (!scan?.id) return
    navigate(`/ingredient-checker?scanId=${scan.id}`)
  }

  const deleteScan = async (scanId) => {
    if (!user || !scanId) return
    const ok = window.confirm('Delete this ingredient list permanently?')
    if (!ok) return

    try {
      await deleteIngredientScan(user.uid, scanId)
      setRecent((prev) => ({
        ...prev,
        scans: prev.scans.filter((s) => s.id !== scanId),
      }))
      setStats((prev) => ({
        ...prev,
        scans: Math.max(0, (prev.scans || 1) - 1),
      }))
    } catch (err) {
      console.error(err)
      alert('Could not delete this list.')
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 pt-20 pb-16">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold mb-1">Dashboard</h1>
          <p className="text-sm text-slate-400">
            A quick glance at your scans, diet plans and favorite foods.
          </p>
        </header>

        {error && (
          <div className="mb-4 text-sm text-red-200 bg-red-950/60 border border-red-500/40 rounded-2xl px-4 py-3">
            {error}
          </div>
        )}

        {/* Top stats row */}
        <section className="grid md:grid-cols-3 gap-4 mb-6">
          <StatCard
            title="Ingredient scans"
            value={stats.scans}
            description="Every time you analyze ingredients, it appears here."
            loading={loading}
          />
          <StatCard
            title="Diet plans"
            value={stats.plans}
            description="Plans you generated based on your height, weight and goal."
            loading={loading}
          />
          <StatCard
            title="Favorite foods"
            value={stats.favorites}
            description="Foods you marked as better everyday choices."
            loading={loading}
          />
        </section>

        {/* Recent activity */}
        <section className="grid md:grid-cols-2 gap-4">
          <RecentCard
            title="Recent ingredient checks"
            items={recent.scans}
            emptyText="You haven’t scanned any ingredient lists yet."
            loading={loading}
            onItemClick={openScan}
            onDelete={deleteScan}
            renderItem={(item) => (
              <>
                <p className="text-sm text-slate-100 line-clamp-1">
                  {item.title || 'Ingredient list'}
                </p>
                {item.overallVerdict && (
                  <p className="text-xs text-slate-400 line-clamp-1">
                    {item.overallVerdict}
                  </p>
                )}
              </>
            )}
          />
          <RecentCard
            title="Recent diet plans"
            items={recent.plans}
            emptyText="Generate a plan in the Diet Planner to see it here."
            loading={loading}
            renderItem={(plan) => (
              <>
                <p className="text-sm text-slate-100 line-clamp-1">
                  {plan.goal || 'Diet plan'}
                </p>
                {plan.bmi && (
                  <p className="text-xs text-slate-400">
                    BMI:{' '}
                    {typeof plan.bmi === 'number'
                      ? plan.bmi.toFixed(1)
                      : plan.bmi}
                  </p>
                )}
              </>
            )}
          />
        </section>
      </main>
    </div>
  )
}

function StatCard({ title, value, description, loading }) {
  return (
    <div className="rounded-3xl bg-slate-950/70 border border-white/10 px-5 py-4">
      <p className="text-xs text-slate-400 mb-2">{title}</p>
      <p className="text-3xl font-semibold mb-1">
        {loading ? (
          <span className="inline-block w-8 h-6 rounded bg-slate-800 animate-pulse" />
        ) : (
          value
        )}
      </p>
      <p className="text-xs text-slate-500">{description}</p>
    </div>
  )
}

function RecentCard({
  title,
  items,
  emptyText,
  loading,
  renderItem,
  onItemClick,
  onDelete,
}) {
  const [deletingId, setDeletingId] = useState(null)
  const [confirmId, setConfirmId] = useState(null)

  return (
    <div className="rounded-3xl bg-slate-950/70 border border-white/10 px-5 py-4 relative">
      {/* Smooth darkened background when confirmation is open */}
      {confirmId && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-20 rounded-3xl fade-in">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-4 text-center w-64">
            <p className="text-sm mb-4">Delete this ingredient list?</p>
            <div className="flex justify-center gap-3 text-xs">
              <button
                onClick={() => setConfirmId(null)}
                className="px-4 py-1 rounded-full bg-white/10 border border-white/20 hover:bg-white/20"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setDeletingId(confirmId)
                  setConfirmId(null)
                  setTimeout(() => onDelete(confirmId), 300)
                }}
                className="px-4 py-1 rounded-full bg-red-500/20 text-red-200 border border-red-500/40 hover:bg-red-500/30"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <p className="text-sm font-medium mb-3">{title}</p>

      {loading ? (
        <div className="space-y-2">
          <div className="h-10 rounded-2xl bg-slate-900 animate-pulse" />
          <div className="h-10 rounded-2xl bg-slate-900 animate-pulse" />
        </div>
      ) : items && items.length > 0 ? (
        <ul className="space-y-2 text-sm">
          {items.map((item) => (
            <li
              key={item.id}
              className={`group rounded-2xl bg-slate-900/80 border border-white/5 px-4 py-2 flex items-center justify-between gap-3 transition-all duration-300 ${
                deletingId === item.id ? 'opacity-0 scale-95 pointer-events-none' : ''
              }`}
            >
              <button
                type="button"
                className="text-left flex-1"
                onClick={() => onItemClick && onItemClick(item)}
              >
                {renderItem(item)}
              </button>

              {/* Red Dustbin Icon */}
              {onDelete && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setConfirmId(item.id)
                  }}
                  className="text-red-400 hover:text-red-300 transition p-1"
                >
                  {/* SVG Trash Icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14H6L5 6" />
                    <path d="M10 11v6" />
                    <path d="M14 11v6" />
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                  </svg>
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-slate-500">{emptyText}</p>
      )}
    </div>
  )
}
