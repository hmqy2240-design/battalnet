/* BATTAL NET V108 PWA
 * Keeps the original app-shell cache strategy. Supabase/auth/data requests are never cached.
 * Adds Web Push notification display and notification-click navigation.
 */
const CACHE='battal-net-v108-pwa-v1';
const SHELL=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys()
    .then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key))))
    .then(()=>self.clients.claim()));
});

self.addEventListener('fetch',event=>{
  const request=event.request;
  const url=new URL(request.url);
  if(request.method!=='GET'||url.origin!==self.location.origin)return;
  if(request.mode==='navigate'){
    event.respondWith(fetch(request).then(response=>{
      if(response&&response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put('./index.html',copy));}
      return response;
    }).catch(()=>caches.match('./index.html').then(cached=>cached||caches.match('./'))));
    return;
  }
  if(SHELL.some(path=>url.pathname.endsWith(path.replace('./','/')))){
    event.respondWith(caches.match(request).then(cached=>cached||fetch(request).then(response=>{
      if(response&&response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(request,copy));}
      return response;
    })));
  }
});

// Fired by the browser when a configured Push Service delivers a message,
// including while the page is closed (permission and subscription required).
self.addEventListener('push',event=>{
  let payload={};
  try{payload=event.data?event.data.json():{};}catch(_){
    try{payload={body:event.data?event.data.text():''};}catch(__){payload={};}
  }
  const title=payload.title||'شكوى جديدة · BATTAL NET';
  const options={
    body:payload.body||'وصلك تحديث جديد بخصوص طلبات المشتركين.',
    icon:payload.icon||'./icon-192.png',
    badge:payload.badge||'./icon-192.png',
    tag:payload.tag||('battal-net-'+(payload.request_code||Date.now())),
    renotify:true,
    requireInteraction:true,
    data:{url:payload.url||'./index.html',request_code:payload.request_code||''},
    vibrate:[180,90,180]
  };
  event.waitUntil(self.registration.showNotification(title,options));
});

self.addEventListener('notificationclick',event=>{
  event.notification.close();
  const target=new URL(event.notification.data?.url||'./index.html',self.location.origin).href;
  event.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(clientList=>{
    for(const client of clientList){
      if('focus' in client){
        if('navigate' in client)client.navigate(target);
        return client.focus();
      }
    }
    return self.clients.openWindow?self.clients.openWindow(target):undefined;
  }));
});
