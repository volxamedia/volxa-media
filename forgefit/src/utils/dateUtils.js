export function getDateKey(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

export function getDayLabel(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  date.setHours(0, 0, 0, 0)
  const diff = (today - date) / 86400000
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  return date.toLocaleDateString('en-US', { weekday: 'short' })
}

export function getLast7Days() {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    days.push(getDateKey(date))
  }
  return days
}

// Returns Monday-Sunday of the week containing `date`
export function getWeekRange(date = new Date()) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const day = d.getDay()
  const monday = new Date(d)
  monday.setDate(d.getDate() - ((day === 0 ? 7 : day) - 1))
  const days = []
  for (let i = 0; i < 7; i++) {
    const cur = new Date(monday)
    cur.setDate(monday.getDate() + i)
    days.push(getDateKey(cur))
  }
  return days
}

export function getPrevWeekRange() {
  const d = new Date()
  d.setDate(d.getDate() - 7)
  return getWeekRange(d)
}

export function todayFormatted() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}
