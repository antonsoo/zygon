// biome-ignore-all lint/performance/useDomNodeTextContent: Inspect the learner-visible reading.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import AxeBuilder from "@axe-core/playwright";
import { chromium, firefox } from "playwright";

const base = process.argv[2],
  out = process.argv[3];
assert(base && out, "Pass a base URL and an output directory.");
const development = process.argv.includes("--development"),
  report = { checkedAt: new Date().toISOString(), base, development, configurations: [] };
const hash = (b) => createHash("sha256").update(b).digest("hex");
const assets = JSON.parse(await readFile("src/assets.json", "utf8"));
await mkdir(out, { recursive: true });
async function download(page, selector, file) {
  const event = page.waitForEvent("download");
  await page.locator(selector).click();
  await (await event).saveAs(file);
  return readFile(file);
}
async function noOverflow(page) {
  assert(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
    "Horizontal overflow",
  );
}
async function decoded(page) {
  await page.locator("#image-stage image").evaluate(async (e) => {
    const img = new Image();
    img.src = e.getAttribute("href");
    await img.decode();
  });
}
async function svgBounds(page) {
  const bad = await page
    .locator("#balance svg, #profile svg, #disks svg, #stack-drawing svg")
    .evaluateAll((svgs) =>
      svgs.flatMap((svg) => {
        const root = svg.getBoundingClientRect();
        if (!root.width) return [];
        return [...svg.querySelectorAll("text")]
          .filter((t) => {
            const r = t.getBoundingClientRect();
            return (
              r.left < root.left - 1 ||
              r.right > root.right + 1 ||
              r.top < root.top - 1 ||
              r.bottom > root.bottom + 1
            );
          })
          .map((t) => t.textContent);
      }),
    );
  assert.deepEqual(bad, [], "SVG labels outside the canvas");
}
for (const [name, engine] of [
  ["chromium", chromium],
  ["firefox", firefox],
]) {
  const browser = await engine.launch();
  try {
    for (const width of [1440, 375]) {
      const folder = path.join(out, `${name}-${width}`);
      await mkdir(folder, { recursive: true });
      const context = await browser.newContext({
        viewport: { width, height: 1000 },
        acceptDownloads: true,
        reducedMotion: "reduce",
      });
      context.setDefaultTimeout(30000);
      try {
        const page = await context.newPage(),
          errors = [],
          consoleErrors = [],
          external = [];
        page.on("pageerror", (e) => errors.push(e.message));
        page.on("console", (m) => {
          if (m.type() === "error") consoleErrors.push(m.text());
        });
        page.on("request", (r) => {
          if (/^https?:/.test(r.url()) && !r.url().startsWith(base)) external.push(r.url());
        });
        await page.goto(base);
        await page.evaluate(() => document.fonts.ready);
        await noOverflow(page);
        assert.equal(await page.locator("#left-moment").innerText(), "1πr³");
        assert.equal(await page.locator("#right-moment").innerText(), "2πr³");
        await page.locator("#cut").focus();
        await page.keyboard.press("ArrowRight");
        assert.equal(await page.locator("#cut").inputValue(), "51");
        const diskGeometry = await page.locator("#disks").innerHTML();
        await page.locator("#source-arm").click();
        assert.equal(await page.locator("#disks").innerHTML(), diskGeometry);
        assert.equal(
          await page.locator("#left-moment").innerText(),
          await page.locator("#right-moment").innerText(),
        );
        for (const cut of [0, 1, 25, 100, 175, 200]) {
          await page.locator("#cut").fill(String(cut));
          assert.equal(
            await page.locator("#left-moment").innerText(),
            await page.locator("#right-moment").innerText(),
          );
          await svgBounds(page);
          if (cut === 0) assert.match(await page.locator("#result").innerText(), /cannot identify/);
        }
        await page.locator("#cut").fill("75");
        await page.locator("#workshop").screenshot({ path: path.join(folder, "balance.png") });
        await page.locator("#stack-view").click();
        assert.equal(await page.locator("#left-moment").innerText(), "8πr⁴");
        assert.equal(await page.locator("#right-moment").innerText(), "8πr⁴");
        for (const n of [1, 2, 4, 8, 16, 32, 64, 128]) {
          await page.locator("#count").selectOption(String(n));
          assert.equal(await page.locator("#left-moment").innerText(), "8πr⁴");
          await noOverflow(page);
          await svgBounds(page);
        }
        await page.locator("#count").selectOption("8");
        assert.match(await page.locator("#stack-report").innerText(), /43\/32/);
        assert.match(await page.locator("#stack-report").innerText(), /-1\/96/);
        await page.locator("#workshop").screenshot({ path: path.join(folder, "stack.png") });
        await page.locator("#arm").fill("201");
        assert.match(await page.locator("#result").innerText(), /pair/);
        await page.goBack();
        assert.equal(await page.locator("#arm").inputValue(), "200");
        assert.equal(await page.locator("#left-moment").innerText(), "8πr⁴");
        await page.locator("#read-discovery").click();
        assert.equal(await page.locator("#reading-select").inputValue(), "7");
        for (let i = 0; i < 10; i++) {
          await page.locator("#reading-select").selectOption(String(i));
          await decoded(page);
          await noOverflow(page);
          assert((await page.locator("#greek").innerText()).length > 50);
          assert((await page.locator("#english").innerText()).length > 50);
          assert((await page.locator("#image-stage rect").count()) > 0);
          await page.locator("#visible-image").click();
          await decoded(page);
          await page.locator("#processed-image").click();
          await decoded(page);
        }
        await page.locator("#reading-select").selectOption("1");
        assert.match(await page.locator("#greek").innerText(), /διπλασία/);
        assert.match(await page.locator("#english").innerText(), /twice/);
        await page.locator("#focus-lines").click();
        const firstFragment = await page.locator("#image-stage svg").getAttribute("viewBox");
        await page.locator("#next-fragment").click();
        assert.notEqual(
          await page.locator("#image-stage svg").getAttribute("viewBox"),
          firstFragment,
        );
        await page.locator("#focus-lines").click();
        await page.locator("#reading-select").selectOption("8");
        assert.match(await page.locator("#greek").innerText(), /τετραπλασίων/);
        await page.locator("#focus-lines").click();
        await page.locator("#zoom-image").click();
        await page.locator("#image-stage").focus();
        await page.keyboard.press("End");
        assert(await page.locator("#image-stage").evaluate((e) => e.scrollWidth > e.clientWidth));
        await page.locator("#zoom-image").click();
        await page.locator("#focus-lines").click();
        await page.locator("#reading-select").selectOption("5");
        await page.locator("#latin-details summary").click();
        await decoded(page);
        await page.locator("#reading").screenshot({ path: path.join(folder, "reading.png") });
        await page.locator("#share").click();
        const shared = await page.locator("#share-url").inputValue();
        await page.goto(shared);
        assert.equal(await page.locator("#reading-select").inputValue(), "5");
        assert.equal(await page.locator("#count").inputValue(), "8");
        const csv = await download(page, "#save-csv", path.join(folder, "sections.csv"));
        assert.equal(csv.toString().trim().split(/\r?\n/).length, 202);
        const svgFile = path.join(folder, "balance.svg");
        await download(page, "#save-svg", svgFile);
        const svg = await context.newPage();
        await svg.goto(pathToFileURL(svgFile).href);
        assert.equal(await svg.locator("parsererror").count(), 0);
        await svg.screenshot({ path: path.join(folder, "svg.png") });
        await svg.close();
        const studyFile = path.join(folder, "study.html"),
          html = await download(page, "#save-study", studyFile);
        const study = await context.newPage(),
          studyRequests = [];
        study.on("request", (r) => {
          if (/^https?:/.test(r.url())) studyRequests.push(r.url());
        });
        await study.goto(pathToFileURL(studyFile).href);
        await study.evaluate(() => document.fonts.ready);
        assert.equal(await study.locator("script").count(), 0);
        assert.equal(await study.locator(".passage .greek").count(), 10);
        const images = await study.locator(".image-definitions image").evaluateAll(async (es) =>
          Promise.all(
            es.map(async (e) => {
              const src = e.getAttribute("href"),
                img = new Image();
              img.src = src;
              await img.decode();
              const bytes = Uint8Array.from(atob(src.split(",")[1]), (c) => c.charCodeAt(0));
              return {
                id: e.id,
                width: img.naturalWidth,
                sha256: Array.from(
                  new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)),
                  (b) => b.toString(16).padStart(2, "0"),
                ).join(""),
              };
            }),
          ),
        );
        assert.equal(images.length, 6);
        for (const im of images) {
          const key = `sources/${im.id.replace(/-processed$/, "-pseudo_no-veil").replace(/-visible$/, "-true_pack8")}.jpg`;
          assert.equal(im.sha256, assets[key]);
        }
        assert.equal(await study.locator(".mapped use").count(), 10);
        await noOverflow(study);
        assert.deepEqual(studyRequests, []);
        assert.equal(
          hash(await download(study, ".toolbar a", path.join(folder, "embedded.csv"))),
          hash(csv),
        );
        await study
          .locator("#reading-6")
          .screenshot({ path: path.join(folder, "saved-reading.png") });
        if (name === "chromium" && width === 1440)
          await study.pdf({
            path: path.join(folder, "study.pdf"),
            format: "A4",
            printBackground: true,
          });
        await study.close();
        const axe = await new AxeBuilder({ page }).analyze();
        assert.deepEqual(
          axe.violations.map((v) => ({ id: v.id, targets: v.nodes.map((n) => n.target) })),
          [],
        );
        let offline = null;
        if (!development) {
          await page.waitForFunction(
            () => document.querySelector("#offline").textContent.includes("saved offline"),
            null,
            { timeout: 60000 },
          );
          await context.setOffline(true);
          await page.reload();
          await page.locator("#reading-select").selectOption("8");
          await decoded(page);
          await page.locator("#source-arm").click();
          await download(page, "#save-study", path.join(folder, "offline-study.html"));
          offline = "Browser context disconnected after complete edition installation";
        }
        assert.deepEqual(errors, []);
        assert.deepEqual(consoleErrors, []);
        assert.deepEqual(external, []);
        report.configurations.push({
          browser: name,
          version: browser.version(),
          width,
          keyboard: true,
          unchangedAreasAfterTransfer: true,
          cutPositions: 6,
          stackSizes: 8,
          units: { sections: "pi r^3, common thickness suppressed", solids: "pi r^4" },
          history: true,
          sharedState: true,
          readings: 10,
          sourceImages: 6,
          sourceMappings: true,
          conflictingNumberWordsPreserved: true,
          downloads: {
            csvRows: 201,
            svgParses: true,
            studyBytes: html.length,
            scriptFree: true,
            images,
            requests: studyRequests,
            embeddedCsvMatches: true,
          },
          offline,
          axeViolations: 0,
          errors,
          consoleErrors,
          external,
        });
        await writeFile(path.join(out, "browser.json"), `${JSON.stringify(report, null, 2)}\n`);
        console.log(
          `${name} ${width}: exact balance, stacks, ten readings, six images and actual saved files${offline ? ", offline" : ""}`,
        );
      } finally {
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }
}
