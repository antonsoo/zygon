import { escapeHTML as e } from "./drawing";
import { Q } from "./model";
import { type ParabolaState, parabolaModel, parabolaPoint } from "./parabola-model";

const n = (v: number) => Number(v.toFixed(4));
const root = (w: number, h: number, title: string, description: string, body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" class="pa-diagram ${w === 700 ? "pa-geometry" : w === 1000 ? "pa-fill" : "pa-beam-figure"}" role="img" aria-label="${e(title)}"><title>${e(title)}</title><desc>${e(description)}</desc><style>text{font-family:'Cabinet Sans',sans-serif;fill:#303b2c;font-size:18px}.pa-fine{font-size:15px}.pa-label{font-family:'Cabinet Serif',serif;paint-order:stroke;stroke:#f7f3e8;stroke-width:5;stroke-linejoin:round}.pa-outline{fill:none;stroke:#303b2c;stroke-width:1.8}.pa-curve{fill:none;stroke:#9c412c;stroke-width:3}.pa-dash{stroke:#697260;stroke-width:1.4;stroke-dasharray:6 5;fill:none}.pa-mobile{display:none}@media(max-width:600px){.pa-fine,.pa-desktop{display:none}.pa-mobile{display:block;font-size:44px}.pa-fill .pa-label{font-size:44px}.pa-geometry .pa-label{font-size:28px}.pa-beam-figure .pa-label{font-size:34px}}</style>${body}</svg>`;
export function parabolaGeometry(s: ParabolaState): string {
  const m = parabolaModel(s),
    w = m.width.value,
    h = m.height.value,
    u = m.u.value;
  const scale = Math.min(580 / (2 * w), 400 / (4.5 * h)),
    margin = (700 - 2 * w * scale) / 2;
  const X = (x: number) => n(margin + (x + 1.5 * w) * scale),
    Y = (y: number) => n(480 - y * scale);
  const p = (x: number, y: number) => `${X(x)},${Y(y)}`;
  const label = (text: string, x: number, y: number, dx = 0, dy = 0) =>
    `<text class="pa-label" x="${X(x) + dx}" y="${Y(y) + dy}">${text}</text>`;
  const x = w * (u - 0.5),
    M = 4 * h * (1 - u),
    O = 4 * h * u * (1 - u),
    N = 2 * h * (1 - u);
  const curve = Array.from({ length: 101 }, (_, i) =>
    p(w * (i / 100 - 0.5), 4 * h * (i / 100) * (1 - i / 100)),
  ).join(" ");
  return root(
    700,
    550,
    "The parabola and the source's auxiliary triangle",
    `Equal horizontal and vertical scale. Chord ${m.width}, height ${m.height}. The large triangle has four times the small triangle's area. The source's Θ is one K–Γ arm beyond K; the trial hanging point changes only on the separate working beam.`,
    `
 <path d="M${p(-w / 2, 0)}L${p(-w / 2, 4 * h)}L${p(w / 2, 0)}Z" fill="#b18a2b22" stroke="#826117" stroke-width="2"/>
 <path d="M${p(-w / 2, 0)}L${p(0, h)}L${p(w / 2, 0)}Z" fill="#41614b22" stroke="#41614b" stroke-width="1.6"/>
 <polygon points="${curve}" fill="#9c412c10"/><polyline points="${curve}" class="pa-curve"/>
 <path d="M${p(-1.5 * w, 4 * h)}L${p(w / 2, 0)}" class="pa-outline"/>
 <path d="M${p(0, 0)}L${p(0, 2 * h)}" class="pa-dash"/>
 <path d="M${p(x, 0)}L${p(x, M)}" stroke="#826117" stroke-width="5"/>
 <path d="M${p(x, 0)}L${p(x, O)}" stroke="#9c412c" stroke-width="4"/>
 <path d="M${p(-1.5 * w, 4 * h - O / 2)}L${p(-1.5 * w, 4 * h + O / 2)}" stroke="#9c412c" stroke-width="5"/>
 <circle cx="${X(-w / 2)}" cy="${Y(2 * h)}" r="5" fill="#303b2c"/><circle cx="${X(-w / 6)}" cy="${Y((4 * h) / 3)}" r="4" fill="#41614b"/>${label("Χ", -w / 6, (4 * h) / 3, -24, -5)}
 ${label("Α", -w / 2, 0, -23, 22)}${label("Γ", w / 2, 0, 10, 22)}${label(u === 0.5 ? "Β = Ο = Ν" : "Β", 0, h, 8, -10)}${label("Ζ", -w / 2, 4 * h, 8, -10)}${label("Κ", -w / 2, 2 * h, -25, 5)}${label("Θ", -1.5 * w, 4 * h, -25, 5)}
 ${u > 0 && u < 1 ? `${label("Μ", x, M, 8, -9)}${label("Ξ", x, 0, -6, 25)}${u === 0.5 ? "" : `${label("Ο", x, O, 8, 18)}${label("Ν", x, N, 8, -9)}`}` : ""}
 <text x="350" y="535" text-anchor="middle" class="pa-fine">Source construction / equal length scales / trial arm on the separate beam</text>`,
  );
}
export function parabolaBeam(s: ParabolaState): string {
  const m = parabolaModel(s),
    cx = 470,
    cy = 85,
    unit = 170;
  const lx = cx - unit * m.arm.value,
    rx = cx + unit * m.u.value;
  const scale = 110 / Math.max(1, m.triangleSlice.value, m.slice.value);
  const strip = (x: number, length: number, color: string) =>
    `<path d="M${n(x)} ${cy}V155" stroke="#697260" stroke-width="1.2"/><rect x="${n(x - 8)}" y="155" width="16" height="${n(Math.max(0, length * scale))}" fill="${color}"/>`;
  const result = m.inconclusive
    ? "End cut: both turning moments vanish; the arm remains undetermined."
    : m.pointFits
      ? "These two sections balance."
      : m.difference.n < 0n
        ? "The right moment is greater."
        : "The left moment is greater.";
  return root(
    900,
    340,
    "A separate horizontal working balance",
    `${result} Left moment ${m.left}; right moment ${m.right}; common strip thickness and density suppressed. Rectangle widths are symbolic; their heights share a length scale.`,
    `
 <path d="M${Math.min(lx - 30, cx - unit - 25)} ${cy}H${cx + unit + 25}" stroke="#303b2c" stroke-width="5"/>
 <path d="M${cx} ${cy}L${cx - 20} ${cy + 35}H${cx + 20}Z" fill="#303b2c"/>
 <path d="M${cx - unit} 44V67M${cx + unit} 44V67" class="pa-dash"/>
 <text x="${cx - unit}" y="29" text-anchor="middle" class="pa-fine">source Θ</text><text x="${cx + unit}" y="29" text-anchor="middle" class="pa-label">Γ</text>
 ${strip(lx, m.slice.value, "#9c412c")}${strip(rx, m.triangleSlice.value, "#826117")}
 <text x="${cx}" y="143" text-anchor="middle" class="pa-label">Κ</text>
 <text x="225" y="293" text-anchor="middle" class="pa-desktop">Parabola section ΞΟ</text><text x="675" y="293" text-anchor="middle" class="pa-desktop">Triangle section ΜΞ</text><text x="225" y="293" text-anchor="middle" class="pa-mobile">ΞΟ</text><text x="675" y="293" text-anchor="middle" class="pa-mobile">ΜΞ</text>
 <text x="450" y="328" text-anchor="middle" class="pa-fine">${e(result)}</text>`,
  );
}
export function parabolaFill(s: ParabolaState): string {
  const m = parabolaModel(s),
    w = m.width.value,
    h = m.height.value;
  const scale = Math.min(840 / w, 360 / h),
    X = (x: number) => n(500 + x * scale),
    Y = (y: number) => n(440 - y * scale);
  const points = (vertices: { x: Q; y: Q }[]) =>
    vertices.map((p) => `${X(p.x.value)},${Y(p.y.value)}`).join(" ");
  const colors = [
    "#41614b",
    "#66806b",
    "#8ca08e",
    "#adbcae",
    "#c4d0c4",
    "#738b74",
    "#9faf9c",
    "#c1ccbb",
  ];
  const curve = Array.from({ length: 201 }, (_, i) => {
    const p = parabolaPoint(m.width, m.height, new Q(i, 200));
    return `${X(p.x.value)},${Y(p.y.value)}`;
  }).join(" ");
  return root(
    1000,
    640,
    "Inscribed triangles and tangent outer covers",
    `${2 ** (s.depth + 1) - 1} inscribed triangles have exact area ${m.sum}. Tangent covers add ${m.gap}, giving strict upper bound ${m.upper}. The candidate ${m.candidate} is strictly between. Layer ${s.depth} has area ${m.last}; its third ${m.correction} is an algebraic correction, not another filled triangle.`,
    `
 <defs><clipPath id="pa-cover-clip">${m.covers.map((t) => `<polygon points="${points(t)}"/>`).join("")}</clipPath></defs>
 <g clip-path="url(#pa-cover-clip)"><rect x="0" y="0" width="1000" height="500" fill="#e4d8b9"/><path d="${Array.from({ length: 151 }, (_, i) => `M${-600 + i * 12} 500l500 -500`).join(" ")}" fill="none" stroke="#826117" stroke-width="1"/></g>
 ${m.covers.map((t) => `<polygon data-pa-cover="true" points="${points(t)}" fill="none" stroke="#826117" stroke-width=".9"/>`).join("")}

 ${m.layers.map((l) => l.triangles.map((t) => `<polygon data-pa-layer="${l.depth}" points="${points(t)}" fill="${colors[l.depth]}" stroke="#f7f3e8" stroke-width=".7"/>`).join("")).join("")}
 <polyline points="${curve}" class="pa-curve"/><path d="M${X(-w / 2)} ${Y(0)}H${X(w / 2)}" class="pa-outline"/>
 <text x="${X(-w / 2) - 20}" y="${Y(0) + 25}" class="pa-label">Α</text><text x="${X(w / 2) + 10}" y="${Y(0) + 25}" class="pa-label">Γ</text><text x="508" y="${Y(h) - 10}" class="pa-label">Β</text>
 <text x="500" y="487" text-anchor="middle" class="pa-fine">Green: complete inscribed layers / hatching: tangent covers of curved remainders</text>
 <path d="M120 555H880M120 543V567M880 543V567" stroke="#303b2c" stroke-width="2"/>
 <path d="M626.6667 535V573" stroke="#9c412c" stroke-width="4"/>
 <text x="120" y="530" class="pa-fine">Lower bound</text><text x="880" y="530" text-anchor="end" class="pa-fine">Upper bound</text><text x="626.6667" y="601" text-anchor="middle" class="pa-desktop">Four-thirds candidate</text><text x="120" y="530" class="pa-mobile">Lower</text><text x="880" y="530" text-anchor="end" class="pa-mobile">Upper</text><text x="626.6667" y="610" text-anchor="middle" class="pa-mobile">4/3 candidate</text>
 <text x="500" y="635" text-anchor="middle" class="pa-fine">Remaining interval enlarged ${2 * 4 ** s.depth}× relative to the first triangle’s area</text>`,
  );
}
export function parabolaPlate(s: ParabolaState): string {
  return s.view === "fill" ? parabolaFill(s) : parabolaGeometry(s);
}
