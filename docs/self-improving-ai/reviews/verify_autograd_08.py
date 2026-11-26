from __future__ import annotations
import json,math,unittest,argparse
from pathlib import Path
import torch
from entropy_surrogate_08 import entropy_surrogate

class Autograd(unittest.TestCase):
    def build(self,z):
        pairs=torch.tensor([[0,0],[0,1],[1,0],[1,1]],dtype=torch.long)
        root=torch.stack([z[0],z[0]*0]).expand(4,2)
        branch=z[torch.tensor([1,1,2,2])]
        child=torch.stack([branch,branch*0],dim=-1)
        return torch.stack([root,child],dim=1),pairs,torch.ones((4,2),dtype=torch.bool)
    def check_gradient(self,z0,baseline):
        z=torch.tensor(z0,dtype=torch.float64,requires_grad=True);logits,tokens,mask=self.build(z)
        logp=torch.log_softmax(logits,-1).gather(-1,tokens.unsqueeze(-1)).squeeze(-1).sum(-1);prob=logp.exp()
        truth=-(prob*logp).sum();g1=torch.autograd.grad(truth,z,retain_graph=True)[0]
        surrogate=(prob.detach()*entropy_surrogate(logits,tokens,mask,baseline)).sum()
        g2=torch.autograd.grad(surrogate,z)[0];torch.testing.assert_close(g1,g2,atol=1e-12,rtol=1e-10)
    def test_01_all_paths_gradient(self):self.check_gradient([0,math.log(9),0],0)
    def test_02_general_gradient(self):self.check_gradient([.7,-.9,1.3],0)
    def test_03_fixed_baseline(self):self.check_gradient([0,math.log(9),0],2)
    def test_04_bad_mask(self):
        with self.assertRaises(ValueError):entropy_surrogate(torch.zeros(1,3,2),torch.zeros(1,3,dtype=torch.long),torch.tensor([[1,0,1]],dtype=torch.bool))
    def test_05_out_of_vocabulary(self):
        with self.assertRaises(ValueError):entropy_surrogate(torch.zeros(1,1,2),torch.tensor([[2]]),torch.tensor([[True]]))
    def test_06_nonfinite_logits(self):
        with self.assertRaises(ValueError):entropy_surrogate(torch.tensor([[[float('nan'),0.]]]),torch.tensor([[0]]),torch.tensor([[True]]))
    def test_07_no_valid_tokens(self):
        with self.assertRaises(ValueError):entropy_surrogate(torch.zeros(1,1,2),torch.tensor([[0]]),torch.tensor([[False]]))
    def test_08_padding_is_excluded(self):
        logits=torch.tensor([[[1.,0.],[20.,-20.]]],requires_grad=True)
        t=torch.tensor([[0,1]]);m=torch.tensor([[True,False]])
        a=entropy_surrogate(logits,t,m);b=entropy_surrogate(logits[:,:1],t[:,:1],m[:,:1]);torch.testing.assert_close(a,b)
        a.sum().backward();torch.testing.assert_close(logits.grad[:,1],torch.zeros_like(logits.grad[:,1]))
if __name__=='__main__':
    ap=argparse.ArgumentParser();ap.add_argument('--output',type=Path);a=ap.parse_args();r=unittest.TextTestRunner(verbosity=2).run(unittest.defaultTestLoader.loadTestsFromTestCase(Autograd))
    d={'scope':'CPU toy tree autograd and validation, not ASR/LLM training','torch_version':torch.__version__,'tests_run':r.testsRun,'failures':len(r.failures),'errors':len(r.errors),'result':'PASS' if r.wasSuccessful() else 'FAIL'}
    if a.output:a.output.write_text(json.dumps(d,indent=2)+'\n')
    print(json.dumps(d));raise SystemExit(not r.wasSuccessful())
