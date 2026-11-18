"""Check chapter 09's illustrative gradients and published-table arithmetic.

Uses only the Python standard library. This is not an ASR experiment replication.
The two conditional token distributions are held fixed while the root logit
changes. Every logarithm is natural, so entropies are measured in nats.
"""
from __future__ import annotations

import argparse
import itertools
import json
import math
import unittest
from pathlib import Path


PAPER_URL = "https://arxiv.org/pdf/2605.08186v1#page=6"
# Published Avg WER (%) in Tables 2, 3 and 4: EM-tok -> EM-tok-b.
# These reported averages are not pooled word-count WER reconstructed here.
WER_ROWS = [
    {"dataset": "LS-C", "table": 2, "em_tok": 20.77, "em_tok_b": 19.15},
    {"dataset": "L2-Arctic", "table": 3, "em_tok": 17.05, "em_tok_b": 16.21},
    {"dataset": "MLS", "table": 4, "em_tok": 24.07, "em_tok_b": 22.63},
]


def sigmoid(logit: float) -> float:
    if logit >= 0:
        return 1.0 / (1.0 + math.exp(-logit))
    value = math.exp(logit)
    return value / (1.0 + value)


def entropy(probabilities: list[float]) -> float:
    if (
        not probabilities
        or any(not math.isfinite(p) or p < 0 for p in probabilities)
        or not math.isclose(sum(probabilities), 1.0, abs_tol=1e-12)
    ):
        raise ValueError("Expected a normalized finite probability distribution.")
    return -sum(p * math.log(p) for p in probabilities if p > 0)


def binary_entropy(p: float) -> float:
    return entropy([p, 1.0 - p])


def joint_probabilities(theta: float, a: float = 0.9, b: float = 0.6) -> list[float]:
    p = sigmoid(theta)
    return [p * a, p * (1 - a), (1 - p) * b, (1 - p) * (1 - b)]


def joint_entropy(theta: float, a: float = 0.9, b: float = 0.6) -> float:
    """Independent reference objective: enumerate all four output sequences."""
    return entropy(joint_probabilities(theta, a, b))


def path_quantities(theta: float, a: float = 0.9, b: float = 0.6):
    p = sigmoid(theta)
    costs = [binary_entropy(p) + binary_entropy(a),
             binary_entropy(p) + binary_entropy(b)]
    # d log P(A)/d theta and d log P(B)/d theta.
    return [p, 1 - p], costs, [1 - p, -p]


def gradient_terms(theta: float, baseline: float = 0.0, a: float = 0.9, b: float = 0.6):
    probabilities, costs, scores = path_quantities(theta, a, b)
    p = probabilities[0]
    direct = p * (1 - p) * math.log((1 - p) / p)
    selection = sum(q * (cost - baseline) * score
                    for q, cost, score in zip(probabilities, costs, scores))
    return direct, selection


def finite_difference(theta: float, a: float = 0.9, b: float = 0.6) -> float:
    step = 1e-6
    return (joint_entropy(theta + step, a, b) - joint_entropy(theta - step, a, b)) / (2 * step)


def expected_two_sample_estimate(theta: float, leave_one_out: bool) -> float:
    """Enumerate independent pairs, exposing self-including baseline bias."""
    probabilities, costs, scores = path_quantities(theta)
    expectation = 0.0
    for first, second in itertools.product(range(2), repeat=2):
        pair_probability = probabilities[first] * probabilities[second]
        if leave_one_out:
            baselines = [costs[second], costs[first]]
        else:
            mean = (costs[first] + costs[second]) / 2
            baselines = [mean, mean]
        estimate = ((costs[first] - baselines[0]) * scores[first]
                    + (costs[second] - baselines[1]) * scores[second]) / 2
        expectation += pair_probability * estimate
    return expectation


def word_error_rate(substitutions: int, deletions: int, insertions: int, reference_words: int) -> float:
    """Return a fraction; insertions permit values above 1 (100%)."""
    counts = [substitutions, deletions, insertions, reference_words]
    if any(type(value) is not int or value < 0 for value in counts) or reference_words == 0:
        raise ValueError("Use nonnegative integer error counts and positive reference length.")
    return (substitutions + deletions + insertions) / reference_words


def wer_change(before: float, after: float) -> tuple[float, float]:
    """Inputs are WER percentages; return improvement in pp and relative %."""
    if not all(math.isfinite(value) and value >= 0 for value in (before, after)) or before == 0:
        raise ValueError("A positive reference WER is required for relative change.")
    absolute_pp = before - after
    return absolute_pp, 100.0 * absolute_pp / before


class Chapter09Examples(unittest.TestCase):
    def test_01_four_sequence_probabilities(self):
        expected = [0.45, 0.05, 0.30, 0.20]
        for actual, target in zip(joint_probabilities(0), expected):
            self.assertAlmostEqual(actual, target)

    def test_02_conditional_and_path_entropies(self):
        self.assertAlmostEqual(binary_entropy(0.9), 0.3250829733914482)
        self.assertAlmostEqual(binary_entropy(0.6), 0.6730116670092565)
        _, costs, _ = path_quantities(0)
        self.assertAlmostEqual(costs[0], 1.0182301539513934)
        self.assertAlmostEqual(costs[1], 1.366158847569202)

    def test_03_chain_rule_against_joint_enumeration(self):
        for theta in [-1.1, 0.0, 0.7]:
            probabilities, costs, _ = path_quantities(theta)
            self.assertAlmostEqual(sum(p * c for p, c in zip(probabilities, costs)), joint_entropy(theta))

    def test_04_complete_gradient_matches_joint_finite_difference(self):
        for theta, a, b in [(-1.1, 0.9, 0.6), (0.0, 0.9, 0.6), (0.7, 0.9, 0.6), (0.0, 0.6, 0.9)]:
            direct, selection = gradient_terms(theta, a=a, b=b)
            self.assertAlmostEqual(direct + selection, finite_difference(theta, a, b), places=7)

    def test_05_root_direct_term_zero_but_selection_negative(self):
        direct, selection = gradient_terms(0)
        self.assertEqual(direct, 0)
        self.assertAlmostEqual(selection, -0.08698217340445208)

    def test_06_mean_cost_advantages_have_opposite_signs(self):
        probabilities, costs, _ = path_quantities(0)
        baseline = sum(p * c for p, c in zip(probabilities, costs))
        self.assertAlmostEqual(baseline, 1.1921945007602976)
        self.assertAlmostEqual(costs[0] - baseline, -0.17396434680890427)
        self.assertAlmostEqual(costs[1] - baseline, 0.17396434680890427)

    def test_07_expected_score_is_zero(self):
        for theta in [-1.1, 0.0, 0.7]:
            probabilities, _, scores = path_quantities(theta)
            self.assertAlmostEqual(sum(p * s for p, s in zip(probabilities, scores)), 0)

    def test_08_fixed_action_independent_baseline_preserves_expectation(self):
        for theta in [-1.1, 0.0, 0.7]:
            reference = gradient_terms(theta)[1]
            for baseline in [-3.0, 0.4, joint_entropy(theta), 2.0]:
                self.assertAlmostEqual(gradient_terms(theta, baseline)[1], reference)

    def test_09_descent_moves_mass_to_lower_entropy_branch(self):
        theta_after = -0.1 * sum(gradient_terms(0))
        self.assertAlmostEqual(theta_after, 0.008698217340445208)
        self.assertAlmostEqual(sigmoid(theta_after), 0.5021745406248339)
        self.assertLess(joint_entropy(theta_after), joint_entropy(0))

    def test_10_swapping_conditional_entropies_reverses_selection(self):
        self.assertAlmostEqual(gradient_terms(0, a=0.6, b=0.9)[1], -gradient_terms(0)[1])

    def test_11_equal_conditional_entropies_remove_selection(self):
        for theta in [-1.1, 0.0, 0.7]:
            self.assertAlmostEqual(gradient_terms(theta, a=0.9, b=0.9)[1], 0)

    def test_12_weighted_correction_is_not_exact_entropy_gradient(self):
        direct, selection = gradient_terms(0)
        weighted = direct + 0.1 * selection
        self.assertAlmostEqual(weighted, -0.008698217340445208)
        self.assertNotAlmostEqual(weighted, finite_difference(0))

    def test_13_self_including_two_sample_baseline_is_biased(self):
        for theta in [-1.1, 0.0, 0.7]:
            self.assertAlmostEqual(expected_two_sample_estimate(theta, False), 0.5 * gradient_terms(theta)[1])

    def test_14_leave_one_out_two_sample_baseline_preserves_expectation(self):
        for theta in [-1.1, 0.0, 0.7]:
            self.assertAlmostEqual(expected_two_sample_estimate(theta, True), gradient_terms(theta)[1])

    def test_15_action_dependent_baseline_can_remove_the_signal(self):
        probabilities, costs, scores = path_quantities(0)
        # Taking each sampled cost as its own baseline zeros every contribution.
        dependent_estimate = sum(p * (c - c) * s for p, c, s in zip(probabilities, costs, scores))
        self.assertEqual(dependent_estimate, 0)
        self.assertNotAlmostEqual(dependent_estimate, gradient_terms(0)[1])

    def test_16_published_wer_absolute_improvements(self):
        for row, expected_pp in zip(WER_ROWS, [1.62, 0.84, 1.44]):
            self.assertAlmostEqual(wer_change(row["em_tok"], row["em_tok_b"])[0], expected_pp)

    def test_17_published_wer_relative_improvements(self):
        expected = [7.799711121810309, 4.926686217008797, 5.9825508932280895]
        for row, target in zip(WER_ROWS, expected):
            self.assertAlmostEqual(wer_change(row["em_tok"], row["em_tok_b"])[1], target)

    def test_18_wer_uses_reference_word_count(self):
        self.assertAlmostEqual(word_error_rate(2, 1, 1, 20), 0.2)

    def test_19_insertions_allow_wer_above_one_hundred_percent(self):
        self.assertEqual(word_error_rate(0, 0, 6, 4), 1.5)

    def test_20_pooled_wer_is_not_mean_utterance_wer(self):
        # Two synthetic references of lengths 10 and 2, with 1 and 0 errors.
        mean_utterance = (word_error_rate(1, 0, 0, 10) + word_error_rate(0, 0, 0, 2)) / 2
        pooled = word_error_rate(1, 0, 0, 12)
        self.assertAlmostEqual(mean_utterance, 0.05)
        self.assertAlmostEqual(pooled, 1 / 12)
        self.assertNotAlmostEqual(mean_utterance, pooled)

    def test_21_invalid_wer_inputs_are_rejected(self):
        for values in [(-1, 0, 0, 10), (0, 0, 0, 0), (0.5, 0, 0, 10)]:
            with self.assertRaises(ValueError):
                word_error_rate(*values)
        with self.assertRaises(ValueError):
            wer_change(0, 0)


def report(result: unittest.TestResult) -> dict:
    probabilities, costs, scores = path_quantities(0)
    baseline = sum(p * c for p, c in zip(probabilities, costs))
    direct, selection = gradient_terms(0)
    theta_after = -0.1 * (direct + selection)
    comparisons = []
    for row in WER_ROWS:
        pp, relative = wer_change(row["em_tok"], row["em_tok_b"])
        comparisons.append({**row, "absolute_decrease_pp": pp, "relative_decrease_percent": relative})
    return {
        "scope": "Illustrative fixed-horizon probability-tree checks and arithmetic on reported WER averages; not an ASR/LLM experiment replication.",
        "tests_run": result.testsRun,
        "failures": len(result.failures),
        "errors": len(result.errors),
        "result": "PASS" if result.wasSuccessful() else "FAIL",
        "tree_example": {
            "conditional_distributions_fixed": [[0.9, 0.1], [0.6, 0.4]],
            "initial_root_logit": 0.0,
            "root_probabilities": probabilities,
            "joint_probabilities": joint_probabilities(0),
            "conditional_entropies_nats": [binary_entropy(0.9), binary_entropy(0.6)],
            "path_costs_nats": costs,
            "expected_cost_nats": baseline,
            "advantages_with_fixed_expected_cost_baseline": [c - baseline for c in costs],
            "root_log_probability_scores": scores,
            "direct_gradient": direct,
            "selection_gradient": selection,
            "full_gradient": direct + selection,
            "finite_difference_joint_entropy": finite_difference(0),
            "lambda_0_1_weighted_gradient": direct + 0.1 * selection,
            "descent_learning_rate": 0.1,
            "updated_root_logit": theta_after,
            "updated_probability_A": sigmoid(theta_after),
            "updated_joint_entropy_nats": joint_entropy(theta_after),
            "two_sample_self_including_baseline_expected_gradient": expected_two_sample_estimate(0, False),
            "two_sample_leave_one_out_baseline_expected_gradient": expected_two_sample_estimate(0, True),
        },
        "reported_wer_arithmetic": {
            "source": PAPER_URL,
            "source_rows": "EM-tok and EM-tok-b; Avg WER (%) columns",
            "comparisons": comparisons,
        },
        "synthetic_wer_examples": {
            "S2_D1_I1_N20_fraction": word_error_rate(2, 1, 1, 20),
            "S0_D0_I6_N4_fraction": word_error_rate(0, 0, 6, 4),
            "two_utterance_unweighted_mean_fraction": 0.05,
            "two_utterance_pooled_fraction": word_error_rate(1, 0, 0, 12),
        },
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path)
    arguments = parser.parse_args()
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(Chapter09Examples)
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    evidence = report(result)
    if arguments.output:
        arguments.output.parent.mkdir(parents=True, exist_ok=True)
        arguments.output.write_text(json.dumps(evidence, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps(evidence, ensure_ascii=False))
    raise SystemExit(not result.wasSuccessful())
