/* Search and filter. The page arrives as plain HTML, newest first under year headings; this only re-orders and hides what is there. */
(()=>{const $=id=>document.getElementById(id), list=$('list'), form=$('arch');
 const pubs=[...list.querySelectorAll('.pub')].map((el,i)=>({el,i,y:+el.dataset.y,c:+el.dataset.c,v:el.dataset.v,t:el.dataset.t,find:el.dataset.find}));
 const norm=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
 const SORT={new:(a,b)=>b.y-a.y||a.i-b.i, old:(a,b)=>a.y-b.y||b.i-a.i, az:(a,b)=>a.t<b.t?-1:a.t>b.t?1:0};
 // the Year and Venue choices come from the list itself: every year, and every venue with its paper count, most papers first
 [...new Set(pubs.map(p=>p.y).filter(Boolean))].sort((a,b)=>b-a).forEach(y=>$('f-year').add(new Option(y,y)));
 const per={}; pubs.forEach(p=>{ if(p.v) per[p.v]=(per[p.v]||0)+1; });
 Object.keys(per).sort((a,b)=>per[b]-per[a]||(a.toLowerCase()<b.toLowerCase()?-1:1)).forEach(v=>$('f-venue').add(new Option(v+' ('+per[v]+')',v)));
 function draw(){
  const sort=$('f-sort').value, year=$('f-year').value, min=+$('f-cit').value, venue=$('f-venue').value, words=norm($('f-q').value).split(' ').filter(Boolean);
  const hit=pubs.filter(p=>(!year||p.y===+year)&&p.c>=min&&(!venue||p.v===venue)&&words.every(w=>p.find.includes(w))).sort(SORT[sort]);
  const frag=document.createDocumentFragment(); let ol=null, last=null;
  hit.forEach(p=>{ const head=sort==='new'||sort==='old' ? (p.y||'Undated') : '';   // year headings only when the list is in year order
   if(!ol||head!==last){ const sec=document.createElement('section'); sec.className='yr';
    if(head){ const h=document.createElement('h2'); h.textContent=head; sec.appendChild(h); }
    ol=document.createElement('ol'); ol.className='pubs'; sec.appendChild(ol); frag.appendChild(sec); last=head; }
   ol.appendChild(p.el); });
  if(!hit.length){ const n=document.createElement('p'); n.className='none'; n.textContent='No publications match. Try fewer filters.'; frag.appendChild(n); }
  list.replaceChildren(frag);
  $('f-n').textContent='Showing '+hit.length+' of '+pubs.length+' publications';
  $('f-x').hidden=!(year||min||venue||words.length);
 }
 form.hidden=false; form.addEventListener('input',draw); form.addEventListener('submit',e=>e.preventDefault());
 $('f-x').addEventListener('click',()=>{ $('f-year').value=''; $('f-cit').value='0'; $('f-venue').value=''; $('f-q').value=''; draw(); });
})();
