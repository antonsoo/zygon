// biome-ignore-all lint/performance/useDomNodeTextContent: Inspect the learner-visible reading.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import AxeBuilder from "@axe-core/playwright";
import { chromium, firefox } from "playwright";

const base = process.argv[2] ?? "http://127.0.0.1:4352/zygon/";
const output = process.argv[3] ?? "/tmp/zygon-float-review";
const report = { checkedAt: new Date().toISOString(), base, configurations: [], integrity: [] };
const assets = JSON.parse(await readFile("src/assets.json", "utf8"));
const readings = JSON.parse(await readFile("src/float-readings.json", "utf8"));
const sources = JSON.parse(await readFile("public/sources/float-sources.json", "utf8"));
const hash = (b) => createHash("sha256").update(b).digest("hex");
await mkdir(output, { recursive: true });
async function save(page, id, file) {
  const pending = page.waitForEvent("download");
  await page.locator(id).click();
  await (await pending).saveAs(file);
  return readFile(file);
}
async function slider(page, id, value) {
  await page.locator(id).evaluate((node, v) => {
    node.value = String(v);
    node.dispatchEvent(new Event("input", { bubbles: true }));
  }, value);
}
async function sourceReady(page, id) {
  await page.waitForFunction(
    (w) =>
      document.querySelector("#fl-source-status")?.textContent?.includes(w) &&
      document.querySelector("#fl-source-status")?.textContent?.includes("identity checked"),
    id,
  );
}
async function noOverflow(page) {
  assert(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
    "Horizontal page overflow",
  );
}
async function svgLabels(page) {
  const outside = await page
    .locator("#fl-drawing svg,#fl-gap svg,#fl-curve svg")
    .evaluateAll((roots) =>
      roots.flatMap((root) => {
        const b = root.getBoundingClientRect();
        return [...root.querySelectorAll("text")]
          .filter((t) => {
            const r = t.getBoundingClientRect();
            return (
              r.left < b.left - 1 ||
              r.right > b.right + 1 ||
              r.top < b.top - 1 ||
              r.bottom > b.bottom + 1
            );
          })
          .map((t) => t.textContent);
      }),
    );
  assert.deepEqual(outside, [], "Drawing labels outside their viewBox");
}
async function fileAssets(page) {
  const embedded = await page
    .locator(".fl-definitions image")
    .evaluateAll((images) => images.map((i) => ({ id: i.id, data: i.getAttribute("href") })));
  assert.equal(embedded.length, 7);
  for (const image of embedded) {
    const b = Buffer.from(image.data.split(",")[1], "base64");
    const name = image.id.replace("source-", "");
    const file = name.startsWith("latin")
      ? `sources/float-${name}.jpg`
      : `sources/float-${name}.jpg`;
    assert.equal(hash(b), assets[file], image.id);
  }
  const scripts = await page.locator("script").count();
  assert.equal(scripts, 0, "Retained reading must not depend on scripts");
}
for (const [engineName, engine] of [
  ["chromium", chromium],
  ["firefox", firefox],
]) {
  const browser = await engine.launch();
  try {
    for (const width of [1440, 375]) {
      const folder = path.join(output, `${engineName}-${width}`);
      await mkdir(folder, { recursive: true });
      const context = await browser.newContext({
        viewport: { width, height: 1000 },
        acceptDownloads: true,
        reducedMotion: "reduce",
      });
      context.setDefaultTimeout(30000);
      const page = await context.newPage(),
        errors = [],
        external = [];
      page.on("pageerror", (e) => errors.push(e.message));
      page.on("request", (r) => {
        if (/^https?:/.test(r.url()) && !r.url().startsWith(base)) external.push(r.url());
      });
      try {
        await page.goto(`${base}float.html`);
        await page.evaluate(() => document.fonts.ready);
        await sourceReady(page, "Arch07v");
        await noOverflow(page);
        await svgLabels(page);
        assert.match(await page.locator("#fl-result").innerText(), /turn it right/);
        await page.locator("#fl-angle").focus();
        await page.keyboard.press("ArrowRight");
        assert.equal(await page.locator("#fl-angle").inputValue(), "10.1");
        await page.locator("#fl-upright").click();
        assert.match(await page.locator("#fl-result").innerText(), /unstable/);
        await page.locator("#fl-nudge").click();
        assert.match(await page.locator("#fl-result").innerText(), /turn it right/);
        await page.locator("#fl-equilibrium").click();
        assert.match(await page.locator("#fl-result").innerText(), /Balanced at an oblique/);
        const angle = Number(
          await page
            .locator("#fl-angle-value")
            .innerText()
            .then((x) => x.replace("°", "")),
        );
        assert.ok(Math.abs(angle - 32.3115332374) < 1e-6);
        await slider(page, "#fl-angle", 31);
        assert.match(await page.locator("#fl-result").innerText(), /turn it right/);
        await slider(page, "#fl-angle", 34);
        assert.match(await page.locator("#fl-result").innerText(), /turn it left/);
        await page.locator("#fl-critical").click();
        assert.match(await page.locator("#fl-stability").innerText(), /zero linear/);
        await slider(page, "#fl-angle", 1);
        assert.match(await page.locator("#fl-result").innerText(), /turn it left/);
        await page.locator("#fl-dense").click();
        await page.locator("#fl-upright").click();
        assert.match(await page.locator("#fl-result").innerText(), /restoring turn/);
        await page.locator("#fl-broad").click();
        assert.equal(await page.locator("#fl-height").inputValue(), "0.5");
        assert.match(await page.locator("#fl-stability").innerText(), /stable/);
        await page.locator("#fl-light").click();
        await slider(page, "#fl-angle", 60);
        assert.match(await page.locator("#fl-result").innerText(), /leaves the dry-base/);
        assert.equal(await page.locator("#fl-drawing marker").count(), 2);
        assert.equal(await page.locator("#fl-drawing line[marker-end]").count(), 0);
        await noOverflow(page);
        await svgLabels(page);
        await page
          .locator("#fl-drawing")
          .screenshot({ path: path.join(folder, "outside-model.png") });
        await page.locator("#fl-light").click();
        await page.locator(".fl-prompt summary").click();
        await page.locator("#fl-check").selectOption("point");
        assert.match(await page.locator("#fl-feedback").innerText(), /broad flat circular cut/);
        await page.locator("#fl-check").selectOption("circle");
        assert.match(await page.locator("#fl-feedback").innerText(), /^Yes/);
        let words = 0;
        for (let i = 0; i < 6; i++) {
          await page.locator("#fl-reading-select").selectOption(String(i));
          await sourceReady(page, readings[i].folio);
          assert.equal(
            (await page.locator("#fl-greek").innerText()).replace(/[⟨⟩]/g, ""),
            readings[i].text,
          );
          for (const word of await page.locator("[data-float-word]").all()) {
            await word.click();
            assert.ok((await page.locator("#fl-word").innerText()).length > 50);
            words++;
          }
        }
        assert.equal(words, 16);
        for (const image of sources.images) {
          const id = image.file.replace("float-", "").replace(".jpg", "");
          await page.locator("#fl-source-select").selectOption(id);
          await sourceReady(page, id.startsWith("latin") ? `p. ${id.replace("latin-", "")}` : id);
        }
        await page.locator("#fl-reading-select").selectOption("1");
        await sourceReady(page, "Arch07v");
        await page.locator("#fl-focus").click();
        await sourceReady(page, "Arch07v");
        await page.locator("#fl-zoom").click();
        await page.locator("#fl-source-frame").focus();
        await page.keyboard.press("ArrowRight");
        await page.waitForFunction(
          () => (document.querySelector("#fl-source-frame")?.scrollLeft ?? 0) > 0,
        );
        assert.ok(
          (await page.locator("#fl-source-frame").evaluate((e) => e.scrollLeft)) > 0,
          "Source keyboard pan",
        );
        await page.locator("#fl-zoom").click();
        await page.locator("#fl-show-latin").click();
        await sourceReady(page, "p. 376");
        await page.locator("#fl-reading-select").selectOption("4");
        await sourceReady(page, "Arch08r");
        assert.match(await page.locator("#fl-latin").textContent(), /No corresponding/);
        await page.locator("#fl-reading-select").selectOption("5");
        await sourceReady(page, "Arch08v");
        await page.locator("#fl-equilibrium").click();
        await page.locator("#fl-share").click();
        const shared = await page.locator("#fl-share-url").inputValue();
        assert.match(shared, /reading=5/);
        const json = await save(page, "#fl-save-json", path.join(folder, "experiment.json"));
        const settings = JSON.parse(json).settings;
        assert.equal(settings.reading, 5);
        assert.ok(Math.abs(settings.angle - 32.311533237423845) < 1e-12);
        const csv = await save(page, "#fl-save-csv", path.join(folder, "turning.csv"));
        assert.equal(csv.toString().trim().split("\n").length, 242);
        const svg = await save(page, "#fl-save-svg", path.join(folder, "drawing.svg"));
        assert.match(svg.toString(), /data:font\/woff2;base64,/);
        const reading = await save(page, "#fl-save-study", path.join(folder, "reading.html"));
        assert.ok(reading.length > 1000000);
        await page.locator("#fl-angle").focus();
        await page.keyboard.press("Home");
        await page
          .locator("#fl-import")
          .setInputFiles({ name: "experiment.json", mimeType: "application/json", buffer: json });
        await page.waitForFunction(() =>
          document.querySelector("#fl-save-status")?.textContent?.includes("restored"),
        );
        assert.match(await page.locator("#fl-result").innerText(), /Balanced at an oblique/);
        const previous = await page.locator("#fl-angle-value").innerText();
        await page.locator("#fl-import").setInputFiles({
          name: "bad.json",
          mimeType: "application/json",
          buffer: Buffer.from("{}"),
        });
        await page.waitForFunction(() =>
          document.querySelector("#fl-save-status")?.textContent?.includes("invalid"),
        );
        assert.equal(await page.locator("#fl-angle-value").innerText(), previous);
        const reload = await context.newPage();
        await reload.goto(shared);
        assert.match(await reload.locator("#fl-result").innerText(), /Balanced at an oblique/);
        assert.equal(await reload.locator("#fl-reading-select").inputValue(), "5");
        await reload.close();
        await page.locator("#fl-bench").screenshot({ path: path.join(folder, "bench.png") });
        await page.locator("#fl-reading").screenshot({ path: path.join(folder, "reading.png") });
        const violations = (
          await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()
        ).violations;
        assert.deepEqual(
          violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
          [],
          "Accessibility violations",
        );
        await page.waitForFunction(
          () => document.querySelector("#fl-offline")?.textContent?.includes("saved offline"),
          {},
          { timeout: 60000 },
        );
        const inventory = await page.evaluate(async () => ({
          controller: Boolean(navigator.serviceWorker.controller),
          caches: await caches.keys(),
          files: (
            await (
              await caches.open((await caches.keys()).find((n) => n.startsWith("zygon-")))
            ).keys()
          ).length,
        }));
        assert.ok(inventory.controller && inventory.files > 40);
        await context.setOffline(true);
        await page.reload();
        await sourceReady(page, "Arch07v");
        await page.locator("#fl-dense").click();
        assert.match(await page.locator("#fl-stability").innerText(), /stable/);
        await page.locator("#fl-reading-select").selectOption("5");
        await sourceReady(page, "Arch08v");
        await page.goto(base);
        await page.locator("#source-arm").click();
        assert.equal(
          await page.locator("#left-moment").innerText(),
          await page.locator("#right-moment").innerText(),
        );
        await page.getByRole("link", { name: "Floating bodies", exact: true }).click();
        await sourceReady(page, "Arch07v");
        const offlineReading = await save(
          page,
          "#fl-save-study",
          path.join(folder, "offline-reading.html"),
        );
        assert.ok(offlineReading.length > 1000000);
        await context.setOffline(false);
        const fileContext = await browser.newContext({
          viewport: { width, height: 1000 },
          javaScriptEnabled: false,
          acceptDownloads: true,
        });
        try {
          const file = await fileContext.newPage(),
            requests = [];
          file.on("request", (r) => {
            if (/^https?:/.test(r.url())) requests.push(r.url());
          });
          await file.goto(pathToFileURL(path.resolve(folder, "reading.html")).href);
          // Gecko does not settle a page-side Promise callback when page scripts
          // are disabled. Poll the synchronous font state from Node instead.
          for (let attempt = 0; attempt < 100; attempt++) {
            if (await file.evaluate(() => document.fonts.status === "loaded")) break;
            await new Promise((resolve) => setTimeout(resolve, 50));
          }
          assert.equal(await file.evaluate(() => document.fonts.status), "loaded");
          await fileAssets(file);
          await noOverflow(file);
          const native = await save(
            file,
            'a[download="zygon-floating.json"]',
            path.join(folder, "native-experiment.json"),
          );
          assert.deepEqual(JSON.parse(native).settings, settings);
          assert.deepEqual(
            await save(
              file,
              'a[download="zygon-floating.csv"]',
              path.join(folder, "native-turning.csv"),
            ),
            csv,
          );
          await save(
            file,
            'a[download="zygon-floating.svg"]',
            path.join(folder, "native-drawing.svg"),
          );
          await file.screenshot({ path: path.join(folder, "native-reading.png"), fullPage: false });
          if (engineName === "chromium" && width === 1440)
            await file.pdf({
              path: path.join(folder, "reading.pdf"),
              format: "A4",
              printBackground: true,
            });
          assert.deepEqual(requests, [], "Saved reading requested remote assets");
        } finally {
          await fileContext.close();
        }
        assert.deepEqual(errors, []);
        assert.deepEqual(external, []);
        report.configurations.push({
          engine: engineName,
          width,
          words,
          sourceImages: 7,
          downloads: { html: reading.length, json: json.length, csv: csv.length, svg: svg.length },
          shared,
          inventory,
          nativeScripts: false,
          offlineBothRooms: true,
          pageErrors: errors,
          externalRequests: external,
          accessibilityViolations: 0,
        });
        console.log(
          `${engineName} ${width}: controls, sources, exports, native reopening and offline rooms passed`,
        );
      } finally {
        await context.close();
      }
    }
    // A successful HTTP response with the wrong image must fail source display
    // and prevent the illustrated export. Bypass workers so this reaches the app.
    const wrong = await browser.newContext({ serviceWorkers: "block" });
    try {
      await wrong.route("**/sources/float-Arch07v.jpg", (route) =>
        route.fulfill({
          status: 200,
          contentType: "image/jpeg",
          body: Buffer.from("different source"),
        }),
      );
      const page = await wrong.newPage();
      await page.goto(`${base}float.html`);
      await page.waitForFunction(() =>
        document.querySelector("#fl-source-status")?.textContent?.includes("identity mismatch"),
      );
      assert.equal(await page.locator("#fl-source-frame image").count(), 0);
      let downloads = 0;
      page.on("download", () => downloads++);
      await page.locator("#fl-save-study").click();
      await page.waitForFunction(() =>
        document.querySelector("#fl-save-status")?.textContent?.includes("Nothing saved"),
      );
      assert.equal(downloads, 0);
      report.integrity.push({
        engine: engineName,
        wrongHTTP200SourceRejected: true,
        exportWithheld: true,
      });
    } finally {
      await wrong.close();
    }
  } finally {
    await browser.close();
  }
}
await writeFile(path.join(output, "review.json"), `${JSON.stringify(report, null, 2)}\n`);
