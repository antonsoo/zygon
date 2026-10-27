import assets from "./assets.json";
import { greekHTML, readingAt, readings, sourceOrigin, sourcePaths } from "./content";
import { balanceDrawing, disksDrawing, escapeHTML, profileDrawing, stackDrawing } from "./drawing";
import { type State, section, stack, stateQuery } from "./model";

export function saveText(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
export function sectionCSV(s: State) {
  const rows = [
    "x_over_r,sphere_area_over_pi_r2,cone_area_over_pi_r2,cylinder_area_over_pi_r2,h_over_r,pair_moment_over_pi_r3,cylinder_moment_over_pi_r3,difference_over_pi_r3",
  ];
  for (let cut = 0; cut <= 200; cut++) {
    const v = section(cut, s.arm);
    rows.push([v.x, v.sphere, v.cone, v.cylinder, v.h, v.left, v.right, v.difference].join(","));
  }
  return `${rows.join("\r\n")}\r\n`;
}
const toBase64 = (bytes: Uint8Array) => {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 8192)
    binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
  return btoa(binary);
};
async function collect() {
  const data: Record<string, Uint8Array> = {};
  await Promise.all(
    Object.entries(assets)
      .filter(([name]) => !name.startsWith("sources/float-"))
      .map(async ([name, hash]) => {
        const response = await fetch(import.meta.env.BASE_URL + name);
        if (!response.ok) throw new Error("Study asset unavailable");
        const bytes = new Uint8Array(await response.arrayBuffer());
        const actual = Array.from(
          new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)),
          (b) => b.toString(16).padStart(2, "0"),
        ).join("");
        if (actual !== hash) throw new Error("Study asset identity mismatch");
        data[name] = bytes;
      }),
  );
  return data;
}
export async function studyHTML(s: State) {
  const data = await collect();
  const embedded = (file: string, mime: string) => {
    const bytes = data[file];
    if (!bytes) throw new Error(`The retained study is missing ${file}.`);
    return `data:${mime};base64,${toBase64(bytes)}`;
  };
  const getText = (file: string) => new TextDecoder().decode(data[file]);
  const csv = sectionCSV(s),
    st = stack(s.count, s.arm),
    sec = section(s.cut, s.arm);
  const e = escapeHTML;
  const image = (folio: string, processed: boolean) =>
    embedded(`sources/${folio}-${processed ? "pseudo_no-veil" : "true_pack8"}.jpg`, "image/jpeg");
  const imageDefinitions = `<svg class="image-definitions" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs>${["Arch17r", "Arch17v", "Arch18r"].flatMap((folio) => [false, true].map((processed) => `<image id="${folio}-${processed ? "processed" : "visible"}" href="${image(folio, processed)}" width="8160" height="10880"/>`)).join("")}</defs></svg>`;
  const fullFrame = (folio: string, processed: boolean) =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8160 10880" role="img" aria-label="${folio} ${processed ? "processed image" : "visible composite"}"><use href="#${folio}-${processed ? "processed" : "visible"}"/></svg>`;
  const pages = ["Arch17r", "Arch17v", "Arch18r"]
    .map(
      (folio) =>
        `<section class="folio"><h2>${folio}: the two image products</h2><p>Full frame, reduced from the project's 8160 × 10880 registered TIFF. Existing line coordinates locate selected excerpts; see the individual readings. No letter has been retouched.</p><figure>${fullFrame(folio, false)}<figcaption>Project true_pack8 visible composite.</figcaption></figure><figure>${fullFrame(folio, true)}<figcaption>Project pseudo_no-veil processed image.</figcaption></figure><p><a href="${sourceOrigin + sourcePaths[folio]}">Original project files and full TIFFs</a></p></section>`,
    )
    .join("");
  const mappedImage = (i: number) => {
    const r = readingAt(i).evidence,
      lines = r.lines;
    const minX = Math.min(...lines.map((l) => l.ulx)),
      minY = Math.min(...lines.map((l) => l.uly)),
      maxX = Math.max(...lines.map((l) => l.lrx)),
      maxY = Math.max(...lines.map((l) => l.lry));
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX - 100} ${minY - 80} ${maxX - minX + 200} ${maxY - minY + 160}" role="img" aria-label="Mapped manuscript lines for reading ${i + 1}"><use href="#${r.folio}-processed"/>${lines.map((l) => `<rect x="${l.ulx}" y="${l.uly}" width="${l.lrx - l.ulx}" height="${l.lry - l.uly}" stroke="#e5ad30" stroke-width="12" fill="#f4c84920"/>`).join("")}</svg>`;
  };
  const full = readings
    .map(
      (r, i) =>
        `<section class="passage" id="reading-${i + 1}"><p class="kicker">${i + 1} / ${r.evidence.folio} / ${e(r.evidence.lines[0]?.id ?? "")} to ${e(r.evidence.lines.at(-1)?.id ?? "")}</p><h2>${e(r.title)}</h2><div lang="grc" class="greek">${greekHTML(i)}</div><p>${e(r.english)}</p><p class="credit">New Latin study rendering (2026); not an ancient witness or Heiberg translation.</p><p lang="la">${e(r.latin)}</p><h3>${e(r.word)}</h3><p>${e(r.gloss)}</p><p>${e(r.grammar)}</p><p>${e(r.note)}</p><figure class="mapped">${mappedImage(i)}<figcaption>Mapped excerpt in the supplied processed image; project coordinates, not a new decipherment.</figcaption></figure></section>`,
    )
    .join("");
  const sourceDownloads = Object.keys(assets)
    .filter((f) => f.startsWith("sources/") && !f.endsWith(".jpg"))
    .map(
      (file) =>
        `<li><a download="${e(file.split("/").at(-1) ?? file)}" href="${embedded(file, file.endsWith(".xml") ? "application/xml" : file.endsWith(".json") ? "application/json" : "text/plain")}">${e(file.split("/").at(-1) ?? file)}</a></li>`,
    )
    .join("");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Zygon - retained balance study</title><style>
  @font-face{font-family:Study;src:url('${embedded("fonts/NotoSerif-Regular.ttf", "font/ttf")}')}*{box-sizing:border-box}html{color:#303b2c;background:#f7f3e8;font:17px/1.8 Study,Georgia,serif}.image-definitions{position:absolute;width:0;height:0;overflow:hidden}body{max-width:900px;margin:auto;padding:2rem}h1{font-size:2.5rem;line-height:1.2}h2{font-size:1.5rem;line-height:1.4}h3{font-size:1.1rem}a{color:inherit;overflow-wrap:anywhere}svg,img{max-width:100%;height:auto}svg{display:block;width:100%}.diagrams{display:grid;grid-template-columns:1fr 1fr;align-items:center}.greek{font-size:1.15rem;line-height:2}.supplied{color:#9c412c}.unclear{text-decoration:underline dotted #9c412c;text-underline-offset:4px}.expanded{font-style:italic}.kicker,.credit,figcaption{font-size:.8rem;line-height:1.6}.passage{border-top:1px solid #a6ac98;padding-top:1rem;margin-top:2rem;break-before:page}.folio{break-before:page}.folio figure{margin:1rem 0}.folio figure>svg{max-height:1000px;display:block;margin:auto}.mapped{margin:1rem 0;max-width:620px}.mapped svg{max-height:550px}.notices{font-family:Study,serif;white-space:pre-wrap;overflow-wrap:anywhere;font-size:.7rem}.toolbar{border-block:1px solid #a6ac98;padding:.8rem 0}.formula{font-size:1.1rem}table{width:100%;border-collapse:collapse}th,td{text-align:left;padding:.5rem;border-bottom:1px solid #a6ac98}code{overflow-wrap:anywhere} @media(max-width:600px){body{padding:1rem}.diagrams{display:block}.greek{font-size:1rem}h1{font-size:2rem}figure{margin:1rem 0}}@media print{@page{size:A4;margin:16mm}html{font-size:10pt;background:white}body{padding:0}.toolbar{display:none}h1{font-size:28pt}.folio figure+figure{break-before:page}.folio figure>svg{max-height:200mm}.mapped svg{max-height:120mm}.passage{page-break-before:always}figure{break-inside:avoid}.notices{font-size:7pt}}
  </style></head><body>${imageDefinitions}<p class="kicker">ZYGON / ARCHIMEDES, THE METHOD II</p><h1>A sphere on the balance.</h1><p>Your retained experiment and all ten selected Greek readings. The Latin renderings are new study aids composed for this workshop, not ancient witnesses.</p><p class="toolbar"><a href="${`data:text/csv;base64,${btoa(csv)}`}" download="zygon-sections.csv">Save the exact section table CSV</a> · Use the browser's Print command for PDF.</p><p>Cut x = ${sec.x}r. Left arm h = ${sec.h}r. View: ${e(s.view)}. Finite bands: ${s.count}. Selected reading: ${s.reading + 1}.</p><p>Return online: <a href="https://antonsoo.github.io/zygon/?${e(stateQuery(s))}">this experiment and reading</a>. External links need a connection; all illustrations and readings below are embedded.</p>${balanceDrawing(s)}<p class="formula">Left moment: ${s.view === "section" ? sec.left : st.left}${s.view === "section" ? "πr³" : "πr⁴"}. Right moment: ${s.view === "section" ? sec.right : st.right}${s.view === "section" ? "πr³" : "πr⁴"}. Deflection indicates sign only.</p><div class="diagrams">${profileDrawing(s)}${disksDrawing(s)}</div><h2>Finite stacks can conceal opposite errors.</h2>${stackDrawing(s)}<p>Sphere midpoint estimate: ${st.sphere}πr³; error +${st.sphereError}πr³. Cone estimate: ${st.cone}πr³; error ${st.coneError}πr³. Combined estimate: 4πr³ exactly. Modern enclosing-cylinder bounds: ${st.lower} ≤ S/πr³ ≤ ${st.upper}.</p><p>These bands are a modern approximation. A finite collection of balanced sections does not establish an exact solid volume. Archimedes explicitly distinguishes mechanical discovery from geometrical demonstration.</p><h2>Keep the cylinders distinct.</h2><table><thead><tr><th>Solid</th><th>Radius</th><th>Height</th><th>Volume / πr³</th></tr></thead><tbody><tr><th>Auxiliary cylinder C</th><td>2r</td><td>2r</td><td>8</td></tr><tr><th>Auxiliary cone K</th><td>2r</td><td>2r</td><td>8/3</td></tr><tr><th>Sphere</th><td>r</td><td>2r</td><td>4/3</td></tr><tr><th>Enclosing cylinder</th><td>r</td><td>2r</td><td>2</td></tr><tr><th>Small cone</th><td>r</td><td>r</td><td>1/3</td></tr></tbody></table><p>Balance: S + K = C/2. The cone theorem supplies K = C/3; subtracting leaves S = C/6. This assumes uniform density and a weightless beam. The cone-volume theorem is an input. The source's large auxiliary cylinder has four times the volume of the enclosing cylinder.</p><p>Greek display: red angle brackets mark supplied letters, dotted underline marks uncertain readings, italic letters expand abbreviations. Accents, spacing and punctuation are editorial. The early 'twice' is retained alongside the later 'four times'; no new decipherment is claimed.</p>${full}${pages}<section class="passage"><h2>Retained source files</h2><p>Unmodified transcriptions and image provenance can be saved directly from this self-contained file.</p><ul>${sourceDownloads}</ul><h2>Credits and redistribution</h2><pre class="notices">${e(getText("sources/NOTICES.txt"))}</pre><h2>Creative Commons Attribution 3.0</h2><pre class="notices">${e(getText("sources/CC-BY-3.0.txt"))}</pre><h2>Code and diagram license</h2><pre class="notices">${e(getText("sources/CODE-LICENSE.txt"))}</pre><h2>Font notices</h2><pre class="notices">${e(getText("fonts/NotoSerif-OFL.txt"))}\n${e(getText("fonts/IBMPlex-OFL.txt"))}</pre></section></body></html>`;
}
export async function saveStudy(s: State) {
  saveText("zygon-study.html", await studyHTML(s), "text/html");
}
