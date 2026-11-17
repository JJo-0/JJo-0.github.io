"""Validate chapter 07's illustrative arithmetic, not published model experiments."""
from __future__ import annotations
import argparse, itertools, json, math, unittest
from pathlib import Path

def nll(probabilities: list[float]) -> float:
    if not probabilities or any(not 0.0 < p <= 1.0 for p in probabilities):
        raise ValueError('Observed-token probabilities must be nonempty and in (0, 1].')
    return -sum(math.log(p) for p in probabilities) / len(probabilities)

def vote3(p: float) -> float:
    if not 0.0 <= p <= 1.0:
        raise ValueError('p must be a probability.')
    return 3*p*p-2*p*p*p

def adapt(theta: float, target: float, eta: float) -> float:
    return (1-eta)*theta+eta*target

class Examples(unittest.TestCase):
    def test_nll_before(self): self.assertAlmostEqual(nll([.5,.25]),math.log(8)/2)
    def test_ppl_before(self): self.assertAlmostEqual(math.exp(nll([.5,.25])),math.sqrt(8))
    def test_ppl_after(self): self.assertAlmostEqual(math.exp(nll([.8,.5])),math.sqrt(2.5))
    def test_likelihood_and_loss_direction(self): self.assertLess(nll([.8,.5]),nll([.5,.25]))
    def test_invalid_observed_probability(self):
        for ps in ([],[0],[1.01],[-.1]):
            with self.assertRaises(ValueError): nll(ps)
    def test_vote_high_accuracy(self): self.assertAlmostEqual(vote3(.7),.784)
    def test_vote_wrong_prior(self): self.assertAlmostEqual(vote3(.4),.352)
    def test_vote_edges(self):
        for p in (0,.5,1): self.assertAlmostEqual(vote3(p),p)
    def test_vote_bruteforce(self):
        for p in (.1,.4,.7,.99):
            brute=sum(math.prod(p if v else 1-p for v in sample)
                      for sample in itertools.product((0,1),repeat=3) if sum(sample)>=2)
            self.assertAlmostEqual(brute,vote3(p))
    def test_short_sequence_probability(self): self.assertAlmostEqual(.9**10,.3486784401)
    def test_long_sequence_probability(self): self.assertAlmostEqual(.9**100,.00002656139888758754)
    def test_nominal_exposures(self):
        self.assertEqual([32*600/n for n in (32,128,512)],[600,150,37.5])
    def test_proxy_update(self): self.assertAlmostEqual(adapt(0,-1,.1),-.1)
    def test_true_proxy_losses(self):
        self.assertAlmostEqual(.5*(-.1+1)**2,.405)
        self.assertAlmostEqual(.5*(-.1-1)**2,.605)
    def test_taylor_remainder(self):
        eta=.1; old=.5; gradient_inner_product=-1
        first_order=old-eta*gradient_inner_product
        actual=.5*(-eta-1)**2
        self.assertAlmostEqual(actual-first_order,.5*eta*eta)
    def test_ppl_gradient_is_rescaled_nll_gradient(self):
        # An input with observed-token probability sigmoid(theta).
        f=lambda z:math.log1p(math.exp(-z)); h=1e-6;z=.3
        dn=(f(z+h)-f(z-h))/(2*h)
        dp=(math.exp(f(z+h))-math.exp(f(z-h)))/(2*h)
        self.assertAlmostEqual(dp,math.exp(f(z))*dn,places=8)
    def test_episodic_reset(self): self.assertEqual([adapt(0,a,.5) for a in (2,-2)],[1,-1])
    def test_continual_carry(self): self.assertEqual(adapt(adapt(0,2,.5),-2,.5),-.5)
    def test_continual_order_effect(self): self.assertEqual(adapt(adapt(0,-2,.5),2,.5),.5)

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--output',type=Path);args=parser.parse_args()
    result=unittest.TextTestRunner(verbosity=2).run(unittest.defaultTestLoader.loadTestsFromTestCase(Examples))
    record={'scope':'Chapter 07 illustrative arithmetic; not an empirical reproduction of any cited paper',
            'tests_run':result.testsRun,'failures':len(result.failures),'errors':len(result.errors),
            'result':'PASS' if result.wasSuccessful() else 'FAIL',
            'examples':{'ppl_before':math.exp(nll([.5,.25])),'ppl_after':math.exp(nll([.8,.5])),
            'vote3_p07':vote3(.7),'vote3_p04':vote3(.4),'short_probability':.9**10,'long_probability':.9**100,
            'nominal_exposures':[32*600/n for n in (32,128,512)],'proxy_loss_after':.405,'true_loss_after':.605,
            'episodic':[1,-1],'continual':[1,-.5],'continual_reversed':[-1,.5]}}
    if args.output:
        args.output.parent.mkdir(parents=True,exist_ok=True);args.output.write_text(json.dumps(record,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps(record,ensure_ascii=False))
    raise SystemExit(not result.wasSuccessful())
