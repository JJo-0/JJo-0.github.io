"""Exact enumeration / finite-difference checks for chapter 08; not an ASR experiment."""
from __future__ import annotations
import argparse,itertools,json,math,random,unittest
from pathlib import Path

def sigmoid(z:float)->float:
    if z>=0:return 1/(1+math.exp(-z))
    e=math.exp(z);return e/(1+e)

def entropy(ps)->float:
    if not ps or any(p<0 or not math.isfinite(p) for p in ps) or not math.isclose(sum(ps),1,abs_tol=1e-12):raise ValueError('Need a probability distribution.')
    return -sum(p*math.log(p) for p in ps if p)

def bh(p):return entropy([p,1-p])
def dh(p):return p*(1-p)*math.log((1-p)/p)
def model(z):
    q,a,b=map(sigmoid,z)
    probs=[q*a,q*(1-a),(1-q)*b,(1-q)*(1-b)]
    costs=[bh(q)+bh(a)]*2+[bh(q)+bh(b)]*2
    direct=[[dh(q),dh(a),0]]*2+[[dh(q),0,dh(b)]]*2
    score=[[1-q,1-a,0],[1-q,-a,0],[-q,0,1-b],[-q,0,-b]]
    return probs,costs,direct,score

def objective(z):return entropy(model(z)[0])
def terms(z,baseline=0):
    p,g,d,s=model(z)
    direct=[sum(p[i]*d[i][j] for i in range(4)) for j in range(3)]
    select=[sum(p[i]*(g[i]-baseline)*s[i][j] for i in range(4)) for j in range(3)]
    wrong=[sum(p[i]*g[i]*(p[i]*s[i][j]) for i in range(4)) for j in range(3)]
    return direct,select,wrong

def finite_difference(z):
    h=1e-6;v=[]
    for j in range(3):
        plus=list(z);minus=list(z);plus[j]+=h;minus[j]-=h
        v.append((objective(plus)-objective(minus))/(2*h))
    return v

Z=[0,math.log(9),0]
CASES=[Z,[.7,-.9,1.3],[-2,2,-1],[3,-2,1],[0,0,0]]
class Examples(unittest.TestCase):
    def test_01_normalized_tree(self):
        for z in CASES:self.assertAlmostEqual(sum(model(z)[0]),1)
    def test_02_known_probabilities(self):
        for a,b in zip(model(Z)[0],[.45,.05,.25,.25]):self.assertAlmostEqual(a,b)
    def test_03_conditional_entropies(self):
        self.assertAlmostEqual(bh(.9),.3250829733914482);self.assertAlmostEqual(bh(.5),math.log(2))
    def test_04_expected_token_value(self):
        for z in CASES:
            p,g,_,_=model(z);self.assertAlmostEqual(sum(a*b for a,b in zip(p,g)),objective(z))
    def test_05_chain_rule(self):
        for z in CASES:
            q,a,b=map(sigmoid,z);self.assertAlmostEqual(bh(q)+q*bh(a)+(1-q)*bh(b),objective(z))
    def test_06_surprisal_expectation(self):
        p,_,_,_=model(Z);self.assertAlmostEqual(sum(-a*math.log(a) for a in p),objective(Z))
    def test_07_one_path_not_total(self):self.assertNotAlmostEqual(model(Z)[1][0],objective(Z))
    def test_08_path_costs(self):
        g=model(Z)[1];self.assertAlmostEqual(g[0],1.0182301539513936);self.assertAlmostEqual(g[2],1.3862943611198906)
    def test_09_entropy_units(self):self.assertAlmostEqual(objective(Z)/math.log(2),1.7344977967946407)
    def test_10_full_gradient_finite_difference(self):
        for z in CASES:
            d,s,_=terms(z)
            for x,y in zip([a+b for a,b in zip(d,s)],finite_difference(z)):self.assertAlmostEqual(x,y,places=7)
    def test_11_full_root_gradient(self):self.assertAlmostEqual(sum(t[0] for t in terms(Z)[:2]),-.09201605179212426)
    def test_12_dropped_root_is_zero(self):self.assertAlmostEqual(terms(Z)[0][0],0)
    def test_13_missing_log_wrong_sign(self):self.assertGreater(terms(Z)[2][0],0)
    def test_14_expected_score_zero(self):
        for z in CASES:
            p,_,_,s=model(z)
            for j in range(3):self.assertAlmostEqual(sum(p[i]*s[i][j] for i in range(4)),0)
    def test_15_constant_baseline_same_expectation(self):
        for b in [-3,.4,2]:
            for x,y in zip(terms(Z,b)[1],terms(Z)[1]):self.assertAlmostEqual(x,y)
    def test_16_self_sample_nll_direct_zero(self):
        p,_,_,s=model(Z)
        for j in range(3):self.assertAlmostEqual(sum(-p[i]*s[i][j] for i in range(4)),0)
    def test_17_surprisal_score_full_gradient(self):
        p,_,_,s=model(Z)
        for j in range(3):self.assertAlmostEqual(sum(-p[i]*math.log(p[i])*s[i][j] for i in range(4)),finite_difference(Z)[j],places=7)
    def test_18_root_step_lowers_entropy(self):
        z=list(Z);z[0]-=.1*sum(t[0] for t in terms(z)[:2]);self.assertLess(objective(z),objective(Z))
    def test_19_wrong_log_root_step_raises_entropy(self):
        z=list(Z);z[0]-=.1*terms(z)[2][0];self.assertGreater(objective(z),objective(Z))
    def test_20_sample_mean_value(self):
        p,g,_,_=model(Z);rng=random.Random(8);N=10000;mean=sum(g[i] for i in rng.choices(range(4),weights=p,k=N))/N
        self.assertAlmostEqual(mean,objective(Z),delta=.008)
    def test_21_independence_special_case(self):
        z=[.4,.8,.8];q,a,_=map(sigmoid,z);self.assertAlmostEqual(objective(z),bh(q)+bh(a));self.assertAlmostEqual(terms(z)[1][0],0)
    def test_22_marginal_sum_not_joint(self):
        q,a,b=map(sigmoid,Z);self.assertGreater(bh(q)+bh(q*a+(1-q)*b),objective(Z))
    def test_23_greedy_path_not_unbiased(self):
        p,g,_,_=model(Z);self.assertNotAlmostEqual(g[max(range(4),key=lambda i:p[i])],objective(Z))
    def test_24_length_average_changes_scale(self):
        p,g,_,_=model(Z);self.assertAlmostEqual(sum(p[i]*g[i]/2 for i in range(4)),objective(Z)/2)
    def test_25_normalization_rejects_bad_inputs(self):
        for ps in [[],[-.1,1.1],[.2,.3],[float('nan'),1]]:
            with self.assertRaises(ValueError):entropy(ps)
    def test_26_deterministic_entropy(self):self.assertEqual(entropy([1,0]),0)
    def test_27_uniform_entropy(self):self.assertAlmostEqual(entropy([.25]*4),math.log(4))
    def test_28_one_token_score_term_zero(self):
        q=.7;g=bh(q);self.assertAlmostEqual(q*g*(1-q)+(1-q)*g*(-q),0)
    def test_29_cost_only_detach_is_not_full(self):
        # The direct conditional-branch components are not zero.
        self.assertNotAlmostEqual(terms(Z)[0][1],0)
    def test_30_all_gradients_stay_finite(self):
        for z in CASES:
            self.assertTrue(all(math.isfinite(v) for part in terms(z) for v in part))

def report(result):
    d,s,w=terms(Z);p,g,_,_=model(Z)
    return {'scope':'Illustrative two-token binary-tree calculations; not an empirical replication of ASR/LLM experiments','tests_run':result.testsRun,'failures':len(result.failures),'errors':len(result.errors),'result':'PASS' if result.wasSuccessful() else 'FAIL','examples':{'probabilities':p,'path_token_entropies':g,'sequence_entropy_nats':objective(Z),'sequence_entropy_bits':objective(Z)/math.log(2),'direct_gradient':d,'selection_gradient':s,'full_gradient':[a+b for a,b in zip(d,s)],'finite_difference':finite_difference(Z),'incorrect_missing_log':w}}
if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--output',type=Path);a=p.parse_args();r=unittest.TextTestRunner(verbosity=2).run(unittest.defaultTestLoader.loadTestsFromTestCase(Examples));d=report(r)
    if a.output:a.output.parent.mkdir(parents=True,exist_ok=True);a.output.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps(d,ensure_ascii=False));raise SystemExit(not r.wasSuccessful())
