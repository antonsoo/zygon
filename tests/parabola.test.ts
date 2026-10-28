import assert from "node:assert/strict";
import { test } from "node:test";
import {
  initialParabola,
  parabolaJson,
  parabolaModel,
  parabolaProposalFraction,
  parabolaProposalWitness,
  parabolaQuery,
  readParabolaJson,
  readParabolaQuery,
} from "../src/parabola-model";

test("one arm balances all interior slices; both endpoints cannot select it", () => {
  for (const arm of [0, 60, 100, 160, 200])
    for (const cut of [0, 1, 25, 50, 75, 99, 100]) {
      const m = parabolaModel({ ...initialParabola, arm, cut });
      assert.equal(m.pointFits, arm === 100 || cut === 0 || cut === 100);
      assert.equal(m.universalFit, arm === 100);
      assert.equal(m.inconclusive, cut === 0 || cut === 100);
    }
});
test("strict finite bounds reject boundary equality and close guesses beyond the drawn mesh", () => {
  for (const [proposal, depth, status] of [
    ["5/4", 1, "too small"],
    ["7/5", 1, "too large"],
    ["1333333/1000000", 10, "not excluded at this layer"],
  ] as const) {
    const m = parabolaModel({ ...initialParabola, proposal, depth: Math.min(7, depth) });
    assert.equal(m.proposalWitness?.depth, depth);
    assert.equal(m.proposalStatus, status);
  }
  assert.equal(parabolaProposalWitness(parabolaProposalFraction("4/3")), null);
  assert.equal(
    parabolaModel({ ...initialParabola, proposal: "3/2", depth: 0 }).proposalStatus,
    "too large",
  );
  for (const proposal of ["0", "1/0", "3", "NaN", "100000000/75000000"])
    assert.throws(() => parabolaProposalFraction(proposal));
});
test("version 1 records retain their geometry and acquire only the original four-thirds proposal", () => {
  const { proposal: _proposal, ...old } = {
    ...initialParabola,
    width: "7/3",
    height: "5/2",
    depth: 4,
  };
  assert.deepEqual(
    readParabolaJson(JSON.stringify({ format: "zygon-parabola", version: 1, state: old })),
    { ...old, proposal: "4/3" },
  );
  assert.throws(() =>
    readParabolaJson(
      JSON.stringify({ format: "zygon-parabola", version: 1, state: { ...old, proposal: "7/5" } }),
    ),
  );
  assert.equal(readParabolaQuery("?width=7/3&depth=4").proposal, "4/3");
});
test("the added third is a finite algebraic correction, never an inscribed triangle", () => {
  for (let depth = 0; depth <= 7; depth++) {
    const m = parabolaModel({ ...initialParabola, depth });
    assert.equal(m.sum.plus(m.correction).toString(), "4/3");
    assert.ok(m.candidate.minus(m.sum).n > 0n);
    assert.ok(m.upper.minus(m.candidate).n > 0n);
    assert.equal(m.gap.over(m.first).toString(), `1/${2 * 4 ** depth}`);
    assert.equal(
      m.layers.reduce((count, l) => count + l.count, 0),
      2 ** (depth + 1) - 1,
    );
  }
  const m = parabolaModel({ ...initialParabola, depth: 1 });
  assert.equal(m.sum.toString(), "5/4");
  assert.equal(m.correction.toString(), "1/12");
  assert.equal(m.upper.toString(), "11/8");
});
test("records keep exact lengths and reject ambiguous fields before replacing an experiment", () => {
  const s = {
    ...initialParabola,
    width: "7/3",
    height: "5/2",
    view: "fill" as const,
    depth: 7,
    page: 15,
  };
  assert.deepEqual(readParabolaJson(parabolaJson(s)), s);
  assert.deepEqual(readParabolaQuery(parabolaQuery(s)), s);
  for (const search of ["?cut=NaN", "?cut=50&cut=60", "?unknown=1", "?width=1/0", "?depth=8"])
    assert.throws(() => readParabolaQuery(search));
  assert.throws(() =>
    readParabolaJson(parabolaJson(s).replace('"cut": 50', '"cut": 0,"c\\u0075t": 50')),
  );
  assert.throws(() =>
    readParabolaJson(
      JSON.stringify({ format: "zygon-parabola", version: 1, state: { ...s, pointFits: true } }),
    ),
  );
});
