import 'dotenv/config'
import express from 'express'; import helmet from 'helmet'; import cors from 'cors'; import cookieParser from 'cookie-parser'
import routes from './routes/index.js'
const app = express()
app.use(helmet()); app.use(cors({ origin: process.env.FRONTEND_ORIGIN, credentials: true }))
app.use(express.json({ limit: '100kb' })); app.use(cookieParser())
app.get('/health', (_q, res) => res.json({ ok: true }))
app.use('/api', routes)
app.use('/api', (_q, res) => res.status(404).json({ error: 'Not found' }))
app.use((err, _q, res, _n) => { console.error(err); res.status(500).json({ error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message }) })
export default app
