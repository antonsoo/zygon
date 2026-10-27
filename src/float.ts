import "./style.css";
import "./float.css";
import { escapeHTML as e } from "./drawing";
import { floatGreek, floatReadings, floatWords } from "./float-content";
import { floatCurve, floatDrawing, floatSVG, fn, forceDrawing } from "./float-drawing";
import { base64, floatAsset, floatSourcePages, floatStudy, floatTable } from "./float-files";
import {
  FLOAT_DEFAULT,
  FLOAT_SCOPE,
  type FloatState,
  floatCSV,
  floatModel,
  floatQuery,
  floatRecord,
  importFloat,
  readFloat,
} from "./float-model";
import { offlineStatus } from "./offline";

const el = <T extends HTMLElement = HTMLElement>(id: string): T => {
  const node = document.getElementById(id);
  if (!node) throw new Error(`Missing ${id}`);
  return node as T;
};
const phone = matchMedia("(max-width:700px)");
const initial = readFloat(location.search);
let state = initial.state,
  source = "Arch07v",
  sourceRevision = 0,
  focused = false,
  word = 0;
el("app").innerHTML =
  `<a class="skip" href="#fl-bench">Skip to the floating experiment</a><div class="page fl-page">
<header class="mast"><a class="wordmark" href="./">ZYGON</a><nav aria-label="Main"><a href="./">The balance</a><a href="./float.html" aria-current="page">Floating bodies</a><a href="#fl-reading">Greek & Latin</a></nav></header>
<main><section class="fl-hero"><div><p class="eyebrow">Archimedes / On Floating Bodies, II</p><h1>It floats.<br>Will it stay <em>upright?</em></h1></div><div><p class="intro">Equal weight and buoyancy keep a solid afloat. They do not always keep it upright. Give this paraboloid a small tilt, and ask which way the two forces turn it.</p><p class="fl-caption">A solid shape, not a hollow boat. Modern coordinates beside Greek manuscript evidence and an incomplete Latin witness.</p></div></section>
<p id="fl-invalid" class="fl-limit" role="status" ${initial.invalid ? "" : "hidden"}>Invalid or repeated settings. The complete starting experiment has been restored.</p>
<section id="fl-bench" class="fl-bench" aria-labelledby="fl-title"><p class="eyebrow">01 / Equal forces. Different lines.</p><h2 id="fl-title">Does this tilt correct itself?</h2><div class="fl-layout"><div class="fl-visual"><figure><div id="fl-drawing"></div><figcaption class="fl-caption"><strong>G</strong>: whole solid’s centre of gravity. <strong>B</strong>: displaced liquid’s centre of volume. Upward buoyancy and downward weight have equal magnitudes. Their drawn lengths are schematic; their lines of action are calculated.</figcaption></figure><div id="fl-gap" class="fl-gap"></div><p class="fl-caption">The overview keeps equal horizontal and vertical units. The separate microscope enlarges only the horizontal gap.</p></div>
<aside class="fl-controls" aria-label="Floating body controls"><div class="fl-presets"><button id="fl-broad" type="button">Broad solid</button><button id="fl-light" type="button">Tall, light solid</button><button id="fl-dense" type="button">Same shape, denser</button></div>
<div class="control"><label for="fl-angle">Tilt right <output id="fl-angle-value" for="fl-angle"></output></label><input id="fl-angle" type="range" min="-60" max="60" step="0.1"><small>Negative angles tilt left. Move a little to either side of a balanced position.</small><div class="fl-actions"><button id="fl-upright" type="button">Stand upright</button><button id="fl-nudge" type="button">Tilt 5° farther right</button></div></div>
<div class="control"><label for="fl-height">Axis length a <output id="fl-height-value" for="fl-height"></output></label><input id="fl-height" type="range" min="0.5" max="2.5" step="0.01"><small>Cut the same paraboloid at z = a. Its base radius is √a. One length unit is shared by both axes.</small></div>
<div class="control"><label for="fl-density">Solid density <output id="fl-density-value" for="fl-density"></output></label><input id="fl-density" type="range" min="4" max="90" step="0.01"><small>Percentage of the liquid’s density. This is an equal-volume comparison.</small></div>
<div class="fl-actions"><button id="fl-equilibrium" class="primary" type="button">Find the balanced tilt</button><button id="fl-critical" type="button">Use critical density</button></div><p id="fl-equilibrium-note" class="fl-caption"></p><div id="fl-result" class="fl-result" role="status" aria-live="polite"></div></aside></div></section>
<section class="fl-section" aria-labelledby="fl-response-title"><p class="eyebrow">02 / Balance is a position. Stability is a response.</p><h2 id="fl-response-title">Try both sides of zero.</h2><div class="fl-explanation"><div><div id="fl-curve" class="fl-curve"></div><p class="fl-caption">The curve shows turning direction for a sequence of separately balanced water levels. It is not a path through time. Right tilt is positive; a positive turning tendency increases it.</p><p id="fl-stability"></p><p id="fl-contact" class="fl-limit"></p></div><div><p>Start with the tall, light solid at <strong>0°</strong>. The forces share one line: it is balanced. Nudge it right. Its buoyancy line moves to the left of its weight line, so the turn carries it farther right.</p><p>Now find the nonzero balanced tilt. A little below it, the turn increases the angle; a little above it, the turn decreases the angle. This dry-base oblique position is stable within the model.</p><p>Keep the shape and make the solid denser. More of it must be submerged. Its displaced-volume centre rises, and upright becomes stable.</p><details><summary>The source’s two guarantees</summary><p>In II.2 the axis is no greater than one and a half times a parabola parameter. Our z = x² convention makes that parameter 1/2, so a ≤ 3/4 guarantees an upright return for the permitted densities and dry-base tilts.</p><p>For a taller solid, II.4 adds a density condition: σ ≥ ((a − 3/4)/a)². “No smaller” includes equality. At equality the linear stiffness is zero, but the finite-angle term still restores a dry-base tilt. The workshop’s formulas use modern coordinates; they do not reproduce Archimedes’ geometrical proof.</p><button type="button" id="fl-read-density">Read the density condition</button></details></div></div><details class="fl-prompt"><summary>Check your reading: which end must stay dry?</summary><label for="fl-check">The source’s βάσις is <select id="fl-check"><option value="">Choose an end</option><option value="point">the pointed vertex</option><option value="circle">the broad flat circular cut</option><option value="all">the whole curved surface</option></select></label><p id="fl-feedback" role="status"></p></details><div id="fl-table" class="fl-table"></div><details><summary>Coordinates, assumptions and the limit of the experiment</summary><p>${e(FLOAT_SCOPE)}</p><p>The solid is x² + y² ≤ z ≤ a. For relative density σ, let d = a√σ and b = tan θ. The candidate water plane is z = bx + d − b²/4. The displaced cap’s centre is (b/2, 0, 2d/3 + b²/4); the whole solid’s centre is (0, 0, 2a/3). Rotate both points into the world to compare their vertical force lines.</p><p class="fl-formula">Bₓ − Gₓ = sin θ [1/2 − 2(a − d)/3 + tan² θ/4]</p><p>The displaced cap fits wholly below the base only if (|b|/2 + √d)² &lt; a. At contact or beyond, force and displaced-volume results are withheld. The waterline then shows only the rejected candidate plane. The base-crossing case, surface tension, waves, drag, angular acceleration, real materials and physical stability measurements are outside this experiment.</p></details></section>
<section id="fl-reading" class="fl-section" aria-labelledby="fl-reading-title"><p class="eyebrow">03 / Read the conditions, not just the conclusion.</p><h2 id="fl-reading-title">“Does not touch” does real work.</h2><p class="fl-caption">Greek: the released Netz–Wilson palimpsest transcription. Latin: the text printed in Heiberg’s 1881 edition, before the palimpsest was available. New English is a teaching translation.</p><div class="fl-reader"><div class="fl-read"><label for="fl-reading-select">Selected passage</label><select id="fl-reading-select">${floatReadings.map((r, i) => `<option value="${i}">${i + 1} / ${e(r.title)}</option>`).join("")}</select><p class="eyebrow" id="fl-reference"></p><h3 id="fl-reading-heading"></h3><div id="fl-greek" class="greek" lang="grc"></div><p id="fl-english"></p><details><summary>Compare the Latin witness</summary><p id="fl-latin-credit" class="fl-caption"></p><p id="fl-latin" lang="la"></p></details><p id="fl-reading-note" class="fl-caption"></p><p class="fl-caption"><span class="supplied">⟨Red brackets⟩</span>: supplied letters. <span class="unclear">Dotted underline</span>: uncertain. <em>Italics</em>: expanded abbreviation. <span class="fl-sic">Wavy underline</span>: marked sic. Editorial signs are retained; no new decipherment is claimed.</p><div id="fl-words" class="fl-words" role="group" aria-label="Words in this passage"></div><p id="fl-word" class="fl-word" role="status"></p></div>
<div class="fl-images"><label for="fl-source-select">Complete source frame or printed page</label><select id="fl-source-select">${floatSourcePages.map((page) => `<option value="${page.id}">${e(page.caption)}</option>`).join("")}</select><div class="fl-source-tools"><button id="fl-show-greek" type="button">Locate this Greek</button><button id="fl-show-latin" type="button">Show the Latin witness</button><button id="fl-focus" type="button" aria-pressed="false">Focus Greek lines</button><button id="fl-zoom" type="button" aria-pressed="false">Enlarge</button></div><div id="fl-source-frame" class="fl-source-frame" tabindex="0" role="region" aria-label="Source image; arrow keys scroll when enlarged"></div><p id="fl-source-status" class="fl-caption" role="status"></p><p class="fl-caption">Manuscript imaging: Bill Christens-Barry, Roger Easton, Keith Knox; Archimedes Palimpsest Digital Release, CC BY 3.0. The full frames and original metadata are retained. Latin pages are public domain.</p><a href="https://archimedespalimpsest.net/">Archimedes Palimpsest Digital Release</a> · <a href="https://archive.org/details/archimedisopera04eutogoog/page/n418/mode/2up">1881 printed volume</a></div></div></section>
<section id="fl-keep" class="fl-section fl-keep" aria-labelledby="fl-keep-title"><p class="eyebrow">04 / Retain a measured reading.</p><h2 id="fl-keep-title">Keep the forces and the conditions.</h2><p>Save the current experiment, all six readings, sixteen word notes, seven full source images, transcriptions, fonts and licenses in one script-free HTML. Reopen it from disk, use its native downloads, or print it.</p><div class="export-row"><button id="fl-save-study" type="button" class="primary">Save illustrated reading</button><button id="fl-save-json" type="button">Save editable JSON</button><button id="fl-save-csv" type="button">Save turning CSV</button><button id="fl-save-svg" type="button">Save drawn SVG</button><button id="fl-share" type="button">Copy experiment link</button></div><label for="fl-import">Reopen an editable experiment</label><input id="fl-import" type="file" accept="application/json,.json"><p id="fl-save-status" role="status" class="status"></p><label id="fl-share-label" for="fl-share-url" hidden>Experiment link</label><input id="fl-share-url" class="fl-share" type="url" readonly hidden><p id="fl-offline" class="status" role="status">Checking the complete offline edition…</p></section>
</main><footer class="fl-foot"><span>Zygon / Archimedes’ mechanics<br>Static forces and manuscript conditions.</span><span><a href="https://github.com/antonsoo/zygon">Source and model</a> · <a href="./sources/float-NOTICES.txt">Credits & licenses</a><br>Code and diagrams MIT; source adaptations and teaching text CC BY 3.0.</span></footer></div>`;

function status(title: string, message: string) {
  el("fl-result").innerHTML = `<h3>${e(title)}</h3><p>${e(message)}</p>`;
}
function render() {
  const m = floatModel(state);
  for (const key of ["angle", "height", "density"] as const) {
    el<HTMLInputElement>(`fl-${key}`).value = String(state[key]);
    el(`fl-${key}-value`).textContent =
      `${fn(state[key], key === "angle" ? 7 : 5)}${key === "angle" ? "°" : key === "density" ? "%" : ""}`;
  }
  el("fl-drawing").innerHTML = floatDrawing(state, phone.matches);
  el("fl-gap").innerHTML = forceDrawing(state, phone.matches);
  el("fl-curve").innerHTML = floatCurve(state, phone.matches);
  el("fl-table").innerHTML = floatTable(state);
  const equilibrium = el<HTMLButtonElement>("fl-equilibrium");
  equilibrium.disabled = m.obliqueAngle === null || !m.obliqueDry;
  el<HTMLButtonElement>("fl-critical").disabled =
    m.criticalDensity === null || m.criticalDensity < 4;
  el("fl-equilibrium-note").textContent =
    m.obliqueAngle === null
      ? "There is no separate nonzero balanced tilt for this shape and density."
      : m.obliqueDry
        ? `Dry-base balanced tilts: ±${fn(m.obliqueAngle, 7)}°. Test a little on either side.`
        : `The candidate ±${fn(m.obliqueAngle, 7)}° does not keep the complete submerged cap below the base. This model cannot certify it.`;
  el("fl-stability").textContent =
    m.stable === "critical"
      ? "Upright: zero linear restoring stiffness. Finite nonzero dry-base tilts still turn back toward upright; this is not neutral at every angle."
      : m.stable === "stable"
        ? "Upright is stable in this model: a sufficiently small tilt produces a turn back toward it."
        : "Upright is balanced but unstable: a sufficiently small tilt produces a turn farther away.";
  el("fl-contact").textContent =
    `The dry-base interval ends at ±${fn(m.contactAngle, 5)}°. At that boundary the liquid touches the broad circular base. Beyond it, the displaced-cap formulas do not apply.`;
  if (!m.dry)
    status(
      m.touching ? "The base touches the liquid." : "This tilt leaves the dry-base case.",
      "The shown waterline is only the rejected candidate. Displaced volume, buoyancy and turning direction are not calculated. Reduce the tilt or change the shape or density.",
    );
  else if (m.turning === "balanced")
    status(
      state.angle === 0 ? "Balanced upright." : "Balanced at an oblique angle.",
      state.angle === 0
        ? m.stable === "unstable"
          ? "Equal forces share one line. Give it a small tilt: this balanced position is unstable."
          : m.stable === "critical"
            ? "The linear term is zero. A finite dry-base tilt still gives a restoring turn."
            : "A sufficiently small tilt either way produces a restoring turn."
        : "The vertical force lines coincide. Try an angle just below and just above this one to inspect its response.",
    );
  else
    status(
      `The forces turn it ${m.turning}.`,
      `${Math.sign(state.angle) * (m.lever ?? 0) > 0 ? "This tilt turns back toward upright." : "This tilt turns farther from upright."} Weight equals buoyancy, but the force lines are ${fn(Math.abs(m.lever ?? 0), 7)} length units apart.`,
    );
  if (!el<HTMLInputElement>("fl-share-url").hidden)
    el<HTMLInputElement>("fl-share-url").value = shareURL();
}
function change(patch: Partial<FloatState>) {
  state = { ...state, ...patch };
  el("fl-invalid").hidden = true;
  render();
}
function renderWord() {
  const w = floatWords[word];
  if (w)
    el("fl-word").innerHTML = `<strong lang="grc">${e(w[0])}</strong> — ${e(w[1])}. ${e(w[2])}`;
}
function reading() {
  const r = floatReadings[state.reading];
  if (!r) return;
  el<HTMLSelectElement>("fl-reading-select").value = String(state.reading);
  el("fl-reference").textContent = `${r.reference} / ${r.evidence.folio}`;
  el("fl-reading-heading").textContent = r.title;
  el("fl-greek").innerHTML = floatGreek(state.reading);
  el("fl-english").textContent = r.english;
  el("fl-latin").lang = r.latin ? "la" : "en";
  el("fl-latin").textContent =
    r.latin ?? "No corresponding passage survives in this retained Latin witness.";
  el("fl-latin-credit").textContent =
    state.reading === 5
      ? "Printed pp. 379–380. The body text omits the denominator; p. 380 supplies it in a footnote."
      : state.reading === 4
        ? "Printed p. 377: the Latin proof stops after the tangent construction. No Latin is supplied here."
        : `Printed p. ${r.latinPage}${state.reading === 2 ? "; sentence begins on p. 376" : ""}. Latin spelling follows the 1881 body text.`;
  el("fl-reading-note").textContent = r.note;
  el("fl-words").innerHTML = floatWords
    .flatMap((w, i) =>
      w[3] === state.reading
        ? [`<button type="button" data-float-word="${i}" lang="grc">${e(w[0])}</button>`]
        : [],
    )
    .join("");
  word = Math.max(
    0,
    floatWords.findIndex((w) => w[3] === state.reading),
  );
  renderWord();
}
async function showSource() {
  const revision = ++sourceRevision,
    page = floatSourcePages.find((p) => p.id === source);
  if (!page) return;
  el<HTMLSelectElement>("fl-source-select").value = source;
  el("fl-source-frame").replaceChildren();
  el("fl-source-status").textContent = "Loading and checking source identity…";
  const selectedReading = state.reading,
    selectionFocus = focused;
  try {
    const bytes = await floatAsset(`sources/${page.file}`);
    if (revision !== sourceRevision) return;
    const data = `data:image/jpeg;base64,${base64(bytes)}`;
    const r = floatReadings[selectedReading];
    if (source.startsWith("latin"))
      el("fl-source-frame").innerHTML = `<img src="${data}" alt="${e(page.caption)}">`;
    else {
      const lines = r?.evidence.folio === source ? r.evidence.lines : [];
      const bounds =
        selectionFocus && lines.length
          ? [
              Math.min(...lines.map((l) => l.ulx)) - 100,
              Math.min(...lines.map((l) => l.uly)) - 80,
              Math.max(...lines.map((l) => l.lrx)) - Math.min(...lines.map((l) => l.ulx)) + 200,
              Math.max(...lines.map((l) => l.lry)) - Math.min(...lines.map((l) => l.uly)) + 160,
            ]
          : [0, 0, 8160, 10880];
      el("fl-source-frame").innerHTML =
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${bounds.join(" ")}" role="img" aria-label="${e(page.caption)}"><image href="${data}" width="8160" height="10880"/>${lines.map((l) => `<rect x="${l.ulx}" y="${l.uly}" width="${l.lrx - l.ulx}" height="${l.lry - l.uly}"/>`).join("")}</svg>`;
    }
    el("fl-source-status").textContent =
      `${page.caption}. Image identity checked.${selectionFocus && r?.evidence.folio === source ? " Crop follows the project's published line coordinates." : ""}`;
  } catch (error) {
    if (revision === sourceRevision)
      el("fl-source-status").textContent =
        `Source unavailable. ${error instanceof Error ? error.message : "Retry by selecting the page again."}`;
  }
}
function shareURL() {
  const url = new URL(location.href);
  url.search = floatQuery(state);
  url.hash = "fl-bench";
  return url.href;
}
function save(name: string, content: string, mime: string) {
  const url = URL.createObjectURL(new Blob([content], { type: mime })),
    a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
for (const key of ["angle", "height", "density"] as const)
  el<HTMLInputElement>(`fl-${key}`).addEventListener("input", (event) =>
    change({ [key]: Number((event.target as HTMLInputElement).value) }),
  );
el("fl-broad").addEventListener("click", () => change({ height: 0.5, density: 16, angle: 10 }));
el("fl-light").addEventListener("click", () =>
  change({ ...FLOAT_DEFAULT, reading: state.reading }),
);
el("fl-dense").addEventListener("click", () => change({ density: 64 }));
el("fl-upright").addEventListener("click", () => change({ angle: 0 }));
el("fl-nudge").addEventListener("click", () => change({ angle: Math.min(60, state.angle + 5) }));
el("fl-equilibrium").addEventListener("click", () => {
  const m = floatModel(state);
  if (m.obliqueAngle !== null && m.obliqueDry) change({ angle: m.obliqueAngle });
});
el("fl-critical").addEventListener("click", () => {
  const m = floatModel(state);
  if (m.criticalDensity !== null && m.criticalDensity >= 4) change({ density: m.criticalDensity });
});
el("fl-read-density").addEventListener("click", () => {
  change({ reading: 5 });
  reading();
  source = "Arch08v";
  void showSource();
  el("fl-reading-title").scrollIntoView({ block: "start" });
});
el<HTMLSelectElement>("fl-check").addEventListener("change", (event) => {
  const value = (event.target as HTMLSelectElement).value;
  el("fl-feedback").textContent =
    value === "circle"
      ? "Yes. The broad circular cut must stay out of the liquid. The pointed vertex is submerged in this case."
      : value
        ? "Read βάσιν beside the drawing: it names the broad flat circular cut. The pointed vertex lies in the liquid."
        : "";
});
el<HTMLSelectElement>("fl-reading-select").addEventListener("change", (event) => {
  change({ reading: Number((event.target as HTMLSelectElement).value) });
  reading();
  source = floatReadings[state.reading]?.evidence.folio ?? "Arch07v";
  void showSource();
});
el("fl-words").addEventListener("click", (event) => {
  const target = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-float-word]");
  if (target) {
    word = Number(target.dataset.floatWord);
    renderWord();
  }
});
el<HTMLSelectElement>("fl-source-select").addEventListener("change", (event) => {
  source = (event.target as HTMLSelectElement).value;
  void showSource();
});
el("fl-show-greek").addEventListener("click", () => {
  source = floatReadings[state.reading]?.evidence.folio ?? "Arch07v";
  void showSource();
});
el("fl-show-latin").addEventListener("click", () => {
  source = `latin-${floatReadings[state.reading]?.latinPage ?? 376}`;
  void showSource();
});
el("fl-focus").addEventListener("click", () => {
  focused = !focused;
  source = floatReadings[state.reading]?.evidence.folio ?? "Arch07v";
  el("fl-focus").setAttribute("aria-pressed", String(focused));
  void showSource();
});
el("fl-zoom").addEventListener("click", () => {
  const frame = el("fl-source-frame"),
    zoom = frame.dataset.zoom !== "true";
  frame.dataset.zoom = String(zoom);
  el("fl-zoom").setAttribute("aria-pressed", String(zoom));
  if (zoom) frame.focus();
});
el("fl-share").addEventListener("click", () => {
  const field = el<HTMLInputElement>("fl-share-url");
  field.value = shareURL();
  field.hidden = false;
  el("fl-share-label").hidden = false;
  void navigator.clipboard
    ?.writeText(field.value)
    .then(() => (el("fl-save-status").textContent = "Experiment link copied."))
    .catch(
      () => (el("fl-save-status").textContent = "Copy the experiment link from the field below."),
    );
});
el("fl-save-json").addEventListener("click", () =>
  save("zygon-floating.json", floatRecord({ ...state }), "application/json"),
);
el("fl-save-csv").addEventListener("click", () =>
  save("zygon-floating.csv", floatCSV({ ...state }), "text/csv"),
);
for (const [id, action] of [
  [
    "fl-save-study",
    async (s: FloatState) => save("zygon-floating.html", await floatStudy(s), "text/html"),
  ],
  [
    "fl-save-svg",
    async (s: FloatState) =>
      save(
        "zygon-floating.svg",
        floatSVG(
          s,
          `data:font/woff2;base64,${base64(await floatAsset("fonts/IBMPlexSans-Regular.woff2"))}`,
        ),
        "image/svg+xml",
      ),
  ],
] as const)
  el<HTMLButtonElement>(id).addEventListener("click", async () => {
    const button = el<HTMLButtonElement>(id),
      snapshot = { ...state };
    button.disabled = true;
    el("fl-save-status").textContent = "Preparing and checking retained assets…";
    try {
      await action(snapshot);
      el("fl-save-status").textContent = "Saved the experiment selected when the action began.";
    } catch (error) {
      el("fl-save-status").textContent =
        `Nothing saved. ${error instanceof Error ? error.message : "Source unavailable."}`;
    } finally {
      button.disabled = false;
    }
  });
el<HTMLInputElement>("fl-import").addEventListener("change", async (event) => {
  const input = event.target as HTMLInputElement,
    file = input.files?.[0];
  if (!file) return;
  try {
    if (file.size > 12000) throw new Error("Choose the small editable experiment JSON.");
    state = importFloat(await file.text());
    render();
    reading();
    source = floatReadings[state.reading]?.evidence.folio ?? "Arch07v";
    void showSource();
    el("fl-save-status").textContent = "Editable experiment restored.";
  } catch (error) {
    el("fl-save-status").textContent =
      error instanceof Error ? error.message : "Invalid record; current experiment kept.";
  } finally {
    input.value = "";
  }
});
window.addEventListener("popstate", () => {
  state = readFloat(location.search).state;
  render();
  reading();
  source = floatReadings[state.reading]?.evidence.folio ?? "Arch07v";
  void showSource();
});
phone.addEventListener("change", render);
render();
reading();
source = floatReadings[state.reading]?.evidence.folio ?? "Arch07v";
void showSource();
void offlineStatus(el("fl-offline"));
