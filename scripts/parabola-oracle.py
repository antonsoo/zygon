"""Independent exact polygon, polynomial-integral and tangent-cover audit.

Input: actual production model JSONL, including every drawn triangle vertex.
No imports from the TypeScript implementation; Python standard library only.
"""
from fractions import Fraction as F
import json
import sys


def area(points):
    points=[(F(p['x']),F(p['y'])) for p in points]
    return abs(sum(a[0]*b[1]-b[0]*a[1] for a,b in zip(points,points[1:]+points[:1])))/2


cases=polygons=cuts=0
for line in sys.stdin:
    r=json.loads(line);s=r['state'];w,h=F(s['width']),F(s['height'])
    # Integrate y = h - 4h x^2/w^2 over [-w/2,+w/2], independently
    # of the production u-coordinate layer construction.
    primitive=lambda x:h*x-F(4)*h*x**3/(3*w*w)
    exact=primitive(w/2)-primitive(-w/2)
    x=w*(F(s['cut'],100)-F(1,2))
    y=h-F(4)*h*x*x/(w*w)
    tangent=2*h-F(4)*h*x/w
    assert F(r['candidate'])==exact
    assert F(r['slice'])==y and F(r['triangleSlice'])==tangent
    # Actual moments about K from independent horizontal positions.
    left=y*w*F(s['arm'],100);right=tangent*(x+w/2)
    assert F(r['left'])==left and F(r['right'])==right
    assert r['pointFits']==(left==right)
    assert r['universalFit']==(s['arm']==100)
    assert r['inconclusive']==(x in [-w/2,w/2])
    assert F(r['sum']) < exact < F(r['upper'])
    assert F(r['sum'])+F(r['correction'])==exact
    if r['mesh']:
        total=F(0)
        for layer in r['layers']:
            measured=sum(area(t) for t in layer['triangles'])
            assert measured==F(layer['area'])
            assert all(area(t)==F(layer['each']) for t in layer['triangles'])
            total+=measured;polygons+=len(layer['triangles'])
        assert total==F(r['sum'])
        cover=sum(area(t) for t in r['covers'])
        assert total+cover==F(r['upper'])
        polygons+=len(r['covers'])
        # Each outer apex is the intersection of the two endpoint tangents;
        # its two rays lie above the concave quadratic throughout the interval.
        for triangle in r['covers']:
            a,m,b=[(F(p['x']),F(p['y'])) for p in triangle]
            for end in [a,b]:
                slope=-8*h*end[0]/(w*w)
                assert m[1]==end[1]+slope*(m[0]-end[0])
            for i in range(1,8):
                t=F(i,8);xx=a[0]+t*(b[0]-a[0])
                chord=a[1]+t*(b[1]-a[1]);curve=h-4*h*xx*xx/(w*w)
                end=a if t<=F(1,2) else b
                roof=end[1]-8*h*end[0]*(xx-end[0])/(w*w)
                assert chord < curve < roof
                cuts+=1
    cases+=1
assert cases==636
print(json.dumps({'cases':cases,'drawnPolygonsMeasuredByShoelace':polygons,
                  'tangentCoverInteriorChecks':cuts,'exactPolynomialIntegral':True,
                  'allMomentAndFiniteCorrectionIdentities':True,
                  'oracle':'Independent Fraction coordinates, shoelace areas, endpoint tangents and polynomial primitive'},indent=2))
