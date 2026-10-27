"""Independent volume integration, not a re-evaluation of the cap formula.

Cut the actual truncated solid into horizontal circular disks. In each disk,
use the circular segment on the liquid side of its water-plane intersection.
Integrate area, x moment and z moment with adaptive Simpson quadrature.
"""
import json
import math
import sys
from datetime import datetime, timezone


def integrate(f, left, right, tolerance=2e-9):
    mid=(left+right)/2
    a,b,c=f(left),f(mid),f(right)
    whole=[(right-left)*(x+4*y+z)/6 for x,y,z in zip(a,b,c)]
    def refine(l,r,fl,fm,fr,coarse,tol,depth):
        m=(l+r)/2
        lm,rm=f((l+m)/2),f((m+r)/2)
        il=[(m-l)*(x+4*y+z)/6 for x,y,z in zip(fl,lm,fm)]
        ir=[(r-m)*(x+4*y+z)/6 for x,y,z in zip(fm,rm,fr)]
        fine=[x+y for x,y in zip(il,ir)]
        if depth==0 or max(abs(x-y) for x,y in zip(fine,coarse))<15*tol:
            return [x+(x-y)/15 for x,y in zip(fine,coarse)]
        return [x+y for x,y in zip(refine(l,m,fl,lm,fm,il,tol/2,depth-1),refine(m,r,fm,rm,fr,ir,tol/2,depth-1))]
    return refine(left,right,a,b,c,whole,tolerance,24)


def submerged(a, b, c):
    def disk(z):
        if z<=0:return [0.,0.,0.]
        radius=math.sqrt(z)
        if abs(b)<1e-14:
            area=math.pi*z if z<c else 0.
            return [area,0.,z*area]
        cut=(z-c)/abs(b)
        if cut>=radius:return [0.,0.,0.]
        if cut<=-radius:return [math.pi*z,0.,math.pi*z*z]
        chord2=max(0,z-cut*cut)
        area=z*math.acos(cut/radius)-cut*math.sqrt(chord2)
        moment=math.copysign(2*chord2**1.5/3,b)
        return [area,moment,z*area]
    # Break at changes between full, partial and empty disks. These roots
    # locate integration boundaries only; centres still come from quadrature.
    cuts=[0.,a]
    if abs(b)>1e-14:
        disc=b*b+4*c
        if disc>=0:
            for x in [(b+math.sqrt(disc))/2,(b-math.sqrt(disc))/2]:
                if 0<x*x<a:cuts.append(x*x)
    elif 0<c<a:cuts.append(c)
    total=[0.,0.,0.]
    cuts=sorted(set(cuts))
    # Values at an isolated upright waterline do not affect an integral;
    # integrate the submerged interval directly to avoid a step endpoint.
    if abs(b)<1e-14:
        return [math.pi*min(a,max(0,c))**2/2,0.,math.pi*min(a,max(0,c))**3/3]
    for left,right in zip(cuts,cuts[1:]):
        total=[x+y for x,y in zip(total,integrate(disk,left,right))]
    return total


cases=json.load(sys.stdin)
maximum=0.
valid=0
outside=0
for case in cases:
    s,m=case['state'],case['model']
    a=s['height'];angle=math.radians(s['angle']);b=math.tan(angle)
    # Independently integrate the candidate waterline through the actual solid.
    volume,mx,mz=submerged(a,b,m['c'])
    expected_volume=s['density']/100*math.pi*a*a/2
    assert abs(m['volume']-math.pi*a*a/2)<1e-12
    if not m['dry']:
        assert m['submerged'] is None and m['B'] is None and m['lever'] is None
        assert m['turning']=='outside'
        outside+=1
        continue
    valid+=1
    assert abs(volume-expected_volume)<3e-7,(s,volume,expected_volume)
    assert abs(volume-m['submerged'])<3e-7
    bx,bz=mx/volume,mz/volume
    world_bx=bx*math.cos(angle)+bz*math.sin(angle)
    world_bz=-bx*math.sin(angle)+bz*math.cos(angle)
    for actual,expected in [(world_bx,m['B']['x']),(world_bz,m['B']['z']),(world_bx-m['G']['x'],m['lever'])]:
        error=abs(actual-expected);maximum=max(maximum,error)
        assert error<8e-7,(s,actual,expected)
    if a<=.75:assert m['stable']=='stable'
    if abs(s['angle'])<1e-12:assert abs(m['lever'])<1e-12
    if s['angle']>0 and m['stable']!='unstable':assert m['turning']=='left'
print(json.dumps(dict(checkedAt=datetime.now(timezone.utc).isoformat(),cases=len(cases),
    integratedDryCases=valid,withheldContactOrOutsideCases=outside,maximumCentroidOrLeverError=maximum,
    tolerance=8e-7,method='Independent circular-disk segment integration with adaptive Simpson quadrature; volume and two first moments of the actual truncated solid.',
    scope='Numerical cross-check of static analytic geometry, not physical flotation or historical proof.'),indent=2))
