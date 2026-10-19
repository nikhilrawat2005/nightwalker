(()=>{
const P=window.POEMS,root=document.documentElement,$=id=>document.getElementById(id);
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
const pad=n=>String(n).padStart(2,'0');
try{const m=localStorage.getItem('nw-mode');if(m)root.dataset.mode=m}catch(e){}
const themeMeta=document.querySelector('meta[name=theme-color]');
const syncTheme=()=>themeMeta.content=root.dataset.mode==='paper'?'#EFE7D8':'#0D0E1B';syncTheme();
$('mode').onclick=()=>{const m=root.dataset.mode==='paper'?'night':'paper';root.dataset.mode=m;syncTheme();try{localStorage.setItem('nw-mode',m)}catch(e){}};
const toc=$('toc'),reader=$('reader'),leaf=$('leaf'),read=$('read');
let cur=0,timers=[],mood='सब',busy=false;
/* index */
const moods=['सब',...new Set(P.map(p=>p.mood))];
$('moods').innerHTML=moods.map(m=>`<button class="chip" aria-pressed="${m===mood}" data-m="${m}">${m}</button>`).join('');
$('moods').onclick=e=>{const b=e.target.closest('.chip');if(!b)return;mood=b.dataset.m;[...$('moods').children].forEach(c=>c.setAttribute('aria-pressed',c===b));drawList()};
function drawList(){$('list').innerHTML=P.filter(p=>mood==='सब'||p.mood===mood).map(p=>`<li><a href="#${p.n}"><span class="no">№ ${pad(p.n)}</span><span>${p.title}</span><span class="mt">${p.mood}</span></a></li>`).join('')}
drawList();
$('first').onclick=()=>go(1);
$('rand').onclick=()=>go(1+Math.floor(Math.random()*P.length));
/* poem */
function fill(i){
  const p=P[i];cur=i;
  $('stamp').textContent=$('stampM').textContent=`№ ${pad(p.n)}`;
  $('rtitle').textContent=$('rtitleM').textContent=p.title;
  $('mtag').textContent=p.mood;
  $('count').textContent=`${pad(p.n)} / ${P.length}`;
  $('pfill').style.width=(p.n/P.length*100)+'%';
  $('poem').innerHTML=p.stanzas.map(s=>`<div class="st">${s.map(l=>`<p>${l.replace(/&/g,'&amp;').replace(/</g,'&lt;')}</p>`).join('')}</div>`).join('');
  document.title=`${p.title} · कविताएँ · Nightwalker`;
  $('prev').style.visibility=$('prevD').style.visibility=i===0?'hidden':'visible';
  $('next').style.visibility=$('nextD').style.visibility=i===P.length-1?'hidden':'visible';
}
function breathe(){
  timers.forEach(clearTimeout);timers=[];
  const ls=[...document.querySelectorAll('#poem p')];
  if(reduce){ls.forEach(l=>l.classList.add('on'));return}
  let t=250;
  ls.forEach(l=>{timers.push(setTimeout(()=>l.classList.add('on'),t));t+=/(\.\.\.|…)\s*$/.test(l.textContent)?1100:650});
}
function show(n,dir){
  const i=Math.max(0,Math.min(P.length-1,n-1));
  toc.hidden=true;reader.hidden=false;read.hidden=false;
  const swap=()=>{fill(i);scrollTo(0,0);breathe()};
  if(reduce||busy||dir===0){swap();return}
  busy=true;window.NW&&NW.flip();
  const wide=matchMedia('(min-width:900px)').matches;
  const out=wide?[{transform:'rotateY(0)',opacity:1},{transform:'rotateY(-80deg)',opacity:0}]:[{transform:'translateX(0)',opacity:1},{transform:`translateX(${-dir*40}px)`,opacity:0}];
  const inn=wide?[{transform:'rotateY(80deg)',opacity:0},{transform:'rotateY(0)',opacity:1}]:[{transform:`translateX(${dir*40}px)`,opacity:0},{transform:'translateX(0)',opacity:1}];
  leaf.animate(out,{duration:380,easing:'ease-in'}).onfinish=()=>{swap();leaf.animate(inn,{duration:420,easing:'ease-out'}).onfinish=()=>busy=false};
}
function showToc(){timers.forEach(clearTimeout);reader.hidden=true;toc.hidden=false;read.hidden=true;document.body.classList.remove('reading');read.setAttribute('aria-pressed','false');document.title='कविताएँ · Nightwalker';scrollTo(0,0)}
function go(n){location.hash=n}
function route(){
  const n=parseInt(location.hash.slice(1),10);
  if(n>=1&&n<=P.length){const dir=reader.hidden||dir0===0?0:(n-1>cur?1:-1);show(n,dir)}else showToc();
}
let dir0=1;
addEventListener('hashchange',route);
const step=d=>{const n=cur+1+d;if(n>=1&&n<=P.length)go(n)};
$('prev').onclick=$('prevD').onclick=()=>step(-1);
$('next').onclick=$('nextD').onclick=()=>step(1);
const backToc=()=>{history.pushState('',document.title,location.pathname);showToc()};
$('toc2').onclick=$('tocD').onclick=backToc;
addEventListener('keydown',e=>{
  if(reader.hidden)return;
  if(e.key==='ArrowRight')step(1);else if(e.key==='ArrowLeft')step(-1);else if(e.key==='Escape'){if(document.body.classList.contains('reading'))read.click();else backToc()}
});
/* swipe */
let sx=0,sy=0;
reader.addEventListener('touchstart',e=>{sx=e.touches[0].clientX;sy=e.touches[0].clientY;$('hint').style.opacity=0},{passive:true});
reader.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy;if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.6)step(dx<0?1:-1)},{passive:true});
/* reading mode */
read.onclick=()=>{const on=document.body.classList.toggle('reading');read.setAttribute('aria-pressed',on)};
route();
})();
