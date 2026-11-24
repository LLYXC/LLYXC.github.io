"""Throwaway: build restyled Publications / Bootcamp / Join pages for the prototype from the live pages' content."""
import re, html, sys, os
repo, proto = sys.argv[1], sys.argv[2]
V = '11'
FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<link href="https://fonts.googleapis.com/css2?family=Cardo:ital,wght@0,400;0,700;1,400&family=Libre+Franklin:wght@400;500;600&display=swap" rel="stylesheet">'
norm = lambda t: re.sub(r'[^a-z0-9]+', ' ', t.lower()).strip()
txt = lambda h: re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', '', h))).strip()

CSS = r'''
:root{--bg:#f5f2ea;--ink:#14202e;--ink2:#414d5c;--muted:#6c7786;--rule:rgba(20,32,46,.13);--accent:#00356B;--accent2:#286DC0;--agent:#e39a14;--navh:60px;
  --serif:Cardo,Georgia,'Times New Roman',serif;--sans:'Libre Franklin',system-ui,-apple-system,'Segoe UI',sans-serif}
*,*::before,*::after{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font-family:var(--sans);font-size:16px;line-height:1.6;-webkit-font-smoothing:antialiased}
.proto{position:fixed;left:50%;top:18px;transform:translateX(-50%);z-index:50;font-size:11px;letter-spacing:.06em;text-transform:uppercase;background:#14202e;color:#fff;padding:5px 9px;border-radius:4px;opacity:.82}
.nav{position:sticky;top:0;z-index:30;height:var(--navh);display:flex;align-items:center;justify-content:space-between;padding:0 clamp(16px,4vw,52px);border-bottom:1px solid var(--rule);background:color-mix(in srgb,var(--bg) 88%,transparent);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}
.brand{display:flex;align-items:center;gap:11px;text-decoration:none;color:var(--ink);font-family:var(--serif);font-weight:700;font-size:1.22rem;white-space:nowrap}
.brand img{width:38px;height:38px;border-radius:50%;object-fit:cover;object-position:50% 18%}
.nav nav{display:flex;gap:clamp(14px,2.2vw,30px)}
.nav nav a{font-size:.92rem;font-weight:500;text-decoration:none;color:var(--ink2);padding:6px 0;border-bottom:2px solid transparent;transition:color .2s,border-color .2s}
.nav nav a:hover,.nav nav a.active{color:var(--accent);border-color:var(--accent)}
.page{max-width:780px;margin:0 auto;padding:clamp(34px,7vh,72px) 24px 96px}
.page h1{font-family:var(--serif);font-weight:400;font-size:clamp(2.3rem,4.4vw,3.2rem);line-height:1.08;letter-spacing:-.012em;margin:0 0 .45em}
.page h2{font-family:var(--serif);font-weight:700;font-size:1.55rem;line-height:1.2;margin:2.2em 0 .55em;padding-top:1.25em;border-top:1px solid var(--rule)}
.page p{margin:0 0 1em;color:var(--ink2)}
.page ul{margin:0 0 1em;padding-left:1.25em}.page li{color:var(--ink2);margin:.4em 0}
.page li::marker{color:var(--agent)}
.page a{color:var(--accent);text-underline-offset:3px}
.page strong{color:var(--ink);font-weight:600}
.lead{font-size:1.1rem}
.btn{display:inline-block;margin-top:.6em;background:var(--accent);color:#fff!important;text-decoration:none;font-weight:600;padding:12px 28px;border-radius:999px}
.btn:hover{background:#0a2240}
.foot{border-top:1px solid var(--rule);padding:22px clamp(16px,4vw,52px);font-size:.82rem;color:var(--muted)}
.split{max-width:1240px;margin:0 auto;display:grid;grid-template-columns:minmax(0,1fr) minmax(300px,40%);gap:clamp(20px,4vw,60px);padding:0 clamp(16px,4vw,52px)}
.split .page{max-width:760px;margin:0;padding-left:0;padding-right:0}
.vig{position:sticky;top:calc(var(--navh) + 18px);height:min(50vh,400px);min-height:290px;align-self:start;margin-top:clamp(24px,5vh,52px);padding-bottom:26px}
.vig{position:sticky}
.vig canvas{width:100%;height:100%;display:block;cursor:grab;touch-action:pan-y}
.vig.v-off{display:none}
.v-labels{position:absolute;inset:0;pointer-events:none;overflow:hidden}
.lab{position:absolute;left:0;top:0;transform:translate(-50%,-100%);font-size:11px;font-weight:600;line-height:1;padding:4px 8px;border-radius:999px;white-space:nowrap;background:rgba(255,255,255,.88);color:var(--ink);border:1px solid var(--rule);transition:background-color .3s,color .3s,border-color .3s}
.lab.on{background:var(--agent);border-color:var(--agent);color:#1b1404}
.lab.pick{pointer-events:auto;cursor:pointer}.lab.pick:hover{border-color:var(--agent)}
.vig-cap{position:absolute;left:0;right:0;bottom:2px;margin:0;text-align:center;font-size:.78rem;color:var(--muted)}
.rv{opacity:0;transform:translateY(16px);transition:opacity .7s ease,transform .7s cubic-bezier(.2,.7,.2,1)}
.rv.in{opacity:1;transform:none}
@media (prefers-reduced-motion:reduce){.rv{opacity:1;transform:none;transition:none}}
@media (max-width:920px){.split{grid-template-columns:1fr;gap:0}.vig{position:relative;top:0;height:260px;min-height:0;margin-top:12px;order:-1}.split .page{padding-top:16px}}
/* publications */
.page-sub{font-size:.95rem;color:var(--muted)!important}
.chips{display:flex;flex-wrap:wrap;gap:8px;margin:26px 0 6px;position:sticky;top:var(--navh);z-index:5;background:var(--bg);padding:12px 0}
.chip{font:inherit;font-size:.86rem;font-weight:500;padding:7px 15px;border-radius:999px;border:1px solid var(--rule);background:transparent;color:var(--ink2);cursor:pointer;transition:all .2s}
.chip b{font-family:var(--serif);color:var(--agent);margin-right:5px}
.chip:hover{border-color:var(--accent)}
.chip.on{background:var(--accent);border-color:var(--accent);color:#fff}.chip.on b{color:#ffd27a}
.yr h2{font-size:1.25rem;color:var(--agent);border-top:0;padding-top:0;margin:1.9em 0 0}
.pubs{list-style:none;margin:0;padding:0}
.pub{padding:17px 0;border-top:1px solid var(--rule);position:relative}
.pub::before{content:"";position:absolute;left:-16px;top:19px;bottom:19px;width:3px;border-radius:2px;background:var(--agent);transform:scaleY(0);transform-origin:top;transition:transform .28s ease}
.pub:hover::before{transform:scaleY(1)}
.pub-t{display:block;font-family:var(--serif);font-weight:700;font-size:1.2rem;line-height:1.28;text-decoration:none;color:var(--ink)!important}
a.pub-t:hover{color:var(--accent)!important;text-decoration:underline}
.pub-a{font-size:.9rem;line-height:1.5;margin:6px 0 4px!important}
.pub-a b{color:var(--ink);font-weight:600}
.pub-v{font-size:.9rem;margin:0!important;color:var(--ink)!important}
.pub-v i{font-family:var(--serif);font-size:1rem}
.note{display:inline-block;margin-left:8px;font-size:.72rem;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:#7a4d00;background:#fbe7bd;border-radius:4px;padding:2px 7px;vertical-align:1px}
.th{display:inline-block;margin-left:8px;font-family:var(--serif);font-weight:700;font-size:.84rem;color:var(--agent)}
.pub-l{display:flex;flex-wrap:wrap;gap:6px 14px;margin:7px 0 0!important;font-size:.84rem}
.pub[hidden],.yr[hidden]{display:none}
@media (max-width:600px){.proto{top:auto;bottom:10px;left:10px;transform:none}.brand span{display:none}.nav nav{gap:12px}.nav nav a{font-size:.8rem}}
'''
os.makedirs(proto, exist_ok=True)
open(f'{proto}/site.css', 'w').write(CSS)

CAPS = {'publications': 'Three stacks, one per theme. Click one to filter.', 'bootcamp': 'Two tracks, one camp.', 'join': 'One piece is missing.'}
REVEAL = """<script>
(()=>{const els=document.querySelectorAll('.page h2,.page>p,.page>ul,.pub');
 if(!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion: reduce)').matches) return;
 const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}}),{rootMargin:'0px 0px -6% 0px'});
 els.forEach(e=>{e.classList.add('rv');io.observe(e);});})();
</script>"""
def shell(title, active, body, script=''):
    ACT = ' class="active"'
    links = ''.join(f'<a{ACT if k == active else ""} href="{u}">{n}</a>' for k, n, u in
                    [('home', 'Home', '/'), ('publications', 'Publications', '/publications/'), ('bootcamp', 'Bootcamp', '/bootcamp/'), ('join', 'Join', '/join/')])
    return f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title} · Luyang Luo</title>
{FONTS}
<link rel="stylesheet" href="/site.css?v={V}">
</head><body>
<div class="proto">Throwaway prototype</div>
<header class="nav"><a class="brand" href="/"><img src="/portrait.jpg" alt=""><span>Luyang Luo</span></a><nav>{links}</nav></header>
<div class="split">
<main class="page">
{body}
</main>
<aside class="vig" id="vig" aria-hidden="true"><p class="vig-cap">{CAPS[active]}</p></aside>
</div>
<footer class="foot">© Luyang Luo</footer>
{script}
{REVEAL}
<script type="importmap">{{"imports":{{"three":"https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js"}}}}</script>
<script type="module">
import {{ mount }} from '/vignette.js?v={V}';
const counts = {{}}; ['build','know','wire'].forEach(k => counts[k] = document.querySelectorAll('.pub[data-themes~="'+k+'"]').length);
window.__vig = mount(document.getElementById('vig'), '{active}', {{ counts, onPick: f => window.__filt && window.__filt(f) }});
if (window.__vig && window.__vig.select && window.__f) window.__vig.select(window.__f);
</script>
</body></html>
'''
def out(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True); open(path, 'w').write(content)

# ---------- publications ----------
src = open(f'{repo}/publications.html').read()
cards = [c for c in re.split(r'(?=<div class="publication-card)', src[src.find('<div class="publication-card'):]) if 'publication-title' in c]
THEME = {
 'build': ['open ended clinical text generation', 'universal foundation model for grounded', 'generalist specialist collaboration', 'explainable biomedical foundation model', 'large model for non invasive', 'large scale generative tumor synthesis', 'asclepius'],
 'know':  ['clinical environment simulator', 'doctor will agree with you', 'emergency department revisit', 'rexgroundingct', 'struggle to ground', 'abandonment of safe medical advice'],
 'wire':  ['rexplain', 'ed explain', 'continual learning for ai on endotracheal', 'explainable biomedical foundation model', 'interpretable model integrating multimodal', 'mica towards explainable'],
}
NUM = {'build': '01', 'know': '02', 'wire': '03'}
def themes_for(title):
    n = norm(title); return [t for t, keys in THEME.items() if any(k in n for k in keys)]
pubs = []
for c in cards:
    c = c[:c.find('<!--')] if '<!--' in c[c.find('publication-venue'):] and False else c
    h3 = re.search(r'<h3 class="publication-title">(.*?)</h3>', c, re.S).group(1)
    href = re.search(r'href="([^"]+)"', h3); title = txt(h3)
    au = re.search(r'<p class="publication-authors">(.*?)</p>', c, re.S).group(1)
    au = re.sub(r'<span class="author-highlight[^"]*">(.*?)</span>', r'[[B]]\1[[/B]]', au, flags=re.S)
    au = html.escape(txt(au), quote=False).replace('[[B]]', '<b>').replace('[[/B]]', '</b>')
    ve = re.search(r'<p class="publication-venue">(.*?)</p>', c, re.S).group(1)
    vname = txt(re.search(r'<span class="font-medium">(.*?)</span>', ve, re.S).group(1)); year = int(re.search(r'(20\d\d)', txt(ve)).group(1))
    notes = [txt(x) for x in re.findall(r'<span class="px-3 py-1 bg-blue-100[^"]*">(.*?)</span>', c, re.S)]
    tail = c[c.find('publication-venue'):]
    links = [(txt(lbl), u) for u, lbl in re.findall(r'<a\s+href="([^"]+)"\s*class="inline-flex[^"]*"[^>]*>(.*?)</a>', tail, re.S)]
    pubs.append(dict(title=title, url=href.group(1) if href else '', authors=au, venue=vname, year=year, status='', notes=notes, links=links))
assert len(pubs) == 35, len(pubs)
science = dict(title='Abandonment of safe medical advice by large language models under patient resistance', url='', year=2026, status='in press', venue='Science', notes=[], links=[],
  authors='Aakash Reddy, Taeil Matthew Kim, Liam McCoy, Ashwin Ramaswamy, Xucheng Wang, Brian Eiss, Anita Ganti, Nonyerem Acholonu-Fomin, Alexander Fortenko, Sowmya Sanapala, Sung Eun Kim, Shruti Gupta, Girish Nadkarni, Nigam H. Shah, Eric Topol, <b>Luyang Luo</b>, Pranav Rajpurkar')
ascl = dict(title='Asclepius: An Adaptive Harness for Long-Horizon Clinical Agents', url=sys.argv[3], year=2026, status='', venue='EMNLP', notes=[], links=[],
  authors='Grace Chang Yuan, Xiaoman Zhang, Sung Eun Kim, <b>Luyang Luo</b>, Pranav Rajpurkar')
i = next(k for k, p in enumerate(pubs) if 'clinical environment simulator' in norm(p['title']))
pubs.insert(i + 1, ascl); pubs.insert(0, science)
rows, years = {}, []
for p in pubs:
    th = themes_for(p['title'])
    eu, et = html.escape(p["url"]), html.escape(p["title"])
    t = ('<a class="pub-t" href="%s" target="_blank" rel="noopener">%s</a>' % (eu, et)) if p['url'] else '<span class="pub-t">%s</span>' % et
    v = '<i>%s</i>, %s' % (html.escape(p["venue"]), p["year"]) + ((', ' + p["status"]) if p['status'] else '') + ''.join('<span class="note">%s</span>' % html.escape(n) for n in p['notes']) + ''.join('<span class="th" title="Theme %s">%s</span>' % (NUM[x], NUM[x]) for x in th)
    l = ('<p class="pub-l">' + ''.join('<a href="%s" target="_blank" rel="noopener">%s</a>' % (html.escape(u), html.escape(lbl)) for lbl, u in p['links']) + '</p>') if p['links'] else ''
    if p['year'] not in rows: rows[p['year']] = []; years.append(p['year'])
    rows[p['year']].append('<li class="pub" data-themes="%s">%s<p class="pub-a">%s</p><p class="pub-v">%s</p>%s</li>' % (" ".join(th), t, p["authors"], v, l))
body = '''<h1>Selected Publications</h1>
<p class="page-sub"><a href="https://scholar.google.com.hk/citations?user=eD1O_vAAAAAJ&hl=en">Google Scholar</a> &nbsp;·&nbsp; * denotes co-first authorship</p>
<div class="chips" role="group" aria-label="Filter by theme">
<button class="chip on" data-f="all">All</button>
<button class="chip" data-f="build"><b>01</b>Build AI that does clinical work</button>
<button class="chip" data-f="know"><b>02</b>Know before we deploy</button>
<button class="chip" data-f="wire"><b>03</b>Wire AI into the health system</button>
</div>
''' + '\n'.join('<section class="yr"><h2>%s</h2><ol class="pubs">\n' % y + '\n'.join(rows[y]) + '\n</ol></section>' for y in years)
script = '''<script>
const chips=[...document.querySelectorAll('.chip')];
function filt(f){ if(!chips.some(c=>c.dataset.f===f)) f='all';
  chips.forEach(c=>c.classList.toggle('on',c.dataset.f===f));
  document.querySelectorAll('.pub').forEach(p=>p.hidden = f!=='all' && !p.dataset.themes.split(' ').includes(f));
  document.querySelectorAll('.yr').forEach(y=>y.hidden = !y.querySelector('.pub:not([hidden])'));
  history.replaceState(null,'', f==='all' ? location.pathname : '#'+f);
  window.__f=f; if(window.__vig&&window.__vig.select) window.__vig.select(f); }
window.__filt=filt;
chips.forEach(c=>c.addEventListener('click',()=>filt(c.dataset.f)));
filt(location.hash.slice(1)||'all');
addEventListener('hashchange',()=>filt(location.hash.slice(1)||'all'));
</script>'''
out(f'{proto}/publications/index.html', shell('Publications', 'publications', body, script))
print('publications:', len(pubs), 'entries;', {t: sum(t in themes_for(p['title']) for p in pubs) for t in THEME}, '; with notes:', [(p['title'][:28], p['notes']) for p in pubs if p['notes']])

# ---------- bootcamp / join ----------
def content_page(fname, key, title, fixes):
    s = open(f'{repo}/{fname}').read(); a = s.find('<div class="main-content"'); b = s.find('<footer', a); m = s[a:b]
    for pat, rep in fixes:
        m, n = re.subn(pat, rep, m, flags=re.S); assert n == 1, (fname, pat)
    parts = []
    for k, (h, c) in enumerate(re.findall(r'<h2 class="section-title">(.*?)</h2>\s*<div class="section-content">(.*?)</div>\s*</div>\s*(?=<!--|<div class="content-section"|\s*$)', m, re.S)):
        c = re.sub(r'<span class="font-semibold[^"]*">(.*?)</span>', r'<strong>\1</strong>', c, flags=re.S)
        c = re.sub(r'<div class="text-center[^"]*">(.*?)</div>', r'<p>\1</p>', c, flags=re.S)
        c = c.replace('class="apply-button"', 'class="btn"')
        c = re.sub(r'\sclass="(?!btn)[^"]*"', '', c); c = re.sub(r'<br\s*/?>', '', c); c = re.sub(r'\n\s*\n', '\n', c).strip()
        if k == 0: c = c.replace('<p>', '<p class="lead">', 1)
        parts.append(('<h1>%s</h1>' % txt(h) if k == 0 else '<h2>%s</h2>' % txt(h)) + '\n' + c)
    out(f'{proto}/{key}/index.html', shell(title, key, '\n'.join(parts)))
    print(f'{key}: {len(parts)} sections')
NEW3 = '<a href="/#build">building AI that does clinical work</a>, <a href="/#know">knowing what it will do before we deploy it</a>, and <a href="/#wire">wiring AI into the health system</a>'
content_page('bootcamp.html', 'bootcamp', 'Medical AI Bootcamp', [(r'core research directions:.*?patients and clinicians\.', 'core research directions: ' + NEW3 + '.')])
content_page('join.html', 'join', 'Join', [(r'three directions:.*?health systems</span>\.', 'three directions: ' + NEW3 + '.')])
