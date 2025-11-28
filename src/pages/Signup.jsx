// src/pages/Signup.jsx
import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { user, signup } = useAuth()
  const navigate = useNavigate()

  // 🔁 If already logged in, skip signup and go to dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 6) {
      setError('Password should be at least 6 characters.')
      return
    }

    setLoading(true)
    try {
      await signup(email, password)
      navigate('/dashboard')
    } catch (err) {
      console.error(err)
      setError(err.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-slate-950 to-slate-950 text-white">
      <Navbar />

      <main className="min-h-[calc(100vh-64px)] flex items-center px-4 py-10">
        <div className="max-w-5xl mx-auto grid md:grid-cols-[1.2fr,1fr] gap-8 items-center">
          {/* Left: explanation/checklist */}
          <section className="hidden md:block">
            <p className="text-xs uppercase tracking-[0.25em] text-emerald-300/80 mb-2">
              Create your free account
            </p>
            <h1 className="text-3xl md:text-4xl font-semibold mb-4">
              Start building healthier habits with{' '}
              <span className="text-emerald-300">clarity</span>.
            </h1>
            <p className="text-sm text-slate-200/85 mb-5 max-w-md">
              NutriApp makes it easy to check ingredient lists, understand packaged foods
              and plan simple, realistic meals.
            </p>
            <ul className="space-y-2 text-sm text-slate-200/85">
              <li className="flex gap-2">
                <span className="mt-[2px] text-emerald-300">✔</span>
                <span>See which ingredients are good, moderate or better to limit.</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-[2px] text-emerald-300">✔</span>
                <span>Generate gentle sample diet plans based on your details.</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-[2px] text-emerald-300">✔</span>
                <span>Save favorite foods to encourage better everyday choices.</span>
              </li>
            </ul>
            <p className="mt-4 text-[11px] text-slate-500">
              You can always delete your account or data later from Firebase if needed.
            </p>
          </section>

          {/* Right: signup card */}
          <section className="w-full max-w-md md:ml-auto">
            <div className="rounded-3xl bg-white/8 backdrop-blur-2xl border border-white/15 shadow-2xl shadow-black/40 p-6">
              <h2 className="text-2xl font-semibold mb-1">Create your NutriApp ID</h2>
              <p className="text-xs text-slate-400 mb-4">
                Just an email and password to get started. You can add more details later.
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
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-2xl bg-slate-950/70 border border-white/15 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/80"
                  />
                  <p className="mt-1 text-[11px] text-slate-400">
                    Minimum 6 characters. You can change it later.
                  </p>
                </div>

                <div>
                  <label htmlFor="confirm" className="block text-xs text-slate-300 mb-1">
                    Confirm password
                  </label>
                  <input
                    id="confirm"
                    type="password"
                    required
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="w-full px-3 py-2 rounded-2xl bg-slate-950/70 border border-white/15 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/80"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-1 px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-300 to-emerald-500 text-slate-900 font-semibold text-sm shadow-lg shadow-emerald-500/30 hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed transition-transform"
                >
                  {loading ? 'Creating account…' : 'Create account'}
                </button>
              </form>

              <p className="mt-4 text-[11px] text-slate-400">
                Already have an account?{' '}
                <Link to="/login" className="text-emerald-300 hover:underline">
                  Sign in instead
                </Link>
                .
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
