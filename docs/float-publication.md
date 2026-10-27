# Publication of the floating-body room

[It floats. Will it stay upright?](https://antonsoo.github.io/zygon/float.html#fl-bench)
is public. This record separates pushed source, static delivery, actual browser
behaviour and the portable reading. Review date: 27 October 2026 UTC.

| Boundary               | Identity or direct result                                                                                                                                                                                 |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Reviewed public source | [093e1ba](https://github.com/antonsoo/zygon/tree/093e1baad8355133e51c63706bcff4c00445d639)                                                                                                                |
| Clean archive build    | [Node 24.21.0 / npm 11.19.0 receipt](float-build-review.json), archive of `76d8e29`; later source changes before publication are documentation only                                                       |
| Static branch          | `8b3c8bc3aadfe16d12b475e51f78a119b7bfe23c`, a fast-forward of the preceding static branch                                                                                                                 |
| Canonical delivery     | [53 of 53 reviewed build files](float-hosted-files.json) match; canonical entry checked before and after the inventory                                                                                    |
| Actual public workflow | [Chromium and Firefox, 1440px and 375px](float-hosted-browser.json): keyboard controls, six readings, sixteen word notes, source images, shared state, downloads, native reopening and both rooms offline |
| Public source examples | [Six source/artifact files](float-public-artifacts.json) match their local bytes, including the compressed illustrated reading, PDF and binary attributes                                                 |
| Actual generated files | [28 public/native artifact matches](float-hosted-artifacts.json) agree byte-for-byte with their reviewed local counterparts                                                                               |
| Rendered output        | All sixteen public screenshots are byte-identical to the locally inspected screenshots                                                                                                                    |
| Public browser PDF     | [26-page print receipt](float-hosted-print.json): 71 complete text fields, all sixteen word notes, seven exact source JPEGs and 6,918 extracted words within checked margins                              |
| Edition transition     | [Both engines, genuine preceding edition](float-upgrade-review.json): normal upgrade and substituted-source/failure/retry; old tabs withhold readiness until reloaded                                     |

The public review waits for the matching active worker and complete cache
inventory before disabling browser networking. It then reloads and operates
both the original balance and floating room, reads a new manuscript frame,
and saves another complete illustrated reading. The integrity scenarios are
controlled request substitutions in fresh browser contexts; no alteration of
the public server is implied.

The source examples preserve the selected oblique trial and reading six. The
illustrated HTML opens from disk with page scripts disabled in both engines.
Its native JSON/CSV/SVG downloads retain the experiment. External reference
links need a connection; its seven images, fonts, original XML and licenses do
not. The compressed example must be extracted before opening.

These receipts do not establish physical stability measurements, manufacture,
independent philological review, tagged-PDF accessibility, physical printer
results or a remote CI result. The analytic static model and its source limits
are documented in [float-model.md](float-model.md).

## Reproduction

`npm ci && npm run build` writes `dist/` with the `/zygon/` base path.
The clean-archive receipt also covers lint, types, the complete local test suite,
the original exact balance oracle, independent submerged-volume integration,
and both source extractors. The public static branch contains the reviewed
build plus `.nojekyll`.

Suggested repository description:

> Operate Archimedes' balance and floating solids, read Greek and Latin witnesses, and retain offline studies.

Suggested topics: `archimedes`, `ancient-greek`, `geometry`, `hydrostatics`,
`education`, `digital-humanities`, `offline-first`.
