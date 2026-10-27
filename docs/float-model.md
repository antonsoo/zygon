# A solid can float and still turn

This room connects Archimedes' _On Floating Bodies_ II.2 and II.4 with a modern
static model. The learner decides which way a small tilt will turn, finds a
separate oblique equilibrium, changes density while keeping the same shape,
and discovers the limit imposed by the source's dry-base condition.

## The actual question

Equal weight and buoyancy establish vertical force balance. A turning couple
remains when their parallel lines of action differ. Coincident lines establish
an equilibrium orientation; how nearby orientations respond determines stability.
A diagram of equal arrows alone cannot distinguish those claims.

The opening settings use axis length `a = 1.5`, relative density `sigma = 0.16`
and a rightward tilt of 10 degrees. Upright is balanced but unstable. The separate
dry-base equilibrium is approximately 32.3115332 degrees. The choice of scale,
shape settings, labels G/B, arrows and modern coordinates belongs to this workshop.
It is not a reconstruction of an ancient instrument or a floating ship.

## Coordinates and volume

Fix the paraboloid `x*x + y*y = z` and cut it at `z = a`. The solid includes
`x*x + y*y <= z <= a`. All lengths use one arbitrary unit; no metre value is
assigned. The physical body is three-dimensional. The displayed profile is its
axial section, with equal horizontal and vertical scales.

A horizontal disk has area `pi*z`. Integration gives total volume `pi*a*a/2`
and centre of gravity `G = (0,0,2*a/3)` for a uniform solid. If the liquid has
unit density and the solid relative density `sigma`, vertical force balance
requires displaced volume `sigma*pi*a*a/2`.

Let theta be the clockwise tilt of the axis from vertical. Transform body points
into the world by:

```text
X = x*cos(theta) + z*sin(theta)
Z = -x*sin(theta) + z*cos(theta)
```

A horizontal world waterline is `z = b*x + c` in body coordinates, where
`b = tan(theta)`. Completing the square in the vertical thickness of the cap:

```text
b*x + c - x*x - y*y = d - (x-b/2)^2 - y^2
where d = c + b*b/4.
```

Integrating that thickness over the circle of radius sqrt(d) gives cap volume
`pi*d*d/2`. Consequently `d = a*sqrt(sigma)` and `c = d - b*b/4`.

## Where the displaced-volume centre moves

The cap's projection is symmetric about `x = b/2`, hence `B_x = b/2` in body
coordinates. Integrating the vertical first moment gives
`B_z = 2*d/3 + b*b/4`. This is the centre of the displaced three-dimensional
volume, not the centroid of the coloured two-dimensional profile.

Rotating G and B into the world gives the horizontal lever:

```text
L = X_B - X_G
  = sin(theta) * [1/2 - 2*(a-d)/3 + tan(theta)^2/4].
```

Weight acts downward through G and equal buoyancy upward through B. Positive L
turns the solid left, reducing a rightward tilt; negative L turns it right. The
plot uses `-L`, turning tendency per unit weight, with positive meaning right.
Its numerical vertical scale is fitted to the displayed trial and labeled.
The force-line microscope enlarges horizontal differences separately; its
height has no geometric meaning. Force-arrow lengths are schematic and equal,
not a claim about absolute weight or acceleration.

## Upright, critical and oblique

At theta zero, L is zero for every supported shape and density. The linear
coefficient `K = 1/2 - 2*(a-d)/3` distinguishes the nearby response. Positive K
restores upright; negative K drives away. At K zero, finite nonzero dry-base
tilts still restore through the tan-squared term. This critical case has zero
linear stiffness; it is not neutral at every angle.

For `a <= 3/4`, K is positive for every supported positive density. This is the
shape guarantee of II.2 in our coordinates. The source's "line up to the axis"
is 1/2 in `z=x*x`, so one and a half times it is 3/4. This parameter must not be
copied into a different parabola equation without translating conventions.

For a taller solid, K is nonnegative when
`sigma >= ((a - 3/4)/a)^2`. II.4 states the inclusive density bound geometrically.
The user can set the critical density directly if it is within the interface's
4–90% range. Below the bound the analytic equation supplies nonzero candidates:

```text
tan(theta)^2 = (8/3)*(a-d) - 2.
```

A candidate is exposed as a usable equilibrium only if its whole displaced cap
also meets the dry-base condition. On either side of a permitted positive
candidate the turning sign points back toward it. The reflected negative
candidate has the reflected response. This is a static, local stability
statement, not a timed trajectory or an assertion that a real object settles.

## The base condition is part of the model

The full candidate cap reaches highest at
`z = (abs(b)/2 + sqrt(d))^2`. It fits below the flat base only when that value
is strictly less than a. The first contact angle is
`atan(2*(sqrt(a) - sqrt(d)))`. Touching is explicitly the boundary, rather than
a successful dry-base case. A 1e-10 comparison tolerance handles floating-point
roundoff at contact; it is not a measured clearance.

At contact and beyond, the code returns null for displaced volume, B and lever,
and reports no turning direction. The overview can still draw the rejected
candidate water plane, marked as such. It does not claim that plane balances
the truncated physical body. The plot leaves the excluded interval empty and
shaded, and CSV leaves its force/volume cells empty. No convenient cap formula
is continued into a cut-off cap or a detached cap above the solid.

## Printed and manuscript witnesses

Greek excerpts follow the released Netz–Wilson per-folio TEI files for Arch07v,
Arch08r and Arch08v. [The source manifest](../public/sources/float-sources.json)
identifies the three complete processed frames, original TIFF checksums,
reduction parameters, creators, and four Latin printed pages.

`scripts/extract-floating.py` joins split words, selects expanded abbreviations,
omits marginal numerals, and retains supplied/uncertain/expanded/sic flags.
The six selections cover II.2's shape condition, density/scope phrase,
conclusion, definition of upright and proof ending, plus II.4's whole statement.
The 37 mapped lines reuse the project's published coordinates. The full
original XMLs and image metadata remain downloadable from the saved study.

The Latin is the body text printed in Heiberg's _Archimedis Opera omnia_ II
(1881), pp. 376–377 and 379–380, including its medieval transmission problems:

| Location        | Retained evidence                                                                                  | Reader behavior                                                            |
| --------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| II.2 conclusion | Sentence crosses pp. 376–377                                                                       | Join the line-break word _in-clinata_; retain both pages                   |
| II.2 proof      | Latin breaks after the tangent construction; p. 377 footnote records the omission                  | Show the Greek ending separately; do not invent a Latin continuation       |
| II.4 statement  | Body text omits the denominator after _axis_; p. 380 footnote supplies _ad tetragonum quod ab axe_ | Retain the incomplete Latin body text and explain the supplied denominator |
| Greek II.4      | Numerous supplied letters and uncertain readings                                                   | Preserve the editorial flags and show the corresponding complete frame     |

New English and contextual word notes are teaching aids, without independent
philological review. The full treatise is not translated here. No fresh
manuscript decipherment or correction to an edition is asserted.

## Independent checks and limits

`scripts/float-oracle.py` slices the actual truncated solid into horizontal
circular disks. It integrates the liquid-side circular segment's area and two
first moments with adaptive Simpson quadrature. It does not insert the
application's cap-centre formulas. The comparison includes positive and negative
tilts and withholds claims outside the supported case.

The retained [numeric receipt](float-model-review.json) gives case counts,
maximum observed error and tolerance. It is a numerical cross-check of an
analytic static model; it does not verify physical material behaviour or
Archimedes' geometrical proof. The same formulas are also compatible with the
modern treatment in Kurt Girstmair and Gerhard Kirchner, [*Towards a Completion
of Archimedes' Treatise on Floating Bodies* (2007), section 1](https://arxiv.org/abs/0706.0119).
The workshop does not implement that paper's base-crossing extension.

Surface tension, waves, walls, viscosity, damping, angular acceleration,
nonuniform density, hollow hulls, manufactured specimens, and printer behaviour
are outside the model. Script-free print is an untagged browser PDF, not a
professionally typeset or accessibility-tagged edition.
