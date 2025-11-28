import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const navLinkBase =
    'text-sm px-3 py-1 rounded-full transition-colors border border-transparent'
  const active =
    'bg-white/15 text-emerald-200 border-white/25'
  const inactive =
    'text-slate-100/80 hover:bg-white/10 hover:text-white'

  const handleLogout = async () => {
    try {
      await logout()
    } catch (e) {
      console.error(e)
      alert('Error logging out')
    }
  }

  const showAuthButtons = !['/login', '/signup'].includes(location.pathname)

  const initial = user?.email ? user.email.charAt(0).toUpperCase() : 'U'

  return (
    <header className="backdrop-blur-xl bg-slate-950/60 border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl">🍏</span>
            <span className="font-semibold text-lg tracking-tight">NutriApp</span>
          </Link>
        </div>

        {/* Center nav */}
        <nav className="hidden md:flex items-center gap-2 text-sm">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `${navLinkBase} ${isActive ? active : inactive}`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/ingredient-checker"
            className={({ isActive }) =>
              `${navLinkBase} ${isActive ? active : inactive}`
            }
          >
            Ingredient Checker
          </NavLink>
          <NavLink
            to="/database"
            className={({ isActive }) =>
              `${navLinkBase} ${isActive ? active : inactive}`
            }
          >
            Food Database
          </NavLink>
          <NavLink
            to="/diet-planner"
            className={({ isActive }) =>
              `${navLinkBase} ${isActive ? active : inactive}`
            }
          >
            Diet Planner
          </NavLink>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3 text-sm">
          {user ? (
            <>
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2"
              >
                <span className="hidden sm:inline text-slate-200/85 max-w-[150px] truncate">
                  {user.email}
                </span>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-xs font-semibold text-slate-900 shadow-md shadow-emerald-500/40">
                  {initial}
                </div>
              </button>
              <button
                onClick={handleLogout}
                className="px-3 py-1 rounded-full bg-emerald-400 text-slate-900 font-medium hover:bg-emerald-300 transition"
              >
                Logout
              </button>
            </>
          ) : (
            showAuthButtons && (
              <>
                <Link
                  to="/login"
                  className="text-sm px-3 py-1 rounded-full text-slate-100/85 hover:bg-white/10 transition"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="text-sm px-3 py-1 rounded-full bg-emerald-400 text-slate-900 font-medium hover:bg-emerald-300 transition"
                >
                  Sign Up
                </Link>
              </>
            )
          )}
        </div>
      </div>
    </header>
  )
}
