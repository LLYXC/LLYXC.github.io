// Throwaway prototype: a small animated island cut from the home page's world, one per inner page.
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

  const std = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: .9, flatShading: true, ...o });
  const M = { ground: std(0xece6d8), base: std(0xd9d1bf), white: std(0xfdfcf9), plaza: std(0xf7f3ea), path: std(0xdfd7c5), blue: std(0x00356B),
    tree: std(0x7fb596), tree2: std(0x9cc7a6), trunk: std(0x9c7f63) };
  const add = (geo, mat, x, y, z, p = scene, shadow = true) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = shadow; m.receiveShadow = true; p.add(m); return m; };
  const box = (w, h, d, mat, x, y, z, p, s) => add(new THREE.BoxGeometry(w, h, d), mat, x, y + h / 2, z, p, s);
  const cyl = (r, h, mat, x, y, z, p, seg = 24, s) => add(new THREE.CylinderGeometry(r, r, h, seg), mat, x, y + h / 2, z, p, s);
  const R = 6.6;
  cyl(R, .8, M.ground, 0, -.8, 0, scene, 72, false); cyl(R + .3, .45, M.base, 0, -1.25, 0, scene, 72, false);
  function tree(x, z, s, i) { const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(s); scene.add(g);
    cyl(.1, .5, M.trunk, 0, 0, 0, g, 6); add(new THREE.ConeGeometry(.62, 1.25, 7), i % 2 ? M.tree : M.tree2, 0, 1.05, 0, g); add(new THREE.ConeGeometry(.45, .9, 7), i % 2 ? M.tree2 : M.tree, 0, 1.6, 0, g); }

  const labs = [];
  function lab(text, anchor, cls = '') { const el = document.createElement('div'); el.className = 'lab ' + cls; el.textContent = text; labelsEl.appendChild(el); const l = { el, anchor }; labs.push(l); return l; }
  function pawn(x, z, color, o = {}) {
    const s = o.scale || 1.85, mat = new THREE.MeshStandardMaterial({ color, roughness: .7, transparent: o.opacity != null, opacity: o.opacity == null ? 1 : o.opacity });
    const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(s); scene.add(g); const sh = o.opacity == null;
    add(new THREE.CylinderGeometry(.12, .27, .66, 14), mat, 0, .36, 0, g, sh); add(new THREE.SphereGeometry(.2, 16, 12), mat, 0, .86, 0, g, sh); add(new THREE.CylinderGeometry(.44, .44, .035, 24), mat, 0, .02, 0, g, false);
    return { g, mat, head: new THREE.Vector3(x, 1.146 * s, z), anchor: new THREE.Vector3(x, 1.31 * s, z) };
  }
  // the AI core
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(.62, 0), new THREE.MeshStandardMaterial({ color: 0xf2b233, emissive: 0xe08a00, emissiveIntensity: .55, roughness: .45, flatShading: true })); core.castShadow = true; scene.add(core);
  const shell = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(.94, 1)), new THREE.LineBasicMaterial({ color: 0x00356B, transparent: true, opacity: .55 })); scene.add(shell);
  const coreAt = new THREE.Vector3(0, 3, 0);
  const glowTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'); const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, 'rgba(255,196,84,.95)'); g.addColorStop(.28, 'rgba(255,170,40,.42)'); g.addColorStop(1, 'rgba(255,160,30,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
  function glow(n, sizeWorld) { const geo = new THREE.BufferGeometry(), arr = new Float32Array(n * 3).fill(-999); geo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    const mat = new THREE.PointsMaterial({ map: glowTex, transparent: true, depthWrite: false, size: 10, sizeAttenuation: false }); const pts = new THREE.Points(geo, mat); pts.frustumCulled = false; scene.add(pts); return { arr, geo, mat, sizeWorld }; }
  const MAXA = 24, TAIL = 4, agentGlow = glow(MAXA, 1.5), coreGlow = glow(1, 2.5);
  const linkMat = new THREE.MeshBasicMaterial({ color: 0x286DC0, transparent: true, opacity: .4, depthWrite: false });
  const agents = [];
  const amesh = new THREE.InstancedMesh(new THREE.SphereGeometry(.18, 12, 10), new THREE.MeshBasicMaterial({ color: 0xf0a31e }), MAXA * TAIL); amesh.frustumCulled = false; scene.add(amesh);
  function arc(A, B, n = 1, extra = 0) { const d = A.distanceTo(B), mid = A.clone().add(B).multiplyScalar(.5); mid.y += .7 + d * .3 + extra;
    const curve = new THREE.QuadraticBezierCurve3(A.clone(), mid, B.clone()); scene.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 32, .03, 6), linkMat));
    for (let i = 0; i < n && agents.length < MAXA; i++) agents.push({ curve, t: Math.random(), dir: Math.random() < .5 ? 1 : -1, speed: .2 + Math.random() * .14 }); return curve; }

  let update = () => {}, api = {};
  const view = { theta: 35, phi: 57, span: 7.7, minH: 5.6, target: new THREE.Vector3(0, 1.2, 0) };

  if (kind === 'publications') {
    // three stacks of papers, one per theme; picking a stack filters the list
    const counts = opt.counts || { build: 7, know: 6, wire: 6 }, keys = ['build', 'know', 'wire'], names = { build: '01 Build', know: '02 Know', wire: '03 Wire' };
    const th = THREE.MathUtils.degToRad(view.theta), right = new THREE.Vector3(Math.cos(th), 0, -Math.sin(th));
    const stacks = {}; let selected = 'all';
    keys.forEach((k, i) => { const p = right.clone().multiplyScalar((i - 1) * 4.1); p.z += .5; const g = new THREE.Group(); g.position.copy(p); scene.add(g);
      const n = counts[k] || 1, top = std(0x00356B);
      for (let j = 0; j < n; j++) { const s = box(2.5, .24, 3.2, j === n - 1 ? top : M.white, (Math.random() - .5) * .16, j * .27, (Math.random() - .5) * .16, g); s.rotation.y = (Math.random() - .5) * .16; s.userData.key = k; }
      const h = n * .27, l = lab(`${names[k]} · ${n}`, new THREE.Vector3(p.x, h + .95, p.z), 'pick'); l.el.addEventListener('click', () => opt.onPick && opt.onPick(selected === k ? 'all' : k));
      stacks[k] = { g, top, h, lift: 0, lab: l, topAt: new THREE.Vector3(p.x, h + .1, p.z) }; });
    coreAt.set(-right.z * -3.2, 4.3, right.x * -3.2);
    keys.forEach(k => arc(coreAt, stacks[k].topAt, 2)); arc(stacks.build.topAt, stacks.know.topAt, 1); arc(stacks.know.topAt, stacks.wire.topAt, 1);
    [[-4.6, -3.4, .9], [4.9, 2.6, .8], [-1.2, 4.9, .7], [5, -3.6, .75]].forEach(([x, z, s], i) => tree(x, z, s, i));
    const cOn = new THREE.Color(0xe9a52a), cOff = new THREE.Color(0x00356B);
    update = dt => keys.forEach(k => { const s = stacks[k], want = selected === k ? 1 : 0; s.lift += (want - s.lift) * (1 - Math.exp(-dt * 6)); s.g.position.y = s.lift * .55; s.top.color.copy(cOff).lerp(cOn, s.lift); s.lab.anchor.y = s.h + .95 + s.lift * .55; });
    api.select = k => { selected = k; keys.forEach(x => stacks[x].lab.el.classList.toggle('on', x === k)); };
    const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(); let downAt = null;
    canvas.addEventListener('pointerdown', e => { downAt = [e.clientX, e.clientY]; });
    canvas.addEventListener('pointerup', e => { if (!downAt || Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) > 5) return; const r = canvas.getBoundingClientRect();
      ndc.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(ndc, cam);
      const hit = ray.intersectObjects(keys.map(k => stacks[k].g), true)[0]; if (hit && opt.onPick) opt.onPick(selected === hit.object.userData.key ? 'all' : hit.object.userData.key); });
    view.target.set(0, 1.6, 0);
  }

  if (kind === 'bootcamp') {
    // a mentored cohort around one shared project
    cyl(1.55, .5, M.white, 0, 0, 0, scene, 32); cyl(1.2, .05, M.path, 0, .5, 0, scene, 32, false); coreAt.set(0, 2.5, 0);
    const cols = [0x00356B, 0x286DC0, 0x2c93a1, 0x4f56c4, 0xe2725b, 0xf0a27e, 0x3f9a6c], a0 = Math.atan2(-.82, -.57);
    const ps = cols.map((c, i) => { const a = a0 + (62 + i * 236 / 6) * Math.PI / 180; const p = pawn(Math.cos(a) * 3.9, Math.sin(a) * 3.9, c); arc(p.head, coreAt, 1); return p; });
    lab('Mentor', ps[0].anchor, 'on'); lab('AI track', ps[2].anchor); lab('Medicine track', ps[5].anchor);
    arc(ps[1].head, ps[2].head, 1); arc(ps[4].head, ps[5].head, 1); arc(ps[3].head, ps[4].head, 1);
    [[-5.2, 1.4, .8], [5.3, -1.2, .85], [1.2, 5.4, .7]].forEach(([x, z, s], i) => tree(x, z, s, i));
  }

  if (kind === 'join') {
    // the team, and an open place in it
    const T = new THREE.Vector3(1.7, 0, -1.3), G = new THREE.Vector3(-3.3, 0, 3); coreAt.set(T.x, 4, T.z);
    const team = [['Students', -2.5, -.5, 0x286DC0], ['Engineers', 1.5, -2, 0x2c93a1], ['Clinicians', -.5, 2.1, 0xe2725b], ['Researchers', 2.7, 1, 0x4f56c4]]
      .map(([name, dx, dz, c]) => { const p = pawn(T.x + dx, T.z + dz, c); lab(name, p.anchor); arc(p.head, coreAt, 1); return p; });
    arc(team[0].head, team[3].head, 1, .5); arc(team[1].head, team[2].head, 1, .9);
    const ghost = pawn(G.x, G.z, 0xe9a52a, { opacity: .34 }); lab('You?', ghost.anchor, 'on'); arc(ghost.head, coreAt, 2, .8);
    const dx = T.x - G.x, dz = T.z - G.z, len = Math.hypot(dx, dz), path = box(len, .035, .6, M.path, G.x + dx / 2, 0, G.z + dz / 2, scene, false); path.rotation.y = -Math.atan2(dz, dx);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xe39a14, transparent: true, opacity: .8, side: THREE.DoubleSide, depthWrite: false });
    const ring = new THREE.Mesh(new THREE.RingGeometry(.86, 1, 48), ringMat); ring.rotation.x = -Math.PI / 2; ring.position.set(G.x, .07, G.z); scene.add(ring);
    [[-4.9, -2.6, .85], [4.6, 3.2, .8], [-.6, -5.2, .7]].forEach(([x, z, s], i) => tree(x, z, s, i));
    update = (dt, t) => { const q = (t / 2.2) % 1; ring.scale.setScalar(1 + q * 1.5); ringMat.opacity = (1 - q) * .8; ghost.mat.opacity = .3 + .12 * Math.sin(t * 2.4); };
  }
  amesh.count = agents.length * TAIL;

  // camera, drag, resize
  let W = 1, H = 1, halfH = 7, uTheta = 0, drag = null;
  function resize() { W = host.clientWidth; H = host.clientHeight; if (!W || !H) return; renderer.setSize(W, H, false); const asp = W / H; halfH = Math.max(view.minH, view.span / asp);
    cam.left = -halfH * asp; cam.right = halfH * asp; cam.top = halfH; cam.bottom = -halfH; cam.updateProjectionMatrix(); }
  new ResizeObserver(resize).observe(host); resize();
  canvas.addEventListener('pointerdown', e => { drag = e.clientX; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', e => { if (drag == null) return; uTheta -= (e.clientX - drag) * .006; drag = e.clientX; });
  const end = () => { drag = null; }; canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end);
  let vis = true; new IntersectionObserver(es => { vis = es[0].isIntersecting; }).observe(host);

  const m4 = new THREE.Matrix4(), v = new THREE.Vector3(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), v3 = new THREE.Vector3();
  const clock = new THREE.Clock(); let time = 0;
  function frame() {
    requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), .05); if (!vis || document.hidden || !W) return; time += dt;
    const th = THREE.MathUtils.degToRad(view.theta) + uTheta + (reduce ? 0 : .14 * Math.sin(time * .25)), ph = THREE.MathUtils.degToRad(view.phi);
    cam.position.set(view.target.x + 60 * Math.sin(ph) * Math.sin(th), view.target.y + 60 * Math.cos(ph), view.target.z + 60 * Math.sin(ph) * Math.cos(th)); cam.lookAt(view.target); cam.updateMatrixWorld();
    const ppu = H / (2 * halfH); agentGlow.mat.size = agentGlow.sizeWorld * ppu; coreGlow.mat.size = coreGlow.sizeWorld * ppu;
    core.position.set(coreAt.x, coreAt.y + Math.sin(time * 1.3) * .12, coreAt.z); core.rotation.y += dt * .5; core.rotation.x += dt * .17;
    shell.position.copy(core.position); shell.rotation.y -= dt * .22; shell.rotation.z += dt * .11;
    coreGlow.arr.set([core.position.x, core.position.y, core.position.z]); coreGlow.geo.attributes.position.needsUpdate = true;
    agents.forEach((a, i) => { if (!reduce) a.t += a.dir * a.speed * dt; if (a.t > 1 || a.t < 0) { a.dir *= -1; a.t = THREE.MathUtils.clamp(a.t, 0, 1); }
      for (let j = 0; j < TAIL; j++) { a.curve.getPoint(THREE.MathUtils.clamp(a.t - a.dir * j * .05, 0, 1), v); sc.setScalar(1 - j * .24); m4.compose(v, q, sc); amesh.setMatrixAt(i * TAIL + j, m4); if (j === 0) agentGlow.arr.set([v.x, v.y, v.z], i * 3); } });
    amesh.instanceMatrix.needsUpdate = true; agentGlow.geo.attributes.position.needsUpdate = true;
    update(dt, time);
    labs.forEach(l => { v3.copy(l.anchor).project(cam); l.el.style.transform = `translate(${((v3.x * .5 + .5) * W).toFixed(1)}px,${((-v3.y * .5 + .5) * H).toFixed(1)}px) translate(-50%,-100%)`; });
    renderer.render(scene, cam);
  }
  requestAnimationFrame(frame);
  return api;
}
