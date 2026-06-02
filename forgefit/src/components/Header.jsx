import React from 'react'
import { todayFormatted } from '../utils/dateUtils'

function MacroBar({ label, current, target, color }) {
  const pct = target > 0 ? Math.min(100, (current / target) * 100) : 0
  const over = current > target
  return (
    <div className="macro-bar-group">
      <div className="macro-bar-label">
        <span>{label}</span>
        <span className="val">{Math.round(current)}</span>
      </div>
      <div className="macro-bar-track">
        <div
          className="macro-bar-fill"
          style={{
            width: `${pct}%`,
            background: over ? 'var(--danger)' : color,
          }}
        />
      </div>
    </div>
  )
}

export function Header({ profile, macroTotals }) {
  const t = profile?.macroTargets || {}
  const calPct = t.calories > 0 ? Math.round((macroTotals.calories / t.calories) * 100) : 0

  return (
    <header className="header">
      <div className="header-top">
        <span className="header-logo">FORGEFIT</span>
        <div style={{ textAlign: 'right' }}>
          <div className="header-date">{todayFormatted()}</div>
          <div className="header-cals">
            <span className="font-display" style={{ fontSize: 18, letterSpacing: 1 }}>
              {macroTotals.calories}
            </span>
            <span> / {t.calories || 0} kcal</span>
          </div>
        </div>
      </div>
      <div className="macro-bars">
        <MacroBar
          label="PROT"
          current={macroTotals.protein}
          target={t.protein || 0}
          color="#3b82f6"
        />
        <MacroBar
          label="CARBS"
          current={macroTotals.carbs}
          target={t.carbs || 0}
          color="#f59e0b"
        />
        <MacroBar
          label="FAT"
          current={macroTotals.fat}
          target={t.fat || 0}
          color="#a855f7"
        />
        <MacroBar
          label="CAL"
          current={macroTotals.calories}
          target={t.calories || 0}
          color="var(--accent)"
        />
      </div>
    </header>
  )
}
