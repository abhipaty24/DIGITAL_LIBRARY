const BASE = import.meta.env.VITE_API_URL || ''
// Static hosts (e.g. GitHub Pages) have no API server. When no backend URL is
// configured for a production build, return an empty list for GET requests so
// pages render their built-in content instead of a connection error.
const STATIC_ONLY = import.meta.env.PROD && !BASE
export async function api(path, opts = {}) {
  if (STATIC_ONLY && (opts.method || 'GET').toUpperCase() === 'GET') return { items: [] }
  const res = await fetch(`${BASE}/api${path}`, { credentials: 'include', headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'portal' }, ...opts })
  if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error(b.error || `Request failed (${res.status})`) }
  if (res.status === 204) return null
  return res.json()
}
export const downloadUrl = (id) => {
  if (typeof id === 'string' && (id.startsWith('/') || id.startsWith('http') || id.startsWith('data:'))) return id
  return `${BASE}/api/resources/${id}/download`
}
