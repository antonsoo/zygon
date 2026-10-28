# A third more: the parabola, the balance and a finite remainder

This companion to the sphere and floating-body workshops connects **Method I**
with **Quadrature of the Parabola XXI-XXIV**. The working route is
`parabola.html#pa-bench`. [Operation and separate evidence boundaries](parabola-review.md)
describe the browser, source, export and publication reviews.

The learner finds one transferred arm for every interior cut, then sees why a
finite polygon remains smaller than the curved segment. The word **epitritos**
means one-third greater: 4/3 of the given triangle, whose inverse comparison is
3/4. It does not mean that the segment is three-quarters of that triangle.

## Coordinates and the mechanical discovery

Let the chord have width w and the parabolic segment height h. Parameter u
runs from 0 at A to 1 at Gamma. We draw

    x = w (u - 1/2)
    y = 4 h u (1-u).

A = (-w/2,0), B = (0,h), Gamma = (w/2,0). The tangent at Gamma meets the
vertical through A at Z = (-w/2,4h). B-Gamma extended meets A-Z at
K = (-w/2,2h). The source's fixed transferred point Theta is on Gamma-K
extended, with K-Theta = K-Gamma. Our horizontal balance is a separate modern
working diagram. Its projected arm ratios agree with the source's slanted bar;
we do not claim to reconstruct a physical ancient device.

At the chosen vertical cut, the segment length is 4 h u(1-u); the large
triangle's segment length is 4 h(1-u). Its horizontal arm from K is w u.
At a trial left arm w lambda the moments, after suppressing common strip
thickness and area density, are

    left  = 4 h u(1-u) w lambda
    right = 4 h (1-u) w u.

For any interior u, equality requires lambda = 1. The identity then holds
for every cut, rather than for a sampled grid. Both endpoint cuts have zero
moments for every arm and cannot choose lambda. The selected-cut comparison
must remain distinct from the universal identity.

The large triangle has area 2 w h and its centroid has horizontal arm w/3.
The mechanical comparison suggests a segment area of (2/3) w h, or 4/3 of
the first inscribed triangle, whose area is w h/2. The source explicitly says
the preceding argument has not proved the conclusion. The app must keep that
qualification with the result; neither counting sampled cuts nor adding a
finite set of strips is a proof about the full area.

## Inscribed triangles and finite bounds

For any parameter interval [a,b], take the curve endpoints and the curve point
at (a+b)/2. Its triangle has area (w h/2)(b-a)^3. Each next triangle is one-eighth
of its parent, while there are twice as many: each complete layer is one-quarter
of the preceding layer. For displayed depth n, layers 0 through n have

    A = w h/2
    L_n = A / 4^n
    S_n = A (1 + 1/4 + ... + 1/4^n).
    S_n + L_n/3 = 4 A/3.

The final identity is finite. The correction is a third of the entire last
layer, not one of its little triangles or another inscribed layer. No finite
S_n equals the candidate. The statement from Quadrature XXIII has normalized
Greek, Heiberg's Latin and new English beside the exact account.

For each remaining interval the endpoint tangents meet above its midpoint.
The triangle they bound with the chord has twice the area of the next inscribed
triangle and strictly contains the corresponding curved remainder. These give
an explicit modern outer cover, separate from Archimedes' printed proof:

    S_n < curved area < U_n = S_n + L_n/2.
    U_n - S_n = A / (2 * 4^n).

The candidate 4A/3 stays strictly between the bounds. The gap can be made
smaller than any positive prescribed area by further finite subdivision;
this is an exhaustion argument, not a decimal agreement or an infinite sum
asserted from a slider. The interface illustrates finitely many levels. It
must identify the geometric argument for the continuing bounds separately.

## A proposed area can fail a finite test

The learner can propose an exact ratio p/q between 1 and 2 times the first
triangle. At layer n, a proposed area G is excluded if G <= S_n or G >= U_n.
Equality with either bound is excluded because the curved area lies strictly
between them. A value inside the interval has survived this finite test; it has
not been proved equal to the curved area.

For A = 1, 5/4 is rejected at layer 1 by equality with its lower bound. The
proposal 7/5 exceeds that layer's 11/8 upper bound. A closer proposal,
1333333/1000000, survives all seven displayed refinements but is excluded by
layer 10: its lower bound 1398101/1048576 already exceeds the proposal.
That account has 2,047 inscribed triangles. It is computed exactly without
claiming to draw them; the geometry remains capped at layer 7.

The witness search computes finite rational accounts without allocating their
meshes. Each fraction part accepts at most eight digits. If p/q differs from
4/3, their distance is at least 1/(3q); the lower-bound distance at depth 14 is
1/(3*4^14), already smaller than this for every admitted denominator. Thus a
wrong admitted ratio has a finite witness by layer 14. The implementation's
32-step safety limit is finite; it does not approximate an infinite search.
The four-thirds ratio has no rejecting layer. The shrinking-gap argument
remains necessary for equality.

Version 2 JSON stores the proposed ratio. Version 1's nine geometry/reader
fields migrate with proposal 4/3, the original fixed comparison. Unknown or
repeated keys remain rejected, including an unexpected proposal in a version 1
record. Old query links acquire the same default. The original native v1 file
is retained as `examples/parabola/experiment-v1.json`.

The independent proposal audit checks 153 actual witness accounts, including
eight-digit ratios requiring layer 14. Python Fraction grows the inscribed
sum by successive quarter layers and verifies the first rejecting layer,
both exact bounds and the conceptual triangle count. This is separate from
the 636-case polygon/section audit.

## Source boundaries

- Method: complete scanned openings for printed pp. 434-439, Greek and Latin,
  from Harvard's publicly hosted `Heiberg_Method.pdf`. The file is an excerpt,
  not a complete volume. Its first page is the treatise opening, not a volume
  title. The model's diagram follows the source's letters; it is newly drawn.
- Quadrature: complete printed pp. 342-353 and the title of Heiberg's 1881
  volume II, reproduced from the independently identified original PDF. This
  predates the palimpsest discovery and does not contain Method.
- The 1913 printed Method and 1881 Quadrature use distinct edited Greek forms.
  In particular, the Doric-looking `tmama` and the Method's `tmema` should not
  be silently made identical in a language note. There is no claimed ancient
  pronunciation or independent philological review.
- Source image identity, transcription, mathematical model, native exported
  files, fresh build, hosted files and actual public browser operation are
  separate claims. The source manifest records original PDF and derived image
  hashes. Complete pages preserve apparatus and margins.

## Working view

A measured geometry plate, with the tangent triangle visibly distinct from the
small inscribed triangle, sits above a large separate balance. A second view
keeps the curve fixed and adds nested inscribed triangles and an explicit outer
cover. The exact layer account explains the remaining third. Controls remain
native and operable on a phone. A source reader connects the selected step to
Greek, Latin, new English and its actual page; it does not silently move the
mathematical experiment back to the source's drawing.

## Independent checks

The TypeScript case generator exposes exact model coordinates and actual drawn
polygons. Python `Fraction` independently computes the polynomial primitive,
section moments, shoelace areas and endpoint-tangent intersections. The 636-case
review measures 12,144 drawn polygons and checks 42,840 interior points against
their tangent covers. It includes nonintegral lengths, both endpoint cuts and
all eight displayed depths. Native CSV and SVG downloads receive a separate
Fraction and shoelace audit; rounded SVG coordinates have an explicit geometric
tolerance while CSV comparisons are exact.

The eight displayed depths limit rendering to 255 inscribed triangles and 256
outer covers. They do not cap the mathematical construction. The shared clipped
vector hatch avoids Chromium's per-polygon pattern rasterization in PDF: the
only sixteen raster images are the retained complete source pages.
