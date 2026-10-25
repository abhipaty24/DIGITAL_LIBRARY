import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, ExternalLink, Play } from 'lucide-react'
import { getAllExperiments } from '../data/experiments.js'
import CompilerPanel from '../components/CompilerPanel.jsx'

export default function SubExperimentPage() {
  const { experiment, sub } = useParams()
  const all = useMemo(() => getAllExperiments(), [])
  const e = all.find((x) => x.id === experiment) || all[0]
  const subs = e.subExperiments || []
  const i = Math.max(0, subs.findIndex((s) => s.id === sub))
  const s = subs[i]
  const prev = i > 0 ? subs[i - 1] : null
  const next = i < subs.length - 1 ? subs[i + 1] : null

  if (!s) return <div className="card">Sub-experiment not found.</div>

  return (
    <div className="subexperiment-page">
      <Link className="btn ghost sm" to={`/experiment/${e.id}`}><ArrowLeft size={15} /> Experiment {e.id}</Link>
      <div className="subexperiment-nav">
        {prev ? <Link className="btn sm ghost" to={`/experiment/${e.id}/sub/${prev.id}`}><ArrowLeft size={15} /> Previous</Link> : <span />}
        <span className="sub-id">{s.id}</span>
        {next ? <Link className="btn sm ghost" to={`/experiment/${e.id}/sub/${next.id}`}>Next <ArrowRight size={15} /></Link> : <span />}
      </div>
      <div className="subexperiment-pills">
        {subs.map((x) => <Link key={x.id} className={`pill ${x.id === s.id ? 'on' : ''}`} to={`/experiment/${e.id}/sub/${x.id}`}>{x.id}</Link>)}
      </div>

      <div className="experiment-header">
        <span className="tag">Experiment {s.id}</span>
        <h1 className="page-title">{s.name}</h1>
        <div className="experiment-links">
          <a className="btn sm ghost" href={s.youtube} target="_blank" rel="noopener noreferrer"><Play size={15} /> YouTube Tutorial</a>
          <a className="btn sm ghost" href={s.github} target="_blank" rel="noopener noreferrer"><ExternalLink size={15} /> GitHub Repository</a>
        </div>
      </div>

      <section className="card"><h2>Experiment Aim</h2><p>{s.aim}</p></section>
      <section className="card"><h2>Problem Statement</h2><p>{s.problemStatement}</p></section>
      <section className="card"><h2>Required Tools</h2><div className="row wrap">{(s.tools || []).map((t) => <span key={t} className="pill">{t}</span>)}</div></section>
      <section className="card"><h2>Concept Explanation</h2><p>{s.explanation}</p></section>
      <section className="card"><h2>Step-by-step Procedure</h2><ol>{(s.procedure || []).map((x, i) => <li key={i}>{x}</li>)}</ol></section>
      <section className="card">
        <h2>Code Editor & Compiler</h2>
        <CompilerPanel initialCode={s.code} language="python" />
      </section>
      <section className="card"><h2>Expected Input</h2><p>{s.input}</p></section>
      <section className="card"><h2>Result</h2><pre className="code-block">{s.result}</pre></section>
      <section className="card"><h2>Analysis</h2><p>{s.analysis}</p></section>
      <section className="card"><h2>Conclusion</h2><p>{s.conclusion}</p></section>
    </div>
  )
}
