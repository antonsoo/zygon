import mit from "../LICENSE?raw";
import assets from "./assets.json";
import { escapeHTML as e } from "./drawing";
import {
  parabolaReadingHtml,
  parabolaReadings,
  parabolaWords,
  sourceManifest,
} from "./parabola-content";
import { parabolaBeam, parabolaPlate } from "./parabola-drawing";
import {
  type ParabolaState,
  parabolaCsv,
  parabolaJson,
  parabolaModel,
  parabolaQuery,
} from "./parabola-model";
export const parabolaData = (bytes: Uint8Array, mime: string) => {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 16384)
    binary += String.fromCharCode(...bytes.subarray(i, i + 16384));
  return `data:${mime};base64,${btoa(binary)}`;
};
const pending = new Map<string, Promise<Uint8Array<ArrayBuffer>>>();
export function parabolaAsset(path: string): Promise<Uint8Array<ArrayBuffer>> {
  const prior = pending.get(path);
  if (prior) return prior;
  const page = sourceManifest.pages.find((p) => `sources/${p.file}` === path);
  const expected = page?.sha256 ?? (assets as Record<string, string>)[path];
  if (!expected) return Promise.reject(new Error("This file has no retained identity."));
  const job = (async () => {
    const response = await fetch(`${import.meta.env.BASE_URL}${path}`, {
      signal: AbortSignal.timeout(30000),
    });
    if (!response.ok)
      throw new Error(`The reading file is unavailable (${response.status}). Reconnect and retry.`);
    const bytes = new Uint8Array(await response.arrayBuffer());
    const sha = [...new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))]
      .map((n) => n.toString(16).padStart(2, "0"))
      .join("");
    if (sha !== expected || (page && bytes.length !== page.bytes))
      throw new Error("The reading file does not match this edition. Reload online and retry.");
    return bytes;
  })();
  pending.set(path, job);
  void job.catch(() => {
    if (pending.get(path) === job) pending.delete(path);
  });
  return job;
}
export function parabolaAccount(s: ParabolaState): string {
  const m = parabolaModel(s);
  return `<table><caption>Complete layers; exact areas in square units</caption><thead><tr><th scope="col">Layer</th><th scope="col">Triangles</th><th scope="col">Each area</th><th scope="col">Whole layer</th></tr></thead><tbody>${m.layers.map((l) => `<tr><th scope="row">${l.depth}</th><td>${l.count}</td><td>${l.each}</td><td>${l.area}</td></tr>`).join("")}</tbody></table><dl class="pa-account"><div><dt>Inscribed sum</dt><dd>${m.sum}</dd></div><div><dt>One third of the last layer</dt><dd>${m.correction}</dd></div><div><dt>Sum plus that third</dt><dd>${m.sum.plus(m.correction)} = 4/3 × ${m.first}</dd></div><div><dt>Tangent upper bound</dt><dd>${m.upper}</dd></div><div><dt>Gap between bounds</dt><dd>${m.gap} = ${m.relativeGap} of the first triangle</dd></div></dl>`;
}
export function parabolaFacts(s: ParabolaState): string {
  const m = parabolaModel(s);
  return `<dl class="pa-account"><div><dt>Geometry</dt><dd>Chord ${m.width}; height ${m.height}; first triangle area ${m.first}; large auxiliary triangle area ${m.bigTriangle}.</dd></div><div><dt>Selected cut</dt><dd>u = ${m.u} from Α to Γ. Parabola section ${m.slice}; triangle section ${m.triangleSlice}. These are lengths.</dd></div><div><dt>Trial moments</dt><dd>Left ${m.left}; right ${m.right}; difference ${m.difference}. Common section thickness and area density suppressed. The separate beam uses a left arm ${m.arm} times ΚΓ.</dd></div><div><dt>What this cut establishes</dt><dd>${m.inconclusive ? "Both moments vanish at this endpoint; it cannot select the arm." : m.pointFits ? "The selected interior cut balances." : "The selected interior cut does not balance."} ${m.universalFit ? "The arm identity holds for every interior cut." : "This arm does not satisfy the identity for every interior cut."}</dd></div></dl>`;
}
async function fontsAndLicenses() {
  const names = [
    "fonts/NotoSerif-Regular.ttf",
    "fonts/IBMPlexSans-Regular.woff2",
    "fonts/NotoSerif-OFL.txt",
    "fonts/IBMPlex-OFL.txt",
  ];
  const data = await Promise.all(names.map(parabolaAsset));
  return {
    serif: data[0] as Uint8Array,
    sans: data[1] as Uint8Array,
    serifLicense: new TextDecoder().decode(data[2]),
    sansLicense: new TextDecoder().decode(data[3]),
  };
}
export async function parabolaSvg(s: ParabolaState): Promise<string> {
  const f = await fontsAndLicenses(),
    m = parabolaModel(s);
  const plates =
    s.view === "fill"
      ? parabolaPlate(s).replace("<svg ", '<svg x="0" y="0" width="1000" height="640" ')
      : parabolaPlate(s).replace("<svg ", '<svg x="150" y="0" width="700" height="550" ') +
        parabolaBeam(s).replace("<svg ", '<svg x="0" y="560" width="1000" height="378" ');
  const height = s.view === "fill" ? 730 : 1030;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 ${height}" role="img" aria-labelledby="pa-title pa-desc"><title id="pa-title">A third more: the parabola experiment</title><desc id="pa-desc">Exact inscribed area ${m.sum}; tangent upper bound ${m.upper}; four-thirds candidate ${m.candidate}. A finite polygon remains smaller than the curved segment. ${e(parabolaJson(s))}</desc><metadata>${e(mit)}\n${e(f.serifLicense)}\n${e(f.sansLicense)}</metadata><style>@font-face{font-family:'Cabinet Serif';src:url('${parabolaData(f.serif, "font/ttf")}')}@font-face{font-family:'Cabinet Sans';src:url('${parabolaData(f.sans, "font/woff2")}')}text{font-family:'Cabinet Sans',sans-serif;fill:#303b2c;font-size:18px}</style><rect width="1000" height="${height}" fill="#f7f3e8"/>${plates}<text x="30" y="${height - 50}">Exact lower bound ${m.sum}; upper bound ${m.upper} square units.</text><text x="30" y="${height - 20}">The remaining third is an algebraic correction, not another inscribed layer.</text></svg>`;
}
export async function parabolaStudy(s: ParabolaState): Promise<string> {
  const snapshot = structuredClone(s);
  const [f, images, svg] = await Promise.all([
    fontsAndLicenses(),
    Promise.all(sourceManifest.pages.map((p) => parabolaAsset(`sources/${p.file}`))),
    parabolaSvg(snapshot),
  ]);
  const native = (name: string, text: string, mime: string, label: string) =>
    `<a download="${name}" href="${parabolaData(new TextEncoder().encode(text), mime)}">${label}</a>`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; font-src data:; img-src data:; base-uri 'none'; form-action 'none'"><title>Zygon: a third more</title><style>
 @font-face{font-family:'Cabinet Serif';src:url('${parabolaData(f.serif, "font/ttf")}')}@font-face{font-family:'Cabinet Sans';src:url('${parabolaData(f.sans, "font/woff2")}')}
 *{box-sizing:border-box}body{max-width:1000px;margin:30px auto;padding:0 24px;font:16px/1.65 'Cabinet Sans',sans-serif;background:#f7f3e8;color:#303b2c}h1{font:42px/1.15 'Cabinet Serif',serif}h2{font:30px/1.25 'Cabinet Serif',serif;margin-top:36px}h3{font-size:22px}h4{margin:12px 0 0}svg{display:block;width:100%;height:auto}.pa-greek,.pa-latin{font-family:'Cabinet Serif',serif;font-size:19px;line-height:1.8}.pa-note,.pa-reference,figcaption{font-size:14px}.pa-reading{margin:32px 0;border-top:1px solid #a6ac98;padding-top:20px}.pa-account div{margin:12px 0}dt{font-weight:bold}dd{margin:0 0 20px;overflow-wrap:anywhere}table{border-collapse:collapse;width:100%;font-size:14px}td,th{text-align:left;padding:8px;border-bottom:1px solid #a6ac98;overflow-wrap:anywhere}a{color:#41614b;overflow-wrap:anywhere}nav{display:flex;gap:16px;flex-wrap:wrap}figure{margin:30px 0}img{display:block;width:100%;height:auto}pre{white-space:pre-wrap;overflow-wrap:anywhere;font-size:12px}.pa-scan{break-before:page}h2,h3,h4,dt{break-after:avoid}dl div,.pa-languages>div{break-inside:avoid}
 @page{size:A4;margin:15mm}@page pa-opening{size:A4 landscape;margin:15mm}@media print{body{font-size:10pt;margin:0;padding:0}h1{font-size:26pt}h2{font-size:18pt}h3{font-size:14pt}.pa-greek,.pa-latin{font-size:12pt}.pa-note,.pa-reference,figcaption{font-size:9pt}svg{max-height:210mm}table{font-size:8pt}nav{display:none}.pa-scan{break-after:page;margin:0}.pa-opening{page:pa-opening}.pa-machine{display:none}.pa-scan img{width:auto;max-width:100%;height:225mm;object-fit:contain;margin:auto}.pa-opening img{height:155mm}pre{font-size:7pt}}
 </style></head><body><header><p>Zygon / Archimedes, Method I and Quadrature XXI–XXIV</p><h1>A third more.</h1><p>Balancing sections suggests an area. Finite triangles and shrinking bounds supply a different kind of argument.</p><nav>${native("zygon-parabola.json", parabolaJson(snapshot), "application/json", "Editable JSON")}${native("zygon-parabola.csv", parabolaCsv(snapshot), "text/csv", "Exact account CSV")}${native("zygon-parabola.svg", svg, "image/svg+xml", "Font-embedded SVG")}${native("zygon-parabola-sources.json", JSON.stringify(sourceManifest, null, 2), "application/json", "Source identities")}</nav></header><main>
 <section><h2>Your experiment</h2>${parabolaPlate(snapshot)}${snapshot.view === "balance" ? parabolaBeam(snapshot) : ""}${parabolaFacts(snapshot)}<h3>The finite account</h3>${parabolaAccount(snapshot)}</section>
 <section><h2>Discovery and proof remain different</h2><p>The curved segment is drawn as y = 4hu(1-u) across a chord w, with x = w(u - 1/2). The auxiliary tangent triangle has four times the first inscribed triangle’s area. At an interior cut, the transferred section and the triangle section balance exactly when the left arm equals ΚΓ. Both endpoint moments vanish and cannot identify that arm. Our separate horizontal beam preserves the source’s projected arm ratios; it is a new instructional diagram.</p><p>The mechanical comparison suggests 4/3 of the first triangle’s area, using the large triangle’s centroid. The source says the preceding reasoning has not proved its conclusion. A finite set of balanced slices does not itself prove the area result.</p><p>In the fill view, each child triangle has one-eighth of its parent’s area, so a complete next layer has one-quarter of the previous layer. Adding one-third of the final complete layer to the finite sum gives 4/3 of the first triangle. That correction is not another region filled in the drawing.</p><p>Our modern tangent covers give strict lower and upper bounds. Their gap is A/(2 × 4^n), where A is the first triangle and n the final layer. Any proposed positive difference between the candidate and the true area can be made larger than this gap by enough finite refinements. Both values remain between the same bounds, a contradiction. This coordinate exhaustion argument is distinct from the printed Quadrature XXIV, whose comparisons have their own source diagram.</p></section>
 <section><h2>Read the conditions</h2><p>Greek and Latin follow the retained edited print. Line-end hyphens are joined, typographic figure letters normalized to Greek capitals, and inline footnote numbers omitted. Words and mathematical formulas are otherwise retained. New English and notes are teaching aids without independent philological review. The Method excerpt is not a full volume; the 1881 Quadrature volume predates discovery of the palimpsest.</p>${parabolaReadings.map((_, i) => parabolaReadingHtml(i)).join("")}<h2>Words doing mathematical work</h2><dl>${parabolaWords.map((w) => `<div><dt lang="grc">${e(w[0])}</dt><dd><i>${e(w[1])}</i> — ${e(w[2])}. ${e(w[3])}</dd></div>`).join("")}</dl></section>
 <section><h2>Complete source pages</h2><p>Public-domain edited print. Complete PDF pages, including margins and critical apparatus. These are different editions, not an invented continuous manuscript. Source PDF identities and reproduction parameters follow.</p>${sourceManifest.pages.map((p, i) => `<figure class="pa-scan${p.source === "method" ? " pa-opening" : ""}"><img src="${parabolaData(images[i] as Uint8Array, "image/jpeg")}" alt="${e(p.caption)}"><figcaption>${e(p.caption)} PDF page ${p.pdfPage}. SHA-256 ${p.sha256}.</figcaption></figure>`).join("")}</section>
 <section><h2>Source identities, editable work and licenses</h2><p><a href="https://antonsoo.github.io/zygon/parabola.html${e(parabolaQuery(snapshot))}#pa-bench">Reopen this experiment online</a>. This file’s sources and native downloads need no scripts or connection. External references need a connection.</p><ul>${sourceManifest.sources.map((s) => `<li><a href="${e(s.url)}">${e(s.edition)}</a>. ${s.bytes} bytes; SHA-256 ${s.sha256}.</li>`).join("")}</ul><details class="pa-machine"><summary>Exact source record and editable settings</summary><h3>Source record</h3><pre>${e(JSON.stringify(sourceManifest, null, 2))}</pre><h3>Editable experiment</h3><pre>${e(parabolaJson(snapshot))}</pre></details><h3>MIT license for new code, diagrams and text</h3><pre>${e(mit)}</pre><h3>Noto Serif license</h3><pre>${e(f.serifLicense)}</pre><h3>IBM Plex license</h3><pre>${e(f.sansLicense)}</pre></section></main></body></html>`;
}
