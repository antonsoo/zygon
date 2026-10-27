import { type FloatState, floatModel } from "../src/float-model";

const cases: unknown[] = [];
for (const height of [0.5, 0.75, 1, 1.5, 1.875, 2.5]) {
  for (const density of [4, 16, 25, 49, 64, 90]) {
    for (const angle of [-60, -35, -10, 0, 10, 35, 60]) {
      const state: FloatState = { height, density, angle, reading: 0 };
      const { point, ...model } = floatModel(state);
      void point;
      cases.push({ state, model });
    }
  }
}
console.log(JSON.stringify(cases));
