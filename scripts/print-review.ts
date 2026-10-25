import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { readings } from "../src/content";

const pdf = process.argv[2],
  out = process.argv[3];
if (!pdf || !out) throw new Error("Pass the actual saved PDF and an output receipt.");
const folder = await mkdtemp(path.join(os.tmpdir(), "zygon-print-"));
const normalize = (s: string) => s.normalize("NFC").replace(/[^\p{L}\p{N}]/gu, "");
try {
  execFileSync("pdftotext", ["-layout", pdf, path.join(folder, "reading.txt")]);
  const extracted = normalize(await readFile(path.join(folder, "reading.txt"), "utf8"));
  let fields = 0;
  for (const reading of readings)
    for (const value of [
      reading.evidence.text,
      reading.english,
      reading.latin,
      reading.word,
      reading.gloss,
      reading.grammar,
      reading.note,
    ]) {
      assert(
        extracted.includes(normalize(value)),
        `Printed field missing in ${reading.title}: ${value.slice(0, 65)}`,
      );
      fields++;
    }
  execFileSync("pdfimages", ["-j", pdf, path.join(folder, "image")]);
  const actual = new Set<string>();
  for (const name of await readdir(folder))
    if (name.endsWith(".jpg"))
      actual.add(
        createHash("sha256")
          .update(await readFile(path.join(folder, name)))
          .digest("hex"),
      );
  const images = JSON.parse(await readFile("public/sources/images.json", "utf8")).images as {
    file: string;
    sha256: string;
  }[];
  for (const image of images)
    assert(actual.has(image.sha256), `Source JPEG not recovered byte-for-byte: ${image.file}`);
  const info = execFileSync("pdfinfo", [pdf], { encoding: "utf8" }),
    pages = Number(info.match(/^Pages:\s+(\d+)/m)?.[1]);
  await writeFile(
    out,
    `${JSON.stringify(
      {
        checkedAt: new Date().toISOString(),
        pdfSha256: createHash("sha256")
          .update(await readFile(pdf))
          .digest("hex"),
        pages,
        completeFields: fields,
        sourceJpegsRecovered: images.length,
        scope:
          "All ten complete Greek/English/Latin/word/gloss/grammar/note fields extracted from the actual PDF; each of six retained JPEGs recovered byte-for-byte. This is a browser print, not a tagged publication.",
      },
      null,
      2,
    )}\n`,
  );
  console.log(
    `${fields} complete fields and ${images.length} exact source images in ${pages} pages.`,
  );
} finally {
  await rm(folder, { recursive: true, force: true });
}
