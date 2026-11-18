"""Check chapter 16's prompt, selection, budget, and archive arithmetic.

The article's invented examples are evaluated with exact rational arithmetic.
The small GEPA examples distinguish an ordinary non-dominated set from the
instance-winner selection used in the paper's Algorithm 2; a tied case also
checks that a dominated winner is removed before selection frequencies are
normalized. Published OPRO, ALMA, and DGM values are transcribed inputs, not
newly reproduced model results. ALMA's rounded table cells are not raw data.
"""
from __future__ import annotations

import argparse
import json
from decimal import Decimal, ROUND_HALF_UP
from fractions import Fraction
from pathlib import Path


def mean(values) -> Fraction:
    values = list(values)
    if not values:
        raise ValueError("A mean requires at least one observation.")
    return sum(values, Fraction(0)) / len(values)


def rational(value: str | int) -> Fraction:
    """Read decimal text exactly; do not import binary floating-point error."""
    return Fraction(value)


def one_decimal(value: Fraction) -> str:
    """Display percentages to one decimal with explicit decimal half-up rounding."""
    decimal = Decimal(value.numerator) / Decimal(value.denominator)
    return str(decimal.quantize(Decimal("0.1"), rounding=ROUND_HALF_UP))


def dominates(left: tuple[Fraction, ...], right: tuple[Fraction, ...]) -> bool:
    """Maximization dominance: no worse everywhere, strictly better somewhere."""
    if len(left) != len(right) or not left:
        raise ValueError("Score vectors must have the same positive dimension.")
    return all(a >= b for a, b in zip(left, right)) and any(
        a > b for a, b in zip(left, right)
    )


def non_dominated(scores: dict[str, tuple[Fraction, ...]]) -> list[str]:
    return sorted(
        name for name, vector in scores.items()
        if not any(
            other != name and dominates(other_vector, vector)
            for other, other_vector in scores.items()
        )
    )


def gepa_selection(scores: dict[str, tuple[Fraction, ...]]) -> dict:
    """Small exact calculation of GEPA Algorithm 2, with all ties retained.

    Candidate weights count winning instances after strictly dominated members
    of the instance-winner union have been removed. Equal score vectors do not
    strictly dominate one another. No random sampling or LLM call is made.
    """
    if not scores or len({len(vector) for vector in scores.values()}) != 1:
        raise ValueError("Require a nonempty rectangular score matrix.")
    dimensions = len(next(iter(scores.values())))
    if dimensions == 0:
        raise ValueError("Require at least one task instance.")
    winners = []
    for index in range(dimensions):
        best = max(vector[index] for vector in scores.values())
        winners.append(sorted(name for name, vector in scores.items()
                              if vector[index] == best))
    union = sorted({name for names in winners for name in names})
    retained = non_dominated({name: scores[name] for name in union})
    pruned_winners = [[name for name in names if name in retained] for names in winners]
    frequencies = {name: sum(name in names for names in pruned_winners)
                   for name in retained}
    total = sum(frequencies.values())
    probabilities = {name: Fraction(count, total) for name, count in frequencies.items()}
    return {"winners": winners, "winner_union": union, "retained": retained,
            "pruned_winners": pruned_winners, "frequencies": frequencies,
            "probabilities": probabilities}


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

    def record(name: str, kind: str, actual, expected):
        checks.append({"name": name, "kind": kind, "actual": serializable(actual),
                       "expected": serializable(expected), "passed": actual == expected})

    # Hypothetical binary outcomes independently realize score .72 and loss .28.
    correctness = [True] * 18 + [False] * 7
    score = mean(correctness)
    observed_loss = mean(not correct for correct in correctness)
    record("binary_score_and_zero_one_loss", "hypothetical",
           [score, observed_loss, 1 - score],
           [Fraction(18, 25), Fraction(7, 25), Fraction(7, 25)])

    # OPRO Table 1/4: one specified PaLM 2-L / GSM8K configuration.
    opro_before, opro_after = rational("71.8"), rational("80.2")
    opro_pp = opro_after - opro_before
    opro_relative_percent = opro_pp / opro_before * 100
    record("opro_reported_values_percentage_point_and_relative_change", "published_arithmetic",
           [opro_pp, opro_relative_percent, one_decimal(opro_relative_percent)],
           [Fraction(42, 5), Fraction(4200, 359), "11.7"])

    # Fictional, disjoint fit/validation sets. Freeze the selection before test.
    fit_counts = {"A": 34, "B": 39, "C": 41}
    validation_counts = {"A": 35, "B": 40, "C": 33}
    fit_rates = {name: Fraction(count, 50) for name, count in fit_counts.items()}
    validation_rates = {name: Fraction(count, 50)
                        for name, count in validation_counts.items()}
    fit_winner = max(fit_rates, key=fit_rates.get)
    selected = max(validation_rates, key=validation_rates.get)
    record("fit_and_validation_rates", "hypothetical",
           [fit_rates, validation_rates],
           [{"A": Fraction(17, 25), "B": Fraction(39, 50), "C": Fraction(41, 50)},
            {"A": Fraction(7, 10), "B": Fraction(4, 5), "C": Fraction(33, 50)}])
    record("fit_and_validation_choose_different_candidates", "hypothetical",
           [fit_winner, fit_rates[fit_winner], selected, validation_rates[selected]],
           ["C", Fraction(41, 50), "B", Fraction(4, 5)])
    test_counts = {"A": 34, "B": 38}
    test_rates = {name: Fraction(count, 50) for name, count in test_counts.items()}
    test_delta = test_rates[selected] - test_rates["A"]
    record("frozen_selection_test_difference", "hypothetical",
           [test_rates["A"], test_rates[selected], test_delta * 100,
            Fraction(test_counts[selected] - test_counts["A"], 50)],
           [Fraction(17, 25), Fraction(19, 25), Fraction(8), Fraction(2, 25)])

    # Count explicit fictional execution identities, not token or elapsed costs.
    screening = [("screen", candidate, task) for candidate in range(8) for task in range(25)]
    confirmation = [("confirm", candidate, task) for candidate in range(2) for task in range(100)]
    executions = screening + confirmation
    record("solver_execution_budget", "hypothetical",
           [len(screening), len(confirmation), len(executions), len(set(executions))],
           [200, 200, 400, 400])

    matrix = {
        "A": tuple(map(rational, (".9", ".8", ".2"))),
        "B": tuple(map(rational, (".4", ".3", ".95"))),
        "C": tuple(map(rational, (".6", ".6", ".6"))),
        "D": tuple(map(rational, (".7", ".5", ".1"))),
    }
    selection = gepa_selection(matrix)
    record("gepa_example_mean_scores", "hypothetical",
           {name: mean(vector) for name, vector in matrix.items()},
           {"A": Fraction(19, 30), "B": Fraction(11, 20),
            "C": Fraction(3, 5), "D": Fraction(13, 30)})
    record("ordinary_pareto_set_differs_from_instance_winners", "hypothetical",
           [non_dominated(matrix), selection["winners"], selection["retained"],
            dominates(matrix["A"], matrix["D"])],
           [["A", "B", "C"], [["A"], ["A"], ["B"]], ["A", "B"], True])
    # An independent frequency oracle enumerates the three winning incidences.
    winner_tickets = [("A", 0), ("A", 1), ("B", 2)]
    ticket_probabilities = {name: Fraction(sum(ticket[0] == name for ticket in winner_tickets),
                                          len(winner_tickets)) for name in ("A", "B")}
    record("gepa_parent_probabilities_match_winning_incidence_counts", "hypothetical",
           [selection["probabilities"], ticket_probabilities],
           [{"A": Fraction(2, 3), "B": Fraction(1, 3)}] * 2)

    # Contrast case for ties: R ties P on instance 0, but is dominated by P.
    # After dropping R, both P and Q win two instances and have probability 1/2.
    tied_matrix = {"P": (Fraction(1), Fraction(1), Fraction(0)),
                   "Q": (Fraction(0), Fraction(1), Fraction(1)),
                   "R": (Fraction(1), Fraction(0), Fraction(0))}
    tied_selection = gepa_selection(tied_matrix)
    tied_tickets = [("P", 0), ("P", 1), ("Q", 1), ("Q", 2)]
    tied_oracle = {name: Fraction(sum(ticket[0] == name for ticket in tied_tickets),
                                 len(tied_tickets)) for name in ("P", "Q")}
    record("gepa_ties_are_retained_then_dominated_winners_removed", "algorithm_contrast",
           [tied_selection["winners"], tied_selection["retained"],
            tied_selection["frequencies"], tied_selection["probabilities"], tied_oracle],
           [[["P", "R"], ["P", "Q"], ["Q"]], ["P", "Q"],
            {"P": 2, "Q": 2}, {"P": Fraction(1, 2), "Q": Fraction(1, 2)},
            {"P": Fraction(1, 2), "Q": Fraction(1, 2)}])
    record("equal_vectors_do_not_strictly_dominate_each_other", "algorithm_contrast",
           dominates(tied_matrix["P"], tied_matrix["P"]), False)

    # Published ALMA table cells are already rounded percentages, not raw trials.
    alma_cells = {
        "nano_no_memory": list(map(rational, ("2.9", "5.4", "9.5", "6.7"))),
        "nano_alma": list(map(rational, ("12.4", "6.2", "19.0", "11.7"))),
        "mini_no_memory": list(map(rational, ("67.6", "60.5", "21.4", "15.0"))),
        "mini_alma": list(map(rational, ("87.1", "75.0", "33.3", "20.0"))),
    }
    cell_means = {name: mean(values) for name, values in alma_cells.items()}
    record("alma_means_computed_from_printed_components", "published_arithmetic",
           cell_means,
           {"nano_no_memory": Fraction(49, 8), "nano_alma": Fraction(493, 40),
            "mini_no_memory": Fraction(329, 8), "mini_alma": Fraction(1077, 20)})
    record("alma_printed_overall_means_recover_at_one_decimal", "published_arithmetic",
           {name: one_decimal(value) for name, value in cell_means.items()},
           {"nano_no_memory": "6.1", "nano_alma": "12.3",
            "mini_no_memory": "41.1", "mini_alma": "53.9"})
    rounded_delta = [rational("12.3") - rational("6.1"),
                     rational("53.9") - rational("41.1")]
    component_delta = [cell_means["nano_alma"] - cell_means["nano_no_memory"],
                       cell_means["mini_alma"] - cell_means["mini_no_memory"]]
    record("alma_rounded_overall_deltas_and_component_deltas_are_distinct", "published_arithmetic",
           [rounded_delta, component_delta],
           [[Fraction(31, 5), Fraction(64, 5)],
            [Fraction(31, 5), Fraction(509, 40)]])
    record("alma_mini_baba_does_not_beat_dynamic_cheatsheet", "published_arithmetic",
           [rational("33.3") < rational("38.0"), rational("33.3") - rational("38.0")],
           [True, Fraction(-47, 10)])

    # Archive aggregates need not move together when a valid candidate is added.
    archive_before = list(map(rational, (".4", ".3")))
    archive_after = archive_before + [rational(".2")]
    record("archive_mean_can_fall_while_best_stays_fixed", "hypothetical",
           [mean(archive_before), mean(archive_after), max(archive_before), max(archive_after)],
           [Fraction(7, 20), Fraction(3, 10), Fraction(2, 5), Fraction(2, 5)])
    dgm_before, dgm_after = Fraction(20), Fraction(50)
    record("dgm_reported_level_ratio_is_not_relative_improvement", "published_arithmetic",
           [dgm_after - dgm_before, dgm_after / dgm_before,
            (dgm_after / dgm_before - 1) * 100],
           [Fraction(30), Fraction(5, 2), Fraction(150)])

    passed = all(check["passed"] for check in checks)
    report = {
        "scope": "Chapter 16's invented prompt-selection, budget, GEPA, and archive examples; arithmetic on explicitly transcribed OPRO/ALMA/DGM publication values. Not benchmark reproduction.",
        "result": "PASS" if passed else "FAIL",
        "checks_run": len(checks),
        "failed_checks": sum(not check["passed"] for check in checks),
        "checks": checks,
        "settings": {
            "article_slug": "self-improving-ai-16-prompt-memory-code-evolution",
            "arithmetic": "exact fractions; decimal half-up only for stated display rounding",
            "runs_models_or_agents": False,
            "published_benchmark_results_reproduced": False,
            "fit_validation_test": "three disjoint hypothetical sets of 50; choose by validation before examining test",
            "held_out_test_candidates": ["A", "B"],
            "test_selection_is_a_significance_claim": False,
            "budget_unit": "solver executions; candidate generation and reflection excluded",
            "gepa_probabilities": "frequencies of instance-wise maxima after dominated winners are removed; not uniform choice over all non-dominated candidates",
            "gepa_contrast_case": "ties, dominance removal, and equal-vector strict-dominance boundary; not additional article experiment results",
            "alma_table_statistic": "published Table 1 success percentages; uncertainty in paper is standard error over three deployment runs",
            "alma_rounding_note": "Subtracting printed overall means gives +6.2 and +12.8 percentage points. Averaging the already rounded component cells gives exact deltas 6.2 and 12.725; the latter is not raw-data precision and does not establish a reporting error.",
            "dgm_score_scope": "20.0% to 50.0% on the paper's SWE-bench Verified subset, not the entire benchmark",
            "limitations": [
                "No real prompt optimization or prospective agent evaluation was executed.",
                "Synthetic success counts do not establish a causal or generalization effect.",
                "Arithmetic does not independently validate the published experimental measurements.",
                "Rollout counts do not include all LLM calls, token costs, or elapsed time.",
                "The toy GEPA matrix omits mutation, reflection, crossover, and the full search procedure.",
                "A preserved archive maximum does not guarantee future improvement or statistical reproducibility.",
            ],
        },
        "sources": {
            "lecture_pages": "https://speech.ee.ntu.edu.tw/~hylee/ml/ml2026-course-data/self-evolving-agent.pdf#page=11",
            "opro_table_1_and_4": "https://arxiv.org/html/2309.03409v3",
            "gepa_algorithm_2": "https://arxiv.org/html/2507.19457v2",
            "alma_table_1": "https://arxiv.org/html/2602.07755v1",
            "dgm_sections_4_2_to_4_4": "https://arxiv.org/html/2505.22954v3",
            "hypothetical_examples": "constructed for chapter 16; separate from publication values",
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
