"""Independent finite-witness audit; grow the lower polygon by successive layers.

Reads actual TypeScript witness accounts from stdin. Equality at either strict
bound rejects the proposal. The final account can exceed the actual drawn mesh.
"""
from fractions import Fraction as F
import json,sys
cases=deepest=0
for line in sys.stdin:
 r=json.loads(line); first,ratio=F(r['first']),F(r['proposal']); area=first*ratio
 lower,last=first,first; expected=None
 for depth in range(33):
  upper=lower+last/2
  if area<=lower or area>=upper:
   expected=dict(depth=depth,lower=lower,upper=upper,last=last,triangles=str(2**(depth+1)-1));break
  last/=4;lower+=last
 if ratio==F(4,3):assert r['witness'] is None and expected is None
 else:
  assert expected is not None
  got=r['witness'];assert got['depth']==expected['depth'] and got['triangles']==expected['triangles']
  for k in ['lower','upper','last']:assert F(got[k])==expected[k]
  assert (area<F(4,3)*first)==(area<=expected['lower'])
  deepest=max(deepest,expected['depth'])
 cases+=1
print(json.dumps(dict(cases=cases,deepestFiniteWitness=deepest,scope='Independent Fraction recurrence checks minimal rejecting depth, exact bounds, strict-bound equality and conceptual triangle count for actual production witness accounts; no polygons beyond depth 7 are claimed drawn.'),indent=2))
