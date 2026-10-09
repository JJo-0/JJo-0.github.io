# September 18 candidate publication

## Scope and source identity

Base main: `1354c5763eed00a85f0a8ca50130bd2776d2d456`. Continue the supplied four-article draft package; do not duplicate the already published Paper2Agent article or change educational series PR #129.

The four subjects come from the user's September 18 selection: Delphy, PANXEON, single-crystalline nanomembrane photonics, and slow-manifold control of soft robotic muscles. The original authored eleven numerical explanations are byte-preserved, with actual symbols, operations and examples. Their examples are not presented as experimental reproductions.

## Figure verification

Eight selected original figures, not whole papers:

| Article | Source | Figures | Evidence |
|---|---|---|---|
| Delphy | Nature 2026-09-16, s41586-026-11012-6 | 1 / 4 | Full publisher PNGs, byte-identical; tree/prior/local updates and H5N1 comparisons |
| PANXEON | Nature Medicine 2026-09-16, s41591-026-04625-x | 1 / 4 | Full publisher PNGs, byte-identical; enrollment/splits and diagnostic performance/modeling |
| Photonics | Nature 2026-09-16, s41586-026-11000-w | 1 / 2 | Full publisher PNGs, byte-identical; transfers/crystal measurements and BTO devices |
| Soft muscles | Nature Communications Article in Press, s41467-026-77664-0 | 6 / 7 | Figure regions from accepted PDF pages 7/8, rendered at 5 px/pt; all panels retained |

Primary evidence run `35311960331`, artifact `10533339335`, ZIP SHA256 `39aa00907b1da17baa13476e91ea28e1f30871ce0b9ce205551926b3fc152911`.
Supplementary evidence run `35312185074`, artifact `10534070857`, ZIP SHA256 `39545ffe578778d7835268844cb4f4545d4c2516d3fe848dd1074bc331613750`.
Accepted muscle PDF SHA256 `1c9a4f28f3c5ed27773950d9a7e95f6c19307305dc623a83b9ee21aad2e558eb`.

Each result PNG was visually inspected, including all panels. The provenance file contains original/result hashes, dimensions, page/crop coordinates, transformation and source version. The source PNGs are not generated illustrations. No fonts or full papers are added to the repository.

## Changes prompted by the original figures

- PANXEON: 1,785 enrolled, 28 excluded for RNA quality, 1,757 analyzed. Figure 1 gives training707 / validation305 / testing440 plus treatment137 and cross-reactivity168. Figure 4 gives independent-test PDAC90 / HGD14 / non-disease controls93 / high-risk controls243. Overlapping family-history/cyst groups in Figure 1 must not be summed blindly.
- PANXEON Figure 4(h): the stage-shift/"Saved" quantities are model-based SEER projections, not observed screening mortality reductions. Both prose and figure caption identify this distinction. Population PPV exercises retain explicit assumed prevalence and are not personal medical advice.
- Delphy: the generic Bayes equation is separated from the augmented EMAT model's genetic prior and its 0/1 tip-consistency likelihood. The explanatory MH target symbol and the narrower prior symbol in Figure1 are explicitly distinguished. H5N1 42min is not divided into an unfinished BEAST X run to invent an exact speed ratio.
- Photonics Figure 2(h)/(k): 4.5mm and 1mm device conditions differ. Material coefficients, device bandwidth and manufacturing readiness remain separate. No source data were reanalyzed.
- Soft muscles: the earlier arXiv-v1 numerical results were checked against the accepted manuscript page8. The figures used here are the accepted manuscript's Figures6/7 under its displayed CC BY4.0 notice, not silently attributed to the preprint or called a final edited Version of Record.

## Rights and advertising

Delphy is **CC BY-NC-ND4.0**, not CC BY4.0. These PNGs remain unmodified. PANXEON and photonics carry exclusive publisher rights; the selected figures are used as objects of accompanying scholarly commentary, with rights reserved and no claimed CC or express republication grant. This technical verification is not a blanket legal clearance or license for downstream reuse. The accepted muscle manuscript explicitly displays CC BY4.0 covering its figures absent separate third-party notices.

The four article routes and the NEWS card reading page use the site's existing `adsEnabled={false}` boundary. This prevents ad initialization on those pages; no external AdSense settings are changed. Ordinary links to articles continue to use the site's reload navigation. No claim is made that this setting by itself establishes a legal exception or authorizes third-party reprints.

## Validation and deployment

The source contract checks four complete 7,000+ character articles, eleven original explanations, all inline/display KaTeX expressions, exact native citations, eight verified PNG hashes/dimensions/versions, preservation of all previous NEWS media values, twenty worked calculations and eight corruption controls. Tests operate on actual article/equation bodies, not only declared counts.

The original complete Blog CI and its 240-second browser guard remain unchanged. The new edition is registered in the complete NEWS media visit plan, so its four cards and eight images join the existing coverage. A separate native reading matrix checks four articles × 390/1440px × light/dark, actual image popups, pointer and Enter equation disclosures, references/Back, small notes and overflow. The same dedicated matrix is added after the existing Pages live checks, using the deployed URL. Existing tests are not skipped or softened.

Exact-head CI/review, merge commit, Pages result and live artifacts must be recorded in the PR when obtained. This document describes implementation and evidence scope; its existence does not declare deployment complete. No Blogger account publication, clinical validation, independent scientific replication, or remaining Modern AI editorial repair is claimed.
