# Direct review of the floating-body room

## Try the actual work

Open [It floats. Will it stay upright?](https://antonsoo.github.io/zygon/float.html#fl-bench)
or choose **Floating bodies** in the balance room's navigation.
1. Choose **Tall, light solid**, then **Stand upright**. Equal weight and buoyancy
   share one vertical line, but the upright position is unstable.
2. Use **Tilt 5° farther right**. The buoyancy line moves left of the weight line,
   so the couple turns the solid farther right. The force-line microscope
   enlarges the small horizontal gap separately from the equal-scale profile.
3. Choose **Find the balanced tilt**. The angle is about 32.3115332°. At 31° the
   turn is rightward; at 34° it is leftward. This is a separate dry-base equilibrium.
4. Choose **Use critical density**. At this shape it is 25% of liquid density.
   A finite dry-base tilt restores even though the linear stiffness is zero.
   **Same shape, denser** uses 64% and restores ordinary upright stability.
5. Return to the tall, light solid and move to 60°. The complete candidate cap
   crosses the base. The workshop withholds displaced volume, B and force results.
   Its plot leaves those positions empty instead of continuing an invalid formula.
6. Read **Any ratio, with a dry base**, its word notes and the located Greek lines.
   Compare the complete 1881 Latin pages. In the last reading, inspect the missing
   denominator and the footnote that supplies it. In reading five, the Latin
   proof breaks off earlier; no corresponding continuation is invented.
7. Save and reopen editable JSON, or keep an illustrated HTML reading. Open that
   file with scripts disabled, use its native downloads, and print it to PDF.

The source, derivation, conventions and limitations are in
[float-model.md](float-model.md). The diagram is an axial section of a
three-dimensional solid. B is the displaced-volume centre, not the centroid
of its coloured profile. Arrow lengths are schematic; lines of action and the
separate microscope's scale are stated.

## What was directly reviewed

| Boundary                       | Evidence and observed result                                                                                                                                                                                                                  |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Analytic geometry              | [Independent disk-integration receipt](float-model-review.json): 252 cases; 122 dry-base cases integrated, 130 contact/outside cases with results withheld; maximum centre/lever discrepancy below 9.24e-10 length units                      |
| Source identity and extraction | [Source receipt](float-source-review.json): six reproducible excerpts, 37 mapped lines, three complete manuscript frames, four complete Latin pages; original XML bytes and TIFF checksum sidecars checked online                             |
| Browser workflow               | [Local browser receipt](float-browser-review.json): Chromium and Firefox at 1440px and 375px; actual controls, source frames, sixteen word notes, shared URLs, malformed imports and downloads                                                |
| Retained HTML                  | The actual saved HTML reopened from disk with page scripts disabled in all four configurations; no remote asset request; native JSON/CSV/SVG downloads retained the selected trial                                                            |
| Substituted source             | An HTTP 200 containing another source was refused for display, and the illustrated export was withheld in both engines                                                                                                                        |
| Offline edition                | The matching active worker and complete inventory were required before disconnecting; both the original balance and new floating room operated offline, including a new illustrated export                                                    |
| Genuine upgrade                | [Upgrade receipt](float-upgrade-review.json): preceding public worker `9b445eb`'s edition to this two-room edition, in both engines; successful upgrade and wrong-source/failure/retry; old tabs withhold readiness and the old cache retires |
| Actual PDF                     | [Print receipt](float-print-review.json): 71 complete passage/note fields, all sixteen word notes, seven exact source JPEGs recovered, 6,918 extracted words inside checked A4 margins, 26 pages                                              |
| Clean installation             | [Fresh archive receipt](float-build-review.json), separate from in-place browser review                                                                                                                                                       |
| Public delivery                | [Publication record](float-publication.md); local behavior does not establish hosted identity                                                                                                                                                 |

At the critical density, classification compares the selected density with the
computed bound. A tiny nonzero tilt is not called balanced just because its
world-coordinate gap is small. The general results are floating-point analytic
calculations with rounded display labels, not exact arithmetic certificates.

The portable PDF is a real browser print of the saved HTML. Its complete source
images are retained as JPEGs, rather than replaced by screenshots. It is untagged;
physical printer results and independent philological review remain unverified.

## Visual review

The cabinet's paper, olive, brick-red and green palette is retained. The new room
puts force geometry first, followed by nearby-angle response and source conditions.
Phone drawings have their own layout and readable labels; source frames scroll
with the keyboard when enlarged. A microscope enlarges only the horizontal gap.
No body diagram has its vertical scale stretched to make the force gap visible.

| Configuration | Working bench                                 | Greek and its frame                               | Saved file                                                   |
| ------------- | --------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------ |
| Chromium 1440 | [Bench](assets/float-chromium-1440-bench.png) | [Reading](assets/float-chromium-1440-reading.png) | [Native HTML](assets/float-chromium-1440-native-reading.png) |
| Chromium 375  | [Bench](assets/float-chromium-375-bench.png)  | [Reading](assets/float-chromium-375-reading.png)  | [Native HTML](assets/float-chromium-375-native-reading.png)  |
| Firefox 1440  | [Bench](assets/float-firefox-1440-bench.png)  | [Reading](assets/float-firefox-1440-reading.png)  | [Native HTML](assets/float-firefox-1440-native-reading.png)  |
| Firefox 375   | [Bench](assets/float-firefox-375-bench.png)   | [Reading](assets/float-firefox-375-reading.png)   | [Native HTML](assets/float-firefox-375-native-reading.png)   |

Gecko's page-side Promise callback does not settle while page scripts are
disabled. The file review keeps scripts disabled and polls synchronous font
status from Node. For that file screenshot only, it skips Playwright's redundant
FontFaceSet.ready Promise after confirming the fonts are loaded. Controls and
native downloads are exercised with the same disabled-script context.

## Reproduce

With Node 24+, Python 3, Poppler and the existing Playwright browsers:

```sh
npm ci
npm run check
npm run verify:model
npm run verify:float
npm run verify:float-sources -- --online
npm run preview
```

In another terminal:

```sh
npm run test:float -- http://127.0.0.1:4350/zygon/ /tmp/zygon-floating
npm run verify:float-print -- /tmp/zygon-floating/chromium-1440/reading.pdf /tmp/zygon-floating/print.json
```

The genuine upgrade command takes a directory containing the actual preceding
static edition, with its original worker. It rejects two copies of one edition:

```sh
npm run test:float-upgrade -- /path/to/preceding-static-edition /tmp/zygon-floating-upgrade
```

To regenerate the source frames from downloaded originals, use
`scripts/prepare-floating-sources.py ORIGINALS_DIR`. The named TIFFs must match
published project checksums, and the 1881 PDF must match its recorded SHA-256.
Normal learner use and the source checker do not download the large TIFFs.

## Actual portable examples

- [Illustrated HTML, gzip](../examples/floating-reading.html.gz)
- [Printed browser PDF](../examples/floating-reading.pdf)
- [Matching editable experiment](../examples/floating-experiment.json)
- [Turning CSV](../examples/floating-turning.csv)
- [Embedded-font SVG](../examples/floating-drawing.svg)

Extract before opening the retained HTML:

```sh
gzip -dc examples/floating-reading.html.gz > /tmp/zygon-floating-reading.html
```
