// Runs before the app, with no dependency on its cached modules or rendering.
(() => {
  const loadedVersion = document.querySelector('meta[name="denuchange-release"]')?.content;
  const scriptURL = document.currentScript?.src;
  if (!loadedVersion || !scriptURL) return;

  const base = new URL('.', scriptURL);
  const worker = navigator.serviceWorker;
  let hadController = Boolean(worker?.controller);
  let needsReload = false;
  let reloading = false;
  let checking = false;
  let failedChunk = false;

  const reload = (targetVersion) => {
    if (reloading) return;
    if (targetVersion) {
      try {
        const key = 'denuchange:release-reload';
        const previous = JSON.parse(window.sessionStorage.getItem(key) || 'null');
        const now = Date.now();
        if (previous?.from === loadedVersion && previous.to === targetVersion && now - previous.at < 30_000) return;
        window.sessionStorage.setItem(key, JSON.stringify({ from: loadedVersion, to: targetVersion, at: now }));
      } catch {
        // Storage may be unavailable; updates must still work in private browsing.
      }
    }
    reloading = true;
    window.location.reload();
  };

  // Install listeners before registering: a worker can take control immediately.
  if (worker) {
    worker.addEventListener('controllerchange', () => {
      if (!worker.controller) return;
      if (hadController || needsReload) reload();
      hadController = true;
    });
    worker.addEventListener('message', (event) => {
      if (event.data?.type === 'DENUCHANGE_CLIENT_READY') {
        event.ports?.[0]?.postMessage({ type: 'DENUCHANGE_CLIENT_READY' });
      }
    });
  }

  const registerWorker = () => worker
    ? worker.register(new URL('sw.js', base).href, {
      scope: base.pathname, updateViaCache: 'none',
    }).catch(() => undefined)
    : Promise.resolve(undefined);
  let registrationReady = registerWorker();

  const checkRelease = async () => {
    if (checking || reloading || !navigator.onLine || document.visibilityState === 'hidden') return;
    checking = true;
    try {
      const response = await fetch(new URL('version.json', base), { cache: 'no-store' });
      if (!response.ok) return;
      const release = await response.json();
      if (typeof release.version !== 'string' || !release.version.trim()) return;
      needsReload = release.version !== loadedVersion || failedChunk;

      const registration = await registrationReady;
      if (worker && !registration) {
        registrationReady = registerWorker();
        return;
      }
      if (registration && !registration.installing) await registration.update();
      if (!needsReload || reloading) return;
      if (registration?.installing || registration?.waiting) return;
      reload(release.version);
    } catch {
      // Keep the usable page offline; the next resume/reconnect/check retries.
    } finally {
      checking = false;
    }
  };

  void checkRelease();
  window.setInterval(() => void checkRelease(), 30_000);
  for (const event of ['focus', 'online', 'pageshow']) {
    window.addEventListener(event, () => void checkRelease());
  }
  document.addEventListener('visibilitychange', () => void checkRelease());
  window.addEventListener('vite:preloadError', (event) => {
    failedChunk = true;
    event.preventDefault();
    void checkRelease();
  });
})();
