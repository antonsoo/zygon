import "./style.css";
import "./parabola.css";
import { escapeHTML as e } from "./drawing";
import { offlineStatus } from "./offline";
import {
  parabolaReadingHtml,
  parabolaReadings,
  parabolaWords,
  sourceManifest,
} from "./parabola-content";
import { parabolaBeam, parabolaPlate } from "./parabola-drawing";
import {
  parabolaAccount,
  parabolaAsset,
  parabolaFacts,
  parabolaProposalAccount,
  parabolaStudy,
  parabolaSvg,
} from "./parabola-files";
import {
  initialParabola,
  type ParabolaState,
  parabolaCsv,
  parabolaFraction,
  parabolaJson,
  parabolaModel,
  parabolaProposalFraction,
  parabolaQuery,
  readParabolaJson,
  readParabolaQuery,
} from "./parabola-model";
import { saveText } from "./study";

const el = <T extends HTMLElement = HTMLElement>(id: string) => {
  const node = document.getElementById(id);
  if (!node) throw new Error(`Missing ${id}`);
  return node as T;
};
let state: ParabolaState = { ...initialParabola },
  startup = "",
  revision = 0,
  importAttempt = 0,
  sourceAttempt = 0,
  sourceUrl = "";
try {
  state = readParabolaQuery(location.search);
} catch (error) {
  startup = (error as Error).message;
}
el("app").innerHTML =
  `<a class="skip-link" href="#pa-bench">Skip to the working diagram</a><header class="pa-header"><a href="./" class="pa-brand">Zygon <span lang="grc">ζυγόν</span></a><nav aria-label="Archimedes workshops"><a href="./">Sphere on a balance</a><a href="./float.html">Floating bodies</a><a href="#pa-reading">Read the print</a><a href="#pa-keep">Keep your work</a></nav></header>
<main class="pa-main"><section class="pa-intro" aria-labelledby="pa-title"><div><p class="eyebrow">Archimedes / Method I and Quadrature XXI–XXIV</p><h1 id="pa-title">A third more.</h1></div><div><p>The curved segment is one-third greater than its triangle. A balance suggests the result; a finite polygon still leaves something unfilled.</p><p>Find one arm for every cut. Then account for the remaining third without pretending that a drawing has become an infinite sum.</p><a href="#pa-bench">Begin with a balance that misses</a></div></section>
<section id="pa-bench" aria-labelledby="pa-bench-title"><div class="pa-section-head"><div><h2 id="pa-bench-title">Move the section. Keep the argument.</h2><p>The source construction and the separate working beam have different jobs.</p></div><button id="pa-reset" type="button">Reset the experiment</button></div>
<div class="pa-view" role="group" aria-label="Working view"><button id="pa-balance-view" type="button" aria-pressed="true">1 / Find an arm</button><button id="pa-fill-view" type="button" aria-pressed="false">2 / Account for the remainder</button></div>
<div class="pa-bench"><aside class="pa-controls" aria-label="Parabola and working comparison"><h3>One curved segment</h3><label for="pa-width">Chord width, exact units</label><input id="pa-width" type="text" inputmode="text"><label for="pa-height">Height, exact units</label><input id="pa-height" type="text" inputmode="text"><p class="pa-note">Use a whole number or a fraction, such as 7/3. Both length scales in the geometry are equal.</p>
<div id="pa-balance-controls"><label for="pa-cut">Cut from Α toward Γ <output id="pa-cut-value" for="pa-cut"></output></label><input id="pa-cut" type="range" min="0" max="100"><label for="pa-arm">Trial left arm / ΚΓ <output id="pa-arm-value" for="pa-arm"></output></label><input id="pa-arm" type="range" min="0" max="200"><div class="pa-actions"><button id="pa-find-arm" type="button" class="primary">Use the one full arm</button><button id="pa-end" type="button">Try an end cut</button></div><p class="pa-note">The source fixes Θ one full arm beyond Κ. The trial beam lets you test a different hanging point.</p></div>
<div id="pa-fill-controls" hidden><label for="pa-depth">Final complete layer <output id="pa-depth-value" for="pa-depth"></output></label><input id="pa-depth" type="range" min="0" max="7"><div class="pa-actions"><button id="pa-add" type="button">Add a layer</button><button id="pa-remove" type="button">Remove a layer</button><button id="pa-small-gap" type="button" class="primary">Make the bound gap less than 1/100 of the first triangle</button></div><p class="pa-note">Each child has an eighth of its parent’s area. Two children make a quarter. The last layer is a whole group.</p></div>
<button id="pa-read-step" type="button">Read the current step</button><p id="pa-status" role="status">${e(startup)}</p></aside><div class="pa-working"><div class="pa-plate-head"><span id="pa-plate-title"></span><button id="pa-enlarge" type="button" aria-pressed="false">Enlarge geometry</button></div><div id="pa-frame" tabindex="0" role="region" aria-label="Measured geometry; when enlarged use arrow keys to pan"><div id="pa-diagram"></div></div><p id="pa-scale-note" class="pa-note"></p><div class="pa-outcome" aria-live="polite" aria-atomic="true"><h3 id="pa-verdict"></h3><p id="pa-result"></p></div></div></div>
<div id="pa-mechanics"><h3>A separate working beam</h3><p class="pa-note">The source’s slanted arm ratios are drawn horizontally here. Section heights share one scale; rectangle widths are symbolic. This is a static moment comparison, not a simulation of motion.</p><div id="pa-beam"></div><div id="pa-facts"></div></div>
<div id="pa-finite" hidden><h3>The last layer’s third is not another filled triangle.</h3><p id="pa-identity"></p><div id="pa-account"></div><p class="pa-note">The red mark lies between the bounds. The lower ruler enlarges only their remaining interval; it does not make the curved remainder larger. Displaying seven refinements is a drawing limit, not a mathematical endpoint.</p><div class="pa-challenge" aria-labelledby="pa-challenge-title"><h3 id="pa-challenge-title">Can a finite construction rule out your proposed area?</h3><p>Propose a ratio of curved area to first triangle. A value still inside this layer’s bounds has survived one check; it has not become a theorem.</p><label for="pa-proposal">Proposed ratio, from 1 to 2</label><input id="pa-proposal" type="text" inputmode="text" aria-describedby="pa-proposal-help"><p id="pa-proposal-status" role="status"></p><p id="pa-proposal-help" class="pa-note">Use an exact fraction, with up to eight digits in each part. The diagram’s red mark remains the source’s four-thirds candidate.</p><div class="pa-actions"><button id="pa-guess-small" type="button">Try 5/4</button><button id="pa-guess-large" type="button">Try 7/5</button><button id="pa-guess-close" type="button">Try 1333333/1000000</button><button id="pa-guess-source" type="button">Restore 4/3</button><button id="pa-reject" type="button" class="primary">Find a finite rejection</button></div><div id="pa-proposal-account" role="status"></div></div></div>
</section>
<section class="pa-section pa-proof" aria-labelledby="pa-proof-title"><div><p class="eyebrow">What each argument earns</p><h2 id="pa-proof-title">Discovery leaves a proof to supply.</h2><p>The large tangent triangle is four times the small inscribed one. Its centre of weight lies a third of the way along ΚΓ. Balancing it with the curved segment suggests a ratio of four to three.</p><p>The source immediately says that the preceding reasoning has not proved the result. A finite collection of balanced sections does not itself establish the full area.</p><button id="pa-read-warning" type="button">Read “has not been demonstrated”</button></div><div><h3>Keep the bounds finite</h3><p>Every filled polygon stays below the curve. The endpoint tangents enclose each remaining curved piece, supplying a strict upper cover. Each further layer quarters the gap between these bounds.</p><p>Both the proposed four-thirds area and the actual curved area remain inside every such interval. A proposed positive difference between them can always exceed a sufficiently narrowed gap: a contradiction. This modern coordinate exhaustion argument supports the result while the printed <i>Quadrature</i> follows its own comparisons.</p><p><a href="https://github.com/antonsoo/zygon/blob/main/docs/parabola-model.md">Coordinates, finite identity, source boundaries and model notes</a>.</p></div></section>
<section id="pa-reading" class="pa-section" aria-labelledby="pa-reading-title"><p class="eyebrow">Greek / Heiberg’s Latin / new English</p><h2 id="pa-reading-title">Read the comparison, then its qualification.</h2><p>These are two edited texts, not one invented manuscript. The 1881 <i>Quadrature</i> predates discovery of the palimpsest; the <i>Method</i> comes from the later edition. Complete pages keep their margins and critical apparatus.</p><label for="pa-reading-select">Passage</label><select id="pa-reading-select">${parabolaReadings.map((r, i) => `<option value="${i}">${i + 1}. ${e(r.title)}</option>`).join("")}</select><div id="pa-reading-text"></div><div class="pa-actions"><button id="pa-greek-page" type="button">Open its Greek page</button><button id="pa-latin-page" type="button">Open its Latin page</button></div>
<div class="pa-words"><div><h3>Words doing mathematical work</h3><div class="pa-word-buttons">${parabolaWords.map((w, i) => `<button type="button" data-pa-word="${i}" lang="grc" aria-pressed="false">${e(w[0])}</button>`).join("")}</div></div><div id="pa-word-note" aria-live="polite"><p>Select a word to open its passage and inspect the comparison it makes.</p></div></div>
<div class="pa-source"><div><h3>The complete source page</h3><label for="pa-page">Printed page or opening</label><select id="pa-page">${sourceManifest.pages.map((p, i) => `<option value="${i}">${e(p.file.replace("parabola-", "").replace(".jpg", ""))}</option>`).join("")}</select><div class="pa-actions"><button id="pa-source-zoom" type="button" aria-pressed="false">Enlarge page</button><button id="pa-source-retry" type="button">Retry page</button></div><p id="pa-source-caption" class="pa-note" role="status"></p><p class="pa-note">Line-end hyphens are joined, figure letters normalized to Greek capitals and inline footnote markers omitted. The readings do not claim a new decipherment. English and word notes have not received independent philological review.</p><ul>${sourceManifest.sources.map((s) => `<li><a href="${e(s.url)}">${e(s.edition)}</a></li>`).join("")}</ul></div><div id="pa-source-frame" tabindex="0" role="region" aria-label="Complete source page; use arrow keys to pan when enlarged"><img id="pa-source-image" alt="" hidden></div></div></section>
<section id="pa-keep" class="pa-section" aria-labelledby="pa-keep-title"><p class="eyebrow">Keep a complete reading</p><h2 id="pa-keep-title">Retain the third, the bounds and the print.</h2><p>The illustrated reading keeps your settings, exact layer account, all seven Greek/Latin/English passages, fourteen word notes, sixteen complete source images, fonts and licenses. It opens without scripts or a connection and includes native JSON, CSV and SVG downloads. Use its browser Print command for a PDF.</p><div class="pa-actions"><button id="pa-save-html" type="button" class="primary">Save illustrated reading</button><button id="pa-save-json" type="button">Save editable JSON</button><button id="pa-save-csv" type="button">Save exact CSV</button><button id="pa-save-svg" type="button">Save font-embedded SVG</button><button id="pa-share" type="button">Copy experiment link</button></div><label for="pa-open">Reopen an editable experiment</label><input id="pa-open" type="file" accept=".json,application/json"><p id="pa-save-status" role="status"></p><label for="pa-share-link" id="pa-share-label" hidden>Copy this experiment link</label><input id="pa-share-link" type="url" readonly hidden></section></main><footer class="pa-footer"><a href="./">Sphere on the balance</a><a href="./float.html">Floating bodies</a><span id="pa-offline" role="status">Preparing the offline edition…</span><a href="https://github.com/antonsoo/zygon">Source and licenses</a></footer>`;
function draw() {
  revision++;
  const m = parabolaModel(state),
    fill = state.view === "fill";
  el<HTMLInputElement>("pa-width").value = state.width;
  el<HTMLInputElement>("pa-height").value = state.height;
  for (const key of ["cut", "arm", "depth"] as const)
    el<HTMLInputElement>(`pa-${key}`).value = String(state[key]);
  el("pa-cut-value").textContent = `${state.cut}%`;
  el("pa-arm-value").textContent = m.arm.toString();
  el("pa-depth-value").textContent = String(state.depth);
  el("pa-balance-controls").hidden = fill;
  el("pa-fill-controls").hidden = !fill;
  el("pa-mechanics").hidden = fill;
  el("pa-finite").hidden = !fill;
  el("pa-balance-view").setAttribute("aria-pressed", String(!fill));
  el("pa-fill-view").setAttribute("aria-pressed", String(fill));
  el<HTMLButtonElement>("pa-add").disabled = state.depth === 7;
  el<HTMLButtonElement>("pa-remove").disabled = state.depth === 0;
  el("pa-plate-title").textContent = fill
    ? "Finite inscribed layers / tangent covers"
    : "The source construction / equal length scales";
  el("pa-diagram").innerHTML = parabolaPlate(state);
  el("pa-scale-note").textContent = fill
    ? `The lower ruler shows only the remaining interval, enlarged ${2 * 4 ** state.depth} times relative to the first triangle’s area. Exact areas are in the account below.`
    : "The geometry keeps the source’s fixed Θ. The separate working beam below changes the trial hanging point.";
  el("pa-beam").innerHTML = parabolaBeam(state);
  el("pa-facts").innerHTML = parabolaFacts(state);
  el("pa-account").innerHTML = parabolaAccount(state);
  el<HTMLInputElement>("pa-proposal").value = state.proposal;
  el("pa-proposal-account").innerHTML = parabolaProposalAccount(state);
  el("pa-verdict").textContent = fill
    ? "No finite layer has filled the curve."
    : m.inconclusive
      ? "This end cut cannot choose an arm."
      : m.pointFits
        ? "One full arm balances every interior cut."
        : "This trial has unequal turning moments.";
  el("pa-result").textContent = fill
    ? `Inscribed area ${m.sum} < curved area < tangent upper bound ${m.upper}. The four-thirds candidate ${m.candidate} remains strictly between.`
    : m.inconclusive
      ? `Both moments are zero, even at this ${m.arm} arm. The all-cut identity ${m.universalFit ? "does" : "does not"} hold; this endpoint alone cannot establish it.`
      : `Left moment ${m.left}; right moment ${m.right}. ${m.universalFit ? "The common factor 4hu(1-u) makes the identity hold for every cut, beyond this one example. The mechanical discovery still leaves a geometrical proof to supply." : "Move the trial arm to 1, then try another cut. Equal section lengths are not required."}`;
  el("pa-identity").textContent =
    `${m.sum} + ${m.correction} = ${m.candidate}. The last complete layer is ${m.last}; its third is ${m.correction}. This is the finite identity in Quadrature XXIII.`;
  el<HTMLSelectElement>("pa-reading-select").value = String(state.reading);
  el("pa-reading-text").innerHTML = parabolaReadingHtml(state.reading);
  el<HTMLSelectElement>("pa-page").value = String(state.page);
}
function changed() {
  draw();
  el("pa-status").textContent = "";
}
for (const key of ["width", "height"] as const)
  el(`pa-${key}`).addEventListener("input", () => {
    revision++;
  });
for (const key of ["width", "height"] as const)
  el<HTMLInputElement>(`pa-${key}`).addEventListener("change", () => {
    try {
      state[key] = parabolaFraction(el<HTMLInputElement>(`pa-${key}`).value.trim()).toString();
      changed();
    } catch (error) {
      el("pa-status").textContent = (error as Error).message;
      el<HTMLInputElement>(`pa-${key}`).value = state[key];
    }
  });
el("pa-proposal").addEventListener("input", () => {
  revision++;
  el("pa-proposal-status").textContent = "";
});
el("pa-proposal").addEventListener("change", () => {
  try {
    state.proposal = parabolaProposalFraction(
      el<HTMLInputElement>("pa-proposal").value.trim(),
    ).toString();
    changed();
  } catch (error) {
    el("pa-proposal-status").textContent = (error as Error).message;
    el<HTMLInputElement>("pa-proposal").value = state.proposal;
  }
});
for (const [id, proposal] of [
  ["small", "5/4"],
  ["large", "7/5"],
  ["close", "1333333/1000000"],
  ["source", "4/3"],
])
  el(`pa-guess-${id}`).addEventListener("click", () => {
    state.proposal = proposal as string;
    state.depth = 0;
    changed();
  });
el("pa-reject").addEventListener("click", () => {
  const witness = parabolaModel(state).proposalWitness;
  if (witness) {
    state.depth = Math.min(7, witness.depth);
    changed();
  } else
    el("pa-proposal-status").textContent =
      "No finite rejection: 4/3 lies strictly between every pair of finite bounds. The shrinking-gap argument is still needed.";
});
for (const key of ["cut", "arm", "depth"] as const)
  el<HTMLInputElement>(`pa-${key}`).addEventListener("input", (event) => {
    state[key] = Number((event.target as HTMLInputElement).value);
    changed();
  });
for (const view of ["balance", "fill"] as const)
  el(`pa-${view}-view`).addEventListener("click", () => {
    state.view = view;
    changed();
  });
el("pa-find-arm").addEventListener("click", () => {
  state.arm = 100;
  changed();
});
el("pa-end").addEventListener("click", () => {
  state.cut = 0;
  state.arm = 60;
  changed();
});
el("pa-add").addEventListener("click", () => {
  state.depth = Math.min(7, state.depth + 1);
  changed();
});
el("pa-remove").addEventListener("click", () => {
  state.depth = Math.max(0, state.depth - 1);
  changed();
});
el("pa-small-gap").addEventListener("click", () => {
  state.depth = 4;
  changed();
  el("pa-status").textContent =
    "The exact gap is 1/512 of the first triangle, strictly less than 1/100. The finite polygon still does not equal the curved segment.";
});
el("pa-reset").addEventListener("click", () => {
  state = { ...initialParabola };
  changed();
  void loadSource();
});
function read(index: number, scroll = true) {
  state.reading = index;
  draw();
  if (scroll) {
    el("pa-reading").scrollIntoView();
    el<HTMLSelectElement>("pa-reading-select").focus({ preventScroll: true });
  }
}
el("pa-read-step").addEventListener("click", () => read(state.view === "fill" ? 5 : 0));
el("pa-read-warning").addEventListener("click", () => read(3));
el<HTMLSelectElement>("pa-reading-select").addEventListener("change", (event) =>
  read(Number((event.target as HTMLSelectElement).value), false),
);
for (const button of document.querySelectorAll<HTMLButtonElement>("[data-pa-word]"))
  button.addEventListener("click", () => {
    const index = Number(button.dataset.paWord),
      w = parabolaWords[index];
    if (!w) return;
    read(w[4], false);
    el("pa-word-note").innerHTML =
      `<h3 lang="grc">${e(w[0])}</h3><p><i>${e(w[1])}</i> — ${e(w[2])}</p><p>${e(w[3])}</p>`;
    document.querySelectorAll<HTMLButtonElement>("[data-pa-word]").forEach((b) => {
      b.setAttribute("aria-pressed", String(b === button));
    });
  });
async function loadSource() {
  revision++;
  const attempt = ++sourceAttempt,
    index = state.page,
    p = sourceManifest.pages[index];
  if (!p) throw new Error("Missing source page");
  const image = el<HTMLImageElement>("pa-source-image");
  image.hidden = true;
  image.removeAttribute("src");
  el("pa-source-caption").textContent = `Loading ${p.caption}`;
  try {
    const bytes = await parabolaAsset(`sources/${p.file}`);
    if (attempt !== sourceAttempt || index !== state.page) return;
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    sourceUrl = URL.createObjectURL(new Blob([bytes], { type: "image/jpeg" }));
    image.src = sourceUrl;
    image.alt = p.caption;
    image.hidden = false;
    el("pa-source-caption").textContent = `${p.caption} Complete page identity verified.`;
  } catch (error) {
    if (attempt === sourceAttempt && index === state.page)
      el("pa-source-caption").textContent = (error as Error).message;
  }
}
for (const language of ["greek", "latin"] as const)
  el(`pa-${language}-page`).addEventListener("click", () => {
    state.page = parabolaReadings[state.reading]?.[`${language}Page`] ?? 0;
    el<HTMLSelectElement>("pa-page").value = String(state.page);
    void loadSource();
    el("pa-source-frame").scrollIntoView();
  });
el<HTMLSelectElement>("pa-page").addEventListener("change", (event) => {
  state.page = Number((event.target as HTMLSelectElement).value);
  void loadSource();
});
el("pa-source-retry").addEventListener("click", () => {
  void loadSource();
});
for (const [button, frame] of [
  ["pa-enlarge", "pa-frame"],
  ["pa-source-zoom", "pa-source-frame"],
] as const)
  el(button).addEventListener("click", () => {
    const wide = el(frame).classList.toggle("pa-enlarged");
    el(button).setAttribute("aria-pressed", String(wide));
    el(button).textContent = wide
      ? "Fit to page"
      : button === "pa-enlarge"
        ? "Enlarge geometry"
        : "Enlarge page";
    if (wide) el(frame).focus();
  });
function save(
  id: string,
  operation: (s: ParabolaState) => string | Promise<string>,
  name: string,
  type: string,
) {
  const button = el<HTMLButtonElement>(id);
  button.addEventListener("click", async () => {
    const snapshot = structuredClone(state);
    button.disabled = true;
    el("pa-save-status").textContent = "Preparing the experiment selected at your click…";
    try {
      saveText(name, await operation(snapshot), type);
      el("pa-save-status").textContent = `Saved ${name}.`;
    } catch (error) {
      el("pa-save-status").textContent = (error as Error).message;
    } finally {
      button.disabled = false;
    }
  });
}
save("pa-save-json", parabolaJson, "zygon-parabola.json", "application/json");
save("pa-save-csv", parabolaCsv, "zygon-parabola.csv", "text/csv");
save("pa-save-svg", parabolaSvg, "zygon-parabola.svg", "image/svg+xml");
save("pa-save-html", parabolaStudy, "zygon-parabola-reading.html", "text/html");
el("pa-open").addEventListener("change", async () => {
  const input = el<HTMLInputElement>("pa-open"),
    file = input.files?.[0];
  if (!file) return;
  const attempt = ++importAttempt,
    before = revision;
  try {
    if (file.size > 8192) throw new Error("Choose an experiment smaller than 8 KB.");
    const text = await file.text();
    if (attempt !== importAttempt || before !== revision) return;
    state = readParabolaJson(text);
    draw();
    void loadSource();
    el("pa-save-status").textContent = "The exact experiment has been reopened.";
  } catch (error) {
    if (attempt === importAttempt && before === revision)
      el("pa-save-status").textContent = (error as Error).message;
  } finally {
    if (attempt === importAttempt) input.value = "";
  }
});
el("pa-share").addEventListener("click", async () => {
  const url = `${location.origin}${location.pathname}${parabolaQuery(state)}#pa-bench`;
  try {
    await navigator.clipboard.writeText(url);
    el("pa-save-status").textContent =
      "Experiment link copied; the current address stays unchanged.";
  } catch {
    el("pa-share-label").hidden = false;
    const input = el<HTMLInputElement>("pa-share-link");
    input.hidden = false;
    input.value = url;
    input.select();
    el("pa-save-status").textContent = "Copy the complete experiment link below.";
  }
});
addEventListener("popstate", () => {
  try {
    state = readParabolaQuery(location.search);
    draw();
    void loadSource();
  } catch (error) {
    el("pa-status").textContent = (error as Error).message;
  }
});
draw();
void loadSource();
void offlineStatus(el("pa-offline"));
