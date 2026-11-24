# Site redesign: animated home page and a shared style for every page

Date: 2026-11-24
Status: draft, waiting for Luyang's approval

Reference material, in the folder next to this file (`2026-11-24-site-redesign/`):

- `prototype/` — the throwaway prototype Luyang reacted to: the home page (`index.html`), restyled Publications, Bootcamp and Join pages, and their shared `site.css`. It is the visual reference for layout, palette, type, the scene and its four states. Serve the folder with a local web server; its links are root-relative.
- `build_proto.py` and `gen_papers.py` — the throwaway scripts that produced the prototype's pages and paper lists from the live site. They show how each existing publication entry was parsed.
- `papers-source.json` — every entry on Luyang's Google Scholar profile (73), with full author lists and links from OpenAlex, theme tags, and whether the paper is on the site today.

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
3. Publications, Bootcamp, Join, Teaching and Services look like they belong to the same site as the home page.
4. One list of papers feeds both the home page and the Publications page.
5. Works on a phone. Still readable with no WebGL, with JavaScript off, and with reduced motion on.

## Non-goals

- Rewriting the text of Bootcamp, Join, Teaching or Services. Only the sentences that name the three research directions change, so they match the new headlines.
- Touching `ces-eval/` or `rexplain_slides.html`.
- Adding Teaching and Services to the menu. They are unlinked today and stay unlinked.
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

- The site is a GitHub Pages user site (`LLYXC.github.io`, served at `luyangluo.com`), built by Jekyll on push to `master`, with no plugins or themes. Every page is a self-contained HTML file with `layout: null` and its own `permalink`. The permalinks must not change: `/`, `/publications/`, `/bootcamp/`, `/join/`, `/teaching/`, `/services/`.
- `master` is the live site. Work happens on a branch. Nothing is committed or pushed until Luyang asks.
- Jekyll is not installed on this machine (system Ruby 2.6, Bundler 1.17, a `Gemfile` pinned to Jekyll 3.9.5 with a lock file, no `vendor/`). Previewing the real build needs `bundle install --path vendor/bundle` once, which downloads gems and needs Luyang's go-ahead.
- Luyang maintains the site by hand. Adding a paper has to be one small edit in one obvious place.
- `docs/` is now excluded in `_config.yml` so this document and the prototype are never published.

## Approaches

1. **One shared page frame and one paper list, built by Jekyll. Chosen.** A layout holds the head, menu and footer. A data file holds the papers. The home page's theme lists and the Publications page are both generated from it at build time. The output is plain HTML that search engines and Scholar can read. Cost: local preview needs Jekyll, and a typo in the data file fails the build (GitHub keeps serving the last good build).
2. **Shared stylesheet only, pages stay hand-written.** No tooling. Rejected because the menu would be copied into six files and papers would live in two places, or be drawn by script in the browser where crawlers do not see them.
3. **Rebuild on a front-end framework.** Better tooling for 3D. Rejected because it replaces "edit a file and push" with a Node build and a deploy pipeline, for six pages.

Luyang left the how to Claude; this choice is Claude's.

## Shared style

Taken from the prototype. Values are in its `:root` block.

- **Palette.** Warm off-white page (`#f5f2ea`), near-black ink (`#14202e`), Yale blue (`#00356B`) for links and the second headline line, amber (`#e39a14`) for numbering, markers and everything that stands for an AI agent. Hairline rules instead of cards and shadows.
- **Type.** Cardo for the name, headlines, theme titles and paper titles; headlines are set in the regular weight, as Yale sets them. Libre Franklin for everything else. Yale's own faces, YaleNew and Mallory, are licensed and cannot be shipped from here. Cardo is drawn from the same 1495 Aldine type as the Yale typeface, and Libre Franklin is the closest free relative of Mallory. If Luyang supplies Yale's web font files, they replace these two. The choice of substitutes is Claude's.
- **Menu.** Home, Publications, Bootcamp, Join, right-aligned, sticky, with an underline on the current page. On every page except the home page, the left of the menu shows a small portrait and "Luyang Luo", linking home.
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
│ 01 Build AI that does…  v │                                      │
│ 02 Know before we…      v │        [step chips, theme 01]        │
│ 03 Wire AI into the…    v │        one-line caption              │
└───────────────────────────┴──────────────────────────────────────┘
```

Phone, one column in this order: identity, scene, headline, the three themes. Once the reader scrolls to it, the scene pins under the menu at about 42% of the screen height, so tapping a theme re-stages a scene that is still in view. The page scrolls normally beneath it. This is Claude's call.

Short laptop windows. The left column must fit the window, so things give way in this order as the window gets shorter:

1. Spacing tightens and the headline gets smaller (below about 860px of height).
2. The portrait shrinks from 150px, but never below about 108px (below about 740px).
3. The one-line descriptions of closed themes disappear (below about 600px).

The prototype does this and fits at 1280×720, 1366×650, 1536×730, 1440×780, 1440×900 and 1920×1000. The order is Claude's call: Luyang asked for a large portrait, so it is the last thing to shrink before text is removed.

### Copy

- Identity: a round portrait about 150px across on a laptop and about 110px on a phone, "Luyang Luo", "Assistant Professor of Biostatistics and Health Informatics", "Yale University", and links to Scholar, Yale profile, GitHub, LinkedIn and X.
- Headline: "How do we build AI for medicine?" then, in blue, "How will AI change medicine?"
- No summary sentence under the headline (Claude removed it to make room for the identity block; Luyang has seen this).

### The three themes

Each is a numbered row that opens to show questions, then papers, then a "More in publications" link that goes to the Publications page with that theme's filter on. Opening one closes the others. Clicking the open one returns to the overview. `/#build`, `/#know` and `/#wire` open a theme directly.

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
- **AI.** A glowing amber core above the plaza, and amber lights that travel along arcs between stakeholders. Amber always means AI.
- **Camera.** Fixed three-quarter view with a slow sway. Dragging turns the scene. No zoom, and vertical swipes on a phone still scroll the page.

The four states:

| State | What changes | Caption |
|---|---|---|
| Overview | A few agents on a few arcs. | A health system, with AI agents moving through it. |
| 01 Build | One larger agent traces one case in order: arrival, triage, exam, labs, imaging, diagnosis, treatment, discharge, follow-up. Step chips light as it goes; the person it is with is highlighted. Loops. | One agent carries one case from arrival to follow-up, working with each person along the way. |
| 02 Know | The page stays light. The world becomes a line drawing in Yale blue on a faint grid, like a blueprint on paper; the people and the AI core stay solid. Many agents run fast. Counters for simulated encounters and failures surfaced. Red rings and short failure tags appear at stakeholders. | The same system, as a simulation. Thousands of encounters are replayed so failures surface before a patient meets them. |
| 03 Wire | Every arc is on, more agents, and a ring sweeps outward from the plaza. | Deployed. Agents link every stakeholder to every other, and a monitoring pulse keeps watch. |

Failure tags in state 02 (Claude's wording, drawn from Luyang's papers): Missed a critical action · Agreed with a wrong suggestion · Treatment came late · Finding not grounded in the image · Drifted from instructions · Confident and unsafe.

What production needs that the prototype lacks:

- **Text first.** The page's text and a still image of the overview show immediately. The 3D library loads afterwards and the scene replaces the still.
- **No WebGL or no JavaScript.** The still image stays. All three themes are open and readable.
- **Reduced motion.** No camera sway and no travelling agents; states still change when a theme is opened.
- **Idle cost.** Rendering stops when the scene is off-screen or the tab is hidden.
- **Labels.** A label hides when its person is behind a building. On phones, labels are smaller and the overview shows none.
- **The 3D library** (three.js, pinned at r160) is served from the site itself, not a CDN, so the scene does not depend on a third party that is unreliable in some countries. Claude's call.

## Publications page

Generated from the paper data file.

- **Which papers.** The 35 already on the page, kept as Luyang selected them, plus the two home-page papers that are missing: Asclepius and the Science paper. That is 37. Scholar lists 20 more that fit a theme (see `papers-source.json`, `themes` set and `on_site_today` false); they are not added. This is Claude's call, to respect the page's "Selected" curation and avoid unverified author lists.
- **Each entry.** Title as a link (plain text when there is no link yet), authors with Luyang's name in bold and `*` for co-first authorship, venue and year, any note such as "Oral Presentation" or "Best Paper", and any extra links such as Code, Dataset, Video or Project page. All of this is carried over from the current page as it stands.
- **Order.** Newest first, grouped under year headings.
- **Filter.** Chips for All, 01 Build, 02 Know and 03 Wire. A paper can carry more than one theme. Papers with no theme appear only under All. With JavaScript off, everything shows. `/publications/#know` arrives with that filter on.
- **Header.** "Selected Publications", the Google Scholar link, and "* denotes co-first authorship", as today.
- **Animated object.** A desk with three stacks of papers, one per theme, each as tall as its paper count. Clicking a stack, or its label, sets the filter; the chosen stack lifts and turns amber. It mirrors the chips and does not replace them.

Theme tags for the 37 (Claude's sorting):

- **01 Build:** Asclepius · clinical text generation with reinforcement learning · Generalist–Specialist Collaboration · universal grounded foundation model · explainable biomedical foundation model · breast MRI large model · generative tumor synthesis
- **02 Know:** Clinical Environment Simulator · Science paper · sycophancy in medical conversations · ReXGroundingCT · text-prompted segmentation models struggle · emergency department revisit predictors
- **03 Wire:** ReXplain · ED-Explain · continual learning for endotracheal tubes · explainable biomedical foundation model · interpretable ovarian cancer model · MICA

Asclepius is not on the site today, so its entry is assembled from outside sources and needs Luyang's confirmation before it ships:

- Authors, from OpenAlex with one name cleaned up: Grace Chang Yuan, Xiaoman Zhang, Sung Eun Kim, Luyang Luo, Pranav Rajpurkar. No co-first marks are recorded.
- Venue: Luyang's Scholar profile says "EMNLP 2026". The paper's DOI is a Findings of EMNLP one, which is a separate venue label.
- Link: `https://doi.org/10.18653/2026.findings-emnlp.2094`, which resolves.

The Science paper's authors, as Luyang gave them: Aakash Reddy, Taeil Matthew Kim, Liam McCoy, Ashwin Ramaswamy, Xucheng Wang, Brian Eiss, Anita Ganti, Nonyerem Acholonu-Fomin, Alexander Fortenko, Sowmya Sanapala, Sung Eun Kim, Shruti Gupta, Girish Nadkarni, Nigam H. Shah, Eric Topol, Luyang Luo, Pranav Rajpurkar. The manuscript marks Aakash Reddy with `*`; on this site `*` means co-first author, so it is left off until Luyang says what it means.

## Bootcamp, Join, Teaching, Services

Same words, new frame: the shared menu, serif headings, hairline rules between sections, lists as plain lists, and the "Apply Now" link as the one filled button.

## Animated elements on the inner pages

Every inner page repeats the home page's arrangement: text on the left, and on the right a small animated 3D object that stays in view while the text scrolls. On a phone the object sits above the text and scrolls away with it. It can be turned by dragging.

The rule Luyang set: same style, different content. Each page has its own object, drawn in the home scene's style (the same palette, light, low-poly shapes and amber accent). Nothing from the home scene is repeated on an inner page: no pawns, no AI core, no travelling agents. No two inner pages share an object.

| Page | Object | What moves | Caption |
|---|---|---|---|
| Publications | A desk with three stacks of papers, a lamp, a mug and a pen. The stacks are the theme filter (above). | A sheet drifts down onto a stack now and then; the lamp glows. | Three stacks, one per theme. Click one to filter. |
| Bootcamp | A camp: a blue tent labelled "AI track", a coral tent labelled "Medicine track", a fire between them, log seats, a flag, trees. | The fire flickers and throws sparks; the flag sways. | Two tracks, one camp. |
| Join | A three-by-three floor of coloured tiles with the centre missing. Four tiles are labelled Students, Engineers, Clinicians and Researchers. An amber tile labelled "You?" hovers over the gap. | The amber tile settles into the gap, the floor ripples, and it lifts again. | One piece is missing. |

Teaching and Services get the same two-column frame and an object of their own under the same rule. What those two objects are is left to the builder.

Two quieter touches apply to every inner page: sections and publication entries fade up as they scroll into view, and a publication entry shows an amber marker at its left edge on hover. Both are skipped under reduced motion.

The objects follow the same rules as the home scene: text first, a still image when there is no WebGL, no motion under reduced motion, and no rendering while off-screen or in a hidden tab. The choice of these three objects is Claude's; Luyang has seen them in the prototype.

## The paper data file

One entry per paper. Fields: title, authors (one string), venue, year, an optional status such as "in press", an optional link, optional extra links (label and address), optional notes, the themes it belongs to, and, for the twelve home-page papers, which theme and position it holds there. A second small file holds the three themes: number, headline, one line and questions.

Each paper has one title, shown with the same wording and capitals on both pages. A paper may also carry a short venue name, such as "PSB" or "CHIL", which the home page uses in place of the full one. Claude's call.

Adding a paper is copying one entry and editing it.

## Checks before calling it done

- The Jekyll build succeeds and every permalink above still resolves. `/ces-eval/` and `/rexplain_slides.html` are unchanged.
- Screenshots at laptop and phone width of every page, and of the home page in all four states, with no script errors and no sideways scroll.
- Every one of the 35 existing papers appears on the new Publications page with the same title, authors, venue, notes and links as before. Check this by comparing against the current page, not by eye.
- Five existing entries list fewer authors than OpenAlex records (ReXGroundingCT, the explainable foundation model, the breast imaging survey, the debiasing paper, the super-resolution segmentation paper). They are carried over unchanged and listed for Luyang to look at.
- Every paper link answers. Papers with no link are listed for Luyang.
- With JavaScript off, and separately with WebGL off, the home page shows the identity, headline, all three themes with their papers, and the still image.
- The scene stops rendering when scrolled away or when the tab is hidden.

## Left to the builder

File and folder names, how the stylesheet and scripts are split, how the still image is produced, how label hiding is done, the page title and description text, icon handling, and the exact responsive breakpoints.
