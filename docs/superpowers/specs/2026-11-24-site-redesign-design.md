# Site redesign: animated home page and a shared style for every page

Date: 2026-11-24
Status: draft, waiting for Luyang's approval

**Status, 2026-11-25: built.** The site was built from the prototype on the `redesign` branch and the prototype folder was removed once the built pages were checked against it, page by page. This document is the record of what was decided and why; `README.md` at the repository root says where each thing lives and how to change it. What is still open is listed under "Not done yet" at the end.

Where the pieces are:

- `_layouts/default.html` (head, menu, footer) and `_layouts/page.html` (the inner pages' text column and 3D object).
- `index.html`, `publications.html`, `bootcamp.html`, `join.html`.
- `_data/themes.yml`, `_data/papers_extra.json` (hand-written), `_data/scholar.json` and `_data/papers.json` (written by the update script).
- `assets/`: `home.css` and `home.js` (home page and its scene), `site.css`, `vignette.js` and `pubs.js` (inner pages), the 3D library, the portrait.
- `tools/update_papers.py`: the Google Scholar update.

## Why

The current home page is a portrait, some links and three long paragraphs. Luyang is unhappy with both the look and what it says about the work. The picture in his head is a health system with AI agents moving among its stakeholders, helping each one and helping them work with each other. The page should show that picture, and say the work in three short lines instead of three paragraphs.

The work answers two questions:

- How do we build AI for medicine?
- How will AI change medicine?

## What Luyang decided

These came from him directly and are not open:

- The scene is a real 3D diorama, not a flat illustration or an abstract network.
- He liked the prototype's animation.
- He must be at the top of the page, not at the bottom, and his portrait must be large.
- His title reads "Assistant Professor of Biostatistics and Health Informatics".
- The type should resemble Yale's.
- No "Earlier foundations" section on the home page.
- Each theme shows three to four papers, not a long list.
- Theme 03 also carries the clinician-trust papers. It has no demo videos.
- Theme 02 keeps the light page. Nothing on the site turns dark.
- The forecasting question is not listed under theme 02.
- The new paper "Abandonment of safe medical advice by large language models under patient resistance" (Science, 2026, in press) is added.
- The other pages follow the style of the home page and have animated elements of their own. Same style, but not the same content or elements from page to page.

## Goals

1. A home page that shows who Luyang is, the two questions, three themes and an animated 3D health system, all visible without scrolling in a laptop browser window from 1280×650 upward.
2. Clicking a theme re-stages the same scene and opens that theme's questions and papers.
3. Publications, Bootcamp and Join look like they belong to the same site as the home page. Teaching and Services were deleted at Luyang's request (2026-11-25); `/teaching/` and `/services/` no longer exist.
4. One list of papers feeds both the home page and the Publications page, and it follows Luyang's Google Scholar profile without anyone editing the site.
5. Works on a phone. Still readable with no WebGL, with JavaScript off, and with reduced motion on.

## Non-goals

- Rewriting the text of Bootcamp or Join. Only the sentences that name the three research directions change, so they match the new headlines.
- Touching `ces-eval/` or `rexplain_slides.html`.
- A dark palette anywhere on the site.
- Clicking individual stakeholders or buildings for more detail.
- Analytics, a CMS, or any build tooling beyond Jekyll.

## Anti-goals

The build has failed, even if it works, when any of these is true:

- Luyang's name and face are not in the first screen.
- The three themes or their papers cannot be read without interacting with the 3D scene.
- The scene makes the page slow to show text, hijacks scrolling, or drains a laptop while sitting in a background tab.
- A paper is attributed wrongly, or the home page and Publications page disagree about a paper.
- The scene reads as decoration: a visitor cannot tell what the lights, the people and the three states stand for.

## Constraints

- The site is a GitHub Pages user site (`LLYXC.github.io`, served at `luyangluo.com`), built by Jekyll on push to `master`, with no plugins or themes. Every page is a self-contained HTML file with `layout: null` and its own `permalink`. The permalinks must not change: `/`, `/publications/`, `/bootcamp/`, `/join/`. (`/teaching/` and `/services/` were deleted with their pages.)
- `master` is the live site. Work happens on a branch. Nothing is committed or pushed until Luyang asks.
- Jekyll is not installed on this machine (system Ruby 2.6, Bundler 1.17, a `Gemfile` pinned to Jekyll 3.9.5 with a lock file, no `vendor/`). Previewing the real build needs `bundle install --path vendor/bundle` once, which downloads gems and needs Luyang's go-ahead.
- Luyang maintains the site by hand. Adding a paper has to be one small edit in one obvious place.
- `docs/` and `tools/` are excluded in `_config.yml`, so this document and the update script are never published.

## Approaches

1. **One shared page frame and one paper list, built by Jekyll. Chosen.** A layout holds the head, menu and footer. A data file holds the papers. The home page's theme lists and the Publications page are both generated from it at build time. The output is plain HTML that search engines and Scholar can read. Cost: local preview needs Jekyll, and a typo in the data file fails the build (GitHub keeps serving the last good build).
2. **Shared stylesheet only, pages stay hand-written.** No tooling. Rejected because the menu would be copied into six files and papers would live in two places, or be drawn by script in the browser where crawlers do not see them.
3. **Rebuild on a front-end framework.** Better tooling for 3D. Rejected because it replaces "edit a file and push" with a Node build and a deploy pipeline, for six pages.

Luyang left the how to Claude; this choice is Claude's.

## Shared style

Taken from the prototype. Values are in its `:root` block.

- **Palette.** Warm off-white page (`#f5f2ea`), near-black ink (`#14202e`), Yale blue (`#00356B`) for links and the second headline line, amber (`#e39a14`) for numbering, markers and everything that stands for an AI agent. Hairline rules instead of cards and shadows.
- **Type.** Cardo for the name, headlines, theme titles and paper titles; headlines are set in the regular weight, as Yale sets them. Libre Franklin for everything else. Yale's own faces, YaleNew and Mallory, are licensed and cannot be shipped from here. Cardo is drawn from the same 1495 Aldine type as the Yale typeface, and Libre Franklin is the closest free relative of Mallory. If Luyang supplies Yale's web font files, they replace these two. The choice of substitutes is Claude's.
- **Menu.** Home, Publications, Bootcamp, Join, right-aligned, sticky, with an underline on the current page. The inner pages show the menu alone: no portrait and no name at its left. Luyang wants both on the home page only (2026-11-24). The menu's Home link is the way back.
- **Footer.** "© Luyang Luo · Last updated <month year>", as today.
- **Voice.** The home page says "we", as Luyang's brief does. The other pages keep "I". This is Claude's call.

The Tailwind and Feather-icons CDN links, and the dead menu and Swup script at the bottom of each page, go away. Page bodies are rewritten as plain semantic HTML styled by the shared stylesheet.

## Home page

### Layout

Desktop, two columns:

```
┌──────────────────────────────────────────────────────────────────┐
│                               Home  Publications  Bootcamp  Join │
├───────────────────────────┬──────────────────────────────────────┤
│ (o) Luyang Luo            │ ● Each light is an AI agent.         │
│     Assistant Professor…  │                                      │
│     Scholar · Yale · …    │            3D health system          │
│                           │        (stays in view while the      │
│ How do we build AI for    │         left column scrolls)         │
│ medicine?                 │                                      │
│ How will AI change        │                                      │
│ medicine?                 │                                      │
│                           │                                      │
│ 01 Build AI that does…  > │                                      │
│ 02 Know before we…      > ├ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┤
│ 03 Wire AI into the…    > │  [step chips, theme 01]  caption     │
└───────────────────────────┴──────────────────────────────────────┘
```

Phone, one column in this order: identity, scene, headline, the three themes. Once the reader scrolls to it, the scene pins under the menu, so tapping a theme re-stages a scene that is still in view. The page scrolls normally beneath it. The pinned block is as tall as the scene needs at that width plus its caption, and never more than about half the window (at least 300px). In a window under about 560px tall there is no room to pin it and still read, so it scrolls away with the page. This is Claude's call.

Short laptop windows. The left column must fit the window, so things give way in this order as the window gets shorter:

1. Spacing tightens and the headline gets smaller (below about 860px of height).
2. The portrait shrinks from 150px, but never below about 108px (below about 740px).
3. The one-line descriptions of the themes disappear (below about 670px, or below about 800px when the window is also narrower than about 1180px, where the left column is at its narrowest).

The prototype does this and fits at 1000×700, 1280×650, 1280×720, 1366×650, 1536×730, 1440×780, 1440×900 and 1920×1000. The order is Claude's call: Luyang asked for a large portrait, so it is the last thing to shrink before text is removed.

### Copy

- Identity: a round portrait about 150px across on a laptop and about 110px on a phone, "Luyang Luo", "Assistant Professor of Biostatistics and Health Informatics", "Yale University", and links to Scholar, Yale profile, GitHub, LinkedIn and X.
- Headline: "How do we build AI for medicine?" then, in blue, "How will AI change medicine?"
- No summary sentence under the headline (Claude removed it to make room for the identity block; Luyang has seen this).

### The three themes

In the overview the themes are three numbered rows, each a headline and one line. Choosing one replaces the rows with a strip of chips (All, 01 Capability, 02 Evaluation, 03 Deployment) and one panel under it: the theme's headline and one line, its questions, its papers, then a "More in publications" link to the Publications page. All returns to the three rows. `/#build`, `/#know` and `/#wire` open a theme directly.

The rule behind this, which Luyang set on 2026-11-24: moving between themes must never need scrolling. The first prototype opened each row in place, so an open theme pushed the others off-screen and closing it moved the page again. So:

- The short names are Luyang's choice (2026-11-24); the earlier Build, Know and Wire read as slogans. The page addresses keep the old words for now: `/#build`, `/#know`, `/#wire`.
- When the strip is narrow (a phone, or the left column of a small laptop window) the chips drop their numbers, then tighten, so they stay on one row.
- The chips stay in view while the panel scrolls: pinned under the menu on a laptop, and under the pinned scene on a phone.
- Switching theme leaves the chips where they are. If the reader is part-way down one theme's papers, the next theme starts from its top.
- With JavaScript off there are no chips, and all three panels show in full.

| | Headline | One line |
|---|---|---|
| 01 | Build AI that does clinical work | Whole workflows, not single predictions. |
| 02 | Know before we deploy | Simulators and benchmarks that show how AI behaves, fails and holds up. |
| 03 | Wire AI into the health system | With every stakeholder and between them, monitored after launch. |

Questions (Luyang's own, except the one marked):

- **01:** How good could the AI be? · Can it carry a whole clinical workflow, not just a diagnosis? *(Claude's, from Luyang's description)*
- **02:** What will happen before I deploy this AI? · How robust should it be, and what are its failure modes? · Can we simulate the healthcare system?
- **03:** How will new interactions develop between AI and humans, and among AIs? · After deployment, how do we monitor AI systems?

Papers on the home page, four per theme. The selection and order are Claude's; Luyang chose the count.

- **01:** Asclepius (EMNLP 2026) · Generalist–Specialist Collaboration (Nature Biomedical Engineering 2026) · Large model for breast cancer from multiparametric MRI (Nature Communications 2025) · Open-ended clinical text generation with reinforcement learning (CHIL 2026)
- **02:** Clinical Environment Simulator (Nature Medicine 2026) · Abandonment of safe medical advice under patient resistance (Science 2026, in press, no link yet) · ReXGroundingCT (NEJM AI 2026) · LLMs as emergency department revisit predictors (PSB 2026)
- **03:** ReXplain (AAAI AIMedHealth 2025) · ED-Explain (PSB 2026) · Explainable biomedical foundation model (Nature Biomedical Engineering 2026) · Continual learning for endotracheal tube placement (NEJM AI 2026)

### The scene

Port the prototype's scene. What it contains:

- **Place.** A low-poly health system on a platform: hospital with an emergency entrance, lab, imaging centre, health-system office, clinic, pharmacy, a home, trees, a central plaza.
- **People.** Nine pawn-shaped stakeholders, each with a label: patient, family, physician, nurse, radiologist, lab scientist, pharmacist, primary care, administrator.
- **Labels never overlap.** Each label sits just above its figure. When two would collide, which happens whenever the scene is drawn small, the one further back is lifted clear and keeps a thin stem down to its figure. Failure tags follow the same rule, and no label leaves the stage.
- **AI.** A glowing amber core above the plaza, and amber lights that travel along arcs between stakeholders. Amber always means AI.
- **Camera.** Fixed three-quarter view with a slow sway. Dragging turns the scene. No zoom, and vertical swipes on a phone still scroll the page.
- **Caption.** The caption and the step chips sit in their own band under the scene, never on top of it, and the band keeps one height in every state so the scene does not resize when a theme changes. When the stage is narrower than about 680px the nine step chips become dots with only the current step named. On a stacked page, or a stage that narrow, the two counters of state 02 move from the scene's top corner into the same band.

The four states:

| State | What changes | Caption |
|---|---|---|
| Overview | A few agents on a few arcs. | A health system, with AI agents moving through it. |
| 01 Capability | One larger agent traces one case in order: arrival, triage, exam, labs, imaging, diagnosis, treatment, discharge, follow-up. Step chips light as it goes; the person it is with is highlighted. Loops. | One agent carries one case from arrival to follow-up, working with each person along the way. |
| 02 Evaluation | The page stays light. The world becomes a line drawing in Yale blue on a faint grid, like a blueprint on paper; the people and the AI core stay solid. Many agents run fast. Counters for simulated encounters and failures surfaced. Red rings and short failure tags appear at stakeholders. | The same system, as a simulation. Thousands of encounters are replayed so failures surface before a patient meets them. |
| 03 Deployment | Every arc is on, more agents, and a ring sweeps outward from the plaza. | Deployed. Agents link every stakeholder to every other, and a monitoring pulse keeps watch. |

Failure tags in state 02 (Claude's wording, drawn from Luyang's papers): Missed a critical action · Agreed with a wrong suggestion · Treatment came late · Finding not grounded in the image · Drifted from instructions · Confident and unsafe.

Beyond the prototype, as built:

- **The 3D library** (three.js, pinned at r160) is served from the site itself, not a CDN, so the scene does not depend on a third party that is unreliable in some countries. Claude's call.
- **Idle cost.** Nothing is drawn while the scene is off-screen or the tab is hidden.
- **Paper lists are in the page.** Jekyll writes the themes and their papers into the HTML, so they do not wait for a script.

Luyang asked on 2026-11-25 for the animation to be smoother and lighter. What was done, and the rules to keep if the scene is changed:

- **Shadows are drawn once.** Nothing that casts a shadow moves, so the shadow map is rendered when the scene first appears, not every frame. Anything added later that moves must not cast a shadow, or the shadow must be refreshed when it moves.
- **A pixel budget, not a fixed 2x.** The canvas is drawn at no more than about 1.6 million pixels: full sharpness on a phone or a small stage, a little under 2x on a large laptop stage. On a 1440×900 retina window that is 1.6 instead of 2.7 million pixels.
- **Labels are measured only when their size can change** (a resize, the fonts arriving, the phone breakpoint, new failure text), and the stems are moved with transforms, so the label pass no longer makes the browser lay the page out again every frame.
- **Blueprint outlines are built in idle time** after the scene is up, since only theme 02 shows them.
- **Fixed things have fixed transforms,** and the frame loop creates no throwaway arrays.

Measured on Chrome's software renderer at 1440×900, 2x, before and after: 125 to 96 ms a frame in the overview, 163 to 115 in theme 02, 143 to 113 in theme 01. The software renderer is far slower than a real graphics card, so read these as the relative gain only; it has not been timed on a real GPU.


## Publications page

Generated from the paper data file. Luyang changed its brief on 2026-11-24: every paper on his Google Scholar profile, kept current automatically, with a search and filter bar, and without the 01–03 theme categories. The earlier plan was a hand-picked "Selected Publications" list of 37 with theme chips.

- **Which papers.** Every entry on the Scholar profile (73 on 2026-11-24: papers, preprints, one patent application and the PhD thesis), plus any hand-written entry that Scholar does not list yet. Today that is one, the Science paper, which is in press. That makes 74.
- **Each entry.** Title as a link, authors with Luyang's name in bold, venue and year, any note such as "Oral Presentation" or "Best Paper", the citation count when it is above zero, and any extra links such as Code, Dataset, Video or Project page.
- **Hand-written entries win.** The 35 entries on today's page, plus Asclepius and the Science paper, keep Luyang's own wording: full author list, `*` for co-first authorship, venue name, notes and extra links. Scholar supplies only their citation count. The other entries come from Scholar and OpenAlex as they are.
- **Long author lists.** A list of more than 14 names shows the first eight, the last two and Luyang, with "…" for the gaps. Where no full list is known (five entries today), Scholar's shortened one is shown.
- **Order.** Newest first, grouped under year headings. Inside a year, Scholar's own order.
- **Search and filter bar.** A box above the list, modelled on the one Luyang pointed to:
  - Sort by: year newest first (default), year oldest first, title A to Z. Year headings show only for the two year orders. There is no sort by citations; Luyang removed it (2026-11-24).
  - Year: all, or one year.
  - Min citations: all, 10+, 50+, 100+.
  - Venue: all, or one venue, each with its paper count, most papers first.
  - Search: every word typed must appear in the title, the authors or the venue.
  - Under them, "Showing N of M publications" and, once anything is narrowed, "Clear filters". No match shows a one-line message.
- **Venue names.** Scholar's venue line carries volume, pages and the year, and names the same venue several ways ("TMI 2025", "IEEE transactions on medical imaging 39 (11)"). The filter needs one name per venue, so a short table maps known fragments to a name; anything unknown has its numbers stripped and is used as it is. The table is in `tools/update_papers.py`.
- **Header.** "Publications", the Google Scholar link and "* denotes co-first authorship". The page does not say when the list was last refreshed; Luyang removed that line (2026-11-24).
- **No theme chips and no animated object.** The page is a single centred column. Themes live on the home page only.
- **JavaScript off.** The whole list shows, newest first under year headings. The bar is hidden, because it cannot work.

### Keeping the list current

`tools/update_papers.py` does the refresh. It reads the profile's list pages (which papers exist, title, venue line, year, citations), keeps everything already known about each paper, and for a new paper looks up the full author list and a link on OpenAlex. Tested on 2026-11-24 from Luyang's laptop: 73 papers, and the citation total matches the 3,361 Scholar shows.

In production a scheduled GitHub Action runs it once a week and commits the data file when it changed; the commit rebuilds the site. Three things the builder must know:

- **Scholar has no API and blocks scripts unevenly.** The list pages answered a plain request from a home connection. The per-paper pages, which hold the full author list, redirected to a challenge, which is why authors come from OpenAlex. GitHub's servers may be refused where a laptop is not. This has not been tried yet and is the first thing to test.
- **A bad answer changes nothing.** If Scholar returns no papers, or far fewer than last time, the script stops with an error and the last good list stays on the site. A failed run must fail the Action visibly, not publish an empty page.
- **If GitHub's servers are refused,** the fallbacks are, in order: run the same script from Luyang's laptop on a schedule or by hand; or pay for a Scholar scraping service (SerpAPI has an author endpoint) and keep its key in the repository's secrets. Luyang decides if it comes to that.

What the update cannot know stays hand-written and is laid over the Scholar entry by title: co-first marks, notes, extra links, a preferred title or venue name, and papers Scholar does not list yet. One paper's title differs between the site and Scholar ("Medical Image Debiasing by Learning Adaptive Agreement from a Biased Council" on the site, "Mitigating medical dataset bias by learning adaptive agreement from a biased council" on Scholar); it is matched by an explicit entry, and the site's title is shown until Luyang says otherwise.

Theme tags, used by the home page only (Claude's sorting):

- **01 Capability:** Asclepius · clinical text generation with reinforcement learning · Generalist–Specialist Collaboration · universal grounded foundation model · explainable biomedical foundation model · breast MRI large model · generative tumor synthesis
- **02 Evaluation:** Clinical Environment Simulator · Science paper · sycophancy in medical conversations · ReXGroundingCT · text-prompted segmentation models struggle · emergency department revisit predictors
- **03 Deployment:** ReXplain · ED-Explain · continual learning for endotracheal tubes · explainable biomedical foundation model · interpretable ovarian cancer model · MICA

Asclepius is not on the site today, so its entry is assembled from outside sources and needs Luyang's confirmation before it ships:

- Authors, from OpenAlex with one name cleaned up: Grace Chang Yuan, Xiaoman Zhang, Sung Eun Kim, Luyang Luo, Pranav Rajpurkar. No co-first marks are recorded.
- Venue: Luyang's Scholar profile says "EMNLP 2026". The paper's DOI is a Findings of EMNLP one, which is a separate venue label.
- Link: `https://doi.org/10.18653/2026.findings-emnlp.2094`, which resolves.

The Science paper's authors, as Luyang gave them: Aakash Reddy, Taeil Matthew Kim, Liam McCoy, Ashwin Ramaswamy, Xucheng Wang, Brian Eiss, Anita Ganti, Nonyerem Acholonu-Fomin, Alexander Fortenko, Sowmya Sanapala, Sung Eun Kim, Shruti Gupta, Girish Nadkarni, Nigam H. Shah, Eric Topol, Luyang Luo, Pranav Rajpurkar. The manuscript marks Aakash Reddy with `*`; on this site `*` means co-first author, so it is left off until Luyang says what it means.

## Bootcamp and Join

Same words, new frame: the shared menu, serif headings, hairline rules between sections, lists as plain lists, and the "Apply Now" link as the one filled button.

## Animated elements on the inner pages

Every inner page except Publications repeats the home page's arrangement: text on the left, and on the right a small animated 3D object that stays in view while the text scrolls. On a phone the object sits above the text and scrolls away with it. It can be turned by dragging.

The rule Luyang set: same style, different content. Each page has its own object, drawn in the home scene's style (the same palette, light, low-poly shapes and amber accent). Nothing from the home scene is repeated on an inner page: no pawns, no AI core, no travelling agents. No two inner pages share an object.

| Page | Object | What moves | Caption |
|---|---|---|---|
| Bootcamp | A camp: a blue tent labelled "AI track", a coral tent labelled "Medicine track", a fire between them, log seats, a flag, trees. | The fire flickers and throws sparks; the flag sways. | Two tracks, one camp. |
| Join | A three-by-three floor of coloured tiles with the centre missing. Four tiles are labelled Students, Engineers, Clinicians and Researchers. An amber tile labelled "You?" hovers over the gap. | The amber tile settles into the gap, the floor ripples, and it lifts again. | One piece is missing. |

Two quieter touches apply to every inner page: sections and publication entries fade up as they scroll into view, and a publication entry shows an amber marker at its left edge on hover. Both are skipped under reduced motion.

The objects follow the same rules as the home scene: text first, a still image when there is no WebGL, no motion under reduced motion, and no rendering while off-screen or in a hidden tab. The choice of these two objects is Claude's; Luyang has seen them in the prototype.

## The paper data file

Two layers. The first is the Scholar list, written only by `update_papers.py`: for each paper its Scholar id, title, authors, venue line, year, citation count and links. The second is hand-written and small: one entry for each paper that needs something Scholar cannot give, holding any of a preferred title, an author string with co-first marks, a venue name, a status such as "in press", notes, extra links (label and address), the themes it belongs to and, for the twelve home-page papers, which theme and position it holds there. A hand-written entry with no match on Scholar is a paper of its own. A second small file holds the three themes: number, headline, one line and questions.

Each paper has one title, shown with the same wording and capitals on both pages. A paper may also carry a short venue name, such as "PSB" or "CHIL", which the home page uses in place of the full one. Claude's call.

A new paper appears on the Publications page by itself, within a week of reaching Scholar. It needs a hand-written entry only to gain co-first marks, notes or extra links, or to appear on the home page.

## Checks before calling it done

- The Jekyll build succeeds and every permalink above still resolves. `/ces-eval/` and `/rexplain_slides.html` are unchanged.
- Screenshots at laptop and phone width of every page, and of the home page in all four states, with no script errors and no sideways scroll.
- Every one of the 35 existing papers appears on the new Publications page with the same title, authors, venue, notes and links as before. Check this by comparing against the current page, not by eye.
- Every paper on the Scholar profile appears exactly once. No hand-written entry is matched to two Scholar entries, and none sits beside a Scholar duplicate of itself under another title.
- The weekly update has run on GitHub at least once, and a run that is refused leaves the list untouched and the Action red.
- Each filter, each sort order and the search narrow the list as described, and "Showing N of M" is right.
- Five existing entries list fewer authors than OpenAlex records (ReXGroundingCT, the explainable foundation model, the breast imaging survey, the debiasing paper, the super-resolution segmentation paper). They are carried over unchanged and listed for Luyang to look at.
- Every paper link answers. Papers with no link are listed for Luyang.
- With JavaScript off, and separately with WebGL off, the home page shows the identity, headline, all three themes with their papers, and the still image.
- The scene stops rendering when scrolled away or when the tab is hidden.

## Left to the builder

File and folder names, how the stylesheet and scripts are split, how the still image is produced, how label hiding is done, the page title and description text, icon handling, and the exact responsive breakpoints.

## Closed on 2026-11-25, before deployment

Luyang asked for the open points to be settled before the site went live.

- **Still image.** `assets/scene-still.webp` is a still of the overview, taken at the scene's own proportions (34.6 by 23.2 world units) with the camera sway off, so it sits exactly where the live scene draws itself. The stage shows it until the scene's first frame, and keeps it where the scene cannot run. If the scene's buildings or colours change, capture it again.
- **Themes do not depend on the scene.** `assets/home.js` runs the rows, chips and panels and has no 3D code; it loads `assets/scene.js` afterwards and tells it about each change of theme. So the themes work before the 3D library arrives and when there is no WebGL. Under the still image the caption stays on the overview, and the step chips, counters and "drag to turn" hint are hidden. Checked three ways in Chrome: normal, WebGL disabled, scripts disabled.
- **The import map comes first.** The line that says where "three" lives is in the page head, before the preload hints. Placed after them, the preloaded scene script failed to find the library.
- **Old addresses.** `404.html` answers any address that no longer exists, in the site's style, with links to the four pages. A search of GitHub code and of the web found nothing that links to the deleted images or to `/teaching/` and `/services/`, so none of those files was kept. A search cannot prove there is none: an image embedded from this site somewhere else would now be broken.
- **Weekly update.** `.github/workflows/update-papers.yml` runs the update script every Monday and by hand. It commits to `master` only when the list changed, then asks GitHub for a Pages build, because a push made by a workflow does not reliably start one.

## Not done

- **Reduced motion** stops the camera sway only. The agents still travel.
- **Labels do not hide behind buildings.**
- **The footer** reads "© Luyang Luo"; the "Last updated" part was not carried over.
