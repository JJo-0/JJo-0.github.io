"""Recompute chapter 10's arithmetic from small explicit examples.

Standard-library only. This checks pedagogical calculations and transcribed
R-Zero table/figure arithmetic; it does not rerun a model-training experiment.
SPICE values use population Bernoulli variance, not an unspecified sample
variance estimator. The AZR example uses its reported G=8 accuracy estimate.
"""
from __future__ import annotations

import argparse
from collections import Counter
import json
import math
from pathlib import Path
from statistics import pvariance


def main(output: Path | None = None) -> dict:
    checks = []

    def record(name: str, actual, expected):
        left = actual if isinstance(actual, list) else [actual]
        right = expected if isinstance(expected, list) else [expected]
        passed = len(left) == len(right) and all(
            math.isclose(a, b, rel_tol=1e-10, abs_tol=1e-10)
            for a, b in zip(left, right)
        )
        checks.append({"name": name, "actual": actual, "expected": expected, "passed": passed})

    # R-Zero: modal-answer agreement, including a wrong mode that survives
    # the 3..7 out of 10 filter. Correctness uses an independent answer B.
    answers = ["A"] * 7 + ["B"] * 3
    counts = Counter(answers)
    pseudo_label, modal_count = counts.most_common(1)[0]
    agreement = modal_count / len(answers)
    accuracy = sum(answer == "B" for answer in answers) / len(answers)
    record("modal_agreement_is_not_true_accuracy", [agreement, accuracy], [0.7, 0.3])
    record("wrong_pseudo_label_survives_filter", int(3 <= modal_count <= 7 and pseudo_label != "B"), 1)
    rz_counts = [1, 3, 5, 7, 10]
    rz_rewards = [1 - 2 * abs(count / 10 - 0.5) for count in rz_counts]
    record("r_zero_triangular_rewards", rz_rewards, [0.2, 0.6, 1.0, 0.6, 0.0])
    record("r_zero_repetition_penalty", max(0, rz_rewards[2] - 3 / 10), 0.7)

    # Table 5, PDF8: separate random samples of 200 questions per stage.
    pseudo_accuracies = [79, 69, 63]
    mismatches = [200 * (100 - percent) / 100 for percent in pseudo_accuracies]
    record("table5_mismatched_pseudo_labels", mismatches, [42, 62, 74])
    record("table5_endpoint_changes", [pseudo_accuracies[-1] - pseudo_accuracies[0], mismatches[-1] - mismatches[0]], [-16, 32])

    # Figure 3, PDF7. Do not substitute Appendix Table 6's different values.
    curves = {
        "Qwen3-0.6B-Base": [16.77, 27.39, 27.15, 25.05, 25.15],
        "Qwen3-1.7B-Base": [32.71, 39.19, 39.20, 37.03, 38.27],
        "Qwen3-4B-Base": [42.58, 48.06, 48.44, 49.07, 46.52],
    }
    small, large = curves["Qwen3-0.6B-Base"], curves["Qwen3-4B-Base"]
    record("figure3_large_model_peak_and_final", [max(large) - large[0], large[-1] - max(large)], [6.49, -2.55])
    record("figure3_small_model_initial_and_later", [small[1] - small[0], small[-1] - small[1]], [10.62, -2.24])

    # AZR Eq4: conditional on observing at least one success; not maximized
    # at a 50% pass rate. G=8 from Table3's accuracy estimation setting.
    azr_counts = [0, 1, 4, 8]
    azr_rewards = [0 if count == 0 else 1 - count / 8 for count in azr_counts]
    record("azr_learnability_reward_G8", azr_rewards, [0.0, 0.875, 0.5, 0.0])
    outputs = [i * i + 1 for i in [2, -2]]
    record("abduction_accepts_distinct_inputs_with_equal_outputs", outputs, [5, 5])

    # Compute Bernoulli population variance from explicit 100-element
    # populations, then evaluate SPICE Eq1's Gaussian variance reward.
    spice_counts = [0, 10, 50, 90, 100]
    variances = [pvariance([1] * count + [0] * (100 - count)) for count in spice_counts]
    record("bernoulli_population_variance", variances, [0.0, 0.09, 0.25, 0.09, 0.0])
    spice_rewards = [math.exp(-((variance - 0.25) ** 2) / (2 * 0.01)) for variance in variances]
    record("spice_gaussian_rewards_include_nonzero_endpoints", spice_rewards, [0.04393693362340742, 0.27803730045319414, 1.0, 0.27803730045319414, 0.04393693362340742])

    # R-Few Eq8's interval is a success-rate interval, not a mixing ratio.
    retained = [count for count in range(9) if 0.3 <= count / 8 <= 0.7]
    record("r_few_success_band_for_eight_answers", retained, [3, 4, 5])
    record("r_few_anchor_pool_sizes", [232000 * 0.01, 232000 * 0.05], [2320, 11600])

    passed = all(check["passed"] for check in checks)
    report = {
        "scope": "Illustrative arithmetic and reported-table calculations; not a training replication.",
        "result": "PASS" if passed else "FAIL",
        "checks_run": len(checks),
        "failed_checks": sum(not check["passed"] for check in checks),
        "checks": checks,
        "sources": {
            "r_zero": "https://arxiv.org/pdf/2508.05004v4",
            "absolute_zero": "https://arxiv.org/pdf/2505.03335v3",
            "spice": "https://arxiv.org/pdf/2510.24684v1",
            "r_few": "https://arxiv.org/pdf/2512.02472v1",
        },
        "r_zero_figure3": curves,
        "settings": {"r_zero_answers": 10, "azr_accuracy_estimate_G": 8, "r_few_answers": 8, "spice_variance_example": "population Bernoulli variance"},
    }
    if output:
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps(report, ensure_ascii=False))
    if not passed:
        raise SystemExit(1)
    return report


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    main(args.output)
