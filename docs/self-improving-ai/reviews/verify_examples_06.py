"""Reproduce the chapter 06 explanatory calculations (not paper measurements)."""
from __future__ import annotations
import json
import math
from pathlib import Path
from typing import Iterable
import unittest


def entropy(probabilities: Iterable[float]) -> float:
    """Shannon entropy in nats; reject malformed probability distributions."""
    p = tuple(float(value) for value in probabilities)
    if not p or any(not math.isfinite(value) or value < 0 for value in p):
        raise ValueError('Probabilities must be finite, nonnegative, and nonempty')
    if not math.isclose(math.fsum(p), 1.0, rel_tol=0.0, abs_tol=1e-12):
        raise ValueError('Probabilities must sum to one')
    return -math.fsum(value * math.log(value) for value in p if value > 0)


class Chapter06Calculations(unittest.TestCase):
    def test_uniform_three(self):
        self.assertAlmostEqual(entropy([1/3]*3), math.log(3), places=12)
        self.assertEqual(round(entropy([1/3]*3), 4), 1.0986)

    def test_peaked_three(self):
        self.assertEqual(round(entropy([.8, .1, .1]), 4), .6390)

    def test_confident_wrong(self):
        self.assertEqual(round(entropy([.98, .01, .01]), 4), .1119)

    def test_permutation_invariance(self):
        self.assertAlmostEqual(entropy([.8, .1, .1]), entropy([.1, .8, .1]), places=12)

    def test_entropy_decreases_but_true_loss_increases(self):
        self.assertLess(entropy([.98, .01, .01]), entropy([.8, .1, .1]))
        self.assertGreater(-math.log(.01), -math.log(.1))

    def test_true_label_losses(self):
        self.assertEqual([round(-math.log(p),4) for p in [.1,.01,.8]], [2.3026,4.6052,.2231])

    def test_empirical_answer_entropy(self):
        self.assertEqual(round(entropy([2/3,1/3]),4), .6365)

    def test_majority_3_5_3(self):
        answers = [3,5,3]
        count = {answer: answers.count(answer) for answer in set(answers)}
        self.assertEqual(max(count,key=count.get),3)
        self.assertEqual(count[3]/len(answers),2/3)

    def test_score_to_loss(self):
        self.assertEqual([5-score for score in [4.5,2]], [.5,3])

    def test_yes_probability_sign(self):
        self.assertLess(-.9,-.4)

    def test_zero_probability_terms(self):
        self.assertEqual(entropy([1,0,0]),0)

    def test_invalid_distributions(self):
        for bad in [[],[.4,.4],[1.1,-.1],[float('nan'),1],[float('inf')]]:
            with self.subTest(probabilities=bad), self.assertRaises(ValueError):
                entropy(bad)

    def test_fixed_horizon_chain_rule(self):
        # P(Y1)=1/2 each; next distributions are (1,0) and (1/2,1/2).
        joint = entropy([.5,0,.25,.25])
        chain = entropy([.5,.5]) + .5*entropy([1,0]) + .5*entropy([.5,.5])
        self.assertAlmostEqual(joint,chain,places=12)


def main() -> int:
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(Chapter06Calculations)
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    rows=[]
    for p in [[.8,.1,.1],[.98,.01,.01],[.1,.8,.1]]:
        rows.append({'probabilities_ABC':p,'argmax':['A','B','C'][max(range(3),key=p.__getitem__)],
                     'entropy_nats':entropy(p),'true_label':'B','true_probability':p[1],
                     'true_cross_entropy':-math.log(p[1])})
    evidence={'scope':'Explanatory calculations only; not experimental paper results',
              'tests_run':result.testsRun,'failures':len(result.failures),'errors':len(result.errors),
              'result':'PASS' if result.wasSuccessful() else 'FAIL',
              'table_rows':rows,'empirical_3_5_3_entropy':entropy([2/3,1/3])}
    target=Path(__file__).with_name('numeric-checks-06.json')
    target.write_text(json.dumps(evidence,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(evidence,ensure_ascii=False))
    return 0 if result.wasSuccessful() else 1


if __name__=='__main__':
    raise SystemExit(main())
