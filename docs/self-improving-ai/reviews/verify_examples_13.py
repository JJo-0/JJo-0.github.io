"""Recompute chapter 13's two explicitly hypothetical numerical examples.

Example 1 uses Generative Agents' per-feature min-max scaling and weighted
memory retrieval. The input values and alternative weights are pedagogical.
Example 2 models independent, identical Bernoulli tool calls with an observed
success and a finite call limit. It is not a model of adaptive agent trials,
nor a measurement of benchmark pass@k or end-to-end task success.

No models, APIs, or third-party packages are required.
"""
from __future__ import annotations

import argparse
import itertools
import json
import math
from fractions import Fraction
from pathlib import Path


def min_max_columns(rows: list[list[Fraction]]) -> list[list[Fraction]]:
    """Scale each feature across candidates; assign constant features zero.

    The zero-range convention is local to this example. The cited paper does
    not specify this convention. A constant feature has no ranking power.
    """
    if not rows or not rows[0] or any(len(row) != len(rows[0]) for row in rows):
        raise ValueError("Provide a nonempty rectangular score matrix.")
    lows = [min(column) for column in zip(*rows)]
    highs = [max(column) for column in zip(*rows)]
    return [
        [
            (value - low) / (high - low) if high != low else Fraction(0)
            for value, low, high in zip(row, lows, highs)
        ]
        for row in rows
    ]


def memory_scores(
    normalized: list[list[Fraction]], weights: list[Fraction]
) -> list[Fraction]:
    if any(len(row) != len(weights) for row in normalized):
        raise ValueError("A weight is required for each score component.")
    return [sum((value * weight for value, weight in zip(row, weights)), Fraction(0))
            for row in normalized]


def capped_retry(p: float, max_calls: int) -> tuple[float, float]:
    """Return success probability and expected calls, including the first call."""
    if not 0.0 <= p <= 1.0 or max_calls < 1:
        raise ValueError("Require p in [0,1] and a positive call limit.")
    failure = 1.0 - p
    success = 1.0 - failure ** max_calls
    # This finite sum is also valid at p=0, unlike the geometric quotient.
    expected_calls = sum(failure ** j for j in range(max_calls))
    return success, expected_calls


def enumerate_stopped_calls(p: Fraction, max_calls: int) -> dict:
    """Independently enumerate potential calls, stopping at the first success.

    The full outcome vector defines an independent probability space. Later
    potential outcomes are marginalized out after the first observed success.
    """
    success = Fraction(0)
    expected = Fraction(0)
    call_distribution = {j: Fraction(0) for j in range(1, max_calls + 1)}
    total = Fraction(0)
    for outcomes in itertools.product([False, True], repeat=max_calls):
        mass = Fraction(1)
        for outcome in outcomes:
            mass *= p if outcome else 1 - p
        first_success = next((j for j, outcome in enumerate(outcomes, 1) if outcome), None)
        calls = first_success if first_success is not None else max_calls
        total += mass
        expected += calls * mass
        call_distribution[calls] += mass
        if first_success is not None:
            success += mass
    return {"success": success, "expected_calls": expected,
            "call_distribution": call_distribution, "total_mass": total}


def as_json(value):
    if isinstance(value, Fraction):
        return float(value)
    if isinstance(value, dict):
        return {key: as_json(item) for key, item in value.items()}
    if isinstance(value, (list, tuple)):
        return [as_json(item) for item in value]
    return value


def same(actual, expected) -> bool:
    if isinstance(actual, (list, tuple)) and isinstance(expected, (list, tuple)):
        return len(actual) == len(expected) and all(same(a, b) for a, b in zip(actual, expected))
    if isinstance(actual, (int, float, Fraction)) and isinstance(expected, (int, float, Fraction)):
        return math.isclose(float(actual), float(expected), rel_tol=1e-12, abs_tol=1e-12)
    return actual == expected


def main(output: Path | None = None) -> dict:
    checks = []

    def record(name: str, actual, expected):
        checks.append({"name": name, "actual": as_json(actual),
                       "expected": as_json(expected), "passed": same(actual, expected)})

    labels = ["A", "B", "C"]
    # Raw, invented scores from the article. No empirical memory measurements.
    raw = [[Fraction(value) for value in row] for row in [
        ["0.98", "2", "0.1"],
        ["0.80", "9", "0.9"],
        ["0.89", "5", "0.7"],
    ]]
    normalized = min_max_columns(raw)
    record("memory_min_max_components", normalized,
           [[1, 0, 0], [0, 1, 1], [Fraction(1, 2), Fraction(3, 7), Fraction(3, 4)]])
    equal = memory_scores(normalized, [Fraction(1)] * 3)
    recency = memory_scores(normalized, [Fraction(4, 5), Fraction(1, 10), Fraction(1, 10)])
    record("equal_weight_score_table", equal, [1, 2, Fraction(47, 28)])
    record("equal_weight_ranking", [labels[i] for i in sorted(range(3), key=lambda i: equal[i], reverse=True)],
           ["B", "C", "A"])
    record("recency_weight_score_table", recency, [Fraction(4, 5), Fraction(1, 5), Fraction(29, 56)])
    record("recency_weight_ranking", [labels[i] for i in sorted(range(3), key=lambda i: recency[i], reverse=True)],
           ["A", "C", "B"])
    constant_feature = [[Fraction(1), row[1]] for row in raw]
    record("zero_range_feature_contributes_zero", min_max_columns(constant_feature),
           [[0, 0], [0, 1], [0, Fraction(3, 7)]])

    probabilities, calls = zip(*(capped_retry(0.6, limit) for limit in [1, 2, 3]))
    record("retry_success_probability_table", probabilities, [0.6, 0.84, 0.936])
    record("retry_mean_calls_table", calls, [1.0, 1.4, 1.56])
    record("retry_failure_probability_table", [1.0 - p for p in probabilities], [0.4, 0.16, 0.064])
    record("zero_success_probability_boundary", [capped_retry(0.0, limit) for limit in [1, 2, 3]],
           [(0.0, 1.0), (0.0, 2.0), (0.0, 3.0)])
    record("certain_success_boundary", [capped_retry(1.0, limit) for limit in [1, 2, 3]],
           [(1.0, 1.0), (1.0, 1.0), (1.0, 1.0)])

    exhaustive = enumerate_stopped_calls(Fraction(3, 5), 3)
    record("stopped_call_distribution", list(exhaustive["call_distribution"].values()), [0.6, 0.24, 0.16])
    record("enumerated_outcomes_match_table", [exhaustive["total_mass"], exhaustive["success"], exhaustive["expected_calls"]],
           [1.0, 0.936, 1.56])
    record("geometric_quotient_for_positive_p", [(1 - (1 - 0.6) ** limit) / 0.6 for limit in [1, 2, 3]],
           calls)

    passed = all(check["passed"] for check in checks)
    report = {
        "scope": "Two pedagogical examples only: memory ranking and capped independent tool retries.",
        "result": "PASS" if passed else "FAIL",
        "checks_run": len(checks),
        "failed_checks": sum(not check["passed"] for check in checks),
        "checks": checks,
        "settings": {
            "empirical_results": False,
            "memory_features": ["recency", "importance", "relevance"],
            "memory_scores": "invented values; min-max across the three candidates, independently per feature",
            "equal_weights": [1, 1, 1],
            "alternative_weights": [0.8, 0.1, 0.1],
            "constant_feature_rule": "assign zero contribution; this is an example convention, not an attributed paper rule",
            "retry_probability": 0.6,
            "retry_limits_include_first_call": [1, 2, 3],
            "retry_assumptions": ["independent calls", "constant success probability", "success correctly observed",
                                  "stop on success", "equal per-call cost", "one tool request, not whole-task success"],
            "does_not_estimate": ["real-agent pass@k", "adaptive retry performance", "model weight updates",
                                  "harness benchmark improvements"],
        },
        "sources": {
            "memory_retrieval": "https://arxiv.org/pdf/2304.03442v2#page=9",
            "memory_location": "Generative Agents section 4.1; feature-wise normalization and weights all 1",
            "retry_derivation": "finite independent Bernoulli experiment constructed for this article",
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
