# VI–VIII original-figure integration receipt

Date: 2026-09-17. PR #129. This is a candidate-source receipt, not a live publication declaration.

The previous continuation package was based on `61551394bdc490010d7c5eb5bb28834087315882`. Its VI/VII/VIII educational text is now integrated with seven original figure PNG files in content commit `9b142a5a9dd7b41c791167803f516e3ce1fc2ec3`. Existing FCN/U-Net source figures and lecture equation identities are retained.

## Sources and image identity

| Part | Paper version | Original figure | Handling |
| --- | --- | --- | --- |
| VI | PSPNet 1612.01105v2 | Figure 3 | Original arXiv PNG bytes |
| VI | DeepLabv3 1706.05587v3 | Figure 5 | Original arXiv PNG bytes |
| VI | DeepLabv3+ 1802.02611v3 | Figure 2 | Original arXiv PNG bytes |
| VII | Auto-Encoding Variational Bayes 1312.6114v11 | Figure 1 | Exact PDF page 2 figure crop, 6 pixels/point |
| VII | DDPM 2006.11239v2 | Figure 2 | Exact PDF page 2 figure crop, 6 pixels/point |
| VIII | SimCLR 2002.05709v3 | Figure 2 | Exact PDF page 2 figure crop, 6 pixels/point |
| VIII | CLIP 2103.00020v1 | Figure 1 | Original arXiv PNG bytes |

Acquisition run `35200820307`, artifact `10487791374`, ZIP SHA-256 `56afcd59ab801694c4731e4c6dbfa99835b9a8baf64570b00bca399c1f2ab575`. Downloaded original PNGs and PDF pages were inspected locally. PDF crops were rendered with PyMuPDF 1.26.7; complete PDFs are not added to site assets. Each original source hash, final image hash, actual pixel size, crop and visual-review binding is recorded in `site/assets/assets/posts/modern-ai-continuation/figures.json`.

## Integrity and release boundary

The Actions materialization validated the exact source patch, baseline article hashes, artifact bytes, seven final image hashes and 25 numerical/source-binding tests before pushing only content files. Workflow changes use the authorized repository connector separately; the Actions token is not granted additional workflow permission. Temporary transfer and acquisition files are removed in this commit.

The final candidate still needs its own complete Blog CI, existing FCN/U-Net reading checks and the additive VI–VIII reading suite. The new browser suite tests 390/1440px, light/dark and all three posts, including actual local image decoding and single trusted full-size link activation. A previous head's successful checks are not reused as final-head evidence.

The seven selected new figures do not mean every named paper now has a locally reproduced figure. MRF/ICM examples remain separately defined calculations; other supplementary methods retain their documented scope. Figure attribution does not transfer original rights or create a CC/MIT republication grant. No express permission from the original authors is claimed.
