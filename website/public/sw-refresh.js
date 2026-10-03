// Imported by the generated worker so tabs with legacy bootstrap code can recover.
const clientReadyMessage = "DENUCHANGE_CLIENT_READY";

function clientHandlesWorkerUpdates(client) {
  if (typeof MessageChannel === "undefined") return Promise.resolve(false);

  return new Promise((resolve) => {
    const channel = new MessageChannel();
    let settled = false;
    const finish = (ready) => {
      if (settled) return;
      settled = true;
      self.clearTimeout(timeout);
      channel.port1.close();
      channel.port2.close();
      resolve(ready);
    };
    const timeout = self.setTimeout(() => finish(false), 700);
    channel.port1.onmessage = (event) => {
      if (event.data?.type === clientReadyMessage) finish(true);
    };

    try {
      client.postMessage({ type: clientReadyMessage }, [channel.port2]);
    } catch {
      finish(false);
    }
  });
}

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const scope = new URL(self.registration.scope);
    if (scope.origin !== self.location.origin) return;

    await self.clients.claim();
    const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    await Promise.allSettled(clients.map(async (client) => {
      if (client.type !== "window" || client.frameType !== "top-level") return;
      const url = new URL(client.url);
      if (url.origin !== scope.origin || !url.pathname.startsWith(scope.pathname)) return;
      if (await clientHandlesWorkerUpdates(client)) return;

      // A navigation fetch can wait for activation. Do not await it inside waitUntil.
      try {
        const navigation = client.navigate(client.url);
        void navigation.catch(() => {});
      } catch {
        // A closing tab must not prevent other clients from recovering.
      }
    }));
  })());
});
