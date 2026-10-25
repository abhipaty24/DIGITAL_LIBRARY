import { randomUUID } from 'node:crypto'
import { Router } from 'express'
import multer from 'multer'
import { z } from 'zod'
import { pool } from '../db/pool.js'
import { csrfGuard } from '../middleware/auth.js'
import { addManagedFile, deleteManagedFile, fileSections, findManagedFile, getAdminFiles, getSectionFiles, hideStaticModule } from '../services/fileStore.js'

const r = Router()
const wrap = (fn) => (req, res, next) => fn(req, res).catch(next)
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } })
const receiveFile = (req, res, next) => upload.single('file')(req, res, (error) => {
  if (!error) return next()
  if (error instanceof multer.MulterError) return res.status(error.code === 'LIMIT_FILE_SIZE' ? 413 : 400).json({ error: error.code === 'LIMIT_FILE_SIZE' ? 'File exceeds the 50 MB upload limit' : 'Invalid file upload' })
  next(error)
})
const sectionSchema = z.enum(fileSections)
const dbRows = async (sql) => {
  try {
    return (await pool.query(sql)).rows
  } catch {
    return []
  }
}
const sectionFiles = (section) => wrap(async (_req, res) => {
  res.json({ items: await getSectionFiles(section) })
})

r.get('/modules', wrap(async (_req, res) => {
  const [records, files, adminFiles] = await Promise.all([
    dbRows('SELECT m.id,m.title,m.description,m.module_number,m.resource_id,m.created_at,r.mime_type,r.file_size FROM modules m LEFT JOIN resources r ON r.id=m.resource_id ORDER BY module_number'),
    getSectionFiles('modules'),
    getAdminFiles('modules'),
  ])
  res.json({ items: [...records, ...files], hiddenIds: adminFiles.hiddenStaticIds })
}))
r.get('/lab-experiments', wrap(async (_req, res) => {
  const [records, files] = await Promise.all([
    dbRows('SELECT l.id,l.title,l.description,l.experiment_number,l.resource_id,l.created_at,r.mime_type,r.file_size FROM lab_experiments l LEFT JOIN resources r ON r.id=l.resource_id ORDER BY experiment_number'),
    getSectionFiles('lab-experiments'),
  ])
  res.json({ items: [...records, ...files] })
}))
r.get('/tools', wrap(async (_req, res) => {
  const [records, files] = await Promise.all([
    dbRows('SELECT id,name,description,category,icon,documentation_url,resource_id,created_at FROM tools ORDER BY name'),
    getSectionFiles('tools'),
  ])
  res.json({ items: [...records, ...files] })
}))
r.get('/resources', wrap(async (_req, res) => {
  const [records, files] = await Promise.all([
    dbRows('SELECT id,title,description,category,original_filename,mime_type,file_size,created_at,(file_key IS NOT NULL) AS has_file FROM resources ORDER BY created_at DESC'),
    getSectionFiles('resources'),
  ])
  res.json({ items: [...files, ...records] })
}))
r.get('/library', wrap(async (_req, res) => {
  const [records, files] = await Promise.all([
    dbRows('SELECT id,title,description,category,original_filename,mime_type,file_size,created_at,(file_key IS NOT NULL) AS has_file FROM resources ORDER BY created_at DESC'),
    getSectionFiles('library'),
  ])
  res.json({ items: [...files, ...records] })
}))

r.get('/admin/files', wrap(async (req, res) => {
  const section = sectionSchema.safeParse(req.query.section)
  if (!section.success) return res.status(400).json({ error: 'Choose a valid section' })
  res.json(await getAdminFiles(section.data))
}))
r.post('/admin/files', csrfGuard, receiveFile, wrap(async (req, res) => {
  const body = z.object({
    section: sectionSchema,
    category: z.string().max(80).optional(),
    description: z.string().max(2000).optional(),
  }).safeParse(req.body)
  if (!body.success) return res.status(400).json({ error: 'Choose a valid section and category' })
  if (!req.file) return res.status(400).json({ error: 'Choose a file to upload' })

  const item = await addManagedFile({
    section: body.data.section,
    category: body.data.category,
    description: body.data.description,
    originalFilename: req.file.originalname,
    mimeType: req.file.mimetype,
    buffer: req.file.buffer,
  })
  res.status(201).json(item)
}))
r.delete('/admin/files/static/:id', csrfGuard, wrap(async (req, res) => {
  const body = z.object({ url: z.string().min(1) }).safeParse(req.body)
  if (!body.success) return res.status(400).json({ error: 'Invalid module file' })
  await hideStaticModule(req.params.id, body.data.url)
  res.status(204).end()
}))
r.delete('/admin/files/:id', csrfGuard, wrap(async (req, res) => {
  if (!await deleteManagedFile(req.params.id)) return res.status(404).json({ error: 'File not found' })
  res.status(204).end()
}))

r.get('/files/:id/download', async (req, res, next) => {
  try {
    const file = await findManagedFile(req.params.id)
    if (!file) return res.status(404).json({ error: 'File not found' })
    if (req.query.inline === '1' && file.mime_type === 'application/pdf') {
      res.type(file.mime_type).set('Content-Disposition', 'inline')
      return res.sendFile(file.absolutePath)
    }
    res.download(file.absolutePath, file.original_filename, (error) => {
      if (error && !res.headersSent) next(error)
    })
  } catch (error) {
    next(error)
  }
})

export default r