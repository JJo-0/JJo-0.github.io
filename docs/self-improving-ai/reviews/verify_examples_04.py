"""Check the teaching examples in Self-Improving AI 04, not robot performance."""
from __future__ import annotations
import json
import math
import unittest
from pathlib import Path


def discounted_return(rewards: list[float], gamma: float) -> float:
    if not math.isfinite(gamma) or not 0.0 <= gamma <= 1.0:
        raise ValueError("gamma must be finite and in [0, 1]")
    if not all(math.isfinite(r) for r in rewards):
        raise ValueError("all rewards must be finite")
    return sum(gamma ** t * r for t, r in enumerate(rewards))


def shape_rewards(rewards: list[float], potentials: list[float], gamma: float) -> list[float]:
    if len(potentials) != len(rewards) + 1:
        raise ValueError("one potential is required per visited state")
    if not all(math.isfinite(p) for p in potentials):
        raise ValueError("all potentials must be finite")
    discounted_return(rewards, gamma)
    return [r + gamma * potentials[t + 1] - potentials[t] for t, r in enumerate(rewards)]


class TeachingExampleTests(unittest.TestCase):
    def test_sparse_probability(self) -> None:
        self.assertAlmostEqual(1.0 - 0.999 ** 100, 0.09520785288629108)
        self.assertEqual(1.0 / 0.001, 1000.0)

    def test_repeated_contact_counterexample(self) -> None:
        repeated = discounted_return([0.5] * 20, 0.99)
        immediate = discounted_return([1.0], 0.99)
        self.assertAlmostEqual(repeated, 9.104653120138456)
        self.assertEqual(immediate, 1.0)
        self.assertGreater(repeated, immediate)

    def test_potential_example(self) -> None:
        rewards, potentials, gamma = [0.0, 0.0, 1.0], [-1.0, -0.6, -0.2, 0.0], 0.9
        shaped = shape_rewards(rewards, potentials, gamma)
        for actual, expected in zip(shaped, [0.46, 0.42, 1.20]):
            self.assertAlmostEqual(actual, expected)
        self.assertAlmostEqual(discounted_return(rewards, gamma), 0.81)
        self.assertAlmostEqual(discounted_return(shaped, gamma), 1.81)

    def test_boundary_term_cannot_be_omitted(self) -> None:
        rewards, potentials, gamma = [0.0, 0.0, 1.0], [-1.0, -0.6, -0.2, 0.5], 0.9
        shaped = shape_rewards(rewards, potentials, gamma)
        original = discounted_return(rewards, gamma)
        actual = discounted_return(shaped, gamma)
        expected = original - potentials[0] + gamma ** len(rewards) * potentials[-1]
        self.assertAlmostEqual(actual, expected)
        self.assertNotAlmostEqual(actual, original - potentials[0])

    def test_same_start_terminal_potential_preserves_order_in_examples(self) -> None:
        gamma = 0.9
        cases = [([0.0, 0.0, 1.0], [-1.0, -0.6, -0.2, 0.0]),
                 ([0.0, 0.0, 0.0], [-1.0, -0.7, -0.9, 0.0]),
                 ([0.0, 1.0], [-1.0, -0.1, 0.0])]
        original, shaped = [], []
        for rewards, potentials in cases:
            original.append(discounted_return(rewards, gamma))
            shaped.append(discounted_return(shape_rewards(rewards, potentials, gamma), gamma))
            self.assertAlmostEqual(shaped[-1] - original[-1], 1.0)
        self.assertEqual(sorted(range(3), key=original.__getitem__), sorted(range(3), key=shaped.__getitem__))

    def test_input_validation(self) -> None:
        for gamma in [-0.1, 1.1, math.nan, math.inf]:
            with self.assertRaises(ValueError):
                discounted_return([1.0], gamma)
        with self.assertRaises(ValueError):
            discounted_return([math.nan], 0.9)
        with self.assertRaises(ValueError):
            shape_rewards([1.0], [0.0], 0.9)


if __name__ == "__main__":
    result = unittest.TextTestRunner(verbosity=2).run(unittest.defaultTestLoader.loadTestsFromTestCase(TeachingExampleTests))
    evidence = {"scope": "illustrative arithmetic only, not robot training or publication QA", "tests_run": result.testsRun,
                "failures": len(result.failures), "errors": len(result.errors), "passed": result.wasSuccessful(),
                "values": {"success_probability_within_100": 1.0 - 0.999 ** 100, "expected_trials": 1000.0,
                           "contact_return": discounted_return([0.5] * 20, 0.99), "immediate_success_return": 1.0,
                           "original_return": 0.81, "shaped_return": 1.81}}
    Path(__file__).with_name("numeric-checks-04.json").write_text(json.dumps(evidence, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    raise SystemExit(0 if result.wasSuccessful() else 1)
