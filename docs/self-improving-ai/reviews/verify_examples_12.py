"""Recompute chapter 12's explicit pedagogical examples.

This standard-library program validates PGR interpretation, mixture targets,
finite-difference gradients, adaptive batch thresholding, research-category
entropy, and a simplified Bayesian noise-channel calculation. It does not
reproduce OpenAI or Anthropic training experiments. All performance values
used in the arithmetic examples are intentionally hypothetical.
"""
from __future__ import annotations

import argparse
import json
import math
from pathlib import Path


def pgr(student: float, teacher: float, ceiling: float) -> float:
    """Use a positive reference gap; retain results outside [0, 1]."""
    if ceiling <= teacher:
        raise ValueError("The reference ceiling must exceed the weak teacher.")
    return (student - teacher) / (ceiling - teacher)


def bce(prediction: float, target: float) -> float:
    if not 0.0 < prediction < 1.0 or not 0.0 <= target <= 1.0:
        raise ValueError("BCE inputs must be probabilities; prediction is interior.")
    return -target * math.log(prediction) - (1.0 - target) * math.log1p(-prediction)


def sigmoid(logit: float) -> float:
    return 1.0 / (1.0 + math.exp(-logit))


def entropy(counts: list[int]) -> float:
    total = sum(counts)
    return -sum((n / total) * math.log(n / total) for n in counts if n)


def posterior_positive(prior: float, likelihood_if_positive: float, likelihood_if_negative: float) -> float:
    positive = prior * likelihood_if_positive
    negative = (1.0 - prior) * likelihood_if_negative
    return positive / (positive + negative)


def main(output: Path | None = None) -> dict:
    checks = []

    def record(name: str, actual, expected, *, tolerance: float = 1e-10):
        left = actual if isinstance(actual, list) else [actual]
        right = expected if isinstance(expected, list) else [expected]
        passed = len(left) == len(right) and all(
            math.isclose(a, b, rel_tol=tolerance, abs_tol=tolerance)
            for a, b in zip(left, right)
        )
        checks.append({"name": name, "actual": actual, "expected": expected, "passed": passed})

    # Hypothetical same-set accuracies. These are not source experiment data.
    record("PGR_is_distinct_from_student_accuracy", pgr(0.78, 0.60, 0.90), 0.60)
    record("PGR_reference_endpoints", [pgr(0.60, 0.60, 0.90), pgr(0.90, 0.60, 0.90)], [0.0, 1.0])
    record("PGR_is_not_clipped", [pgr(0.57, 0.60, 0.90), pgr(0.93, 0.60, 0.90)], [-0.1, 1.1])
    invalid_gaps_rejected = 0
    for ceiling in [0.60, 0.50]:
        try:
            pgr(0.78, 0.60, ceiling)
        except ValueError:
            invalid_gaps_rejected += 1
    record("zero_or_negative_reference_gap_rejected", invalid_gaps_rejected, 2)

    # This demonstrates what a negative PGR can mean for ordinary accuracy.
    # The -0.12 is a reported PGR; the .60/.90 anchors below are hypothetical.
    illustrative_accuracy = 0.60 + (-0.12) * (0.90 - 0.60)
    record("negative_PGR_does_not_mean_negative_accuracy", illustrative_accuracy, 0.564)

    # OpenAI Appendix A.4: mixed weak target and hardened student prediction.
    q, h, p = 0.2, 1.0, 0.7
    alphas = [0.0, 0.5, 0.75]
    mixed = [(1.0 - alpha) * q + alpha * h for alpha in alphas]
    record("mixed_targets_for_article_table", mixed, [0.2, 0.6, 0.8])
    errors = []
    for prediction in [0.01, 0.2, 0.7, 0.99]:
        for weak in [0.0, 0.2, 0.8, 1.0]:
            for hard in [0.0, 1.0]:
                for alpha in [0.0, 0.5, 0.75, 1.0]:
                    weighted_losses = (1.0 - alpha) * bce(prediction, weak) + alpha * bce(prediction, hard)
                    mixed_target_loss = bce(prediction, (1.0 - alpha) * weak + alpha * hard)
                    errors.append(abs(weighted_losses - mixed_target_loss))
    record("BCE_target_linearity_across_128_cases", max(errors), 0.0)

    z = math.log(p / (1.0 - p))
    step = 1e-5
    gradients = []
    for alpha in alphas:
        def loss(logit: float) -> float:
            prediction = sigmoid(logit)
            return (1.0 - alpha) * bce(prediction, q) + alpha * bce(prediction, h)
        gradients.append((loss(z + step) - loss(z - step)) / (2.0 * step))
    record("fixed_target_logit_gradient_finite_difference", gradients, [0.5, 0.1, -0.1], tolerance=1e-8)

    # A balanced batch can have all predictions below .5. Adaptive t is not
    # the same as the common fixed .5 threshold. No ties in this example.
    probabilities = [0.1, 0.2, 0.3, 0.4]
    adaptive_threshold = (probabilities[1] + probabilities[2]) / 2.0
    record("adaptive_threshold_can_differ_from_half", adaptive_threshold, 0.25)
    record("adaptive_vs_fixed_positive_counts", [sum(v > adaptive_threshold for v in probabilities), sum(v > 0.5 for v in probabilities)], [2, 0])
    progress = [0.0, 0.1, 0.2, 0.8]
    record("alpha_warmup_for_largest_student", [0.75 * min(fraction / 0.2, 1.0) for fraction in progress], [0.0, 0.375, 0.75, 0.75])

    record("research_family_entropy_nine_workers", [entropy([9]), entropy([3, 3, 3]), entropy([1] * 9)], [0.0, 1.0986122886681098, 2.1972245773362196])
    record("zero_count_families_do_not_change_entropy", entropy([3, 0, 3, 0, 3]), math.log(3))

    # Hypothetical likelihoods, not measured channels from the AAR paper.
    record("posterior_balances_opposed_signals", posterior_positive(0.8, 0.2, 0.8), 0.5)
    record("less_informative_teacher_retains_more_prior", posterior_positive(0.8, 0.45, 0.55), 0.7659574468085106)
    record("uninformative_teacher_preserves_prior", posterior_positive(0.8, 0.5, 0.5), 0.8)

    passed = all(check["passed"] for check in checks)
    report = {
        "scope": "Pedagogical calculations only; no training replication and no estimate of actual model accuracies.",
        "result": "PASS" if passed else "FAIL",
        "checks_run": len(checks),
        "failed_checks": sum(not check["passed"] for check in checks),
        "checks": checks,
        "sources": {
            "weak_to_strong": "https://cdn.openai.com/papers/weak-to-strong-generalization.pdf",
            "PGR_location": "printed/PDF page 6, section 3",
            "confidence_loss_location": "printed/PDF page 33, Appendix A.4, equations (1)-(2)",
            "automated_research": "https://alignment.anthropic.com/2026/automated-w2s-researcher/",
            "idea_entropy_location": "section 3.2",
            "noise_channel_location": "section 4, EM Posterior",
        },
        "settings": {
            "log_base": "natural",
            "example_accuracies": "hypothetical",
            "gradient_target": "fixed hardened target during each finite-difference check",
            "threshold_example": "balanced binary batch, no equal scores",
            "posterior_example": "binary channel likelihoods assumed for explanation",
        },
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
    main(parser.parse_args().output)
