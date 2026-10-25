import assert from "node:assert/strict";
import { test } from "node:test";
import { initial, Q, readState, section, stack, stateQuery } from "../src/model";

test("the same arm balances unequal sections without changing their areas", () => {
  const before = section(50, 100),
    after = section(50, 200);
  assert.equal(String(before.sphere), "3/4");
  assert.equal(String(before.cone), "1/4");
  assert.equal(String(before.left), "1");
  assert.equal(String(before.right), "2");
  assert.equal(before.direction, "right");
  assert.equal(after.sphere.toString(), before.sphere.toString());
  assert.equal(after.direction, "level");
  assert.equal(section(175, 200).direction, "level");
});
test("the zero cut does not identify a unique arm", () => {
  for (const arm of [0, 100, 200, 300]) {
    const v = section(0, arm);
    assert.equal(String(v.left), "0");
    assert.equal(String(v.right), "0");
  }
  assert.equal(section(1, 199).direction, "right");
  assert.equal(section(1, 201).direction, "left");
});
test("balanced finite stacks preserve nonzero opposing volume errors", () => {
  const one = stack(1, 200),
    eight = stack(8, 200);
  assert.equal(String(one.sphere), "2");
  assert.equal(String(one.cone), "2");
  assert.equal(String(eight.sphere), "43/32");
  assert.equal(String(eight.cone), "85/32");
  assert.equal(String(eight.sphereError), "1/96");
  assert.equal(String(eight.coneError), "-1/96");
  assert.equal(String(eight.difference), "0");
  assert.equal(String(eight.lower), "17/16");
  assert.equal(String(eight.upper), "25/16");
});
test("shared experiments survive round trips and malformed values fall back", () => {
  const s = { cut: 199, arm: 203, count: 128, view: "stack" as const, reading: 9 };
  assert.deepEqual(readState(new URLSearchParams(stateQuery(s))), s);
  assert.deepEqual(
    readState(new URLSearchParams("x=NaN&h=-1&n=999999&read=100&view=%3Cscript%3E")),
    initial,
  );
  assert.deepEqual(readState(new URLSearchParams("x=0&h=0&n=1&read=0")), {
    ...initial,
    cut: 0,
    arm: 0,
    count: 1,
  });
});
test("invalid exact ratios and unsupported stack controls are rejected", () => {
  assert.throws(() => new Q(1, 0), RangeError);
  assert.throws(() => section(1.1, 200), RangeError);
  assert.throws(() => stack(3, 200), RangeError);
  assert.equal(String(new Q(2, -4)), "-1/2");
});
