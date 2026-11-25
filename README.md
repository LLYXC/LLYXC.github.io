# luyangluo.com

Luyang Luo's site. GitHub Pages builds it with Jekyll from `master` and serves it at luyangluo.com. No theme, no plugins.

## Pages

| Address | File | Notes |
|---|---|---|
| `/` | `index.html` | Identity, the two questions, the three themes and the 3D scene. |
| `/publications/` | `publications.html` | Every paper, with search and filters. The list is generated; see below. |
| `/bootcamp/`, `/join/` | `bootcamp.html`, `join.html` | Plain HTML text. Edit the words directly. |
| any address that does not exist | `404.html` | Says the page is gone and links to the four pages above. |
| `/ces-eval/`, `/rexplain_slides.html` | as named | Standalone pages, independent of the rest. The slides page shows `indexpics/ReXplain_presentation.pdf`. |

`_layouts/default.html` holds the head, menu and footer every page shares. `_layouts/page.html` adds the text column and the small 3D object of the inner pages. Styles, scripts and images are in `assets/`.

## Changing things

- **Themes on the home page** (headline, one line, questions, chip name): `_data/themes.yml`.
- **A paper's co-first marks, notes, extra links, preferred title or venue, or its place on the home page**: its entry in `_data/papers_extra.json`, then run `python3 tools/update_papers.py --offline`.
- **A paper that is not on Google Scholar yet**: add an entry to `_data/papers_extra.json`, then run the same command.
- **The home page scene**: `assets/scene.js`. `assets/home.js` runs the themes and works without it. Until the scene has drawn, and wherever it cannot run (no WebGL), the page shows `assets/scene-still.webp`, a still of the overview; if the scene's buildings or colours change, that image should be captured again.
- **The portrait**: replace `assets/portrait.jpg` (shown at up to 150px, so about 480px square is plenty). `assets/portrait-original.png` is the full-size source and is not published.

Do not edit `_data/papers.json` or `_data/scholar.json` by hand; the update script rewrites both.

## Publications and Google Scholar

The Publications page follows the Google Scholar profile. Google Scholar refuses requests from GitHub's servers, so the refresh runs from a Mac, not from GitHub:

- **On a schedule.** `sh tools/install_schedule.sh` sets this Mac to refresh at 10:00 on the 1st and 15th of each month (`--remove` undoes it). If the Mac is asleep then, it runs on waking; if it is off, that run is skipped. A failed run shows a notification, and everything is logged in `~/Library/Logs/luyangluo-site-papers.log`.
- **By hand, any time.** `sh tools/refresh_and_publish.sh`.

Either way the refresh happens in a separate copy of the repository (under `~/Library/Application Support/luyangluo-site/`), and when the list changed it commits `_data/` and pushes to `master`, which rebuilds the site. So `master` can gain a commit without you: pull before you push.

What the refresh does: `tools/update_papers.py` reads the profile page, looks up full author lists for new papers on OpenAlex, lays the hand-written entries over the result and writes `_data/papers.json`, which the pages read. It needs only Python 3. If Scholar refuses the request or returns far fewer papers than before, it stops and changes nothing. The header of the script says more.

## Preview on your own machine

```
bundle install        # once
bundle exec jekyll serve
```

Then open http://127.0.0.1:4000/.

## Files to leave alone

`CNAME` points luyangluo.com at this site. `googleb05fbc276871a0a4.html` and `BingSiteAuth.xml` prove ownership of the site to Google and Bing. `robots.txt` is for search engines.

`docs/superpowers/specs/` holds the design notes for the 2026 redesign.
