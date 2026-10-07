/* Ceci 课时管家 Service Worker - Network-first：更新推送后用户立即拿到新版，离线时回退缓存
   版本历史：
   v1 — 初版
   v2 — 改为 network-first
   v3 — 更换图标为用户上传附件 + 多尺寸；徽标改为手写 Ceci；名称改为 Ceci 课时管家
   v4 — 学生档案时间窗改为自定义日期范围 + 快捷选项
*/
const CACHE = 'lesson-manager-v4';
const ASSETS = ['./', './index.html', './manifest.json', './icon-180.png', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() => caches.match(e.request).then(hit => hit || caches.match('./index.html')))
  );
});
