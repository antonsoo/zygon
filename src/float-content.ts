import { escapeHTML as e } from "./drawing";
import evidence from "./float-readings.json";

export const floatReadings = [
  {
    title: "A condition on the shape",
    reference: "II.2 / opening",
    latinPage: 376,
    english:
      "The right segment of the right-angled conoid, when it has its axis no greater than one and a half times the line up to the axis, …",
    latin:
      "Recta portio rectanguli conoidalis quando axem habuerit non maiorem, quam emiolium eius, quae usque axem,",
    note: "A right-angled conoid is a paraboloid of revolution, not a cone with straight sides. In our coordinates z = x² + y², the source's 'line up to the axis' is 1/2. Thus the axis condition becomes a ≤ 3/4. 'Right segment' describes its perpendicular cut; the solid can then be tilted in the liquid.",
  },
  {
    title: "Any ratio, with a dry base",
    reference: "II.2 / hypothesis",
    latinPage: 376,
    english:
      "… having any ratio in weight to the liquid, released into the liquid in such a way that its base does not touch the liquid, …",
    latin:
      "omnem proportionem habens ad humidum in grauitate, dimissa in humido ita, ut basis ipsius non tangat humidum,",
    note: "The base is the flat circular cut at the top, not the pointed vertex. The surrounding argument concerns a body lighter than an equal volume of liquid. 'Any ratio' does not license a solid denser than the liquid to float. The workshop explores densities from 4% to 90% of the liquid's.",
  },
  {
    title: "Will not remain tilted",
    reference: "II.2 / conclusion",
    latinPage: 377,
    english: "… placed tilted, it will not remain tilted, but will be restored upright.",
    latin: "posita inclinata, non manet inclinata, sed restituetur recta.",
    note: "The Latin sentence crosses the printed page break: posita inclinata, non manet in- ends p. 376; clinata begins p. 377. We join the line-break word without changing it. The model computes the direction of a static turning moment. It does not animate a measured return, time its motion or model damping.",
  },
  {
    title: "What upright means",
    reference: "II.2 / definition",
    latinPage: 377,
    english:
      "I say that such a segment stands upright whenever the plane that cut it off is parallel to the surface of the liquid.",
    latin:
      "rectam dico consistere talem portionem, quando quod secuit ipsam fuerit aequidistanter superficiei humidi.",
    note: "The transmitted Greek repeats ἦι around 'parallel to the surface'; it remains visible. The Latin's quod secuit ipsam, 'what cut it', is its compressed counterpart to the Greek plane. In the flat-surface model, a horizontal base and a vertical axis describe the same upright orientation.",
  },
  {
    title: "The proof continues in Greek",
    reference: "II.2 / end of proof",
    latinPage: 377,
    english:
      "It is clear that the segment will not remain in the liquid [in this position]: the parts at Α will be carried upward, and those at Λ downward, continuously, until it is restored upright.",
    latin: null,
    note: "The 1881 Latin witness ends its II.2 proof after drawing a tangent. Its footnote says the last part is missing in Tartaglia and Commandino supplied his own. This Greek conclusion comes from the later released palimpsest transcription. There is no corresponding Latin excerpt in the retained 1881 page. The source's Α and Λ label its figure, not the workshop's G and B. The transcription's odd ἀεὶ ἔστεν remains marked as sic; the English renders the surrounding conclusion.",
  },
  {
    title: "A taller solid needs a density condition",
    reference: "II.4 / complete statement",
    latinPage: 379,
    english:
      "The right segment of the right-angled conoid, whenever it is lighter than the liquid and has its axis greater than one and a half times the line up to the axis, if its ratio in weight to an equal volume of liquid is no less than the ratio of the square on the excess, by which the axis exceeds one and a half times the line up to the axis, to the square on the axis, released into the liquid so that its base does not touch the liquid, placed tilted, will not remain tilted but will be restored upright.",
    latin:
      "Recta portio rectanguli conoidalis quando fuerit leuior humido et axem habuerit maiorem quam emiolium eius, quae usque ad axem, si in grauitate ad humidum aequae molis non minorem proportionem habeat illa, quam habet tetragonum quod ab excessu, quo maior est axis quam emiolius eius, quae usque ad axem, dimissa in humido ita, ut basis ipsius non tangat humidum, posita inclinata, non manet inclinata, sed restituetur in rectum.",
    note: "In modern notation the Greek density condition is σ ≥ ((a − 3/4)/a)². The Latin printed across pp. 379–380 omits the denominator after 'axis'; Heiberg's p. 380 footnote says to add ad tetragonum quod ab axe. We retain the body text and show that footnote, rather than silently repairing the Latin. Equality cancels the linear stiffness; finite dry-base tilts still restore. Many Greek letters in this statement are supplied by the editors, as the red brackets show.",
  },
].map((r, i) => {
  const source = evidence[i];
  if (!source) throw new Error("A floating reading has no source.");
  return { ...r, evidence: source };
});

export const floatWords = [
  [
    "τμᾶμα",
    "a segment",
    "Doric form of τμῆμα; a part cut from a solid. Here it includes its volume.",
    0,
  ],
  [
    "ὀρθογωνίου κωνοειδοῦς",
    "of a right-angled conoid",
    "The genitive names the parent solid, a paraboloid of revolution. It is not a straight-sided cone.",
    0,
  ],
  ["ἄξονα", "axis", "Accusative after σχῆι, 'has'. It is the vertex-to-base length a.", 0],
  [
    "ἡμιόλιον",
    "one and a half times",
    "A whole plus a half: 3:2, not one half. Latin emiolium transliterates the Greek.",
    0,
  ],
  [
    "τῆς μέχρι τοῦ ἄξονος",
    "the [line] up to the axis",
    "A technical parabola parameter; 1/2 in z = x². Its value changes with coordinate convention.",
    0,
  ],
  [
    "πάντα λόγον",
    "every ratio",
    "Accusative object of ἔχον. The lighter-than-liquid context still applies.",
    1,
  ],
  [
    "τῶι βάρει",
    "in weight",
    "Dative specifying the respect in which the ratio is taken; equal-volume weights give relative density.",
    1,
  ],
  [
    "βάσιν",
    "base",
    "The circular plane cut at the broad end. It does not mean the pointed bottom of the drawing.",
    1,
  ],
  [
    "μὴ ἅπτεσθαι",
    "not to touch",
    "μή negates the infinitive. ἅπτεσθαι takes the genitive τοῦ ὑγροῦ, 'the liquid'.",
    1,
  ],
  [
    "κεκλιμένον",
    "having been tilted",
    "Perfect passive participle, neuter, agreeing with τμᾶμα. The state after tilting is the question.",
    2,
  ],
  [
    "οὐ μενεῖ",
    "will not remain",
    "Future of μένω, negated by οὐ. Latin non manet uses a present verb.",
    2,
  ],
  [
    "ἀποκαταστήσεται",
    "will be restored",
    "Future middle: the conclusion is a return to the upright position.",
    2,
  ],
  [
    "ἐπίπεδον",
    "plane",
    "The cutting plane is parallel to the liquid surface when the body is upright.",
    3,
  ],
  [
    "τὰ μὲν … τὰ δὲ",
    "the parts on one side … the parts on the other",
    "A paired contrast: one side goes up, the other down. It describes rotation.",
    4,
  ],
  [
    "ἴσογκον ὑγρόν",
    "an equal volume of liquid",
    "The comparison fixes volume before comparing weights. A small dense object can weigh less than a large light one.",
    5,
  ],
  [
    "μὴ ἐλάσσονα λόγον",
    "a ratio no smaller",
    "An inclusive lower bound. Equality belongs to the hypothesis; the workshop retains that boundary case.",
    5,
  ],
] as const;

export function floatGreek(index: number): string {
  const reading = floatReadings[index];
  if (!reading) throw new Error("Unknown floating reading.");
  return reading.evidence.chunks
    .map(({ text, flags }) => {
      let html = e(text);
      if (flags.includes("ex")) html = `<em title="Expanded manuscript abbreviation">${html}</em>`;
      if (flags.includes("sic"))
        html = `<span class="fl-sic" title="Marked sic in the released transcription">${html}</span>`;
      if (flags.includes("unclear"))
        html = `<span class="unclear" title="Uncertain in the released transcription">${html}</span>`;
      if (flags.includes("supplied"))
        html = `<span class="supplied" title="Supplied by the editors">⟨${html}⟩</span>`;
      return html;
    })
    .join("");
}
