(()=>{
const P=window.POSTS,root=document.documentElement,$=id=>document.getElementById(id);
const store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
const hasHi=s=>/[ऀ-ॿ]/.test(s);
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
const m0=store.get('nw-mode');if(m0)root.dataset.mode=m0;
const meta=document.querySelector('meta[name=theme-color]');
const sync=()=>meta.content=root.dataset.mode==='paper'?'#EFE7D8':'#0D0E1B';sync();
$('mode').onclick=()=>{const m=root.dataset.mode==='paper'?'night':'paper';root.dataset.mode=m;store.set('nw-mode',m);sync()};
const fmt=d=>new Date(d+'T00:00:00').toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});
/* prayer-flag bunting */
const cols=['#7FA6C9','#ECE8F2','#E8795A','#7FB38A','#F2A65A'];
$('fl').innerHTML=Array.from({length:14},(_,i)=>{const x=14+i*27,y=8+Math.sin(i/2.2)*7+i*.25;return`<path d="M${x} ${y} l16 2 l-1 15 z" fill="${cols[i%5]}" opacity=".8"/>`}).join('');
const sorted=[...P].sort((a,b)=>b.date.localeCompare(a.date));
$('posts').innerHTML=sorted.map(p=>`<li><a href="#${esc(p.slug)}"><img src="${esc(p.slides[0]?.img||'')}" alt="" loading="lazy"><div><p class="m">${fmt(p.date)} · ${esc(p.place||'')}</p><h3>${esc(p.title)}</h3><p class="s">${esc(p.sub||'')}</p></div></a></li>`).join('');
const track=null;let cur=null;

/* font resize & reading mode */
let fsi=1;const fss=['1rem','1.08rem','1.18rem','1.28rem'];
const fsWrap=$('fs'),fsm=$('fsm'),fsp=$('fsp'),readBtn=$('read');
function setFs(i){fsi=Math.max(0,Math.min(fss.length-1,i));document.documentElement.style.setProperty('--blog-fs',fss[fsi]);if(fsm)fsm.disabled=fsi===0;if(fsp)fsp.disabled=fsi===fss.length-1}
if(fsm&&fsp){fsm.onclick=()=>setFs(fsi-1);fsp.onclick=()=>setFs(fsi+1);setFs(1)}
if(readBtn){
  readBtn.onclick=()=>{
    const on=document.body.classList.toggle('reading');
    readBtn.setAttribute('aria-pressed',on);
    store.set('nw-read',on?'1':'0');
  };
  if(store.get('nw-read')==='1'){document.body.classList.add('reading');readBtn.setAttribute('aria-pressed','true')}
}

function open(p){
  cur=p;
  $('pmeta').innerHTML=`${esc(fmt(p.date))} · ${esc(p.place||'')} · <span>${esc(p.mood||'')}</span>`;
  $('ptitle').textContent=p.title;
  $('psub').textContent=p.sub||'';

  const slides=[...(p.slides||[])];
  const totalParas=p.body.filter(b=>b.t==='p').length;
  // Calculate distribution intervals for photos among paragraphs
  let slideIdx=0;
  const interval=slides.length?Math.max(2,Math.floor(totalParas/(slides.length+1))):999;
  let pCount=0;

  let html='';
  p.body.forEach((b)=>{
    const l=hasHi(b.x||'')?' lang="hi"':'',x=esc(b.x||'');
    if(b.t==='h'){
      html+=`<h3${l}>${x}</h3>`;
    }else if(b.t==='q'){
      html+=`<blockquote${l}>${x}</blockquote>`;
    }else if(b.t==='br'){
      html+='<p class="sb" aria-hidden="true">·&nbsp;·&nbsp;·</p>';
    }else{
      pCount++;
      html+=`<p${l}>${x}</p>`;
      // Check if we should insert an inline photo story block
      if(slideIdx<slides.length&&(pCount%interval===0||pCount===totalParas&&slideIdx<slides.length)){
        const s=slides[slideIdx++];
        html+=`<figure class="inline-photo">
          <div class="photo-frame"><img src="${esc(s.img)}" alt="${esc(s.text||p.title)}" loading="lazy"></div>
          ${s.text?`<figcaption>${esc(s.text)}</figcaption>`:''}
        </figure>`;
      }
    }
  });

  // Any remaining slides if total paragraphs were few
  while(slideIdx<slides.length){
    const s=slides[slideIdx++];
    html+=`<figure class="inline-photo">
      <div class="photo-frame"><img src="${esc(s.img)}" alt="${esc(s.text||p.title)}" loading="lazy"></div>
      ${s.text?`<figcaption>${esc(s.text)}</figcaption>`:''}
    </figure>`;
  }

  $('body').innerHTML=html;
  $('sample').hidden=!p.sample;
  document.title=`${p.title} · Diary · Nightwalker`;
  $('index').hidden=true;
  $('post').hidden=false;
  if(fsWrap)fsWrap.hidden=false;
  if(readBtn)readBtn.hidden=false;
  scrollTo(0,0);
}

if($('topBack'))$('topBack').onclick=()=>location.hash='';
if($('back'))$('back').onclick=e=>{e.preventDefault();location.hash=''};

function route(){
  const p=P.find(x=>x.slug===decodeURIComponent(location.hash.slice(1)));
  if(p){
    open(p);
  }else{
    $('post').hidden=true;
    $('index').hidden=false;
    if(fsWrap)fsWrap.hidden=true;
    if(readBtn){
      readBtn.hidden=true;
      readBtn.setAttribute('aria-pressed','false');
    }
    document.body.classList.remove('reading');
    document.title='डायरी · Nightwalker';
  }
  onScroll();
}

function onScroll(){
  const h=document.documentElement.scrollHeight-innerHeight;
  $('topfill').style.width=($('post').hidden||h<=0?0:scrollY/h*100)+'%';
}

addEventListener('scroll',onScroll,{passive:true});
addEventListener('hashchange',route);
addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('post').hidden)location.hash=''});
route();
})();
