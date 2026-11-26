"""Recompute chapter 11's explicit examples and reported-table arithmetic.

Standard library only. This does not train an LLM or reproduce either research
benchmark. Decimal arithmetic keeps the rounded Table 1/Table 5 inputs distinct
from the paper's separately reported aggregate. In particular, the displayed
inputs yield 23.14641, not exactly the reported 23.2.
"""
from __future__ import annotations

import argparse
from decimal import Decimal
import json
import math
from pathlib import Path
from statistics import mean


def main(output: Path | None = None) -> dict:
    checks = []

    def record(name: str, actual, expected):
        left = actual if isinstance(actual, list) else [actual]
        right = expected if isinstance(expected, list) else [expected]
        passed = len(left) == len(right) and all(
            math.isclose(float(a), float(b), rel_tol=1e-12, abs_tol=1e-12)
            for a, b in zip(left, right)
        )
        checks.append({"name": name, "actual": actual, "expected": expected, "passed": passed})

    # Four distinct base models and seven target benchmarks; three independent
    # runs only for the configurations explicitly reported with repeats.
    record("model_benchmark_configurations", 4 * 7, 28)
    record("full_budget_gpu_hours_one_repeat", 4 * 7 * 10, 280)
    record("three_repeat_run_count", 4 * 7 * 3, 84)

    # A didactic single 4096-by-4096 projection, NOT Gemma's measured adapter.
    d_out = d_in = 4096
    rank = 8
    full = d_out * d_in
    adapter = d_out * rank + rank * d_in
    record("single_matrix_parameter_counts", [full, adapter], [16777216, 65536])
    record("single_matrix_adapter_fraction", adapter / full, 0.00390625)
    record("single_matrix_parameter_reduction_factor", full / adapter, 256)

    # Planned example visits only. The first run timed out, so this is neither
    # an actual exposure count nor a measured runtime/optimizer-step ratio.
    first_planned_visits = 203178 * 2
    revised_planned_visits = 20000
    record("planned_example_visits", [first_planned_visits, revised_planned_visits], [406356, 20000])
    record("planned_visits_fraction", revised_planned_visits / first_planned_visits, 0.049217927137780663)

    # PostTrainBench v2, Table 5 (PDF14) in Table 1 column order (PDF5).
    benchmarks = ["AIME 2025", "ArenaHard-Writing", "BFCL", "GPQA Main", "GSM8K", "HealthBench-Easy", "HumanEval"]
    weights = list(map(Decimal, ["0.2265", "0.0904", "0.0746", "0.2246", "0.0936", "0.1841", "0.1061"]))
    scores = list(map(Decimal, ["5.0", "7.8", "75.9", "25.5", "41.0", "18.8", "24.7"]))
    products = [weight * score for weight, score in zip(weights, scores)]
    displayed_sum = sum(products)
    record("published_weight_sum_is_rounded", float(sum(weights)), 0.9999)
    record("weighted_contributions_from_displayed_inputs", list(map(float, products)), [1.1325, 0.70512, 5.66214, 5.7273, 3.8376, 3.46108, 2.62067])
    record("weighted_sum_from_displayed_inputs", float(displayed_sum), 23.14641)
    record("unweighted_mean_is_different", float(mean(scores)), 28.385714285714286)
    record("difference_from_separately_reported_aggregate", float(Decimal("23.2") - displayed_sum), 0.05359)

    # Compare the paper's reported aggregate scores as reported, without
    # replacing them with the rounded-input reconstruction above.
    record("reported_aggregate_differences", [23.2 - 7.5, 23.2 - 18.1, 51.1 - 23.2], [15.7, 5.1, 27.9])
    record("bfcl_single_model_difference_percentage_points", 89 - 67, 22)

    # Selection and final testing are separate in this illustrative example.
    validation_scores = [0.68, 0.74, 0.71]
    test_scores = [0.65, 0.66, 0.69]
    selected = max(range(len(validation_scores)), key=validation_scores.__getitem__)
    record("validation_selection_then_separate_test", [selected + 1, validation_scores[selected], test_scores[selected]], [2, 0.74, 0.66])
    base_score, evaluated_score = 10, 90
    recorded_scores = [base_score if flagged else evaluated_score for flagged in [True, False]]
    record("flagged_run_uses_base_score_not_zero", recorded_scores, [10, 90])

    passed = all(check["passed"] for check in checks)
    report = {
        "scope": "Didactic arithmetic and rounded published-table calculations; no LLM training replication.",
        "result": "PASS" if passed else "FAIL",
        "checks_run": len(checks),
        "failed_checks": sum(not check["passed"] for check in checks),
        "checks": checks,
        "posttrainbench_table_inputs": {
            "benchmarks": benchmarks,
            "weights_table5": list(map(float, weights)),
            "opus46_scores_table1": list(map(float, scores)),
            "rounded_input_weighted_sum": float(displayed_sum),
            "reported_average": 23.2,
            "note": "The displayed rows do not exactly reconstruct the separately reported Avg; raw per-run scores were not reaggregated. Do not claim an exact replication of the paper's aggregate.",
        },
        "sources": {
            "posttrainbench": "https://arxiv.org/pdf/2603.08640v2",
            "ft_dojo": "https://arxiv.org/pdf/2603.01712v1",
            "lora": "https://arxiv.org/pdf/2106.09685v2",
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
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    main(args.output)
