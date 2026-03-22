const CACHE = 'nurse-call-v2';
const FILES = ['./index.html', './manifest.json', './icon.svg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});

self.addEventListener('push', e => {
  const data = e.data?.json() || {};
  const msg  = data.message || '呼ばれています';
  let icon = '📢';
  if (msg.includes('ミルク'))   icon = '🍼';
  else if (msg.includes('交代')) icon = '🔄';

  e.waitUntil(
    self.registration.showNotification(data.title || `ナースコール ${icon}`, {
      body: msg,
      icon: './icon.svg',
      badge: './icon.svg',
      vibrate: [300, 100, 300, 100, 300],
      requireInteraction: true,
    })
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow('./'));
});
