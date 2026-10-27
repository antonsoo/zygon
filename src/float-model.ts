/** Modern hydrostatics of x²+y² <= z <= a. Lengths use the unit in z=x²+y². */
export interface FloatState {
  height: number;
  density: number;
  angle: number;
  reading: number;
}

export const FLOAT_DEFAULT: FloatState = { height: 1.5, density: 16, angle: 10, reading: 0 };
export const FLOAT_SCOPE =
  "Uniform solid paraboloid; flat, still, unbounded liquid; parallel gravity; base wholly dry. Static forces, not motion or a vessel reconstruction.";

export function validFloat(value: unknown): value is FloatState {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const v = value as Record<string, unknown>;
  return (
    Object.keys(v).sort().join(",") === "angle,density,height,reading" &&
    typeof v.height === "number" &&
    Number.isFinite(v.height) &&
    v.height >= 0.5 &&
    v.height <= 2.5 &&
    typeof v.density === "number" &&
    Number.isFinite(v.density) &&
    v.density >= 4 &&
    v.density <= 90 &&
    typeof v.angle === "number" &&
    Number.isFinite(v.angle) &&
    Math.abs(v.angle) <= 60 &&
    typeof v.reading === "number" &&
    Number.isInteger(v.reading) &&
    v.reading >= 0 &&
    v.reading <= 5
  );
}

export function floatQuery(s: FloatState): string {
  return new URLSearchParams({
    a: String(s.height),
    density: String(s.density),
    tilt: String(s.angle),
    reading: String(s.reading),
  }).toString();
}

export function readFloat(query: string): { state: FloatState; invalid: boolean } {
  const p = new URLSearchParams(query);
  if (!p.size) return { state: { ...FLOAT_DEFAULT }, invalid: false };
  const allowed = ["a", "density", "tilt", "reading"];
  if ([...p.keys()].some((k) => !allowed.includes(k) || p.getAll(k).length !== 1))
    return { state: { ...FLOAT_DEFAULT }, invalid: true };
  const number = (key: string, fallback: number) =>
    p.has(key) && p.get(key)?.trim() ? Number(p.get(key)) : p.has(key) ? Number.NaN : fallback;
  const state = {
    height: number("a", FLOAT_DEFAULT.height),
    density: number("density", FLOAT_DEFAULT.density),
    angle: number("tilt", FLOAT_DEFAULT.angle),
    reading: number("reading", 0),
  };
  return validFloat(state)
    ? { state, invalid: false }
    : { state: { ...FLOAT_DEFAULT }, invalid: true };
}

export function floatRecord(s: FloatState): string {
  return JSON.stringify(
    { format: "zygon-floating", version: 1, scope: FLOAT_SCOPE, settings: s },
    null,
    2,
  );
}

export function importFloat(text: string): FloatState {
  if (text.length > 12000) throw new Error("This is larger than a floating experiment record.");
  const r: unknown = JSON.parse(text);
  if (!r || typeof r !== "object" || Array.isArray(r))
    throw new Error("Choose a Zygon floating experiment JSON.");
  const v = r as Record<string, unknown>;
  if (
    Object.keys(v).sort().join(",") !== "format,scope,settings,version" ||
    v.format !== "zygon-floating" ||
    v.version !== 1 ||
    v.scope !== FLOAT_SCOPE ||
    !validFloat(v.settings)
  )
    throw new Error(
      "Unsupported or invalid floating experiment. The current experiment has been kept.",
    );
  return { ...v.settings };
}

export function floatModel(s: FloatState) {
  const a = s.height,
    sigma = s.density / 100,
    theta = (s.angle * Math.PI) / 180;
  const b = Math.tan(theta),
    d = a * Math.sqrt(sigma),
    c = d - (b * b) / 4;
  const cos = Math.cos(theta),
    sin = Math.sin(theta);
  const point = (x: number, z: number) => ({ x: x * cos + z * sin, z: -x * sin + z * cos });
  const G = point(0, (2 * a) / 3);
  const capB = point(b / 2, (2 * d) / 3 + (b * b) / 4);
  // Checking the whole cap also rejects the detached branch of the quadratic
  // rim inequality. An above-rim infinite-paraboloid cap is not displaced water.
  const capTop = (Math.abs(b) / 2 + Math.sqrt(d)) ** 2;
  const clearance = cos * (a - c - Math.abs(b) * Math.sqrt(a));
  const dry = capTop < a - 1e-10;
  const touching = Math.abs(capTop - a) <= 1e-10;
  const lever = capB.x - G.x;
  const stiffness = 0.5 - (2 * (a - d)) / 3;
  const stable = stiffness > 1e-10 ? "stable" : stiffness < -1e-10 ? "unstable" : "critical";
  const tanSquared = (8 * (a - d)) / 3 - 2;
  const obliqueAngle =
    tanSquared > 1e-10 ? (Math.atan(Math.sqrt(tanSquared)) * 180) / Math.PI : null;
  const obliqueDry =
    obliqueAngle !== null && (Math.sqrt(tanSquared) / 2 + Math.sqrt(d)) ** 2 < a - 1e-10;
  const contactAngle = (Math.atan(2 * (Math.sqrt(a) - Math.sqrt(d))) * 180) / Math.PI;
  const turning = !dry
    ? "outside"
    : Math.abs(lever) < 1e-9
      ? "balanced"
      : lever > 0
        ? "left"
        : "right";
  return {
    a,
    sigma,
    theta,
    b,
    d,
    c,
    G,
    B: dry ? capB : null,
    point,
    capTop,
    clearance,
    dry,
    touching,
    lever: dry ? lever : null,
    volume: (Math.PI * a * a) / 2,
    submerged: dry ? (Math.PI * d * d) / 2 : null,
    water: c * cos,
    stiffness,
    stable,
    obliqueAngle,
    obliqueDry,
    contactAngle,
    turning,
    criticalDensity: a <= 0.75 ? null : 100 * (1 - 0.75 / a) ** 2,
  };
}

export function floatCSV(s: FloatState): string {
  const lines = [
    "tilt_degrees,base_status,submerged_volume,body_volume,buoyancy_minus_weight_x,turn,scope",
  ];
  for (let angle = -60; angle <= 60; angle += 0.5) {
    const m = floatModel({ ...s, angle });
    lines.push(
      [
        angle,
        m.dry ? "dry" : m.touching ? "touching" : "outside_dry_base_model",
        m.submerged ?? "",
        m.volume,
        m.lever ?? "",
        m.turning,
        `"${FLOAT_SCOPE}"`,
      ].join(","),
    );
  }
  return `${lines.join("\n")}\n`;
}
