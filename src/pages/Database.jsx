import { useMemo, useState } from 'react'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import { saveFavoriteFood } from '../firebase/db'

const FOODS = [
  {
    name: 'Plain dahi (curd)',
    category: 'Dairy',
    calories: 65,
    rating: 'Good',
    notes: 'Great with meals, good protein and probiotics.',
  },
  {
    name: 'Boiled egg',
    category: 'Protein',
    calories: 78,
    rating: 'Good',
    notes: 'High quality protein and healthy fats.',
  },
  {
    name: 'Masala chips (small packet)',
    category: 'Snack',
    calories: 150,
    rating: 'Limit',
    notes: 'Usually fried in palm oil and high in salt.',
  },
  {
    name: 'Cola (200 ml)',
    category: 'Drink',
    calories: 90,
    rating: 'Limit',
    notes: 'Mostly sugar with no nutrition.',
  },
  {
    name: 'Homemade veg poha',
    category: 'Breakfast',
    calories: 180,
    rating: 'Better choice',
    notes: 'Use less oil, add vegetables and peanuts for balance.',
  },
  {
    name: 'White bread (2 slices)',
    category: 'Breakfast',
    calories: 150,
    rating: 'Moderate',
    notes: 'Refined flour; ok sometimes. Brown / multigrain is better.',
  },
]

export default function Database() {
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [savingId, setSavingId] = useState('')

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return FOODS.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q),
    )
  }, [query])

  const markFavorite = async (food) => {
    if (!user) {
      alert('Login to save favorites.')
      return
    }
    setSavingId(food.name)
    try {
      await saveFavoriteFood(user.uid, food)
    } catch (e) {
      console.error(e)
    } finally {
      setSavingId('')
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Sidebar />
      <div className="md:ml-60">
        <Navbar />

        <main className="p-6 max-w-5xl mx-auto">
          <h1 className="text-2xl font-semibold mb-1">Food database</h1>
          <p className="text-xs text-slate-400 mb-4">
            Simple, human-readable nutrition hints for everyday foods.
          </p>

          <section className="rounded-3xl bg-white/8 backdrop-blur-2xl border border-white/15 p-4 mb-5 fade-in-up">
            <input
              type="text"
              placeholder="Search by food or category…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full px-3 py-2 rounded-2xl bg-slate-950/70 border border-white/15 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/80"
            />
          </section>

          <section className="grid md:grid-cols-2 gap-4 fade-in-up">
            {filtered.map((food) => (
              <article
                key={food.name}
                className="rounded-3xl bg-white/6 backdrop-blur-2xl border border-white/10 p-4 text-xs flex flex-col justify-between hover:-translate-y-[2px] hover:shadow-lg hover:shadow-emerald-500/20 transition"
              >
                <div className="mb-3">
                  <p className="text-sm font-semibold mb-1">{food.name}</p>
                  <p className="text-[11px] text-slate-400 mb-1">
                    {food.category} • approx {food.calories} kcal
                  </p>
                  <p className="text-[11px] text-slate-100">{food.notes}</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-emerald-400/15 text-emerald-100 border border-emerald-300/40 text-[11px]">
                    {food.rating}
                  </span>
                  <button
                    onClick={() => markFavorite(food)}
                    className="px-3 py-1 rounded-full bg-white/8 border border-white/20 hover:bg-emerald-400/20 hover:border-emerald-300/40 text-[11px] transition"
                  >
                    {savingId === food.name ? 'Saving…' : 'Save as favourite'}
                  </button>
                </div>
              </article>
            ))}

            {filtered.length === 0 && (
              <p className="text-xs text-slate-400">
                No foods matched that search yet.
              </p>
            )}
          </section>
        </main>
      </div>
    </div>
  )
}
