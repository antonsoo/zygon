import { decimal, type State, section, stack } from "./model";

export const escapeHTML = (s: string) =>
  s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
const f = (n: number) => Number(n.toFixed(3));
const root = (w: number, h: number, title: string, description: string, content: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="${escapeHTML(title)}"><title>${escapeHTML(title)}</title><desc>${escapeHTML(description)}</desc><style>text{font-family:Georgia,serif;fill:#303b2c;font-size:18px}.fine{font:14px sans-serif}.line{stroke:#303b2c;stroke-width:1.6;fill:none}.sphere{stroke:#9c412c;fill:#b95b4030}.cone{stroke:#95701d;fill:#b18a2b25}.cylinder{stroke:#41614b;fill:#41614b15}.cut{stroke:#303b2c;stroke-width:2;stroke-dasharray:5 4}.sphere,.cone,.cylinder{stroke-width:2}.bold{font-weight:bold}.beam-line{stroke:#303b2c;stroke-width:5;stroke-linecap:round}.load{stroke:#303b2c;stroke-width:1.5}.label{paint-order:stroke;stroke:#eee9da;stroke-width:5;stroke-linejoin:round;fill:#303b2c}</style>${content}</svg>`;

export function profileDrawing(s: State) {
  const cut = section(s.cut, s.arm),
    x = 140 + cut.x.value * 70;
  const a = Math.sqrt(cut.sphere.value) * 70,
    b = cut.x.value * 70;
  return root(
    440,
    380,
    "A common axial section through the three solids",
    "Sphere radius r, auxiliary cone and cylinder radius 2r and height 2r. The cutting plane is x from A.",
    `
  <rect x="140" y="40" width="140" height="280" class="cylinder"/>
  <path d="M140 180L280 40V320Z" class="cone"/>
  <circle cx="210" cy="180" r="70" class="sphere"/>
  <path d="M210 110V250" class="line" stroke-dasharray="3 4"/>
  <path d="M70 180H330" class="line"/><path d="M${x} 30V330" class="cut"/>
  <path d="M${x} ${180 - a}V${180 + a}" stroke="#9c412c" stroke-width="6"/>
  <path d="M${x} ${180 - b}V${180 + b}" stroke="#95701d" stroke-width="3"/>
  <text x="121" y="202" class="label">Α</text><text x="205" y="202" class="label">Κ</text><text x="286" y="202" class="label">Γ</text>
  <text x="292" y="46">Ε</text><text x="292" y="324">Ζ</text>
  <text x="216" y="106" class="label">Β</text><text x="216" y="269" class="label">Δ</text>
  <path d="M140 348H280M140 342V354M280 342V354" class="line"/>
  <text x="210" y="367" text-anchor="middle">diameter = 2r</text>
  <text x="20" y="82" class="fine">cylinder</text><text x="20" y="100" class="fine">radius 2r</text>
  <text x="19" y="237" class="fine">sphere</text><text x="19" y="255" class="fine">radius r</text>
  <text x="320" y="122" class="fine">cut at</text><text x="320" y="145">x = ${decimal(cut.x.value)}r</text>
  <text x="320" y="273" class="fine">cone apex Α</text><text x="320" y="293" class="fine">base ΕΖ</text>`,
  );
}

export function disksDrawing(s: State) {
  const v = section(s.cut, s.arm),
    values = [v.sphere.value, v.cone.value, 4],
    names = ["Sphere", "Cone", "Cylinder"],
    classes = ["sphere", "cone", "cylinder"];
  return root(
    440,
    160,
    "The three circular sections at the chosen cut",
    "All circles use the same radius scale; their areas, not their diameters, act as weights.",
    values
      .map(
        (a, i) =>
          `<circle cx="${75 + 145 * i}" cy="60" r="${f(Math.sqrt(a) * 25)}" class="${classes[i]}"/><text x="${75 + 145 * i}" y="128" text-anchor="middle">${names[i]}</text><text x="${75 + 145 * i}" y="151" text-anchor="middle" class="fine">${decimal(a)}πr²</text>`,
      )
      .join(""),
  );
}

export function balanceDrawing(s: State, phone = false) {
  const v = s.view === "section" ? section(s.cut, s.arm) : stack(s.count, s.arm);
  const width = phone ? 440 : 900,
    scale = phone ? 60 : 130,
    pivot = phone ? 230 : 450;
  const rightArm = s.view === "section" ? s.cut / 100 : 1;
  const leftArea =
    s.view === "section" ? section(s.cut, s.arm).sphere.value : stack(s.count, s.arm).sphere.value;
  const coneArea =
    s.view === "section" ? section(s.cut, s.arm).cone.value : stack(s.count, s.arm).cone.value;
  const cylinderArea = s.view === "section" ? 4 : 8;
  const total = v.left.value + v.right.value;
  // The deflection communicates sign only. It is not a calibrated angle of a physical apparatus.
  const angle = total
    ? Math.max(-0.16, Math.min(0.16, ((v.right.value - v.left.value) / total) * 0.25))
    : 0;
  const coord = (arm: number) => ({
    x: pivot + arm * scale * Math.cos(angle),
    y: 100 + arm * scale * Math.sin(angle),
  });
  const l = coord(-s.arm / 100),
    r = coord(rightArm),
    endL = coord(-3),
    endR = coord(2);
  const radius = (a: number) => Math.sqrt(a) * (s.view === "section" ? 13 : 9);
  const label =
    v.direction === "level"
      ? "Equal turning moments"
      : v.direction === "left"
        ? "Sphere + cone turn the bar left"
        : "Cylinder turns the bar right";
  return root(
    width,
    365,
    "Sections on a balance",
    `${label}. Left coefficient ${v.left}, right coefficient ${v.right}. ${s.view === "section" ? "Area times arm: pi r cubed, with common thickness suppressed." : "Volume times arm: pi r to the fourth, with common density suppressed."}`,
    `
  <text x="${phone ? 18 : 40}" y="32" class="fine">${s.view === "section" ? "ONE SECTION AT A TIME" : "THE FINITE MIDPOINT STACK"}</text>
  <path d="M${pivot - 20} 145L${pivot} 100L${pivot + 20} 145ZM${pivot} 145V290M${pivot - 45} 290H${pivot + 45}" class="line"/>
  <path d="M${endL.x} ${endL.y}L${endR.x} ${endR.y}" class="beam-line"/>
  <path d="M${l.x} ${l.y}V220M${r.x} ${r.y}V190" class="load"/>
  <circle cx="${l.x}" cy="${l.y}" r="5" fill="#9c412c"/><circle cx="${r.x}" cy="${r.y}" r="5" fill="#41614b"/>
  <circle cx="${l.x}" cy="168" r="${radius(leftArea)}" class="sphere"/>
  <circle cx="${l.x}" cy="220" r="${radius(coneArea)}" class="cone"/>
  <circle cx="${r.x}" cy="185" r="${radius(cylinderArea)}" class="cylinder"/>
  <text x="${l.x}" y="${l.y - 18}" text-anchor="middle">${s.arm === 200 ? "Θ" : "h"}</text>
  <text x="${pivot}" y="83" text-anchor="middle" class="label">Α</text>
  <text x="${r.x}" y="${r.y - 18}" text-anchor="middle">${s.view === "section" ? "Σ" : "Κ"}</text>
  <text x="${l.x}" y="263" text-anchor="middle" class="fine">sphere + cone</text>
  <text x="${r.x}" y="263" text-anchor="middle" class="fine">cylinder</text>
  <text x="${pivot}" y="326" text-anchor="middle" class="bold">${escapeHTML(label)}</text>
  <text x="${pivot}" y="351" text-anchor="middle" class="fine">${s.view === "section" ? "equal thickness, uniform density" : "equal density; cylinder's centre at Κ"}</text>`,
  );
}

export function stackDrawing(s: State) {
  const v = stack(s.count, s.arm),
    x0 = 85,
    y = 145,
    unit = 90,
    dx = 180 / s.count;
  return root(
    440,
    300,
    "A finite stack approximating a sphere",
    `The ${s.count} cylindrical bands use the circle at each band's midpoint. Their volume is ${v.sphere} pi r cubed; it exceeds 4/3 pi r cubed.`,
    `
  <circle cx="175" cy="145" r="90" class="line"/>
  ${v.slices.map((p, i) => `<rect x="${f(x0 + i * dx)}" y="${f(y - Math.sqrt(p.sphereArea.value) * unit)}" width="${f(dx)}" height="${f(2 * Math.sqrt(p.sphereArea.value) * unit)}" class="sphere"/>`).join("")}
  <path d="M${x0} 250H${x0 + 180}M${x0} 244V256M${x0 + 180} 244V256" class="line"/><text x="175" y="281" text-anchor="middle">${s.count} equal bands, width ${v.width}r</text>
  <text x="298" y="100" class="fine">midpoint</text><text x="298" y="121" class="fine">cylinders</text><text x="298" y="177" class="fine">outline:</text><text x="298" y="198" class="fine">true sphere</text>`,
  );
}
