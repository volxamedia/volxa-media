import React from 'react'

const TABS = [
  {
    id: 'food',
    label: 'Food',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="nav-icon">
        <path d="M12 2a3 3 0 0 0-3 3v7h6V5a3 3 0 0 0-3-3z"/>
        <path d="M5 12h14"/>
        <path d="M5 12c0 6 2 8 7 8s7-2 7-8"/>
      </svg>
    ),
  },
  {
    id: 'workout',
    label: 'Workout',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="nav-icon">
        <path d="M6 5v14M18 5v14M3 7h3M18 7h3M3 17h3M18 17h3M9 12h6"/>
      </svg>
    ),
  },
  {
    id: 'steps',
    label: 'Steps',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="nav-icon">
        <path d="M13 3l-4 7h8l-4 7"/>
        <circle cx="13" cy="3" r="1" fill="currentColor" stroke="none"/>
      </svg>
    ),
  },
  {
    id: 'progress',
    label: 'Progress',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="nav-icon">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="nav-icon">
        <circle cx="12" cy="8" r="4"/>
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
      </svg>
    ),
  },
]

export function Navigation({ activeTab, onTabChange }) {
  return (
    <nav className="nav">
      {TABS.map(tab => (
        <button
          key={tab.id}
          className={`nav-item${activeTab === tab.id ? ' active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </nav>
  )
}
