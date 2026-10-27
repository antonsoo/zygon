import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const sourceManifest = JSON.parse(await readFile("public/sources/float-sources.json", "utf8"));
for (const image of sourceManifest.images) {
  const bytes = await readFile(`public/sources/${image.file}`);
  if (
    bytes.length !== image.bytes ||
    createHash("sha256").update(bytes).digest("hex") !== image.sha256
  )
    throw new Error(`Source identity mismatch: ${image.file}`);
}
const assets = {};
for (const folder of ["sources", "fonts"]) {
  for (const file of (await readdir(`public/${folder}`)).sort()) {
    const name = `${folder}/${file}`;
    assets[name] = createHash("sha256")
      .update(await readFile(path.join("public", name)))
      .digest("hex");
  }
}
await writeFile("src/assets.json", `${JSON.stringify(assets, null, 2)}\n`);
console.log(`${Object.keys(assets).length} source and font assets indexed.`);
