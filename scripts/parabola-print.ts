import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { parabolaReadings, parabolaWords, sourceManifest } from "../src/parabola-content";

import { parabolaModel, readParabolaJson } from "../src/parabola-model";

const pdf = process.argv[2],
  output = process.argv[3];
assert(pdf && output, "Pass the actual saved PDF and an output receipt.");
const temp = await mkdtemp(path.join(os.tmpdir(), "zygon-parabola-print-"));
const norm = (s: string) => s.normalize("NFC").replace(/[^\p{L}\p{N}]/gu, "");
const sha = (b: Uint8Array) => createHash("sha256").update(b).digest("hex");
try {
  execFileSync("pdftotext", ["-layout", pdf, path.join(temp, "text.txt")]);
  const text = norm(await readFile(path.join(temp, "text.txt"), "utf8"));
  let fields = 0;
  for (const r of parabolaReadings) {
    for (const value of [r.greek, r.latin, r.english, r.note]) {
      assert(
        text.includes(norm(value)),
        `Incomplete printed field: ${r.title}: ${value.slice(0, 65)}`,
      );
      fields++;
    }
  }
  for (const w of parabolaWords)
    for (const value of w.slice(0, 4)) {
      assert(text.includes(norm(String(value))), `Incomplete word note: ${value}`);
      fields++;
    }
  for (const file of ["LICENSE", "public/fonts/NotoSerif-OFL.txt", "public/fonts/IBMPlex-OFL.txt"])
    assert(
      text.includes(norm(await readFile(file, "utf8"))),
      `Incomplete printed license: ${file}`,
    );
  execFileSync("pdfimages", ["-j", pdf, path.join(temp, "source")]);
  const images = await readdir(temp);
  const hashes = new Set(
    await Promise.all(
      images
        .filter((n) => n.endsWith(".jpg"))
        .map(async (n) => sha(await readFile(path.join(temp, n)))),
    ),
  );
  for (const p of sourceManifest.pages)
    assert(hashes.has(p.sha256), `Missing original JPEG: ${p.file}`);
  const experiment = readParabolaJson(
    await readFile(path.join(path.dirname(pdf), "experiment.json"), "utf8"),
  );
  const m = parabolaModel(experiment),
    w = m.proposalWitness;
  for (const value of [
    `Proposed ratio ${m.proposal} times the first triangle; proposed area ${m.proposed}.`,
    ...(w
      ? [
          `First rejecting layer: ${w.depth}. Its ${w.triangles} inscribed triangles give the exact lower bound ${w.lower}; the tangent upper bound is ${w.upper}.`,
        ]
      : ["surviving a finite check is insufficient"]),
  ]) {
    assert(text.includes(norm(value)), `Incomplete printed proposal account: ${value}`);
    fields++;
  }
  // Any extra raster image would hide a recurrence of the per-cover PDF shader explosion.
  const imageList = execFileSync("pdfimages", ["-list", pdf], { encoding: "utf8" });
  assert.equal(
    imageList.split("\n").filter((line) => /^\s*\d+\s+\d+\s+image\s/.test(line)).length,
    16,
  );
  execFileSync("pdftotext", ["-bbox", pdf, path.join(temp, "bounds.xml")]);
  const bounds = await readFile(path.join(temp, "bounds.xml"), "utf8");
  let words = 0,
    landscape = 0;
  const pages = [
    ...bounds.matchAll(/<page width="([\d.]+)" height="([\d.]+)">([\s\S]*?)<\/page>/g),
  ];
  assert(pages.length > 16);
  for (const p of pages) {
    const width = Number(p[1]),
      height = Number(p[2]);
    if (width > height) landscape++;
    for (const w of p[3].matchAll(
      /<word xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">/g,
    )) {
      assert(
        Number(w[1]) >= 40 &&
          Number(w[2]) >= 40 &&
          Number(w[3]) <= width - 35 &&
          Number(w[4]) <= height - 35,
        `Word outside print margins: ${w[0]}`,
      );
      words++;
    }
  }
  assert.equal(landscape, 3, "Three complete two-page Method openings need landscape sheets.");
  const info = execFileSync("pdfinfo", [pdf], { encoding: "utf8" });
  assert.match(info, /Tagged:\s+yes/);
  const report = {
    checkedAt: new Date().toISOString(),
    sha256: sha(await readFile(pdf)),
    pages: pages.length,
    landscape,
    completeFields: fields,
    completeWordNotes: parabolaWords.length,
    sourceJpegsRecovered: hashes.size,
    printedWordsWithinMargins: words,
    licenses: 3,
    scope:
      "Actual browser PDF; complete Greek, Latin, English, notes and licenses; sixteen source JPEGs recovered byte-for-byte. Construction remains vector. Tags present; no claim of PDF/UA or physical printer review.",
  };
  await writeFile(output, `${JSON.stringify(report, null, 2)}\n`);
  console.log(report);
} finally {
  await rm(temp, { recursive: true, force: true });
}
