import assert from "node:assert/strict"
import test from "node:test"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const testDirectory = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(testDirectory, "..")

test("new deployments replace stale PWA content without a hard refresh", () => {
  const main = fs.readFileSync(path.join(projectRoot, "src", "main.tsx"), "utf8")
  const viteConfig = fs.readFileSync(path.join(projectRoot, "vite.config.ts"), "utf8")
  const vercelConfig = JSON.parse(
    fs.readFileSync(path.join(projectRoot, "vercel.json"), "utf8"),
  )

  assert.match(viteConfig, /registerType:\s*['"]autoUpdate['"]/) 
  assert.match(main, /from\s+['"]virtual:pwa-register['"]/) 
  assert.match(main, /registerSW\s*\(\s*\{[\s\S]*immediate:\s*true/) 
  assert.match(main, /onRegisteredSW/) 
  assert.match(main, /cache:\s*['"]no-store['"]/) 
  assert.match(main, /registration\.update\(\)/) 

  const globalHeaders = vercelConfig.headers?.find(({ source }) => source === "/(.*)")
  assert.ok(globalHeaders, "global cache revalidation headers are missing")
  assert.ok(
    globalHeaders.headers.some(
      ({ key, value }) =>
        key.toLowerCase() === "cache-control" &&
        value === "public, max-age=0, must-revalidate",
    ),
    "browser and CDN caches must revalidate every deployment-sensitive response",
  )
})
