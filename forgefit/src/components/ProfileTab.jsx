import React, { useState } from 'react'
import { calculateMacroTargets } from '../utils/calculations'

const GOALS = [
  { key: 'cut', icon: '🔥', name: 'Cut', desc: 'Lose fat' },
  { key: 'recomp', icon: '⚡', name: 'Recomp', desc: 'Build & lose' },
  { key: 'bulk', icon: '💪', name: 'Bulk', desc: 'Max muscle' },
  { key: 'maintain', icon: '⚖️', name: 'Maintain', desc: 'Hold weight' },
]

export function ProfileTab({ profile, onUpdate }) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(profile.name)
  const [weight, setWeight] = useState(profile.weightLbs)
  const [goal, setGoal] = useState(profile.goal)

  function handleSave() {
    const macroTargets = calculateMacroTargets(parseFloat(weight), goal)
    onUpdate({ name, weightLbs: parseFloat(weight), goal, macroTargets })
    setEditing(false)
  }

  const t = profile.macroTargets

  return (
    <div>
      {/* Profile card */}
      <div className="card mb-12">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'var(--accent-dim)', border: '2px solid var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--accent)'
            }}>
              {profile.name[0].toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)' }}>{profile.name}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                {profile.weightLbs} lbs · {profile.goal.charAt(0).toUpperCase() + profile.goal.slice(1)}
              </div>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => setEditing(e => !e)}>
            {editing ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {editing ? (
          <div>
            <div className="input-group">
              <label>Name</label>
              <input className="input" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="input-group">
              <label>Body Weight (lbs)</label>
              <input className="input" type="number" value={weight} onChange={e => setWeight(e.target.value)} min="50" max="600" />
            </div>
            <div className="input-group">
              <label>Goal</label>
              <div className="goal-grid" style={{ marginBottom: 12 }}>
                {GOALS.map(g => (
                  <div key={g.key} className={`goal-option${goal === g.key ? ' selected' : ''}`} onClick={() => setGoal(g.key)}>
                    <div className="goal-option-icon">{g.icon}</div>
                    <div className="goal-option-name">{g.name}</div>
                    <div className="goal-option-desc">{g.desc}</div>
                  </div>
                ))}
              </div>
            </div>
            <button className="btn btn-primary full-width" onClick={handleSave}>Save Changes</button>
          </div>
        ) : null}
      </div>

      {/* Macro targets */}
      <div className="card mb-12">
        <div className="section-title mb-12">Daily Macro Targets</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
          {[
            { label: 'Calories', val: t.calories, unit: 'kcal', color: 'var(--accent)' },
            { label: 'Protein', val: t.protein, unit: 'g', color: '#3b82f6' },
            { label: 'Carbs', val: t.carbs, unit: 'g', color: '#f59e0b' },
            { label: 'Fat', val: t.fat, unit: 'g', color: '#a855f7' },
          ].map(m => (
            <div key={m.label} style={{
              background: 'var(--bg-elevated)', borderRadius: 10, padding: 14, textAlign: 'center'
            }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: m.color, letterSpacing: 1 }}>
                {m.val}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginTop: 2 }}>
                {m.label} ({m.unit})
              </div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 12, textAlign: 'center' }}>
          Calculated for {profile.weightLbs} lbs · {profile.goal} goal
        </p>
      </div>

      {/* Goal breakdown info */}
      <div className="card mb-12">
        <div className="section-title mb-8">Your Plan</div>
        {profile.goal === 'cut' && (
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--accent)' }}>Cut:</strong> Calorie deficit with high protein to preserve muscle. Aim to lose 0.5–1 lb/week. Track every meal and prioritize protein at every sitting.
          </p>
        )}
        {profile.goal === 'bulk' && (
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--accent)' }}>Bulk:</strong> Calorie surplus with high protein to maximize muscle synthesis. Expect 0.25–0.5 lb of muscle per week when training consistently.
          </p>
        )}
        {profile.goal === 'recomp' && (
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--accent)' }}>Recomp:</strong> Maintenance calories with high protein. Build muscle and lose fat simultaneously. Best for intermediates. Patience required — progress is slower but sustainable.
          </p>
        )}
        {profile.goal === 'maintain' && (
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--accent)' }}>Maintain:</strong> Eat at maintenance calories to hold your current weight. Focus on performance and body composition improvements through training.
          </p>
        )}
      </div>

      {/* Macro breakdown pct */}
      <div className="card">
        <div className="section-title mb-12">Macro Split</div>
        {[
          { label: 'Protein', grams: t.protein, cals: t.protein * 4, color: '#3b82f6' },
          { label: 'Carbohydrates', grams: t.carbs, cals: t.carbs * 4, color: '#f59e0b' },
          { label: 'Fat', grams: t.fat, cals: t.fat * 9, color: '#a855f7' },
        ].map(m => {
          const pct = t.calories > 0 ? Math.round((m.cals / t.calories) * 100) : 0
          return (
            <div key={m.label} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{m.label}</span>
                <span style={{ color: m.color, fontFamily: 'var(--font-display)', fontSize: 15 }}>
                  {m.grams}g · {pct}%
                </span>
              </div>
              <div style={{ height: 6, background: 'var(--bg-elevated)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: m.color, borderRadius: 3 }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
