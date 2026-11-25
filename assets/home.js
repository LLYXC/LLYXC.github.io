// The home page's three themes: rows, chips and panels. This file works on its own, so the themes can be read and switched
// before the 3D scene has loaded, and when it cannot run at all (no WebGL). The scene is scene.js; it is loaded at the end
// of this file and, once it is up, is told about every change of theme.
// Theme keys (build, know, wire) are fixed here, in scene.js and in _data/themes.yml; they are also the addresses /#build, /#know, /#wire.

/* ───────────── page: themes ───────────── */
const root = document.documentElement;
const themesEl = document.getElementById('themes'), tabsEl = document.getElementById('tabs');
let mode = 'overview';
const rows = [...document.querySelectorAll('.item-h')], tabs = [...document.querySelectorAll('.tab')];
function setMode(m){
  mode = m; root.dataset.mode = m;
  tabs.forEach(t=>t.setAttribute('aria-pressed', t.dataset.mode===m));
  history.replaceState(null,'', m==='overview' ? location.pathname : '#'+m);
  // switching while part-way down one theme's papers: start the next theme from its top, just under the chips
  if(m!=='overview'){ const d = themesEl.getBoundingClientRect().top - tabsEl.getBoundingClientRect().top; if(d<-1) window.scrollBy({top:d,behavior:'instant'}); }
  stage(m);
}
let stage = ()=>{}; // replaced by the scene's own setMode once the scene has loaded
// the control just pressed is about to be hidden, so hand keyboard focus to its counterpart
rows.forEach(r=>r.addEventListener('click',()=>{ setMode(r.dataset.mode); tabs.find(t=>t.dataset.mode===r.dataset.mode).focus({preventScroll:true}); }));
tabs.forEach(t=>t.addEventListener('click',()=>{ const was = mode; setMode(t.dataset.mode); if(t.dataset.mode==='overview') (rows.find(r=>r.dataset.mode===was)||rows[0]).focus({preventScroll:true}); }));

setMode(['build','know','wire'].includes(location.hash.slice(1)) ? location.hash.slice(1) : 'overview');

// The scene, after everything above works. If the 3D library does not arrive, or the browser has no WebGL, the import
// fails and the still image of the scene simply stays. The query string is this file's own, so both share one version.
import('./scene.js' + new URL(import.meta.url).search).then(scene=>{ stage = scene.setMode; }).catch(()=>{});
