import React, { useState, useCallback, useRef } from 'react'
import { searchFoods } from '../data/foods'
import { calculateHealthScore, calculateGoalFit, getHealthScoreColor } from '../utils/calculations'
import { FoodScanner } from './FoodScanner'

const MEALS = [
  { key: 'breakfast', label: 'Breakfast', icon: '🌅' },
  { key: 'lunch', label: 'Lunch', icon: '☀️' },
  { key: 'dinner', label: 'Dinner', icon: '🌙' },
  { key: 'snack', label: 'Snack', icon: '🍎' },
  { key: 'pre-workout', label: 'Pre-Workout', icon: '⚡' },
  { key: 'post-workout', label: 'Post-Workout', icon: '💪' },
]

function ScoreBadge({ score, label }) {
  const color = getHealthScoreColor(score)
  return (
    <div style={{ textAlign: 'center', flexShrink: 0 }}>
      <div
        className="score-badge"
        style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}
      >
        {score}
      </div>
      <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 1, fontWeight: 700 }}>
        {label}
      </div>
    </div>
  )
}

function FoodModal({ food, onClose, onAdd, profile, macroTotals }) {
  const [servings, setServings] = useState(1)
  const [meal, setMeal] = useState('breakfast')

  const scale = servings || 1
  const macros = {
    calories: Math.round(food.calories * scale),
    protein: Math.round(food.protein * scale * 10) / 10,
    carbs: Math.round(food.carbs * scale * 10) / 10,
    fat: Math.round(food.fat * scale * 10) / 10,
    fiber: Math.round((food.fiber || 0) * scale * 10) / 10,
  }

  const healthScore = calculateHealthScore(food)
  const goalFit = calculateGoalFit(food, profile?.macroTargets, macroTotals)

  function handleAdd() {
    onAdd({
      id: Date.now() + Math.random(),
      foodId: food.id,
      name: food.name,
      brand: food.brand,
      meal,
      servings: scale,
      serving: food.serving,
      ...macros,
    })
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-title">{food.name}</div>
            {food.brand && (
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{food.brand}</div>
            )}
          </div>
          <button className="btn-icon" onClick={onClose} style={{ fontSize: 18, fontWeight: 700 }}>×</button>
        </div>

        <div className="row" style={{ gap: 16, marginBottom: 16, justifyContent: 'center' }}>
          <ScoreBadge score={healthScore} label="HEALTH" />
          <ScoreBadge score={goalFit} label="GOAL FIT" />
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4,1fr)',
          gap: 8, background: 'var(--bg-elevated)', borderRadius: 10, padding: 12, marginBottom: 16
        }}>
          {[
            { label: 'Cal', val: macros.calories, color: 'var(--accent)' },
            { label: 'Protein', val: `${macros.protein}g`, color: '#3b82f6' },
            { label: 'Carbs', val: `${macros.carbs}g`, color: '#f59e0b' },
            { label: 'Fat', val: `${macros.fat}g`, color: '#a855f7' },
          ].map(m => (
            <div key={m.label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: m.color }}>{m.val}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>{m.label}</div>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginBottom: 14 }}>
          Per {food.serving}
        </div>

        <div className="input-group">
          <label>Servings</label>
          <input
            className="input"
            type="number"
            value={servings}
            min="0.1"
            step="0.5"
            onChange={e => setServings(parseFloat(e.target.value) || 1)}
          />
        </div>

        <div className="input-group">
          <label>Meal</label>
          <select className="select" value={meal} onChange={e => setMeal(e.target.value)}>
            {MEALS.map(m => (
              <option key={m.key} value={m.key}>{m.icon} {m.label}</option>
            ))}
          </select>
        </div>

        <button className="btn btn-primary full-width" onClick={handleAdd}>
          Add {macros.calories} cal to {MEALS.find(m => m.key === meal)?.label}
        </button>
      </div>
    </div>
  )
}

function ManualEntryModal({ onClose, onAdd }) {
  const [meal, setMeal] = useState('breakfast')
  const [form, setForm] = useState({ name: '', calories: '', protein: '', carbs: '', fat: '', fiber: '' })

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  function handleAdd() {
    if (!form.name || !form.calories) return
    onAdd({
      id: Date.now() + Math.random(),
      foodId: null,
      name: form.name,
      brand: 'Custom',
      meal,
      servings: 1,
      serving: '1 serving',
      calories: parseFloat(form.calories) || 0,
      protein: parseFloat(form.protein) || 0,
      carbs: parseFloat(form.carbs) || 0,
      fat: parseFloat(form.fat) || 0,
      fiber: parseFloat(form.fiber) || 0,
    })
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Manual Entry</div>
          <button className="btn-icon" onClick={onClose} style={{ fontSize: 18 }}>×</button>
        </div>

        <div className="input-group">
          <label>Food Name *</label>
          <input className="input" placeholder="Custom Food" value={form.name} onChange={e => set('name', e.target.value)} />
        </div>

        <div className="input-group">
          <label>Meal</label>
          <select className="select" value={meal} onChange={e => setMeal(e.target.value)}>
            {MEALS.map(m => <option key={m.key} value={m.key}>{m.icon} {m.label}</option>)}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div className="input-group">
            <label>Calories *</label>
            <input className="input" type="number" placeholder="0" value={form.calories} onChange={e => set('calories', e.target.value)} />
          </div>
          <div className="input-group">
            <label>Protein (g)</label>
            <input className="input" type="number" placeholder="0" value={form.protein} onChange={e => set('protein', e.target.value)} />
          </div>
          <div className="input-group">
            <label>Carbs (g)</label>
            <input className="input" type="number" placeholder="0" value={form.carbs} onChange={e => set('carbs', e.target.value)} />
          </div>
          <div className="input-group">
            <label>Fat (g)</label>
            <input className="input" type="number" placeholder="0" value={form.fat} onChange={e => set('fat', e.target.value)} />
          </div>
        </div>

        <button
          className="btn btn-primary full-width"
          onClick={handleAdd}
          disabled={!form.name || !form.calories}
        >
          Add Food
        </button>
      </div>
    </div>
  )
}

export function FoodLog({ foodLog, onAdd, onRemove, profile, macroTotals }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [selectedFood, setSelectedFood] = useState(null)
  const [showManual, setShowManual] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [activeMeal, setActiveMeal] = useState('all')
  const searchTimeout = useRef(null)

  function handleSearch(val) {
    setQuery(val)
    clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => {
      setResults(val.length >= 1 ? searchFoods(val) : [])
    }, 120)
  }

  const targets = profile?.macroTargets || {}
  const remaining = {
    calories: (targets.calories || 0) - macroTotals.calories,
    protein: (targets.protein || 0) - macroTotals.protein,
    carbs: (targets.carbs || 0) - macroTotals.carbs,
    fat: (targets.fat || 0) - macroTotals.fat,
  }

  const grouped = MEALS.reduce((acc, m) => {
    acc[m.key] = foodLog.filter(e => e.meal === m.key)
    return acc
  }, {})

  const mealTabs = [{ key: 'all', label: 'All', icon: '📋' }, ...MEALS]

  const displayLog = activeMeal === 'all'
    ? foodLog
    : (grouped[activeMeal] || [])

  return (
    <div>
      {/* Remaining summary */}
      <div className="card mb-12" style={{ background: 'var(--bg-card)' }}>
        <div className="section-header" style={{ marginBottom: 8 }}>
          <span className="section-title">Remaining Today</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
          {[
            { label: 'CAL', val: Math.round(remaining.calories), color: 'var(--accent)' },
            { label: 'PROT', val: `${Math.round(remaining.protein)}g`, color: '#3b82f6' },
            { label: 'CARBS', val: `${Math.round(remaining.carbs)}g`, color: '#f59e0b' },
            { label: 'FAT', val: `${Math.round(remaining.fat)}g`, color: '#a855f7' },
          ].map(m => (
            <div key={m.label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: remaining.calories < 0 && m.label === 'CAL' ? 'var(--danger)' : m.color }}>
                {m.val}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700 }}>{m.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="search-wrap">
        <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          className="input search-input"
          placeholder="Search 500+ foods..."
          value={query}
          onChange={e => handleSearch(e.target.value)}
        />
      </div>

      {results.length > 0 && (
        <div className="search-results">
          {results.map(food => {
            const hs = calculateHealthScore(food)
            const gf = calculateGoalFit(food, targets, macroTotals)
            return (
              <div key={food.id} className="search-result-item" onClick={() => { setSelectedFood(food); setQuery(''); setResults([]) }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <ScoreBadge score={hs} label="H" />
                </div>
                <div className="food-result-info">
                  <div className="food-result-name">{food.name}</div>
                  <div className="food-result-brand">{food.brand || food.category} · {food.serving}</div>
                </div>
                <div className="food-result-macros">
                  <span className="macro-pill cals">{food.calories}</span>
                  <span className="macro-pill protein">{food.protein}P</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Action buttons */}
      <div className="row mb-12" style={{ gap: 8 }}>
        <button
          className="btn btn-primary btn-sm flex-1"
          onClick={() => setShowScanner(true)}
          style={{ gap: 6 }}
        >
          📸 Scan Food
        </button>
        <button className="btn btn-ghost btn-sm flex-1" onClick={() => setShowManual(true)}>
          + Manual
        </button>
      </div>

      {/* Meal filter tabs */}
      <div className="tab-bar">
        {mealTabs.map(m => (
          <button
            key={m.key}
            className={`tab-btn${activeMeal === m.key ? ' active' : ''}`}
            onClick={() => setActiveMeal(m.key)}
          >
            {m.icon} {m.label}
          </button>
        ))}
      </div>

      {/* Food log */}
      {activeMeal === 'all' ? (
        MEALS.map(meal => {
          const entries = grouped[meal.key] || []
          if (entries.length === 0) return null
          const mealCals = entries.reduce((s, e) => s + e.calories, 0)
          const mealProt = entries.reduce((s, e) => s + e.protein, 0)
          return (
            <div key={meal.key} className="meal-section">
              <div className="meal-header">
                <div className="meal-header-left">
                  <span>{meal.icon}</span>
                  <span className="meal-name">{meal.label}</span>
                </div>
                <span className="meal-total">{mealCals} cal · {Math.round(mealProt)}g P</span>
              </div>
              {entries.map(entry => (
                <FoodEntry key={entry.id} entry={entry} onRemove={onRemove} />
              ))}
            </div>
          )
        })
      ) : (
        <div>
          {displayLog.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🍽️</div>
              <h3>No food logged yet</h3>
              <p>Search or add manually to track your {MEALS.find(m => m.key === activeMeal)?.label}.</p>
            </div>
          ) : (
            displayLog.map(entry => (
              <FoodEntry key={entry.id} entry={entry} onRemove={onRemove} />
            ))
          )}
        </div>
      )}

      {foodLog.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">🥗</div>
          <h3>Start logging your food</h3>
          <p>Search from 500+ foods including Chick-fil-A, Chipotle, Quest Bars, and more.</p>
        </div>
      )}

      {selectedFood && (
        <FoodModal
          food={selectedFood}
          onClose={() => setSelectedFood(null)}
          onAdd={onAdd}
          profile={profile}
          macroTotals={macroTotals}
        />
      )}
      {showManual && (
        <ManualEntryModal onClose={() => setShowManual(false)} onAdd={onAdd} />
      )}
      {showScanner && (
        <FoodScanner onClose={() => setShowScanner(false)} onAdd={onAdd} />
      )}
    </div>
  )
}

function FoodEntry({ entry, onRemove }) {
  return (
    <div className="food-log-item">
      <div className="food-item-info">
        <div className="food-item-name">{entry.name}</div>
        <div className="food-item-details">
          {entry.brand && entry.brand !== 'Custom' && `${entry.brand} · `}
          {entry.servings !== 1 ? `${entry.servings}x ${entry.serving}` : entry.serving}
          {' · '}{entry.protein}P / {entry.carbs}C / {entry.fat}F
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div className="food-item-cals">{entry.calories}</div>
        <button
          className="btn-icon"
          style={{ width: 28, height: 28, fontSize: 16, color: 'var(--danger)' }}
          onClick={() => onRemove(entry.id)}
        >
          ×
        </button>
      </div>
    </div>
  )
}
