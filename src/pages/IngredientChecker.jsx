// src/pages/IngredientChecker.jsx
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import {
  saveIngredientScan,
  updateIngredientScan,
  getIngredientScanById,
} from '../firebase/db'

const pill = {
  good: 'bg-emerald-400/20 text-emerald-200 border-emerald-300/50',
  moderate: 'bg-amber-400/20 text-amber-100 border-amber-300/50',
  bad: 'bg-red-500/20 text-red-100 border-red-400/60',
  unknown: 'bg-slate-500/25 text-slate-100 border-slate-400/50',
}

function labelToTone(label = '') {
  const l = label.toLowerCase()
  if (l === 'good') return 'good'
  if (l === 'moderate') return 'moderate'
  if (l === 'limit' || l === 'bad') return 'bad'
  return 'unknown'
}

export default function IngredientChecker() {
  const { user } = useAuth()
  const location = useLocation()

  const [scanId, setScanId] = useState(null)
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const [items, setItems] = useState([])
  const [verdict, setVerdict] = useState('')
  const [saving, setSaving] = useState(false)
  const [loadingExisting, setLoadingExisting] = useState(false)

  // ---------- load existing scan if scanId in URL ----------

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const id = params.get('scanId')

    if (!id || !user) {
      setScanId(null)
      setTitle('')
      setText('')
      setItems([])
      setVerdict('')
      return
    }

    let cancelled = false
    const load = async () => {
      setLoadingExisting(true)
      try {
        const doc = await getIngredientScanById(user.uid, id)
        if (!doc || cancelled) return

        setScanId(doc.id)
        setTitle(doc.title || '')
        setText(doc.text || doc.rawText || '')
        setVerdict(doc.overallVerdict || doc.verdict || '')

        const loadedItems = Array.isArray(doc.items) ? doc.items : []
        const normalized = loadedItems.map((i) => {
          const label = i.label || i.class || i.tone || 'Unknown'
          const tone = i.tone || labelToTone(label)
          return { ...i, label, tone }
        })
        setItems(normalized)
      } catch (err) {
        console.error('Failed to load ingredient scan', err)
        alert('Could not load this ingredient list.')
      } finally {
        if (!cancelled) setLoadingExisting(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [location.search, user])

  // ---------- AI analyze ----------

  const analyze = async () => {
    const trimmed = text.trim()
    if (!trimmed) {
      alert('Please paste an ingredient list first.')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('http://localhost:4000/api/analyze-ingredients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: trimmed }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'AI analysis failed')
      }

      const aiItems = (data.items || []).map((i) => {
        const label = i.label || 'Unknown'
        const tone = labelToTone(label)
        return { ...i, label, tone }
      })

      setItems(aiItems)
      setVerdict(data.overallVerdict || '')

      // Save or update in Firestore
      if (user) {
        const payload = {
          title: title.trim(),
          text: trimmed,
          items: aiItems,
          overallVerdict: data.overallVerdict || '',
        }

        if (scanId) {
          await updateIngredientScan(user.uid, scanId, payload)
        } else {
          const saved = await saveIngredientScan(user.uid, payload)
          if (saved?.id) {
            setScanId(saved.id)
            setTitle(saved.title || title) // this will fill Default_1, etc.
          }
        }
      }
    } catch (err) {
      console.error(err)
      alert('AI analysis failed: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  // ---------- Save name only (no new analysis) ----------

  const saveNameOnly = async () => {
    if (!user || !scanId) {
      alert('You need to analyze and save a list before renaming it.')
      return
    }

    const trimmed = title.trim()
    if (!trimmed) {
      alert('Please type a name to save.')
      return
    }

    try {
      setSaving(true)
      await updateIngredientScan(user.uid, scanId, { title: trimmed })
      alert('Name saved.')
    } catch (err) {
      console.error(err)
      alert('Could not save name.')
    } finally {
      setSaving(false)
    }
  }

  const clearAll = () => {
    setScanId(null)
    setTitle('')
    setText('')
    setItems([])
    setVerdict('')
  }

  const disabled = saving || loadingExisting

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Sidebar />
      <div className="md:ml-60">
        <Navbar />

        <main className="p-6 max-w-6xl mx-auto">
          <h1 className="text-2xl font-semibold mb-1">Ingredient checker</h1>
          <p className="text-xs text-slate-400 mb-4">
            Paste the ingredient list from a packet. NutriApp will use AI to classify each
            item and give you a simple verdict.
          </p>

          {/* Input card */}
          <section className="rounded-3xl bg-white/8 backdrop-blur-2xl border border-white/15 p-4 mb-5 fade-in-up">
            <div className="flex flex-wrap gap-2 items-center mb-3 text-xs">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give this ingredient list a name (e.g., Kurkure, Biscuit A)…"
                className="flex-1 min-w-[200px] px-3 py-1.5 rounded-2xl bg-slate-950/60 border border-white/15 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400/70"
              />
              <button
                type="button"
                disabled={disabled}
                onClick={saveNameOnly}
                className="px-3 py-1.5 rounded-full bg-white/10 border border-white/25 text-[11px] hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save name
              </button>
            </div>

            <textarea
              className="w-full min-h-[140px] bg-slate-950/60 border border-white/10 rounded-2xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/70"
              placeholder="Example: Potato, palm oil, salt, flavour enhancer (E621), sugar..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <div className="flex flex-wrap gap-2 mt-3 text-xs">
              <button
                type="button"
                onClick={analyze}
                disabled={disabled}
                className="px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-300 to-emerald-500 text-slate-900 font-semibold shadow-md shadow-emerald-500/30 hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                {saving ? 'Analyzing & saving…' : 'Analyze ingredients'}
              </button>
              <button
                type="button"
                onClick={clearAll}
                disabled={disabled}
                className="px-4 py-1.5 rounded-full bg-white/8 border border-white/20 hover:bg-white/15 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Clear
              </button>
            </div>
          </section>

          {/* Results */}
          {items.length > 0 && (
            <section className="grid md:grid-cols-[2fr,1fr] gap-4">
              <div className="rounded-3xl bg-white/6 backdrop-blur-2xl border border-white/10 p-4 fade-in-up">
                <p className="text-xs text-slate-300 mb-2">Ingredient breakdown</p>
                <ul className="space-y-2 text-xs">
                  {items.map((i, idx) => (
                    <li
                      key={idx}
                      className="flex justify-between items-center rounded-2xl bg-slate-950/60 border border-white/5 px-3 py-2"
                    >
                      <span className="truncate max-w-[70%]">{i.name}</span>
                      <span
                        className={`px-3 py-1 rounded-full border text-[11px] ${
                          pill[i.tone || 'unknown']
                        }`}
                      >
                        {i.label || 'Unknown'}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-3xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-300/40 p-4 text-xs fade-in-up">
                <p className="text-[11px] text-slate-200 mb-1">Overall verdict</p>
                <p className="text-sm font-semibold mb-2">
                  {verdict || 'No verdict yet — run an analysis first.'}
                </p>
                <p className="text-[11px] text-slate-200/80">
                  This checker combines simple rules with AI to help you build awareness.
                  For medical or allergy advice, always talk to a doctor or dietitian.
                </p>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  )
}
