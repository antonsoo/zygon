"""Check exported coefficients using Fraction and independent closed forms."""
from fractions import Fraction as F
import json
import sys
from datetime import datetime, timezone

cases = checks = 0
for line in sys.stdin:
    r = json.loads(line)
    arm = F(r['arm'], 100)
    if r['kind'] == 'section':
        x = F(r['cut'], 100)
        # Derive the sphere's section from its centre, not x(2-x).
        sphere = 1 - (x - 1) ** 2
        cone = x ** 2
        expected = dict(sphere=sphere, cone=cone, cylinder=F(4), left=(sphere+cone)*arm,
                        right=4*x, difference=(sphere+cone)*arm-4*x)
    else:
        n = r['count']
        error = F(2, 3*n*n)
        expected = dict(sphere=F(4,3)+error, cone=F(8,3)-error, cylinder=F(8),
                        left=4*arm, right=F(8), difference=4*arm-8,
                        sphereError=error, coneError=-error,
                        lower=F(0) if n == 1 else F(4,3)-F(2,n)-F(4,3*n*n),
                        upper=F(2) if n == 1 else F(4,3)+F(2,n)-F(4,3*n*n))
        assert expected['lower'] <= F(4,3) <= expected['upper']
        checks += 1
    for key, value in expected.items():
        assert F(r[key]) == value, (r, key, str(value))
        checks += 1
    cases += 1
assert cases == 62909
print(json.dumps({'checkedAt':datetime.now(timezone.utc).isoformat(),'cases':cases,'exactChecks':checks,
                  'scope':'Every section/arm integer control pair and every supported finite stack/arm pair; independent Fraction closed forms, including upper and lower cylinder bounds.'},indent=2))
