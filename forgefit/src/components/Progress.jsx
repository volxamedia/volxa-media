import React, { useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts'
import { getLast7Days, getDayLabel, getWeekRange, getPrevWeekRange } from '../utils/dateUtils'
import { sumMacros, calcStepsCalories, calcWorkoutCalories } from '../utils/calculations'
import Anthropic from '@anthropic-ai/sdk'
import { storage } from '../utils/storage'

function useWeekStats(foodLogs, workoutLogs, stepsLogs, weightLbs) {
  return useMemo(() => {
    const thisWeek = getWeekRange()
    const prevWeek = getPrevWeekRange()

    function weekStats(days) {
      const macroArr = days.map(d => sumMacros(foodLogs[d] || []))
      const stepArr = days.map(d => stepsLogs[d] || 0)
      const workoutArr = days.map(d => workoutLogs[d] || [])

      const totals = macroArr.reduce(
        (acc, m) => ({
          calories: acc.calories + m.calories,
          protein: acc.protein + m.protein,
          carbs: acc.carbs + m.carbs,
          fat: acc.fat + m.fat,
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      )

      const totalSteps = stepArr.reduce((s, x) => s + x, 0)
      const stepCals = calcStepsCalories(totalSteps, weightLbs)
      const workoutCals = workoutArr.reduce((s, day) => s + day.reduce((a, e) => a + (e.caloriesBurned || 0), 0), 0)
      const daysLogged = macroArr.filter(m => m.calories > 0).length
      const avgCals = daysLogged > 0 ? Math.round(totals.calories / daysLogged) : 0

      return { totals, totalSteps, stepCals, workoutCals, daysLogged, avgCals }
    }

    return { this: weekStats(thisWeek), prev: weekStats(prevWeek), thisWeek, prevWeek }
  }, [foodLogs, workoutLogs, stepsLogs, weightLbs])
}

function pct(a, b) {
  if (!b) return null
  return Math.round(((a - b) / b) * 100)
}

function TrendBadge({ a, b, inverted = false }) {
  const d = pct(a, b)
  if (d === null) return null
  const isPositive = inverted ? d < 0 : d > 0
  return (
    <span className={`compare-badge ${d > 0 ? (inverted ? 'down' : 'up') : d < 0 ? (inverted ? 'up' : 'down') : 'same'}`}>
      {d > 0 ? '▲' : d < 0 ? '▼' : '—'} {Math.abs(d)}%
    </span>
  )
}

export function Progress({ foodLogs, workoutLogs, stepsLogs, profile }) {
  const [aiReport, setAiReport] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')
  const [apiKey, setApiKey] = useState(() => storage.get('forgefit_api_key') || '')
  const [showKeyInput, setShowKeyInput] = useState(false)

  const weightLbs = profile?.weightLbs || 175
  const stats = useWeekStats(foodLogs, workoutLogs, stepsLogs, weightLbs)

  const last7 = getLast7Days()
  const chartData = last7.map(date => {
    const macros = sumMacros(foodLogs[date] || [])
    return {
      day: getDayLabel(date),
      calories: macros.calories,
      protein: macros.protein,
      carbs: macros.carbs,
      fat: macros.fat,
      steps: stepsLogs[date] || 0,
    }
  })

  async function generateReport() {
    if (!apiKey) { setShowKeyInput(true); return }
    setAiLoading(true)
    setAiError('')
    setAiReport(null)

    try {
      const t = stats.this.totals
      const daysLogged = stats.this.daysLogged
      const targets = profile?.macroTargets || {}
      const goalLabel = profile?.goal || 'recomp'

      const prompt = `You are a no-nonsense fitness coach. Analyze this athlete's week:

**Goal:** ${goalLabel.toUpperCase()} | **Weight:** ${profile?.weightLbs} lbs
**Calorie Target:** ${targets.calories || 'N/A'} kcal/day
**Macro Targets:** ${targets.protein || 0}g P / ${targets.carbs || 0}g C / ${targets.fat || 0}g F

**This Week (${daysLogged}/7 days logged):**
- Avg Calories: ${stats.this.avgCals} kcal/day (target: ${targets.calories || 'N/A'})
- Total Protein: ${Math.round(t.protein)}g (avg ${Math.round(t.protein / Math.max(1, daysLogged))}g/day, target: ${targets.protein || 'N/A'}g)
- Total Carbs: ${Math.round(t.carbs)}g (avg ${Math.round(t.carbs / Math.max(1, daysLogged))}g/day)
- Total Fat: ${Math.round(t.fat)}g (avg ${Math.round(t.fat / Math.max(1, daysLogged))}g/day)
- Total Steps: ${stats.this.totalSteps.toLocaleString()} (~${stats.this.stepCals} cal from steps)
- Workout Calories Burned: ${stats.this.workoutCals} cal

**vs Last Week:**
- Calories: ${stats.prev.avgCals || 'N/A'} avg → ${stats.this.avgCals}
- Protein: ${Math.round(stats.prev.totals.protein / Math.max(1, stats.prev.daysLogged))}g avg → ${Math.round(t.protein / Math.max(1, daysLogged))}g
- Steps: ${stats.prev.totalSteps.toLocaleString()} → ${stats.this.totalSteps.toLocaleString()}

Give an honest coaching report with:
1. A letter grade (A+, A, B+, B, C+, C, D) for the overall week
2. Nutrition analysis (2-3 sentences, be specific about numbers)
3. Training analysis (2-3 sentences)
4. 3-4 specific, actionable targets for next week

Keep it direct, honest, and motivating. Don't sugarcoat.`

      const client = new Anthropic({
        apiKey,
        dangerouslyAllowBrowser: true,
      })

      const message = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 600,
        messages: [{ role: 'user', content: prompt }],
      })

      const text = message.content[0].text
      setAiReport(parseReport(text))
      storage.set('forgefit_last_report', { report: text, timestamp: Date.now() })
    } catch (err) {
      setAiError(`API Error: ${err.message || 'Unknown error. Check your API key.'}`)
    } finally {
      setAiLoading(false)
    }
  }

  function parseReport(text) {
    const gradeMatch = text.match(/[A-D][+\-]?(?=\s|$|:|\.|,)/m)
    const grade = gradeMatch ? gradeMatch[0] : 'B'

    const sections = { grade, full: text, nutrition: '', training: '', targets: [] }

    const nutMatch = text.match(/nutrition[^:]*:([^3-9\n]{1,500})/i)
    if (nutMatch) sections.nutrition = nutMatch[1].trim()

    const trainMatch = text.match(/training[^:]*:([^3-9\n]{1,500})/i)
    if (trainMatch) sections.training = trainMatch[1].trim()

    const lines = text.split('\n').filter(l => l.match(/^[\d\-•*]/))
    sections.targets = lines.slice(-4).map(l => l.replace(/^[\d\.\-•*]+\s*/, ''))

    return sections
  }

  function saveApiKey() {
    storage.set('forgefit_api_key', apiKey)
    setShowKeyInput(false)
    if (apiKey) generateReport()
  }

  const lastReport = storage.get('forgefit_last_report')

  return (
    <div>
      {/* This week vs last week summary */}
      <div className="card mb-12">
        <div className="section-title mb-12">This Week vs Last Week</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {[
            { label: 'Avg Cal', this: stats.this.avgCals, prev: stats.prev.avgCals, inverted: false },
            { label: 'Avg Prot', this: Math.round(stats.this.totals.protein / Math.max(1, stats.this.daysLogged)), prev: Math.round(stats.prev.totals.protein / Math.max(1, stats.prev.daysLogged)), inverted: false },
            { label: 'Steps', this: stats.this.totalSteps, prev: stats.prev.totalSteps, inverted: false },
          ].map(m => (
            <div key={m.label} style={{ background: 'var(--bg-elevated)', borderRadius: 8, padding: '10px 8px', textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>{m.label}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--text)' }}>
                {typeof m.this === 'number' && m.this > 1000 ? m.this.toLocaleString() : m.this}
              </div>
              <TrendBadge a={m.this} b={m.prev} inverted={m.inverted} />
            </div>
          ))}
        </div>
      </div>

      {/* Calories chart */}
      <div className="chart-container">
        <div className="chart-title">Calories – 7 Days</div>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={chartData} barSize={22}>
            <XAxis dataKey="day" tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8 }} labelStyle={{ color: 'var(--text-secondary)', fontSize: 12 }} formatter={v => [`${v} kcal`, 'Calories']} />
            <Bar dataKey="calories" fill="var(--accent)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        {profile?.macroTargets?.calories && (
          <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
            Target: {profile.macroTargets.calories} kcal/day
          </div>
        )}
      </div>

      {/* Macro charts */}
      <div className="chart-container">
        <div className="chart-title">Protein (g) – 7 Days</div>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={chartData} barSize={22}>
            <XAxis dataKey="day" tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8 }} formatter={v => [`${Math.round(v)}g`, 'Protein']} />
            <Bar dataKey="protein" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
        <div className="chart-container" style={{ margin: 0 }}>
          <div className="chart-title">Carbs (g)</div>
          <ResponsiveContainer width="100%" height={100}>
            <BarChart data={chartData} barSize={16}>
              <XAxis dataKey="day" tick={{ fill: '#555', fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8 }} formatter={v => [`${Math.round(v)}g`, 'Carbs']} />
              <Bar dataKey="carbs" fill="#f59e0b" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-container" style={{ margin: 0 }}>
          <div className="chart-title">Fat (g)</div>
          <ResponsiveContainer width="100%" height={100}>
            <BarChart data={chartData} barSize={16}>
              <XAxis dataKey="day" tick={{ fill: '#555', fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8 }} formatter={v => [`${Math.round(v)}g`, 'Fat']} />
              <Bar dataKey="fat" fill="#a855f7" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Steps chart */}
      <div className="chart-container">
        <div className="chart-title">Steps – 7 Days</div>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={chartData} barSize={22}>
            <XAxis dataKey="day" tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8 }} formatter={v => [v.toLocaleString(), 'Steps']} />
            <Bar dataKey="steps" fill="#22c55e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* AI Coaching Report */}
      <div style={{ marginTop: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <div className="section-title">AI Weekly Report</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Powered by Claude claude-sonnet-4-6</div>
          </div>
          <button
            className="btn btn-primary btn-sm"
            onClick={generateReport}
            disabled={aiLoading}
          >
            {aiLoading ? (
              <><div className="spinner" style={{ width: 14, height: 14 }} /> Analyzing...</>
            ) : 'Generate'}
          </button>
        </div>

        {showKeyInput && (
          <div className="card mb-12">
            <div className="section-title mb-8">Anthropic API Key</div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>
              Your key is stored locally and only used for this request.
            </p>
            <div className="row">
              <input
                className="input flex-1"
                type="password"
                placeholder="sk-ant-api03-..."
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
              />
              <button className="btn btn-primary btn-sm" onClick={saveApiKey}>Save</button>
            </div>
          </div>
        )}

        {aiError && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: 12, marginBottom: 12 }}>
            <p style={{ color: 'var(--danger)', fontSize: 13 }}>{aiError}</p>
            <button className="btn btn-ghost btn-sm mt-8" onClick={() => setShowKeyInput(true)}>Update API Key</button>
          </div>
        )}

        {aiReport ? (
          <div className="coaching-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
              <div className="coaching-grade">{aiReport.grade}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Weekly Grade</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
            </div>
            <div className="coaching-section">
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                {aiReport.full}
              </p>
            </div>
          </div>
        ) : !aiLoading && lastReport && (
          <div className="card" style={{ borderColor: 'var(--border)' }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
              Last report: {new Date(lastReport.timestamp).toLocaleDateString()}
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {lastReport.report}
            </p>
          </div>
        )}

        {!aiReport && !aiLoading && !lastReport && (
          <div className="card" style={{ textAlign: 'center', padding: 24 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🤖</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Get Your Weekly Grade
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Claude will analyze your nutrition, training, and steps to give you an honest assessment and targets for next week.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
