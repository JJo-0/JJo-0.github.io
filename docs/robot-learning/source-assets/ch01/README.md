# Chapter 01 source comparison and selected assets

Sources: downloaded official NTU drl_v5 PDF/PPTX, DeepMind/UCL 2021 Lecture 1 PDF, RT-2 CoRL PDF, DAgger AISTATS PDF, and the four previously archived timed video transcripts. SHA256 and exact crop coordinates are in manifest.json. Crops were rendered from the PDF and visually inspected at original output resolution.

Checked passages for this revision:
- NTU PDF pp. 11 and 13; PPTX slide 13 equation-006 OMML confirms the complete sum, limits and reward subscript. Video 0oucZNfBXlI, 13:27–15:24 and 18:35–19:50: policy-network outputs and sequential rewards.
- UCL PDF pp. 38 and 46; video TCCjZe0y4Qc, 47:31–51:08: indistinguishable local observations and why two frames need not be sufficient. PDF p. 46 defines discounted policy-dependent value.
- ETH video X0k14u6pSxw, 38:05–40:35: physical reliability, dexterity and reasoning. Official ETH PDF remains encrypted; this does not claim PDF/mirror equivalence or full audio review.
- RT-2 PDF p. 2, Figure 1 and adjacent paragraphs: joint data training, action decoding, closed-loop control, semantic recombination versus physical skill distribution.
- DAgger PDF p. 2, equations (1) and (2): learner-induced versus expert state distributions.

Equation inventory:
1. Stochastic policy: educational observation-based notation for NTU p. 11; not a verbatim equation from the slide.
2. Undiscounted return: NTU p. 13 and exact original OMML, R=sum from t=1 to T of r_t.
3. Discounted return: finite-episode reexpression of UCL p. 46.
4. Policy-dependent value: UCL p. 46 definition.
5. Squared-error behavior cloning: separate educational continuous-action example, not claimed to be the NTU or DAgger printed equation.

Credits remain next to each figure. The images are selected excerpts used for direct analysis, not replacements for the full decks. Source transcripts are not republished in the public repository. Existing 33 ETH slide anchors and the tested one-dimensional feedback example are retained.
