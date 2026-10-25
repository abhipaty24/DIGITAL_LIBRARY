import { useState } from 'react'
import { api } from '../services/api.js'
export default function Login() {
  const [f, setF] = useState({ email: '', password: '' }), [msg, setMsg] = useState('')
  const submit = async (e) => { e.preventDefault(); try { const d = await api('/auth/login', { method: 'POST', body: JSON.stringify(f) }); setMsg(`Signed in as ${d.email}`) } catch (er) { setMsg(er.message) } }
  return (
    <form className="card login" onSubmit={submit}>
      <h2>Admin sign in</h2>
      <label>Email<input type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></label>
      <label>Password<input type="password" required value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></label>
      <button className="btn">Sign in</button>{msg && <p role="status">{msg}</p>}
    </form>
  )
}
