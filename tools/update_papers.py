"""Keep the publication list in step with Luyang's Google Scholar profile.

    python3 tools/update_papers.py             fetch the profile, look up new papers, rebuild _data/papers.json
    python3 tools/update_papers.py --offline   rebuild _data/papers.json from the files as they are
                                               (run this after editing _data/papers_extra.json by hand)
    python3 tools/update_papers.py --from-dir DIR   as the first form, but read profile pages saved in DIR (p0.html, p100.html, ...)

Three files in _data/:
  scholar.json       written here, never by hand. One entry per paper on the profile: title, venue line, year and
                     citation count from Scholar, plus the full author list and a link looked up once on OpenAlex.
  papers_extra.json  written by hand. An entry for each paper that needs something Scholar cannot give: co-first
                     marks, a preferred title or venue name, notes, extra links, a place on the home page. An entry
                     that matches nothing on Scholar is a paper of its own (one that is in press, say).
  papers.json        written here, never by hand. The two files above merged; it is what the pages read.

Scholar has no API. Its list pages answer a plain request; the per-paper pages, which hold the full author list,
refuse scripts, which is why authors come from OpenAlex. A run changes nothing unless Scholar answered properly:
an empty or much shorter list is treated as a block or an outage and the script exits non-zero.
Standard library only.
"""
import difflib, html, json, os, re, sys, time, urllib.parse, urllib.request

USER = 'eD1O_vAAAAAJ'
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCHOLAR, EXTRA, PAPERS = (os.path.join(ROOT, '_data', f) for f in ('scholar.json', 'papers_extra.json', 'papers.json'))
UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36'
PAGE = 100
norm = lambda t: re.sub(r'[^a-z0-9]+', ' ', (t or '').lower()).strip()
text = lambda h: re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', '', h))).strip()

def load(path): return json.load(open(path, encoding='utf-8'))
def save(path, data):
    with open(path, 'w', encoding='utf-8') as f: json.dump(data, f, ensure_ascii=False, indent=1); f.write('\n')


# ───────────── Google Scholar ─────────────
def get(url, timeout=30):
    req = urllib.request.Request(url, headers={'User-Agent': UA, 'Accept-Language': 'en-US,en;q=0.9'})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read().decode('utf-8', 'replace')

def profile_pages(from_dir):
    """Yield the profile's list pages, 100 papers at a time, newest first."""
    start = 0
    while True:
        if from_dir:
            path = os.path.join(from_dir, f'p{start}.html')
            if not os.path.exists(path): return
            page = open(path, encoding='utf-8', errors='replace').read()
        else:
            page = get(f'https://scholar.google.com/citations?user={USER}&hl=en&cstart={start}&pagesize={PAGE}&sortby=pubdate')
        yield page
        if page.count('class="gsc_a_tr"') < PAGE: return
        start += PAGE
        if not from_dir: time.sleep(2)

def parse(page):
    out = []
    for row in re.findall(r'<tr class="gsc_a_tr">(.*?)</tr>', page, re.S):
        cid = re.search(r'citation_for_view=[^:"&]+:([\w-]+)', row)
        title = re.search(r'class="gsc_a_at">(.*?)</a>', row, re.S)
        if not (cid and title): continue  # the "no articles" row
        gray = re.findall(r'<div class="gs_gray">(.*?)</div>', row, re.S) + ['', '']
        cites = re.search(r'class="gsc_a_ac[^"]*">(\d*)', row)
        year = re.search(r'class="gsc_a_y">.*?(\d{4})', row, re.S)
        out.append(dict(cid=cid.group(1), title=text(title.group(1)), authors_scholar=text(gray[0]), venue_scholar=text(gray[1]),
                        year=year.group(1) if year else '', citations=int(cites.group(1)) if cites and cites.group(1) else 0))
    return out

def openalex(title):
    """Full author list and links for one paper, or None. Only a near-identical title with a Luo among the authors is accepted."""
    try:
        q = urllib.parse.quote_plus(re.sub(r'[^\w\s-]', ' ', title))
        res = json.loads(get(f'https://api.openalex.org/works?search={q}&per-page=5&select=title,doi,authorships,primary_location', 20))['results']
    except Exception as e:
        print(f'  OpenAlex look-up failed ({e.__class__.__name__}): {title[:60]}'); return None
    for w in res:
        names = [a['author']['display_name'] for a in w.get('authorships') or [] if a.get('author')]
        if difflib.SequenceMatcher(None, norm(w.get('title')), norm(title)).ratio() >= .92 and any(n.split()[-1].lower() == 'luo' for n in names if n.split()):
            return dict(authors_full=names, doi=w.get('doi') or '', landing=((w.get('primary_location') or {}).get('landing_page_url') or ''))
    return None

def refresh(from_dir):
    old = load(SCHOLAR)
    known = {o['cid']: o for o in old}
    now = []
    try:
        for page in profile_pages(from_dir): now += parse(page)
    except OSError as e:   # a refusal (HTTP 429 and the like), a time-out, no network
        sys.exit(f'Could not read the Scholar profile ({e}). Nothing was changed.')
    if len(now) < max(1, .7 * len(old)):
        sys.exit(f'Scholar returned {len(now)} papers where {len(old)} were known. Treating that as a block or an outage; nothing was changed.')
    out, added = [], []
    for s in now:
        o = known.get(s['cid']) or {}
        if not o: added.append(s['title'])
        more = dict(authors_full=o.get('authors_full') or [], doi=o.get('doi') or '', landing=o.get('landing') or '')
        if not more['authors_full']:
            more.update(openalex(s['title']) or {}); time.sleep(.3)
        out.append(dict(s, **more))
    gone = [o['title'] for c, o in known.items() if c not in {s['cid'] for s in now}]
    save(SCHOLAR, out)
    print(f'Scholar: {len(out)} papers, {sum(p["citations"] for p in out)} citations; {len(added)} new, {len(gone)} gone, '
          f'{sum(not p["authors_full"] for p in out)} without a full author list')
    for t in added: print('  new: ', t)
    for t in gone: print('  gone:', t)


# ───────────── merge ─────────────
# Scholar's venue line carries volume, pages, the year and sometimes a note, and names one venue several ways.
# The venue filter needs one name each: a known fragment (matched on word boundaries, in this order) maps to a name.
VENUES = [
 ('arxiv', 'arXiv'), ('transactions on medical imaging', 'IEEE TMI'), ('tmi', 'IEEE TMI'), ('medical image analysis', 'Medical Image Analysis'),
 ('medical image computing and computer', 'MICCAI'), ('miccai', 'MICCAI'), ('nature medicine', 'Nature Medicine'), ('nature communications', 'Nature Communications'),
 ('nature biomedical engineering', 'Nature Biomedical Engineering'), ('nejm ai', 'NEJM AI'), ('pacific symposium', 'PSB'), ('psb', 'PSB'),
 ('journal of biomedical and health informatics', 'IEEE JBHI'), ('jbhi', 'IEEE JBHI'), ('health, inference, and learning', 'CHIL'), ('chil', 'CHIL'),
 ('aaai conference', 'AAAI'), ('aimedhealth', 'AAAI AIMedHealth'), ('aimedheath', 'AAAI AIMedHealth'), ('aaai', 'AAAI'), ('emnlp', 'EMNLP'),
 ('tnnls', 'IEEE TNNLS'), ('neural networks and learning systems', 'IEEE TNNLS'), ('rbme', 'IEEE RBME'), ('reviews in biomedical engineering', 'IEEE RBME'),
 ('isbi', 'ISBI'), ('us patent', 'Patent'), ('pqdt', 'PhD thesis'), ('machine learning for healthcare', 'MLHC'), ('mlhc', 'MLHC'),
 ('machine learning for health', 'ML4H'), ('ml4h', 'ML4H'), ('lancet digital health', 'The Lancet Digital Health'),
 ('radiology: artificial intelligence', 'Radiology: Artificial Intelligence'), ('investigative ophthalmology', 'Investigative Ophthalmology & Visual Science'),
 ('bioinformatics and biomedicine', 'IEEE BIBM'), ('linguistic analysis for health', 'HeaLing Workshop'), ('artificial intelligence for medicine', 'AIxMed'),
 ('information fusion', 'Information Fusion'), ('magnetic resonance imaging', 'Journal of Magnetic Resonance Imaging'),
 ('british journal of ophthalmology', 'British Journal of Ophthalmology'), ('micro/nanolithography', 'Journal of Micro/Nanolithography, MEMS, and MOEMS'),
 ('springer nature', 'Springer Nature'), ('science', 'Science'),
]
NOTE_WORDS = {'oral': 'Oral Presentation', 'early accept': 'Early Accept', 'best paper': 'Best Paper', 'featured article': 'Featured Article', 'cover page': 'Cover Page'}

def venue_of(raw):
    """(name, notes) from a venue line such as 'MICCAI 2024 (early accept), 2024' or 'Nature medicine 32 (3), 820-827, 2026'."""
    notes = [NOTE_WORDS.get(n.strip().lower(), n.strip()) for n in re.findall(r'[\[(]([A-Za-z][^\])]*)[\])]', raw)]
    low = raw.lower()
    for frag, name in VENUES:
        if re.search(r'\b' + re.escape(frag) + r'\b', low): return name, notes
    name = re.sub(r'[\[(][^\])]*[\])]', '', raw)                     # notes and issue numbers in brackets
    name = re.sub(r',?\s*\b(19|20)\d\d\b', '', name)                    # years
    name = re.sub(r'[\s,]+[\d][\w\s,:\-–/.]*$', '', name).strip(' ,…')  # trailing volume and pages
    return name, notes

def authors_html(p):
    """Full list when known, Scholar's shortened one otherwise. A very long list keeps its start, its end and Luyang."""
    if p['authors_full']:
        names = p['authors_full']; me = [i for i, n in enumerate(names) if norm(n) in ('luyang luo', 'luo luyang')]
        keep = set(range(len(names))) if len(names) <= 14 else set(range(8)) | {len(names) - 2, len(names) - 1} | set(me)
        out, last = [], -1
        for i in sorted(keep):
            if i != last + 1: out.append('…')
            out.append('<b>%s</b>' % html.escape(names[i]) if i in me else html.escape(names[i])); last = i
        return ', '.join(out)
    return re.sub(r'\bL Luo\b', '<b>L Luo</b>', html.escape(p['authors_scholar'].replace('...', '…')))

def merge():
    scholar, extra = load(SCHOLAR), load(EXTRA)
    by_title = {}
    for e in extra:
        for t in (e['title'], e.get('scholar_title')):
            if t: by_title[norm(t)] = e
    def extra_for(title):
        n = norm(title)
        if n in by_title: return by_title[n]
        m = difflib.get_close_matches(n, list(by_title), n=1, cutoff=.86)
        return by_title[m[0]] if m else None
    def entry(e=None, p=None):
        """One paper as the pages show it: the hand-written entry where there is one, Scholar otherwise."""
        if e:
            d = dict(title=e['title'], url=e.get('url', ''), authors=e['authors'], venue=venue_of(e['venue'])[0] or e['venue'], venue_shown=e['venue'],
                     year=e['year'], status=e.get('status', ''), notes=e.get('notes', []), links=e.get('links', []))
        else:
            name, notes = venue_of(p['venue_scholar']); y = p['year'] or (re.search(r'\b(20\d\d)\b', p['venue_scholar']) or [''])[0]
            d = dict(title=p['title'], url=p['doi'] or p['landing'] or f'https://scholar.google.com/citations?view_op=view_citation&hl=en&user={USER}&citation_for_view={USER}:{p["cid"]}',
                     authors=authors_html(p), venue=name, venue_shown=name, year=int(y) if y else 0, status='', notes=notes, links=[])
        home = (e or {}).get('home') or {}
        d.update(citations=p['citations'] if p else 0, home_theme=home.get('theme', ''), home_position=home.get('position', 0),
                 sort_title=norm(d['title']), find=norm(d['title'] + ' ' + re.sub(r'<[^>]+>', '', d['authors']) + ' ' + d['venue_shown']))
        return d
    listed, used = [], {}
    for p in scholar:
        e = extra_for(p['title'])
        if e is not None:
            if id(e) in used: sys.exit(f'Two Scholar entries match one hand-written entry:\n  {used[id(e)]}\n  {p["title"]}\nGive the hand-written entry a "scholar_title", or remove the duplicate from the Scholar profile.')
            used[id(e)] = p['title']
        listed.append(entry(e, p))
    alone = [entry(e) for e in extra if id(e) not in used]       # hand-written, not on Scholar (yet): first in their year
    papers = sorted(alone + listed, key=lambda d: -d['year'])    # stable, so Scholar's newest-first order holds inside a year
    save(PAPERS, papers)
    print(f'papers.json: {len(papers)} papers; {len(used)} use a hand-written entry, {len(alone)} are not on Scholar'
          + (': ' + '; '.join(d['title'][:50] for d in alone) if alone else ''))


if __name__ == '__main__':
    args = sys.argv[1:]
    if '--offline' not in args:
        refresh(args[args.index('--from-dir') + 1] if '--from-dir' in args else None)
    merge()
