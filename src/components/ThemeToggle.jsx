import { useTheme } from '../context/ThemeContext'

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const baseBtn =
    'px-3 py-1 rounded-full text-xs font-medium transition border border-white/10'
  const active =
    'bg-white/80 text-slate-900 shadow-sm'
  const inactive = 'bg-white/5 text-slate-100/80 hover:bg-white/10'

  return (
    <div className="flex items-center gap-2 bg-white/5 backdrop-blur-xl rounded-full px-2 py-1 border border-white/10">
      <button
        type="button"
        className={baseBtn + ' ' + (theme === 'light' ? active : inactive)}
        onClick={() => setTheme('light')}
      >
        Light
      </button>
      <button
        type="button"
        className={baseBtn + ' ' + (theme === 'glass' ? active : inactive)}
        onClick={() => setTheme('glass')}
      >
        Glass
      </button>
      <button
        type="button"
        className={baseBtn + ' ' + (theme === 'dark' ? active : inactive)}
        onClick={() => setTheme('dark')}
      >
        Dark
      </button>
    </div>
  )
}
