import { escapeHTML as e } from "./drawing";
import sourceManifest from "./parabola-sources.json";

export { sourceManifest };
export const parabolaReadings = [
  {
    title: "A third greater than the triangle",
    reference: "Method I, printed pp. 434–435",
    greekPage: 0,
    latinPage: 0,
    greek: "λέγω, ὅτι ἐπίτριτόν ἐστι τὸ ΑΒΓ τμῆμα τοῦ ΑΒΓ τριγώνου.",
    latin: "Dico, segmentum ΑΒΓ tertia parte maius esse triangulo ΑΒΓ.",
    english: "I say that the segment ΑΒΓ is one-third greater than the triangle ΑΒΓ.",
    note: "ἐπίτριτον gives the segment as 4/3 of the small inscribed triangle. The inverse comparison is 3/4: the triangle is three-quarters of the segment. Heiberg’s tertia parte maius says ‘greater by a third’, not ‘equal to one third’. Point letters identify the source figure; they are normalized to Greek capitals here.",
  },
  {
    title: "One proportion sets the balance",
    reference: "Method I, printed pp. 436–437",
    greekPage: 1,
    latinPage: 1,
    greek: "ὡς ἄρα ἡ ΘΚ πρὸς ΚΝ, οὕτως ἡ ΜΞ πρὸς ΞΟ.",
    latin: "erit ΘΚ : ΚΝ = ΜΞ : ΞΟ.",
    english: "Thus, as ΘΚ is to ΚΝ, so ΜΞ is to ΞΟ.",
    note: "ὡς … οὕτως pairs the two ratios: ‘as … so’. The longer triangle section ΜΞ stays at Ν; the shorter parabola section ΞΟ is transferred to Θ. Inverse weights and lever arms balance. Our separate horizontal beam preserves these arm ratios; it is a modern working diagram, not a manuscript facsimile.",
  },
  {
    title: "The centre is a third along the arm",
    reference: "Method I, printed pp. 438–439",
    greekPage: 2,
    latinPage: 2,
    greek: "τριπλασία δέ ἐστιν ἡ ΘΚ τῆς ΚΧ· τριπλάσιον ἄρα καὶ τὸ ΑΖΓ τρίγωνον τοῦ ΑΒΓ τμήματος.",
    latin: "verum ΘΚ = 3 ΚΧ; quare etiam ΑΖΓ triangulus segmento ΑΒΓ triplo maior est.",
    english:
      "But ΘΚ is three times ΚΧ; therefore the triangle ΑΖΓ is also three times the segment ΑΒΓ.",
    note: "The centroid Χ of the large auxiliary triangle lies one-third of the way from Κ toward Γ. That large triangle is four times the small inscribed one. Combining ‘four times’ with ‘three times’ gives 4/3. The centroid theorem and mechanical comparison are inputs; a moving indicator does not prove them.",
  },
  {
    title: "The author withholds the proof",
    reference: "Printed opening of Method II, pp. 438–439; closes the preceding parabola argument",
    greekPage: 2,
    latinPage: 2,
    greek:
      "Τοῦτο δὴ διὰ μὲν τῶν νῦν εἰρημένων οὐκ ἀποδέδεικται, ἔμφασιν δέ τινα πεποίηκε τὸ συμπέρασμα ἀληθὲς εἶναι·",
    latin:
      "Hoc igitur per ea, quae nunc diximus, demonstratum illud quidem non est, at significationem quandam dedit, conclusionem veram esse;",
    english:
      "This has not been proved by what has just been said, but it has given some indication that the conclusion is true.",
    note: "The printed II heading stands above this qualification. Its ‘this’ closes the preceding parabola argument before the sphere result begins. οὐκ negates ‘is demonstrated’; an exact balance should not silently remove that qualification. The perfect passive ἀποδέδεικται asks what has actually been demonstrated. The source’s qualification remains beside the mechanical result. The excerpt follows the retained print; it does not claim a new manuscript decipherment.",
  },
  {
    title: "Each small triangle is an eighth",
    reference: "Quadrature XXI, Heiberg 1881, printed pp. 344–345",
    greekPage: 5,
    latinPage: 6,
    greek: "δεικτέον, ὅτι ὀκταπλάσιόν ἐστι τὸ ΑΒΓ τρίγωνον τοῦ ΑΒΖ τριγώνου.",
    latin: "demonstrandum est, esse ΑΒΓ = 8 ΑΒΖ.",
    english: "It must be shown that the triangle ΑΒΓ is eight times the triangle ΑΒΖ.",
    note: "The two newly inserted triangles each have one-eighth of their parent’s area. Together they have one-quarter. A count of triangles doubles while their combined area is quartered. The formula in the Latin retains its mathematical statement; point letters are normalized. The fill diagram groups both children as one complete layer.",
  },
  {
    title: "Add a third of the smallest",
    reference: "Quadrature XXIII, Heiberg 1881, printed pp. 346–347",
    greekPage: 7,
    latinPage: 8,
    greek:
      "Εἴ κα μεγέθεα τεθέωντι ἑξῆς ἐν τῷ τετραπλασίονι λόγῳ, τὰ πάντα μεγέθεα καὶ ἔτι τοῦ ἐλαχίστου τὸ τρίτον μέρος ἐς τὸ αὐτὸ συντεθέντα ἐπίτριτα ἐσσοῦνται τοῦ μεγίστου.",
    latin:
      "Si magnitudines quaedam ponuntur in quadrupla deinceps proportione, omnes magnitudines et praeterea tertia pars minimae simul sumptae tertia parte maiores erunt maxima.",
    english:
      "If magnitudes are set one after another in the fourfold ratio, all the magnitudes together, with one-third of the smallest added, will be one-third greater than the greatest.",
    note: "This is a finite statement. ‘The smallest’ is the last complete layer in the account, not one individual triangle within that layer. The extra third is an algebraic correction; it has not filled the remaining curved pieces. εἴ κα is the conditional form in this edited Doric text; it is not silently changed to the Method’s wording.",
  },
  {
    title: "Neither smaller nor larger",
    reference: "Quadrature XXIV, Heiberg 1881, printed pp. 352–353",
    greekPage: 13,
    latinPage: 14,
    greek:
      "οὐκ ἄρα τὸ ΑΔΒΕΓ τμᾶμα ἔλασσόν ἐστι τοῦ Κ χωρίου. ἐδείχθη δέ, ὅτι οὐδὲ μεῖζον. ἴσον ἄρα ἐστὶν τῷ Κ.",
    latin:
      "itaque segmentum ΑΔΒΕΓ minus non est spatio Κ. demonstratum autem est, id ne maius quidem esse. itaque spatio Κ aequale est.",
    english:
      "Therefore the segment ΑΔΒΕΓ is not smaller than the area Κ. It has also been shown that it is not larger. It is therefore equal to Κ.",
    note: "The printed argument rules out both strict inequalities. A finite drawing has not become the curve: the proof concerns what every sufficiently refined construction can establish. Κ here labels the comparison area, while Κ in the Method labels the fulcrum. The two source figures must not be silently treated as one. Our tangent outer covers are a separate coordinate demonstration of shrinking bounds, not a transcription of this proof.",
  },
] as const;
export const parabolaWords = [
  [
    "ἐπίτριτον",
    "epitriton",
    "a third greater; in the ratio 4:3",
    "The prefix ἐπι- adds a third to a whole. Latin tertia parte maius makes the comparison explicit.",
    0,
  ],
  [
    "τμῆμα · τμᾶμα",
    "tmēma · tmāma",
    "the cut-off segment",
    "The Method and the edited Doric Quadrature show different forms. The word names the curved segment, not one of our vertical slices.",
    0,
  ],
  [
    "τριγώνου",
    "trigōnou",
    "of the triangle",
    "A genitive after the ratio word: this triangle is the comparison quantity. Latin uses triangulo after maius.",
    0,
  ],
  [
    "ὡς … οὕτως",
    "hōs … houtōs",
    "as … so",
    "The paired words match the arm ratio to the inverse section-length ratio. They are a proportion, not a time sequence.",
    1,
  ],
  [
    "ἰσορροπήσει",
    "isorropēsei",
    "will balance",
    "The future verb in the surrounding passage describes equal turning moments. Equal weights are not required when arms differ.",
    1,
  ],
  [
    "κέντρον βάρους",
    "kentron barous",
    "centre of weight",
    "βάρος is weight; βάρους is ‘of weight’. Latin centrum gravitatis supplies the corresponding genitive.",
    2,
  ],
  [
    "τριπλασία",
    "triplasia",
    "threefold",
    "Here it compares the long arm with the centroid arm. The resulting large-triangle area is threefold too.",
    2,
  ],
  [
    "οὐκ ἀποδέδεικται",
    "ouk apodedeiktai",
    "is not demonstrated",
    "The negation belongs to the claim about proof. The balance gives an indication while leaving a geometrical argument to supply.",
    3,
  ],
  [
    "ἔμφασιν",
    "emphasin",
    "an indication",
    "In this sentence it names what the mechanical reasoning has supplied. It does not retract οὐκ, ‘not’.",
    3,
  ],
  [
    "ὀκταπλάσιον",
    "oktaplasion",
    "eightfold",
    "One parent is eight times either child. Two children together therefore make one-quarter of the parent.",
    4,
  ],
  [
    "ἑξῆς",
    "hexēs",
    "one after another",
    "The layer account is ordered: each complete area is followed by a quarter of itself. The word does not itself assert an infinite sum.",
    5,
  ],
  [
    "τοῦ ἐλαχίστου",
    "tou elachistou",
    "of the smallest",
    "The article and superlative identify the final magnitude in the finite list. It is one whole layer here.",
    5,
  ],
  [
    "τὸ τρίτον μέρος",
    "to triton meros",
    "the third part",
    "The last layer’s area divided by three, not a third of the first triangle. Latin tertia pars minimae carries both ideas.",
    5,
  ],
  [
    "ἔλασσον · μεῖζον",
    "elasson · meizon",
    "smaller · larger",
    "The final proof excludes each alternative. Our inner and outer bounds show a related exhaustion structure in modern coordinates.",
    6,
  ],
] as const;
export function parabolaReadingHtml(index: number): string {
  const r = parabolaReadings[index];
  if (!r) throw new Error("Unknown parabola reading");
  return `<article class="pa-reading"><p class="pa-reference">${e(r.reference)}</p><h3>${e(r.title)}</h3><div class="pa-languages"><div><h4>Greek</h4><p lang="grc" class="pa-greek">${e(r.greek)}</p></div><div><h4>Heiberg’s Latin</h4><p lang="la" class="pa-latin">${e(r.latin)}</p></div><div><h4>New English</h4><p>${e(r.english)}</p></div></div><p class="pa-note">${e(r.note)}</p></article>`;
}
