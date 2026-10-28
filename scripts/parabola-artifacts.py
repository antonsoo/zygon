"""Independently audit actual native CSV and SVG downloads, using Fraction/shoelace.

Pass the directory containing experiment.json, account.csv, drawing.svg.
The rounded SVG coordinates are assessed with a geometric tolerance; CSV is exact.
"""
from fractions import Fraction as F
from pathlib import Path
import csv, hashlib, json, math, sys, xml.etree.ElementTree as ET

root = Path(sys.argv[1])
s = json.loads((root / 'experiment.json').read_text())['state']
rows = list(csv.reader((root / 'account.csv').open()))
assert rows[0] == ['quantity', 'exact_value', 'unit_or_meaning']
assert len(set(r[0] for r in rows[1:])) == len(rows) - 1
actual = {r[0]: r[1] for r in rows[1:]}
w, h, u, arm = F(s['width']), F(s['height']), F(s['cut'],100), F(s['arm'],100)
A = w*h/2
layers = [A/4**i for i in range(s['depth']+1)]
lower, last = sum(layers), layers[-1]
expected = dict(base=w,height=h,cut_fraction=u,left_arm_fraction=arm,
 parabola_slice=4*h*u*(1-u),auxiliary_triangle_slice=4*h*(1-u),
 left_moment=4*h*u*(1-u)*w*arm,right_moment=4*h*(1-u)*w*u,
 moment_difference=4*h*u*(1-u)*w*(arm-1),first_triangle=A,
 inscribed_sum=lower,tangent_upper_bound=lower+last/2,last_layer_third=last/3,
 four_thirds_first=4*A/3,bound_gap=last/2)
expected.update({f'layer_{i}_area': a for i,a in enumerate(layers)})
assert set(actual) == set(expected)|{'all_interior_cuts_fit'}
for key,value in expected.items(): assert F(actual[key]) == value, key
assert actual['all_interior_cuts_fit'] == str(arm==1).lower()
svg = ET.parse(root/'drawing.svg').getroot()
ns={'s':'http://www.w3.org/2000/svg'}
triangles = svg.findall('.//s:polygon[@data-pa-layer]',ns)
covers = svg.findall('.//s:polygon[@data-pa-cover]',ns)
assert s['view'] == 'fill', 'Audit expects a downloaded fill experiment.'
assert len(triangles)==2**(s['depth']+1)-1 and len(covers)==2**(s['depth']+1)
scale=min(840/float(w),360/float(h))
def area(p):
 vertices=[tuple(map(float,xy.split(','))) for xy in p.get('points').split()]
 return abs(sum(a[0]*b[1]-a[1]*b[0] for a,b in zip(vertices,vertices[1:]+vertices[:1])))/2/scale**2
for i,a in enumerate(layers):
 measured=sum(area(p) for p in triangles if int(p.get('data-pa-layer'))==i)
 assert math.isclose(measured,float(a),abs_tol=1e-5), (i,measured,a)
assert math.isclose(sum(area(p) for p in covers),float(last/2),abs_tol=1e-5)
assert len(svg.findall('.//s:clipPath',ns))==1
assert not svg.findall('.//s:pattern',ns), 'Retain vector hatching in browser PDFs.'
print(json.dumps(dict(scope='Actual native downloads; independent exact Fraction CSV and rounded SVG shoelace areas, not generated expectations.',csvQuantities=len(actual),inscribedPolygons=len(triangles),tangentCovers=len(covers),lower=str(lower),upper=str(lower+last/2),sha256={f:hashlib.sha256((root/f).read_bytes()).hexdigest() for f in ['experiment.json','account.csv','drawing.svg']}),indent=2))
