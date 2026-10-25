import { Link } from 'react-router-dom'
import { User, Hash, Users, GraduationCap, BookMarked, UserCheck, Github, Linkedin, Mail } from 'lucide-react'
import { siteConfig } from '../../config/siteConfig.js'

export default function StudentCard() {
  const { student: s, links: l, homeAvatarPath } = siteConfig
  const rows = [[User, 'Student Name', s.name], [Hash, 'Roll Number', s.roll], [Users, 'Section', s.section], [GraduationCap, 'Department', s.department], [BookMarked, 'Subject', s.subject], [UserCheck, 'Faculty', s.faculty]]
  const socials = [[Github, 'GitHub', l.githubUrl], [Linkedin, 'LinkedIn', l.linkedinUrl], [Mail, 'Email', l.emailAddress ? `mailto:${l.emailAddress}` : '']]
  return (
    <section className="card student student-card" aria-label="Student profile">
      <div className="avatar">{homeAvatarPath ? <img src={homeAvatarPath} alt={`${s.name} profile`} /> : <User size={44} aria-hidden="true" />}</div>
      <h2>{s.name}</h2>
      <dl>{rows.map(([Icon, k, v]) => (
        <div className="row" key={k}><dt><Icon size={16} aria-hidden="true" /> {k}</dt><dd className={k === 'Roll Number' ? 'sel' : ''}>{v}</dd></div>
      ))}</dl>
      <div className="socials">{socials.map(([Icon, name, href]) => href
        ? <a key={name} className="icon-btn" href={href} aria-label={name} title={name} {...(name !== 'Email' && { target: '_blank', rel: 'noopener noreferrer' })}><Icon size={20} /></a>
        : <span key={name} className="icon-btn disabled" role="link" aria-disabled="true" aria-label={`${name} (not configured)`} title={`${name} link not configured yet`}><Icon size={20} /></span>)}
      </div>
      <Link to="/resume" className="btn">View More</Link>
    </section>
  )
}
