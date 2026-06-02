import React, { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { calcStepsCalories } from '../utils/calculations'
import { getLast7Days, getDayLabel } from '../utils/dateUtils'

export function StepsTracker({ todaySteps, stepsLogs, onUpdate, profile }) {
  const [addValue, setAddValue] = useState('')
  const [mode, setMode] = useState('add') // 'add' | 'set'

  const weightLbs = profile?.weightLbs || 175
  const todayCals = calcStepsCalories(todaySteps, weightLbs)

  function handleUpdate() {
    const val = parseInt(addValue)
    if (!val || val < 0) return
    if (mode === 'add') {
      onUpdate(todaySteps + val)
    } else {
      onUpdate(val)
    }
    setAddValue('')
  }

  const last7 = getLast7Days()
  const chartData = last7.map(date => ({
    day: getDayLabel(date),
    steps: stepsLogs[date] || 0,
    cals: calcStepsCalories(stepsLogs[date] || 0, weightLbs),
    isToday: date === last7[last7.length - 1],
  }))

  const weekTotal = last7.reduce((s, d) => s + (stepsLogs[d] || 0), 0)
  const weekAvg = Math.round(weekTotal / 7)
  const best = Math.max(...last7.map(d => stepsLogs[d] || 0))

  const GOAL = 10000

  return (
    <div>
      {/* Main display */}
      <div className="card mb-12" style={{ textAlign: 'center', padding: '24px 16px' }}>
        <div className="steps-number">
          {todaySteps.toLocaleString()}
        </div>
        <div className="steps-label">Steps Today</div>
        <div className="steps-cal">~{todayCals} cal burned</div>

        {/* Goal ring */}
        <div style={{ marginTop: 16 }}>
          <div style={{ height: 6, background: 'var(--bg-elevated)', borderRadius: 3, overflow: 'hidden', maxWidth: 280, margin: '0 auto' }}>
            <div
              style={{
                height: '100%',
                width: `${Math.min(100, (todaySteps / GOAL) * 100)}%`,
                background: todaySteps >= GOAL ? 'var(--success)' : 'var(--accent)',
                borderRadius: 3,
                transition: 'width 0.5s ease'
              }}
            />
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
            {todaySteps >= GOAL
              ? `🎯 Goal reached! (${GOAL.toLocaleString()})`
              : `${(GOAL - todaySteps).toLocaleString()} to reach ${GOAL.toLocaleString()} goal`
            }
          </div>
        </div>
      </div>

      {/* Add steps */}
      <div className="card mb-12">
        <div className="section-header">
          <span className="section-title">Log Steps</span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className={`tab-btn btn-sm${mode === 'add' ? ' active' : ''}`} onClick={() => setMode('add')}>+ Add</button>
            <button className={`tab-btn btn-sm${mode === 'set' ? ' active' : ''}`} onClick={() => setMode('set')}>Set Total</button>
          </div>
        </div>
        <div className="row">
          <input
            className="input flex-1"
            type="number"
            placeholder={mode === 'add' ? 'Steps to add...' : 'Set exact total...'}
            value={addValue}
            onChange={e => setAddValue(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleUpdate()}
            min="0"
          />
          <button className="btn btn-primary" onClick={handleUpdate} disabled={!addValue}>
            {mode === 'add' ? 'Add' : 'Set'}
          </button>
        </div>
        {mode === 'set' && (
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
            This will replace today's step count entirely.
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="stat-grid mb-12">
        <div className="stat-card">
          <div className="stat-label">7-Day Avg</div>
          <div className="stat-value">{weekAvg.toLocaleString()}</div>
          <div className="stat-sub">steps/day</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Best Day</div>
          <div className="stat-value accent">{best.toLocaleString()}</div>
          <div className="stat-sub">this week</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Week Total</div>
          <div className="stat-value">{weekTotal.toLocaleString()}</div>
          <div className="stat-sub">steps</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Cal Burned</div>
          <div className="stat-value accent">{calcStepsCalories(weekTotal, weightLbs).toLocaleString()}</div>
          <div className="stat-sub">this week</div>
        </div>
      </div>

      {/* 7-day chart */}
      <div className="chart-container">
        <div className="chart-title">7-Day Step History</div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={chartData} barSize={26}>
            <XAxis dataKey="day" tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip
              contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8 }}
              labelStyle={{ color: 'var(--text-secondary)', fontSize: 12 }}
              formatter={(val, name) => [val.toLocaleString(), 'Steps']}
            />
            <Bar dataKey="steps" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.isToday ? 'var(--accent)' : '#333'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-muted)' }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--accent)', display: 'inline-block' }}></span>
            Today
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-muted)' }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: '#333', display: 'inline-block' }}></span>
            Previous
          </div>
        </div>
      </div>

      {/* Calorie breakdown per day */}
      <div className="card">
        <div className="section-title mb-8">Daily Calorie Breakdown</div>
        {chartData.map((d, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: i < chartData.length - 1 ? '1px solid var(--border)' : 'none' }}>
            <span style={{ fontSize: 13, color: d.isToday ? 'var(--accent)' : 'var(--text-secondary)', fontWeight: d.isToday ? 700 : 500 }}>{d.day}</span>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{d.steps.toLocaleString()} steps</span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--accent)' }}>{d.cals} cal</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
