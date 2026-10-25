import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import { getAllExperiments, mkSub } from '../data/experiments.js'
import CompilerPanel from '../components/CompilerPanel.jsx'

const starterCode = {
  Python: "print('Hello, Data Science!')\nfor i in range(1, 6):\n    print(i, i * i)",
  Java: "public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello, Java!\");\n    }\n}",
  C: "#include <stdio.h>\nint main(void) {\n    printf(\"Hello, C!\\n\");\n    return 0;\n}",
  "C++": "#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello, C++!\" << endl;\n    return 0;\n}"
}

export default function Experiments() {
  const [all, setAll] = useState(() => getAllExperiments())
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [lang, setLang] = useState('Python')

  useEffect(() => {
    setAll(getAllExperiments())
  }, [])

  const list = useMemo(() => {
    const query = q.toLowerCase()
    if (!query) return all
    return all.filter((e) =>
      JSON.stringify([e.id, e.name, e.description, ...(e.subExperiments || []).map((s) => s.name)]).toLowerCase().includes(query)
    )
  }, [all, q])

  const save = () => {
    const n = (document.getElementById('a_n').value || '').trim().padStart(2, '0')
    const nm = (document.getElementById('a_nm').value || '').trim()
    if (!nm || !n || n === '00') {
      alert('Number and name required')
      return
    }
    const subs = ['A', 'B', 'C', 'D', 'E', 'F', 'G'].map((l, i) => mkSub(n, i, (document.getElementById('a_s' + l)?.value || '').trim() || 'Part ' + l, '# add code', '', nm))
    const e = {
      id: n,
      name: nm,
      description: document.getElementById('a_d').value || 'Custom experiment',
      youtube: document.getElementById('a_y').value || 'https://www.youtube.com/results?search_query=' + encodeURIComponent(nm + ' Python tutorial'),
      github: document.getElementById('a_g').value || 'https://github.com/search?q=' + encodeURIComponent(nm + ' Python'),
      overview: '',
      aim: '',
      problemStatement: '',
      dataset: '',
      methodology: [],
      analysis: '',
      results: '',
      architecture: ['Dataset', 'Analysis', 'Results'],
      subExperiments: subs
    }
    const stored = JSON.parse(localStorage.getItem('mbu_exps') || '[]')
    stored.push(e)
    localStorage.setItem('mbu_exps', JSON.stringify(stored))
    setAll(getAllExperiments())
    setOpen(false)
  }

  const compilerLang = lang === 'C++' ? 'cpp' : lang.toLowerCase()

  return (
    <div className="experiments-page">
      <div className="page-intro">
        <div>
          <span className="eyebrow">PRACTICAL LEARNING / LAB</span>
          <h1 className="page-title">EXPERIMENTS</h1>
          <p className="muted">Explore Data Science labs and practise Java, Python, C, and C++ in the code playground.</p>
        </div>
        <button className="btn" onClick={() => setOpen(true)}><Plus size={16} /> ADD EXPERIMENT</button>
      </div>

      <section className="card compiler-card">
        <div className="card-head">
          <div>
            <span className="eyebrow">INTERACTIVE CODE PLAYGROUND</span>
            <h2>Online Compiler</h2>
          </div>
        </div>
        <CompilerPanel initialCode={starterCode[lang]} language={compilerLang} key={lang} />
      </section>

      <section className="section-block">
        <div className="section-head">
          <div>
            <span className="eyebrow">DATA SCIENCE / COURSE CONTENT</span>
            <h2>Lab Experiments</h2>
            <p className="muted">Open a lab to view its methodology, code samples, and sub-experiments.</p>
          </div>
        </div>
        <section className="card search-card">
          <div className="search-field">
            <Search size={18} />
            <input id="sr" placeholder="Search experiments..." value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </section>

        <div className="experiments-grid">
          {list.map((e) => (
            <article key={e.id} className="card experiment-card">
              <span className="tag">LAB {e.id}</span>
              <h3>{e.name}</h3>
              <p className="muted">{e.description}</p>
              <div className="experiment-subs">
                {(e.subExperiments || []).map((s) => (
                  <Link key={s.id} className="pill" to={`/experiment/${e.id}/sub/${s.id}`}>{s.id}</Link>
                ))}
              </div>
              <Link className="btn sm" to={`/experiment/${e.id}`}>Overview</Link>
            </article>
          ))}
        </div>
        {list.length === 0 && (
          <div className="card empty-card">
            <b>No experiments found</b>
            <p className="muted">Try another keyword.</p>
          </div>
        )}
      </section>

      {open && (
        <div className="modal open" onClick={(e) => { if (e.target.classList.contains('modal')) setOpen(false) }}>
          <div className="modal-panel">
            <h2>Add Experiment</h2>
            <div className="modal-grid">
              <label htmlFor="a_n">Experiment Number</label>
              <input id="a_n" />
              <label htmlFor="a_nm">Experiment Name</label>
              <input id="a_nm" />
              <label htmlFor="a_d">Description</label>
              <input id="a_d" />
              <label htmlFor="a_y">YouTube URL</label>
              <input id="a_y" />
              <label htmlFor="a_g">GitHub URL</label>
              <input id="a_g" />
              {['A', 'B', 'C', 'D', 'E', 'F', 'G'].map((l) => (
                <>
                  <label htmlFor={'a_s' + l}>Sub Experiment {l}</label>
                  <input id={'a_s' + l} />
                </>
              ))}
            </div>
            <div className="modal-actions">
              <button className="btn" onClick={save}>Save</button>
              <button className="btn ghost" onClick={() => setOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
