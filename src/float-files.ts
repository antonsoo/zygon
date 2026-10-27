import assets from "./assets.json";
import { escapeHTML as e } from "./drawing";
import { floatGreek, floatReadings, floatWords } from "./float-content";
import { floatCurve, floatDrawing, floatSVG, fn, forceDrawing } from "./float-drawing";
import {
  FLOAT_SCOPE,
  type FloatState,
  floatCSV,
  floatModel,
  floatQuery,
  floatRecord,
} from "./float-model";

export function base64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 8192)
    binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
  return btoa(binary);
}
export function dataURL(mime: string, text: string): string {
  return `data:${mime};base64,${base64(new TextEncoder().encode(text))}`;
}
export async function floatAsset(name: string): Promise<Uint8Array> {
  const expected = (assets as Record<string, string>)[name];
  if (!expected) throw new Error(`Unidentified study asset: ${name}`);
  const response = await fetch(import.meta.env.BASE_URL + name);
  if (!response.ok) throw new Error(`Unavailable study asset: ${name}`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  const hash = [...new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  if (hash !== expected) throw new Error(`Study asset identity mismatch: ${name}`);
  return bytes;
}
export const floatSourcePages = [
  ...["Arch07v", "Arch08r", "Arch08v"].map((f) => ({
    id: f,
    file: `float-${f}.jpg`,
    caption: `${f} · full processed manuscript frame; CC BY 3.0`,
  })),
  ...[376, 377, 379, 380].map((n) => ({
    id: `latin-${n}`,
    file: `float-latin-${n}.jpg`,
    caption: `1881 Latin · printed p. ${n} · public domain`,
  })),
];

export function floatTable(s: FloatState): string {
  const m = floatModel(s);
  const rows = [
    ["Shape / axis a", fn(s.height)],
    ["Solid / liquid density", `${fn(s.density)}%`],
    ["Tilt to the right", `${fn(s.angle, 7)}°`],
    ["Total volume", `${fn(m.volume, 7)} length units³`],
    ["Base status", m.dry ? "Wholly dry" : m.touching ? "Touches the liquid" : "Beyond this model"],
    [
      "Displaced volume",
      m.submerged === null ? "Not calculated" : `${fn(m.submerged, 7)} length units³`,
    ],
    [
      "B − G horizontal gap",
      m.lever === null ? "Not calculated" : `${fn(m.lever, 7)} length units`,
    ],
    [
      "Upright response",
      m.stable === "critical" ? "Zero linear stiffness; finite dry-base tilts restore" : m.stable,
    ],
    ["First base-contact tilt", `${fn(m.contactAngle, 7)}° in either direction`],
    [
      "Dry-base oblique equilibrium",
      m.obliqueAngle === null
        ? "None"
        : m.obliqueDry
          ? `±${fn(m.obliqueAngle, 7)}°`
          : "Candidate is beyond this dry-base model",
    ],
  ];
  return `<table><caption>Current experiment · rounded analytic results</caption><tbody>${rows.map(([key, v]) => `<tr><th scope="row">${e(key ?? "")}</th><td>${e(v ?? "")}</td></tr>`).join("")}</tbody></table>`;
}

export async function floatStudy(s: FloatState): Promise<string> {
  const names = Object.keys(assets).filter(
    (name) =>
      name.startsWith("sources/float-") ||
      [
        "fonts/NotoSerif-Regular.ttf",
        "fonts/NotoSerif-OFL.txt",
        "fonts/IBMPlexSans-Regular.woff2",
        "fonts/IBMPlex-OFL.txt",
        "sources/CC-BY-3.0.txt",
        "sources/CODE-LICENSE.txt",
      ].includes(name),
  );
  const data = Object.fromEntries(
    await Promise.all(names.map(async (name) => [name, await floatAsset(name)])),
  );
  const embedded = (name: string, mime: string) => {
    const b = data[name];
    if (!b) throw new Error(`Missing ${name}`);
    return `data:${mime};base64,${base64(b)}`;
  };
  const text = (name: string) => new TextDecoder().decode(data[name]);
  const font = embedded("fonts/IBMPlexSans-Regular.woff2", "font/woff2");
  const svg = floatSVG(s, font);
  const downloads = [
    ["Editable experiment", "zygon-floating.json", "application/json", floatRecord(s)],
    ["Turning-curve CSV", "zygon-floating.csv", "text/csv", floatCSV(s)],
    ["Drawn SVG", "zygon-floating.svg", "image/svg+xml", svg],
  ]
    .map(
      ([label, name, mime, value]) =>
        `<a download="${name}" href="${dataURL(mime ?? "", value ?? "")}">${label}</a>`,
    )
    .join(" · ");
  const definitions = `<svg class="fl-definitions" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs>${floatSourcePages.map((page) => `<image id="source-${page.id}" href="${embedded(`sources/${page.file}`, "image/jpeg")}" width="${page.id.startsWith("latin") ? 1000 : 8160}" height="${page.id.startsWith("latin") ? 1323 : 10880}"/>`).join("")}</defs></svg>`;
  const readings = floatReadings
    .map(
      (r, i) =>
        `<section class="fl-reading"><p class="fl-kicker">Reading ${i + 1} / ${r.reference} / ${r.evidence.folio}</p><h2>${e(r.title)}</h2><div class="greek" lang="grc">${floatGreek(i)}</div><p>${e(r.english)}</p><p class="credit">${r.latin ? `Latin in Heiberg's 1881 edition, printed p. ${r.latinPage}${i === 2 ? " (begins on p. 376)" : i === 5 ? "–380; denominator omitted in the body text" : ""}.` : "No corresponding Latin in the retained 1881 witness; its proof breaks off earlier."}</p>${r.latin ? `<p lang="la">${e(r.latin)}</p>` : ""}<p>${e(r.note)}</p>${floatWords
          .filter((w) => w[3] === i)
          .map((w) => `<p><strong lang="grc">${e(w[0])}</strong> — ${e(w[1])}. ${e(w[2])}</p>`)
          .join("")}</section>`,
    )
    .join("");
  const pages = floatSourcePages
    .map(
      (page) =>
        `<section class="fl-source"><h2>${e(page.caption)}</h2><svg xmlns="http://www.w3.org/2000/svg" viewBox="${page.id.startsWith("latin") ? "0 0 1000 1323" : "0 0 8160 10880"}" role="img" aria-label="${e(page.caption)}"><use href="#source-${page.id}"/></svg><p class="credit">${page.id.startsWith("latin") ? "Complete page rendered from the identified 1881 PDF. Notes and omissions remain visible." : "Bill Christens-Barry, Roger Easton, Keith Knox; Archimedes Palimpsest Digital Release. Full frame reduced from the registered TIFF. No letters retouched."}</p></section>`,
    )
    .join("");
  const sources = names
    .filter((n) => n.endsWith(".xml") || n.endsWith(".json") || n.includes("metadata"))
    .map(
      (name) =>
        `<li><a href="${embedded(name, name.endsWith(".xml") ? "application/xml" : name.endsWith(".json") ? "application/json" : "text/plain")}" download="${e(name.split("/").at(-1) ?? name)}">${e(name.split("/").at(-1) ?? name)}</a></li>`,
    )
    .join("");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Zygon — It floats. Will it stay upright?</title><style>
  @font-face{font-family:Study;src:url('${embedded("fonts/NotoSerif-Regular.ttf", "font/ttf")}')}@font-face{font-family:'Cabinet Sans';src:url('${font}')}
  *{box-sizing:border-box}body{font:16px/1.65 Study,serif;background:#f7f3e8;color:#303b2c;max-width:1000px;margin:auto;padding:2rem}h1{font-size:2.7rem;line-height:1.18}h2{font-size:1.4rem}svg{display:block;width:100%;height:auto}figure{margin:1.5rem 0}.fl-definitions{position:absolute;width:0;height:0;overflow:hidden}.fl-kicker,.credit,figcaption{font-size:.8rem}.fl-reading,.fl-source{margin-top:3rem;padding-top:1rem;border-top:1px solid #a6ac98}.greek{font-size:1.15rem;line-height:1.85}.supplied{color:#9c412c}.unclear{text-decoration:underline dotted #9c412c}.fl-sic{text-decoration:underline wavy #826117}pre{white-space:pre-wrap;overflow-wrap:anywhere;font-size:.72rem}table{width:100%;border-collapse:collapse;break-inside:avoid}td,th{text-align:left;border-bottom:1px solid #a6ac98;padding:.5rem;vertical-align:top}caption{text-align:left;break-after:avoid}a{color:inherit;overflow-wrap:anywhere}.fl-limit{border:1px solid #9c412c;padding:1rem}.fl-plot{max-width:680px}.fl-source svg{max-height:1000px} @media(max-width:600px){body{padding:1rem;font-size:15px}h1{font-size:2rem}figure{margin-inline:0}}@media print{@page{size:A4;margin:16mm}body{background:white;font-size:10pt;padding:0}h1{font-size:26pt}.fl-reading,.fl-source{break-before:page;margin:0}.fl-source svg{max-height:210mm}figure{break-inside:avoid}.fl-plot{max-width:160mm}.fl-downloads{display:none}h2{break-after:avoid}pre{font-size:7pt}td,th{padding:2mm}p{orphans:3;widows:3}}
  </style></head><body>${definitions}<p class="fl-kicker">ZYGON / ARCHIMEDES, ON FLOATING BODIES II.2 AND II.4</p><h1>It floats.<br>Will it stay upright?</h1><p>A solid can have equal weight and buoyancy while a small tilt carries it farther from upright. This is a static force experiment, not an animation of physical motion.</p><p class="fl-downloads">${downloads}</p><p>Retained settings: axis a = ${fn(s.height)}, solid density = ${fn(s.density)}% of liquid, tilt = ${fn(s.angle, 7)}°. Selected reading ${s.reading + 1}.</p><p><a href="https://antonsoo.github.io/zygon/float.html?${e(floatQuery(s))}">Return to this experiment online</a>. The complete reading below uses embedded assets.</p><figure class="fl-plot">${floatDrawing(s)}<figcaption>Equal horizontal and vertical length scales. G is the whole solid's centre of gravity; B is the displaced liquid's centre of volume. Arrows have equal lengths to show equal force magnitudes, and their lengths are schematic.</figcaption></figure>${forceDrawing(s)}${floatTable(s)}<figure>${floatCurve(s)}</figure><h2>What the modern model assumes</h2><p>${e(FLOAT_SCOPE)} The solid is the region x² + y² ≤ z ≤ a. The broad flat circle is its base. Density σ determines the upright submerged depth d = a√σ. For tilt θ, b = tan θ and the candidate water plane is z = bx + c with c = d − b²/4. The displaced cap's centre is (b/2, 0, 2d/3 + b²/4); the solid's centre is (0, 0, 2a/3). Their horizontal separation in the world is sin θ [1/2 − 2(a−d)/3 + tan²θ/4]. A positive gap turns the body left; a negative gap turns it right. A zero gap alone says balanced, not stable.</p><p>The full displaced cap must fit below z = a: (|b|/2 + √d)² &lt; a. At contact or beyond it, the model withholds displaced volume and force results. It neither continues a convenient infinite-paraboloid formula nor solves the base-crossing case. Rounded values and plotted samples are illustrations of the analytic model, not Archimedes' geometrical proof.</p><p>The upright linear stiffness changes sign at σ = (1 − 3/(4a))² when a &gt; 3/4. At equality finite nonzero dry-base tilts still restore, although the linear term is zero. Below that density the upright state is balanced but unstable; a nonzero balanced tilt can exist. Its dry-base condition is checked separately.</p><h2>Readings, witnesses and editorial signs</h2><p>Greek follows the released Netz–Wilson transcription. Red angle brackets mark supplied letters, dotted underlines uncertain readings, italics expanded abbreviations, and wavy underlines a reading marked sic. These are selected passages with new English teaching translations, not the full treatise or a new decipherment. Latin follows the pre-palimpsest text printed by Heiberg in 1881. The proof break and the missing denominator remain visible. No Latin is invented for the absent proof ending.</p>${readings}${pages}<section class="fl-reading"><h2>Retained transcriptions and provenance</h2><ul>${sources}</ul><h2>Sources and rights</h2><pre>${e(text("sources/float-NOTICES.txt"))}</pre><h2>Creative Commons Attribution 3.0</h2><pre>${e(text("sources/CC-BY-3.0.txt"))}</pre><h2>Code and diagrams / MIT</h2><pre>${e(text("sources/CODE-LICENSE.txt"))}</pre><h2>Font licenses</h2><pre>${e(text("fonts/NotoSerif-OFL.txt"))}\n${e(text("fonts/IBMPlex-OFL.txt"))}</pre></section></body></html>`;
}
