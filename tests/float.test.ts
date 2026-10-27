import assert from "node:assert/strict";
import { test } from "node:test";
import {
  FLOAT_DEFAULT,
  floatModel,
  floatQuery,
  floatRecord,
  importFloat,
  readFloat,
} from "../src/float-model";

test("equal vertical forces do not guarantee a restoring turn", () => {
  const m = floatModel(FLOAT_DEFAULT);
  assert.equal(m.stable, "unstable");
  assert.equal(m.turning, "right");
  assert.ok(Math.abs((m.submerged ?? 0) / m.volume - 0.16) < 1e-14);
  assert.equal(floatModel({ ...FLOAT_DEFAULT, angle: 0 }).turning, "balanced");
});
test("the separate dry-base equilibrium responds toward itself on both sides", () => {
  const m = floatModel(FLOAT_DEFAULT);
  assert.ok(m.obliqueAngle !== null && m.obliqueDry);
  assert.ok(Math.abs(Math.tan((m.obliqueAngle * Math.PI) / 180) ** 2 - 0.4) < 1e-14);
  assert.equal(floatModel({ ...FLOAT_DEFAULT, angle: m.obliqueAngle }).turning, "balanced");
  assert.equal(floatModel({ ...FLOAT_DEFAULT, angle: m.obliqueAngle - 1 }).turning, "right");
  assert.equal(floatModel({ ...FLOAT_DEFAULT, angle: m.obliqueAngle + 1 }).turning, "left");
});
test("critical means zero linear stiffness, not neutral at all angles", () => {
  const m = floatModel({ ...FLOAT_DEFAULT, density: 25 });
  assert.equal(m.stable, "critical");
  assert.equal(m.obliqueAngle, null);
  assert.equal(m.turning, "left");
  assert.equal(floatModel({ ...FLOAT_DEFAULT, density: 25, angle: -10 }).turning, "right");
});
test("base contact and its continuation withhold water volume and force claims", () => {
  const contact = floatModel(FLOAT_DEFAULT).contactAngle;
  for (const angle of [contact, contact + 0.01, 60]) {
    const m = floatModel({ ...FLOAT_DEFAULT, angle });
    assert.equal(m.dry, false);
    assert.equal(m.B, null);
    assert.equal(m.submerged, null);
    assert.equal(m.lever, null);
    assert.equal(m.turning, "outside");
  }
  assert.equal(floatModel({ ...FLOAT_DEFAULT, angle: contact - 0.01 }).dry, true);
});
test("reflected trials reverse the world lever, not the density or volume", () => {
  const a = floatModel(FLOAT_DEFAULT),
    b = floatModel({ ...FLOAT_DEFAULT, angle: -10 });
  assert.equal(a.volume, b.volume);
  assert.equal(a.submerged, b.submerged);
  assert.ok(Math.abs((a.lever ?? 0) + (b.lever ?? 0)) < 1e-14);
  assert.equal(b.turning, "left");
});
test("an oblique candidate beyond the base condition is not certified", () => {
  const m = floatModel({ ...FLOAT_DEFAULT, height: 2.5, density: 25 });
  assert.ok(m.obliqueAngle !== null);
  assert.equal(m.obliqueDry, false);
});
test("shared and editable states retain a computed angle and a selected reading", () => {
  const s = { ...FLOAT_DEFAULT, angle: floatModel(FLOAT_DEFAULT).obliqueAngle ?? 0, reading: 5 };
  assert.deepEqual(readFloat(floatQuery(s)), { state: s, invalid: false });
  assert.deepEqual(importFloat(floatRecord(s)), s);
});
test("ambiguous, nonfinite and blank addresses do not partially apply", () => {
  for (const q of [
    "tilt=1&tilt=2",
    "density=NaN",
    "a=Infinity",
    "tilt=61",
    "reading=6",
    "a=",
    "other=1",
  ]) {
    assert.deepEqual(readFloat(q), { state: FLOAT_DEFAULT, invalid: true });
  }
});
test("a malformed import preserves the caller's current state", () => {
  for (const record of [
    "{}",
    "[]",
    "null",
    floatRecord({ ...FLOAT_DEFAULT, height: 99 }),
    floatRecord(FLOAT_DEFAULT).replace('"version": 1', '"version": 2'),
    floatRecord(FLOAT_DEFAULT).replace('"reading": 0', '"reading": "0"'),
  ]) {
    assert.throws(() => importFloat(record));
  }
});
