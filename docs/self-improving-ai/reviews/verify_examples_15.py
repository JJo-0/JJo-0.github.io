"""Verify chapter 15's invented harness-comparison and reliability examples.

This does not run an agent or reproduce a paper's benchmark results. Exact
rational arithmetic is used for paired outcomes, token budgets, and tau-bench's
finite-sample estimators. The combination formulas are checked independently by
enumerating trial subsets. Unbiasedness is checked by enumerating every outcome
of a small Bernoulli experiment and assigning its exact probability.
"""
from __future__ import annotations

import argparse
import json
from fractions import Fraction
from itertools import combinations, product
from math import comb
from pathlib import Path


def mean(values) -> Fraction:
    values = list(values)
    if not values:
        raise ValueError("A mean requires at least one observation.")
    return sum(values, Fraction(0)) / len(values)


def pass_estimators(successes: int, trials: int, k: int) -> tuple[Fraction, Fraction]:
    """Per-task pass^k and pass@k; average these over tasks afterwards.

    The intended target uses conditionally independent, identically distributed
    repeated trials of each reset task. comb(a, k) is zero when 0 <= a < k.
    """
    if not 0 <= successes <= trials or not 1 <= k <= trials:
        raise ValueError("Require 0 <= successes <= trials and 1 <= k <= trials.")
    denominator = comb(trials, k)
    return (Fraction(comb(successes, k), denominator),
            1 - Fraction(comb(trials - successes, k), denominator))


def enumerate_subsets(outcomes: tuple[bool, ...], k: int) -> dict:
    """Independent oracle: inspect every k-element subset of a fixed record."""
    subsets = list(combinations(outcomes, k))
    if not subsets:
        raise ValueError("No subsets exist for the requested size.")
    all_success = sum(all(sample) for sample in subsets)
    any_success = sum(any(sample) for sample in subsets)
    return {"subsets": len(subsets), "all": all_success, "any": any_success,
            "estimates": (Fraction(all_success, len(subsets)),
                          Fraction(any_success, len(subsets)))}


def bernoulli_expectations(p: Fraction, trials: int, k: int) -> dict:
    """Integrate over all 2**trials records, with no random simulation."""
    mass = Fraction(0)
    expected_all = Fraction(0)
    expected_any = Fraction(0)
    for outcomes in product((False, True), repeat=trials):
        successes = sum(outcomes)
        probability = p ** successes * (1 - p) ** (trials - successes)
        estimated_all, estimated_any = pass_estimators(successes, trials, k)
        mass += probability
        expected_all += probability * estimated_all
        expected_any += probability * estimated_any
    return {"mass": mass, "all": expected_all, "any": expected_any}


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

    # Explicit paired task records: flags are old-harness and new-harness success.
    paired = ([(True, True)] * 60 + [(True, False)] * 10
              + [(False, True)] * 20 + [(False, False)] * 10)
    old_score = mean(old for old, _ in paired)
    new_score = mean(new for _, new in paired)
    improvements = sum(not old and new for old, new in paired)
    regressions = sum(old and not new for old, new in paired)
    paired_delta = mean(int(new) - int(old) for old, new in paired)
    record("paired_table_has_100_identical_task_ids", len(paired), 100)
    record("paired_success_rates", [old_score, new_score],
           [Fraction(7, 10), Fraction(4, 5)])
    record("paired_improvements_and_regressions", [improvements, regressions], [20, 10])
    record("paired_difference_matches_discordant_counts",
           [paired_delta, new_score - old_score,
            Fraction(improvements - regressions, len(paired))],
           [Fraction(1, 10)] * 3)

    # A separate fictional experiment. Token variation also demonstrates why a
    # mean budget is different from a per-task maximum. No real API prices apply.
    token_records = {"A": [900, 1100] * 50,
                     "B": [1500, 2500] * 50,
                     "C": [1000, 2000] * 50}
    success_records = {"A": [True] * 70 + [False] * 30,
                       "B": [True] * 80 + [False] * 20,
                       "C": [True] * 78 + [False] * 22}
    total_tokens = {name: sum(values) for name, values in token_records.items()}
    average_tokens = {name: mean(values) for name, values in token_records.items()}
    scores = {name: mean(values) for name, values in success_records.items()}
    record("cost_table_total_tokens", total_tokens,
           {"A": 100000, "B": 200000, "C": 150000})
    record("cost_table_average_tokens", average_tokens,
           {"A": Fraction(1000), "B": Fraction(2000), "C": Fraction(1500)})
    record("cost_table_success_rates", scores,
           {"A": Fraction(7, 10), "B": Fraction(4, 5), "C": Fraction(39, 50)})
    budget = 1500
    feasible = [name for name in scores if average_tokens[name] <= budget]
    constrained_winner = max(feasible, key=scores.get)
    unconstrained_winner = max(scores, key=scores.get)
    record("budget_feasible_candidates_and_winners",
           [feasible, constrained_winner, unconstrained_winner], [["A", "C"], "C", "B"])
    record("c_vs_a_success_gain_and_token_increase",
           [scores["C"] - scores["A"], average_tokens["C"] / average_tokens["A"] - 1],
           [Fraction(2, 25), Fraction(1, 2)])
    extra_successes = sum(success_records["B"]) - sum(success_records["C"])
    extra_tokens = total_tokens["B"] - total_tokens["C"]
    record("b_vs_c_incremental_tokens_per_additional_success",
           [extra_successes, extra_tokens, Fraction(extra_tokens, extra_successes)],
           [2, 50000, Fraction(25000)])
    search_tokens, deployed_tasks = 300000, 100
    record("search_plus_execution_tokens",
           search_tokens + deployed_tasks * average_tokens["C"], Fraction(450000))
    record("mean_budget_does_not_bound_every_request",
           [average_tokens["C"] <= budget, max(token_records["C"]) <= budget,
            sum(tokens > budget for tokens in token_records["C"])],
           [True, False, 50])

    observed_trials = [(True, True, True, True, False),
                       (True, True, False, False, False)]
    subsets = [enumerate_subsets(trials, 2) for trials in observed_trials]
    record("reliability_counts_from_all_ten_pairs_per_task",
           [[row["subsets"], row["all"], row["any"]] for row in subsets],
           [[10, 6, 10], [10, 1, 7]])
    estimates = [pass_estimators(sum(trials), len(trials), 2) for trials in observed_trials]
    record("pass2_and_passat2_match_explicit_subsets", estimates,
           [row["estimates"] for row in subsets])
    pass1 = mean(mean(trials) for trials in observed_trials)
    pass2 = mean(row[0] for row in estimates)
    passat2 = mean(row[1] for row in estimates)
    record("article_reliability_results", [pass1, pass2, passat2],
           [Fraction(3, 5), Fraction(7, 20), Fraction(17, 20)])
    all_subset_checks = [
        pass_estimators(sum(trials), len(trials), k)
        == enumerate_subsets(trials, k)["estimates"]
        for trials in observed_trials for k in range(1, 6)
    ]
    record("finite_estimators_for_every_available_k", all_subset_checks, [True] * 10)

    # These values illustrate the algebra of task heterogeneity. Treating an
    # observed c/n as p is a plug-in estimate, distinct from the unbiased U-statistic.
    per_task_rates = [mean(trials) for trials in observed_trials]
    mean_rate = mean(per_task_rates)
    mean_square = mean(rate ** 2 for rate in per_task_rates)
    variance = mean((rate - mean_rate) ** 2 for rate in per_task_rates)
    record("mean_of_squares_vs_square_of_mean",
           [mean_square, mean_rate ** 2, variance, mean_square - mean_rate ** 2],
           [Fraction(2, 5), Fraction(9, 25), Fraction(1, 25), Fraction(1, 25)])
    record("combination_estimate_is_not_the_plugin_square",
           [pass2, mean_square, pass2 != mean_square],
           [Fraction(7, 20), Fraction(2, 5), True])

    # For this independent distributional check only, p values are specified
    # exactly; they are not inferred true probabilities of the observed examples.
    true_probabilities = [Fraction(4, 5), Fraction(2, 5)]
    distributions = [bernoulli_expectations(p, 5, 2) for p in true_probabilities]
    record("bernoulli_enumeration_probability_mass",
           [row["mass"] for row in distributions], [Fraction(1), Fraction(1)])
    record("finite_estimators_are_unbiased_under_iid_trials",
           [(row["all"], row["any"]) for row in distributions],
           [(p ** 2, 1 - (1 - p) ** 2) for p in true_probabilities])

    passed = all(check["passed"] for check in checks)
    report = {
        "scope": "Invented paired harness outcomes, token budgets, and tau-bench reliability calculations; not benchmark reproduction.",
        "result": "PASS" if passed else "FAIL",
        "checks_run": len(checks),
        "failed_checks": sum(not check["passed"] for check in checks),
        "checks": checks,
        "settings": {
            "empirical_results": False,
            "model_weights_held_fixed_in_examples": True,
            "paired_tasks": 100,
            "paired_comparison": "same task identities, reset starting states, budget, and success criterion",
            "paired_table_is_a_deterministic_example": True,
            "paired_difference_is_a_significance_claim": False,
            "budget_unit": "combined input/output tokens, not dollars or elapsed time",
            "average_tokens_per_task_budget": budget,
            "budget_is_per_task_maximum": False,
            "budget_selection_scope": "three supplied candidates A, B, C",
            "search_tokens": search_tokens,
            "deployed_tasks": deployed_tasks,
            "reliability_observed_successes": [4, 2],
            "reliability_trials_per_task": 5,
            "reliability_k": 2,
            "task_averaging": "equal weight per task, after computing each task's metric",
            "reliability_assumption": "conditionally independent and identically distributed repetitions of each reset task",
            "independent_unbiasedness_oracle": "enumerate all 32 Boolean outcome sequences per supplied Bernoulli probability",
            "success_score_guarantees_all_policy_compliance": False,
            "limitations": [
                "synthetic outcomes and token records, not actual agent executions",
                "no causal estimate or generalization claim from the toy paired table",
                "no guarantee that a system can identify and select the successful pass@k sample",
                "no inference that a finite observed c/n is the true task success probability",
                "no universal optimum beyond the supplied budget candidates",
            ],
        },
        "sources": {
            "lecture": "https://speech.ee.ntu.edu.tw/~hylee/ml/ml2026-course-data/self-evolving-agent.pdf#page=9",
            "tau_bench_metric_definition": "https://arxiv.org/pdf/2406.12045v1#page=4",
            "tau_bench_estimators": "https://arxiv.org/pdf/2406.12045v1#page=5",
            "paired_outcomes_and_token_table": "constructed for this article",
            "reliability_trial_records": "constructed for this article",
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
