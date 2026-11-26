# Chapter 11 source checkpoint

Prepared on 2026-11-18 KST. This checkpoint records authoring and verification;
the PR, merge commit, deployment result and public checks are recorded separately.

## Scope

- Slug: `self-improving-ai-11-automated-post-training`.
- NTU Self-Improving PDF pages 51–55, with five source slides and four supplementary
  source-paper figures. The controller agent and the model it trains are distinct.
- Source anchors: PostTrainBench arXiv `2603.08640v2`, FT-Dojo `2603.01712v1`
  (the lecture-era version), and LoRA `2106.09685v2`.
- Reader-facing manuscript begins with the learning question. Tool, translation,
  extraction and image-production metadata belong to manifests and provenance.

## Findings that must survive later edits

- PostTrainBench uses one H100 for up to 10 hours **per model–benchmark task**.
  Four base models and seven benchmarks yield 28 tasks; three repeats yield 84 runs.
- Figure 3's initial 0% is evaluated on 20 samples, while its later 28.7% and 37.3%
  are labelled 150 samples. Do not turn all three into a matched-set gain claim.
- The first 203,178-example, two-epoch run timed out. Its planned 406,356 example
  visits were not all completed. The later 20,000-example plan is not a runtime
  speedup measurement. The LoRA parameter example is illustrative, not Gemma telemetry.
- Table 1's average is weighted across benchmarks after averaging across four
  target base models. Its model/scaffold labels identify the **training agents**,
  not the models directly answering benchmark questions.
- Table 5's displayed weights sum to 0.9999. Multiplying those displayed weights
  by the displayed Opus 4.6 row yields 23.14641, whereas the reported Avg is 23.2.
  Keep the reconstruction distinct from the paper's report; no raw-score reaggregation
  was performed. The unweighted mean is 28.385714285714286.
- The native-frontier configurations have three independent runs; not all rows do.
  The ± values are run standard deviations, not confidence intervals.
- The row labelled zero-shot has the GSM8K 10-shot evaluation exception. The separate
  few-shot base comparison also changes the chat-template condition.
- Official instruction models and narrow-target automated post-training have different
  objectives and resources. A BFCL win is not broad research superiority.
- Detected prohibited model substitution or contamination receives the base-model
  score. The reported 23.2 must not be described as an unadjusted cheating-inclusive score.
- FT-Dojo permits authorized synthesis APIs. PostTrainBench's documented API case
  violated the evaluation-only use restriction; all synthetic-data generation is not banned.
- Figure 7's context-loss explanation is the authors' hypothesis, not a proven mechanism.

## Evidence and next work

- `reviews/verify_examples_11.py` checks explicit arithmetic and rounded-table inputs.
- `source-assets/11/source-review.json` records paper locations and interpretation limits.
- Root integration owns the final image manifest, actual dimensions, content checks,
  series registration and publication. The verification agent owns transcript provenance.
- Next chapter covers NTU pages 56–60 and weak-to-strong generalization.
