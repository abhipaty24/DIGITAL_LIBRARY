const BASE = import.meta.env.VITE_API_URL || ''
export async function api(path, opts = {}) {
  const res = await fetch(`${BASE}/api${path}`, { credentials: 'include', headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'portal' }, ...opts })
  if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error(b.error || `Request failed (${res.status})`) }
  if (res.status === 204) return null
  return res.json()
}
export const downloadUrl = (id) => {
  if (typeof id === 'string' && (id.startsWith('/') || id.startsWith('http') || id.startsWith('data:'))) return id
  return `${BASE}/api/resources/${id}/download`
}
