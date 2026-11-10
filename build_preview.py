# Builds a single-file preview: python3 build_preview.py
import json,base64,re
from PIL import Image
import io
D=json.load(open('src/data.json'))
def uri(n,w):
    im=Image.open(f'public/img/{n}.jpg');im.thumbnail((w,w));b=io.BytesIO();im.save(b,'JPEG',quality=70)
    return 'data:image/jpeg;base64,'+base64.b64encode(b.getvalue()).decode()
imgs={n:uri(n,500 if n=='profile' else 800) for n in ['profile']+[c['id'] for c in D['certificates']]}
css=open('src/styles.css').read()
css+=':root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}.nav{top:env(safe-area-inset-top,0px)}'
js='''
const D=%s,I=%s,$=s=>document.querySelector(s);
const C=id=>D.certificates.find(c=>c.id===id);
const cb=id=>id?`<button class="link" data-c="${id}">View certificate</button>`:'';
const MB=[[6,14,22,0,'c'],[18,70,14,2,'c'],[40,8,34,1,'r'],[55,82,28,3,'r'],[72,20,16,1.5,'c'],[88,60,24,0.5,'r'],[93,10,12,2.5,'c'],[30,45,10,4,'c']];
const p=D.profile,li=a=>a.map(x=>`<li>${x}</li>`).join('');
$('#root').innerHTML=`<header class="nav"><a href="#top" class="brand">${p.name}</a><nav><a href="#skills">Skills</a><a href="#work">Work</a><a href="#education">Education</a><a href="#certificates">Certificates</a><a href="#contact">Contact</a></nav></header>
<main id="top"><section class="hero"><div class="microbes" aria-hidden="true">${MB.map(([x,y,s,d,t])=>`<i class="m ${t}" style="--x:${x};--y:${y};--s:${s};--d:${d}"></i>`).join('')}</div><div><h1>${p.name}</h1><p class="role">${p.title}, ${p.school}</p><p class="intro">${p.summary}</p><a class="btn" href="#contact">Get in touch</a></div>
<div class="dish"><img src="${I.profile}" alt="Portrait of ${p.name}"><i class="c c1"></i><i class="c c2"></i><i class="c c3"></i><i class="c c4"></i></div></section>
<section id="skills" class="block alt"><h2>Skills</h2><div class="skills">${D.skills.map(s=>`<div><h3>${s.g}</h3><ul class="chips">${li(s.items)}</ul></div>`).join('')}</div></section>
<section id="work" class="block"><h2>Projects</h2>${D.projects.map(j=>`<article class="proj"><span class="when">${j.when}</span><h3>${j.title}</h3><p class="org">${j.where}</p><ul>${li(j.points)}</ul>${j.note?`<p class="note">${j.note}</p>`:''}${cb(j.cert)}</article>`).join('')}
<h2 class="sub">Internships</h2><ol class="timeline">${D.internships.map(i=>`<li><span class="when">${i.when}</span><h3>${i.org}</h3>${cb(i.cert)}</li>`).join('')}</ol></section>
<section id="education" class="block alt"><h2>Education</h2>${D.education.map(e=>`<div class="edu"><h3>${e.deg}</h3><p class="org">${e.school}</p><p>${e.when} | ${e.score}</p></div>`).join('')}
<h2 class="sub">Certifications</h2><ul>${li(D.certifications)}</ul><h2 class="sub">Awards and achievements</h2><ul>${li(D.awards)}</ul></section>
<section id="certificates" class="block"><h2>Certificates</h2><div class="grid">${D.certificates.map(c=>`<button class="card" data-c="${c.id}"><img src="${I[c.id]}" alt="${c.title}"><span class="ct">${c.title}</span><span class="cb">${c.by}, ${c.date}</span></button>`).join('')}</div></section>
<section id="contact" class="block contact"><h2>Contact</h2><p class="lead">Open to entry-level roles in microbiology, quality control, quality assurance, research, food, pharmaceutical and biotechnology. Available to join immediately.</p><div class="tiles"><a class="tile" href="mailto:${p.email}"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg><span class="tl">Email</span><span class="tv">${p.email}</span></a><a class="tile" href="tel:+91${p.phone}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/></svg><span class="tl">Phone</span><span class="tv">${p.phone}</span></a><a class="tile" href="${p.linkedin}" target="_blank" rel="noreferrer"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 11v6M8 7.5v.01M12 17v-6m0 3a3 3 0 0 1 6 0v3"/></svg><span class="tl">LinkedIn</span><span class="tv">vishalini-velliangiri</span></a></div></section></main><footer>© 2026 ${p.name}</footer>`;
const lb=document.createElement('div');lb.className='lightbox';lb.hidden=true;document.body.append(lb);
const close=()=>{lb.hidden=true};
document.addEventListener('click',e=>{const b=e.target.closest('[data-c]');if(b){const c=C(b.dataset.c);lb.innerHTML=`<figure><img src="${I[c.id]}" alt="${c.title}"><figcaption>${c.title}, ${c.by}</figcaption><button class="btn">Close</button></figure>`;lb.hidden=false}else if(e.target===lb||e.target.closest('.lightbox .btn'))close()});
document.addEventListener('keydown',e=>e.key==='Escape'&&close());
'''%(json.dumps(D),json.dumps(imgs))
html=f'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><title>Vishalini E V | Microbiologist</title><link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700&family=Public+Sans:wght@400;500;600&display=swap" rel="stylesheet"><style>{css}.lightbox[hidden]{{display:none}}</style></head><body><div id="root"></div><script>{js}</script></body></html>'
import os;os.makedirs('/mnt/user-data/outputs',exist_ok=True)
open('/mnt/user-data/outputs/portfolio-preview.html','w').write(html);print(len(html)//1024,'KB')
