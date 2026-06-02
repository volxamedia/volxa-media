export const storage = {
  get(key) {
    try {
      const val = window.localStorage.getItem(key)
      return val ? JSON.parse(val) : null
    } catch {
      return null
    }
  },
  set(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // storage full or unavailable
    }
  },
  remove(key) {
    try {
      window.localStorage.removeItem(key)
    } catch {
      // ignore
    }
  },
}
