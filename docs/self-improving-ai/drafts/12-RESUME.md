# Chapter 12 source checkpoint

Prepared on 2026-11-18 KST from main `bbcf0b60c8b5eeb9d82260547c17ef507a892773`.

## Scope

- Article: `self-improving-ai-12-weak-to-strong-generalization`.
- NTU primary PDF pages 56–60, followed in order with Korean explanation.
- Five main slide images plus four original supplementary source figures.
- Twelve Math components cover BCE, PGR, auxiliary-confidence mixture targets and logit gradients, research-family entropy, and a binary noisy-channel posterior.
- Actual provided manual-caption topic interval: 3519.816–3782.845 seconds of `s06mSAGN4gM`. These are topic markers, not frame-accurate slide-transition claims.

## Source distinctions maintained

- Opus 4.6 is the researcher, Qwen1.5-0.5B-Chat the weak teacher, and Qwen3-4B-Base the stronger student. Updating the student is not evidence of updating the researcher's model weights.
- OpenAI's GPT-2/3.5-level descriptions do not identify the original public GPT-2/3.5 models; the experimental models are from the GPT-4 family.
- OpenAI Figure 2 has different y-axis ranges, different best methods, and a 3.5-level student in reward modeling versus GPT-4 in NLP and chess. RM policy optimization by RL is outside that experiment.
- PGR is a ratio of performance gaps, not accuracy or alignment probability; the reference ceiling is an empirical supervised comparator, not a mathematical upper bound. Unclipped PGR may be negative or exceed one.
- Appendix A.4 uses a batch-adaptive threshold and a mixed weak/student target. Alpha reaches .75 for the largest students and .5 otherwise, with warmup over the first 20% of training.
- Anthropic's 800 hours are aggregate research time across agents. Slide 59's x-axis is cumulative time per AAR.
- The repeated remote score interface makes the discovery set function as a validation set. The announcement says detected inappropriate submissions were disqualified; no claim is made that all final scores are hacked scores.
- Cross-task results are CCS + Self-Distill: .97/.94/.47 and EM Posterior: .78/.75/−.12 on chat/math/code. Hyperparameter tuning is allowed in transfer, method modifications are not.
- Production transfer of an EM method to Sonnet 4.0 gave +.5 point within the noise floor, per the technical report.
- The river-bank judgment on slide 60 is dated to the May 2026 lecture, not asserted as a November 2026 universal finding.

## Verification

- `reviews/verify_examples_12.py`: 16 checks pass. These are pedagogical calculations, not training replication.
- `source-assets/12/source-review.json`: primary-source locations, measured versus hypothetical distinctions, and source hashes.
- Renderer, final image hashes, metadata synchronization, Astro build, browser checks, merge and public deployment are handled by the integration task. Do not infer publication from this checkpoint alone.

## Next authoring range

Pages 61–62 introduce the agent harness and close the first lecture. They have not been authored as a new post here.
