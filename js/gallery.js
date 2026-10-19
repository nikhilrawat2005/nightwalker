(()=>{
const G=window.GALLERY,root=document.documentElement,$=id=>document.getElementById(id);
const store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
const esc=s=>String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
const m0=store.get('nw-mode');if(m0)root.dataset.mode=m0;
const meta=document.querySelector('meta[name=theme-color]');
const sync=()=>meta.content=root.dataset.mode==='paper'?'#EFE7D8':'#0D0E1B';sync();
$('mode').onclick=()=>{const m=root.dataset.mode==='paper'?'night':'paper';root.dataset.mode=m;store.set('nw-mode',m);sync()};
const fmt=d=>new Date(d+'T00:00:00').toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});
G.items.forEach(it=>{if(!it.date){const m=/(\d{4})(\d{2})(\d{2})/.exec(it.img);if(m)it.date=`${m[1]}-${m[2]}-${m[3]}`}});
const photo=document.body.classList.contains('photo');
$('g').innerHTML=G.items.map((it,i)=>{
  const st=photo?`<span class="stampc">${it.date?`<b>${fmt(it.date)}</b>`:''}${esc(it.place)}${it.title?' · '+esc(it.title):''}</span>`:'';
  return`<figure class="g-item${it.bw?' bw':''}"><button data-i="${i}" aria-label="${esc(it.title||'Photo')} bada dekhein"><img src="${esc(it.img)}" alt="${esc(it.alt||it.title||'')}"${i>2?' loading="lazy"':''}></button>${st}</figure>`}).join('');
if(!G.items.length)$('g').innerHTML='<p class="empty" lang="hi">कागज़ अभी सूख रहा है…<br><small>रेखाचित्र जल्दी ही यहाँ आएँगे।</small></p>';
$('sample').hidden=!G.sample;
const lb=$('lb');let cur=0;
function show(i){cur=(i+G.items.length)%G.items.length;const it=G.items[cur];$('li').src=it.img;$('li').alt=it.alt||it.title||'';lb.classList.toggle('bwi',!!it.bw);
  $('lc').textContent=[it.title,it.place,it.date&&fmt(it.date),`${cur+1} / ${G.items.length}`].filter(Boolean).join(' · ')}
function open(i){show(i);lb.hidden=false;document.body.style.overflow='hidden';$('lx').focus()}
function close(){lb.hidden=true;document.body.style.overflow='';const b=document.querySelector(`[data-i="${cur}"]`);b&&b.focus()}
$('g').onclick=e=>{const b=e.target.closest('button[data-i]');if(b)open(+b.dataset.i)};
$('lx').onclick=close;$('lp').onclick=()=>show(cur-1);$('ln').onclick=()=>show(cur+1);
lb.onclick=e=>{if(e.target===lb)close()};
addEventListener('keydown',e=>{if(lb.hidden)return;if(e.key==='Escape')close();else if(e.key==='ArrowLeft')show(cur-1);else if(e.key==='ArrowRight')show(cur+1)});
let sx=0;lb.addEventListener('touchstart',e=>sx=e.touches[0].clientX,{passive:true});
lb.addEventListener('touchend',e=>{const d=e.changedTouches[0].clientX-sx;if(Math.abs(d)>60)show(cur+(d<0?1:-1))},{passive:true});
/* laptop: wheel scrolls the filmstrip sideways */
const film=document.querySelector('.film');
if(film)film.addEventListener('wheel',e=>{if(innerWidth>=900&&Math.abs(e.deltaY)>Math.abs(e.deltaX)&&film.scrollWidth>film.clientWidth){const max=film.scrollWidth-film.clientWidth;const nx=film.scrollLeft+e.deltaY;if((e.deltaY>0&&film.scrollLeft<max)||(e.deltaY<0&&film.scrollLeft>0)){e.preventDefault();film.scrollLeft=nx}}},{passive:false});
})();
