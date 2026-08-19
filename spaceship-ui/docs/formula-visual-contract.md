# Contextual formula visualization contract

Modern AI display equations use a single reader flow inside the existing `쉽게 설명 + 계산 과정` disclosure:

1. the question answered by the equation;
2. a one-line interpretation;
3. a direct-manipulation visualization selected from the equation family;
4. the numbered calculation walkthrough;
5. a numerical worked example;
6. sanity checks, symbols, and references.

The visualization must not be published as a detached PCA or concept demo elsewhere in the article. It belongs to the exact formula guide that it explains.

## Runtime boundary

- Static HTML contains one lightweight visual shell per formula guide.
- Interactive controls and SVG/HTML drawing nodes are created only on the first open event for that guide.
- One shared delegated runtime serves all formula cards; hundreds of independently hydrated client islands are prohibited.
- Formula TeX, formula IDs, and source SHA-256 ledgers remain unchanged.

## Visual families

- linear algebra and matrix/vector transformation;
- covariance and PCA-style projection;
- probability distributions;
- optimization and gradient descent;
- classifier decision boundaries;
- convolution patch arithmetic;
- dimensionality growth and K-fold evaluation;
- a generic input/output fallback.

## Copyright and external-reference boundary

The visual explanation pattern may be informed by strong mathematical tutorial sites, but repository code, SVG, animation assets, and interaction logic must be original. No iframe, copied GIF/SVG, remote script, or third-party visual runtime is permitted.

## Fail-closed checks

`modern-ai-visual-lab-audit.mjs` verifies that:

- every Part I and Part II formula guide contains exactly one contextual visual shell;
- the visual is inside the disclosure and precedes the calculation walkthrough;
- the shared runtime contains every approved visual family;
- the rejected standalone PCA block is absent;
- protected formula counts and KaTeX output remain intact.
