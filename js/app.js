/* Shared on every page: offline (service worker), phone tab bar, skip link, quill cursor, page-flip sound. */
(()=>{
const store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
const fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
const here=location.pathname.split('/').pop()||'index.html';

/* 1. offline */
if('serviceWorker' in navigator&&/^https?:$/.test(location.protocol))addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));

/* 2. skip link (button-like, so it never touches the #hash routing of poetry/novel) */
const main=document.querySelector('main');
if(main){main.id=main.id||'main';main.tabIndex=-1;
  const a=document.createElement('a');a.className='skip';a.href='#'+main.id;a.textContent='सीधे पढ़ने पर जाएँ';
  a.onclick=e=>{e.preventDefault();main.focus({preventScroll:true});main.scrollIntoView()};
  document.body.prepend(a)}

/* 3. phone tab bar (the top nav is hidden on small screens) */
const ic=p=>`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const TABS=[
 ['index.html','Home',ic('<path d="M4 20V11a8 8 0 0 1 16 0v9z"/><path d="M10 20v-5a2 2 0 0 1 4 0v5"/>')],
 ['poetry.html','Poetry',ic('<path d="M20 4c-7 0-12 4-13 11l-2 5 5-2c7-1 10-6 10-14z"/><path d="M9 15l6-6"/>')],
 ['novel.html','Novel',ic('<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 21V5M8 7h7"/>')],
 ['blog.html','Blog',ic('<path d="M3 20l6-10 4 6 3-4 5 8z"/><circle cx="17" cy="6" r="1.5"/>')],
 ['photos.html','Photos',ic('<rect x="3" y="6" width="18" height="14" rx="2"/><circle cx="12" cy="13" r="3.5"/><path d="M8 6l1.5-2h5L16 6"/>')],
 ['sketches.html','Sketch',ic('<path d="M4 20l1-4L16 5l3 3L8 19z"/><path d="M14 7l3 3"/>')]];
const nav=document.createElement('nav');nav.className='tabs';nav.setAttribute('aria-label','Sections');
nav.innerHTML=TABS.map(([h,l,i])=>`<a href="${h}"${h===here?' aria-current="page"':''}>${i}<span>${l}</span></a>`).join('');
document.body.appendChild(nav);

/* 4. sound: soft page-flip made with WebAudio (no file). Default OFF. */
let ctx=null,soundOn=store.get('nw-sound')==='1';
function flip(){
  if(!soundOn)return;
  try{
    ctx=ctx||new (window.AudioContext||window.webkitAudioContext)();if(ctx.state==='suspended')ctx.resume();
    const dur=.34,n=Math.floor(ctx.sampleRate*dur),buf=ctx.createBuffer(1,n,ctx.sampleRate),d=buf.getChannelData(0);
    for(let i=0;i<n;i++){const t=i/n;d[i]=(Math.random()*2-1)*Math.pow(1-t,2.2)*(t<.04?t/.04:1)*(1+.6*Math.sin(t*38))}
    const s=ctx.createBufferSource();s.buffer=buf;
    const f=ctx.createBiquadFilter();f.type='bandpass';f.Q.value=.9;f.frequency.setValueAtTime(3200,ctx.currentTime);f.frequency.exponentialRampToValueAtTime(900,ctx.currentTime+dur);
    const g=ctx.createGain();g.gain.value=.12;
    s.connect(f).connect(g).connect(ctx.destination);s.start();
  }catch(e){}
}
window.NW={flip};

/* 5. header toggles: sound (all devices), quill cursor (mouse devices) */
const modeBtn=document.getElementById('mode');
function addToggle(id,glyph,label,get,set){
  if(!modeBtn)return;
  const b=document.createElement('button');b.className='mode fx';b.id=id;b.type='button';b.textContent=glyph;
  const paint=()=>{b.setAttribute('aria-pressed',get());b.setAttribute('aria-label',label+(get()?': चालू':': बंद'));b.title=b.getAttribute('aria-label')};
  b.onclick=()=>{set(!get());paint()};paint();modeBtn.before(b);
}
addToggle('snd','♪','पन्ना पलटने की आवाज़',()=>soundOn,v=>{soundOn=v;store.set('nw-sound',v?'1':'0');if(v)flip()});

if(fine){
  let curOn=store.get('nw-cursor')!=='0';
  const q=document.createElement('div');q.className='quill';q.setAttribute('aria-hidden','true');
  q.innerHTML='<svg viewBox="0 0 32 32" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M28 3C17 3 9 9 8 20l-3 7 7-3C23 23 28 14 28 3z"/><path d="M12 22L22 11M5 27l3-5"/></svg>';
  document.body.appendChild(q);
  let x=-50,y=-50,tx=-50,ty=-50,raf=0,seen=false;
  const apply=()=>{q.style.transform=`translate(${x}px,${y}px)`};
  const loop=()=>{x+=(tx-x)*.28;y+=(ty-y)*.28;apply();raf=(Math.abs(tx-x)+Math.abs(ty-y)>.3)?requestAnimationFrame(loop):0};
  addEventListener('mousemove',e=>{tx=e.clientX;ty=e.clientY-26;if(!seen){seen=true;x=tx;y=ty;q.classList.add('on')}
    if(reduce){x=tx;y=ty;apply()}else if(!raf)raf=requestAnimationFrame(loop);
    q.classList.toggle('hot',!!e.target.closest('a,button,[role=button],input,summary'))},{passive:true});
  document.addEventListener('mouseleave',()=>q.classList.remove('on'));
  document.addEventListener('mouseenter',()=>seen&&q.classList.add('on'));
  const paint=()=>document.documentElement.classList.toggle('quill-off',!curOn);paint();
  addToggle('cur','✒','क़लम वाला कर्सर',()=>curOn,v=>{curOn=v;store.set('nw-cursor',v?'1':'0');paint()});
}
})();
