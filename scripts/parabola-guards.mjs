import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium, expect, firefox } from "playwright/test";

const base = process.argv[2],
  out = process.argv[3];
assert(base && out, "Pass base URL and output directory.");
await mkdir(out, { recursive: true });
const manifest = JSON.parse(await readFile("src/parabola-sources.json", "utf8"));
const records = [];
const state = {
  width: "2",
  height: "1",
  cut: 50,
  arm: 60,
  depth: 1,
  view: "balance",
  reading: 0,
  page: 0,
};
const record = (next) =>
  Buffer.from(
    JSON.stringify({ format: "zygon-parabola", version: 1, state: { ...state, ...next } }),
  );
for (const [engine, driver] of [
  ["chromium", chromium],
  ["firefox", firefox],
]) {
  const browser = await driver.launch();
  const contexts = [];
  const page = async () => {
    const c = await browser.newContext({ serviceWorkers: "block", acceptDownloads: true });
    contexts.push(c);
    return c.newPage();
  };
  try {
    // A 200 response containing a different valid JPEG must not become the named source.
    const p = await page();
    let wrong = true;
    await p.route(`**/sources/${manifest.pages[0].file}`, async (r) => {
      if (wrong)
        await r.fulfill({
          body: await readFile(`public/sources/${manifest.pages[1].file}`),
          contentType: "image/jpeg",
        });
      else await r.continue();
    });
    await p.goto(`${base}parabola.html`);
    await expect(p.locator("#pa-source-caption")).toContainText("does not match");
    await expect(p.locator("#pa-source-image")).toBeHidden();
    wrong = false;
    await p.locator("#pa-source-retry").click();
    await expect(p.locator("#pa-source-caption")).toContainText("identity verified");

    const late = await page();
    let release;
    let entered;
    const held = new Promise((r) => {
      entered = r;
    });
    const gate = new Promise((r) => {
      release = r;
    });
    await late.route(`**/sources/${manifest.pages[0].file}`, async (r) => {
      entered();
      await gate;
      await r.continue();
    });
    await late.goto(`${base}parabola.html`, { waitUntil: "domcontentloaded" });
    await held;
    await late.locator("#pa-page").selectOption("7");
    await expect(late.locator("#pa-source-caption")).toContainText("346");
    await expect(late.locator("#pa-source-caption")).toContainText("identity verified");
    release();
    await late.waitForLoadState("networkidle");
    await expect(late.locator("#pa-source-caption")).toContainText("346");
    await expect(late.locator("#pa-source-image")).toHaveAttribute(
      "alt",
      manifest.pages[7].caption,
    );

    const font = await page();
    let badFont = true;
    await font.route("**/fonts/NotoSerif-Regular.ttf", async (r) => {
      if (r.request().resourceType() !== "fetch" || !badFont) await r.continue();
      else
        await r.fulfill({
          body: await readFile("public/fonts/IBMPlexSans-Regular.woff2"),
          contentType: "font/ttf",
        });
    });
    await font.goto(`${base}parabola.html`);
    const downloads = [];
    font.on("download", (d) => downloads.push(d));
    await font.locator("#pa-save-svg").click();
    await expect(font.locator("#pa-save-status")).toContainText("does not match");
    assert.equal(downloads.length, 0);
    badFont = false;
    const saved = font.waitForEvent("download");
    await font.locator("#pa-save-svg").click();
    await (await saved).saveAs(path.join(out, `${engine}-retry.svg`));

    const snap = await page();
    let releaseFont;
    let enteredFont;
    const fontEntered = new Promise((r) => {
      enteredFont = r;
    });
    const fontGate = new Promise((r) => {
      releaseFont = r;
    });
    await snap.route("**/fonts/NotoSerif-Regular.ttf", async (r) => {
      if (r.request().resourceType() === "fetch") {
        enteredFont();
        await fontGate;
      }
      await r.continue();
    });
    await snap.goto(`${base}parabola.html`);
    const snapshotSaved = snap.waitForEvent("download");
    await snap.locator("#pa-save-svg").click();
    await fontEntered;
    await snap.locator("#pa-find-arm").click();
    releaseFont();
    const dest = path.join(out, `${engine}-snapshot.svg`);
    await (await snapshotSaved).saveAs(dest);
    assert.match(await readFile(dest, "utf8"), /&quot;arm&quot;: 60/);
    await expect(snap.locator("#pa-arm")).toHaveValue("100");

    const imp = await page();
    await imp.addInitScript(() => {
      const text = File.prototype.text;
      window.__imports = [];
      File.prototype.text = function () {
        if (this.name !== "slow.json") return text.call(this);
        return new Promise((resolve) =>
          window.__imports.push(async () => resolve(await text.call(this))),
        );
      };
    });
    await imp.goto(`${base}parabola.html`);
    await expect(imp.locator("#pa-source-caption")).toContainText("identity verified");
    const slow = async () => {
      await imp.locator("#pa-open").setInputFiles({
        name: "slow.json",
        mimeType: "application/json",
        buffer: record({ arm: 25, width: "9" }),
      });
      await imp.waitForFunction(() => window.__imports.length > 0);
    };
    const finish = async () => {
      await imp.evaluate(() => window.__imports.shift()());
      await imp.locator("#pa-save-json").click();
    };
    await slow();
    await imp.locator("#pa-find-arm").click();
    await finish();
    await expect(imp.locator("#pa-arm")).toHaveValue("100");
    await slow();
    await imp.locator("#pa-width").fill("7/3");
    await imp.evaluate(() => window.__imports.shift()());
    await expect(imp.locator("#pa-width")).toHaveValue("7/3");
    await imp.locator("#pa-width").press("Tab");
    await slow();
    await imp.locator("#pa-open").setInputFiles({
      name: "newer.json",
      mimeType: "application/json",
      buffer: record({ width: "5/2", arm: 125 }),
    });
    await expect(imp.locator("#pa-save-status")).toContainText("reopened");
    await imp.evaluate(() => window.__imports.shift()());
    await expect(imp.locator("#pa-width")).toHaveValue("5/2");
    await expect(imp.locator("#pa-arm")).toHaveValue("125");
    records.push({
      engine,
      wrongValidJpegRejected: true,
      sourceRetry: true,
      lateSourceDoesNotReplaceNewerPage: true,
      wrongFontRejected: true,
      exportRetry: true,
      exportKeepsClickSnapshot: true,
      lateImportPreservesNewerTrial: true,
      lateImportPreservesUncommittedTyping: true,
      newerFileWins: true,
    });
    console.log(engine, "source, font, snapshot and import guards passed");
  } finally {
    for (const c of contexts) await c.close();
    await browser.close();
  }
}
await writeFile(
  path.join(out, "guards.json"),
  `${JSON.stringify({ base, checkedAt: new Date().toISOString(), scope: "Actual browser fault injection with service workers blocked to isolate page-level identities and asynchronous state changes.", records }, null, 2)}\n`,
);
