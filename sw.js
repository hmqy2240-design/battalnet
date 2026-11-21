/* BATTAL NET V84 PWA: cache app shell only, never cache Supabase/auth/data requests. */
const CACHE='battal-net-v84-pwa-v2';
const SHELL=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{const r=e.request,u=new URL(r.url);if(r.method!=='GET'||u.origin!==self.location.origin)return;if(r.mode==='navigate'){e.respondWith(fetch(r).then(res=>{if(res&&res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put('./index.html',cp))}return res}).catch(()=>caches.match('./index.html').then(x=>x||caches.match('./'))));return;}if(SHELL.some(x=>u.pathname.endsWith(x.replace('./','/')))){e.respondWith(caches.match(r).then(x=>x||fetch(r).then(res=>{if(res&&res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp))}return res})));}});
