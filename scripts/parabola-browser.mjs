import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import AxeBuilder from "@axe-core/playwright";
import { chromium, expect, firefox } from "playwright/test";

const base = process.argv[2] ?? "http://127.0.0.1:4372/zygon/";
const out = path.resolve(process.argv[3] ?? "/tmp/zygon-parabola-review");
await mkdir(out, { recursive: true });
const manifest = JSON.parse(await readFile("src/parabola-sources.json", "utf8"));
const worker = await readFile("dist/sw.js", "utf8"),
  edition = /const EDITION = "([a-f0-9]+)"/.exec(worker)[1],
  files = JSON.parse(/const FILES = (\[[^;]+\]);/.exec(worker)[1]);
const hash = (b) => createHash("sha256").update(b).digest("hex");
const decode = (s) =>
  s
    .replaceAll("&quot;", '"')
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&amp;", "&");
const range = async (p, id, value) =>
  p.locator(`#${id}`).evaluate((node, value) => {
    node.value = String(value);
    node.dispatchEvent(new Event("input", { bubbles: true }));
  }, value);
async function download(p, id, dest) {
  const pending = p.waitForEvent("download", { timeout: 60000 });
  await p.locator(id).click();
  const d = await pending;
  assert.equal(await d.failure(), null);
  await d.saveAs(dest);
  return readFile(dest);
}
async function source(p, index) {
  await expect(p.locator("#pa-source-caption")).toContainText("identity verified");
  const actual = await p.locator("#pa-source-image").evaluate(async (img) => {
    await img.decode();
    const bytes = await window.__parabolaBlobs.get(img.src).arrayBuffer();
    return [...new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))]
      .map((n) => n.toString(16).padStart(2, "0"))
      .join("");
  });
  assert.equal(actual, manifest.pages[index].sha256);
}
const records = [];
for (const [engine, driver] of [
  ["chromium", chromium],
  ["firefox", firefox],
]) {
  const browser = await driver.launch();
  try {
    for (const width of [1440, 375]) {
      console.log(engine, width);
      const dir = path.join(out, `${engine}-${width}`);
      await mkdir(dir, { recursive: true });
      const context = await browser.newContext({
        viewport: { width, height: 1000 },
        acceptDownloads: true,
      });
      if (engine === "chromium")
        await context.grantPermissions(["clipboard-read", "clipboard-write"]);
      await context.addInitScript(() => {
        window.__parabolaBlobs = new Map();
        const old = URL.createObjectURL;
        URL.createObjectURL = (blob) => {
          const url = old.call(URL, blob);
          window.__parabolaBlobs.set(url, blob);
          return url;
        };
      });
      if (engine === "firefox")
        await context.addInitScript(() =>
          Object.defineProperty(navigator, "clipboard", {
            value: {
              writeText: async () => {
                throw new Error("Exercise the visible fallback");
              },
            },
          }),
        );
      const p = await context.newPage(),
        errors = [],
        outside = [];
      p.on("pageerror", (e) => errors.push(String(e)));
      p.on("request", (r) => {
        if (/^https?:/.test(r.url()) && new URL(r.url()).origin !== new URL(base).origin)
          outside.push(r.url());
      });
      await p.goto(base);
      await p.getByRole("link", { name: "A third more", exact: true }).press("Enter");
      await p.locator("#pa-title").waitFor();
      await p.waitForLoadState("load");
      await expect(p.locator("#pa-verdict")).toContainText("unequal turning moments");
      await source(p, 0);
      await p.screenshot({ path: path.join(dir, "opening.png") });
      await p.locator("#pa-bench").screenshot({ path: path.join(dir, "balance.png") });
      await p.locator("#pa-arm").focus();
      await p.keyboard.press("ArrowRight");
      await expect(p.locator("#pa-arm")).toHaveValue("61");
      await p.locator("#pa-find-arm").press("Enter");
      await expect(p.locator("#pa-verdict")).toContainText("every interior cut");
      for (const cut of [1, 25, 75, 99]) {
        await range(p, "pa-cut", cut);
        await expect(p.locator("#pa-facts")).toContainText("selected interior cut balances");
      }
      await p.locator("#pa-end").click();
      await expect(p.locator("#pa-verdict")).toContainText("cannot choose an arm");
      await expect(p.locator("#pa-result")).toContainText("does not");
      await range(p, "pa-cut", 50);
      await expect(p.locator("#pa-verdict")).toContainText("unequal");
      await p.locator("#pa-find-arm").click();
      await p.locator("#pa-fill-view").press("Enter");
      await expect(p.locator("#pa-result")).toContainText(
        "5/4 < curved area < tangent upper bound 11/8",
      );
      await p.locator("#pa-add").click();
      assert.equal(await p.locator("[data-pa-layer]").count(), 7);
      await expect(p.locator("#pa-identity")).toContainText("21/16 + 1/48 = 4/3");
      await p.locator("#pa-small-gap").click();
      await expect(p.locator("#pa-account")).toContainText("1/512");
      await expect(p.locator("#pa-verdict")).toContainText("No finite layer");
      await range(p, "pa-depth", 7);
      assert.equal(await p.locator("[data-pa-layer]").count(), 255);
      assert.equal(await p.locator("[data-pa-cover]").count(), 256);
      await expect(p.locator("#pa-identity")).toContainText("21845/16384 + 1/49152 = 4/3");
      await p.locator("#pa-depth").focus();
      await p.keyboard.press("Home");
      await expect(p.locator("#pa-account")).toContainText("3/2");
      for (const [id, expected] of [
        ["small", "too small"],
        ["large", "too large"],
      ]) {
        await p.locator(`#pa-guess-${id}`).click();
        await expect(p.locator("#pa-proposal-account")).toContainText("has not excluded");
        await p.locator("#pa-reject").click();
        await expect(p.locator("#pa-depth")).toHaveValue("1");
        await expect(p.locator("#pa-proposal-account")).toContainText(expected);
      }
      await p.locator("#pa-guess-close").click();
      await p.locator("#pa-reject").click();
      await expect(p.locator("#pa-depth")).toHaveValue("7");
      await expect(p.locator("#pa-proposal-account")).toContainText("First rejecting layer: 10");
      await expect(p.locator("#pa-proposal-account")).toContainText(
        "does not display these extra triangles",
      );
      await expect(p.locator("#pa-proposal-account")).toContainText("has not excluded");
      await p.locator(".pa-challenge").screenshot({ path: path.join(dir, "challenge.png") });
      await p.locator("#pa-guess-source").click();
      await p.locator("#pa-reject").click();
      await expect(p.locator("#pa-proposal-status")).toContainText("No finite rejection");
      await p.locator("#pa-open").setInputFiles("examples/parabola/experiment-v1.json");
      await expect(p.locator("#pa-save-status")).toContainText("reopened");
      await expect(p.locator("#pa-proposal")).toHaveValue("4/3");
      for (const [id, value] of [
        ["pa-width", "7/3"],
        ["pa-height", "5/2"],
      ]) {
        await p.locator(`#${id}`).fill(value);
        await p.locator(`#${id}`).press("Tab");
      }
      await p.locator("#pa-small-gap").click();
      await p.locator("#pa-bench").screenshot({ path: path.join(dir, "fill.png") });
      assert.ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await p.locator("#pa-enlarge").click();
      await p.keyboard.press("ArrowRight");
      await p.waitForFunction(() => document.getElementById("pa-frame").scrollLeft > 0);
      await p.locator("#pa-enlarge").click();
      await p.locator("#pa-width").fill("1/0");
      await p.locator("#pa-width").press("Tab");
      await expect(p.locator("#pa-width")).toHaveValue("7/3");
      await expect(p.locator("#pa-status")).not.toBeEmpty();
      for (let i = 0; i < 7; i++) {
        await p.locator("#pa-reading-select").selectOption(String(i));
        await expect(p.locator("#pa-reading-text .pa-greek")).not.toBeEmpty();
        await expect(p.locator("#pa-reading-text .pa-latin")).not.toBeEmpty();
      }
      for (let i = 0; i < 14; i++) {
        const button = p.locator(`[data-pa-word="${i}"]`);
        await button.press("Enter");
        assert.equal(await button.getAttribute("aria-pressed"), "true");
        await expect(p.locator("#pa-word-note")).not.toBeEmpty();
      }
      await p.locator("#pa-reading-select").selectOption("5");
      await p.locator("#pa-greek-page").click();
      await source(p, 7);
      await p.locator("#pa-latin-page").click();
      await source(p, 8);
      for (let i = 0; i < manifest.pages.length; i++) {
        await p.locator("#pa-page").selectOption(String(i));
        await source(p, i);
      }
      await p.locator("#pa-source-zoom").click();
      await p.keyboard.press("ArrowRight");
      await p.waitForFunction(() => document.getElementById("pa-source-frame").scrollLeft > 0);
      await p.locator("#pa-source-zoom").click();
      await p.locator("#pa-page").selectOption("7");
      await source(p, 7);
      await p.locator("#pa-reading").screenshot({ path: path.join(dir, "reader.png") });
      const axe = await new AxeBuilder({ page: p })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      assert.deepEqual(axe.violations, []);
      await p.locator("#pa-proposal").fill("1333333/1000000");
      await p.locator("#pa-proposal").press("Tab");
      const json = await download(p, "#pa-save-json", path.join(dir, "experiment.json"));
      const csv = await download(p, "#pa-save-csv", path.join(dir, "account.csv"));
      const svg = await download(p, "#pa-save-svg", path.join(dir, "drawing.svg"));
      const html = await download(p, "#pa-save-html", path.join(dir, "reading.html"));
      const native = JSON.parse(json),
        text = html.toString();
      assert.equal(native.version, 2);
      assert.equal(native.state.proposal, "1333333/1000000");
      assert.equal(native.state.width, "7/3");
      assert.equal(native.state.depth, 4);
      assert.equal(native.state.view, "fill");
      for (const [name, data] of [
        ["zygon-parabola.json", json],
        ["zygon-parabola.csv", csv],
        ["zygon-parabola.svg", svg],
      ]) {
        const matched = new RegExp(`download="${name}" href="data:[^,]+,([^"]+)"`).exec(text);
        assert.ok(matched);
        assert.deepEqual(Buffer.from(matched[1], "base64"), data);
      }
      const images = [...text.matchAll(/<img src="data:image\/jpeg;base64,([^"]+)"/g)];
      assert.equal(images.length, 16);
      for (const [i, img] of images.entries())
        assert.equal(hash(Buffer.from(img[1], "base64")), manifest.pages[i].sha256);
      for (const file of ["NotoSerif-OFL.txt", "IBMPlex-OFL.txt"])
        assert.ok(decode(text).includes((await readFile(`public/fonts/${file}`, "utf8")).trim()));
      assert.ok(decode(text).includes((await readFile("LICENSE", "utf8")).trim()));
      const fontUris = [...text.matchAll(/data:font\/(?:ttf|woff2);base64,([^'") ]+)/g)].map((m) =>
        hash(Buffer.from(m[1], "base64")),
      );
      for (const file of ["NotoSerif-Regular.ttf", "IBMPlexSans-Regular.woff2"])
        assert.ok(fontUris.includes(hash(await readFile(`public/fonts/${file}`))));
      const original = p.url();
      await p.locator("#pa-share").click();
      assert.equal(p.url(), original);
      const link =
        engine === "chromium"
          ? await p.evaluate(() => navigator.clipboard.readText())
          : await p.locator("#pa-share-link").inputValue();
      await p.goto(link);
      await p.locator("#pa-title").waitFor();
      const linked = await download(p, "#pa-save-json", path.join(dir, "linked.json"));
      assert.deepEqual(JSON.parse(linked), native);
      await p.locator("#pa-reset").click();
      await p.locator("#pa-open").setInputFiles(path.join(dir, "experiment.json"));
      await expect(p.locator("#pa-save-status")).toContainText("reopened");
      await expect(p.locator("#pa-width")).toHaveValue("7/3");
      const repeated = json.toString().replace('"depth": 4', '"depth": 0,"d\\u0065pth": 4');
      await p.locator("#pa-open").setInputFiles({
        name: "repeated.json",
        mimeType: "application/json",
        buffer: Buffer.from(repeated),
      });
      await expect(p.locator("#pa-save-status")).toContainText("repeats");
      const unchanged = await download(p, "#pa-save-json", path.join(dir, "after-invalid.json"));
      assert.deepEqual(JSON.parse(unchanged), native);
      await p.waitForFunction(
        () => document.getElementById("pa-offline").textContent.includes("saved offline"),
        null,
        { timeout: 60000 },
      );
      const inventory = await p.evaluate(
        async ({ edition, files }) => {
          const worker = navigator.serviceWorker.controller;
          if (!worker) throw new Error("No current controller");
          const status = await new Promise((resolve, reject) => {
            const channel = new MessageChannel();
            const timer = setTimeout(() => reject(new Error("Inspection timeout")), 5000);
            channel.port1.onmessage = (e) => {
              clearTimeout(timer);
              resolve(e.data);
            };
            worker.postMessage({ type: "ZYGON_INSPECT" }, [channel.port2]);
          });
          if (status.edition !== edition || !status.complete)
            throw new Error("Wrong/incomplete edition");
          const cache = await caches.open(`zygon-${edition}`);
          for (const file of files)
            if (!(await cache.match(file))) throw new Error(`Missing ${file}`);
          return (await cache.keys()).length;
        },
        { edition, files },
      );
      assert.equal(inventory, files.length);
      await context.setOffline(true);
      await p.reload();
      await p.locator("#pa-title").waitFor();
      await expect(p.locator("#pa-width")).toHaveValue("7/3");
      await source(p, 7);
      await download(p, "#pa-save-html", path.join(dir, "offline-reading.html"));
      for (const room of ["index", "float", "parabola"]) {
        await p.goto(new URL(`${room}.html`, base).href);
        await p.locator("h1").waitFor();
      }
      await context.close();
      const local = await browser.newContext({
        javaScriptEnabled: false,
        viewport: { width, height: 1000 },
        acceptDownloads: true,
      });
      await local.setOffline(true);
      const lp = await local.newPage(),
        requests = [];
      lp.on("request", (r) => {
        if (/^https?:/.test(r.url())) requests.push(r.url());
      });
      await lp.goto(pathToFileURL(path.join(dir, "reading.html")).href);
      assert.equal(await lp.locator(".pa-reading").count(), 7);
      assert.equal(await lp.locator("img").count(), 16);
      for (const img of await lp.locator("img").all()) await expect(img).toBeVisible();
      await download(lp, 'a[download="zygon-parabola.json"]', path.join(dir, "retained.json"));
      assert.deepEqual(JSON.parse(await readFile(path.join(dir, "retained.json"), "utf8")), native);
      if (engine === "chromium" && width === 1440)
        await lp.pdf({
          path: path.join(dir, "reading.pdf"),
          format: "A4",
          printBackground: true,
          preferCSSPageSize: true,
          tagged: true,
          outline: true,
        });
      assert.deepEqual(requests, []);
      await local.close();
      assert.deepEqual(errors, []);
      assert.deepEqual(outside, []);
      records.push({
        engine,
        width,
        sourceImagesVerified: 16,
        fontsVerified: 2,
        licensesVerified: 3,
        nativeDownloads: ["JSON", "CSV", "SVG", "HTML"],
        offlineRooms: 3,
        cacheFiles: inventory,
        proposalCases:
          "5/4 and 7/5 rejected by layer 1; close proposal needs exact layer 10 beyond the drawn mesh; 4/3 finite survival remains distinct from proof; v1 migration and v2 retention",
        standalone:
          "Actual local file with scripts disabled and browser offline; native JSON reopened",
        axeViolations: [],
        errors,
        outside,
      });
    }
  } finally {
    await browser.close();
  }
}
await writeFile(
  path.join(out, "browser.json"),
  `${JSON.stringify({ base, edition, files: files.length, scope: "Actual production browser operation and downloads; source delivery is local or public according to the recorded base URL. Offline after matching controller and full inventory.", records }, null, 2)}\n`,
);
