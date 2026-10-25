import { useEffect, useState } from 'react'
import { ExternalLink, Pencil, Plus, Trash2 } from 'lucide-react'

const getProjects = () => {
  try {
    const raw = localStorage.getItem('mbu_projects')
    if (raw) return JSON.parse(raw)
  } catch {}
  return [
    { id: 'seed-1', title: 'Student Performance Analysis', description: 'Explore student marks, attendance, and performance trends using Python.', category: 'Data Science', tech: 'Python, Pandas, Matplotlib', url: 'https://github.com/topics/student-performance-analysis' },
    { id: 'seed-2', title: 'Gas Leakage Detection System', description: 'An academic project concept for detecting gas leakage and triggering alerts.', category: 'IoT', tech: 'Sensors, Embedded Systems', url: '' }
  ]
}

export default function Projects() {
  const [projects, setProjects] = useState(() => getProjects())
  const [q, setQ] = useState('')
  const [modal, setModal] = useState(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('mbu_projects')
      if (!raw) localStorage.setItem('mbu_projects', JSON.stringify(getProjects()))
    } catch {}
  }, [])

  const save = () => {
    const title = (document.getElementById('p_title').value || '').trim()
    if (!title) { alert('Project title is required'); return }
    const p = {
      id: modal?.id || 'p-' + Date.now(),
      title,
      description: (document.getElementById('p_desc').value || '').trim(),
      category: (document.getElementById('p_cat').value || 'Data Science').trim(),
      tech: (document.getElementById('p_tech').value || '').trim(),
      url: (document.getElementById('p_url').value || '').trim()
    }
    const list = getProjects()
    const ix = list.findIndex(x => x.id === p.id)
    if (ix >= 0) list[ix] = p
    else list.unshift(p)
    localStorage.setItem('mbu_projects', JSON.stringify(list))
    setProjects(list)
    setModal(null)
  }

  const remove = (id) => {
    if (!confirm('Delete this project from this browser\'s catalogue?')) return
    const list = getProjects().filter(p => p.id !== id)
    localStorage.setItem('mbu_projects', JSON.stringify(list))
    setProjects(list)
  }

  const filtered = projects.filter(p => JSON.stringify(p).toLowerCase().includes(q.toLowerCase()))

  return (
    <div className="projects-page">
      <div className="page-intro">
        <div>
          <span className="eyebrow">PROJECT STUDIO / 02</span>
          <h1 className="page-title">PROJECTS</h1>
          <p className="muted">Discover academic projects or add a new idea to your local project catalogue.</p>
        </div>
        <button className="btn primary" onClick={() => setModal({})}><Plus size={16} /> Add New Project</button>
      </div>

      <section className="card">
        <div className="row sp">
          <div>
            <h2>Project catalogue</h2>
            <p className="muted">New projects appear here after saving.</p>
          </div>
        </div>
        <input className="search" placeholder="Search projects..." value={q} onChange={(e) => setQ(e.target.value)} />
      </section>

      <div className="cols projects-cols">
        {filtered.map(p => (
          <article key={p.id} className="card feature-card project-card">
            <div className="project-art"><span>✦</span><small>{(p.category || 'ACADEMIC PROJECT').toUpperCase()}</small></div>
            <span className="eyebrow">{p.category || 'Project'}</span>
            <h3>{p.title}</h3>
            <p className="muted">{p.description}</p>
            <div className="tech">{p.tech || 'Technologies not specified'}</div>
            <div className="row wrap">
              {p.url ? <a className="btn primary" href={p.url} target="_blank" rel="noopener noreferrer">View project <ExternalLink size={14} /></a> : <button className="btn primary" onClick={() => alert('No project link has been added')}>View project <ExternalLink size={14} /></button>}
              <button className="btn" onClick={() => setModal(p)}><Pencil size={14} /> Edit</button>
              <button className="btn" onClick={() => remove(p.id)}><Trash2 size={14} /> Delete</button>
            </div>
          </article>
        ))}
      </div>
      {filtered.length === 0 && <div className="card"><b>No projects found.</b><p className="muted">Add your first project.</p></div>}

      {modal !== null && (
        <div className="modal open" onClick={(e) => { if (e.target.classList.contains('modal')) setModal(null) }}>
          <div className="modal-panel">
            <h2>{modal.id ? 'Edit project' : 'Add New Project'}</h2>
            <div className="modal-grid">
              <label htmlFor="p_title">Project title</label>
              <input id="p_title" defaultValue={modal.title || ''} placeholder="Project name" />
              <label htmlFor="p_desc">Description</label>
              <textarea id="p_desc" rows={3} defaultValue={modal.description || ''} placeholder="What does this project do?" />
              <label htmlFor="p_cat">Category</label>
              <input id="p_cat" defaultValue={modal.category || 'Data Science'} placeholder="Data Science, IoT, Web..." />
              <label htmlFor="p_tech">Technology stack</label>
              <input id="p_tech" defaultValue={modal.tech || ''} placeholder="Python, Pandas, ..." />
              <label htmlFor="p_url">Documentation / demo / repository URL</label>
              <input id="p_url" defaultValue={modal.url || ''} placeholder="https://..." />
            </div>
            <div className="modal-actions">
              <button className="btn primary" onClick={save}>Save project</button>
              <button className="btn ghost" onClick={() => setModal(null)}>Cancel</button>
            </div>
            <p className="muted">This static version stores projects in this browser.</p>
          </div>
        </div>
      )}
    </div>
  )
}
