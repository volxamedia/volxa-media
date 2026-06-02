import React, { useState } from 'react'
import { calculateMacroTargets } from '../utils/calculations'

const GOALS = [
  { key: 'cut', icon: '🔥', name: 'Cut', desc: 'Lose fat, preserve muscle' },
  { key: 'recomp', icon: '⚡', name: 'Recomp', desc: 'Build muscle, lose fat' },
  { key: 'bulk', icon: '💪', name: 'Bulk', desc: 'Maximize muscle gain' },
  { key: 'maintain', icon: '⚖️', name: 'Maintain', desc: 'Hold current weight' },
]

export function ProfileSetup({ onComplete }) {
  const [name, setName] = useState('')
  const [weight, setWeight] = useState('')
  const [goal, setGoal] = useState('recomp')
  const [unit, setUnit] = useState('lbs')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) { setError('Please enter your name.'); return }
    const w = parseFloat(weight)
    if (!w || w < 50 || w > 800) { setError('Please enter a valid body weight.'); return }
    const weightLbs = unit === 'kg' ? w * 2.20462 : w
    const macroTargets = calculateMacroTargets(weightLbs, goal)
    onComplete({ name: name.trim(), weightLbs: Math.round(weightLbs), goal, macroTargets })
  }

  return (
    <div className="profile-setup">
      <div className="profile-setup-inner">
        <div className="setup-logo">FORGEFIT</div>
        <div className="setup-tagline">Build your best body</div>

        <form className="setup-step" onSubmit={handleSubmit}>
          <div className="setup-step-title">Welcome, Athlete 👋</div>
          <div className="setup-step-desc">
            Tell us about yourself so we can calculate your personalized macros.
          </div>

          <div className="input-group">
            <label>Your Name</label>
            <input
              className="input"
              placeholder="John Smith"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="input-group">
            <label>Body Weight</label>
            <div className="row">
              <input
                className="input flex-1"
                type="number"
                placeholder={unit === 'lbs' ? '175' : '79'}
                value={weight}
                onChange={e => setWeight(e.target.value)}
                min="1"
              />
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ minWidth: 60, flexShrink: 0 }}
                onClick={() => setUnit(u => u === 'lbs' ? 'kg' : 'lbs')}
              >
                {unit}
              </button>
            </div>
          </div>

          <div className="input-group" style={{ marginBottom: 4 }}>
            <label>Your Goal</label>
          </div>
          <div className="goal-grid">
            {GOALS.map(g => (
              <div
                key={g.key}
                className={`goal-option${goal === g.key ? ' selected' : ''}`}
                onClick={() => setGoal(g.key)}
              >
                <div className="goal-option-icon">{g.icon}</div>
                <div className="goal-option-name">{g.name}</div>
                <div className="goal-option-desc">{g.desc}</div>
              </div>
            ))}
          </div>

          {error && (
            <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 12 }}>{error}</p>
          )}

          <button type="submit" className="btn btn-primary full-width" style={{ marginTop: 8 }}>
            Start Tracking →
          </button>
        </form>
      </div>
    </div>
  )
}
