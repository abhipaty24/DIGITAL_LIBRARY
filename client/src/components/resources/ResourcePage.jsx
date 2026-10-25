import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Download, ExternalLink, Eye, FileText, Pencil, ArrowRight, Plus, Trash2 } from 'lucide-react'
import { api, downloadUrl } from '../../services/api.js'
import { modules as courseModules, moduleForCourse } from '../../data/modules.js'
import { tools as referenceTools } from '../../data/tools.js'
import { resources as referenceResources, resourceIcon } from '../../data/resources.js'
import FilePreview from './FilePreview.jsx'
import FileManager from '../../pages/FileManager.jsx'

const fmtSize = (b) => (b ? (b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.ceil(b / 1024)} KB`) : '')
const moduleSubjects = ['Data Science', 'Machine Learning', 'Others']
const subjectStorageKey = 'mbu-subject-assignments-v1'
const readSubjectAssignments = () => {
  try {
    return JSON.parse(localStorage.getItem(subjectStorageKey) || '{}')
  } catch {
    return {}
  }
}
const readCourses = () => {
  const stored = readSubjectAssignments()
  return Array.isArray(stored.modules) ? stored.modules : moduleSubjects
}

const courseSections = [
  { name: 'Data Science', description: 'Explore data analysis, preparation, and core data science learning materials.', accent: 'cyan' },
  { name: 'Machine Learning', description: 'Browse course materials focused on algorithms, models, and machine learning.', accent: 'pink' },
  { name: 'Others', description: 'Find additional course materials and resources across other topics.', accent: 'purple' },
]



export default function ResourcePage({ title, description, endpoint, emptyText }) {
  const navigate = useNavigate()
  const [items, setItems] = useState(null), [error, setError] = useState(''), [q, setQ] = useState(''), [cat, setCat] = useState('All'), [subjectFilter, setSubjectFilter] = useState(() => endpoint === '/modules' ? readCourses()[0] || '' : 'All')
  const [previewItem, setPreviewItem] = useState(null)
  const [editing, setEditing] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const [courses, setCourses] = useState(readCourses)
  const [manageCourses, setManageCourses] = useState(false)
  const [newCourseName, setNewCourseName] = useState('')
  const [courseError, setCourseError] = useState('')
  const [courseBusy, setCourseBusy] = useState(false)
  useEffect(() => {
    setItems(null); setError(''); setQ(''); setCat('All'); setSubjectFilter(endpoint === '/modules' ? readCourses()[0] || '' : 'All')
    api(endpoint).then((d) => {
      if (endpoint !== '/modules') return setItems((d.items || []).map((item) => ({ ...item, subject: item.subject || item.folder || 'General' })))
      const assignments = readSubjectAssignments()['modules:items'] || {}
      const remoteItems = (d.items || []).map((item) => ({ ...item, subject: assignments[String(item.id)] || 'Data Science' }))
      setItems(remoteItems)
    }).catch((e) => {
      setError(e.message)
    })
  }, [endpoint, reloadKey])
  const cats = useMemo(() => ['All', ...new Set((items || []).map((i) => i.category).filter(Boolean))], [items])
  const availableSubjects = useMemo(() => ['All', ...new Set((items || []).map((i) => i.subject || i.folder || 'General').filter(Boolean))], [items])
  const subjects = endpoint === '/modules' ? courses : availableSubjects
  const subjectCounts = useMemo(() => (items || []).reduce((counts, item) => {
    const subject = item.subject || item.folder || 'General'
    counts[subject] = (counts[subject] || 0) + 1
    return counts
  }, {}), [items])
  const shown = (items || []).filter((i) => (cat === 'All' || i.category === cat) && (subjectFilter === 'All' || (i.subject || i.folder || 'General') === subjectFilter) && `${i.title || i.name} ${i.description || ''}`.toLowerCase().includes(q.toLowerCase()))

  const saveCourses = (nextCourses) => {
    const stored = readSubjectAssignments()
    stored.modules = nextCourses
    localStorage.setItem(subjectStorageKey, JSON.stringify(stored))
    setCourses(nextCourses)
    if (!nextCourses.includes(subjectFilter)) setSubjectFilter(nextCourses[0] || '')
  }

  const addCourse = (event) => {
    event.preventDefault()
    const name = newCourseName.trim()
    if (!name || courses.some((course) => course.toLowerCase() === name.toLowerCase())) {
      setCourseError(name ? 'A course with this name already exists.' : 'Enter a course name.')
      return
    }
    saveCourses([...courses, name])
    setNewCourseName('')
    setCourseError('')
  }

  const deleteCourse = async (name) => {
    const assignedItems = (items || []).filter((item) => (item.subject || item.folder || 'Data Science') === name)
    if (!window.confirm(`Delete "${name}" and all ${assignedItems.length} file(s) assigned to it? This cannot be undone.`)) return
    setCourseBusy(true)
    setCourseError('')
    try {
      if (!items) throw new Error('Course files have not finished loading. Please try again.')
      const managedItems = assignedItems.filter((item) => item.downloadUrl?.startsWith('/api/files/'))
      const unsupportedItems = assignedItems.filter((item) => !item.downloadUrl?.startsWith('/api/files/'))
      if (unsupportedItems.length) throw new Error(`Cannot delete this course because ${unsupportedItems.length} assigned file(s) cannot be deleted from this page.`)
      for (const item of managedItems) {
        await api(`/admin/files/${encodeURIComponent(item.id)}`, { method: 'DELETE' })
      }
      const nextAssignments = readSubjectAssignments()
      nextAssignments['modules:items'] = Object.fromEntries(
        Object.entries(nextAssignments['modules:items'] || {})
          .filter(([id]) => !assignedItems.some((item) => String(item.id) === id)),
      )
      localStorage.setItem(subjectStorageKey, JSON.stringify(nextAssignments))
      saveCourses(courses.filter((course) => course !== name))
      setItems((current) => current.filter((item) => !assignedItems.includes(item)))
    } catch (deleteError) {
      setCourseError(deleteError.message)
      setReloadKey((key) => key + 1)
    } finally {
      setCourseBusy(false)
    }
  }
  // The Modules page currently renders only its page heading, per the site owner's request:
  // the course-module cards, the Courses section, the file heading, the filter bar and the
  // empty message are all hidden. This repo has no git history, so the code is kept here —
  // flip SHOW_MODULE_CONTENT back to true to restore every block (chrome included).
  const SHOW_MODULE_CONTENT = true
  const hideSectionChrome =
    ['/resources', '/tools', '/lab-experiments'].includes(endpoint) || (endpoint === '/modules')
  return (
    <>
      <div className="resource-heading">
        <div><h2 className="page-title">{title}</h2><p className="muted">{description}</p></div>
        {!hideSectionChrome && endpoint !== '/modules' && <button className="btn sm ghost" type="button" aria-expanded={editing} onClick={() => setEditing(!editing)}><Pencil size={15} /> {editing ? 'Done' : 'Edit'}</button>}
      </div>
      {editing && endpoint !== '/modules' && <FileManager key={JSON.stringify(courses)} section={endpoint.slice(1)} sectionLabel={title} onChange={() => setReloadKey((key) => key + 1)} />}
      {SHOW_MODULE_CONTENT && endpoint === '/modules' && (
        <>
          <section className="course-section" aria-labelledby="course-modules-title">
            <div className="course-section-heading">
              <div><p className="eyebrow">COURSE CONTENT</p><h2 id="course-modules-title">Course modules</h2></div>
            </div>
            <div className="feature-strip course-cards" role="list" aria-label="Course modules">
              {courseModules.map((module, index) => (
                <Link
                  key={module.id}
                  role="listitem"
                  className={`feature-card course-card course-module-card ${['cyan', 'pink', 'purple'][index % 3]}`}
                  to={`/modules/${module.id}`}
                >
                  <span className="feature-thumb">
                    <span className="thumb-badge">MODULE 0{module.id}</span>
                    <span className="thumb-pattern" aria-hidden="true" />
                  </span>
                  <span className="feature-content">
                    <span className="feature-label">OPEN COURSE <ArrowRight size={16} /></span>
                    <span className="course-card-title">{module.title}</span>
                    <span className="course-card-description">{module.description}</span>
                    <span className="course-card-count">{module.topics.length} topics</span>
                  </span>
                </Link>
              ))}
            </div>
          </section>

        </>
      )}
      {endpoint === '/tools' && (
        <section className="course-section" aria-label="Tools">
          <div className="tool-grid">
            {referenceTools.map((tool) => (
              <article key={tool.name} className="card tool-card">
                <h3>{tool.name}</h3>
                <p>{tool.description}</p>
                <a className="btn sm" href={tool.url} target="_blank" rel="noopener noreferrer">Website <ExternalLink size={13} /></a>
              </article>
            ))}
          </div>
        </section>
      )}
      {endpoint === '/resources' && (
        <section className="course-section" aria-labelledby="reference-resources-title">
          <div className="course-section-heading">
            <div><p className="eyebrow">LEARNING LIBRARY / 01</p><h2 id="reference-resources-title">Explore resources</h2></div>
          </div>
          <div className="resource-grid">
            {referenceResources.map((resource) => (
              <article key={resource.title} className="card resource-card">
                <div className="icon-orb" aria-hidden="true">{resourceIcon(resource.type)}</div>
                <div className="eyebrow">{resource.category} · {resource.type}</div>
                <h3>{resource.title}</h3>
                <p>{resource.description}</p>
                <div className="row">
                  <a className="btn sm" href={resource.url} target="_blank" rel="noopener noreferrer">Open resource <ExternalLink size={13} /></a>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
      <>
        {false && SHOW_MODULE_CONTENT && endpoint === '/modules' && (
          <div className="module-files-heading">
            <p className="eyebrow">UPLOADED FILES</p>
            <h2>Course files</h2>
          </div>
        )}
        {!hideSectionChrome && endpoint !== '/modules' && (
          <div className="filters">
            <label className="search"><Search size={16} aria-hidden="true" /><input type="search" placeholder={`Search ${title.toLowerCase()}`} aria-label={`Search ${title}`} value={q} onChange={(e) => setQ(e.target.value)} /></label>
            {subjects.length > 1 && <div className="folder-tabs" role="group" aria-label="Subject filter">{subjects.map((subject) => <button key={subject} className={`folder-tab ${subjectFilter === subject ? 'on' : ''}`} onClick={() => setSubjectFilter(subject)}>{subject}</button>)}</div>}
            {cats.length > 1 && <div className="chips" role="group" aria-label="Category filter">{cats.map((c) => <button key={c} className={`chip ${c === cat ? 'on' : ''}`} onClick={() => setCat(c)}>{c}</button>)}</div>}
          </div>
        )}
        {error ? <div className="state err" role="alert">Could not load content: {error}</div>
          : !items ? <div className="state" aria-busy="true">Loading…</div>
          : !shown.length ? (hideSectionChrome ? null : <div className="state">{items.length ? 'Nothing matches your search.' : emptyText}</div>)
          : <div className="grid">{shown.map((i) => (
          <article className="card item" key={i.id}>
            <div className="item-h"><FileText size={18} aria-hidden="true" /><h3>{i.title || i.name}</h3></div>
            {(i.subject || i.folder) && <span className="tag folder-tag">{i.subject || i.folder}</span>}
            {i.category && <span className="tag">{i.category}</span>}
            {endpoint !== '/modules' && i.description && <p>{i.description}</p>}
            <small className="muted">{[i.created_at && new Date(i.created_at).toLocaleDateString(), fmtSize(i.file_size)].filter(Boolean).join(' · ')}</small>
            <div className="actions">
              {(i.resource_id || i.has_file || i.downloadUrl) && (
                <>
                  <button className="btn sm" type="button" onClick={() => setPreviewItem(i)}><Eye size={14} /> View</button>
                  <a className="btn sm" href={i.downloadUrl || downloadUrl(i.resource_id || i.id)} download><Download size={14} /> Download</a>
                </>
              )}
              {i.documentation_url && <a className="btn sm ghost" href={i.documentation_url} target="_blank" rel="noopener noreferrer"><ExternalLink size={14} /> Docs</a>}
            </div>
            </article>))}</div>}
        {previewItem && <FilePreview item={previewItem} url={previewItem.downloadUrl || downloadUrl(previewItem.resource_id || previewItem.id)} onClose={() => setPreviewItem(null)} />}
      </>
    </>
  )
}
