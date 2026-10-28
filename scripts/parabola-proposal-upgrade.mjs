// biome-ignore-all lint/performance/useDomNodeTextContent: Inspect the learner-visible status across real edition changes.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { chromium, firefox } from "playwright";

const previous = path.resolve(process.argv[2] ?? ""),
  current = path.resolve("dist"),
  out = process.argv[3];
assert(
  process.argv[2] && out,
  "Pass the genuine preceding static edition directory and an output directory.",
);
const oldWorker = await readFile(path.join(previous, "sw.js"), "utf8"),
  newWorker = await readFile(path.join(current, "sw.js"), "utf8");
const edition = (s) => /const EDITION = "([a-f0-9]+)"/.exec(s)?.[1];
const oldEdition = edition(oldWorker),
  newEdition = edition(newWorker);
assert(
  oldEdition && newEdition && oldEdition !== newEdition,
  "Two genuinely different editions are required.",
);
await mkdir(out, { recursive: true });
let root = previous,
  tamper = false;
const server = createServer(async (req, res) => {
  try {
    const relative =
      new URL(req.url, "http://localhost").pathname.replace(/^\/zygon\//, "") || "index.html";
    assert(!relative.includes(".."));
    const bytes =
      tamper && relative === "sources/parabola-method-434-435.jpg"
        ? await readFile(path.join(current, "sources/parabola-method-436-437.jpg"))
        : await readFile(path.join(root, relative));
    const mime =
      {
        ".html": "text/html",
        ".js": "text/javascript",
        ".css": "text/css",
        ".json": "application/json",
        ".jpg": "image/jpeg",
        ".ttf": "font/ttf",
        ".woff2": "font/woff2",
        ".svg": "image/svg+xml",
        ".xml": "application/xml",
      }[path.extname(relative)] ?? "application/octet-stream";
    res.writeHead(200, { "content-type": mime, "cache-control": "no-store" }).end(bytes);
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const base = `http://127.0.0.1:${server.address().port}/zygon/`;
const report = {
  checkedAt: new Date().toISOString(),
  previousWorkerSha256: createHash("sha256").update(oldWorker).digest("hex"),
  oldEdition,
  newEdition,
  scenarios: [],
};
async function ready(page, selector, expected) {
  await page.waitForFunction(
    ({ selector }) => document.querySelector(selector)?.textContent?.includes("saved offline"),
    { selector },
    { timeout: 45000 },
  );
  const saved = await page.evaluate(async () => {
    const controller = navigator.serviceWorker.controller;
    assertNever(controller);
    function assertNever(v) {
      if (!v) throw new Error("No controller");
    }
    const channel = new MessageChannel();
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(Error("No inventory reply")), 5000);
      channel.port1.onmessage = (e) => {
        clearTimeout(timer);
        channel.port1.close();
        resolve(e.data);
      };
      controller.postMessage({ type: "ZYGON_INSPECT" }, [channel.port2]);
    });
  });
  assert.equal(saved.edition, expected);
  assert.equal(saved.complete, true);
  return saved;
}
try {
  for (const [name, engine] of [
    ["chromium", chromium],
    ["firefox", firefox],
  ]) {
    const browser = await engine.launch();
    try {
      for (const mode of ["complete", "bad-source-then-retry"]) {
        root = previous;
        tamper = false;
        const context = await browser.newContext({ viewport: { width: 375, height: 900 } });
        context.setDefaultTimeout(30000);
        try {
          const oldPage = await context.newPage();
          await oldPage.goto(base);
          await ready(oldPage, "#offline", oldEdition);
          root = current;
          tamper = mode !== "complete";
          const page = await context.newPage();
          await page.goto(`${base}parabola.html`);
          if (tamper) {
            try {
              await page.waitForFunction(
                () =>
                  /incomplete|unavailable/.test(
                    document.querySelector("#pa-offline")?.textContent ?? "",
                  ),
                {},
                { timeout: 45000 },
              );
            } catch (error) {
              console.log(
                "Failed-upgrade diagnostic",
                await page.evaluate(async () => ({
                  status: document.querySelector("#pa-offline")?.textContent,
                  source: document.querySelector("#pa-source-caption")?.textContent,
                  caches: await caches.keys(),
                  registration: await navigator.serviceWorker.getRegistration().then((r) => ({
                    installing: r?.installing?.state,
                    waiting: r?.waiting?.state,
                    active: r?.active?.state,
                  })),
                })),
              );
              throw error;
            }
            assert.doesNotMatch(await page.locator("#pa-offline").innerText(), /saved offline/);
            const cachesBefore = await page.evaluate(() => caches.keys());
            assert.ok(cachesBefore.includes(`zygon-${oldEdition}`));
            // The preceding three-room cache already holds this unchanged scan.
            // Its verified source remains usable while the new install is refused.
            assert.match(await page.locator("#pa-source-caption").innerText(), /identity verified/);
            tamper = false;
            await page.reload();
          }
          const saved = await ready(page, "#pa-offline", newEdition);
          // The old tab must not claim that its old page is the newly saved edition.
          await oldPage.waitForFunction(() =>
            document.querySelector("#offline")?.textContent?.includes("different offline edition"),
          );
          const cacheNames = await page.evaluate(() => caches.keys());
          assert.ok(!cacheNames.includes(`zygon-${oldEdition}`));
          await context.setOffline(true);
          await page.reload();
          await page.locator("#pa-find-arm").click();
          assert.match(await page.locator("#pa-verdict").innerText(), /every interior cut/);
          await page.locator("#pa-fill-view").click();
          await page.locator("#pa-small-gap").click();
          assert.match(await page.locator("#pa-account").innerText(), /1\/512/);
          await page.locator("#pa-page").selectOption("14");
          await page.waitForFunction(() =>
            document
              .querySelector("#pa-source-caption")
              ?.textContent?.includes("identity verified"),
          );
          await page.goto(`${base}float.html`);
          await page.locator("#fl-equilibrium").click();
          assert.match(await page.locator("#fl-result").innerText(), /Balanced at an oblique/);
          await page.goto(base);
          await page.locator("#source-arm").click();
          assert.equal(
            await page.locator("#left-moment").innerText(),
            await page.locator("#right-moment").innerText(),
          );
          report.scenarios.push({
            engine: name,
            mode,
            completeNewInventory: saved.complete,
            oldPageWithholdsReadiness: true,
            oldCacheRetired: true,
            offlineThreeRooms: true,
          });
          console.log(`${name} ${mode}: genuine previous edition upgraded; offline three rooms`);
        } finally {
          await context.close();
        }
      }
    } finally {
      await browser.close();
    }
  }
} finally {
  server.closeAllConnections();
  await new Promise((resolve) => server.close(resolve));
}
await writeFile(path.join(out, "upgrade.json"), `${JSON.stringify(report, null, 2)}\n`);
