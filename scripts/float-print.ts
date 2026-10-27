import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { floatReadings, floatWords } from "../src/float-content";

const pdf = process.argv[2],
  output = process.argv[3];
if (!pdf || !output) throw new Error("Pass the actual saved PDF and an output receipt.");
const temporary = await mkdtemp(path.join(os.tmpdir(), "zygon-floating-print-"));
const norm = (s: string) => s.normalize("NFC").replace(/[^\p{L}\p{N}]/gu, "");
try {
  execFileSync("pdftotext", ["-layout", pdf, path.join(temporary, "reading.txt")]);
  const text = norm(await readFile(path.join(temporary, "reading.txt"), "utf8"));
  let fields = 0;
  for (const r of floatReadings) {
    for (const value of [r.evidence.text, r.english, r.note, ...(r.latin ? [r.latin] : [])]) {
      assert.ok(
        text.includes(norm(value)),
        `Printed field missing in ${r.title}: ${value.slice(0, 65)}`,
      );
      fields++;
    }
  }
  for (const word of floatWords)
    for (const value of word.slice(0, 3)) {
      assert.ok(
        text.includes(norm(String(value))),
        `Printed word note missing: ${String(value).slice(0, 60)}`,
      );
      fields++;
    }
  execFileSync("pdfimages", ["-j", pdf, path.join(temporary, "source")]);
  const hashes = new Set<string>();
  for (const name of await readdir(temporary))
    if (name.endsWith(".jpg"))
      hashes.add(
        createHash("sha256")
          .update(await readFile(path.join(temporary, name)))
          .digest("hex"),
      );
  const manifest = JSON.parse(await readFile("public/sources/float-sources.json", "utf8")) as {
    images: { file: string; sha256: string }[];
  };
  for (const image of manifest.images)
    assert.ok(hashes.has(image.sha256), `Source JPEG not recovered byte-for-byte: ${image.file}`);
  execFileSync("pdftotext", ["-bbox", pdf, path.join(temporary, "bounds.html")]);
  const bounds = await readFile(path.join(temporary, "bounds.html"), "utf8");
  const words = [
    ...bounds.matchAll(/<word xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">/g),
  ];
  for (const w of words)
    assert.ok(
      Number(w[1]) >= 35 && Number(w[3]) <= 561 && Number(w[2]) >= 35 && Number(w[4]) <= 808,
      `Printed word outside A4 margins: ${w[0]}`,
    );
  const pages = Number(
    execFileSync("pdfinfo", [pdf], { encoding: "utf8" }).match(/^Pages:\s+(\d+)/m)?.[1],
  );
  const report = {
    checkedAt: new Date().toISOString(),
    pdfSha256: createHash("sha256")
      .update(await readFile(pdf))
      .digest("hex"),
    pages,
    completeFields: fields,
    completeWordNotes: floatWords.length,
    sourceJpegsRecovered: manifest.images.length,
    printedWordsWithinMargins: words.length,
    scope:
      "Complete Greek/English/available Latin passages, notes and word notes extracted from the actual PDF; all seven source JPEGs recovered byte-for-byte. Browser print, not a tagged publication or physical printer review.",
  };
  await writeFile(output, `${JSON.stringify(report, null, 2)}\n`);
  console.log(report);
} finally {
  await rm(temporary, { recursive: true, force: true });
}
