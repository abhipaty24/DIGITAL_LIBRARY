import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, FlaskConical, Wrench, FolderOpen, LayoutGrid, CreditCard } from 'lucide-react'
import StudentCard from '../components/student/StudentCard.jsx'

const options = [
  { to: '/modules', label: 'Modules', icon: BookOpen },
  { to: '/experiments', label: 'Lab Experiments', icon: FlaskConical },
  { to: '/tools', label: 'Tools', icon: Wrench },
  { to: '/resources', label: 'Resources', icon: FolderOpen },
  { to: '/projects', label: 'Projects', icon: LayoutGrid },
  { to: '/student', label: 'Student ID', icon: CreditCard },
]

export default function Home() {
  return (
    <div className="home-page">
      <section className="hero-section reveal">
        <div className="hero-copy">
          <span className="eyebrow">Academic resource hub</span>
          <h1>DATA SCIENCE DIGITAL LIBRARY</h1>
          <p className="lead">A centralized hub for Data Science modules, research labs, learning resources, and tools at Mohan Babu University.</p>

          <div className="hero-actions">
            <Link to="/modules" className="primary-btn">Explore modules <ArrowRight size={18} /></Link>
            <Link to="/experiments" className="secondary-btn">Lab experiments</Link>
          </div>

          <nav className="option-grid" aria-label="Quick access">
            {options.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} className="option-tile">
                <span className="option-frame"><Icon size={28} aria-hidden="true" /></span>
                <span className="option-label">{label}</span>
              </Link>
            ))}
          </nav>

          <div className="hero-metrics"></div>
        </div>

        <div className="hero-panel reveal">
          <StudentCard />
        </div>
      </section>
    </div>
  )
}
