#!/usr/bin/env python3
"""Deterministic educational checks; no network, GPU, model training, or CI claims."""
from __future__ import annotations
import argparse, copy, itertools, json, math, re, statistics, unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
DOCS={n:(ROOT/f'site/content/posts/modern-artificial-intelligence-{n}.mdx').read_text(encoding='utf-8') for n in (6,7,8)}

def ce(logits:list[float], target:int)->float:
    if not logits or not 0<=target<len(logits): raise ValueError('missing target/candidates')
    if not all(math.isfinite(v) for v in logits): raise ValueError('nonfinite logits')
    m=max(logits)
    return m+math.log(sum(math.exp(v-m) for v in logits))-logits[target]

def energy(y, unary, edges, lam):
    return sum(unary[i][k] for i,k in enumerate(y))+lam*sum(y[i]!=y[j] for i,j in edges)

def icm(y, unary, edges, lam, max_sweeps=30):
    y=list(y); values=[energy(y,unary,edges,lam)]
    for sweep in range(max_sweeps):
        changed=False
        for i in range(len(y)):
            old=y[i]
            costs=[]
            for k in range(len(unary[i])):
                z=y.copy();z[i]=k;costs.append(energy(z,unary,edges,lam))
            best=min(range(len(costs)),key=lambda k:costs[k])
            if costs[best]<costs[old]-1e-12:
                y[i]=best;changed=True;values.append(energy(y,unary,edges,lam))
        if not changed: return y,values
    raise RuntimeError('ICM did not converge within configured sweeps')

def assert_source_bindings(docs):
    fragments={
      6:['60×60×4096','32×32×1280','128×128×304','589824','67840','76.58','76.46','77.21','101.28B','81.02B','λ=0.6','| 00 | 2 | 0 | 2 |','| 11 | 0 | 0 | 0 |','dt' if False else '한 번씩만 합산'],
      7:['0.818147','0.0714286','0.35','s=1+w_{\\mathrm{paper}}','-0.7' if False else '−0.7','48분의 1','4096×77','1.666667','\\tfrac12 g(t)^2','FID','13.51','3.17','5.24'],
      8:['2N−1','2N−2','0.142932','0.407606','67108864','256 MiB','69.3','76.5','0.0004','692.8','0.126928','대각은 정답','1.060132','0.916291']}
    for part, strings in fragments.items():
        for s in strings:
            if s not in docs[part]: raise AssertionError(f'Part {part}: numerical/source binding absent: {s}')
    for part,n in [(6,10),(7,14),(8,10)]:
        ids=re.findall(rf"modernAiFormula\({part}, '(MAI-P{part}-\d{{3}})'\)",docs[part])
        if len(ids)!=n or len(set(ids))!=n: raise AssertionError(f'Part {part}: source equation count')
        for i in range(1,n+1):
            if f'MAI-P{part}-{i:03}' not in ids: raise AssertionError('source equation removed')
        if len(re.findall(r'<ModernAiConceptVisual kind=',docs[part]))!=5: raise AssertionError('existing conceptual visual removed')
        if re.search(r'<(?:script|style)\b',docs[part],re.I): raise AssertionError('inline scripting/style in MDX')
    expected={6:['pspnet-fig-3','deeplabv3-fig-5','deeplabv3plus-fig-2'],7:['vae-fig-1','ddpm-fig-2'],8:['simclr-fig-2','clip-fig-1']}
    for part,ids in expected.items():
        if re.findall(r'<PaperReadingFigure figure="([^"]+)"',docs[part])!=ids: raise AssertionError('figure identity/order changed')

class EducationalChecks(unittest.TestCase):
    def test_01_ppm_channels(self):
        c=2048; self.assertEqual(c+4*(c//4),4096)
        self.assertEqual([60//b for b in [1,2,3,6]],[60,30,20,10])
    def test_02_atrous_size(self):
        k,r,s=3,6,1; self.assertEqual(1+(k-1)*r,13)
        self.assertEqual((32+2*6-r*(k-1)-1)//s+1,32)
        self.assertEqual((32-r*(k-1)-1)//s+1,20)
    def test_03_aspp_decoder(self):
        self.assertEqual(5*256,1280);self.assertEqual(256+48,304)
        self.assertEqual(512//16*4,128);self.assertEqual((16/8)**2,4)
    def test_04_separable_parameter_counts(self):
        dense=3*3*256*256;sep=3*3*256+256*256
        self.assertEqual(dense,589824);self.assertEqual(sep,67840)
        self.assertAlmostEqual(dense/sep,8.69433962264151)
    def test_05_experiment_arithmetic_not_replication(self):
        for a,b,delta in [(37.23,41.68,4.45),(40.07,41.68,1.61),(76.58,77.21,.63),(77.21,78.85,1.64),(81.02,101.28,20.26)]:
            self.assertAlmostEqual(b-a,delta)
    def test_06_icm_smoothing(self):
        y,es=icm([1,0,1],[[2,0],[0,.4],[2,0]],[(0,1),(1,2)],.6)
        self.assertEqual(y,[1,1,1]);self.assertEqual(es,[1.2,.4])
        self.assertTrue(all(a>b for a,b in zip(es,es[1:])))
    def test_07_icm_local_not_global(self):
        unary=[[1,0],[1,0]];edges=[(0,1)]
        vals={y:energy(y,unary,edges,2) for y in itertools.product([0,1],repeat=2)}
        self.assertEqual(vals,{(0,0):2,(0,1):3,(1,0):3,(1,1):0})
        self.assertEqual(icm([0,0],unary,edges,2)[0],[0,0])
        self.assertEqual(min(vals,key=vals.get),(1,1))
    def test_08_synchronous_cycle_and_ties(self):
        y=[0,1];hist=[]
        for _ in range(4): y=[y[1],y[0]];hist.append(y)
        self.assertEqual(hist,[[1,0],[0,1],[1,0],[0,1]])
        self.assertEqual(icm([0,1],[[0,0],[0,0]],[(0,1)],1)[0],[1,1])
        self.assertEqual(icm([0,1],[[0,0],[0,0]],[(0,1)],0)[0],[0,1])
    def test_09_mmse_median_psnr(self):
        self.assertEqual(.5*(-1)**2+.5*(1)**2,1)
        xs=[10,11,12,13,255];self.assertEqual(statistics.mean(xs),60.2);self.assertEqual(statistics.median(xs),12)
        for a in [0,.5,1,1.5,2]: self.assertEqual(abs(a)+abs(2-a),2)
        self.assertEqual(10*math.log10(1/.01),20)
        self.assertAlmostEqual(10*math.log10(1/.0025),26.020599913279625)
    def test_10_vae_kl_and_path_derivative(self):
        mu,logv,eps=1,math.log(.25),2
        kl=.5*(mu*mu+math.exp(logv)-1-logv)
        self.assertAlmostEqual(kl,.8181471805599453)
        f=lambda lv:mu+math.exp(lv/2)*eps
        self.assertEqual(f(logv),2)
        h=1e-5;self.assertAlmostEqual((f(logv+h)-f(logv-h))/(2*h),.5,places=8)
    def test_11_ddpm_forward_and_x0(self):
        ab=.64;x0=.5;eps=-1
        xt=math.sqrt(ab)*x0+math.sqrt(1-ab)*eps
        self.assertAlmostEqual(xt,-.2)
        self.assertAlmostEqual((xt-math.sqrt(1-ab)*(-.8))/math.sqrt(ab),.35)
    def test_12_ddpm_posterior(self):
        b1,b2=.1,.2;a1=1-b1;a2=1-b2;ab=a1*a2
        var=(1-a1)/(1-ab)*b2;self.assertAlmostEqual(var,1/14)
        xt,x0=.3,.5;eps=(xt-math.sqrt(ab)*x0)/math.sqrt(1-ab)
        posterior=(math.sqrt(a1)*b2*x0+math.sqrt(a2)*(1-a1)*xt)/(1-ab)
        eps_mean=(xt-b2/math.sqrt(1-ab)*eps)/math.sqrt(a2)
        self.assertAlmostEqual(posterior,eps_mean)
    def test_13_cfg_conventions(self):
        u,c,s=.2,-.1,3;wp=s-1
        self.assertAlmostEqual(u+s*(c-u),-.7)
        self.assertAlmostEqual(u+s*(c-u),(1+wp)*c-wp*u)
        self.assertAlmostEqual((1+3)*c-3*u,-1)
    def test_14_ldm_elements_attention(self):
        self.assertEqual((512*512)/(64*64),64)
        self.assertEqual((512*512*3)/(64*64*4),48)
        self.assertEqual(4096*77,315392)
    def test_15_score_conditioning_and_ode(self):
        xt,x0,ab=-.2,.5,.64
        self.assertAlmostEqual(-(xt-math.sqrt(ab)*x0)/(1-ab),5/3)
        self.assertEqual(-xt,.2)
        x=2;f=-x/2;score=-x
        self.assertEqual(f-score,1);self.assertEqual(f-.5*score,0)
        self.assertLess((f-score)*(-.01),0)
    def test_16_infonce_denominator_counts(self):
        for n in [2,4,4096]:
            self.assertEqual((2*n-1)-1,2*n-2)
        self.assertAlmostEqual(ce([0]*4,0),math.log(4))
        self.assertAlmostEqual(ce([2,0,-2],0),.1429316284998995)
        self.assertAlmostEqual(ce([1,0,-1],0),.4076059644443806)
    def test_17_temperature_gradient(self):
        sim=[1,0,-1];tau=.5
        for j in range(3):
            h=1e-5;a=sim.copy();b=sim.copy();a[j]+=h;b[j]-=h
            num=(ce([x/tau for x in a],0)-ce([x/tau for x in b],0))/(2*h)
            probs=[math.exp(x/tau) for x in sim];p=probs[j]/sum(probs)
            self.assertAlmostEqual(num,(p-(j==0))/tau,places=8)
    def test_18_simclr_memory(self):
        self.assertEqual(8192**2,67108864);self.assertEqual(8192**2*4/2**20,256)
    def test_19_barlow_off_diagonal(self):
        self.assertAlmostEqual(.005*(.2**2+.2**2),.0004)
    def test_20_byol_moco(self):
        self.assertAlmostEqual((2-2*.8)+(2-2*.6),1.2)
        self.assertAlmostEqual(.9*0+.1*2,.2)
        self.assertEqual(65536//256,256)
        self.assertAlmostEqual(math.log(.5)/math.log(.999),692.8005491785002)
    def test_21_clustering_and_swav_mass(self):
        self.assertAlmostEqual(statistics.mean([0,.2]),.1)
        self.assertAlmostEqual(statistics.mean([3,3.2]),3.1)
        q=[[.5,0],[0,.5]]
        self.assertEqual([sum(r) for r in q],[.5,.5]);self.assertEqual([sum(r[i] for r in q) for i in range(2)],[.5,.5])
        self.assertEqual([sum(2*v for v in row) for row in q],[1,1])
    def test_22_supcon_log_order(self):
        outside=-.5*(math.log(.2)+math.log(.6));inside=-math.log(.4)
        self.assertAlmostEqual(outside,1.0601317681000455);self.assertAlmostEqual(inside,.916290731874155)
        self.assertGreater(outside,inside)
    def test_23_clip_symmetric_ce(self):
        s=[[2,0],[0,2]]
        row=sum(ce(r,i) for i,r in enumerate(s))/2
        col=sum(ce([s[j][i] for j in range(2)],i) for i in range(2))/2
        self.assertAlmostEqual((row+col)/2,.12692801104297224)
    def test_24_source_bindings(self): assert_source_bindings(DOCS)
    def test_25_mutation_controls(self):
        mutations=[(6,'128×128×304','128×128×303'),(6,'67840','67000'),(7,'s=1+w_{\\mathrm{paper}}','s=w_{\\mathrm{paper}}'),(7,'\\tfrac12 g(t)^2','g(t)^2'),(8,'2N−2','2N−1'),(8,'대각은 정답','대각은 제외'),(8,'0.126928','0.216928'),(6,'figure="pspnet-fig-3"','figure="pspnet-missing"')]
        for part,before,after in mutations:
            changed=copy.copy(DOCS);self.assertIn(before,changed[part]);changed[part]=changed[part].replace(before,after)
            with self.subTest(mutation=before):
                with self.assertRaises(AssertionError): assert_source_bindings(changed)

if __name__=='__main__':
    ap=argparse.ArgumentParser();ap.add_argument('--report',type=Path);args=ap.parse_args()
    suite=unittest.defaultTestLoader.loadTestsFromTestCase(EducationalChecks)
    result=unittest.TextTestRunner(verbosity=2).run(suite)
    report={'date':'2026-09-17','tests_run':result.testsRun,'failures':len(result.failures),'errors':len(result.errors),'passed':result.wasSuccessful(),'mutation_controls':8,'scope':'Toy arithmetic, finite-state ICM, source example bindings and retained lecture calls. Not model-training replication, link reachability, Astro build or live deployment.'}
    if args.report: args.report.parent.mkdir(parents=True,exist_ok=True);args.report.write_text(json.dumps(report,indent=2)+'\n')
    raise SystemExit(0 if result.wasSuccessful() else 1)
