import { useEffect, useRef, useState } from 'react'
import { FilePlus2, Trash2 } from 'lucide-react'
import { api } from '../services/api.js'

const sectionLabels = {
  modules: 'Modules',
  'lab-experiments': 'Lab Experiments',
  tools: 'Tools',
  resources: 'Resources',
  library: 'Digital Library',
}

const formatSize = (bytes) => bytes < 1024 * 1024 ? `${Math.max(1, Math.ceil(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`

const subjectStorageKey = 'mbu-subject-assignments-v1'
const moduleSubjects = ['Data Science', 'Machine Learning', 'Others']

const readSubjectAssignments = () => {
  try {
    return JSON.parse(localStorage.getItem(subjectStorageKey) || '{}')
  } catch {
    return {}
  }
}

const readSubjectsForSection = (activeSection) => {
  const stored = readSubjectAssignments()
  if (activeSection === 'modules') return Array.isArray(stored.modules) ? stored.modules : moduleSubjects
  return stored[activeSection] || ['Data Science']
}

const writeSubjectsForSection = (activeSection, nextSubjects) => {
  const stored = readSubjectAssignments()
  stored[activeSection] = nextSubjects
  localStorage.setItem(subjectStorageKey, JSON.stringify(stored))
}

export default function FileManager({ section, sectionLabel, staticFiles = [], onChange }) {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [file, setFile] = useState(null)
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [subjectName, setSubjectName] = useState('Data Science')
  const [newSubjectName, setNewSubjectName] = useState('')
  const [subjects, setSubjects] = useState(() => readSubjectsForSection(section))
  const uploadForm = useRef(null)

  useEffect(() => {
    const nextSubjects = readSubjectsForSection(section)
    setSubjects(nextSubjects)
    setSubjectName(nextSubjects.includes('Data Science') ? 'Data Science' : nextSubjects[0] || '')
  }, [section])

  const saveSubjectAssignment = (itemId, chosenSubject) => {
    const stored = readSubjectAssignments()
    if (!stored[section]) stored[section] = []
    if (!stored[section].includes(chosenSubject)) stored[section].push(chosenSubject)
    if (!stored[`${section}:items`]) stored[`${section}:items`] = {}
    stored[`${section}:items`][String(itemId)] = chosenSubject
    localStorage.setItem(subjectStorageKey, JSON.stringify(stored))
  }

  const removeSubject = () => {
    if (!subjectName) return
    const nextSubjects = subjects.filter((subject) => subject !== subjectName)
    const finalSubjects = nextSubjects.length ? nextSubjects : ['Data Science']
    setSubjects(finalSubjects)
    writeSubjectsForSection(section, finalSubjects)
    setSubjectName(finalSubjects[0])
    setNotice(`Removed subject “${subjectName}”.`)
  }

  const loadFiles = async (activeSection) => {
    setLoading(true)
    setError('')
    try {
      const data = await api(`/admin/files?section=${encodeURIComponent(activeSection)}`)
      const hiddenIds = data.hiddenStaticIds || []
      const storedAssignments = readSubjectAssignments()
      const bundled = activeSection === 'modules'
        ? staticFiles.filter((item) => !hiddenIds.includes(item.id)).map((item) => ({ ...item, isStatic: true, subject: 'Data Science' }))
        : []
      const remoteItems = (data.items || []).map((item) => ({ ...item, subject: storedAssignments[`${activeSection}:items`]?.[String(item.id)] || (activeSection === 'modules' ? 'Data Science' : item.subject || item.folder || 'General') }))
      setFiles([...bundled, ...remoteItems])
    } catch (loadError) {
      setError(loadError.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFiles(section)
  }, [section])

  const addSubject = () => {
    const trimmed = newSubjectName.trim()
    if (!trimmed) return
    const nextSubjects = [...new Set([...(subjects || []), trimmed])]
    setSubjects(nextSubjects)
    writeSubjectsForSection(section, nextSubjects)
    setSubjectName(trimmed)
    setNewSubjectName('')
  }

  const uploadFile = async (event) => {
    event.preventDefault()
    if (!file) return
    setBusy(true)
    setError('')
    setNotice('')
    const body = new FormData()
    body.append('section', section)
    body.append('category', category)
    body.append('description', description)
    body.append('file', file)
    try {
      const createdFile = await api('/admin/files', { method: 'POST', headers: { 'X-Requested-With': 'portal' }, body })
      saveSubjectAssignment(createdFile.id, subjectName)
      setFile(null)
      setCategory('')
      setDescription('')
      uploadForm.current?.reset()
      setNotice(`File added to the ${subjectName || 'General'} subject.`)
      await loadFiles(section)
      onChange?.()
    } catch (uploadError) {
      setError(uploadError.message)
    } finally {
      setBusy(false)
    }
  }

  const removeFile = async (item) => {
    if (!window.confirm(`Delete ${item.title || item.name}? This cannot be undone.`)) return
    setBusy(true)
    setError('')
    setNotice('')
    try {
      if (item.isStatic) {
        await api(`/admin/files/static/${encodeURIComponent(item.id)}`, {
          method: 'DELETE',
          body: JSON.stringify({ url: item.downloadUrl }),
        })
      } else {
        await api(`/admin/files/${encodeURIComponent(item.id)}`, { method: 'DELETE' })
      }
      setNotice('File deleted.')
      await loadFiles(section)
      onChange?.()
    } catch (deleteError) {
      setError(deleteError.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="file-manager">
      <header className="manager-heading">
        <div>
          <p className="eyebrow">SECTION EDITOR</p>
          <h2 className="page-title">Edit {sectionLabel || sectionLabels[section]} files</h2>
          <p className="muted">Add or remove files in this section.</p>
        </div>
      </header>

      <div className="manager-layout">
        <form className="upload-panel" ref={uploadForm} onSubmit={uploadFile}>
          <div className="manager-panel-heading"><FilePlus2 size={20} /><h3>Add a file</h3></div>
          <label className="field-label">File<input type="file" required onChange={(event) => setFile(event.target.files?.[0] || null)} /></label>
          <div className="folder-builder">
            <label className="field-label">Subject
              <select value={subjectName} onChange={(event) => setSubjectName(event.target.value)}>
                {(subjects || []).map((subject) => <option key={subject} value={subject}>{subject}</option>)}
              </select>
            </label>
            {section !== 'modules' && <>
              <div className="folder-inline">
                <input type="text" value={newSubjectName} onChange={(event) => setNewSubjectName(event.target.value)} placeholder="Create subject" maxLength={60} />
                <button type="button" className="btn ghost small" onClick={addSubject}>Add</button>
              </div>
              <button type="button" className="btn ghost small danger" onClick={removeSubject} disabled={!subjectName || subjectName === 'Data Science'}>Delete selected subject</button>
            </>}
          </div>
          <label className="field-label">Category <span className="muted">(optional)</span><input type="text" maxLength={80} value={category} onChange={(event) => setCategory(event.target.value)} placeholder="e.g. Unit - 1" /></label>
          <label className="field-label">Description <span className="muted">(optional)</span><textarea rows="3" maxLength={2000} value={description} onChange={(event) => setDescription(event.target.value)} /></label>
          <button className="btn" disabled={busy || !file || !subjects.length}>{busy ? 'Working...' : 'Add to section'}</button>
          <small className="muted">Maximum file size: 50 MB.{section === 'modules' ? ' Choose Data Science, Machine Learning, or Others for this file.' : ' Add more subjects as needed.'}</small>
        </form>

        <section className="manager-files" aria-labelledby="file-list-title">
          <div className="manager-files-heading">
            <div><h3 id="file-list-title">Current files</h3><span className="muted">{files.length} {files.length === 1 ? 'file' : 'files'}</span></div>
          </div>
          {notice && <p className="manager-notice" role="status">{notice}</p>}
          {error && <p className="manager-error" role="alert">{error}</p>}
          {loading ? <div className="state" aria-busy="true">Loading files...</div>
            : !files.length ? <div className="state">No files in this section yet.</div>
              : <ul className="manager-file-list">{files.map((item) => (
                <li className="manager-file" key={item.id}>
                  <div className="manager-file-info">
                    <strong>{item.title || item.name || item.original_filename}</strong>
                    <span>{[(item.subject || item.folder || 'General'), item.category, item.file_size ? formatSize(Number(item.file_size)) : '', item.isStatic ? 'Built-in file' : ''].filter(Boolean).join(' · ')}</span>
                  </div>
                  <button className="icon-btn manager-delete" type="button" aria-label={`Delete ${item.title || item.name}`} disabled={busy} onClick={() => removeFile(item)}><Trash2 size={17} /></button>
                </li>
              ))}</ul>}
        </section>
      </div>
    </section>
  )
}