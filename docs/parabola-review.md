# A third more: operate the discovery and its finite correction

## Try the actual work

After the README quickstart, open `/zygon/parabola.html#pa-bench`.
1. Keep chord 2 and height 1. At the midpoint the red section has length 1,
   the ochre section length 2. The trial arm 3/5 gives unequal moments 6/5 and 2.
   Choose **Use the one full arm**, then move the cut: one arm fits every
   interior section. The source construction keeps its fixed point Theta;
   the separate horizontal beam tests your hanging position.
2. Choose **Try an end cut**. Both moments vanish for any arm. It cannot
   identify the arm; zero against zero is deliberately inconclusive.
3. Read **The author withholds the proof**, then open its complete Greek/Latin
   source opening. The printed perfect passive is `οὐκ ἀποδέδεικται`:
   the preceding mechanical argument has not proved the conclusion.
4. Choose **Account for the remainder**. The first triangle has area 1.
   Layers 0 and 1 together have area 5/4; the upper tangent bound is 11/8.
   The curved area and four-thirds candidate both remain strictly between them.
5. Add a layer. The new inscribed sum is 21/16. One third of the last
   complete layer is 1/48: their sum is exactly 4/3. This third is an
   algebraic correction, not another region filled in the picture.
6. Make the gap less than 1/100 of the first triangle. The exact gap becomes
   1/512. Add all seven refinements: even 255 inscribed triangles do not fill
   the curve. The magnified ruler explicitly states its changing scale.
7. Enter chord 7/3 and height 5/2. The first triangle is 35/12; at layer 4
   the strict bounds are 11935/3072 and 23905/6144. The candidate is 35/9.
   Save and reopen JSON, inspect the exact CSV and retain the embedded-font SVG.
8. Open each of seven passages and fourteen contextual word notes. Greek
   `ἐπίτριτον` and Latin `tertia parte maius` compare 4/3 to 1; reversing the
   comparison gives 3/4. Inspect the sixteen complete source images, including
   the 1881 title page. Enlarge and pan with the keyboard on a phone.
9. Save the illustrated reading, open it from disk with scripts disabled and
   networking disconnected, and use its native JSON/CSV/SVG downloads. The
   actual saved HTML also prints a 28-page PDF with three landscape source
   openings. The retained example uses the nonintegral experiment in step 7.

## Try a finite rejection

The 0.3 extension adds an operable comparison below the finite account.
Choose **Try 5/4** at layer 0: it is still between the bounds. **Find a finite
rejection** selects layer 1, whose strict lower bound equals that guess and
therefore excludes it. **Try 7/5** fails on the other side at the same layer.
Choose **Try 1333333/1000000**: layer 7 still cannot exclude it, while the exact
layer-10 account can. The 2,047 triangles in that account are not claimed drawn.
Restore 4/3: no finite rejection exists, leaving the shrinking-gap argument to
establish equality.

Native version 2 records preserve the proposed ratio. Reopen the retained
[original v1 file](../examples/parabola/experiment-v1.json): its geometry and
reader settings remain intact with the original 4/3 proposal. The current
illustrated example retains the close wrong guess at layer 4, together with
its separate layer-10 rejecting account.

[Proposal receipts](evidence/parabola-proposals/) include 153 independent exact
witness accounts (deepest 14), the expanded actual browser workflow and native
v2/v1 behavior. The 28-page saved PDF retains 86 complete checked fields,
3,762 words within checked margins, all licenses and all sixteen original
source JPEGs. Local proposal artifact checks cover all 25 CSV quantities and
measure the actual SVG polygons independently. Source identity and the
636-case geometric audit remain separate.

## What the lesson claims

The modern coordinates make the moment identity exact and build explicit
inner/outer area bounds. A finite identity plus the possibility of arbitrarily
small finite gaps supplies an exhaustion argument. Our tangent covers are a
separate coordinate proof, not a transcription of the printed Quadrature XXIV.
Neither a moving balance nor a finite stack establishes the area theorem alone.
[Equations and independent geometry](parabola-model.md).

The Greek and Latin are excerpts from Heiberg's retained edited print. Joined
line-end hyphens, normalized Greek point letters and omitted inline footnote
markers are stated. The Method excerpt and the earlier Quadrature volume
remain different sources; the latter predates the palimpsest discovery. New
English and word notes have no independent philological review. Full source
pages retain critical apparatus and margins. [PDF and image identities](../src/parabola-sources.json).

## Reproduce the work

```sh
npm ci
npm run check
npm run verify:parabola
npm run preview -- --port 4372
```

In another terminal:

```sh
node scripts/parabola-browser.mjs http://127.0.0.1:4372/zygon/ /tmp/parabola-review
python3 scripts/parabola-artifacts.py /tmp/parabola-review/chromium-1440
npm run verify:parabola-print -- /tmp/parabola-review/chromium-1440/reading.pdf /tmp/parabola-review/print.json
node scripts/parabola-guards.mjs http://127.0.0.1:4372/zygon/ /tmp/parabola-guards
node scripts/parabola-upgrade.mjs /path/to/previous/published/edition /tmp/parabola-upgrade
```

The source reproduction script takes the two original PDFs identified in the
manifest; it uses Poppler, not cropped screenshots. Those tools and
Python's standard library are review dependencies, not learner dependencies.
Playwright uses Chromium and Firefox already installed on the review machine.

## Reviewed local behavior

[Retained receipts](evidence/parabola/) separate exact geometry, original PDF
reproduction, native artifacts, PDF extraction, browser operation, fault
injection and upgrade behavior. Chromium and Firefox at 1440 and 375 pixels
exercise native controls, all passages/word notes/source blobs, real downloads,
shared links, duplicate-key rejection, offline reload after matching controller
and complete inventory, and the saved script-free local file. Axe reports no
violations for the reviewed WCAG A/AA tags; this is not a general accessibility
certification.

Held responses verify that old sources cannot replace a newer selection, bad
JPEG/font bytes are refused and retry succeeds, exports keep their click
snapshot, and delayed imports cannot discard newer trials, uncommitted typing
or a newer file. Upgrade cases begin with the genuine preceding Pages edition;
a bad new scan keeps readiness incomplete until a valid retry. Earlier sphere
and floating-body browser journeys also run against the three-room build. The
sphere regression exposed and fixed a pre-existing saved-reading failure:
its source-download list included files deliberately excluded from collection.

The initial 0.2 PDF retains all 84 checked passage/word-note fields and all three
licenses, with 3,658 text words inside checked page margins. Its sixteen source
JPEGs are recovered byte-for-byte. Tags are present; no PDF/UA or physical
printer claim is made. The generated construction remains vector.

## Publication boundary

The user authorized publication. Source `f03edc9` and fast-forward Pages
`22d826e` were pushed on 2026-10-28. Every one of 73 canonical production files
matched the fresh Node 24 build, both before and after public browser operation.
Chromium and Firefox at 1440 and 375 pixels exercised the actual hosted lesson,
all sources, native downloads, explicit shared links and all three offline rooms
after matching controller and the complete 72-file inventory.

The public downloads independently pass the exact CSV/drawn SVG and 28-page
PDF audits. Public fault injection passes both engines' source/font identity,
retry, click-snapshot and delayed-import cases. The repaired sphere study also
passes the actual public four-case browser/download/offline matrix. All seven
preceding hashed asset files remain available with unchanged public bytes.
Nine immutable public source/example files equal their committed Git blobs.
[Public receipts](evidence/parabola-public/).

Edition: `ac5e3b409c6e6d13c2f7005d87147ff3e5ce7b8b668fc26cb371a485738f9c19`.
CI 40674861715 and source Pages workflow 40674861697 failed with no executed
steps; they are not validation evidence. Legacy Pages build/deploy 40675011843
succeeded independently. These boundaries remain separate from local tests,
source identity and actual hosted behavior.
