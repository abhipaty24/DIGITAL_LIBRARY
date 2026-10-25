import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ExternalLink, Play } from 'lucide-react'
import { getAllExperiments } from '../data/experiments.js'
import CompilerPanel from '../components/CompilerPanel.jsx'

export default function ExperimentPage() {
  const { id } = useParams()
  const all = useMemo(() => getAllExperiments(), [])
  const e = all.find((x) => x.id === id) || all[0]
  const [lang, setLang] = useState('python')
  const code = e?.subExperiments?.[0]?.code || "print(\"Hello from the experiment!\")"

  const sections = [
    ['ov', 'Experiment Overview', <p key="ov">{e.overview}</p>],
    ['aim', 'Aim', <p key="aim">{e.aim}</p>],
    ['ps', 'Problem Statement', <p key="ps">{e.problemStatement}</p>],
    ['ds', 'Dataset', <p key="ds">{e.dataset}</p>],
    ['me', 'Methodology', <ol key="me">{(e.methodology || []).map((x, i) => <li key={i}>{x}</li>)}</ol>],
    ['an', 'Analysis', <p key="an">{e.analysis}</p>],
    ['re', 'Results', <p key="re">{e.results}</p>],
    ['ar', 'Architecture', <div key="ar" className="flow">{(e.architecture || []).map((a, i) => (<><div key={'f'+i} className="flow-item">{a}</div>{i < (e.architecture.length - 1) && <i key={'i'+i}>↓</i>}</>))}</div>],
    ['su', 'Sub Experiments', <div key="su" className="row wrap">{(e.subExperiments || []).map((s) => <Link key={s.id} className="pill" to={`/experiment/${e.id}/sub/${s.id}`}>{s.id}</Link>)}</div>]
  ]

  return (
    <div className="experiment-detail">
      <Link className="btn ghost sm" to="/experiments"><ArrowLeft size={15} /> Experiments</Link>
      <div className="experiment-header">
        <span className="tag">Experiment {e.id}</span>
        <h1 className="page-title">{e.name}</h1>
        <div className="experiment-links">
          <a className="btn sm ghost" href={e.youtube} target="_blank" rel="noopener noreferrer"><Play size={15} /> YouTube Tutorial</a>
          <a className="btn sm ghost" href={e.github} target="_blank" rel="noopener noreferrer"><ExternalLink size={15} /> GitHub Repository</a>
        </div>
      </div>

      <div className="experiment-layout">
        <aside className="experiment-sidebar card">
          <h3>Contents</h3>
          <nav>
            {sections.map((s) => <a key={s[0]} href={'#' + s[0]}>{s[1]}</a>)}
          </nav>
        </aside>
        <div className="experiment-main">
          <section className="card">
            <div className="card-head">
              <h2>Live Code Lab</h2>
              <select value={lang} onChange={(ev) => setLang(ev.target.value)}>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="c">C</option>
                <option value="cpp">C++</option>
              </select>
            </div>
            <CompilerPanel initialCode={code} language={lang} />
          </section>

          {sections.map((s) => (
            <section key={s[0]} id={s[0]} className="card">
              <h2>{s[1]}</h2>
              {s[2]}
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
