import { useState, useEffect, useRef } from 'react'
import D from './data.json'

// Microbe coordinates: [x %, y %, size px, delay s, type ('c' = coccus, 'r' = bacillus rod, 's' = spirillum)]
const MICROBES = [
  [4, 12, 18, 0, 'c'],
  [14, 68, 14, 2, 'c'],
  [38, 8, 30, 1, 'r'],
  [52, 84, 26, 3, 'r'],
  [70, 18, 16, 1.5, 'c'],
  [86, 62, 24, 0.5, 'r'],
  [92, 12, 14, 2.5, 'c'],
  [28, 48, 10, 4, 'c'],
  [64, 42, 22, 1.2, 'r'],
  [80, 88, 15, 2.8, 'c'],
  [12, 32, 20, 3.4, 'r'],
  [48, 22, 12, 0.8, 'c'],
]

const certById = (id) => D.certificates.find((c) => c.id === id)

export default function App() {
  const [activeCert, setActiveCert] = useState(null)
  const [theme, setTheme] = useState('light') // 'light' | 'dark'
  const [copied, setCopied] = useState(null)
  const [activeSkillCategory, setActiveSkillCategory] = useState('all')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [activeNav, setActiveNav] = useState('top')
  const [showBackToTop, setShowBackToTop] = useState(false)
  const dialogRef = useRef(null)

  // Initialize theme from localStorage or OS default (only 'light' or 'dark')
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('color-scheme')
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setTheme(savedTheme)
        applyTheme(savedTheme)
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        const defaultMode = prefersDark ? 'dark' : 'light'
        setTheme(defaultMode)
        applyTheme(defaultMode)
      }
    } catch {
      setTheme('light')
      applyTheme('light')
    }
  }, [])

  const applyTheme = (mode) => {
    const target = mode === 'dark' ? 'dark' : 'light'
    const meta = document.querySelector('meta[name="color-scheme"]')
    if (meta) meta.content = target
    document.documentElement.setAttribute('data-theme', target)
    try {
      localStorage.setItem('color-scheme', target)
    } catch {}
  }

  const handleThemeSelect = (mode) => {
    setTheme(mode)
    applyTheme(mode)
  }

  // Scroll depth tracking and scrollspy
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight
      if (totalHeight > 0) {
        setScrollProgress((window.scrollY / totalHeight) * 100)
      }

      setShowBackToTop(window.scrollY > 400)

      const sections = ['contact', 'certificates', 'education', 'work', 'skills', 'top']
      for (const section of sections) {
        const el = document.getElementById(section)
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= 140) {
            setActiveNav(section)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Manage native <dialog> modal for certificates
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (activeCert) {
      if (!dialog.open) {
        dialog.showModal()
      }
    } else {
      if (dialog.open) {
        dialog.close()
      }
    }
  }, [activeCert])

  // Handle outside click dismissal fallback per modern dialog guidance
  const handleDialogClick = (e) => {
    const dialog = dialogRef.current
    if (!dialog) return
    const rect = dialog.getBoundingClientRect()
    const isInDialog =
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom
    if (!isInDialog) {
      setActiveCert(null)
    }
  }

  const copyToClipboard = (text, type) => {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(type)
      setTimeout(() => setCopied(null), 2200)
    })
  }

  const p = D.profile
  const skillCategories = ['all', ...D.skills.map((s) => s.g)]
  const filteredSkills =
    activeSkillCategory === 'all'
      ? D.skills
      : D.skills.filter((s) => s.g === activeSkillCategory)

  // Certificate trigger button component
  const CertButton = ({ id, label = 'View Certificate', variant = 'link' }) => {
    if (!id) return null
    const cert = certById(id)
    if (!cert) return null
    return (
      <button
        type="button"
        className={variant === 'pill' ? 'cert-pill-btn' : 'cert-link-btn'}
        onClick={() => setActiveCert(cert)}
        aria-label={`View certificate for ${cert.title}`}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className="icon">
          <circle cx="12" cy="8" r="5" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <path d="M8.2 12.5L7 21l5-2.5 5 2.5-1.2-8.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
        </svg>
        <span>{label}</span>
      </button>
    )
  }

  return (
    <div className="portfolio-wrapper">
      {/* Scroll progress bar */}
      <div
        className="scroll-progress-bar"
        style={{ width: `${scrollProgress}%` }}
        role="progressbar"
        aria-valuenow={Math.round(scrollProgress)}
        aria-valuemin="0"
        aria-valuemax="100"
        aria-label="Page reading progress"
      />

      {/* Primary Navigation Bar */}
      <header className="nav-header">
        <div className="nav-container">
          <a href="#top" className="brand" onClick={() => setMobileMenuOpen(false)}>
            <span className="brand-logo" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="9" />
                <circle cx="12" cy="12" r="4" fill="currentColor" fillOpacity="0.25" />
                <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
              </svg>
            </span>
            <div className="brand-text">
              <span className="brand-name">{p.name}</span>
              <span className="brand-tag">M.Sc. Microbiology</span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="desktop-nav" aria-label="Main Navigation">
            <a href="#skills" className={activeNav === 'skills' ? 'active' : ''}>
              Skills
            </a>
            <a href="#work" className={activeNav === 'work' ? 'active' : ''}>
              Projects & Internships
            </a>
            <a href="#education" className={activeNav === 'education' ? 'active' : ''}>
              Education & Awards
            </a>
            <a href="#certificates" className={activeNav === 'certificates' ? 'active' : ''}>
              Certificates
            </a>
            <a href="#contact" className={activeNav === 'contact' ? 'active' : ''}>
              Contact
            </a>
          </nav>

          {/* Action Tools: Theme Switcher & Mobile Menu Toggle */}
          <div className="nav-actions">
            <div className="theme-switch-segmented" role="radiogroup" aria-label="Color theme switcher">
              <button
                type="button"
                role="radio"
                aria-checked={theme === 'light'}
                className={`theme-segment-btn ${theme === 'light' ? 'active' : ''}`}
                onClick={() => handleThemeSelect('light')}
                title="Light mode"
                aria-label="Light mode"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <circle cx="12" cy="12" r="4.5" />
                  <path d="M12 2v2.5M12 19.5V22M4.93 4.93l1.77 1.77M17.3 17.3l1.77 1.77M2 12h2.5M19.5 12H22M6.7 17.3l-1.77 1.77M19.07 4.93l-1.77 1.77" />
                </svg>
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={theme === 'dark'}
                className={`theme-segment-btn ${theme === 'dark' ? 'active' : ''}`}
                onClick={() => handleThemeSelect('dark')}
                title="Dark mode"
                aria-label="Dark mode"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              </button>
            </div>

            <a href="#contact" className="btn-cta-nav">
              Connect
            </a>

            <button
              type="button"
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                {mobileMenuOpen ? (
                  <path d="M18 6L6 18M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Navigation */}
        {mobileMenuOpen && (
          <nav className="mobile-dropdown" aria-label="Mobile Navigation">
            <a href="#skills" onClick={() => setMobileMenuOpen(false)}>
              Skills
            </a>
            <a href="#work" onClick={() => setMobileMenuOpen(false)}>
              Projects & Internships
            </a>
            <a href="#education" onClick={() => setMobileMenuOpen(false)}>
              Education & Awards
            </a>
            <a href="#certificates" onClick={() => setMobileMenuOpen(false)}>
              Certificates
            </a>
            <a href="#contact" onClick={() => setMobileMenuOpen(false)}>
              Contact
            </a>
          </nav>
        )}
      </header>

      <main id="top">
        {/* HERO SECTION */}
        <section className="hero-section">
          {/* Ambient Microbial Field Background */}
          <div className="microbes-field" aria-hidden="true">
            {MICROBES.map(([x, y, s, d, t], i) => (
              <span
                key={i}
                className={`microbe-particle particle-${t}`}
                style={{
                  '--x': x,
                  '--y': y,
                  '--s': s,
                  '--d': d,
                }}
              />
            ))}
          </div>

          <div className="hero-grid">
            <div className="hero-content">
              {/* Immediate Availability Badge */}
              <div className="status-badge">
                <span className="pulse-dot" aria-hidden="true" />
                <span>Available to Join Immediately • Entry-Level Research & QC Roles</span>
              </div>

              <h1 className="hero-title">
                Hi, I'm <span className="highlight-text">{p.name}</span>
              </h1>
              <p className="hero-role">
                <span className="degree">{p.title}</span>
                <span className="dot-divider">•</span>
                <span className="university">{p.school}</span>
              </p>

              <p className="hero-intro">{p.summary}</p>

              {/* Key Quick Metrics / Highlights */}
              <div className="hero-metrics">
                <div className="metric-card">
                  <span className="metric-value">84.8%</span>
                  <span className="metric-label">M.Sc. Score</span>
                </div>
                <div className="metric-card">
                  <span className="metric-value">BARC</span>
                  <span className="metric-label">Research Thesis</span>
                </div>
                <div className="metric-card">
                  <span className="metric-value">5+</span>
                  <span className="metric-label">Lab Internships</span>
                </div>
                <div className="metric-card">
                  <span className="metric-value">3</span>
                  <span className="metric-label">NPTEL Elite</span>
                </div>
              </div>

              {/* Call to Actions */}
              <div className="hero-actions">
                <a className="btn btn-primary" href="#contact">
                  <span>Get in Touch</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </a>
                <a className="btn btn-secondary" href="#work">
                  <span>Explore Research</span>
                </a>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => window.print()}
                  title="Print or Save CV as PDF"
                  aria-label="Print or Save CV as PDF"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <polyline points="6 9 6 2 18 2 18 9" />
                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                    <rect x="6" y="14" width="12" height="8" />
                  </svg>
                  <span>Print CV</span>
                </button>
              </div>
            </div>

            {/* Precision Laboratory Borosilicate Petri Dish Display */}
            <div className="dish-showcase">
              <div className="dish-outer-ring">
                <div className="dish-glass">
                  {/* Calibrated measurement marks */}
                  <div className="dish-ruler" aria-hidden="true" />
                  <div className="dish-agar-medium">
                    <img
                      src="/img/profile.jpg"
                      alt={`Portrait of ${p.name}`}
                      className="profile-img"
                      loading="eager"
                    />
                    {/* Glowing bacterial colonies */}
                    <span className="colony colony-1" title="Colony unit" aria-hidden="true" />
                    <span className="colony colony-2" aria-hidden="true" />
                    <span className="colony colony-3" aria-hidden="true" />
                    <span className="colony colony-4" aria-hidden="true" />
                    <span className="colony colony-5" aria-hidden="true" />
                  </div>
                </div>
              </div>
              <div className="dish-caption">
                <span className="dish-specimen">Specimen: Microbiologist</span>
                <span className="dish-location">Bharathidasan University • BARC Fellow</span>
              </div>
            </div>
          </div>
        </section>

        {/* SKILLS SECTION */}
        <section id="skills" className="content-section section-alt">
          <div className="section-header">
            <span className="section-eyebrow">Expertise & Competencies</span>
            <h2 className="section-title">Laboratory Capabilities & Skills</h2>
            <p className="section-desc">
              Extensive hands-on experience in microbiological cultivation, molecular assays, sterility assurance, and regulated quality compliance frameworks.
            </p>
          </div>

          {/* Skill Category Filter Pills */}
          <div className="skills-filter-bar" role="tablist" aria-label="Filter skills by domain">
            {skillCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={activeSkillCategory === cat}
                className={`filter-chip ${activeSkillCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveSkillCategory(cat)}
              >
                {cat === 'all' ? 'All Domains' : cat}
              </button>
            ))}
          </div>

          <div className="skills-grid">
            {filteredSkills.map((s) => {
              // Icon selector per category
              const isMicro = s.g.toLowerCase().includes('microbiology')
              const isQC = s.g.toLowerCase().includes('quality control')
              const isMol = s.g.toLowerCase().includes('molecular')
              const isSys = s.g.toLowerCase().includes('quality systems')

              return (
                <div key={s.g} className="skill-category-card">
                  <div className="category-header">
                    <div className="category-icon-wrapper" aria-hidden="true">
                      {isMicro && (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <circle cx="12" cy="12" r="10" />
                          <circle cx="9" cy="9" r="2" fill="currentColor" />
                          <circle cx="15" cy="15" r="2.5" fill="currentColor" />
                          <circle cx="15" cy="9" r="1.5" fill="currentColor" />
                          <circle cx="9" cy="15" r="1" fill="currentColor" />
                        </svg>
                      )}
                      {isMol && (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <path d="M4 4c4 4 12 4 16 0M4 20c4-4 12-4 16 0M6 8h12M6 16h12M9 12h6" />
                        </svg>
                      )}
                      {isQC && (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                          <path d="m9 12 2 2 4-4" />
                        </svg>
                      )}
                      {isSys && (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                          <line x1="16" y1="13" x2="8" y2="13" />
                          <line x1="16" y1="17" x2="8" y2="17" />
                          <polyline points="10 9 9 9 8 9" />
                        </svg>
                      )}
                    </div>
                    <div className="category-meta">
                      <h3 className="category-name">{s.g}</h3>
                      <span className="category-count">{s.items.length} techniques</span>
                    </div>
                  </div>

                  <ul className="skill-chips-list">
                    {s.items.map((item) => (
                      <li key={item} className="skill-pill">
                        <span className="pill-dot" aria-hidden="true" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </section>

        {/* WORK & PROJECTS SECTION */}
        <section id="work" className="content-section">
          <div className="section-header">
            <span className="section-eyebrow">Applied Research & Internships</span>
            <h2 className="section-title">Research Projects</h2>
            <p className="section-desc">
              Investigating phytosanitary food safety protocols, radiation preservation, and natural antimicrobial agents.
            </p>
          </div>

          <div className="projects-container">
            {D.projects.map((proj, idx) => (
              <article key={proj.title} className="research-project-card">
                <div className="project-badge-row">
                  <span className="project-tag">
                    {idx === 0 ? 'M.Sc. Master Thesis' : 'B.Sc. Undergraduate Thesis'}
                  </span>
                  <span className="project-duration">{proj.when}</span>
                </div>

                <h3 className="project-title">{proj.title}</h3>
                <div className="project-institution">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <span>{proj.where}</span>
                </div>

                <ul className="project-points">
                  {proj.points.map((point) => (
                    <li key={point}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>

                {proj.note && (
                  <div className="project-notice">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <span>{proj.note}</span>
                  </div>
                )}

                {proj.cert && (
                  <div className="project-action-row">
                    <CertButton id={proj.cert} label="View BARC Thesis Certificate" variant="pill" />
                  </div>
                )}
              </article>
            ))}
          </div>

          {/* INTERNSHIPS TIMELINE */}
          <div className="internships-wrapper">
            <div className="subsection-header">
              <h3 className="subsection-title">Laboratory Internships & Experience</h3>
              <p className="subsection-desc">
                Intensive clinical, food testing, bacteriology, and diagnostic lab postings across premier Indian institutes.
              </p>
            </div>

            <ol className="internships-timeline">
              {D.internships.map((intern, i) => (
                <li key={intern.org} className="timeline-item">
                  <div className="timeline-marker" aria-hidden="true">
                    <span className="marker-index">{i + 1}</span>
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <span className="timeline-date">{intern.when}</span>
                      {intern.cert && <CertButton id={intern.cert} label="Verified Certificate" variant="link" />}
                    </div>
                    <h4 className="timeline-org">{intern.org}</h4>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* EDUCATION, CERTIFICATIONS & AWARDS */}
        <section id="education" className="content-section section-alt">
          <div className="section-header">
            <span className="section-eyebrow">Academic Foundation</span>
            <h2 className="section-title">Education & Credentials</h2>
            <p className="section-desc">
              Strong theoretical grounding combined with elite national certifications in research methodology and RNA biology.
            </p>
          </div>

          <div className="education-grid">
            {D.education.map((edu) => (
              <div key={edu.deg} className="education-card">
                <div className="edu-top">
                  <div className="edu-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                      <path d="M6 12v5c3 3 9 3 12 0v-5" />
                    </svg>
                  </div>
                  <span className="edu-score-badge">{edu.score}</span>
                </div>
                <h3 className="edu-degree">{edu.deg}</h3>
                <p className="edu-institution">{edu.school}</p>
                <div className="edu-duration">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <span>{edu.when}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Dual Columns: Certifications & Awards */}
          <div className="credentials-columns">
            {/* Certifications Card */}
            <div className="credential-panel">
              <div className="panel-heading">
                <div className="panel-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <circle cx="12" cy="8" r="6" />
                    <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
                  </svg>
                </div>
                <div>
                  <h3 className="panel-title">NPTEL & Specialized Certifications</h3>
                  <span className="panel-sub">Government-certified advanced learning</span>
                </div>
              </div>

              <ul className="credential-list">
                {D.certifications.map((cert) => (
                  <li key={cert} className="credential-item">
                    <span className="badge-elite" aria-hidden="true">
                      ELITE
                    </span>
                    <span>{cert}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Awards & Conferences Card */}
            <div className="credential-panel">
              <div className="panel-heading">
                <div className="panel-icon trophy-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M6 9H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2" />
                    <path d="M18 9h2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2" />
                    <path d="M4 22h16" />
                    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                  </svg>
                </div>
                <div>
                  <h3 className="panel-title">Awards & Scientific Conferences</h3>
                  <span className="panel-sub">Conferences, symposia & distinctions</span>
                </div>
              </div>

              <ul className="credential-list">
                {D.awards.map((award, i) => (
                  <li key={award} className={`credential-item ${i === 0 ? 'first-rank-item' : ''}`}>
                    {i === 0 ? (
                      <span className="badge-rank" aria-hidden="true">
                        🥇 1st RANK
                      </span>
                    ) : (
                      <span className="bullet-circle" aria-hidden="true" />
                    )}
                    <span>{award}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* CERTIFICATES GALLERY */}
        <section id="certificates" className="content-section">
          <div className="section-header">
            <span className="section-eyebrow">Verified Credentials</span>
            <h2 className="section-title">Certificates & Memberships</h2>
            <p className="section-desc">
              Official verification documents from Bhabha Atomic Research Centre, ICMR-NIRT, NRMC-F, and Microbiologists Society India.
            </p>
          </div>

          <div className="certificates-grid">
            {D.certificates.map((cert) => (
              <article
                key={cert.id}
                className="cert-card"
                onClick={() => setActiveCert(cert)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setActiveCert(cert)
                  }
                }}
                aria-label={`Open certificate: ${cert.title}`}
              >
                <div className="cert-thumb-box">
                  <img src={`/img/${cert.id}.jpg`} alt={cert.title} loading="lazy" />
                  <div className="cert-overlay">
                    <span className="zoom-btn">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        <line x1="11" y1="8" x2="11" y2="14" />
                        <line x1="8" y1="11" x2="14" y2="11" />
                      </svg>
                      <span>Preview Certificate</span>
                    </span>
                  </div>
                </div>

                <div className="cert-info">
                  <h3 className="cert-title">{cert.title}</h3>
                  <p className="cert-issuer">{cert.by}</p>
                  <span className="cert-date">{cert.date}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* CONTACT SECTION */}
        <section id="contact" className="contact-section">
          <div className="contact-container">
            <div className="contact-header">
              <span className="contact-eyebrow">Start a Conversation</span>
              <h2 className="contact-title">Let's Connect & Collaborate</h2>
              <p className="contact-lead">
                Open to entry-level roles across microbiology laboratories, quality control (QC), quality assurance (QA), research and development (R&D), food processing, pharmaceutical, and biotechnology domains. Available to join immediately.
              </p>
            </div>

            <div className="contact-cards-grid">
              {/* Email Card */}
              <div className="contact-card">
                <div className="contact-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-10 7L2 7" />
                  </svg>
                </div>
                <div className="contact-details">
                  <span className="contact-label">Email Address</span>
                  <a href={`mailto:${p.email}`} className="contact-link">
                    {p.email}
                  </a>
                </div>
                <button
                  type="button"
                  className="copy-btn"
                  onClick={() => copyToClipboard(p.email, 'email')}
                  title="Copy email to clipboard"
                  aria-label="Copy email address"
                >
                  {copied === 'email' ? '✓ Copied' : 'Copy'}
                </button>
              </div>

              {/* Phone Card */}
              <div className="contact-card">
                <div className="contact-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <div className="contact-details">
                  <span className="contact-label">Telephone</span>
                  <a href={`tel:+91${p.phone}`} className="contact-link">
                    +91 {p.phone}
                  </a>
                </div>
                <a href={`tel:+91${p.phone}`} className="action-btn-link" title="Call directly">
                  Call
                </a>
              </div>

              {/* LinkedIn Card */}
              <div className="contact-card">
                <div className="contact-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect x="2" y="9" width="4" height="12" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                </div>
                <div className="contact-details">
                  <span className="contact-label">LinkedIn Profile</span>
                  <a href={p.linkedin} target="_blank" rel="noreferrer" className="contact-link">
                    vishalini-velliangiri
                  </a>
                </div>
                <a href={p.linkedin} target="_blank" rel="noreferrer" className="action-btn-link" title="Open LinkedIn Profile">
                  Visit ↗
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="page-footer">
        <div className="footer-content">
          <div className="footer-left">
            <span className="footer-brand">{p.name}</span>
            <span className="footer-sub">{p.title} • {p.school}</span>
          </div>
          <div className="footer-right">
            <p className="copyright">
              © {new Date().getFullYear()} {p.name}. Built for microbiology, research, and quality assurance.
            </p>
          </div>
        </div>
      </footer>

      {/* MODERN NATIVE DIALOG MODAL FOR CERTIFICATES */}
      <dialog
        ref={dialogRef}
        className="cert-dialog"
        onClick={handleDialogClick}
        aria-labelledby={activeCert ? `dialog-title-${activeCert.id}` : undefined}
      >
        {activeCert && (
          <div className="dialog-inner">
            <div className="dialog-header">
              <div>
                <h3 id={`dialog-title-${activeCert.id}`} className="dialog-title">
                  {activeCert.title}
                </h3>
                <p className="dialog-sub">
                  {activeCert.by} • {activeCert.date}
                </p>
              </div>
              <button
                type="button"
                className="dialog-close-btn"
                onClick={() => setActiveCert(null)}
                aria-label="Close certificate dialog"
              >
                ✕
              </button>
            </div>

            <div className="dialog-body">
              <img
                src={`/img/${activeCert.id}.jpg`}
                alt={`Certificate: ${activeCert.title}`}
                className="dialog-img"
              />
            </div>

            <div className="dialog-footer">
              <a
                href={`/img/${activeCert.id}.jpg`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary btn-sm"
              >
                Open Full Resolution ↗
              </a>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setActiveCert(null)}
              >
                Done
              </button>
            </div>
          </div>
        )}
      </dialog>
      {/* Floating Back to Top Button */}
      {showBackToTop && (
        <button
          type="button"
          className="back-to-top-btn"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Scroll back to top"
          title="Back to top"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <path d="M18 15l-6-6-6 6" />
          </svg>
        </button>
      )}
    </div>
  )
}
