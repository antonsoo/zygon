# A sphere on the balance: model and source decisions

The mathematical experiment follows Archimedes' _Method_, proposition II.
The chapter divisions in the released transcription follow an edition; the
paragraph preceding the sphere argument concludes the preceding parabola argument.
The interface keeps that context visible in its first reading.

## The three auxiliary solids

Let the sphere have radius r, with Α at x = 0, its centre Κ at x = r, and Γ
at x = 2r. The auxiliary cone has apex Α, height 2r and base radius 2r.
The auxiliary cylinder has the same height and radius as that cone. This is
four times the volume of the smaller cylinder that encloses the sphere.

| Solid                                   | Radius | Height | Volume |
| --------------------------------------- | ------ | ------ | ------ |
| Auxiliary cylinder C                    | 2r     | 2r     | 8πr³   |
| Auxiliary cone K                        | 2r     | 2r     | 8πr³/3 |
| Sphere S                                | r      | 2r     | 4πr³/3 |
| Enclosing cylinder                      | r      | 2r     | 2πr³   |
| Small cone in the concluding comparison | r      | r      | πr³/3  |

The source constructs the small cone on a greatest circle of the sphere,
then extends it to construct the auxiliary cone. The common axial drawing
is a new mathematical diagram, not a facsimile of a manuscript drawing or
a reconstruction of a surviving physical device. Its nested circle,
triangle and rectangle have a common scale.

## Sections and the fixed left arm

For a cut perpendicular to the axis at x:

```
sphere area   = π[r² - (x-r)²] = πx(2r-x)
cone area     = πx²
cylinder area = 4πr²

(sphere area + cone area) * 2r = cylinder area * x
```

The cylinder section stays at Σ, x to the right of Α. The other two sections
are transferred to Θ, 2r to the left. Both centres lie at Θ; they are drawn
on one vertical line so the picture does not introduce two different arms.
Uniform density, common infinitesimal thickness, a weightless bar and
ideal moment balance are assumptions. Drawn deflection indicates only the
sign of the imbalance, not a calculated physical equilibrium angle.

Controls express x/r in hundredths from 0 to 2, and h/r in hundredths from
0 to 3. Exact BigInt fractions retain all coefficients. The source uses
geometric ratios; these variables, decimal controls and area formulas are
modern notation. No ancient length unit is assumed. At x = 0 both moments
vanish for every h, so that single cut cannot identify the correct arm.

Section moment coefficients multiply πr³ after suppressing common thickness
and density. Whole-solid moment coefficients multiply πr⁴ after suppressing
density. They have different dimensions; the interface distinguishes them.

## Whole volumes and a supplied theorem

The cylinder's centre is at Κ, r from Α. Placing the sphere and cone at Θ
therefore gives C r = (S + K) 2r, or S + K = C/2. The cone-volume theorem
supplies K = C/3. Subtracting yields S = C/6.

The cone-volume theorem is an input, not established by the balance control.
The sphere is half the **auxiliary** cone, four times the **small**
cone, and two thirds of the **enclosing** cylinder. The descriptions and
table distinguish those different solids.

## A finite stack is not an exact sphere

The finite view uses n equal bands of width 2r/n. Each sphere and cone band
uses its midpoint's circular section. With u = x/r, the sample positions are
u_i = (2i+1)/n, for i from 0 to n-1.

Using the finite sums of i and i² gives:

```
sphere stack / πr³ = 4/3 + 2/(3n²)
cone stack   / πr³ = 8/3 - 2/(3n²)
combined     / πr³ = 4
```

Each pair still balances point by point at h = 2r, and the equal cylinder
bands have their centre at r. The combined turning moment is exact while
the separate sphere and cone volumes remain estimates. For eight bands the
coefficients are 43/32 and 85/32, with errors +1/96 and -1/96.

The lower and upper sphere bounds use the smallest and largest section
radius in each band, including the centre maximum when a band crosses it.
For the supported even n:

```
lower / πr³ = 4/3 - 2/n - 4/(3n²)
upper / πr³ = 4/3 + 2/n - 4/(3n²)
gap   / πr³ = 4/n
```

For n = 1, the bounds are 0 and 2. The finite bounds contain 4/3 and
converge to it, providing a route to a modern limiting proof. This is not
attributed to Archimedes as his written geometrical proof. His mechanical
discovery and the geometrical demonstration remain distinct.

## Greek evidence and editorial uncertainty

The unmodified data comes from the [Archimedes Palimpsest Digital Release](https://archimedespalimpsest.net/),
hosted by the University of Pennsylvania Libraries. Its [introduction](https://archimedespalimpsest.org/digital/)
describes the purpose, transcriptions, images and open license. The included
project encoding documentation explains supplied text, uncertain letters,
abbreviations and physical line/folio markers.

Ten selections derive from the mapped Netz–Wilson XML for Arch17r, Arch17v
and Arch18r. Extraction uses the expanded side of `choice`, joins split
words, omits marginal/superscript markers and figure labels, and preserves
supplied, unclear and abbreviation-expansion flags. All selected character
ranges retain their existing project line coordinates. An outlined line is
evidence of that project's mapping, not a fresh decipherment by this app.

The released transcription's early comparison says **διπλασία**, 'twice',
of the small cone. The later conclusion says **τετραπλασίων**, 'four times'.
The project's reconstruction of Heiberg's manuscript reading also has the
earlier 'twice'; that file is not Heiberg's complete critical edition.
Neither reading is silently changed. The geometry and later comparison give
four, and the notes distinguish a reading discrepancy from a claim about
which hand or process introduced it.

New English translations, Latin study renderings and language notes are
teaching aids. The Latin is explicitly a 2026 composition, not an ancient
witness or Heiberg translation. None has independent philological peer review.
For a public-domain mathematical cross-check, see T. L. Heath's
[_The Method of Archimedes_ (1912)](https://www.wilbourhall.org/pdfs/archimedes/archimedesHeiberg.pdf),
proposition 2, printed pp. 18-21. Our Greek labels follow the transcription,
including theta Θ rather than the H used in some English redrawings.

## Image identity and redistribution

Images preserve the complete frame and calibration strips of the project's
registered `true_pack8` and `pseudo_no-veil` TIFFs. The latter is a supplied
processed product, not a filter invented by this app. Source TIFFs must match
the project's published MD5 sidecars before reduction. `images.json` records
original SHA-256, project MD5, URLs, dimensions, Pillow version, reduction
parameters and the retained JPEG identity. Original image descriptions and
creator notices remain in separate metadata files.

Bill Christens-Barry, Roger Easton and Keith Knox are credited image creators.
Full contributor lists remain in the TEI headers and image metadata. The data,
adapted Greek and new teaching text use CC BY 3.0; code and new diagrams use
MIT. Complete notices accompany the site and saved studies.
