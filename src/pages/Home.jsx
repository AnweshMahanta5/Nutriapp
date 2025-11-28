// src/pages/Home.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import { getUserStats } from '../firebase/db'

export default function Home() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [stats, setStats] = useState({ scans: 0, plans: 0, favorites: 0 })
  const [loading, setLoading] = useState(true)

  // Load stats for the logged-in user
  useEffect(() => {
    let active = true

    const load = async () => {
      if (!user) {
        setStats({ scans: 0, plans: 0, favorites: 0 })
        setLoading(false)
        return
      }
      try {
        const s = await getUserStats(user.uid)
        if (!active) return
        setStats(s)
      } catch (err) {
        console.error('Home stats error', err)
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [user])

  const handlePrimary = () => {
    if (user) navigate('/dashboard')
    else navigate('/signup')
  }

  const handleSecondary = () => {
    if (user) navigate('/ingredient-checker')
    else navigate('/login')
  }

  const primaryLabel = user ? 'Go to dashboard' : 'Get started for free'
  const secondaryLabel = user ? 'Open ingredient checker' : 'I already have an account'

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-800 via-slate-950 to-slate-950 text-white">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 pt-20 pb-16">
        {/* HERO */}
        <section className="grid md:grid-cols-2 gap-10 items-center mb-16 fade-in-up">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-300/90 mb-3">
              SMART NUTRITION ASSISTANT
            </p>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Emerald <span className="text-emerald-300">Wellness</span>
            </h1>
            <p className="text-sm md:text-base text-slate-200/80 mb-6 max-w-xl">
              Track ingredients, analyze packaged foods, and generate gentle diet plans — all
              inside a calm, glass-style interface powered by Firebase.
            </p>

            <div className="flex flex-wrap gap-3 text-sm">
              <button
                onClick={handlePrimary}
                className="px-5 py-2 rounded-full bg-gradient-to-r from-emerald-300 to-emerald-500 text-slate-900 font-semibold shadow-lg shadow-emerald-500/30 hover:scale-[1.02] transition"
              >
                {primaryLabel}
              </button>

              <button
                onClick={handleSecondary}
                className="px-5 py-2 rounded-full bg-white/8 border border-white/20 text-slate-100 hover:bg-white/15 transition"
              >
                {secondaryLabel}
              </button>
            </div>

            {!user && (
              <p className="mt-3 text-[11px] text-slate-400">
                No payment • Works on any device • Backed by Firebase Auth &amp; Firestore.
              </p>
            )}

            {user && (
              <p className="mt-3 text-[11px] text-emerald-200/90">
                You&apos;re logged in as <span className="font-medium">{user.email}</span>.
              </p>
            )}
          </div>

          {/* RIGHT STATS CARD */}
          <div className="relative">
            <div className="absolute -inset-6 bg-emerald-500/20 blur-3xl rounded-[2rem] pointer-events-none" />
            <div className="relative rounded-[2rem] bg-slate-950/70 border border-emerald-300/20 shadow-2xl shadow-black/60 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-emerald-200/90">
                  Your data overview
                </span>
                <span className="text-[10px] px-2 py-1 rounded-full bg-emerald-400/10 text-emerald-200 border border-emerald-300/40">
                  {loading ? 'Loading…' : 'Synced'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="rounded-2xl bg-white/5 border border-white/10 p-3">
                  <p className="text-[10px] text-slate-300 mb-1">Scans</p>
                  <p className="text-xl font-semibold">
                    {loading ? '…' : stats.scans}
                  </p>
                  <p className="text-[10px] text-slate-500">Total</p>
                </div>
                <div className="rounded-2xl bg-white/5 border border-white/10 p-3">
                  <p className="text-[10px] text-slate-300 mb-1">Diet plans</p>
                  <p className="text-xl font-semibold">
                    {loading ? '…' : stats.plans}
                  </p>
                  <p className="text-[10px] text-slate-500">Created</p>
                </div>
                <div className="rounded-2xl bg-white/5 border border-white/10 p-3">
                  <p className="text-[10px] text-slate-300 mb-1">Favorites</p>
                  <p className="text-xl font-semibold">
                    {loading ? '…' : stats.favorites}
                  </p>
                  <p className="text-[10px] text-slate-500">Foods saved</p>
                </div>
              </div>

              <div className="rounded-2xl bg-gradient-to-r from-teal-900/80 to-slate-900 border border-emerald-300/25 p-3 text-[11px]">
                {stats.scans === 0 ? (
                  <>
                    <p className="font-medium text-emerald-100 mb-1">No scans yet</p>
                    <p className="text-slate-200/85">
                      Scan an ingredient list to get a simple, friendly explanation here.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-medium text-emerald-100 mb-1">
                      Keep going, you&apos;re building awareness
                    </p>
                    <p className="text-slate-200/85">
                      You&apos;ve already checked {stats.scans} ingredient list
                      {stats.scans > 1 ? 's' : ''}. Try adding a diet plan or saving a favorite
                      food next.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ABOUT SECTION (unchanged) */}
        <section className="fade-in-up">
          <h2 className="text-xl md:text-2xl font-semibold mb-2">How NutriApp helps you</h2>
          <p className="text-sm text-slate-300/90 max-w-3xl mb-6">
            Most of the time, people are not eating &quot;wrong&quot; — they just don&apos;t
            have clear information. NutriApp focuses on <strong>clarity</strong>, not fear.
            Instead of shouting &quot;bad&quot; or &quot;good&quot; food, we help you
            understand <strong>&quot;what&apos;s inside&quot;</strong> and how often it&apos;s
            better to eat it.
          </p>

          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <article className="rounded-3xl bg-white/5 border border-white/10 p-4 backdrop-blur-xl">
              <h3 className="text-sm font-semibold mb-2">Awareness, not guilt</h3>
              <p className="text-slate-300/90 text-xs">
                See ingredients highlighted as &quot;good&quot;, &quot;moderate&quot; or
                &quot;limit&quot; so you can make your own decision instead of being scared
                by labels.
              </p>
            </article>
            <article className="rounded-3xl bg-white/5 border border-white/10 p-4 backdrop-blur-xl">
              <h3 className="text-sm font-semibold mb-2">Simple Indian context</h3>
              <p className="text-slate-300/90 text-xs">
                Focus on everyday Indian foods you actually eat — dal, sabzi, poha, chips,
                cola — not only foreign nutrition terms that don&apos;t match your plate.
              </p>
            </article>
            <article className="rounded-3xl bg-white/5 border border-white/10 p-4 backdrop-blur-xl">
              <h3 className="text-sm font-semibold mb-2">
                Designed for students &amp; families
              </h3>
              <p className="text-slate-300/90 text-xs">
                Fast to use, light on your device and easy enough for parents or friends to
                understand without any technical background.
              </p>
            </article>
          </div>
        </section>
      </main>
    </div>
  )
}
