# A sphere on the balance: review

The published build and hosted browser results are recorded separately in
[publication.md](publication.md).

## What a learner can do

Move the cutting plane through a sphere, auxiliary cone and auxiliary cylinder.
Observe three unequal circular areas on one scale. Move both smaller loads to
the fixed 2r arm while retaining their geometry, then change the cut and see
the moment equality remain. The zero cut explicitly cannot identify the arm.

Switch to a finite stack and change its band count. Eight bands give sphere
and cone coefficients 43/32 and 85/32, with errors +1/96 and -1/96. Their
combined balance remains exact. Compare inside/outside cylinder bounds rather
than treating a balanced finite stack as an exact sphere. Section and whole
moment units stay distinct.

Read ten Greek selections with new English, Latin, grammar and contextual notes.
Locate the selected lines in either registered image product, focus fragments
of an excerpt split across columns, and enlarge the image with keyboard scrolling.
Keep the earlier 'twice' beside the later 'four times' without inventing a
decipherment. The source and model decisions are in [model.md](model.md).

Save and reopen SVG, exact CSV and the complete illustrated reading from disk.
Print the reading to PDF, or disconnect after the complete edition is saved and
continue operating the balance, inspecting the sources and saving a new study.

## Retained local evidence

| Boundary                           | Recorded result                                                                                                               |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Pure coefficients                  | [Independent Fraction oracle](model-review.json): 62,909 cases, 389,494 exact comparisons                                     |
| Source files and mapped extraction | [Online source review](source-review.json): 29 source/font files, 10 excerpts, 52 mapped lines, 6 full-frame image reductions |
| Production workflow                | [Browser receipt](browser-review.json): Chromium and Firefox at 1440px and 375px                                              |
| Actual printed study               | [Print receipt](print-review.json): 70 complete fields and all 6 exact JPEGs recovered from the 32-page PDF                   |

All six original 8160 × 10880 TIFF files were downloaded and passed the
source project's published MD5 checksums before reduction. The recipe also
retains their SHA-256 identities, original descriptions and creator notices.
Those large originals are not part of the application build or offline cache.
The exact recipe and per-image identity are in [images.json](../public/sources/images.json).

The browser review uses native range controls, selectors, buttons, browser
history, keyboard operations and actual downloads. It observes equal moments
at six cut positions and all eight offered band counts, preserved section
geometry after transfer, both conflicting number words, all ten Greek readings,
all six decoded image products, and a two-fragment source excerpt.

The actual script-free HTML is reopened from `file:`. Its six embedded images
match the retained JPEG hashes; ten excerpt views reuse those images. The
embedded CSV matches the directly saved CSV. It makes no external requests.
Both browser engines pass the page accessibility audit without violations
in the reviewed state. This does not establish every assistive-technology
workflow or replace manual accessibility review.

For the disconnected check, the browser context goes offline only after the
active edition reports a complete cache. The page then reloads, a different
source image decodes and another complete study saves. Browser disconnection
is the observed boundary; the Vite origin remains running.

The PDF check compares all complete Greek, English, Latin, word, gloss,
grammar and note fields after normalizing only layout punctuation/whitespace.
It extracts each source JPEG byte for byte with Poppler. It is an untagged
browser print, not a professionally typeset or physically printed publication.

## Reproduce

```sh
npm ci
npm run check
npm run verify:model
npm run verify:sources
python3 scripts/source-review.py --online
```

Serve `npm run build`'s `dist/` using `npm run preview`, then, in another
terminal with installed Playwright browsers:

```sh
node scripts/browser-review.mjs http://127.0.0.1:4350/zygon/ /tmp/zygon-review
npm run verify:print -- /tmp/zygon-review/chromium-1440/study.pdf /tmp/zygon-print.json
```

The build must stay unchanged while the browser review runs. A development
server can be reviewed with `--development`, which omits the offline claim.
Retained evidence here is for a production build. Public source and canonical
hosted identities are recorded separately when publication is verified.

## Inspect

- [Section experiment](assets/balance.png)
- [Finite stack and errors](assets/stack.png)
- [Greek and mapped source](assets/reading.png)
- [Phone reader](assets/reading-phone.png)
- [Actual retained study](../examples/zygon-study.html)
- [Actual 32-page PDF](../examples/zygon-study.pdf)

The review establishes an operable mathematical and source-reading workflow.
It does not certify the translations, validate a physical ancient balance,
identify who introduced a textual discrepancy or reproduce Archimedes'
geometrical demonstration.
