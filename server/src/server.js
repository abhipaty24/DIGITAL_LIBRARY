import app from './app.js'
if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is required')
app.listen(process.env.PORT || 4000, () => console.log('API listening'))
