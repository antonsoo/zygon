/** Exact coefficients: area pi r^2, volume pi r^3, whole-solid moment pi r^4. */
export class Q {
  readonly n: bigint;
  readonly d: bigint;
  constructor(n: bigint | number, d: bigint | number = 1) {
    let a = BigInt(n),
      b = BigInt(d);
    if (b === 0n) throw new RangeError("A ratio needs a nonzero denominator.");
    if (b < 0n) {
      a = -a;
      b = -b;
    }
    let x = a < 0n ? -a : a,
      y = b;
    while (y) [x, y] = [y, x % y];
    this.n = a / x;
    this.d = b / x;
  }
  plus(q: Q) {
    return new Q(this.n * q.d + q.n * this.d, this.d * q.d);
  }
  minus(q: Q) {
    return new Q(this.n * q.d - q.n * this.d, this.d * q.d);
  }
  times(q: Q) {
    return new Q(this.n * q.n, this.d * q.d);
  }
  over(q: Q) {
    return new Q(this.n * q.d, this.d * q.n);
  }
  get value() {
    return Number(this.n) / Number(this.d);
  }
  toString() {
    return this.d === 1n ? String(this.n) : `${this.n}/${this.d}`;
  }
  toJSON() {
    return this.toString();
  }
}
const q = (n: number, d = 1) => new Q(n, d);
export interface State {
  cut: number;
  arm: number;
  count: number;
  view: "section" | "stack";
  reading: number;
}
export const counts = [1, 2, 4, 8, 16, 32, 64, 128] as const;
export const initial: State = { cut: 50, arm: 100, count: 8, view: "section", reading: 0 };
export function bounded(value: unknown, fallback: number, min: number, max: number) {
  return typeof value === "number" && Number.isInteger(value) && value >= min && value <= max
    ? value
    : fallback;
}
export function readState(params: URLSearchParams): State {
  const get = (name: string) =>
    params.has(name) && /^\d+$/.test(params.get(name) ?? "") ? Number(params.get(name)) : NaN;
  const count = get("n");
  return {
    cut: bounded(get("x"), initial.cut, 0, 200),
    arm: bounded(get("h"), initial.arm, 0, 300),
    count: counts.some((n) => n === count) ? count : initial.count,
    view: params.get("view") === "stack" ? "stack" : "section",
    reading: bounded(get("read"), 0, 0, 9),
  };
}
export function stateQuery(s: State) {
  return new URLSearchParams({
    x: String(s.cut),
    h: String(s.arm),
    n: String(s.count),
    view: s.view,
    read: String(s.reading),
  }).toString();
}
function direction(left: Q, right: Q) {
  const difference = left.minus(right);
  return {
    difference,
    direction:
      difference.n === 0n
        ? ("level" as const)
        : difference.n > 0n
          ? ("left" as const)
          : ("right" as const),
  };
}
export function section(cut: number, arm: number) {
  if (bounded(cut, -1, 0, 200) < 0 || bounded(arm, -1, 0, 300) < 0)
    throw new RangeError("Section controls are outside the workshop range.");
  const x = q(cut, 100),
    h = q(arm, 100);
  const sphere = x.times(q(2).minus(x)),
    cone = x.times(x),
    cylinder = q(4);
  const pair = sphere.plus(cone),
    left = pair.times(h),
    right = cylinder.times(x);
  return { x, h, sphere, cone, cylinder, pair, left, right, ...direction(left, right) };
}
export function stack(count: number, arm: number) {
  if (!counts.some((n) => n === count) || bounded(arm, -1, 0, 300) < 0)
    throw new RangeError("Choose one of the workshop's finite stacks.");
  const width = q(2, count),
    h = q(arm, 100);
  const slices = Array.from({ length: count }, (_, i) => {
    const x = q(2 * i + 1, count),
      sphereArea = x.times(q(2).minus(x)),
      coneArea = x.times(x);
    const low = q(2 * i, count),
      high = q(2 * i + 2, count);
    const atLow = low.times(q(2).minus(low)),
      atHigh = high.times(q(2).minus(high));
    const min = atLow.value < atHigh.value ? atLow : atHigh;
    const max =
      low.value <= 1 && high.value >= 1 ? q(1) : atLow.value > atHigh.value ? atLow : atHigh;
    return {
      x,
      sphereArea,
      coneArea,
      sphere: sphereArea.times(width),
      cone: coneArea.times(width),
      lower: min.times(width),
      upper: max.times(width),
    };
  });
  const sum = (field: "sphere" | "cone" | "lower" | "upper") =>
    slices.reduce((acc, s) => acc.plus(s[field]), q(0));
  const sphere = sum("sphere"),
    cone = sum("cone"),
    cylinder = q(8),
    exactSphere = q(4, 3),
    exactCone = q(8, 3);
  const left = sphere.plus(cone).times(h),
    right = q(8);
  return {
    count,
    width,
    slices,
    sphere,
    cone,
    cylinder,
    exactSphere,
    exactCone,
    sphereError: sphere.minus(exactSphere),
    coneError: cone.minus(exactCone),
    lower: sum("lower"),
    upper: sum("upper"),
    left,
    right,
    ...direction(left, right),
  };
}
export const decimal = (n: number, places = 3) =>
  Number(n.toFixed(places)).toLocaleString("en-US", { maximumFractionDigits: places });
