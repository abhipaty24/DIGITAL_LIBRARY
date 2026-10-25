import { Router } from 'express'
import { timingSafeEqual } from 'node:crypto'
import bcrypt from 'bcryptjs'; import jwt from 'jsonwebtoken'; import rateLimit from 'express-rate-limit'; import { z } from 'zod'
import { pool } from '../db/pool.js'
import { requireAdmin, csrfGuard } from '../middleware/auth.js'
import fileRoutes from './files.js'
const r = Router(), wrap = (fn) => (req, res, next) => fn(req, res).catch(next)
const list = (sql) => wrap(async (_q, res) => res.json({ items: (await pool.query(sql)).rows }))
const id = (req) => Number.parseInt(req.params.id, 10) || 0
r.use(fileRoutes)

r.get('/student/profile', wrap(async (_q, res) => { const { rows } = await pool.query('SELECT full_name,roll_number,section,department,subject,faculty_name,avatar_url,instagram_url,github_url,linkedin_url,email FROM students LIMIT 1'); rows[0] ? res.json(rows[0]) : res.status(404).json({ error: 'Profile not found' }) }))
r.get('/student/resume', wrap(async (_q, res) => { const { rows } = await pool.query('SELECT resume_key FROM students LIMIT 1'); res.json({ available: !!rows[0]?.resume_key }) }))
const RES = 'SELECT id,title,description,category,original_filename,mime_type,file_size,created_at,(file_key IS NOT NULL) AS has_file FROM resources'
r.get('/resources', list(RES + ' ORDER BY created_at DESC')); r.get('/library', list(RES + ' ORDER BY created_at DESC'))
r.get('/modules', list('SELECT m.id,m.title,m.description,m.module_number,m.resource_id,m.created_at,r.mime_type,r.file_size FROM modules m LEFT JOIN resources r ON r.id=m.resource_id ORDER BY module_number'))
r.get('/lab-experiments', list('SELECT l.id,l.title,l.description,l.experiment_number,l.resource_id,l.created_at,r.mime_type,r.file_size FROM lab_experiments l LEFT JOIN resources r ON r.id=l.resource_id ORDER BY experiment_number'))
r.get('/tools', list('SELECT id,name,description,category,icon,documentation_url,resource_id,created_at FROM tools ORDER BY name'))
r.get('/resources/:id', wrap(async (req, res) => { const { rows } = await pool.query(RES + ' WHERE id=$1', [id(req)]); rows[0] ? res.json(rows[0]) : res.status(404).json({ error: 'Not found' }) }))
r.get('/resources/:id/download', wrap(async (req, res) => {
  const { rows } = await pool.query('SELECT file_key FROM resources WHERE id=$1', [id(req)])
  if (!rows[0]?.file_key) return res.status(404).json({ error: 'File not available' })
  res.status(501).json({ error: 'Object storage not configured yet' }) // TODO: redirect to a signed S3 URL
}))

const loginLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 })
const cookieOpts = { httpOnly: true, sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', secure: process.env.NODE_ENV === 'production' }
const matchesConfiguredAdmin = (email, password) => {
  const expectedPassword = process.env.ADMIN_PASSWORD || ''
  const provided = Buffer.from(password)
  const expected = Buffer.from(expectedPassword)
  return !!process.env.ADMIN_EMAIL && email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase() && provided.length === expected.length && timingSafeEqual(provided, expected)
}
const signAdmin = (res, admin) => res.cookie('token', jwt.sign(admin, process.env.JWT_SECRET, { expiresIn: '2h' }), { ...cookieOpts, maxAge: 7200000 }).json({ email: admin.email })
r.post('/auth/login', loginLimit, wrap(async (req, res) => {
  const b = z.object({ email: z.string().email(), password: z.string().min(1) }).safeParse(req.body)
  if (!b.success) return res.status(400).json({ error: 'Invalid input' })
  let rows
  try {
    rows = (await pool.query('SELECT * FROM admin_users WHERE email=$1', [b.data.email])).rows
  } catch {
    if (matchesConfiguredAdmin(b.data.email, b.data.password)) return signAdmin(res, { id: 'env-admin', email: process.env.ADMIN_EMAIL, role: 'admin' })
    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) return res.status(503).json({ error: 'Set ADMIN_EMAIL and ADMIN_PASSWORD in server/.env before signing in' })
    return res.status(503).json({ error: 'Admin authentication is unavailable until the database is running' })
  }
  if (rows[0] && await bcrypt.compare(b.data.password, rows[0].password_hash)) return signAdmin(res, { id: rows[0].id, email: rows[0].email, role: rows[0].role })
  if (matchesConfiguredAdmin(b.data.email, b.data.password)) return signAdmin(res, { id: 'env-admin', email: process.env.ADMIN_EMAIL, role: 'admin' })
  return res.status(401).json({ error: 'Invalid credentials' })
}))
r.post('/auth/logout', (_q, res) => res.clearCookie('token', cookieOpts).json({ ok: true }))
r.get('/admin/me', requireAdmin, wrap(async (req, res) => {
  if (req.admin.email) return res.json({ id: req.admin.id, email: req.admin.email, role: req.admin.role })
  res.json((await pool.query('SELECT id,email,role FROM admin_users WHERE id=$1', [req.admin.id])).rows[0])
}))

const rs = z.object({ title: z.string().min(1).max(200), description: z.string().max(2000).optional(), category: z.string().max(80).optional() })
r.post('/admin/resources', requireAdmin, csrfGuard, wrap(async (req, res) => { const b = rs.safeParse(req.body); if (!b.success) return res.status(400).json({ error: 'Invalid input' }); const { title, description, category } = b.data; res.status(201).json((await pool.query('INSERT INTO resources(title,description,category,uploaded_by) VALUES($1,$2,$3,$4) RETURNING *', [title, description, category, req.admin.id])).rows[0]) }))
r.put('/admin/resources/:id', requireAdmin, csrfGuard, wrap(async (req, res) => { const b = rs.safeParse(req.body); if (!b.success) return res.status(400).json({ error: 'Invalid input' }); const { title, description, category } = b.data; const q = await pool.query('UPDATE resources SET title=$1,description=$2,category=$3,updated_at=now() WHERE id=$4 RETURNING *', [title, description, category, id(req)]); q.rows[0] ? res.json(q.rows[0]) : res.status(404).json({ error: 'Not found' }) }))
r.delete('/admin/resources/:id', requireAdmin, csrfGuard, wrap(async (req, res) => { const q = await pool.query('DELETE FROM resources WHERE id=$1', [id(req)]); q.rowCount ? res.status(204).end() : res.status(404).json({ error: 'Not found' }) }))
export default r

import { spawn } from 'child_process'
import fs from 'fs'
import os from 'os'
import path from 'path'
import crypto from 'crypto'

r.post('/execute', async (req, res) => {
  try {
    const { language, code = '', stdin = '' } = req.body || {}
    const lang = String(language || 'python').toLowerCase()
    const id = crypto.randomUUID()
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'run-'))
    let cmd, args, file
    if (lang === 'python' || lang === 'py') {
      file = path.join(dir, 'main.py')
      fs.writeFileSync(file, code)
      cmd = 'python3'; args = [file]
    } else if (lang === 'node' || lang === 'javascript' || lang === 'js') {
      file = path.join(dir, 'main.js')
      fs.writeFileSync(file, code)
      cmd = 'node'; args = [file]
    } else if (lang === 'java') {
      file = path.join(dir, 'Main.java')
      fs.writeFileSync(file, code)
      cmd = 'javac'; args = [file]
      const compile = await new Promise((resolve) => {
        const p = spawn(cmd, args, { cwd: dir, timeout: 10000 })
        let out='', err=''; p.stdout.on('data',d=>out+=d); p.stderr.on('data',d=>err+=d)
        p.on('close', c => resolve({code:c, stdout:out, stderr:err}))
      })
      if (compile.code !== 0) { try{fs.rmSync(dir,{recursive:true,force:true})}catch{} return res.json({compile, run:{stdout:'',stderr:'',code:compile.code}}) }
      cmd = 'java'; args = ['-cp', dir, 'Main']
    } else if (lang === 'c') {
      file = path.join(dir, 'main.c')
      fs.writeFileSync(file, code)
      cmd = 'gcc'; args = ['-O2', '-o', path.join(dir,'main'), file]
      const compile = await new Promise((resolve) => {
        const p = spawn(cmd, args, { cwd: dir, timeout: 10000 })
        let out='', err=''; p.stdout.on('data',d=>out+=d); p.stderr.on('data',d=>err+=d)
        p.on('close', c => resolve({code:c, stdout:out, stderr:err}))
      })
      if (compile.code !== 0) { try{fs.rmSync(dir,{recursive:true,force:true})}catch{} return res.json({compile, run:{stdout:'',stderr:'',code:compile.code}}) }
      cmd = path.join(dir,'main'); args = []
    } else if (lang === 'cpp' || lang === 'c++') {
      file = path.join(dir, 'main.cpp')
      fs.writeFileSync(file, code)
      cmd = 'g++'; args = ['-O2', '-o', path.join(dir,'main'), file]
      const compile = await new Promise((resolve) => {
        const p = spawn(cmd, args, { cwd: dir, timeout: 10000 })
        let out='', err=''; p.stdout.on('data',d=>out+=d); p.stderr.on('data',d=>err+=d)
        p.on('close', c => resolve({code:c, stdout:out, stderr:err}))
      })
      if (compile.code !== 0) { try{fs.rmSync(dir,{recursive:true,force:true})}catch{} return res.json({compile, run:{stdout:'',stderr:'',code:compile.code}}) }
      cmd = path.join(dir,'main'); args = []
    } else {
      return res.status(400).json({error:'Unsupported language'})
    }
    const result = await new Promise((resolve) => {
      const p = spawn(cmd, args, { cwd: dir, timeout: 5000 })
      let out='', err=''; p.stdin.write(stdin || ''); p.stdin.end()
      p.stdout.on('data',d=>{out+=d.toString()})
      p.stderr.on('data',d=>{err+=d.toString()})
      p.on('close', c => resolve({code:c, stdout:out, stderr:err}))
    })
    try{fs.rmSync(dir,{recursive:true,force:true})}catch{}
    return res.json({compile:{code:0,stdout:'',stderr:''}, run:result})
  } catch (e) {
    res.status(500).json({error:e.message})
  }
})
