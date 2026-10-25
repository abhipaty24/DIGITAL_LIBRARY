import jwt from 'jsonwebtoken'
export const requireAdmin = (req, res, next) => {
  try { const p = jwt.verify(req.cookies.token, process.env.JWT_SECRET); if (p.role !== 'admin') throw new Error('forbidden'); req.admin = p; next() }
  catch { res.status(401).json({ error: 'Authentication required' }) }
}
// CSRF mitigation for cookie auth: mutating requests must carry a custom header (blocked cross-site by CORS).
export const csrfGuard = (req, res, next) => (['GET', 'HEAD', 'OPTIONS'].includes(req.method) || req.get('X-Requested-With') === 'portal') ? next() : res.status(403).json({ error: 'Missing CSRF header' })
