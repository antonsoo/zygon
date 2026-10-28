import { Q } from "../src/model";
import { parabolaProposalFraction, parabolaProposalWitness } from "../src/parabola-model";

for (const first of [new Q(1), new Q(35, 12), new Q(72)])
  for (const denominator of [3, 4, 5, 7, 10, 100, 1000, 1000000, 10000000, 74999998, 74999999])
    for (let offset = -2; offset <= 2; offset++) {
      const numerator = Math.floor((4 * denominator) / 3) + offset;
      if (numerator < denominator || numerator > 2 * denominator || numerator > 99999999) continue;
      const proposal = parabolaProposalFraction(`${numerator}/${denominator}`);
      console.log(
        JSON.stringify({ first, proposal, witness: parabolaProposalWitness(proposal, first) }),
      );
    }
