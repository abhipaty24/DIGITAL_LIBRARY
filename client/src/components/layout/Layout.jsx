import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { ArrowRight, ChevronDown, Home, BookOpen, FlaskConical, Wrench, FolderOpen, Menu, X } from 'lucide-react'
import Logo from './Logo.jsx'
import FlowBackground from './FlowBackground.jsx'
import { siteConfig } from '../../config/siteConfig.js'

const nav = [
  ['/', 'Home', Home], ['/modules', 'Modules', BookOpen], ['/experiments', 'Lab Experiments', FlaskConical],
  ['/tools', 'Tools', Wrench], ['/resources', 'Resources', FolderOpen], ['/projects', 'Projects', FolderOpen],
]
const isMobile = () => window.matchMedia('(max-width: 1023px)').matches

export default function Layout() {
  const [open, setOpen] = useState(() => !isMobile())
  const { pathname } = useLocation()
  const glowRef = useRef(null)
  const dotRef = useRef(null)
  const ringRef = useRef(null)

  useEffect(() => { if (isMobile()) setOpen(false) }, [pathname])
  useEffect(() => { const h = (e) => e.key === 'Escape' && isMobile() && setOpen(false); window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h) }, [])
  useEffect(() => {
    document.documentElement.dataset.theme = 'dark'
    document.documentElement.style.colorScheme = 'dark'
  }, [])

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const hoverQuery = window.matchMedia('(hover: hover)')
    if (!hoverQuery.matches || reduceMotion.matches) return undefined

    let pointerX = window.innerWidth / 2
    let pointerY = window.innerHeight / 2
    let targetX = pointerX
    let targetY = pointerY

    const onMove = (event) => {
      targetX = event.clientX
      targetY = event.clientY
    }

    const onHover = (event) => {
      const interactive = event.target.closest('a, button, .feature-card, .card, .nav-link, .icon-btn')
      if (ringRef.current) {
        if (interactive) ringRef.current.classList.add('is-hover')
        else ringRef.current.classList.remove('is-hover')
      }
    }

    const tick = () => {
      pointerX += (targetX - pointerX) * 0.12
      pointerY += (targetY - pointerY) * 0.12

      if (glowRef.current) {
        glowRef.current.style.transform = `translate(${pointerX - 240}px, ${pointerY - 240}px)`
      }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${pointerX}px, ${pointerY}px)`
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${pointerX - 18}px, ${pointerY - 18}px)`
      }

      requestAnimationFrame(tick)
    }

    requestAnimationFrame(tick)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerover', onHover)
    window.addEventListener('pointerout', onHover)

    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerover', onHover)
      window.removeEventListener('pointerout', onHover)
    }
  }, [])

  return (
    <div className={`theme-shell ${open ? 'is-open' : ''}`}>
      <div className="ambient-orbs" aria-hidden="true">
        <span className="orb orb-one" />
        <span className="orb orb-two" />
        <span className="orb orb-three" />
      </div>
      <FlowBackground />
      <div className="cursor-glow" ref={glowRef} aria-hidden="true" />
      <div className="cursor-dot" ref={dotRef} aria-hidden="true" />
      <div className="cursor-ring" ref={ringRef} aria-hidden="true" />

      <header className="topbar">
        <button className="icon-btn menu-btn" aria-label={open ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={open} aria-controls="sidebar" onClick={() => setOpen(!open)}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>

        <div className="brand-wrap">
          <Logo />
          <h1 className="portal-title">{siteConfig.title}</h1>
        </div>

        <nav className="desktop-nav" aria-label="Main navigation">
          {nav.map(([to, label, Icon]) => (
            <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `nav-pill ${isActive ? 'active' : ''}`}>
              <Icon size={14} />
              <span>{label}</span>
              <ChevronDown size={12} />
            </NavLink>
          ))}
        </nav>

      </header>

      <div className="backdrop" onClick={() => setOpen(false)} aria-hidden="true" />

      <aside id="sidebar" className="sidebar" aria-label="Main navigation" style={!open ? { visibility: 'hidden', transition: 'transform .25s ease, visibility 0s .25s' } : undefined}>
        <nav className="mobile-nav">
          {nav.map(([to, label, Icon]) => (
            <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Icon size={18} /> <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="content"><Outlet /></main>
    </div>
  )
}
