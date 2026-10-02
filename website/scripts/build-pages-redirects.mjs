import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

function redirectPage(destinationPath, title) {
  const destination = `https://denuchange.vercel.app${destinationPath}`
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <link rel="canonical" href="${destination}">
  <script>
    var repositoryPath = "/denuchange";
    var pathname = window.location.pathname;
    var forwardedPath = pathname === repositoryPath ? "/"
      : pathname.indexOf(repositoryPath + "/") === 0 ? pathname.slice(repositoryPath.length) : pathname;
    if (forwardedPath === "/agenda/" || forwardedPath === "/agenda/index.html") forwardedPath = "/agenda";
    var destination = new URL("https://denuchange.vercel.app/");
    destination.pathname = forwardedPath;
    destination.search = window.location.search;
    destination.hash = window.location.hash;
    window.location.replace(destination.href);
  </script>
  <noscript><meta http-equiv="refresh" content="0;url=${destination}"></noscript>
</head>
<body></body>
</html>
`
}

function retiringWorker() {
  // Keep this worker published at its original URL for returning Pages clients.
  return `const repositoryOrigin = "https://uoa-gr.github.io";
const repositoryPath = "/denuchange";
const expectedScope = repositoryOrigin + repositoryPath + "/";

if (self.location.origin === repositoryOrigin && self.registration.scope === expectedScope) {
  self.addEventListener("install", (event) => {
    event.waitUntil(self.skipWaiting());
  });

  self.addEventListener("activate", (event) => {
    event.waitUntil((async () => {
      await self.clients.claim();
      await self.registration.unregister();
      const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      await Promise.allSettled(clients.map(async (client) => {
        const source = new URL(client.url);
        if (source.origin !== repositoryOrigin ||
          (source.pathname !== repositoryPath && !source.pathname.startsWith(repositoryPath + "/"))) return;

        let forwardedPath = source.pathname === repositoryPath ? "/" : source.pathname.slice(repositoryPath.length);
        if (forwardedPath === "/agenda/" || forwardedPath === "/agenda/index.html") forwardedPath = "/agenda";
        const destination = new URL("https://denuchange.vercel.app/");
        destination.pathname = forwardedPath;
        destination.search = source.search;
        destination.hash = source.hash;
        await client.navigate(destination.href);
      }));
    })());
  });
}
`
}

export async function buildPagesRedirects(outputDirectory) {
  await mkdir(path.join(outputDirectory, "agenda"), { recursive: true })
  const homepage = redirectPage("/", "IAG DENUCHANGE Workshop 2026 | Naxos, Greece")
  const agenda = redirectPage("/agenda", "Agenda | IAG DENUCHANGE Workshop 2026")
  await Promise.all([
    writeFile(path.join(outputDirectory, "index.html"), homepage),
    writeFile(path.join(outputDirectory, "404.html"), homepage),
    writeFile(path.join(outputDirectory, "agenda", "index.html"), agenda),
    writeFile(path.join(outputDirectory, "sw.js"), retiringWorker()),
  ])
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await buildPagesRedirects(path.resolve(process.argv[2] ?? "dist"))
}
