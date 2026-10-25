import { escapeHTML } from "./drawing";
import evidence from "./readings.json";

export const readings = [
  {
    title: "A discovery is not yet a proof",
    english:
      "This has not been proved by what has now been said, but it has given some indication that the conclusion is true.",
    latin:
      "Ex iis quae nunc dicta sunt hoc nondum demonstratum est; indicium tamen quoddam datum est conclusionem veram esse.",
    word: "οὐκ ἀποδέδεικται",
    gloss: "has not been demonstrated · nondum demonstratum est",
    grammar:
      "ἀποδέδεικται is perfect passive: a demonstration has not been established. The negative οὐκ denies the completed proof, not the usefulness of the discovery.",
    note: "This passage closes the parabola argument before the sphere investigation. In the digital transcription it follows the milestone numbered 2; those divisions follow an edition and are not a new statement that the sphere has already been proved. The letter's introduction also distinguishes mechanical investigation from geometrical demonstration.",
  },
  {
    title: "The number that disagrees",
    english:
      "That every sphere is twice the cone whose base equals a greatest circle in the sphere and whose height equals the sphere's radius, …",
    latin:
      "Omnem sphaeram duplam esse coni cuius basis maximo circulo in sphaera aequalis est, altitudo autem radio sphaerae aequalis, …",
    word: "διπλασία",
    gloss: "twice as great · dupla",
    grammar:
      "διπλασία agrees with σφαῖρα, a feminine noun. The cone is expressed in the genitive, τοῦ κώνου: twice the cone. ἡ ἐκ τοῦ κέντρου, literally 'the [line] from the centre', means radius.",
    note: "The released Netz–Wilson transcription reads διπλασία, 'twice', here; the project's reconstruction of Heiberg's manuscript reading does too. Later in the same argument the transcription reads τετραπλασίων, 'four times'. The workshop keeps the former word rather than silently correcting it. Its geometry and the later conclusion give four times the small cone. This comparison concerns the released readings; it is not a fresh decipherment or a claim about which hand introduced the discrepancy.",
  },
  {
    title: "Imagine the balance",
    english:
      "Let ΓΑ be extended, and let ΑΘ be laid off equal to it; imagine ΓΘ as a balance, with Α at its midpoint, …",
    latin:
      "Producatur ΓΑ, et ponatur ΑΘ ipsi aequalis; intellegatur ΓΘ esse libra, cuius medium sit Α, …",
    word: "νοείσθω ὁ ζυγός",
    gloss: "let the balance be conceived · intellegatur libra",
    grammar:
      "νοείσθω is a third-person imperative: 'let it be imagined'. ζυγός here is a balance beam; the project's name, Zygon, recalls the related Greek family of words for a yoke or balance.",
    note: "ΓΑ is the sphere's diameter, so the fixed left arm ΑΘ is 2r. The fulcrum is at the end Α of the sphere, not its centre Κ. Our small Greek labels follow this transcription: Θ is theta, not the Latin H that appears in some English redrawings.",
  },
  {
    title: "Raise a cutting plane",
    english: "And from the straight line ΜΝ let a plane be raised perpendicular to ΑΓ.",
    latin: "Ex recta ΜΝ planum erigatur ad ΑΓ perpendiculare.",
    word: "ἐπίπεδον … ὀρθόν",
    gloss: "a perpendicular plane · planum perpendiculare",
    grammar:
      "ἀνεστάτω is another construction imperative, 'let it be raised'. ὀρθόν agrees with the neuter ἐπίπεδον. Here it describes the plane's relation to the axis, not the shape of the circle.",
    note: "The same plane cuts all three solids. The cylinder's circular section is constant, the cone's radius grows with x, and the sphere's radius first grows and then shrinks. Circular areas, not their diameters, become the comparable loads. The source uses geometrical ratios; x, r, π and our decimal controls are modern notation.",
  },
  {
    title: "The inverse ratio",
    english:
      "Thus, as ΘΑ is to ΑΣ, so is the circle in the cylinder to the circles in the sphere and in the cone.",
    latin: "Ut igitur ΘΑ ad ΑΣ, ita circulus in cylindro ad circulos in sphaera et in cono.",
    word: "ὡς … οὕτως",
    gloss: "as … so … · ut … ita …",
    grammar:
      "This paired construction states a proportion. πρὸς means 'to' in a ratio. The plural circles on the right are taken together: one from the sphere and one from the cone.",
    note: "The cylinder section is larger, so it needs the shorter arm. Its area divided by the combined sphere-and-cone area is 2r/x. Inverting that relation gives the lever condition: the pair's area times 2r equals the cylinder's area times x. At x = 0 both moments vanish; there is no meaningful area ratio to divide there.",
  },
  {
    title: "Move the two circles",
    english:
      "When they have been transferred and placed at Θ in such a way that Θ is the centre of gravity of each, they will balance about the point Α.",
    latin:
      "Translati et ad Θ positi, ita ut Θ centrum gravitatis utriusque sit, circa punctum Α aequiponderabunt.",
    word: "μετενεχθεῖσιν",
    gloss: "having been transferred · translatis",
    grammar:
      "The passive participle describes the moved circles. ἑκατέρου means 'of each of the two'; both centres are put at Θ. ἰσορροπήσουσι is future, 'they will balance'. The excerpt begins inside a longer sentence.",
    note: "The cylinder's section stays at its original position Σ. Both other sections are transferred to the same fixed point Θ. Placing them on two neighbouring horizontal hooks would change their moments; the diagram therefore hangs their centres on the same vertical line. Its drawn tilt shows direction only, not a calculated physical angle.",
  },
  {
    title: "From circles to solids",
    english:
      "When the cylinder, sphere and cone have been filled by the circles taken, the cylinder, staying where it is, will balance about Α with the sphere and cone together, transferred and placed on the balance at Θ so that Θ is the centre of gravity of each.",
    latin:
      "Cylindro, sphaera et cono circulis sumptis completis, cylindrus suo loco manens circa Α aequiponderabit sphaerae et cono simul ad Θ translatis et in libra positis, ita ut Θ centrum gravitatis utriusque sit.",
    word: "αὐτοῦ μένων",
    gloss: "remaining where it is · suo loco manens",
    grammar:
      "μένων, 'remaining', contrasts with μετενεχθεῖσι, 'transferred'. The opening συμπληρωθέντος is a passive participle: 'when it has been filled'. κέντρον τοῦ βάρους is literally the centre of weight.",
    note: "This is the crucial mechanical passage from sections to whole solids. Our finite bands have actual thickness and use midpoint radii; they are a modern illustration, not literal zero-thickness circles and not Archimedes' geometrical proof. Their separate sphere and cone estimates retain visible, opposite errors even while their total moments cancel exactly.",
  },
  {
    title: "Subtract the cone",
    english:
      "ΘΑ is twice ΑΚ; therefore the cylinder is twice the sphere and cone together. It is also three times the cone itself.",
    latin:
      "ΘΑ dupla est ΑΚ; cylindrus igitur duplus est sphaerae et coni simul. Idem cylindrus ipsius coni triplus est.",
    word: "συναμφοτέρου",
    gloss: "of both together · utriusque simul",
    grammar:
      "συναμφοτέρου keeps the two magnitudes together. διπλάσιον and τριπλασίων give different comparisons: twice the pair, three times the cone. The ratios are about volumes at the common density.",
    note: "For the large auxiliary cylinder C, the balance gives S + K = C/2. The cone-volume theorem supplies K = C/3. Subtracting leaves S = C/6. The cone theorem is an input, not something newly established by moving this slider. The original cylinder's centre of gravity is Κ, one radius from Α.",
  },
  {
    title: "Four times the small cone",
    english:
      "The sphere whose greatest circle is ΑΒΓΔ is therefore four times the cone whose vertex is Α and whose base is the circle on diameter ΒΔ, perpendicular to ΑΓ.",
    latin:
      "Sphaera igitur cuius maximus circulus est ΑΒΓΔ quadrupla est coni cuius vertex est Α, basis autem circulus diametro ΒΔ descriptus, ad ΑΓ perpendicularis.",
    word: "τετραπλασίων",
    gloss: "four times as great · quadrupla",
    grammar:
      "τετρα- supplies 'four'. The Greek comparative form here accompanies ἡ σφαῖρα. The later τετραπλασία in the next selection makes the same fourfold comparison.",
    note: "This is the small cone of radius r and height r, not the auxiliary cone of radius 2r and height 2r. Doubling every length multiplies volume by eight. The auxiliary cone is twice the sphere; the small cone is one quarter of it. Compare the earlier διπλασία without overwriting either reading.",
  },
  {
    title: "The cylinder that encloses the sphere",
    english:
      "The sphere whose greatest circle is ΑΒΓΔ has been shown to be four times that same cone. The cylinder is therefore one and a half times the sphere, which was to be shown.",
    latin:
      "Sphaera cuius maximus circulus est ΑΒΓΔ quadrupla eiusdem coni esse ostensa est; cylindrus igitur sesquialter est sphaerae, quod erat demonstrandum.",
    word: "ἡμιόλιος",
    gloss: "one and a half times · sesquialter",
    grammar:
      "ἡμιόλιος means a whole plus a half, the ratio 3:2. It does not mean 'one half'. ὅπερ ἔδει δειχθῆναι is the closing formula 'which was to be shown'.",
    note: "Here the comparison uses the cylinder that encloses the sphere: radius r, height 2r. It has one quarter the volume of the large auxiliary cylinder. Keeping those two cylinders distinct is essential. The mechanical discovery still has to be distinguished from a complete geometrical demonstration, as Archimedes explains before this argument.",
  },
].map((r, i) => {
  const source = evidence[i];
  if (!source) throw new Error("A Greek reading has no mapped source.");
  return { ...r, evidence: source };
});

export function readingAt(index: number) {
  const reading = readings[index];
  if (!reading) throw new RangeError("Unknown reading.");
  return reading;
}

export function greekHTML(index: number) {
  return readingAt(index)
    .evidence.chunks.map(({ text, flags }) => {
      let value = escapeHTML(text);
      if (flags.includes("ex"))
        value = `<span class="expanded" title="Expanded manuscript abbreviation">${value}</span>`;
      if (flags.includes("unclear"))
        value = `<span class="unclear" title="Uncertain reading in the transcription">${value}</span>`;
      if (flags.includes("supplied"))
        value = `<span class="supplied" title="Letters supplied by the editors">⟨${value}⟩</span>`;
      return value;
    })
    .join("");
}

export const sourceOrigin = "https://archimedespalimpsest.net/";
export const sourcePaths: Record<string, string> = {
  Arch17r: "Data/066r-071v/",
  Arch17v: "Data/066v-071r/",
  Arch18r: "Data/065r-072v/",
};
