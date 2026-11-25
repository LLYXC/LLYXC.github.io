// One small animated object per inner page.
// Same style as the home scene (palette, light, low-poly shapes, amber accent), but each page has its own content:
//   bootcamp     -> a camp: two tents, a fire, a flag
//   join         -> a floor of tiles with one piece missing
import * as THREE from 'three';

export function mount(host, kind, opt = {}) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canvas = document.createElement('canvas'); host.appendChild(canvas);
  const labelsEl = document.createElement('div'); labelsEl.className = 'v-labels'; host.appendChild(labelsEl);
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true }); }
  catch (e) { host.classList.add('v-off'); return null; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene(), cam = new THREE.OrthographicCamera(-1, 1, 1, -1, .1, 200);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xe9dfcc, 2.05));
  const sun = new THREE.DirectionalLight(0xfff3df, 1.9); sun.position.set(-9, 16, 11); sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024); sun.shadow.bias = -.0004; sun.shadow.normalBias = .03;
  Object.assign(sun.shadow.camera, { left: -11, right: 11, top: 11, bottom: -11, near: 1, far: 50 }); scene.add(sun);

  const P = { cream: 0xece6d8, base: 0xd9d1bf, white: 0xfdfcf9, wood: 0xe6d6b8, wood2: 0xc7b28c, blue: 0x00356B, blue2: 0x286DC0, teal: 0x2c93a1, indigo: 0x4f56c4,
    purple: 0x7460b8, slate: 0x56637a, green: 0x3f9a6c, coral: 0xe2725b, peach: 0xf0a27e, amber: 0xe9a52a, tree: 0x7fb596, tree2: 0x9cc7a6, trunk: 0x9c7f63, stone: 0xb7b1a4 };
  const mat = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: .9, flatShading: true, ...o });
  const cache = {}, M = c => cache[c] || (cache[c] = mat(c));
  const add = (geo, m, x, y, z, p = scene, shadow = true) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = shadow; o.receiveShadow = true; p.add(o); return o; };
  const box = (w, h, d, m, x, y, z, p, s) => add(new THREE.BoxGeometry(w, h, d), m, x, y + h / 2, z, p, s);
  const cyl = (r, h, m, x, y, z, p, seg = 24, s) => add(new THREE.CylinderGeometry(r, r, h, seg), m, x, y + h / 2, z, p, s);
  const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  function tree(x, z, s, i) { const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(s); scene.add(g);
    cyl(.1, .5, M(P.trunk), 0, 0, 0, g, 6); add(new THREE.ConeGeometry(.62, 1.25, 7), M(i % 2 ? P.tree : P.tree2), 0, 1.05, 0, g); add(new THREE.ConeGeometry(.45, .9, 7), M(i % 2 ? P.tree2 : P.tree), 0, 1.6, 0, g); }
  const labs = [];
  function lab(text, anchor, cls = '') { const el = document.createElement('div'); el.className = 'lab ' + cls; el.textContent = text; labelsEl.appendChild(el); const l = { el, anchor }; labs.push(l); return l; }
  const glowTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'); const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, 'rgba(255,196,84,.95)'); g.addColorStop(.28, 'rgba(255,170,40,.42)'); g.addColorStop(1, 'rgba(255,160,30,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
  const glows = [];
  function glow(sizeWorld, x, y, z) { const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([x, y, z]), 3));
    const m = new THREE.PointsMaterial({ map: glowTex, transparent: true, depthWrite: false, size: 10, sizeAttenuation: false }); const pts = new THREE.Points(geo, m); pts.frustumCulled = false; scene.add(pts);
    const g = { m, sizeWorld, pts }; glows.push(g); return g; }
  const pool = (r, x, z, o) => { const m = new THREE.Mesh(new THREE.CircleGeometry(r, 40), new THREE.MeshBasicMaterial({ color: 0xf0a31e, transparent: true, opacity: o, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.set(x, .02, z); scene.add(m); return m; };

  let update = () => {}, api = {};
  const view = { theta: 35, phi: 57, span: 7.6, minH: 5.4, target: new THREE.Vector3(0, 1, 0) };

  if (kind === 'bootcamp') {
    // a camp: one tent per track, a fire in the middle, a flag
    cyl(6.3, .8, M(P.cream), 0, -.8, 0, scene, 72, false); cyl(6.6, .45, M(P.base), 0, -1.25, 0, scene, 72, false);
    const F = new THREE.Vector3(.7, 0, 1.6);
    function tent(x, z, color) { const sh = new THREE.Shape(); sh.moveTo(-1.65, 0); sh.lineTo(1.65, 0); sh.lineTo(0, 2.35); sh.closePath();
      const geo = new THREE.ExtrudeGeometry(sh, { depth: 3.3, bevelEnabled: false }); geo.translate(0, 0, -1.65);
      const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = Math.atan2(F.x - x, F.z - z); scene.add(g); add(geo, M(color), 0, 0, 0, g);
      const d = new THREE.Shape(); d.moveTo(-.6, 0); d.lineTo(.6, 0); d.lineTo(0, 1.45); d.closePath(); add(new THREE.ExtrudeGeometry(d, { depth: .06, bevelEnabled: false }), M(P.blue), 0, 0, 1.65, g, false);
      return new THREE.Vector3(x, 3, z); }
    lab('AI track', tent(-3.1, -1.2, P.blue2)); lab('Medicine track', tent(2.3, -3, P.coral));
    for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2, s = box(.34, .22, .3, M(P.stone), F.x + Math.cos(a) * .9, 0, F.z + Math.sin(a) * .9); s.rotation.y = -a; }
    for (let i = 0; i < 3; i++) { const l = add(new THREE.CylinderGeometry(.12, .12, 1.3, 8), M(P.trunk), F.x, .16, F.z); l.rotation.z = Math.PI / 2; l.rotation.y = i * Math.PI / 3; }
    const flames = [[.44, 1.2, 0xf0941e], [.31, .9, 0xf7b733], [.19, .6, 0xfde08a]].map(([r, h, c]) => { const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, 7), new THREE.MeshBasicMaterial({ color: c })); m.position.set(F.x, .2 + h / 2, F.z); m.userData.h = h; scene.add(m); return m; });
    const fg = glow(4.2, F.x, .95, F.z), fp = pool(2.5, F.x, F.z, .14);
    const NS = 10, sparks = new THREE.InstancedMesh(new THREE.SphereGeometry(.07, 8, 6), new THREE.MeshBasicMaterial({ color: 0xf5a81c }), NS); sparks.frustumCulled = false; scene.add(sparks);
    const sp = Array.from({ length: NS }, () => ({ ph: Math.random(), dx: Math.random() * 6.28, r: .15 + Math.random() * .35 }));
    [[-.9, 3.3], [2.5, 2.6], [.3, 3.8]].forEach(([x, z]) => cyl(.36, .4, M(P.trunk), x, 0, z, scene, 10));
    cyl(.06, 3.7, M(P.white), 4.2, 0, .4, scene, 8); const flag = new THREE.Group(); flag.position.set(4.2, 3.2, .4); scene.add(flag); box(1.5, .9, .05, M(P.blue), .78, -.45, 0, flag);
    [[-5, 1.8, .95], [-1.3, -4.7, .8], [4.9, -2.2, .85], [-4.4, -3.3, .7], [1.6, 5.2, .7]].forEach(([x, z, s], i) => tree(x, z, s, i));
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), pv = new THREE.Vector3();
    update = (dt, t) => { const tt = reduce ? 0 : t;
      flames.forEach((f, i) => { const sy = 1 + .18 * Math.sin(tt * 9 + i) + .1 * Math.sin(tt * 23 + i * 2), sx = 1 + .08 * Math.sin(tt * 13 + i * 3); f.scale.set(sx, sy, sx); f.position.y = .2 + f.userData.h * sy / 2; });
      fg.m.opacity = .6 + .14 * Math.sin(tt * 7) * Math.sin(tt * 3.1); fp.material.opacity = .13 + .04 * Math.sin(tt * 7);
      sp.forEach((s, i) => { const p = reduce ? 2 : (tt / 2.3 + s.ph) % 1; pv.set(F.x + Math.sin(s.dx + p * 4) * s.r, .9 + p * 2.7, F.z + Math.cos(s.dx + p * 3) * s.r); sc.setScalar(p > 1 ? .0001 : Math.max(.0001, 1 - p)); m4.compose(pv, q, sc); sparks.setMatrixAt(i, m4); });
      sparks.instanceMatrix.needsUpdate = true; flag.rotation.y = .55 + .22 * Math.sin(tt * 2.1); };
    view.target.set(0, 1.1, 0);
  }

  if (kind === 'join') {
    // a floor of tiles with one piece missing; the amber piece settles in, then lifts again
    const S = 2.2, H = .5, step = S + .14, W3 = 3 * step + .5;
    box(W3, .3, W3, M(P.cream), 0, -.3, 0, scene, false); box(W3 + .5, .4, W3 + .5, M(P.base), 0, -.7, 0, scene, false);
    const cols = [P.blue2, P.teal, P.indigo, P.coral, null, P.green, P.purple, P.peach, P.slate], who = { 0: 'Students', 2: 'Engineers', 6: 'Clinicians', 8: 'Researchers' }, tiles = [];
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) { const i = r * 3 + c; if (i === 4) continue; const x = (c - 1) * step, z = (r - 1) * step;
      tiles.push({ m: box(S, H, S, M(cols[i]), x, 0, z), d: Math.hypot(c - 1, r - 1), l: who[i] ? lab(who[i], new THREE.Vector3(x, H + .55, z)) : null }); }
    const piece = box(S, H, S, mat(P.amber, { emissive: 0xe08a00, emissiveIntensity: .35 }), 0, 0, 0), you = lab('You?', new THREE.Vector3(0, 3, 0), 'on'), pg = glow(4, 0, 2, 0);
    const TOP = 2.3;
    update = (dt, t) => { const u = t % 6.6; let y = TOP, rot = .22, seated = -1;
      if (!reduce) { if (u < 3.2) { y = TOP + .18 * Math.sin(u * 2); rot = .25 * Math.sin(u * .9); }
        else if (u < 3.9) { const p = ease((u - 3.2) / .7); y = (TOP + .18 * Math.sin(6.4)) * (1 - p); rot = .25 * Math.sin(2.88) * (1 - p); }
        else if (u < 5.5) { y = 0; rot = 0; seated = u - 3.9; }
        else { y = TOP * ease((u - 5.5) / 1.1); rot = 0; } }
      piece.position.y = y + H / 2; piece.rotation.y = rot; you.anchor.y = y + H + .6;
      pg.pts.geometry.attributes.position.setXYZ(0, 0, y + .2, 0); pg.pts.geometry.attributes.position.needsUpdate = true; pg.m.opacity = .35 + (seated >= 0 ? .35 * Math.max(0, 1 - seated) : 0);
      tiles.forEach(o => { const ph = seated * 6 - o.d * 1.3, off = seated >= 0 && ph > 0 && ph < Math.PI ? .2 * Math.sin(ph) : 0; o.m.position.y = H / 2 + off; if (o.l) o.l.anchor.y = H + .55 + off; }); };
    Object.assign(view, { span: 6.9, minH: 5.2 }); view.target.set(0, .9, 0);
  }

  // camera, drag, resize
  let W = 1, Hh = 1, halfH = 6, uTheta = 0, drag = null;
  function resize() { W = host.clientWidth; Hh = host.clientHeight; if (!W || !Hh) return; renderer.setSize(W, Hh, false); const asp = W / Hh; halfH = Math.max(view.minH, view.span / asp);
    cam.left = -halfH * asp; cam.right = halfH * asp; cam.top = halfH; cam.bottom = -halfH; cam.updateProjectionMatrix(); }
  new ResizeObserver(resize).observe(host); resize();
  canvas.addEventListener('pointerdown', e => { drag = e.clientX; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', e => { if (drag == null) return; uTheta -= (e.clientX - drag) * .006; drag = e.clientX; });
  const end = () => { drag = null; }; canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end);
  let vis = true; new IntersectionObserver(es => { vis = es[0].isIntersecting; }).observe(host);

  const v3 = new THREE.Vector3(), clock = new THREE.Clock(); let time = 0;
  function frame() {
    requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), .05); if (!vis || document.hidden || !W) return; time += dt;
    const th = THREE.MathUtils.degToRad(view.theta) + uTheta + (reduce ? 0 : .14 * Math.sin(time * .25)), ph = THREE.MathUtils.degToRad(view.phi);
    cam.position.set(view.target.x + 60 * Math.sin(ph) * Math.sin(th), view.target.y + 60 * Math.cos(ph), view.target.z + 60 * Math.sin(ph) * Math.cos(th)); cam.lookAt(view.target); cam.updateMatrixWorld();
    const ppu = Hh / (2 * halfH); glows.forEach(g => { g.m.size = g.sizeWorld * ppu; });
    update(dt, time);
    labs.forEach(l => { v3.copy(l.anchor).project(cam); l.el.style.transform = `translate(${((v3.x * .5 + .5) * W).toFixed(1)}px,${((-v3.y * .5 + .5) * Hh).toFixed(1)}px) translate(-50%,-100%)`; });
    renderer.render(scene, cam);
  }
  requestAnimationFrame(frame);
  return api;
}
