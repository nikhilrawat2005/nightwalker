/* Nightwalker service worker: offline padhna.
   - pages/css/js/data: pehle network (taaki naya content turant dikhe), 4 sec mein na aaye to cache
   - images/fonts: cache se turant, peeche se refresh
   VERSION badlo to purana cache saaf ho jaata hai. */
const VERSION='nw-v14';
const SHELL=['./','index.html','poetry.html','novel.html','blog.html','photos.html','sketches.html','offline.html',
 'css/style.css','css/poetry.css','css/novel.css','css/blog.css','css/gallery.css',
 'js/app.js','js/main.js','js/poetry.js','js/poems.js','js/novel.js','js/novels_data.js','js/chapters.js','js/blog.js','js/posts.js','js/gallery.js','js/photos.js','js/sketches.js',
 'assets/hero.webp','assets/peaks.webp','icons/icon-192.png','manifest.webmanifest'];
const IMG_MAX=80;
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>Promise.all(SHELL.map(u=>c.add(u).catch(()=>{})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
const trim=async(c,max)=>{const ks=await c.keys();if(ks.length>max)await Promise.all(ks.slice(0,ks.length-max).map(k=>c.delete(k)))};
async function networkFirst(req){
  const c=await caches.open(VERSION);
  try{
    const r=await Promise.race([fetch(req),new Promise((_,j)=>setTimeout(j,4000))]);
    if(r&&r.ok)c.put(req,r.clone());return r;
  }catch(_){
    const hit=await c.match(req,{ignoreSearch:true});if(hit)return hit;
    if(req.mode==='navigate')return (await c.match('offline.html'))||Response.error();
    return Response.error();
  }
}
async function swr(req,isImg){
  const c=await caches.open(VERSION),hit=await c.match(req);
  const net=fetch(req).then(r=>{if(r&&(r.ok||r.type==='opaque')){c.put(req,r.clone());if(isImg)trim(c,SHELL.length+IMG_MAX)}return r}).catch(()=>null);
  return hit||(await net)||Response.error();
}
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const u=new URL(req.url);
  if(u.origin===location.origin){
    if(/\.(webp|png|jpe?g|gif|svg|avif)$/i.test(u.pathname))return void e.respondWith(swr(req,true));
    return void e.respondWith(networkFirst(req));
  }
  if(/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname))e.respondWith(swr(req,false));
});
