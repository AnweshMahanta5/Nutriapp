// src/pages/Login.jsx
import { useEffect, useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'

  // 🔁 If already logged in, don't show login screen – go to dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch (err) {
      console.error(err)
      setError(err.message || 'Failed to login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <Navbar />

      <main className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-3xl bg-white/8 backdrop-blur-2xl border border-white/15 shadow-2xl shadow-black/40 p-6">
          <p className="text-xs uppercase tracking-[0.25em] text-emerald-300/80 mb-2">
            Welcome back
          </p>
          <h1 className="text-2xl font-semibold mb-1">Sign in to NutriApp</h1>
          <p className="text-xs text-slate-400 mb-4">
            Continue where you left off with your scans, diet plans and favorites.
          </p>

          {error && (
            <div className="mb-3 text-xs text-red-200 bg-red-950/60 border border-red-500/40 rounded-2xl px-3 py-2">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 text-sm">
            <div>
              <label htmlFor="email" className="block text-xs text-slate-300 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-2xl bg-slate-950/70 border border-white/15 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/80"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs text-slate-300 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-2xl bg-slate-950/70 border border-white/15 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/80"
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span />
              <button
                type="button"
                className="hover:text-emerald-300 transition-colors"
                onClick={() => alert('You can add password reset later via Firebase Auth.')}
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-1 px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-300 to-emerald-500 text-slate-900 font-semibold text-sm shadow-lg shadow-emerald-500/30 hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed transition-transform"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-4 text-[11px] text-slate-400">
            New here?{' '}
            <Link to="/signup" className="text-emerald-300 hover:underline">
              Create a NutriApp account
            </Link>
            .
          </p>
        </div>
      </main>
    </div>
  )
}
