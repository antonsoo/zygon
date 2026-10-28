import { Q } from "./model";

const q = (n: number, d = 1) => new Q(n, d);
export interface ParabolaState {
  width: string;
  height: string;
  cut: number;
  arm: number;
  depth: number;
  view: "balance" | "fill";
  reading: number;
  page: number;
  proposal: string;
}
export const initialParabola: ParabolaState = {
  width: "2",
  height: "1",
  cut: 50,
  arm: 60,
  depth: 1,
  view: "balance",
  reading: 0,
  page: 0,
  proposal: "4/3",
};
export function parabolaProposalFraction(value: unknown): Q {
  if (typeof value !== "string" || !/^\d{1,8}(?:\/\d{1,8})?$/.test(value))
    throw new Error("Propose a whole number or fraction with at most eight digits in each part.");
  const [n, d = "1"] = value.split("/");
  const ratio = new Q(BigInt(n as string), BigInt(d));
  if (ratio.n < ratio.d || ratio.n > 2n * ratio.d)
    throw new Error("Choose a proposed ratio from 1 to 2 times the first triangle.");
  return ratio;
}
export function parabolaBounds(first: Q, depth: number) {
  const last = first.over(new Q(4n ** BigInt(depth)));
  const lower = first.times(q(4, 3)).minus(last.over(q(3)));
  return { lower, upper: lower.plus(last.over(q(2))), last };
}
export function parabolaProposalWitness(proposal: Q, first = q(1)) {
  const area = proposal.times(first);
  if (proposal.minus(q(4, 3)).n === 0n) return null;
  // Eight-digit rational inputs need fewer than 32 refinements. This finite
  // account does not allocate or pretend to draw its exponentially many triangles.
  for (let depth = 0; depth <= 32; depth++) {
    const bounds = parabolaBounds(first, depth);
    if (area.minus(bounds.lower).n <= 0n || area.minus(bounds.upper).n >= 0n)
      return { depth, ...bounds, triangles: (2n ** BigInt(depth + 1) - 1n).toString() };
  }
  throw new Error("No finite witness found within this exact-account limit.");
}
export function parabolaFraction(value: unknown): Q {
  if (typeof value !== "string" || !/^\d{1,4}(?:\/\d{1,4})?$/.test(value))
    throw new Error("Use a positive whole number or a fraction such as 3/2.");
  const [n, d = "1"] = value.split("/");
  const result = new Q(BigInt(n as string), BigInt(d));
  if (result.n <= 0n || result.value < 0.05 || result.value > 12)
    throw new Error("Choose a length between 1/20 and 12 units.");
  return result;
}
export function validateParabola(value: unknown): ParabolaState {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Choose a complete parabola experiment.");
  const s = value as Record<string, unknown>;
  if (Object.keys(s).sort().join() !== Object.keys(initialParabola).sort().join())
    throw new Error("The experiment has missing or unknown settings.");
  const integer = (key: string, lo: number, hi: number) =>
    typeof s[key] === "number" && Number.isInteger(s[key]) && s[key] >= lo && s[key] <= hi;
  if (
    !integer("cut", 0, 100) ||
    !integer("arm", 0, 200) ||
    !integer("depth", 0, 7) ||
    !integer("reading", 0, 6) ||
    !integer("page", 0, 15) ||
    !["balance", "fill"].includes(s.view as string)
  )
    throw new Error("The experiment contains an invalid cut, arm, layer or reading.");
  return {
    ...s,
    width: parabolaFraction(s.width).toString(),
    height: parabolaFraction(s.height).toString(),
    proposal: parabolaProposalFraction(s.proposal).toString(),
  } as unknown as ParabolaState;
}
export function parabolaQuery(s: ParabolaState): string {
  return `?${new URLSearchParams(Object.entries(validateParabola(s)).map(([key, value]) => [key, String(value)]))}`;
}
export function readParabolaQuery(search: string): ParabolaState {
  if (search.length > 1024) throw new Error("The experiment link is too long.");
  const params = new URLSearchParams(search),
    s = { ...initialParabola } as Record<string, unknown>;
  for (const [key, value] of params) {
    if (!Object.hasOwn(s, key) || params.getAll(key).length !== 1)
      throw new Error("The link has unknown or repeated settings.");
    if (["width", "height", "view", "proposal"].includes(key)) s[key] = value;
    else {
      if (!/^\d{1,3}$/.test(value)) throw new Error("The link has an invalid numeric setting.");
      s[key] = Number(value);
    }
  }
  return validateParabola(s);
}
export function parabolaJson(s: ParabolaState): string {
  return `${JSON.stringify({ format: "zygon-parabola", version: 2, state: validateParabola(s) }, null, 2)}\n`;
}
export function readParabolaJson(text: string): ParabolaState {
  if (text.length > 8192) throw new Error("Choose an experiment smaller than 8 KB.");
  const fields = new Set<string>();
  for (const token of text.matchAll(/"(?:\\.|[^"\\])*"/g)) {
    if (!/^\s*:/.test(text.slice((token.index ?? 0) + token[0].length))) continue;
    const field = JSON.parse(token[0]) as string;
    if (fields.has(field)) throw new Error("The experiment repeats a field.");
    fields.add(field);
  }
  const record: unknown = JSON.parse(text);
  if (
    !record ||
    typeof record !== "object" ||
    Array.isArray(record) ||
    Object.keys(record).sort().join() !== "format,state,version" ||
    !("format" in record) ||
    record.format !== "zygon-parabola" ||
    !("version" in record) ||
    ![1, 2].includes(record.version as number) ||
    !("state" in record)
  )
    throw new Error("Choose a version 1 or 2 Zygon parabola experiment.");
  if (record.version === 1) {
    const old = record.state;
    if (
      !old ||
      typeof old !== "object" ||
      Array.isArray(old) ||
      Object.keys(old).sort().join() !==
        Object.keys(initialParabola)
          .filter((k) => k !== "proposal")
          .sort()
          .join()
    )
      throw new Error("The version 1 experiment has missing or unknown settings.");
    return validateParabola({ ...old, proposal: "4/3" });
  }
  return validateParabola(record.state);
}
export interface ParabolaPoint {
  x: Q;
  y: Q;
}
export function parabolaPoint(width: Q, height: Q, u: Q): ParabolaPoint {
  return { x: width.times(u.minus(q(1, 2))), y: q(4).times(height).times(u).times(q(1).minus(u)) };
}
export function parabolaTriangle(width: Q, height: Q, a: Q, b: Q, outer = false): ParabolaPoint[] {
  const middle = a.plus(b).over(q(2)),
    p = parabolaPoint(width, height, middle);
  return [
    parabolaPoint(width, height, a),
    { x: p.x, y: outer ? p.y.plus(height.times(b.minus(a)).times(b.minus(a))) : p.y },
    parabolaPoint(width, height, b),
  ];
}
export function parabolaModel(s: ParabolaState) {
  const width = parabolaFraction(s.width),
    height = parabolaFraction(s.height),
    u = q(s.cut, 100),
    arm = q(s.arm, 100);
  const slice = q(4).times(height).times(u).times(q(1).minus(u));
  const triangleSlice = q(4).times(height).times(q(1).minus(u));
  const left = slice.times(width).times(arm),
    right = triangleSlice.times(width).times(u);
  const first = width.times(height).over(q(2)),
    bigTriangle = first.times(q(4));
  const candidate = first.times(q(4, 3));
  let sum = q(0);
  const layers = Array.from({ length: s.depth + 1 }, (_, depth) => {
    const count = 2 ** depth,
      area = first.over(q(4 ** depth));
    sum = sum.plus(area);
    const triangles = Array.from({ length: count }, (_, i) =>
      parabolaTriangle(width, height, q(i, count), q(i + 1, count)),
    );
    return { depth, count, area, each: area.over(q(count)), triangles };
  });
  const last = first.over(q(4 ** s.depth)),
    correction = last.over(q(3));
  const remainderCount = 2 ** (s.depth + 1);
  const covers = Array.from({ length: remainderCount }, (_, i) =>
    parabolaTriangle(width, height, q(i, remainderCount), q(i + 1, remainderCount), true),
  );
  const gap = last.over(q(2)),
    upper = sum.plus(gap);
  const proposal = parabolaProposalFraction(s.proposal),
    proposed = proposal.times(first);
  const proposalStatus =
    proposed.minus(sum).n <= 0n
      ? "too small"
      : proposed.minus(upper).n >= 0n
        ? "too large"
        : "not excluded at this layer";
  return {
    width,
    height,
    u,
    arm,
    slice,
    triangleSlice,
    left,
    right,
    difference: left.minus(right),
    pointFits: left.minus(right).n === 0n,
    universalFit: s.arm === 100,
    inconclusive: s.cut === 0 || s.cut === 100,
    first,
    bigTriangle,
    candidate,
    layers,
    sum,
    last,
    correction,
    covers,
    upper,
    gap,
    candidateInside: candidate.minus(sum).n > 0n && upper.minus(candidate).n > 0n,
    relativeGap: gap.over(first),
    proposal,
    proposed,
    proposalStatus,
    proposalWitness: parabolaProposalWitness(proposal, first),
  };
}
export function parabolaCsv(s: ParabolaState): string {
  const m = parabolaModel(s);
  const rows = [
    ["quantity", "exact_value", "unit_or_meaning"],
    ["base", m.width.toString(), "length"],
    ["height", m.height.toString(), "length"],
    ["cut_fraction", m.u.toString(), "from A to Gamma"],
    ["left_arm_fraction", m.arm.toString(), "relative to K-Gamma"],
    ["parabola_slice", m.slice.toString(), "length"],
    ["auxiliary_triangle_slice", m.triangleSlice.toString(), "length"],
    [
      "left_moment",
      m.left.toString(),
      "length squared; common strip thickness and density suppressed",
    ],
    ["right_moment", m.right.toString(), "same units as left"],
    ["moment_difference", m.difference.toString(), "left minus right"],
    ["all_interior_cuts_fit", String(m.universalFit), "identity; not a sampled grid"],
    ["first_triangle", m.first.toString(), "area"],
    ["proposed_ratio", m.proposal.toString(), "relative to the first triangle"],
    ["proposed_area", m.proposed.toString(), "area; a learner hypothesis"],
    ["proposal_status", m.proposalStatus, "comparison with the current strict bounds"],
    [
      "first_rejecting_layer",
      m.proposalWitness ? String(m.proposalWitness.depth) : "none",
      "exact finite bounds; may exceed the drawn depth",
    ],
    ...m.layers.map((l) => [`layer_${l.depth}_area`, l.area.toString(), `${l.count} triangles`]),
    ["inscribed_sum", m.sum.toString(), "strict lower area bound"],
    ["tangent_upper_bound", m.upper.toString(), "strict upper area bound"],
    [
      "last_layer_third",
      m.correction.toString(),
      "algebraic correction, not another inscribed triangle",
    ],
    [
      "four_thirds_first",
      m.candidate.toString(),
      "candidate from the mechanical argument and finite identity",
    ],
    ["bound_gap", m.gap.toString(), "area"],
  ];
  return `${rows.map((row) => row.map((value) => `"${value.replaceAll('"', '""')}"`).join(",")).join("\r\n")}\r\n`;
}
