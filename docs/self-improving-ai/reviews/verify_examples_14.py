"""Check chapter 14's educational calculations with exact rational arithmetic.

The scalar losses, answer batches, repetition cluster, and verifier confusion
tables are invented examples, not experimental results. AZR's basic proposer
reward and R-Zero's uncertainty/composite reward are taken from their cited
papers. These calculations do not reproduce their training algorithms.

Independent checks use central differences for the quadratic, an alternative
piecewise form of the triangular reward, and explicit finite populations for
the verifier's conditional precision. No models or third-party packages run.
"""
from __future__ import annotations

import argparse
import json
from collections import Counter
from fractions import Fraction
from pathlib import Path


def proxy_loss(theta: Fraction) -> Fraction:
    return (theta - 1) ** 2


def evaluation_loss(theta: Fraction) -> Fraction:
    return (theta + 1) ** 2


def azr_basic_proposer_reward(successes: int, trials: int) -> Fraction:
    """AZR v3 Eq. 4 only: exclude Eq. 6's additional format penalties."""
    if trials <= 0 or not 0 <= successes <= trials:
        raise ValueError("Require positive trials and a valid success count.")
    return Fraction(0) if successes == 0 else 1 - Fraction(successes, trials)


def mode_fraction(answers: list[int | str]) -> tuple[int | str, Fraction]:
    """Use a unique mode; these example answer batches have no tied modes."""
    if not answers:
        raise ValueError("The answer batch must not be empty.")
    counts = Counter(answers)
    ranking = counts.most_common()
    if len(ranking) > 1 and ranking[0][1] == ranking[1][1]:
        raise ValueError("The examples require a unique most frequent answer.")
    return ranking[0][0], Fraction(ranking[0][1], len(answers))


def r_zero_uncertainty(consistency: Fraction) -> Fraction:
    if not 0 <= consistency <= 1:
        raise ValueError("Consistency must be in [0, 1].")
    return 1 - 2 * abs(consistency - Fraction(1, 2))


def verifier_precision(
    correct_rate: Fraction, true_accept: Fraction, false_accept: Fraction
) -> Fraction:
    accepted_correct = correct_rate * true_accept
    accepted_wrong = (1 - correct_rate) * false_accept
    if accepted_correct + accepted_wrong == 0:
        raise ValueError("Conditional precision is undefined with no acceptances.")
    return accepted_correct / (accepted_correct + accepted_wrong)


def explicit_population(correct: int, wrong: int) -> list[tuple[bool, bool]]:
    """Enumerate records at the article's 90%/10% conditional accept rates.

    The first flag is known correctness; the second is verifier acceptance.
    Counts must be multiples of ten. This is a deterministic confusion table,
    not an independence assumption or random simulation.
    """
    if correct % 10 or wrong % 10:
        raise ValueError("Use counts divisible by ten for the exact example.")
    return ([(True, True)] * (9 * correct // 10)
            + [(True, False)] * (correct // 10)
            + [(False, True)] * (wrong // 10)
            + [(False, False)] * (9 * wrong // 10))


def serializable(value):
    if isinstance(value, Fraction):
        return float(value)
    if isinstance(value, dict):
        return {str(key): serializable(item) for key, item in value.items()}
    if isinstance(value, (list, tuple)):
        return [serializable(item) for item in value]
    return value


def main(output: Path | None = None) -> dict:
    checks = []

    def record(name: str, actual, expected):
        checks.append({"name": name, "actual": serializable(actual),
                       "expected": serializable(expected), "passed": actual == expected})

    theta = Fraction(0)
    learning_rate = Fraction(1, 4)
    analytic_gradient = 2 * (theta - 1)
    h = Fraction(1, 1000)
    central_gradient = (proxy_loss(theta + h) - proxy_loss(theta - h)) / (2 * h)
    record("quadratic_gradient_by_central_difference", central_gradient, analytic_gradient)
    updated = theta - learning_rate * central_gradient
    record("one_gradient_step", updated, Fraction(1, 2))
    record("proxy_and_evaluation_losses_before_after",
           [(proxy_loss(theta), proxy_loss(updated)),
            (evaluation_loss(theta), evaluation_loss(updated))],
           [(Fraction(1), Fraction(1, 4)), (Fraction(1), Fraction(9, 4))])
    record("loss_changes_have_opposite_signs",
           [proxy_loss(updated) - proxy_loss(theta),
            evaluation_loss(updated) - evaluation_loss(theta)],
           [Fraction(-3, 4), Fraction(5, 4)])
    record("quadratic_descent_closed_form",
           proxy_loss(updated), (1 - 2 * learning_rate) ** 2 * proxy_loss(theta))

    azr_counts = [0, 1, 5, 9, 10]
    azr_rewards = [azr_basic_proposer_reward(count, 10) for count in azr_counts]
    record("azr_basic_reward_table", azr_rewards,
           [Fraction(0), Fraction(9, 10), Fraction(1, 2), Fraction(1, 10), Fraction(0)])
    all_azr_rewards = [azr_basic_proposer_reward(count, 10) for count in range(11)]
    record("azr_largest_reward_at_first_observed_success",
           all_azr_rewards.index(max(all_azr_rewards)), 1)

    # Three / ten can be the unique mode: "majority vote" need not exceed 50%.
    batches = [
        ["a"] * 3 + ["b"] * 2 + ["c"] * 2 + ["d"] * 2 + ["e"],
        ["a"] * 5 + ["b"] * 3 + ["c"] * 2,
        ["a"] * 7 + ["b"] * 2 + ["c"],
        ["a"] * 10,
    ]
    consistencies = [mode_fraction(batch)[1] for batch in batches]
    record("r_zero_consistency_from_answer_counts", consistencies,
           [Fraction(3, 10), Fraction(1, 2), Fraction(7, 10), Fraction(1)])
    uncertainties = [r_zero_uncertainty(p) for p in consistencies]
    record("r_zero_uncertainty_table", uncertainties,
           [Fraction(3, 5), Fraction(1), Fraction(3, 5), Fraction(0)])
    repetition_penalty = Fraction(4, 20)
    rewards = [max(Fraction(0), value - repetition_penalty) for value in uncertainties]
    record("r_zero_composite_reward_table", rewards,
           [Fraction(2, 5), Fraction(4, 5), Fraction(2, 5), Fraction(0)])
    record("triangular_reward_independent_piecewise_form", uncertainties,
           [2 * min(p, 1 - p) for p in consistencies])

    false_consensus = [381] * 7 + [391] * 2 + [401]
    known_answer = sum(23 for _ in range(17))
    pseudo_label, consistency = mode_fraction(false_consensus)
    genuine_correct = Fraction(sum(answer == known_answer for answer in false_consensus), 10)
    record("false_consensus_does_not_measure_correctness",
           [known_answer, pseudo_label, consistency, genuine_correct],
           [391, 381, Fraction(7, 10), Fraction(1, 5)])
    r_few_mode, r_few_consistency = mode_fraction([30, 30, 35, 35, 30])
    record("r_few_illustrative_figure_equation_vs_pseudo_label",
           [Fraction(100 - 30, 2), r_few_mode, r_few_consistency, 2 * r_few_mode + 30],
           [Fraction(35), 30, Fraction(3, 5), 90])

    populations = [explicit_population(600, 400), explicit_population(200, 800)]
    confusion_counts = [
        [sum(correct and accepted for correct, accepted in population),
         sum(not correct and accepted for correct, accepted in population),
         sum(accepted for _, accepted in population)]
        for population in populations
    ]
    record("verifier_confusion_tables", confusion_counts, [[540, 40, 580], [180, 80, 260]])
    precisions = [verifier_precision(p, Fraction(9, 10), Fraction(1, 10))
                  for p in [Fraction(3, 5), Fraction(1, 5)]]
    record("verifier_precision_from_conditional_probabilities", precisions,
           [Fraction(27, 29), Fraction(9, 13)])
    enumerated = [Fraction(true_positive, accepted)
                  for true_positive, _, accepted in confusion_counts]
    record("verifier_precision_matches_explicit_population", enumerated, precisions)

    passed = all(check["passed"] for check in checks)
    report = {
        "scope": "Pedagogical proxy-loss, curriculum-reward, and verifier-precision examples; not benchmark reproduction.",
        "result": "PASS" if passed else "FAIL",
        "checks_run": len(checks),
        "failed_checks": sum(not check["passed"] for check in checks),
        "checks": checks,
        "settings": {
            "empirical_results": False,
            "scalar_initial_parameter": 0,
            "scalar_learning_rate": 0.25,
            "scalar_proxy_loss": "(theta - 1)^2",
            "scalar_evaluation_loss": "(theta + 1)^2",
            "azr_reward_scope": "basic proposer reward, v3 Eq.4; excludes composite format and wrong-answer penalties in Eq.6",
            "azr_trials": 10,
            "r_zero_samples_per_question": 10,
            "r_zero_repetition_cluster_size": 4,
            "r_zero_batch_size": 20,
            "r_zero_repetition_coefficient": 1,
            "r_zero_format_assumption": "all example questions pass the format check",
            "r_zero_consistency_is_true_accuracy": False,
            "verifier_population_size": 1000,
            "verifier_initial_correct_rates": [0.6, 0.2],
            "verifier_true_accept_rate": 0.9,
            "verifier_false_accept_rate": 0.1,
            "verifier_rates_assumed_transfer_between_populations": True,
            "verifier_independence_required": False,
            "limitations": ["fixed hypothetical loss functions and one scalar parameter",
                            "synthetic response counts, not LLM-generated answers",
                            "conditional verifier rates supplied for the example, not measured",
                            "no causal claim about training performance or future benchmark gains"],
        },
        "sources": {
            "lecture": "https://speech.ee.ntu.edu.tw/~hylee/ml/ml2026-course-data/self-evolving-agent.pdf#page=4",
            "azr_basic_rewards": "https://arxiv.org/pdf/2505.03335v3#page=5",
            "r_zero_rewards": "https://arxiv.org/pdf/2508.05004v4#page=3",
            "r_zero_composite": "https://arxiv.org/pdf/2508.05004v4#page=4",
            "r_few_illustrative_figure": "https://arxiv.org/pdf/2512.02472v1#page=4",
            "proxy_counterexample_and_verifier_table": "constructed for this article",
        },
    }
    if output is not None:
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
