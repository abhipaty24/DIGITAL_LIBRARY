import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { siteConfig } from '../config/siteConfig.js'

export default function StudentPage() {
  const { student: s, logoPath, avatarPath } = siteConfig

  const rows = [
    ['Roll No', s.roll],
    ['Department', s.department],
    ['Section', s.section],
    ['Subject', s.subject],
    ['Degree', 'B.Tech · Data Science'],
    ['Year of Admission', '2024-2025'],
    ['Faculty', s.faculty],
  ]

  return (
    <div className="student-page">
      <div>
        <Link className="btn ghost sm" to="/"><ArrowLeft size={15} /> Back to Home</Link>
      </div>

      <div className="student-page-head">
        <span className="eyebrow">Profile / 2026</span>
        <h1 className="page-title">STUDENT IDENTITY</h1>
      </div>

      <div className="card student-id-card">
        <div className="id-head">
          <img src={logoPath} alt="Mohan Babu University logo" />
          <span className="id-university">Mohan Babu University</span>
        </div>

        <hr className="id-rule" />

        <div className="id-body">
          <div className="id-avatar">
            <img src={avatarPath} alt={`${s.name} profile`} />
          </div>
          <h2>{s.name}</h2>
        </div>

        <dl className="id-details">
          {rows.map(([k, v]) => (
            <div className="id-row" key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}
