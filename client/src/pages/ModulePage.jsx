import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Download, ExternalLink } from 'lucide-react'
import { getModule, modulePdfUrl, modules } from '../data/modules.js'
import PdfFlipbook from '../components/PdfFlipbook.jsx'

const ListCard = ({ title, items }) => (
  <section className="card module-card">
    <h2>{title}</h2>
    <ul className="module-list">{items.map((item) => <li key={item}>{item}</li>)}</ul>
  </section>
)

export default function ModulePage() {
  const { id } = useParams()
  const module = getModule(id)
  const pdf = modulePdfUrl(module.id)
  const [view, setView] = useState('flip')
  const [flipMounted, setFlipMounted] = useState(true)

  const index = modules.findIndex((item) => item.id === module.id)
  const previous = modules[index - 1]
  const next = modules[index + 1]

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'auto' }) }, [module.id])
  useEffect(() => { if (view === 'flip') setFlipMounted(true) }, [view])

  return (
    <div className="module-page">
      <div className="module-toolbar">
        <Link className="btn ghost sm" to="/modules"><ArrowLeft size={15} /> Modules</Link>
        <div className="module-switch" role="group" aria-label="Jump to module">
          {modules.map((item) => (
            <Link key={item.id} className={`folder-tab ${item.id === module.id ? 'on' : ''}`} to={`/modules/${item.id}`}>0{item.id}</Link>
          ))}
        </div>
      </div>

      <div className="module-heading">
        <span className="tag">Data Science · Module 0{module.id}</span>
        <h1 className="page-title">{module.title}</h1>
        <p className="muted">{module.description}</p>
      </div>

      <section className="card module-card">
        <h2>Overview</h2>
        <p>{module.overview}</p>
      </section>

      <ListCard title="Learning objectives" items={module.objectives} />
      <ListCard title="Topics" items={module.topics} />
      <ListCard title="Practical applications" items={module.applications} />

      <section className="card module-card module-pdf">
        <div className="module-pdf-head">
          <div>
            <h2>Module PDF · 15-page study guide</h2>
            <p className="muted">Read online or download for offline study</p>
          </div>
          <a className="btn" href={pdf} download><Download size={15} /> Download PDF</a>
        </div>

        <div className="module-pdf-actions">
          <button type="button" className={`btn sm ${view === 'vertical' ? '' : 'ghost'}`} aria-pressed={view === 'vertical'} onClick={() => setView('vertical')}>Vertical view</button>
          <button type="button" className={`btn sm ${view === 'flip' ? '' : 'ghost'}`} aria-pressed={view === 'flip'} onClick={() => setView('flip')}>Flip-book view</button>
          <a className="btn sm ghost" href={pdf} target="_blank" rel="noopener noreferrer">Open PDF <ExternalLink size={14} /></a>
        </div>

        <div className="module-pdf-pane" hidden={view !== 'vertical'}>
          <iframe title="Module PDF vertical reader" src={`${pdf}#view=FitH`} />
        </div>
        <div className="module-pdf-pane" hidden={view !== 'flip'}>
          {flipMounted && <PdfFlipbook url={pdf} />}
        </div>
      </section>

      <ListCard title="Notes / resources" items={module.resources} />
      <ListCard title="Key takeaways" items={module.takeaways} />

      <nav className="module-pager" aria-label="Module navigation">
        {previous ? <Link className="btn sm ghost" to={`/modules/${previous.id}`}><ArrowLeft size={15} /> Module 0{previous.id}</Link> : <span />}
        {next ? <Link className="btn sm" to={`/modules/${next.id}`}>Module 0{next.id} <ArrowRight size={15} /></Link> : <span />}
      </nav>
    </div>
  )
}
