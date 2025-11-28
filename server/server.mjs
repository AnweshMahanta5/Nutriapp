// server/server.mjs
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { GoogleGenerativeAI } from '@google/generative-ai'

dotenv.config()

const app = express()

app.use(
  cors({
    origin: 'http://localhost:5173',
  })
)
app.use(express.json())

// --------- GEMINI SETUP ----------
const apiKey = process.env.GEMINI_API_KEY

if (!apiKey) {
  console.error('❌ GEMINI_API_KEY is NOT set in .env')
} else {
  console.log('✅ GEMINI_API_KEY loaded (first 6 chars):', apiKey.slice(0, 6))
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null
const model =
  genAI && genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

// JSON extractor
function extractJson(text) {
  try {
    return JSON.parse(text)
  } catch {
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('No JSON object found in model response')
    return JSON.parse(match[0])
  }
}

// --------- ROUTES ----------
app.get('/api/health', (req, res) => {
  res.json({ ok: true })
})


// =============================
// INGREDIENT ANALYZER (ENHANCED)
// =============================
app.post('/api/analyze-ingredients', async (req, res) => {
  if (!model)
    return res.status(500).json({ error: 'Server missing Gemini API key' })

  const { text } = req.body || {}
  if (!text?.trim())
    return res.status(400).json({ error: 'Missing ingredient text' })

  try {
    const prompt = `
You are an expert nutritionist specializing in safe, simple guidance for Indian families, teens and students.

Analyze the following ingredient list:
"""${text}"""

First, split it into clean individual ingredients.

For each ingredient, classify it as EXACTLY one of:
- "Good"
- "Moderate"
- "Limit"
- "Unknown"

Now generate **a long, detailed, helpful overall verdict** (6–10 sentences):

Your verdict MUST:
- Explain the healthiness of this product.
- Identify harmful ingredients (like palm oil, flavor enhancers, artificial colors, preservatives).
- Explain WHY they may be harmful.
- Mention anything students or families should be careful about.
- Give simple nutrition advice.
- Keep it friendly and non-judgmental.

⚠️ Return ONLY valid JSON in this exact structure:

{
  "items": [
    { "name": "Ingredient", "label": "Good" }
  ],
  "overallVerdict": "A long, 6–10 sentence nutritionist-style explanation."
}
    `.trim()

    const result = await model.generateContent(prompt)
    const textResponse = result.response.text()

    console.log('🔎 Raw Gemini response for /analyze-ingredients:')
    console.log(textResponse)

    const json = extractJson(textResponse)

    if (!Array.isArray(json.items) || typeof json.overallVerdict !== 'string') {
      throw new Error('Model JSON missing items or overallVerdict')
    }

    return res.json(json)
  } catch (err) {
    console.error('❌ Error in /api/analyze-ingredients:', err)
    return res.status(500).json({
      error: err.message || 'Gemini ingredient analysis error',
    })
  }
})


// =============================
// DIET PLANNER
// =============================
app.post('/api/generate-diet-plan', async (req, res) => {
  if (!model)
    return res.status(500).json({ error: 'Server missing Gemini API key' })

  const { age, heightCm, weightKg, goal } = req.body || {}

  if (!age || !heightCm || !weightKg || !goal)
    return res.status(400).json({
      error: 'Missing age, heightCm, weightKg or goal',
    })

  try {
    const prompt = `
You are a friendly Indian nutrition coach.

User:
- Age: ${age}
- Height: ${heightCm} cm
- Weight: ${weightKg} kg
- Goal: ${goal}

Create a JSON response with:

1. BMI (numeric)
2. Short BMI summary
3. Simple 1-day Indian meal plan:
   - breakfast
   - lunch
   - snack
   - dinner
4. A friendly safety note.

Return ONLY this JSON:

{
  "bmiInfo": {
    "bmi": 22.0,
    "summary": "Normal range."
  },
  "plan": {
    "breakfast": "Text...",
    "lunch": "Text...",
    "snack": "Text...",
    "dinner": "Text..."
  },
  "note": "Short note."
}
    `.trim()

    const result = await model.generateContent(prompt)
    const textResponse = result.response.text()

    console.log('🔎 Raw Gemini response for /generate-diet-plan:')
    console.log(textResponse)

    const json = extractJson(textResponse)

    if (!json.bmiInfo || !json.plan)
      throw new Error('Missing bmiInfo or plan')

    return res.json(json)
  } catch (err) {
    console.error('❌ Error in /api/generate-diet-plan:', err)
    return res
      .status(500)
      .json({ error: err.message || 'Gemini diet plan error' })
  }
})


// --------- START SERVER ----------
const PORT = 4000
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})
