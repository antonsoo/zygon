import { initialParabola, parabolaModel } from "../src/parabola-model";

let cases = 0;
for (const width of ["1/2", "2", "7/3", "9"])
  for (const height of ["1/5", "1", "5/2"]) {
    for (let depth = 0; depth <= 7; depth++) {
      const state = {
        ...initialParabola,
        width,
        height,
        depth,
        cut: (cases * 7) % 101,
        arm: [0, 60, 100, 160][cases % 4] as number,
      };
      const m = parabolaModel(state);
      console.log(JSON.stringify({ state, mesh: true, ...m }));
      cases++;
    }
    for (const cut of [0, 1, 10, 25, 50, 75, 90, 99, 100])
      for (const arm of [0, 60, 100, 160, 200]) {
        const state = { ...initialParabola, width, height, cut, arm };
        const m = parabolaModel(state);
        const { layers: _layers, covers: _covers, ...values } = m;
        console.log(JSON.stringify({ state, mesh: false, ...values }));
        cases++;
      }
  }
