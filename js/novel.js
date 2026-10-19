(()=>{
const N=window.NOVEL,C=N.chapters,root=document.documentElement,$=id=>document.getElementById(id);
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
const store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
const hasHi=s=>/[ऀ-ॿ]/.test(s);
const m0=store.get('nw-mode');if(m0)root.dataset.mode=m0;
const meta=document.querySelector('meta[name=theme-color]');
const sync=()=>meta.content=(document.body.classList.contains('reading')||root.dataset.mode==='paper')?'#EFE7D8':'#0D0E1B';sync();
$('mode').onclick=()=>{const m=root.dataset.mode==='paper'?'night':'paper';root.dataset.mode=m;store.set('nw-mode',m);sync()};
const library=$('library'),toc=$('toc'),reader=$('reader'),read=$('read'),page=$('page'),fs=$('fs');
let cur=0,io=null,heads=[],selectedBook='skills';

/* render library shelf */
if(window.NOVELS&&$('library-grid')){
  $('library-grid').innerHTML=window.NOVELS.map(b=>{
    const hasChapters=b.chaptersFile!=null;
    return `<article class="novel-card${hasChapters?'':' locked'}" style="--accent-card:${b.color||'var(--coral)'}">
      <div>
        <div class="nc-head">
          <span class="nc-genre">${esc(b.genre)}</span>
          <span class="nc-badge">${esc(b.badge)}</span>
        </div>
        <h2>${esc(b.title)}</h2>
        <p class="nc-desc">${esc(b.tagline)}</p>
      </div>
      <div>
        <a class="nc-enter" href="${hasChapters?'#book='+b.id:'javascript:void(0)'}">
          ${hasChapters?'Enter Book & Chapters →':'Drafting in Progress'}
        </a>
      </div>
    </article>`;
  }).join('');
}

$('blurb').textContent=N.blurb;
/* contents */
const idx=n=>C.findIndex(c=>c.n===n);
$('chapters').innerHTML=C.map(c=>`<li><a href="#ch=${c.n}"><span class="no">${esc(c.label)}</span><span class="tt">${esc(c.title)}${c.sub?`<small>${esc(c.sub)}</small>`:''}</span><span class="st ${c.inProgress?'':'done'}">${c.inProgress?'✎ in progress':(c.sample?'sample':'ready')}</span></a></li>`).join('');

function lastRead(){const n=parseInt(store.get('nw-novel-ch'),10);return C.some(c=>c.n===n)?n:null}
const lr=lastRead();
if(lr!==null&&lr!==C[0].n){$('cont').textContent=`Continue Reading · ${C[idx(lr)].label} →`;$('cont').onclick=()=>location.hash=`ch=${lr}`}
else $('cont').onclick=()=>location.hash=`ch=${C[0].n}`;

/* navigation buttons */
if($('backToLib'))$('backToLib').onclick=()=>location.hash='';
if($('backToToc'))$('backToToc').onclick=()=>location.hash='#book=skills';

/* chapter */
function blocksHTML(bs){
  return bs.map(b=>{
    if(b.t==='h')return`<h3 class="rv sec"${hasHi(b.x)?' lang="hi"':''}>${esc(b.x)}</h3>`;
    if(b.t==='q')return`<blockquote class="rv"${hasHi(b.x)?' lang="hi"':''}>${esc(b.x)}</blockquote>`;
    if(b.t==='br')return`<p class="sb rv" aria-hidden="true">·&nbsp;·&nbsp;·</p>`;
    return`<p class="rv"${hasHi(b.x)?' lang="hi"':''}>${esc(b.x)}</p>`}).join('');
}

function fill(i){
  const c=C[i];cur=i;
  $('cno').textContent=c.label;$('ctitle').textContent=c.title;$('csub').textContent=c.sub||'';
  $('prose').innerHTML=blocksHTML(c.blocks);
  $('wip').hidden=!c.inProgress;
  const p=C[i-1],n=C[i+1];
  $('prevC').textContent=p?`← ${p.label}`:'';$('nextC').textContent=n?`${n.label} →`:'';
  document.title=`${c.label} · ${N.title} · Nightwalker`;
  store.set('nw-novel-ch',c.n);
  /* progress rail: one dot per sub-heading */
  heads=[...document.querySelectorAll('#prose .sec')];
  $('pdots').innerHTML=heads.map((h,k)=>`<li style="top:${heads.length>1?k/(heads.length-1)*100:0}%"><button data-k="${k}" aria-label="${esc(h.textContent)}"><span>${esc(h.textContent)}</span></button></li>`).join('');
  $('prail').hidden=heads.length<2;
  if(io)io.disconnect();
  io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('on')}),{threshold:.12});
  document.querySelectorAll('#prose .rv').forEach(el=>reduce?el.classList.add('on'):io.observe(el));
  scrollTo(0,0);onScroll();
}

$('pdots').onclick=e=>{const b=e.target.closest('button');if(b)heads[+b.dataset.k].scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'})};

function onScroll(){
  if(reader.hidden){$('topfill').style.width='0';return}
  const r=page.getBoundingClientRect(),total=r.height-innerHeight*.6;
  const f=Math.max(0,Math.min(1,(-r.top+innerHeight*.3)/Math.max(total,1)));
  $('topfill').style.width=f*100+'%';$('pfill').style.height=f*100+'%';
  let on=-1;heads.forEach((h,k)=>{if(h.getBoundingClientRect().top<innerHeight*.4)on=k});
  [...$('pdots').querySelectorAll('button')].forEach((b,k)=>b.classList.toggle('on',k<=on));
}
addEventListener('scroll',onScroll,{passive:true});addEventListener('resize',onScroll);

function showLibrary(){
  library.hidden=false;toc.hidden=true;reader.hidden=true;
  read.hidden=true;fs.hidden=true;document.body.classList.remove('reading');
  read.setAttribute('aria-pressed','false');sync();
  document.title='Novels & Memoirs · Nightwalker';scrollTo(0,0);onScroll();
}

function showToc(){
  library.hidden=true;reader.hidden=true;toc.hidden=false;
  read.hidden=true;fs.hidden=true;document.body.classList.remove('reading');
  read.setAttribute('aria-pressed','false');sync();
  document.title=`${N.title} · Nightwalker`;scrollTo(0,0);onScroll();
}

function route(){
  const h=location.hash.slice(1);
  if(!h){
    showLibrary();
    return;
  }
  if(h.startsWith('ch=')){
    const n=parseInt(h.split('ch=')[1],10),i=idx(n);
    if(i>=0){
      const was=!reader.hidden&&cur!==i;
      library.hidden=true;toc.hidden=true;reader.hidden=false;read.hidden=false;fs.hidden=false;
      fill(i);
      if(was&&window.NW)NW.flip();
      page.focus({preventScroll:true});
    }else showToc();
  }else if(h.startsWith('book=')){
    showToc();
  }else{
    const n=parseInt(h,10);
    if(!isNaN(n)&&idx(n)>=0)location.hash=`ch=${n}`;
    else showLibrary();
  }
}
addEventListener('hashchange',route);
const step=d=>{const j=cur+d;if(C[j])location.hash=`ch=${C[j].n}`};
$('prevC').onclick=()=>step(-1);$('nextC').onclick=()=>step(1);
$('tocC').onclick=()=>location.hash='#book=skills';
addEventListener('keydown',e=>{
  if(reader.hidden||e.target.closest('input,textarea'))return;
  if(e.key==='ArrowRight'&&e.altKey)step(1);else if(e.key==='ArrowLeft'&&e.altKey)step(-1);
  else if(e.key==='Escape'){document.body.classList.contains('reading')?read.click():$('tocC').click()}
});
/* reading mode + font size */
read.onclick=()=>{const on=document.body.classList.toggle('reading');if(on)read.blur();read.setAttribute('aria-pressed',on);sync()};
let size=parseFloat(store.get('nw-novel-fs'))||1.3;
const applySize=()=>{page.style.setProperty('--fs',size+'rem');store.set('nw-novel-fs',size)};
if(store.get('nw-novel-fs'))applySize();
$('fsm').onclick=()=>{size=Math.max(1.05,size-.1);applySize()};
$('fsp').onclick=()=>{size=Math.min(1.9,size+.1);applySize()};
route();
})();
