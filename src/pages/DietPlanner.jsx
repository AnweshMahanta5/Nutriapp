import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import { saveDietPlan } from '../firebase/db'

export default function DietPlanner() {
  const { user } = useAuth()

  const [age, setAge] = useState('')
  const [heightCm, setHeightCm] = useState('')
  const [weightKg, setWeightKg] = useState('')
  const [goal, setGoal] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const generatePlan = async () => {
    if (!age || !heightCm || !weightKg || !goal) return alert("Fill all fields")

    setLoading(true)

    try {
      const res = await fetch("http://localhost:4000/api/generate-diet-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ age, heightCm, weightKg, goal })
      })

      const data = await res.json()

      if (data.error) {
        alert("AI failed to generate diet plan")
        return
      }

      setResult(data)

      if (user) {
        await saveDietPlan(user.uid, {
          goal,
          bmi: data.bmiInfo?.bmi,
          bmiSummary: data.bmiInfo?.summary,
          plan: data.plan,
          note: data.note,
        })
      }
    } catch (err) {
      console.error(err)
      alert("Error generating plan")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Sidebar />
      <div className="md:ml-60">
        <Navbar />

        <main className="p-6 max-w-5xl mx-auto">
          <h1 className="text-2xl font-semibold mb-4">AI Diet Planner</h1>

          <section className="rounded-3xl bg-white/8 p-5 mb-6">
            <div className="grid md:grid-cols-4 gap-3 text-sm">
              <input placeholder="Age" value={age} onChange={e => setAge(e.target.value)}
                className="bg-slate-900 px-3 py-2 rounded-xl border border-white/10" />
              <input placeholder="Height (cm)" value={heightCm} onChange={e => setHeightCm(e.target.value)}
                className="bg-slate-900 px-3 py-2 rounded-xl border border-white/10" />
              <input placeholder="Weight (kg)" value={weightKg} onChange={e => setWeightKg(e.target.value)}
                className="bg-slate-900 px-3 py-2 rounded-xl border border-white/10" />
              <input placeholder="Goal (e.g. weight loss)" value={goal} onChange={e => setGoal(e.target.value)}
                className="bg-slate-900 px-3 py-2 rounded-xl border border-white/10" />
            </div>

            <button
              onClick={generatePlan}
              disabled={loading}
              className="mt-4 px-5 py-2 rounded-full bg-emerald-400 text-slate-900 font-semibold"
            >
              {loading ? "Generating…" : "Generate Diet Plan"}
            </button>
          </section>

          {result && (
            <section className="rounded-3xl bg-white/10 p-5">
              <h2 className="text-xl font-semibold mb-2">Your AI Diet Plan</h2>

              <p className="text-sm mb-3">
                BMI: {result.bmiInfo.bmi} — {result.bmiInfo.summary}
              </p>

              <ul className="text-sm space-y-2">
                <li><strong>Breakfast:</strong> {result.plan.breakfast}</li>
                <li><strong>Lunch:</strong> {result.plan.lunch}</li>
                <li><strong>Snack:</strong> {result.plan.snack}</li>
                <li><strong>Dinner:</strong> {result.plan.dinner}</li>
              </ul>

              <p className="text-xs mt-3 text-slate-300">{result.note}</p>
            </section>
          )}
        </main>
      </div>
    </div>
  )
}
