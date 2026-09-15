# September 15 NEWS publication checkpoint

Tracking issue: #117. Branch: `content/news-20260915-biosensing-candidates`.
Base inspected: `3cccac400588b4406a55caa6a5e4173bdf1e5a87`.

## Scope and actual source work

The user supplied a September 15 editorial selection and explicitly requested uploading the pictures and all candidates. This batch adds three Korean full explainers: MspA-FPBA Top 1, APOE-stratified GWAS candidate 2, and MoS2 SNN-in-logic candidate 3. FDA Isembyld is preserved as the named reserve candidate in the Top 1 article section 8, with its September 11 source date and medical-use boundary. Unnamed AI/Power search candidates are not invented.

The older English/news expansion PR #113 remains separate; do not merge it as an implicit dependency or claim that this batch completes English localization.

| Article | Korean prose characters | Independent Blogger prose characters |
| --- | ---: | ---: |
| Nanopore | 7,615 | 1,748 |
| APOE | 7,218 | 1,723 |
| MoS2 | 7,350 | 1,741 |

Counting convention and exact hashes are in `site/news-edition-20260915.json`. Metadata, imports, URL targets, formatting and section 9 references are not padding for the Korean length requirement. Each article begins with a representative NewsFigure and includes a second credited background original inside the explanation.

## Source and media evidence

Primary-source retrieval: Actions run `34917932263`, artifact `10377072539`; archive SHA256 `535a67512c66924f36d7e3937caf1e0b61ad6030bfc0b1c7d348a03d3edf5a4b`.
Background figure acquisition: Actions run `34918309079`, artifact `10376859583`; archive SHA256 `b6fad57bb0be1aaefbb0d017d6e704df875d4cacfc3bbf40be3b1c495b48ae66`.

Six complete-panel source figures were visually reviewed. Their individual source URLs, original/output hashes, dimensions, copyright credits and changes are in `site/assets/assets/posts/news-20260915/provenance.json`. They are CC BY 4.0 originals from Fan et al. 2024, Bellenguez et al. 2022 and Bhattacharjee et al. 2020. Captions and compact archive cards explicitly identify them as historical background, not the September 2026 results. The MoS2 first figure includes an original optical micrograph. No synthetic picture is presented as experimental evidence.

The new 2026 nanopore paper has a standard publisher copyright notice; APOE/MoS2 articles specify CC BY-NC-ND 4.0. Their images were reviewed but are not rehosted. Do not silently replace background originals with restricted result images. Full third-party papers/PDFs are not committed or republished.

## Editorial verification limits

Nanopore: public abstract/figures/Extended Data and selected supplement sections, including direct visual check of Table 7 on PDF page 11 (98.7% validation, 96.7% test, 80/20 split, nine features). No subscription main-text access claim and no code execution.

APOE: public main/methods, strata sample sizes, epsilon42 exclusion, formal interaction distinction (DDHD1 interaction P=1.62e-6 is not genome-wide significant), ancestry limitations and disclosure/data/code notices. No individual-risk diagnosis and no full GWAS rerun.

MoS2: actual device measurements versus experimentally calibrated SpikingJelly/network/energy evaluation; representative vs mean switching numbers; 10,000 seconds is not a lifetime test; data/code are available on request, not a claimed open repository. No end-to-end chip energy measurement claimed.

FDA: the direct acquisition returned 404; the official FDA approval announcement and novel-drug listing were available in web search and agree on September 11 approval. This access distinction remains in the source receipt, not hidden as a successful fetch.

## Checks before merge

- [x] Local taxonomy contract and canonical registry: 98 posts.
- [x] Local post-content and SEO metadata checks.
- [x] New 3-article length/source/media/order contract.
- [x] Three Blogger HTML files pass `scripts/blogger_harness.py validate`.
- [ ] Final-head full CI: lint, type, build, content and browser matrix.
- [ ] PR review, merge and Pages deployment verification.
- [ ] Public /news and all three articles: images decoded at 390/1440px, exact dimensions and background labels, no page overflow.
- [ ] Blogger actual publication (separate authentication-dependent step).

## Blogger status and restart

Prepared files live in `ops/blog-harness/blogger/2026-09-15/`. They are independent short explainers with two distinct images, original-source links and full-article links. They are NOT already Blogger publications. The current connector search returned no Blogger provider. The existing local harness expects an authorized token in the user's Mac Application Support directory, which is not present in this environment; do not ask the user to paste tokens or publish via unrelated credentials.

After confirming the full article and image URLs are publicly reachable, the authenticated harness may publish with an explicit `--publish`; record each accepted Blogger post URL before updating status. Never infer external publication from a successful HTML validation or GitHub build.

Next session: fetch current branch/main heads, read #117 latest comments and the linked PR, check the exact final CI run rather than old runs. Do not replay expired source artifacts or restore transfer blobs; actual source/images are in GitHub. Remove one-off acquisition/apply workflows after committing the source, preserve this ledger and all source/media receipts, and avoid force pushes.
