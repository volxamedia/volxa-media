import React, { useState, useEffect } from 'react'
import { MUSCLE_GROUPS, getExercisesByGroup, searchExercises } from '../data/exercises'
import { calcExerciseCals, calcExerciseVolumeKg } from '../utils/calculations'
import { getWeekRange, getPrevWeekRange, getDateKey } from '../utils/dateUtils'

const EMPTY_SET = { reps: '', weight: '' }

function ExerciseLogger({ exercise, weightLbs, prevVolume, onSave, onRemove }) {
  const [sets, setSets] = useState([{ ...EMPTY_SET }])

  function updateSet(idx, field, val) {
    setSets(prev => prev.map((s, i) => i === idx ? { ...s, [field]: val } : s))
  }

  function addSet() { setSets(s => [...s, { ...EMPTY_SET }]) }
  function removeSet(idx) { setSets(s => s.filter((_, i) => i !== idx)) }

  const parsedSets = sets.map(s => ({ reps: parseFloat(s.reps) || 0, weight: parseFloat(s.weight) || 0 }))
  const cals = calcExerciseCals(parsedSets, exercise.met, weightLbs)
  const volume = calcExerciseVolumeKg(parsedSets)
  const prevVol = prevVolume || 0
  const volDiff = prevVol > 0 ? Math.round(((volume - prevVol) / prevVol) * 100) : null

  function handleSave() {
    const valid = parsedSets.filter(s => s.reps > 0)
    if (valid.length === 0) return
    onSave({ name: exercise.name, muscleGroup: exercise.muscleGroup, met: exercise.met, sets: valid, caloriesBurned: cals })
  }

  return (
    <div className="exercise-item">
      <div className="exercise-header">
        <div>
          <div className="exercise-name">{exercise.name}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{exercise.muscleGroup}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {volDiff !== null && (
            <span className={`compare-badge ${volDiff > 0 ? 'up' : volDiff < 0 ? 'down' : 'same'}`}>
              {volDiff > 0 ? '▲' : volDiff < 0 ? '▼' : '—'} {Math.abs(volDiff)}%
            </span>
          )}
          <div className="exercise-cal-badge">{cals > 0 ? `~${cals} cal` : ''}</div>
          <button className="btn-icon" onClick={onRemove} style={{ color: 'var(--danger)' }}>×</button>
        </div>
      </div>

      <table className="sets-table">
        <thead>
          <tr>
            <th>Set</th>
            <th>Reps</th>
            <th>Weight (lbs)</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {sets.map((set, i) => (
            <tr key={i}>
              <td className="set-row-num">{i + 1}</td>
              <td>
                <input
                  type="number"
                  placeholder="10"
                  value={set.reps}
                  onChange={e => updateSet(i, 'reps', e.target.value)}
                  min="0"
                />
              </td>
              <td>
                <input
                  type="number"
                  placeholder="135"
                  value={set.weight}
                  onChange={e => updateSet(i, 'weight', e.target.value)}
                  min="0"
                />
              </td>
              <td>
                {sets.length > 1 && (
                  <button
                    className="btn-icon"
                    style={{ width: 24, height: 24, fontSize: 14, color: 'var(--danger)' }}
                    onClick={() => removeSet(i)}
                  >×</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="row mt-8" style={{ gap: 8 }}>
        <button className="btn btn-ghost btn-sm flex-1" onClick={addSet}>+ Set</button>
        <button
          className="btn btn-primary btn-sm flex-1"
          onClick={handleSave}
          disabled={parsedSets.every(s => s.reps === 0)}
        >
          Log Exercise
        </button>
      </div>

      {volume > 0 && (
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6, textAlign: 'center' }}>
          Volume: {volume.toLocaleString()} lbs
          {prevVol > 0 && ` (prev: ${prevVol.toLocaleString()})`}
        </div>
      )}
    </div>
  )
}

function LoggedExercise({ entry }) {
  const volume = calcExerciseVolumeKg(entry.sets)
  return (
    <div className="exercise-item" style={{ borderColor: 'var(--accent-dim-border)' }}>
      <div className="exercise-header">
        <div>
          <div className="exercise-name">{entry.name}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {entry.sets.length} sets · {volume.toLocaleString()} lbs volume
          </div>
        </div>
        <div className="exercise-cal-badge">{entry.caloriesBurned} cal</div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {entry.sets.map((s, i) => (
          <span key={i} className="tag tag-orange" style={{ fontSize: 12 }}>
            {s.reps} × {s.weight} lbs
          </span>
        ))}
      </div>
    </div>
  )
}

export function WorkoutLog({ workoutLog, allWorkoutLogs, onSave, profile }) {
  const [activeGroup, setActiveGroup] = useState('Chest')
  const [activeExercises, setActiveExercises] = useState([])
  const [searchQ, setSearchQ] = useState('')
  const [searchResults, setSearchResults] = useState([])

  const weightLbs = profile?.weightLbs || 175

  // Get previous week's data for comparison
  const prevWeek = getPrevWeekRange()
  const prevWeekLogs = prevWeek.flatMap(d => allWorkoutLogs[d] || [])

  function getPrevVolume(exerciseName) {
    const entries = prevWeekLogs.filter(e => e.name === exerciseName)
    return entries.reduce((acc, e) => acc + calcExerciseVolumeKg(e.sets), 0)
  }

  function handleSearch(val) {
    setSearchQ(val)
    setSearchResults(val.length >= 1 ? searchExercises(val) : [])
  }

  function addExercise(exercise) {
    if (activeExercises.find(e => e.name === exercise.name)) return
    setActiveExercises(prev => [...prev, exercise])
    setSearchQ('')
    setSearchResults([])
  }

  function removeActiveExercise(name) {
    setActiveExercises(prev => prev.filter(e => e.name !== name))
  }

  function handleLogExercise(exercise, data) {
    onSave({ ...data, timestamp: Date.now() })
  }

  const totalCalsBurned = workoutLog.reduce((s, e) => s + (e.caloriesBurned || 0), 0)
  const groupExercises = getExercisesByGroup(activeGroup)

  return (
    <div>
      {/* Today's calorie burn */}
      <div className="card mb-12">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div>
            <div className="section-title">Today's Burn</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: 'var(--accent)', letterSpacing: 1 }}>
              ~{totalCalsBurned}
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-muted)', letterSpacing: 0 }}> cal</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="section-title">Exercises</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: 'var(--text)', letterSpacing: 1 }}>
              {workoutLog.length}
            </div>
          </div>
        </div>
      </div>

      {/* Already logged exercises */}
      {workoutLog.length > 0 && (
        <div className="mb-12">
          <div className="section-title mb-8">Logged Today</div>
          {workoutLog.map((entry, i) => <LoggedExercise key={i} entry={entry} />)}
        </div>
      )}

      {/* Search */}
      <div className="search-wrap">
        <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          className="input search-input"
          placeholder="Search exercises..."
          value={searchQ}
          onChange={e => handleSearch(e.target.value)}
        />
      </div>

      {searchResults.length > 0 && (
        <div className="search-results mb-12">
          {searchResults.map(ex => (
            <div key={ex.name} className="search-result-item" onClick={() => addExercise(ex)}>
              <div className="food-result-info">
                <div className="food-result-name">{ex.name}</div>
                <div className="food-result-brand">{ex.muscleGroup}</div>
              </div>
              <span className="tag tag-orange">+ Add</span>
            </div>
          ))}
        </div>
      )}

      {/* Muscle group tabs */}
      <div className="tab-bar">
        {MUSCLE_GROUPS.map(g => (
          <button
            key={g}
            className={`tab-btn${activeGroup === g ? ' active' : ''}`}
            onClick={() => setActiveGroup(g)}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Exercise list for group */}
      {groupExercises.map(ex => {
        const isActive = activeExercises.find(e => e.name === ex.name)
        const prevVol = getPrevVolume(ex.name)
        return isActive ? (
          <ExerciseLogger
            key={ex.name}
            exercise={ex}
            weightLbs={weightLbs}
            prevVolume={prevVol}
            onSave={data => handleLogExercise(ex, data)}
            onRemove={() => removeActiveExercise(ex.name)}
          />
        ) : (
          <div
            key={ex.name}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 12px', background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 8, marginBottom: 6, cursor: 'pointer'
            }}
            onClick={() => addExercise(ex)}
          >
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{ex.name}</div>
              {prevVol > 0 && (
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  Last week: {prevVol.toLocaleString()} lbs
                </div>
              )}
            </div>
            <span className="tag tag-blue" style={{ fontSize: 11 }}>MET {ex.met}</span>
          </div>
        )
      })}
    </div>
  )
}
