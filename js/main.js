(()=>{
const root=document.documentElement;
try{const m=localStorage.getItem('nw-mode');if(m)root.dataset.mode=m}catch(e){}
document.getElementById('mode').onclick=()=>{
  const m=root.dataset.mode==='paper'?'night':'paper';root.dataset.mode=m;
  document.querySelector('meta[name=theme-color]').content=m==='paper'?'#EFE7D8':'#0D0E1B';
  try{localStorage.setItem('nw-mode',m)}catch(e){}
};
const lines=[...document.querySelectorAll('.poem p')];
new IntersectionObserver((es,o)=>{es.forEach(e=>{if(e.isIntersecting){lines.forEach((p,i)=>setTimeout(()=>p.classList.add('on'),i*700));o.disconnect()}})},{threshold:.4}).observe(document.querySelector('.poster'));
const ps=[...document.querySelectorAll('.ridge path')];
if(!matchMedia('(prefers-reduced-motion:reduce)').matches)addEventListener('scroll',()=>{ps.forEach((p,i)=>p.style.transform=`translateY(${-Math.min(scrollY*.03*(i+1),30)}px)`)},{passive:true});
const rail=document.querySelector('.rail'),secs=[...document.querySelectorAll('main > section')];
secs.forEach(()=>rail.appendChild(document.createElement('i')));
const dots=[...rail.children];
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)dots.forEach((d,i)=>d.classList.toggle('on',secs[i]===e.target))}),{threshold:.45});
secs.forEach(s=>io.observe(s));
})();
