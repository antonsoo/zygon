import { counts, section, stack } from "../src/model";

for (let cut = 0; cut <= 200; cut++)
  for (let arm = 0; arm <= 300; arm++) {
    const v = section(cut, arm);
    console.log(
      JSON.stringify({
        kind: "section",
        cut,
        arm,
        sphere: v.sphere,
        cone: v.cone,
        cylinder: v.cylinder,
        left: v.left,
        right: v.right,
        difference: v.difference,
      }),
    );
  }
for (const count of counts)
  for (let arm = 0; arm <= 300; arm++) {
    const v = stack(count, arm);
    console.log(
      JSON.stringify({
        kind: "stack",
        count,
        arm,
        sphere: v.sphere,
        cone: v.cone,
        cylinder: v.cylinder,
        left: v.left,
        right: v.right,
        difference: v.difference,
        lower: v.lower,
        upper: v.upper,
        sphereError: v.sphereError,
        coneError: v.coneError,
      }),
    );
  }
