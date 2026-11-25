// The home page's 3D health system. home.js loads this file after the page works, and calls setMode on every change of theme.
// Until the first frame is drawn (and for good, if this file cannot run) the stage shows a still image of the scene instead.
import * as THREE from 'three';

let mode = document.documentElement.dataset.mode || 'overview';

/* The caption under the scene says what the scene is showing, so it belongs to the scene: under the still image it stays on the overview. */
const capEl = document.getElementById('cap');
const CAPS = {
  overview:document.getElementById('cap').innerHTML, // written in the page, so it shows under the still image too
  build:'<b>One agent carries one case</b> from arrival to follow\u2011up, working with each person along the way.',
  know:'<b>The same system, as a simulation.</b> Thousands of encounters are replayed so failures surface before a patient meets them.',
  wire:'<b>Deployed.</b> Agents link every stakeholder to every other, and a monitoring pulse keeps watch.'
};
const stageEl = document.getElementById('stage'), sceneEl = document.getElementById('scene'), canvas = document.getElementById('gl'), labelsEl = document.getElementById('labels');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true});
// Pixel budget. A phone or a small stage is drawn at full sharpness; a large laptop stage at a little under 2x,
// where the extra pixels cost memory and frame time and cannot be seen on a moving low-poly scene.
const PX_BUDGET = 1.6e6;
renderer.setClearColor(0x000000,0);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.shadowMap.autoUpdate = false; // nothing that casts a shadow moves, so the shadows are drawn once (see the end of this file), not every frame

const scene = new THREE.Scene();
const cam = new THREE.OrthographicCamera(-1,1,1,-1,.1,300);
const world = new THREE.Group(); scene.add(world);

const hemi = new THREE.HemisphereLight(0xffffff,0xe9dfcc,2.05); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff3df,1.9); sun.position.set(-11,19,13); sun.castShadow = true;
sun.shadow.mapSize.set(1536,1536); sun.shadow.bias=-.0004; sun.shadow.normalBias=.03;
Object.assign(sun.shadow.camera,{left:-20,right:20,top:20,bottom:-20,near:1,far:70}); scene.add(sun); scene.add(sun.target);

const solidMats = [], figMats = [];
const std = (c,o={})=>{const m=new THREE.MeshStandardMaterial({color:c,roughness:.92,metalness:0,flatShading:true,...o}); solidMats.push(m); return m;};
const M = {
  ground:std(0xece6d8), base:std(0xd9d1bf), plaza:std(0xf7f3ea), path:std(0xdfd7c5),
  wall:std(0xfdfcf9), warm:std(0xfaf3e6), glass:std(0xa9c7e8,{roughness:.35}),
  blue:std(0x00356B), blue2:std(0x286DC0), slate:std(0x56637a), purple:std(0x7460b8), indigo:std(0x4f56c4),
  green:std(0x3f9a6c), coral:std(0xe2725b), terra:std(0xb9684f), roofLight:std(0xe4e9ef), white:std(0xffffff), tree:std(0x7fb596), tree2:std(0x9cc7a6), trunk:std(0x9c7f63)
};
const edgeMat = new THREE.LineBasicMaterial({color:0x2d5f9f,transparent:true,opacity:0});
const edges = [], edgeQueue = [];
function addEdges(mesh,angle=25){edgeQueue.push([mesh,angle]);}
// The blueprint outlines are only seen in theme 02, so they are built in idle time once the scene is up (or at once, if theme 02 is opened first).
function buildEdges(max=Infinity){
  for(let n=0; n<max && edgeQueue.length; n++){ const [mesh,angle]=edgeQueue.shift();
    const e=new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry,angle),edgeMat); e.visible=edgesOn; e.matrixAutoUpdate=false; mesh.add(e); e.updateMatrixWorld(true); edges.push(e); }
}
function buildEdgesWhenIdle(){ if(!edgeQueue.length) return; buildEdges(10); (window.requestIdleCallback||setTimeout)(buildEdgesWhenIdle); }
let edgesOn = false;
function mesh(geo,mat,x,y,z,parent=world,{edge=true,shadow=true}={}){
  const m=new THREE.Mesh(geo,mat); m.position.set(x,y,z); m.castShadow=shadow; m.receiveShadow=true; parent.add(m); if(edge) addEdges(m); return m;
}
const box=(w,h,d,mat,x,y,z,parent,o)=>mesh(new THREE.BoxGeometry(w,h,d),mat,x,y+h/2,z,parent,o);
const cyl=(r,h,mat,x,y,z,parent,seg=20,o)=>mesh(new THREE.CylinderGeometry(r,r,h,seg),mat,x,y+h/2,z,parent,o);

// platform
box(24,.9,18.4,M.ground,0,-.9,1,world).castShadow=false;
box(24.7,.5,19.1,M.base,0,-1.4,1,world).castShadow=false;
const PLAZA = new THREE.Vector3(0,0,2);
cyl(2.9,.06,M.plaza,PLAZA.x,0,PLAZA.z,world,48,{edge:false,shadow:false});
cyl(1.25,.05,M.path,PLAZA.x,.05,PLAZA.z,world,40,{edge:false,shadow:false});
const grid = new THREE.GridHelper(40,40,0x9db3d0,0xc2cede); grid.position.set(0,.03,1); grid.material.transparent=true; grid.material.opacity=0; grid.visible=false; scene.add(grid);

function building(x,z,w,h,d,floors,roof,wall=M.wall){
  const g=new THREE.Group(); g.position.set(x,0,z); world.add(g);
  box(w,h,d,wall,0,0,0,g);
  const fh=h/floors;
  for(let i=0;i<floors;i++) box(w+.05,fh*.36,d+.05,M.glass,0,i*fh+fh*.42,0,g,{edge:false,shadow:false});
  box(w+.34,.2,d+.34,roof,0,h,0,g);
  return g;
}
function sign(g,x,y,z,plate,axis){ // plate with a white cross, facing +z ('z') or +x ('x')
  const s=new THREE.Group(); s.position.set(x,y,z); if(axis==='x') s.rotation.y=Math.PI/2; g.add(s);
  box(1.15,1.15,.08,plate,0,-.575,0,s,{edge:false}); box(.72,.2,.06,M.white,0,-.1,.06,s,{edge:false,shadow:false}); box(.2,.72,.06,M.white,0,-.36,.06,s,{edge:false,shadow:false});
}
function pathTo(x,z){const dx=x-PLAZA.x,dz=z-PLAZA.z,len=Math.hypot(dx,dz); const m=box(len,.035,.62,M.path,PLAZA.x+dx/2,0,PLAZA.z+dz/2,world,{edge:false,shadow:false}); m.rotation.y=-Math.atan2(dz,dx);}

// hospital
{ const g=building(.4,-4.6,8.2,3.2,4,3,M.roofLight); box(3.2,6.4,3.1,M.wall,-2.5,0,-.6,g);
  for(let i=0;i<6;i++) box(3.25,.36,3.15,M.glass,-2.5,i*1.05+.5,-.6,g,{edge:false,shadow:false});
  box(3.54,.2,3.44,M.blue,-2.5,6.4,-.6,g); sign(g,-2.5,6.1,.98,M.blue,'z'); sign(g,-.88,6.1,-.6,M.blue,'x');
  box(2.9,.16,1.5,M.coral,2.3,1.3,2.7,g); box(.14,1.3,.14,M.white,1.1,0,3.3,g,{edge:false}); box(.14,1.3,.14,M.white,3.5,0,3.3,g,{edge:false});
  box(1.3,1.05,.08,M.blue,2.3,0,2.03,g,{edge:false,shadow:false}); cyl(1.05,.07,M.blue2,1.9,3.4,0,g,28,{edge:false}); cyl(.8,.08,M.roofLight,1.9,3.4,0,g,28,{edge:false,shadow:false}); pathTo(.4,-2.6); }
// lab
{ const g=building(-8.3,-4.6,3.4,2.4,3.2,2,M.purple); cyl(.42,.9,M.white,-.7,2.6,.4,g,14); cyl(.42,.6,M.white,.5,2.6,-.3,g,14); pathTo(-7.4,-2.8); }
// imaging
{ const g=building(8.6,-4,3.4,2.4,3.4,2,M.indigo); const t=mesh(new THREE.TorusGeometry(.72,.23,10,22),M.white,0,3.52,0,g,{edge:false}); t.rotation.y=Math.PI/4; box(1.5,.12,.5,M.indigo,0,2.6,0,g,{edge:false}).rotation.y=-Math.PI/4; pathTo(7.6,-2.3); }
// health-system office
{ const g=building(-9.8,1.4,2.8,4.6,2.8,5,M.slate); cyl(.05,1.3,M.slate,.6,4.8,-.6,g,6,{edge:false}); pathTo(-8.2,1.6); }
// clinic
{ const g=building(-6.4,6.9,3.4,1.7,2.8,1,M.blue2); sign(g,1.74,1.55,0,M.blue2,'x'); pathTo(-5.4,5.6); }
// pharmacy
{ const g=building(.8,8.1,2.6,1.5,2.2,1,M.green); sign(g,1.34,1.42,0,M.green,'x'); box(2.6,.1,.8,M.green,0,1.02,-1.4,g,{edge:false}); pathTo(.9,6.9); }
// home
{ const g=new THREE.Group(); g.position.set(8.5,0,7); world.add(g); box(2.4,1.4,2.2,M.warm,0,0,0,g);
  const sh=new THREE.Shape(); sh.moveTo(-1.42,0); sh.lineTo(1.42,0); sh.lineTo(0,1); sh.closePath();
  const geo=new THREE.ExtrudeGeometry(sh,{depth:2.5,bevelEnabled:false}); geo.translate(0,0,-1.25); mesh(geo,M.terra,0,1.4,0,g);
  box(.5,.85,.06,M.blue,-1.23,0,.2,g,{edge:false,shadow:false}).rotation.y=Math.PI/2; box(.3,.6,.3,M.warm,.6,1.75,-.5,g,{edge:false}); pathTo(7.2,5.7); }
// trees
[[-11,-6.8,1.1],[-5.2,-6.6,.9],[5.4,-6.9,1],[11,-6.4,1.15],[10.9,1.2,1],[10.6,8.6,.9],[4.4,9.2,1.05],[-2.6,9,.9],[-10.6,8.4,1.1],[-10.9,-1.6,.85],[-3.6,6.4,.75],[3.9,-1,.7]].forEach(([x,z,s],i)=>{
  const g=new THREE.Group(); g.position.set(x,0,z); g.scale.setScalar(s); world.add(g);
  cyl(.1,.5,M.trunk,0,0,0,g,6,{edge:false}); mesh(new THREE.ConeGeometry(.62,1.25,7),i%2?M.tree:M.tree2,0,1.05,0,g); mesh(new THREE.ConeGeometry(.45,.9,7),i%2?M.tree2:M.tree,0,1.6,0,g,{edge:false});
});

/* stakeholders */
const nodes = {};
function lab(text,cls='who'){const el=document.createElement('div'); el.className='lab '+cls; el.textContent=text; labelsEl.appendChild(el); return el;}
const tags = [], phone = matchMedia('(max-width:600px)');
function tag(el,p,on){const t={el,p,on,dirty:true,x:0,y:0,w:0,h:0,cx:0,top:0,want:0,lift:0,stem:-1,sx:0}; tags.push(t); return t;}
// a label is measured again only when its size may have changed: a resize, the fonts arriving, the phone breakpoint, new text
const remeasure = ()=>tags.forEach(t=>t.dirty=true);
phone.addEventListener('change',remeasure); if(document.fonts) document.fonts.ready.then(remeasure);
function person(key,name,x,z,color){
  const mat=new THREE.MeshStandardMaterial({color,roughness:.7,flatShading:false}); figMats.push(mat);
  const g=new THREE.Group(); g.position.set(x,0,z); g.scale.setScalar(1.85); world.add(g);
  const o={edge:false};
  mesh(new THREE.CylinderGeometry(.12,.27,.66,14),mat,0,.36,0,g,o); mesh(new THREE.SphereGeometry(.2,16,12),mat,0,.86,0,g,o);
  mesh(new THREE.CylinderGeometry(.44,.44,.035,24),mat,0,.02,0,g,{edge:false,shadow:false});
  nodes[key]={key,name,g,pos:new THREE.Vector3(x,0,z),head:new THREE.Vector3(x,2.12,z),anchor:new THREE.Vector3(x,2.42,z),el:lab(name)};
  tag(nodes[key].el,nodes[key].anchor,()=>!(phone.matches&&mode==='overview')); // on a phone the names stay out of the overview
}
person('patient','Patient',5.3,3.9,0xe2725b);
person('family','Family',7.3,3.3,0xf0a27e);
person('physician','Physician',2.3,-1.1,0x00356B);
person('nurse','Nurse',-.6,-1.3,0x2c93a1);
person('radiologist','Radiologist',6.9,-1.2,0x4f56c4);
person('lab','Lab scientist',-6.5,-1.9,0x7460b8);
person('admin','Administrator',-7.3,2.4,0x56637a);
person('pcp','Primary care',-4.6,5,0x286DC0);
person('pharmacist','Pharmacist',2.2,6.2,0x3f9a6c);

/* the AI core */
const coreMat = new THREE.MeshStandardMaterial({color:0xf2b233,emissive:0xe08a00,emissiveIntensity:.55,roughness:.45,flatShading:true});
const core = new THREE.Mesh(new THREE.IcosahedronGeometry(.72,0),coreMat); core.castShadow=true; world.add(core);
const shellMat = new THREE.LineBasicMaterial({color:0x00356B,transparent:true,opacity:.55});
const shell = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.08,1)),shellMat); world.add(shell);

/* glow sprites (points) */
const glowTex = (()=>{const c=document.createElement('canvas'); c.width=c.height=128; const x=c.getContext('2d'); const g=x.createRadialGradient(64,64,0,64,64,64);
  g.addColorStop(0,'rgba(255,196,84,.95)'); g.addColorStop(.28,'rgba(255,170,40,.42)'); g.addColorStop(1,'rgba(255,160,30,0)'); x.fillStyle=g; x.fillRect(0,0,128,128); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; return t;})();
function glow(n,sizeWorld){
  const geo=new THREE.BufferGeometry(); const arr=new Float32Array(n*3).fill(-999); geo.setAttribute('position',new THREE.BufferAttribute(arr,3));
  const mat=new THREE.PointsMaterial({map:glowTex,transparent:true,depthWrite:false,size:10,sizeAttenuation:false});
  const pts=new THREE.Points(geo,mat); pts.frustumCulled=false; scene.add(pts); return {pts,arr,geo,mat,sizeWorld};
}
const glows = [];
const agentGlow = glow(48,1.6), coreGlow = glow(1,4.2), leadGlow = glow(1,1.9); glows.push(agentGlow,coreGlow,leadGlow);

/* links between stakeholders */
const LINKS = [['patient','physician',1],['patient','pcp',1],['physician','radiologist',1],['nurse','lab',1],['pcp','admin',1],['pharmacist','patient',1],['family','nurse',1],
  ['physician','nurse',0],['physician','lab',0],['radiologist','patient',0],['pharmacist','physician',0],['admin','physician',0],['pcp','physician',0],['family','pharmacist',0],['admin','lab',0],['pcp','pharmacist',0],['radiologist','family',0],['admin','nurse',0]];
function arcCurve(a,b,extra=0){const A=nodes[a].head,B=nodes[b].head,d=A.distanceTo(B); const mid=A.clone().add(B).multiplyScalar(.5); mid.y+=1+d*.3+extra; return new THREE.QuadraticBezierCurve3(A.clone(),mid,B.clone());}
const linkMat = new THREE.MeshBasicMaterial({color:0x286DC0,transparent:true,opacity:0,depthWrite:false});
const linkMatOv = linkMat.clone();
const arcs = LINKS.map(([a,b,ov])=>{const curve=arcCurve(a,b); const tube=new THREE.Mesh(new THREE.TubeGeometry(curve,36,.032,6),ov?linkMatOv:linkMat); world.add(tube); return {curve,ov,tube};});

/* agents */
const N = 46, TAIL = 4;
const agentMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(.2,12,10),new THREE.MeshBasicMaterial({color:0xf0a31e}),N*TAIL); agentMesh.frustumCulled=false; world.add(agentMesh);
const agents = Array.from({length:N},(_,i)=>({arc:i%arcs.length,t:Math.random(),dir:Math.random()<.5?1:-1,speed:.16+Math.random()*.12,on:0}));
const QUOTA = {overview:9,build:0,know:N,wire:24};
function pickArc(m){const pool=arcs.map((a,i)=>i).filter(i=>m!=='overview'||arcs[i].ov); return pool[Math.floor(Math.random()*pool.length)];}

/* workflow (theme 01) */
const STEPS = [['patient','Arrival'],['nurse','Triage'],['physician','Exam'],['lab','Labs'],['radiologist','Imaging'],['physician','Diagnosis'],['pharmacist','Treatment'],['patient','Discharge'],['pcp','Follow-up']];
const stepper = document.getElementById('stepper');
const stepEls = STEPS.map(([,n])=>{const s=document.createElement('span'); s.className='step'; s.textContent=n; stepper.appendChild(s); return s;});
const wfMat = new THREE.MeshBasicMaterial({color:0xe39a14,transparent:true,opacity:0});
const WSEG = 40, WRAD = 6;
const wfArcs = STEPS.slice(1).map(([k],i)=>{const curve=arcCurve(STEPS[i][0],k,i===4||i===6?.9:0); const geo=new THREE.TubeGeometry(curve,WSEG,.055,WRAD); geo.setDrawRange(0,0); const tube=new THREE.Mesh(geo,wfMat); tube.frustumCulled=false; world.add(tube); return {curve,geo};});
const lead = new THREE.Mesh(new THREE.SphereGeometry(.27,18,14),new THREE.MeshBasicMaterial({color:0xf5a81c})); lead.visible=false; world.add(lead);
const wf = {i:0,t:0,pause:.6,done:false};
function wfReset(){wf.i=0; wf.t=0; wf.pause=.7; wf.done=false; wfArcs.forEach(a=>a.geo.setDrawRange(0,0)); stepEls.forEach((s,j)=>{s.classList.toggle('on',j===0); s.classList.toggle('cur',j===0);}); markNode(STEPS[0][0]);}
function markNode(key){for(const k in nodes) nodes[k].el.classList.toggle('on',k===key);}
const ease = t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;

/* failures (theme 02) */
const FAILS = ['Missed a critical action','Agreed with a wrong suggestion','Treatment came late','Finding not grounded in the image','Drifted from instructions','Confident and unsafe'];
const failMat = new THREE.MeshBasicMaterial({color:0xff5a3c,transparent:true,opacity:0,side:THREE.DoubleSide,depthWrite:false});
const fails = Array.from({length:4},()=>{const mat=failMat.clone(); const ring=new THREE.Mesh(new THREE.RingGeometry(.5,.62,40),mat); ring.rotation.x=-Math.PI/2; ring.visible=false; world.add(ring); return {ring,mat,el:lab('', 'fail'),life:0,pos:new THREE.Vector3(),at:new THREE.Vector3()};});
fails.forEach(f=>f.tag=tag(f.el,f.at,()=>f.life>0));
let failClock = .8, nEnc = 0, nFail = 0, lastFailNode = '';
const hudN = document.getElementById('hud-n'), hudF = document.getElementById('hud-f');
const scanMat = new THREE.MeshBasicMaterial({color:0x286DC0,transparent:true,opacity:0,side:THREE.DoubleSide,depthWrite:false});
const scan = new THREE.Mesh(new THREE.PlaneGeometry(19,7),scanMat); scan.rotation.y=Math.PI/2; scan.position.set(0,3.5,1); world.add(scan);

/* monitoring pulse (theme 03) */
const pulseMat = new THREE.MeshBasicMaterial({color:0x286DC0,transparent:true,opacity:0,side:THREE.DoubleSide,depthWrite:false});
const pulses = [0,.5].map(off=>{const mat=pulseMat.clone(); const r=new THREE.Mesh(new THREE.RingGeometry(.94,1,72),mat); r.rotation.x=-Math.PI/2; r.position.set(PLAZA.x,.08,PLAZA.z); world.add(r); return {r,mat,off};});

/* ───────────── state + camera ───────────── */
const MODES = {
  overview:{zoom:1,   phi:56,theta:36,tx:0,  tz:1, sway:.2},
  build:   {zoom:1.08,phi:55,theta:30,tx:.4, tz:1.2,sway:.06},
  know:    {zoom:1.02,phi:45,theta:44,tx:0,  tz:1, sway:.1},
  wire:    {zoom:1.1, phi:58,theta:38,tx:0,  tz:1.2,sway:.12}
};
const S = {...MODES.overview, sim:0, ov:1, build:0, know:0, wire:0};
const U = {theta:0,phi:0,reset:false};
function onMode(m){
  mode = m; capEl.innerHTML = CAPS[m];
  U.reset=true;
  agents.forEach((a,i)=>{ if(i<QUOTA[m] && (m==='overview' ? !arcs[a.arc].ov : false)) a.arc=pickArc(m); });
  if(m==='build') wfReset(); else markNode(null);
  if(m==='know'){nEnc=0; nFail=0; failClock=.9; hudF.textContent='0';}
}
let dragging=false,px=0,py=0;
canvas.addEventListener('pointerdown',e=>{dragging=true; px=e.clientX; py=e.clientY; U.reset=false; canvas.classList.add('drag'); canvas.setPointerCapture(e.pointerId);});
canvas.addEventListener('pointermove',e=>{ if(!dragging) return; U.theta-=(e.clientX-px)*.006; U.phi=Math.max(-.42,Math.min(.3,U.phi-(e.clientY-py)*.004)); px=e.clientX; py=e.clientY; });
const endDrag=()=>{dragging=false; canvas.classList.remove('drag');};
canvas.addEventListener('pointerup',endDrag); canvas.addEventListener('pointercancel',endDrag);

let W=1,H=1,halfH=12,drawn=false;
function resize(){
  W=Math.max(sceneEl.clientWidth,1); H=Math.max(sceneEl.clientHeight,1);
  renderer.setPixelRatio(Math.max(1,Math.min(devicePixelRatio,2,Math.sqrt(PX_BUDGET/(W*H))))); renderer.setSize(W,H,false);
  tags.forEach(t=>t.dirty=true);
  const asp=W/H; halfH=Math.max(11.6,17.3/asp);
  cam.left=-halfH*asp; cam.right=halfH*asp; cam.top=halfH; cam.bottom=-halfH; cam.updateProjectionMatrix();
  if(drawn) renderer.render(scene,cam); // resizing clears the canvas; redraw before the browser paints an empty one
}
new ResizeObserver(resize).observe(sceneEl); resize();

const tmpM = new THREE.Matrix4(), tmpV = new THREE.Vector3(), tmpQ = new THREE.Quaternion(), tmpS = new THREE.Vector3(), v3 = new THREE.Vector3();
const target = new THREE.Vector3();
const cInk = new THREE.Color(0x286DC0), cSim = new THREE.Color(0x2d5f9f), cShell = new THREE.Color(0x00356B);
/* Labels. Each one wants to sit just above its figure. Working from the front of the scene to the back, a label that would
   land on one already placed is lifted clear of it and keeps a stem down to its figure; none is allowed off the stage. */
const GAP = 3, live = [];
function layoutLabels(dt){
  live.length = 0;
  for(const t of tags){
    if(!t.on()){ t.want = t.lift = 0; continue; }
    if(t.dirty){ t.w=t.el.offsetWidth; t.h=t.el.offsetHeight; t.dirty=false; }
    v3.copy(t.p).project(cam); t.x=(v3.x*.5+.5)*W; t.y=(-v3.y*.5+.5)*H; live.push(t);
  }
  // front first. A label that is already lifted counts as slightly further back, so two neighbours do not keep trading places.
  live.sort((a,b)=>(b.y-(b.want>1?12:0))-(a.y-(a.want>1?12:0)));
  const k = 1-Math.exp(-dt*10);
  for(let i=0;i<live.length;i++){
    const t = live[i];
    t.cx = Math.min(Math.max(t.x,t.w/2+4),Math.max(W-t.w/2-4,t.w/2+4));
    let top = t.y-t.h;
    for(let n=0;n<i;n++){
      let moved = false;
      for(let j=0;j<i;j++){ const o = live[j];
        if(Math.abs(t.cx-o.cx)<(t.w+o.w)/2+GAP && top<o.top+o.h+GAP && o.top<top+t.h+GAP){ top = o.top-t.h-GAP; moved = true; } }
      if(!moved) break;
    }
    t.top = Math.max(top,2); t.want = Math.max(t.y-t.h-t.top,0); t.lift += (t.want-t.lift)*k;
    t.el.style.transform = `translate(${(t.cx-t.w/2).toFixed(1)}px,${(t.y-t.h-t.lift).toFixed(1)}px)`;
    const stem = t.lift>1.5 ? Math.round(t.lift) : 0, sx = Math.round(t.x-t.cx);
    if(stem!==t.stem){ t.stem = stem; t.el.style.setProperty('--stem',stem); }
    if(sx!==t.sx){ t.sx = sx; t.el.style.setProperty('--sx',sx+'px'); }
  }
}

const clock = new THREE.Clock(); let time = 0, onScreen = true;
new IntersectionObserver(es=>{onScreen=es[0].isIntersecting;}).observe(sceneEl);
function frame(){
  requestAnimationFrame(frame);
  if(!onScreen || document.hidden) return; // nothing is drawn while the scene is off-screen or the tab is in the background
  const dt = Math.min(clock.getDelta(),.05); time += dt;
  const T = MODES[mode], k = 1-Math.exp(-dt*3.2), k2 = 1-Math.exp(-dt*4.5);
  for(const key of ['zoom','phi','theta','tx','tz','sway']) S[key]+=(T[key]-S[key])*k;
  S.sim+=((mode==='know'?1:0)-S.sim)*k; S.ov+=((mode==='overview'?1:0)-S.ov)*k2; S.build+=((mode==='build'?1:0)-S.build)*k2; S.know+=((mode==='know'?1:0)-S.know)*k2; S.wire+=((mode==='wire'?1:0)-S.wire)*k2;
  if(U.reset){U.theta*=(1-k); U.phi*=(1-k);}

  // camera
  const th = THREE.MathUtils.degToRad(S.theta)+U.theta+(reduce?0:S.sway*Math.sin(time*.23));
  const ph = THREE.MathUtils.clamp(THREE.MathUtils.degToRad(S.phi)+U.phi,.42,1.3);
  target.set(S.tx,1,S.tz);
  cam.position.set(target.x+70*Math.sin(ph)*Math.sin(th), target.y+70*Math.cos(ph), target.z+70*Math.sin(ph)*Math.cos(th));
  cam.lookAt(target); cam.zoom=S.zoom; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  const pxPerUnit = H/(2*halfH)*S.zoom*renderer.getPixelRatio();
  glows.forEach(g=>g.mat.size=g.sizeWorld*pxPerUnit/renderer.getPixelRatio());

  // simulated look
  const sim=S.sim, simOn=sim>.004;
  solidMats.forEach(m=>{ if(m.transparent!==simOn){m.transparent=simOn; m.needsUpdate=true;} m.opacity=1-.88*sim; m.depthWrite=sim<.5; });
  figMats.forEach(m=>{ if(m.transparent!==simOn){m.transparent=simOn; m.needsUpdate=true;} m.opacity=1-.08*sim; });
  if(simOn && edgeQueue.length) buildEdges();
  edgeMat.opacity=sim*.9; if(simOn!==edgesOn){ edgesOn=simOn; edges.forEach(e=>e.visible=simOn); }
  grid.visible=simOn; grid.material.opacity=sim*.75;
  shellMat.color.copy(cShell).lerp(cSim,sim);
  scanMat.opacity=sim*.04; scan.visible=simOn; scan.position.x=((time*5.5)%27)-13.5;

  // core
  core.position.set(PLAZA.x,2.75+Math.sin(time*1.3)*.13,PLAZA.z); core.rotation.y+=dt*.5; core.rotation.x+=dt*.17;
  core.scale.setScalar(1+S.build*.3+Math.sin(time*3)*.025);
  shell.position.copy(core.position); shell.rotation.y-=dt*.22; shell.rotation.z+=dt*.11; shell.scale.setScalar(1+S.build*.3);
  coreGlow.arr[0]=core.position.x; coreGlow.arr[1]=core.position.y; coreGlow.arr[2]=core.position.z; coreGlow.geo.attributes.position.needsUpdate=true; coreGlow.mat.opacity=.55+.15*Math.sin(time*2.2);

  // links
  linkMatOv.opacity=Math.max(S.ov*.36,S.wire*.5,S.know*.55); linkMat.opacity=Math.max(S.wire*.5,S.know*.55);
  linkMat.color.copy(cInk).lerp(cSim,sim); linkMatOv.color.copy(linkMat.color);
  linkMat.visible=linkMat.opacity>.01; linkMatOv.visible=linkMatOv.opacity>.01;

  // agents
  const quota=QUOTA[mode], spd=1+S.know*2.3;
  agents.forEach((a,i)=>{
    const want=i<quota?1:0; a.on+=(want-a.on)*k2; a.t+=a.dir*a.speed*spd*dt;
    if(a.t>1||a.t<0){ a.dir*=-1; a.t=THREE.MathUtils.clamp(a.t,0,1); if(Math.random()<.6) {const n=pickArc(mode); const end=a.dir<0?arcs[a.arc].curve.v2:arcs[a.arc].curve.v0; const c=arcs[n].curve; if(c.v0.distanceTo(end)<.01){a.arc=n;a.t=0;a.dir=1;} else if(c.v2.distanceTo(end)<.01){a.arc=n;a.t=1;a.dir=-1;} } }
    const c=arcs[a.arc].curve;
    for(let j=0;j<TAIL;j++){
      const tt=THREE.MathUtils.clamp(a.t-a.dir*j*.045,0,1); c.getPoint(tt,tmpV);
      const s=a.on*(1-j*.24); tmpS.setScalar(Math.max(s,.0001)); tmpM.compose(tmpV,tmpQ,tmpS); agentMesh.setMatrixAt(i*TAIL+j,tmpM);
      if(j===0){ const g=agentGlow.arr, o=i*3; if(a.on>.05){ g[o]=tmpV.x; g[o+1]=tmpV.y; g[o+2]=tmpV.z; } else g[o+1]=-999; } // world sits at the origin, so these are world coordinates
    }
  });
  agentMesh.instanceMatrix.needsUpdate=true; agentGlow.geo.attributes.position.needsUpdate=true;

  // workflow
  wfMat.opacity=S.build*.95; wfMat.visible=S.build>.01; lead.visible=S.build>.02;
  if(mode==='build'){
    if(wf.pause>0){ wf.pause-=dt; if(wf.pause<=0 && wf.done) wfReset(); }
    else { wf.t+=dt/1.15; const a=wfArcs[wf.i]; a.geo.setDrawRange(0,Math.floor(ease(Math.min(wf.t,1))*WSEG)*WRAD*6);
      if(wf.t>=1){ wf.i++; wf.t=0; stepEls.forEach((s,j)=>{s.classList.toggle('on',j<=wf.i); s.classList.toggle('cur',j===wf.i);}); markNode(STEPS[wf.i][0]);
        if(wf.i>=wfArcs.length){wf.i=wfArcs.length-1; wf.t=1; wf.done=true; wf.pause=2.6;} else wf.pause=.5; } }
    wfArcs[wf.i].curve.getPoint(ease(Math.min(wf.t,1)),lead.position);
  }
  lead.scale.setScalar(S.build*(1+.08*Math.sin(time*6)));
  if(lead.visible){ leadGlow.arr[0]=lead.position.x; leadGlow.arr[1]=lead.position.y; leadGlow.arr[2]=lead.position.z; } else leadGlow.arr[1]=-999;
  leadGlow.geo.attributes.position.needsUpdate=true;

  // failures
  if(mode==='know'){
    nEnc+=dt*(1700+600*Math.sin(time*1.7)); hudN.textContent=Math.floor(nEnc).toLocaleString('en-US');
    failClock-=dt;
    if(failClock<=0){ failClock=.75+Math.random()*.7; const f=fails.find(f=>f.life<=0);
      if(f){ const keys=Object.keys(nodes).filter(k=>k!==lastFailNode); const key=keys[Math.floor(Math.random()*keys.length)]; lastFailNode=key;
        f.life=1.9; f.pos.copy(nodes[key].pos); f.ring.position.set(f.pos.x,.1,f.pos.z); f.el.textContent=FAILS[Math.floor(Math.random()*FAILS.length)]; f.tag.dirty=true; nFail++; hudF.textContent=nFail; } }
  }
  fails.forEach(f=>{ if(f.life>0){ f.life-=dt; const p=1-f.life/1.9; f.ring.visible=true; f.ring.scale.setScalar(1+p*2.6); f.mat.opacity=(1-p)*.9*S.know;
      f.el.classList.toggle('show',f.life>.25&&mode==='know'); f.at.set(f.pos.x,3.25,f.pos.z); } else {f.ring.visible=false; f.el.classList.remove('show');} });

  // monitoring pulse
  pulses.forEach(p=>{const q=((time/3.6)+p.off)%1; p.r.scale.setScalar(1.2+q*12.5); p.mat.opacity=(1-q)*.42*S.wire; p.r.visible=S.wire>.02;});

  // labels
  layoutLabels(dt);

  renderer.render(scene,cam);
  if(!drawn){ drawn = true; stageEl.classList.add('live'); } // the first frame is on screen: the still image can go
}

// Start in whatever theme the page is already showing, without playing the transition into it.
const start = mode;
onMode(start);
if(start!=='overview'){Object.assign(S,MODES[start]); S.sim=start==='know'?1:0; S.ov=0; S[start]=1; agents.forEach((a,i)=>a.on=i<QUOTA[start]?1:0);} else agents.forEach((a,i)=>{a.arc=pickArc('overview'); a.on=i<QUOTA.overview?1:0;});

// Everything is in place. Fix the transforms of what never moves, so they are not recomputed each frame, and draw the shadows once.
const moving = new Set([core, shell, lead, scan, ...fails.map(f=>f.ring), ...pulses.map(p=>p.r)]);
scene.updateMatrixWorld(true);
world.traverse(o=>{ if(!moving.has(o)) o.matrixAutoUpdate=false; });
renderer.shadowMap.needsUpdate = true;
requestAnimationFrame(frame);
(window.requestIdleCallback||setTimeout)(buildEdgesWhenIdle);

/* Called by home.js when the theme changes. */
export function setMode(m){ onMode(m); }
