// src/pages/Profile.jsx
import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import { getUserStats } from '../firebase/db'

export default function Profile() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ scans: 0, plans: 0, favorites: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    if (!user) {
      setLoading(false)
      return
    }

    const load = async () => {
      try {
        const s = await getUserStats(user.uid)
        if (!active) return
        setStats(s)
      } catch (err) {
        console.error('Failed to load profile stats', err)
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [user])

  const email = user?.email || 'Unknown user'
  const initial = email.charAt(0).toUpperCase()

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 pt-20 pb-16">
        <h1 className="text-2xl font-semibold mb-2">Profile</h1>
        <p className="text-sm text-slate-400 mb-6">
          Manage your NutriApp identity and see a quick summary of your usage.
        </p>

        <section className="rounded-[2rem] bg-white/5 border border-white/10 p-6 flex flex-col md:flex-row items-center md:items-stretch gap-6">
          {/* Avatar + basic info */}
          <div className="flex flex-col items-center md:items-start gap-3 md:border-r md:border-white/10 md:pr-6">
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-emerald-300 to-teal-500 flex items-center justify-center text-4xl font-bold text-slate-950 shadow-lg shadow-emerald-500/40">
              {initial}
            </div>
            <div className="text-center md:text-left">
              <p className="font-medium text-sm">{email}</p>
              <p className="text-[11px] text-slate-400">
                Signed in via Firebase Auth. Your scans, diet plans and favourites are linked
                to your Firebase UID.
              </p>
            </div>
            <button
              type="button"
              onClick={() => alert('You can hook this up to Firebase Storage later.')}
              className="mt-1 px-4 py-1.5 rounded-full border border-white/20 text-xs text-slate-100 hover:bg-white/10 transition"
            >
              Change photo
            </button>
          </div>

          {/* Stats */}
          <div className="flex-1 grid md:grid-cols-3 gap-4 w-full text-sm">
            <div className="rounded-3xl bg-black/30 border border-white/10 p-4">
              <p className="text-xs text-slate-400 mb-1">Scans</p>
              <p className="text-2xl font-semibold mb-1">
                {loading ? '…' : stats.scans}
              </p>
              <p className="text-[11px] text-slate-500">
                Total ingredient lists you&apos;ve checked.
              </p>
            </div>
            <div className="rounded-3xl bg-black/30 border border-white/10 p-4">
              <p className="text-xs text-slate-400 mb-1">Diet plans</p>
              <p className="text-2xl font-semibold mb-1">
                {loading ? '…' : stats.plans}
              </p>
              <p className="text-[11px] text-slate-500">
                Plans you generated based on your details.
              </p>
            </div>
            <div className="rounded-3xl bg-black/30 border border-white/10 p-4">
              <p className="text-xs text-slate-400 mb-1">Favorites</p>
              <p className="text-2xl font-semibold mb-1">
                {loading ? '…' : stats.favorites}
              </p>
              <p className="text-[11px] text-slate-500">
                Foods you marked as better daily choices.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
