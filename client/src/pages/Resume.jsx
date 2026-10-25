import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Download, Printer } from 'lucide-react'
import { siteConfig } from '../config/siteConfig.js'

const sections = ['Education', 'Technical Skills', 'Projects', 'Certifications and Internships']
export default function Resume() {
  const { student: s, links: l, resumePath } = siteConfig
  const [hasPdf, setHasPdf] = useState(false)
  useEffect(() => { fetch(resumePath, { method: 'HEAD' }).then((r) => setHasPdf(r.ok && (r.headers.get('content-type') || '').includes('pdf'))).catch(() => setHasPdf(false)) }, [resumePath])
  return (
    <div className="resume">
      <div className="actions noprint">
        <Link to="/" className="btn ghost"><ArrowLeft size={16} /> Back to Home</Link>
        {hasPdf && <a className="btn" href={resumePath} download><Download size={16} /> Download Resume</a>}
        <button className="btn ghost" onClick={() => window.print()}><Printer size={16} /> Print</button>
      </div>
      {hasPdf ? <iframe className="pdf" src={resumePath} title="Resume PDF" /> : (
        <article className="card resume-sheet">
          <header className="resume-header">
            <h1>{s.name}</h1>
            <p className="resume-summary">{s.department} <span>·</span> Roll No. {s.roll} <span>·</span> Mohan Babu University</p>
            <div className="resume-links">
              <a href={`mailto:${l.emailAddress}`}>{l.emailAddress}</a>
              {[[`GitHub`, l.githubUrl], [`LinkedIn`, l.linkedinUrl]].map(([n, u]) => (
                <a key={n} href={u} target="_blank" rel="noopener noreferrer">{n}</a>
              ))}
            </div>
          </header>
          {sections.map((t) => (
            <section className="resume-section" key={t}>
              <h2>{t}</h2>
              {t === 'Education' ? (
                <div className="education-list">
                  {s.education.map((edu) => (
                    <div className="education-entry" key={`${edu.degree}-${edu.institution}`}>
                      <div className="education-entry-heading">
                        <h3>{edu.degree}</h3>
                        <span>{edu.period}</span>
                      </div>
                      <p className="education-institution">{edu.institution}</p>
                      <ul>
                        {edu.details.map((detail) => <li key={detail}>{detail}</li>)}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : t === 'Technical Skills' ? (
                <div className="skills-grid">
                  {s.technicalSkills.map(({ category, skills }) => (
                    <div className="skill-group" key={category}>
                      <h3>{category}</h3>
                      <p>{skills}</p>
                    </div>
                  ))}
                </div>
              ) : t === 'Projects' ? (
                <p className="project-link">
                  <a href={l.githubRepositoriesUrl} target="_blank" rel="noopener noreferrer">
                    GitHub Repositories
                  </a>
                </p>
              ) : t === 'Certifications and Internships' ? (
                <div className="education-list">
                  {s.internships.map((internship) => (
                    <div className="education-entry internship-entry" key={`${internship.role}-${internship.organization}`}>
                      <div className="education-entry-heading">
                        <h3>{internship.role}</h3>
                        <span>{internship.period}</span>
                      </div>
                      <p className="education-institution">{internship.organization}</p>
                      {internship.studentId && <p className="internship-meta">Student ID: {internship.studentId}</p>}
                      <p className="internship-description">{internship.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="resume-empty">Not added yet. Place your resume PDF at <code>client/public/assets/resume.pdf</code> to display it here.</p>
              )}
            </section>
          ))}
        </article>)}
    </div>
  )
}
