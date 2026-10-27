import "./style.css";
import { greekHTML, readingAt, readings, sourceOrigin, sourcePaths } from "./content";
import { balanceDrawing, disksDrawing, escapeHTML, profileDrawing, stackDrawing } from "./drawing";
import { decimal, readState, type State, section, stack, stateQuery } from "./model";
import { offlineStatus } from "./offline";
import { saveStudy, saveText, sectionCSV } from "./study";

let state: State = readState(new URLSearchParams(location.search));
let processed = true,
  lineFocus = false,
  fragment = 0;
const phone = matchMedia("(max-width:660px)");
const app = document.querySelector<HTMLDivElement>("#app");
if (!app) throw new Error("The workshop mount is missing.");
app.innerHTML = `
<a class="skip" href="#workshop">Skip to the balance</a>
<div class="page">
  <header class="mast"><a class="wordmark" href="./">ZYGON</a><nav aria-label="Main"><a href="#workshop">The balance</a><a href="./float.html">Floating bodies</a><a href="#reading">The Greek</a><a href="#keep">Keep a study</a></nav></header>
  <main>
    <section class="hero" aria-labelledby="title"><div><p class="eyebrow">Archimedes / The Method, II</p><h1>A sphere on<br>the <em>balance.</em></h1></div><div><p class="intro">A sphere and a cone do not weigh as much as a cylinder. Move their sections to the right place, and they balance it. Every time.</p><p class="entry-note">Find one hanging position that works for every cut.<br>Then read the Greek that makes the move.</p></div></section>
    <section id="workshop" class="workbench focus-target" aria-labelledby="bench-title">
      <div class="section-head"><p class="eyebrow">01 / Make the comparison</p><h2 id="bench-title">Area alone is not enough.</h2></div>
      <div class="bench-layout">
        <div class="visual"><div class="view-controls" role="group" aria-label="Compare sections or finite stacks"><button id="section-view" type="button">One section</button><button id="stack-view" type="button">A finite stack</button></div><div id="balance" class="beam"></div><p class="beam-caption">Α is the fulcrum. Both moved loads hang on the same vertical line. The tilt shows the direction of imbalance.</p><div id="section-geometry" class="geometry"><div id="profile" class="source-profile"></div><div><div id="disks"></div><div class="legend"><span class="sphere-key">Sphere</span><span class="cone-key">Cone</span><span>Cylinder</span></div><p class="small">One plane cuts three solids. The circles above share one scale. Their <strong>areas</strong> act as loads, with equal thickness and density.</p><p class="formula">Sphere: πx(2r − x)<br>Cone: πx²<br>Cylinder: 4πr²</p></div></div><div id="stack-geometry" hidden><div class="geometry"><div id="stack-drawing"></div><div><p class="small">These bands use the section at each midpoint. Each band has real thickness. Their separate volumes are estimates, even when the balance is exact.</p><p class="formula">S + K = 4πr³ for every stack.<br>The individual estimates change with n.</p></div></div><div id="stack-report" class="stack-report"></div></div></div>
        <aside class="controls" aria-label="Balance controls"><div class="control" id="cut-control"><label for="cut">Cut position x <output id="cut-value" for="cut"></output></label><input id="cut" type="range" min="0" max="200" step="1"><div class="limits"><span>Α / 0</span><span>Κ / r</span><span>Γ / 2r</span></div><small>The cylinder's section stays at this position.</small></div><div class="control" id="count-control" hidden><label for="count">Number of bands</label><select id="count">${[1, 2, 4, 8, 16, 32, 64, 128].map((n) => `<option value="${n}">${n} equal bands</option>`).join("")}</select><p class="small">Increase n to reduce each volume error.</p></div><div class="control"><label for="arm">Left hanging distance h <output id="arm-value" for="arm"></output></label><input id="arm" type="range" min="0" max="300" step="1"><div class="limits"><span>at Α / 0</span><span>3r</span></div><small>Move both sphere and cone sections together.</small></div><button id="source-arm" type="button" class="primary">Use Archimedes’ arm: 2r</button><p id="experiment-note" class="trial-note"></p><dl class="moment-pair"><div><dt>Sphere + cone moment</dt><dd id="left-moment"></dd></div><div><dt>Cylinder moment</dt><dd id="right-moment"></dd></div></dl><p id="moment-unit" class="caption"></p><p id="result" class="result" role="status"></p><button id="reset" type="button">Reset the experiment</button></aside>
      </div>
      <details><summary>Why the areas and moments are exact</summary><p>The sphere has radius r, with its axis running from x = 0 at Α to x = 2r at Γ. A perpendicular section has radius squared r² − (x − r)² = x(2r − x). The auxiliary cone has height 2r and base radius 2r, so its section radius equals x. Their areas add to 2πrx. The auxiliary cylinder has section area 4πr². Hanging the pair 2r to the left balances the cylinder section left at x to the right. The factors r and π cancel; no particular ancient unit is assumed.</p><p>Finite stacks use n equal bands of width 2r/n and their midpoint sections. Their sphere estimate is (4/3 + 2/(3n²))πr³; the cone estimate is (8/3 − 2/(3n²))πr³. This is a modern finite approximation, not a physical construction attributed to Archimedes.</p></details>
    </section>
    <section id="whole" class="whole focus-target" aria-labelledby="whole-title"><div class="section-head"><p class="eyebrow">02 / Make the discovery</p><h2 id="whole-title">One sixth of which cylinder?</h2></div><div class="whole-grid"><div><p class="explanation">Keep the cylinder where it is. Its centre of gravity Κ is one radius from Α. Transfer the sphere and cone to Θ, two radii away. The whole cylinder then balances half its volume at twice the distance.</p><p class="formula">S + K = C / 2<br>K = C / 3 &nbsp; (the cone-volume theorem)<br>S = C / 2 − C / 3 = <strong>C / 6</strong></p><div class="ratio-strip" role="img" aria-label="Six equal parts of the auxiliary cylinder: one sphere, two cone parts, three remaining parts"><span>S</span><span>K</span><span>K</span><span></span><span></span><span></span></div><p class="small">One sphere + one auxiliary cone occupy three of the cylinder’s six equal volume shares. The cone alone occupies two.</p><p class="small notes">The cone-volume theorem is an assumption in this argument. Moving the controls does not prove it. Archimedes distinguishes mechanical discovery from geometrical demonstration.</p><button type="button" id="read-discovery">Read the subtraction in Greek</button></div><div><h3>The two cylinders must stay distinct.</h3><div class="wide-table"><table class="stack-table"><caption class="caption">All dimensions use the sphere’s radius r.</caption><thead><tr><th scope="col">Solid</th><th scope="col">Radius</th><th scope="col">Height</th><th scope="col">Volume / πr³</th></tr></thead><tbody><tr><th scope="row">Auxiliary cylinder C</th><td>2r</td><td>2r</td><td>8</td></tr><tr><th scope="row">Auxiliary cone K</th><td>2r</td><td>2r</td><td>8/3</td></tr><tr><th scope="row">Sphere S</th><td>r</td><td>2r</td><td>4/3</td></tr><tr><th scope="row">Enclosing cylinder</th><td>r</td><td>2r</td><td>2</td></tr><tr><th scope="row">Small cone</th><td>r</td><td>r</td><td>1/3</td></tr></tbody></table></div><p class="small">The sphere is <strong>one sixth</strong> of the auxiliary cylinder, <strong>two thirds</strong> of its enclosing cylinder, and <strong>four times</strong> the small cone.</p><details><summary>What finite bands can and cannot establish</summary><p>A finite stack can have exactly cancelling moments while its individual volumes remain wrong. For the sphere, use the smallest and largest section radius in each interval to construct cylinders inside and outside it. The lower and upper sums bound its volume; increasing n squeezes the gap. The stack view shows these exact bounds. A limiting argument can turn this modern construction into a proof. This page does not reproduce Archimedes’ geometrical proof in <em>On the Sphere and Cylinder</em>.</p></details></div></div></section>
    <section id="reading" class="reading-room focus-target" aria-labelledby="reading-title"><div class="section-head"><p class="eyebrow">03 / Read the move</p><h2 id="reading-title">The argument beneath the prayer.</h2></div><p class="explanation">The mathematical text survives in a manuscript reused for a later prayer book. These excerpts follow the openly released Netz–Wilson transcription. Select a passage to locate its lines in the manuscript image.</p><div class="reader-layout"><div class="reader"><div class="reader-controls"><select id="reading-select" aria-label="Greek reading">${readings.map((r, i) => `<option value="${i}">${String(i + 1).padStart(2, "0")} / ${escapeHTML(r.title)}</option>`).join("")}</select><button id="reading-prev" type="button" aria-label="Previous reading">←</button><button id="reading-next" type="button" aria-label="Next reading">→</button></div><p class="eyebrow" id="reading-location"></p><h3 id="reading-heading"></h3><div id="greek" class="greek" lang="grc"></div><p id="english" class="translation"></p><details id="latin-details"><summary>Read a Latin study rendering</summary><p class="caption">New Latin for this workshop (2026). A reading aid, not an ancient witness or Heiberg’s translation.</p><p id="latin" class="latin" lang="la"></p></details><p id="word" class="word"></p><p id="gloss" class="small"></p><p id="grammar" class="grammar"></p><p id="reading-note" class="reading-note"></p><p class="legend-note"><span class="supplied">⟨red brackets⟩</span>: supplied letters. <span class="unclear">Dotted underline</span>: uncertain reading. <em>Italic</em>: expanded abbreviation. Accents, spaces and punctuation are editorial. These are selected excerpts, not the complete treatise.</p></div><figure class="manuscript"><div class="image-tools" role="group" aria-label="Manuscript image"><button type="button" id="processed-image">Processed image</button><button type="button" id="visible-image">Visible composite</button><button type="button" id="focus-lines">Focus selected lines</button><button type="button" id="next-fragment" hidden>Next fragment</button><button type="button" id="zoom-image">Enlarge</button></div><div class="image-stage" id="image-stage" tabindex="0" role="region" aria-label="Manuscript image; scroll when enlarged"></div><figcaption><p id="image-caption" class="source-credit"></p><p class="source-credit">The outlined regions use the project’s existing line mappings. They are guides to a difficult reading, not new recognition. Images retain their full frame and calibration strips.</p><div class="source-controls"><a id="source-link" href="${sourceOrigin}">Original image files</a><a id="xml-link" href="${sourceOrigin}">Mapped transcription</a></div><p class="source-credit">Archimedes Palimpsest Digital Release; owner of the manuscript, Reviel Netz, Nigel Wilson; Bill Christens-Barry, Roger Easton, Keith Knox and the project’s imaging and encoding team. CC BY 3.0. Hosted by the University of Pennsylvania Libraries. No endorsement implied.</p></figcaption></figure></div></section>
    <section id="keep" class="save-room focus-target" aria-labelledby="keep-title"><p class="eyebrow">04 / Keep the evidence</p><h2 id="keep-title">Take the experiment with you.</h2><p>Save your chosen balance and all ten Greek readings, new English and Latin, mapped manuscript images, exact volume comparisons and source notices in one illustrated, script-free HTML file. Open it from disk or print it to PDF.</p><div class="export-row"><button id="save-study" type="button" class="primary">Save illustrated study</button><button id="save-svg" type="button">Save balance SVG</button><button id="save-csv" type="button">Save section table CSV</button><button id="share" type="button">Share experiment + reading</button></div><p id="save-status" class="status" role="status"></p><label class="small" for="share-url" id="share-label" hidden>Copy this experiment and reading URL</label><input id="share-url" type="url" readonly hidden><p id="offline" class="status" role="status">Checking offline availability…</p></section>
  </main><footer class="footer"><span>Zygon / ζυγόν<br>Archimedes’ <em>Method</em>, proposition II</span><span><a href="https://github.com/antonsoo/zygon">Source & model</a> · <a href="${import.meta.env.BASE_URL}sources/NOTICES.txt">Credits & licenses</a><br>Code and new diagrams MIT. Source adaptations and teaching text CC BY 3.0.</span></footer>
</div>`;

const el = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const text = (id: string, content: string) => {
  el(id).textContent = content;
};
const input = (id: string) => el<HTMLInputElement>(id);
const select = (id: string) => el<HTMLSelectElement>(id);
function updateImage() {
  const e = readingAt(state.reading).evidence,
    groups = [...new Set(e.lines.map((line) => line.id.replace(/_\d+$/, "")))],
    lines = lineFocus
      ? e.lines.filter((line) => line.id.startsWith(`${groups[fragment % groups.length]}_`))
      : e.lines;
  const minX = Math.min(...lines.map((l) => l.ulx)),
    minY = Math.min(...lines.map((l) => l.uly));
  const maxX = Math.max(...lines.map((l) => l.lrx)),
    maxY = Math.max(...lines.map((l) => l.lry));
  const box = lineFocus
    ? `${minX - 120} ${minY - 100} ${maxX - minX + 240} ${maxY - minY + 200}`
    : "0 0 8160 10880";
  const file = `sources/${e.folio}-${processed ? "pseudo_no-veil" : "true_pack8"}.jpg`;
  el("image-stage").innerHTML =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${box}" role="img" aria-label="${escapeHTML(e.folio)} manuscript with the selected excerpt's mapped lines"><image href="${import.meta.env.BASE_URL + file}" width="8160" height="10880"/><g>${lines.map((l) => `<rect x="${l.ulx}" y="${l.uly}" width="${l.lrx - l.ulx}" height="${l.lry - l.uly}"/>`).join("")}</g></svg>`;
  el("processed-image").setAttribute("aria-pressed", String(processed));
  el("visible-image").setAttribute("aria-pressed", String(!processed));
  el("focus-lines").setAttribute("aria-pressed", String(lineFocus));
  el("next-fragment").hidden = !lineFocus || groups.length < 2;
  text("next-fragment", `Next fragment (${(fragment % groups.length) + 1}/${groups.length})`);
  text(
    "image-caption",
    `${e.folio} · ${processed ? "processed pseudo_no-veil" : "visible-light true_pack8 composite"} · full frame reduced from the project’s 8160 × 10880 TIFF. ${lines.length} mapped lines in this excerpt.`,
  );
  el<HTMLAnchorElement>("source-link").href = sourceOrigin + sourcePaths[e.folio];
  el<HTMLAnchorElement>("xml-link").href = sourceOrigin + sourcePaths[e.folio] + e.source;
}
function updateReading() {
  fragment = 0;
  const r = readingAt(state.reading);
  select("reading-select").value = String(state.reading);
  text("reading-heading", r.title);
  el("greek").innerHTML = greekHTML(state.reading);
  text("english", r.english);
  text("latin", r.latin);
  text("word", r.word);
  text("gloss", r.gloss);
  text("grammar", r.grammar);
  text("reading-note", r.note);
  const ids = r.evidence.lines.map((l) => l.id.replace(/^zArch\d+[rv]_/, "").replace(/_/g, ":"));
  text("reading-location", `${r.evidence.folio} / ${ids[0]} – ${ids.at(-1)}`);
  el<HTMLButtonElement>("reading-prev").disabled = state.reading === 0;
  el<HTMLButtonElement>("reading-next").disabled = state.reading === readings.length - 1;
  updateImage();
}
function update() {
  const v =
    state.view === "section" ? section(state.cut, state.arm) : stack(state.count, state.arm);
  input("cut").value = String(state.cut);
  input("arm").value = String(state.arm);
  select("count").value = String(state.count);
  text("cut-value", `${decimal(state.cut / 100)}r`);
  text("arm-value", `${decimal(state.arm / 100)}r`);
  el("balance").innerHTML = balanceDrawing(state, phone.matches);
  el("profile").innerHTML = profileDrawing(state);
  el("disks").innerHTML = disksDrawing(state);
  el("section-geometry").hidden = state.view !== "section";
  el("stack-geometry").hidden = state.view !== "stack";
  el("cut-control").hidden = state.view !== "section";
  el("count-control").hidden = state.view !== "stack";
  el("section-view").setAttribute("aria-pressed", String(state.view === "section"));
  el("stack-view").setAttribute("aria-pressed", String(state.view === "stack"));
  const momentUnit = state.view === "section" ? "πr³" : "πr⁴";
  text(
    "moment-unit",
    state.view === "section"
      ? "Area × arm in πr³; common thickness and density suppressed."
      : "Volume × arm in πr⁴; common density suppressed.",
  );
  text("left-moment", `${v.left}${momentUnit}`);
  text("right-moment", `${v.right}${momentUnit}`);
  text(
    "result",
    v.direction === "level"
      ? state.cut === 0 && state.view === "section"
        ? "Both moments vanish at Α. This cut cannot identify the arm."
        : state.view === "section"
          ? "Equal moments. Try moving the cut."
          : "Equal moments. Change n; inspect the separate volume errors."
      : v.direction === "left"
        ? "The pair has the greater turning moment."
        : "The cylinder has the greater turning moment.",
  );
  text(
    "experiment-note",
    state.arm === 200
      ? state.view === "section"
        ? "The fixed arm ΑΘ is now 2r. Move the cutting plane: the balance holds for every position."
        : "The fixed arm ΑΘ is 2r. Changing n keeps the balance while changing the separate volume estimates."
      : state.view === "section"
        ? "Can one hanging distance balance every section? Try a second cut before deciding."
        : "A different number of bands cannot repair the wrong hanging distance. Compare the moments.",
  );
  if (state.view === "stack") {
    const st = stack(state.count, state.arm);
    el("stack-drawing").innerHTML = stackDrawing(state);
    el("stack-report").innerHTML =
      `<div><h3>The balance hides the separate errors.</h3><table class="stack-table"><caption class="caption">Volume coefficients / πr³</caption><thead><tr><th>Solid</th><th>Midpoint stack</th><th>Error</th></tr></thead><tbody><tr><th scope="row">Sphere</th><td>${st.sphere}</td><td>+${st.sphereError}</td></tr><tr><th scope="row">Cone</th><td>${st.cone}</td><td>${st.coneError}</td></tr><tr><th scope="row">Together</th><td>${st.sphere.plus(st.cone)}</td><td>0</td></tr></tbody></table></div><div><h3>Bounds do a different job.</h3><p class="formula">${st.lower} ≤ S / πr³ ≤ ${st.upper}</p><p class="small">Inside and outside cylinders, using the smallest and largest sphere sections in each band. Their gap is ${st.upper.minus(st.lower)}. Increase the number of bands.</p><p class="caption">The exact sphere coefficient is 4/3; these are modern bounds, not a transcription of Archimedes’ geometrical proof.</p></div>`;
  }
}
function commit() {
  const target = `${location.pathname}?${stateQuery(state)}${location.hash}`;
  if (target !== `${location.pathname}${location.search}${location.hash}`)
    history.pushState(null, "", target);
  input("share-url").value = location.href;
}
function change(next: Partial<State>, reading = false) {
  state = { ...state, ...next };
  update();
  if (reading) updateReading();
  commit();
}
for (const [id, key] of [
  ["cut", "cut"],
  ["arm", "arm"],
] as const) {
  input(id).addEventListener("input", () => {
    state = { ...state, [key]: Number(input(id).value) };
    update();
  });
  input(id).addEventListener("change", commit);
}
select("count").addEventListener("change", () => change({ count: Number(select("count").value) }));
el("section-view").addEventListener("click", () => change({ view: "section" }));
el("stack-view").addEventListener("click", () => change({ view: "stack" }));
el("source-arm").addEventListener("click", () => change({ arm: 200 }));
el("reset").addEventListener("click", () =>
  change({ cut: 50, arm: 100, count: 8, view: "section" }),
);
select("reading-select").addEventListener("change", () =>
  change({ reading: Number(select("reading-select").value) }, true),
);
el("reading-prev").addEventListener("click", () =>
  change({ reading: Math.max(0, state.reading - 1) }, true),
);
el("reading-next").addEventListener("click", () =>
  change({ reading: Math.min(readings.length - 1, state.reading + 1) }, true),
);
el("read-discovery").addEventListener("click", () => {
  change({ reading: 7 }, true);
  el("reading").scrollIntoView();
  select("reading-select").focus({ preventScroll: true });
});
el("processed-image").addEventListener("click", () => {
  processed = true;
  updateImage();
});
el("visible-image").addEventListener("click", () => {
  processed = false;
  updateImage();
});
el("focus-lines").addEventListener("click", () => {
  lineFocus = !lineFocus;
  updateImage();
});
el("next-fragment").addEventListener("click", () => {
  fragment++;
  updateImage();
});
el("zoom-image").addEventListener("click", () => {
  const zoom = el("image-stage").classList.toggle("zoom");
  el("zoom-image").setAttribute("aria-pressed", String(zoom));
  text("zoom-image", zoom ? "Fit image" : "Enlarge");
});
el("share").addEventListener("click", () => {
  el("share-label").hidden = false;
  input("share-url").hidden = false;
  input("share-url").value =
    `${location.origin}${location.pathname}?${stateQuery(state)}${location.hash}`;
  input("share-url").focus();
  input("share-url").select();
});
el("save-svg").addEventListener("click", () =>
  saveText("zygon-balance.svg", balanceDrawing(state, phone.matches), "image/svg+xml"),
);
el("save-csv").addEventListener("click", () =>
  saveText("zygon-sections.csv", sectionCSV(state), "text/csv"),
);
el("save-study").addEventListener("click", async () => {
  const button = el<HTMLButtonElement>("save-study"),
    snapshot = { ...state };
  button.disabled = true;
  text("save-status", "Collecting and checking the illustrated study…");
  try {
    await saveStudy(snapshot);
    text(
      "save-status",
      "Study saved. Open the HTML file from disk; use its print command for PDF.",
    );
  } catch {
    text(
      "save-status",
      "The complete study could not be verified. Reconnect and try again; no incomplete reading was saved.",
    );
  } finally {
    button.disabled = false;
  }
});
window.addEventListener("popstate", () => {
  state = readState(new URLSearchParams(location.search));
  update();
  updateReading();
});
phone.addEventListener("change", update);
update();
updateReading();
void offlineStatus(el("offline"));
