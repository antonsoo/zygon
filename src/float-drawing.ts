import { escapeHTML as e } from "./drawing";
import { type FloatState, floatModel } from "./float-model";

export const fn = (v: number, digits = 4) =>
  Math.abs(v) < 1e-10 ? "0" : Number(v.toFixed(digits)).toString();
const p = (v: number) => v.toFixed(3);

export function floatDrawing(s: FloatState, phone = false): string {
  const m = floatModel(s),
    scale = phone ? 80 : 96,
    width = phone ? 400 : 640,
    gx = phone ? 200 : 310,
    gy = phone ? 245 : 265;
  const xy = (x: number, z: number) => {
    const t = m.point(x, z);
    return [gx + scale * (t.x - m.G.x), gy - scale * (t.z - m.G.z)];
  };
  const r = Math.sqrt(m.a),
    outline = Array.from({ length: 101 }, (_, i) => {
      const x = -r + (2 * r * i) / 100;
      return xy(x, x * x)
        .map(p)
        .join(",");
    }).join(" ");
  const water = gy - scale * (m.water - m.G.z);
  const B = m.B ? [gx + scale * (m.B.x - m.G.x), gy - scale * (m.B.z - m.G.z)] : null;
  const base1 = xy(-r, m.a),
    base2 = xy(r, m.a),
    v = xy(0, 0),
    top = xy(0, m.a);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} 470" role="img" aria-label="Solid paraboloid, tilted ${e(fn(s.angle))} degrees. ${m.dry ? "Equal vertical weight and buoyancy act through G and B." : "The candidate submerged cap crosses the base; buoyancy is not calculated."}">
  <defs><clipPath id="fl-body"><polygon points="${outline}"/></clipPath><marker id="fl-red" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0 0L6 3L0 6" fill="none" stroke="#9c412c" stroke-width="1.3"/></marker><marker id="fl-green" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0 0L6 3L0 6" fill="none" stroke="#245c53" stroke-width="1.3"/></marker></defs>
  <rect width="${width}" height="470" fill="#f7f3e8"/>
  <rect x="0" y="${p(water)}" width="${width}" height="${p(Math.max(0, 470 - water))}" fill="#d5e3df"/>
  <polygon points="${outline}" fill="#e4d9b8" stroke="#525947" stroke-width="1.8"/>
  <rect x="0" y="${p(water)}" width="${width}" height="${p(Math.max(0, 470 - water))}" fill="#83ada4" clip-path="url(#fl-body)"/>
  <line x1="0" y1="${p(water)}" x2="${width}" y2="${p(water)}" stroke="#245c53" stroke-width="1.5" ${m.dry ? "" : 'stroke-dasharray="7 5"'}/>
  <line x1="${v[0]}" y1="${v[1]}" x2="${top[0]}" y2="${top[1]}" stroke="#525947" stroke-dasharray="5 5"/>
  <line x1="${base1[0]}" y1="${base1[1]}" x2="${base2[0]}" y2="${base2[1]}" stroke="${m.dry ? "#525947" : "#9c412c"}" stroke-width="3"/>
  <g font-family="Cabinet Sans, sans-serif" font-size="15" fill="#303b2c"><text x="22" y="28">AXIAL SECTION OF A SOLID</text><text x="22" y="50" font-size="13">${phone ? "A rotated parabola makes this solid." : "Rotate this parabola about its axis; the object has volume."}</text><text x="22" y="447" font-size="13">One length unit</text><path d="M153 436v8m0 -4h${scale}m0 -4v8" stroke="#303b2c"/><text x="${phone ? 22 : 400}" y="${phone ? 460 : 447}" font-size="13">${m.dry ? "Base wholly above liquid" : "Outside the dry-base model"}</text>
  ${m.dry && B ? `<line x1="${gx}" y1="${gy}" x2="${gx}" y2="${gy + 75}" stroke="#9c412c" stroke-width="3" marker-end="url(#fl-red)"/><circle cx="${gx}" cy="${gy}" r="4.5" fill="#9c412c"/><text x="${gx - 23}" y="${gy - 6}" fill="#9c412c">G</text><line x1="${B[0]}" y1="${B[1]}" x2="${B[0]}" y2="${(B[1] ?? 0) - 75}" stroke="#245c53" stroke-width="3" marker-end="url(#fl-green)"/><circle cx="${B[0]}" cy="${B[1]}" r="4.5" fill="#245c53"/><text x="${(B[0] ?? 0) + 13}" y="${(B[1] ?? 0) + 7}" fill="#245c53">B</text>` : `<text x="22" y="82" fill="#9c412c">${phone ? "Base crossed. Forces withheld." : "Candidate waterline only. Force arrows withheld."}</text>`}
  </g></svg>`;
}

export function forceDrawing(s: FloatState, phone = false): string {
  const m = floatModel(s);
  if (!m.dry || m.lever === null)
    return `<p class="fl-limit">The complete cap no longer fits inside the solid. No force-line comparison is reported.</p>`;
  const width = phone ? 400 : 640,
    centre = width / 2,
    scale = phone ? 80 : 96;
  const magnification = Math.min(20, (phone ? 110 : 220) / Math.max(1, Math.abs(m.lever * scale)));
  const x = centre + m.lever * scale * magnification;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${phone ? 150 : 128}" role="img" aria-label="Horizontal separation of force lines: B minus G is ${fn(m.lever, 7)} length units. Horizontal magnification ${fn(magnification, 1)} times."><rect width="${width}" height="${phone ? 150 : 128}" fill="#eee9da"/><g font-family="Cabinet Sans, sans-serif" font-size="14"><text x="20" y="24" fill="#303b2c">FORCE-LINE MICROSCOPE</text><text x="20" y="46" fill="#303b2c">Horizontal ×${fn(magnification, 1)}; ${phone ? "horizontal only." : "height has no meaning here."}</text><line x1="${centre}" y1="61" x2="${centre}" y2="99" stroke="#9c412c" stroke-width="2"/><line x1="${p(x)}" y1="61" x2="${p(x)}" y2="99" stroke="#245c53" stroke-width="2"/><line x1="${p(Math.min(x, centre))}" y1="80" x2="${p(Math.max(x, centre))}" y2="80" stroke="#303b2c"/><text x="${centre - 17}" y="119" text-anchor="end" fill="#9c412c">Weight / G</text><text x="${p(x + 12)}" y="63" fill="#245c53">Buoyancy / B</text><text x="${width - 20}" y="${phone ? 144 : 119}" text-anchor="end" fill="#303b2c">B − G: ${fn(m.lever, 7)}</text></g></svg>`;
}

export function floatCurve(s: FloatState, phone = false): string {
  const values = Array.from({ length: 241 }, (_, i) => ({
    angle: -60 + i / 2,
    m: floatModel({ ...s, angle: -60 + i / 2 }),
  }));
  const max = Math.max(0.02, ...values.filter((v) => v.m.dry).map((v) => Math.abs(v.m.lever ?? 0)));
  const width = phone ? 400 : 640,
    left = phone ? 25 : 60,
    right = width - (phone ? 20 : 40);
  const x = (a: number) => left + ((a + 60) * (right - left)) / 120,
    y = (v: number) => 132 - (v * 72) / max;
  let d = "",
    started = false;
  for (const v of values) {
    if (!v.m.dry) {
      started = false;
      continue;
    }
    d += `${started ? "L" : "M"}${p(x(v.angle))} ${p(y(-(v.m.lever ?? 0)))} `;
    started = true;
  }
  const m = floatModel(s);
  const edge = Math.min(60, m.contactAngle);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} 270" role="img" aria-label="Turning tendency against tilt. Only dry-base positions have calculated forces. A crossing of zero is a balanced orientation."><rect width="${width}" height="270" fill="#f7f3e8"/><g fill="#ebe1d2"><rect x="${left}" y="45" width="${p(x(-edge) - left)}" height="168"/><rect x="${p(x(edge))}" y="45" width="${p(right - x(edge))}" height="168"/></g><path d="M${left} 45V213H${right}M${left} 132H${right}M${x(0)} 45V213" fill="none" stroke="#a6ac98"/><path d="${d}" fill="none" stroke="#245c53" stroke-width="2.5"/>
  ${m.dry && m.lever !== null ? `<circle cx="${p(x(s.angle))}" cy="${p(y(-m.lever))}" r="5" fill="#9c412c"/>` : ""}
  <g font-family="Cabinet Sans, sans-serif" font-size="14" fill="#303b2c"><text x="${left}" y="25">${phone ? "TURNING / UNIT WEIGHT" : "TURNING TENDENCY / UNIT WEIGHT"}</text><text x="${left + 8}" y="66">Turn right (+${fn(max, 4)})</text><text x="${left + 8}" y="198">Turn left (−${fn(max, 4)})</text><text x="${left}" y="235">−60°</text><text x="${x(0)}" y="235" text-anchor="middle">Upright / 0°</text><text x="${right}" y="235" text-anchor="end">60°</text><text x="${left}" y="258">${phone ? "Shaded: dry-base model does not apply." : "Shaded: base contact or beyond; no calculated continuation."}</text></g></svg>`;
}

export function floatSVG(s: FloatState, font = ""): string {
  const caption = `Zygon: a=${fn(s.height)}, density=${fn(s.density)}%, tilt=${fn(s.angle)}°. Modern dry-base model; not motion.`;
  return floatDrawing(s)
    .replace(
      /<svg[^>]*>/,
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 500"><title>${e(caption)}</title>${font ? `<style>@font-face{font-family:'Cabinet Sans';src:url('${font}')}text{font-family:'Cabinet Sans'}</style>` : ""}`,
    )
    .replace(
      "</svg>",
      `<text x="20" y="490" font-family="serif" font-size="12">${e(caption)}</text></svg>`,
    );
}
