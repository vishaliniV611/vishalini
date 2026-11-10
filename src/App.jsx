import { useState, useEffect } from 'react'
import D from './data.json'

const MB=[[6,14,22,0,"c"],[18,70,14,2,"c"],[40,8,34,1,"r"],[55,82,28,3,"r"],[72,20,16,1.5,"c"],[88,60,24,0.5,"r"],[93,10,12,2.5,"c"],[30,45,10,4,"c"]]
const certById = (id) => D.certificates.find((c) => c.id === id)

export default function App() {
  const [open, setOpen] = useState(null)
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && setOpen(null)
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [])
  const p = D.profile
  const CertBtn = ({ id }) => id ? <button className="link" onClick={() => setOpen(certById(id))}>View certificate</button> : null

  return (
    <>
      <header className="nav">
        <a href="#top" className="brand">{p.name}</a>
        <nav>
          <a href="#skills">Skills</a><a href="#work">Work</a><a href="#education">Education</a><a href="#certificates">Certificates</a><a href="#contact">Contact</a>
        </nav>
      </header>
      <main id="top">
        <section className="hero">
          <div className="microbes" aria-hidden="true">{MB.map(([x,y,s,d,t],i)=><i key={i} className={"m "+t} style={{"--x":x,"--y":y,"--s":s,"--d":d}} />)}</div>
          <div>
            <h1>{p.name}</h1>
            <p className="role">{p.title}, {p.school}</p>
            <p className="intro">{p.summary}</p>
            <a className="btn" href="#contact">Get in touch</a>
          </div>
          <div className="dish">
            <img src="/img/profile.jpg" alt={`Portrait of ${p.name}`} />
            <i className="c c1" /><i className="c c2" /><i className="c c3" /><i className="c c4" />
          </div>
        </section>

        <section id="skills" className="block alt">
          <h2>Skills</h2>
          <div className="skills">
            {D.skills.map((s) => (
              <div key={s.g}><h3>{s.g}</h3>
                <ul className="chips">{s.items.map((i) => <li key={i}>{i}</li>)}</ul></div>
            ))}
          </div>
        </section>

        <section id="work" className="block">
          <h2>Projects</h2>
          {D.projects.map((j) => (
            <article key={j.title} className="proj">
              <span className="when">{j.when}</span>
              <h3>{j.title}</h3>
              <p className="org">{j.where}</p>
              <ul>{j.points.map((x) => <li key={x}>{x}</li>)}</ul>
              {j.note && <p className="note">{j.note}</p>}
              <CertBtn id={j.cert} />
            </article>
          ))}
          <h2 className="sub">Internships</h2>
          <ol className="timeline">
            {D.internships.map((i) => (
              <li key={i.org}><span className="when">{i.when}</span><h3>{i.org}</h3><CertBtn id={i.cert} /></li>
            ))}
          </ol>
        </section>

        <section id="education" className="block alt">
          <h2>Education</h2>
          {D.education.map((e) => (
            <div key={e.deg} className="edu"><h3>{e.deg}</h3><p className="org">{e.school}</p><p>{e.when} | {e.score}</p></div>
          ))}
          <h2 className="sub">Certifications</h2>
          <ul>{D.certifications.map((x) => <li key={x}>{x}</li>)}</ul>
          <h2 className="sub">Awards and achievements</h2>
          <ul>{D.awards.map((x) => <li key={x}>{x}</li>)}</ul>
        </section>

        <section id="certificates" className="block">
          <h2>Certificates</h2>
          <div className="grid">
            {D.certificates.map((c) => (
              <button key={c.id} className="card" onClick={() => setOpen(c)}>
                <img src={`/img/${c.id}.jpg`} alt={c.title} loading="lazy" />
                <span className="ct">{c.title}</span>
                <span className="cb">{c.by}, {c.date}</span>
              </button>
            ))}
          </div>
        </section>

        <section id="contact" className="block contact">
          <h2>Contact</h2>
          <p className="lead">Open to entry-level roles in microbiology, quality control, quality assurance, research, food, pharmaceutical and biotechnology. Available to join immediately.</p>
          <div className="tiles">
            <a className="tile" href={`mailto:${p.email}`}><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg><span className="tl">Email</span><span className="tv">{p.email}</span></a>
            <a className="tile" href={`tel:+91${p.phone}`}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/></svg><span className="tl">Phone</span><span className="tv">{p.phone}</span></a>
            <a className="tile" href={p.linkedin} target="_blank" rel="noreferrer"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 11v6M8 7.5v.01M12 17v-6m0 3a3 3 0 0 1 6 0v3"/></svg><span className="tl">LinkedIn</span><span className="tv">vishalini-velliangiri</span></a>
          </div>
        </section>
      </main>
      <footer>© {new Date().getFullYear()} {p.name}</footer>
      {open && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={open.title} onClick={() => setOpen(null)}>
          <figure onClick={(e) => e.stopPropagation()}>
            <img src={`/img/${open.id}.jpg`} alt={open.title} />
            <figcaption>{open.title}, {open.by}</figcaption>
            <button className="btn" onClick={() => setOpen(null)}>Close</button>
          </figure>
        </div>
      )}
    </>
  )
}
