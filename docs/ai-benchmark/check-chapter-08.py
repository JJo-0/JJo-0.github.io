#!/usr/bin/env python3
"""Reproduce Chapter 08's examples without downloading data.

Run with: python3 docs/ai-benchmark/check-chapter-08.py
"""

from decimal import Decimal
from fractions import Fraction


def check_rate(label, numerator, denominator, expected, unit="%"):
    """Check the unreduced counts, then round only for display."""
    observed = (numerator, denominator)
    if observed != expected:
        raise AssertionError(f"{label}: observed {observed}, expected {expected}")
    percentage = Decimal(100 * numerator) / Decimal(denominator)
    print(f"  {label}: {numerator}/{denominator} = {percentage:.2f}{unit}")


def camera_example():
    # Original example. The reference unit is millimetres per pixel.
    target_text = "3/8"
    target = Fraction(target_text)
    tolerance = Fraction(1, 1000)
    responses = ["3/8", "0.375", "0.374", "0.373", "3/4", None]
    values = [Fraction(text) for text in responses if text is not None]
    within_tolerance = sum(abs(value - target) <= tolerance for value in values)

    print("Camera calibration (six scheduled responses)")
    check_rate("Exact reference text", responses.count(target_text), len(responses), (1, 6))
    check_rate("Exact rational value", values.count(target), len(responses), (2, 6))
    check_rate("Inclusive absolute tolerance", within_tolerance, len(responses), (3, 6))
    check_rate("Tolerance among returned values", within_tolerance, len(values), (3, 5))


def apex_2025():
    # MathArena Apex, August 2025, Figure 3 and per-problem results:
    # https://matharena.ai/apex/
    hits = (7, 0, 0, 0, 2, 0, 1, 0, 0, 0, 0, 0)
    attempts_per_problem = 16
    print("MathArena Apex, August 2025 (Qwen3-A22B-2507-Think)")
    check_rate("Correct attempts", sum(hits), len(hits) * attempts_per_problem, (10, 192))
    check_rate("Problems solved at least once", sum(h > 0 for h in hits), len(hits), (3, 12))


def competition_study_2026():
    # MathArena, May 12, 2026. Figure 3 gives the 14 non-unanimous items
    # and the surrounding text accounts for all 162 four-hit items.
    # https://matharena.ai/no_final_answer/
    problems_by_hits = (0, 1, 6, 7, 162)  # Index = correct attempts out of four.
    attempts_per_problem = 4
    total_problems = sum(problems_by_hits)
    correct_attempts = sum(hits * problems for hits, problems in enumerate(problems_by_hits))
    all_correct = problems_by_hits[attempts_per_problem]
    non_unanimous = total_problems - all_correct
    print("Competition selection study, May 2026 (Gemini 3.1 Pro)")
    check_rate(
        "Correct attempts on the 14 items without four hits",
        correct_attempts - all_correct * attempts_per_problem,
        non_unanimous * attempts_per_problem,
        (34, 56),
    )
    check_rate("All correct attempts", correct_attempts, total_problems * attempts_per_problem, (682, 704))
    check_rate("Problems solved at least once", total_problems - problems_by_hits[0], total_problems, (176, 176))
    check_rate("Problems solved all four times", all_correct, total_problems, (162, 176))


def aime_2026():
    # 2025–26 MAA hosting guide, “MAA AMC Cycle Overview” (15 questions):
    # https://maa.org/wp-content/uploads/2025/08/2025-2026-Hosting-MAA-Competitions-Guide.pdf
    # 2026 AIME I and alternate II: https://maa.org/news/2025-26-aime-thresholds-are-now-available/
    # MathArena's 30-item evaluation: https://huggingface.co/datasets/MathArena/aime_2026
    problems_per_form = 15
    forms = 2
    print("2026 AIME (percentage-point change for one additional correct answer)")
    check_rate("One form", 1, problems_per_form, (1, 15), " pp")
    check_rate("Combined I and II model evaluation", 1, forms * problems_per_form, (1, 30), " pp")


if __name__ == "__main__":
    camera_example()
    apex_2025()
    competition_study_2026()
    aime_2026()
