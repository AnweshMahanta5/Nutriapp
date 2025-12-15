import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import Groq from 'groq-sdk'

dotenv.config()

const app = express()

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

// ===============================
// GROQ INIT (SAFE + LOGGED)
// ===============================
if (!process.env.GROQ_API_KEY) {
  console.error('❌ GROQ_API_KEY missing')
  process.exit(1)
}

const MODEL = 'llama-3.1-8b-instant'
console.log('✅ Using Groq model:', MODEL)

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

// ===============================
// HEALTH
// ===============================
app.get('/api/health', (req, res) => {
  res.json({ ok: true })
})

// ===============================
// INGREDIENT ANALYZER (AI)
// ===============================
app.post('/api/analyze-ingredients', async (req, res) => {
  const { text } = req.body || {}

  if (!text?.trim()) {
    return res.status(400).json({ error: 'Missing ingredient text' })
  }

  try {
    const completion = await groq.chat.completions.create({
      model: MODEL,
      temperature: 0.2,
      messages: [
        {
          role: 'system',
          content:
            'You are a nutrition expert for Indian students. Return ONLY valid JSON.',
        },
        {
          role: 'user',
          content: `
Analyze the ingredient list:
"${text}"

Return ONLY JSON:
{
  "items": [
    { "name": "Ingredient", "label": "Good | Moderate | Limit | Unknown" }
  ],
  "overallVerdict": "6–8 sentence explanation"
}
`,
        },
      ],
    })

    const raw = completion.choices[0].message.content
    const json = JSON.parse(raw.match(/\{[\s\S]*\}/)[0])

    res.json(json)
  } catch (err) {
    console.error('❌ Ingredient AI error:', err)
    res.status(500).json({ error: 'AI analysis failed' })
  }
})

// ===============================
// DIET PLANNER (AI)
// ===============================
app.post('/api/generate-diet-plan', async (req, res) => {
  const { age, heightCm, weightKg, goal } = req.body || {}

  if (!age || !heightCm || !weightKg || !goal) {
    return res.status(400).json({ error: 'Missing fields' })
  }

  try {
    const completion = await groq.chat.completions.create({
      model: MODEL,
      temperature: 0.3,
      messages: [
        {
          role: 'system',
          content:
            'You are a friendly Indian nutrition coach. Return ONLY JSON.',
        },
        {
          role: 'user',
          content: `
Age: ${age}
Height: ${heightCm} cm
Weight: ${weightKg} kg
Goal: ${goal}

Return ONLY JSON:
{
  "bmiInfo": {
    "bmi": 22.0,
    "summary": "Normal BMI range"
  },
  "plan": {
    "breakfast": "",
    "lunch": "",
    "snack": "",
    "dinner": ""
  },
  "note": ""
}
`,
        },
      ],
    })

    const raw = completion.choices[0].message.content
    const json = JSON.parse(raw.match(/\{[\s\S]*\}/)[0])

    res.json(json)
  } catch (err) {
    console.error('❌ Diet AI error:', err)
    res.status(500).json({ error: 'Diet plan failed' })
  }
})

// ===============================
// START SERVER
// ===============================
const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})
