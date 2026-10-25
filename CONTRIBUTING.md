# Contributing

Use Node 24 or newer. Run `npm ci`, `npm run check`, `npm run verify:model`
and `npm run verify:sources`. Generated `src/assets.json` and
`src/readings.json` are checked by their source workflows rather than the
formatter. Build before the production browser review and leave `dist/`
unchanged during that review.

Keep mathematical changes independent from browser rendering. An altered
historical claim needs a primary source and a clear distinction between the
source, an editorial reconstruction and a modern teaching choice. Do not
silently repair the released 'twice' reading, remove uncertainty marks or
present the new Latin as a historical translation.

Retain complete source headers and notices. Image changes need original-file
identity, creator attribution and exact processing provenance. The normal
source review uses Python's standard library; reproducing image reductions
also requires Pillow and the six large original TIFFs. Do not commit those
TIFFs or add them to the offline cache.

For UI work, operate real keyboard, source-image, saved-file and disconnected
workflows in both Playwright engines at 375px and desktop widths. Inspect
screenshots and the actual PDF. Correcting an observation is more useful than
adding checks that only repeat the implementation.

Publish `npm run build`'s `dist/` output to the `gh-pages` branch. Preserve its
history with a normal push. Canonical hosted file hashes and browser behavior
are separate evidence from a source push or a successful CI run.
