from pathlib import Path
import numpy as np,json,matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
root=Path(__file__).resolve().parents[4];lab=root/'docs/robot-learning/labs/05-policy-gradients';res=lab/'results';res.mkdir(parents=True,exist_ok=True);fig=root/'spaceship-ui/site/assets/assets/posts/rl-robot-learning-ch05-policy-gradients';fig.mkdir(parents=True,exist_ok=True)
checks=[]
def check(n,c):
 assert c,n;checks.append(n)
p=.3;r=np.array([99.,101.]);pr=np.array([1-p,p]);score=np.array([-p,1-p]);g=np.sum(pr*score*r);analytic=2*p*(1-p)
check('score gradient equals exact derivative',np.isclose(g,analytic))
check('baseline score expectation zero',np.isclose(pr@score,0))
bs=np.linspace(95,105,300);variance=np.array([pr@((score*(r-b)-g)**2) for b in bs]);vmean=float(pr@((score*(r-pr@r)-g)**2));vraw=float(pr@((score*r-g)**2));bopt=float(np.sum(pr*score**2*r)/np.sum(pr*score**2));vopt=float(pr@((score*(r-bopt)-g)**2));check('value baseline reduces this variance',vmean<vraw);check('optimal baseline differs from V',not np.isclose(bopt,pr@r));check('weighted optimum has zero variance for this toy',vopt<1e-20)
# Exact expected same-batch centering bias for N=2.
centered=0.;loo=0.
for a in [0,1]:
 for b in [0,1]:
  prob=pr[a]*pr[b];rr=r[[a,b]];ss=score[[a,b]];centered+=prob*np.mean(ss*(rr-rr.mean()));loo+=prob*np.mean(ss*(rr-rr[::-1]))
check('same-batch mean bias factor',np.isclose(centered,g*.5));check('leave-one-out unbiased',np.isclose(loo,g))
old=np.array([.8,.2]);new=np.array([.4,.6]);f=np.array([0.,1.]);check('importance exact identity',np.isclose(old@((new/old)*f),new@f));check('unweighted old expectation wrong',not np.isclose(old@f,new@f))
eps=.2
clip=lambda ratio,A: np.minimum(ratio*A,np.clip(ratio,1-eps,1+eps)*A)
check('PPO positive plateau',np.isclose(clip(1.5,2),2.4));check('PPO negative decrease plateau',np.isclose(clip(.5,-2),-1.6));check('PPO adverse direction retains penalty',np.isclose(clip(1.5,-2),-3))
H=lambda x:-np.sum(x*np.log(x));check('binary uniform entropy log2',np.isclose(H(np.array([.5,.5])),np.log(2)))
q=np.array([0.,1.]);alphas=[.1,.5,1.,2.];policies=[]
for a in alphas:
 w=np.exp((q-q.max())/a);w/=w.sum();policies.append(w)
check('temperature increases entropy',all(H(policies[i])<H(policies[i+1]) for i in range(3)))
mu=.2;sig=.3;noise=.7;target=.8;loss=lambda m:(m+sig*noise-target)**2;h=1e-6;check('reparameterized sample gradient',np.isclose((loss(mu+h)-loss(mu-h))/(2*h),2*(mu+sig*noise-target)))
# Soft TD target, termination and squash Jacobian.
soft_target=.2+.9*(1.5-.2*(-.7));check('SAC entropy target sign',np.isclose(soft_target,1.676));check('terminal target',np.isclose(.2+.9*(1-1)*(1.5+.14),.2))
u=.6;a=np.tanh(u);logp=-.5*u*u-.5*np.log(2*np.pi)-np.log(1-a*a);check('squash density Jacobian',np.isclose(logp-(-.5*u*u-.5*np.log(2*np.pi)),-np.log(1-a*a)))
# REINFORCE on a one-state, two-action stochastic reward problem; independent fixed baseline .5.
rng=np.random.default_rng(23);theta=0.;history=[]
for step in range(1500):
 prob=1/(1+np.exp(-theta));actions=rng.binomial(1,prob,64);rewards=rng.binomial(1,np.where(actions==1,.8,.2));theta+=.08*np.mean((actions-prob)*(rewards-.5));history.append([step,prob,.2+.6*prob])
check('toy policy improves expected return',history[-1][2]>.75)
plt.rcParams.update({'font.size':12,'figure.dpi':150})
f,ax=plt.subplots(figsize=(8,3.7));ax.plot(bs,variance);ax.axvline(pr@r,label='V = 99.6',color='orange');ax.axvline(bopt,label=f'optimal = {bopt:.1f}',color='green',ls='--');ax.set(xlabel='baseline b',ylabel='variance of score × (return − b)',title='A useful baseline is not always the variance-minimizing baseline');ax.legend();f.tight_layout();f.savefig(fig/'baseline-variance.png');plt.close(f)
x=np.linspace(0,2,401);f,axes=plt.subplots(1,2,figsize=(9,3.5))
for ax,A in zip(axes,[2,-2]):
 ax.plot(x,x*A,'--',label='unclipped');ax.plot(x,clip(x,A),label='PPO min');ax.axvspan(.8,1.2,alpha=.1);ax.set(xlabel='new / old probability',ylabel='surrogate objective',title=f'Advantage = {A:+}');ax.legend()
f.tight_layout();f.savefig(fig/'ppo-clipping.png');plt.close(f)
f,axes=plt.subplots(1,2,figsize=(9,3.5));hh=np.array(history);axes[0].plot(hh[:,0],hh[:,2]);axes[0].axhline(.8,ls='--',label='best expected reward');axes[0].set(xlabel='updates (64 samples each)',ylabel='exact expected reward',title='Executed REINFORCE toy');axes[0].legend();axes[1].plot(alphas,[x[1] for x in policies],'o-');axes[1].set(xlabel='temperature alpha',ylabel='probability of action with Q = 1',title='Entropy-regularized optimum');f.tight_layout();f.savefig(fig/'policy-and-entropy.png');plt.close(f)
summary={'seed':23,'checks_passed':len(checks),'checks':checks,'gradient':g,'V':float(pr@r),'baseline_optimum':bopt,'variance_raw':vraw,'variance_V':vmean,'variance_optimum':vopt,'same_batch_N2_gradient':centered,'leave_one_out_gradient':loo,'soft_TD_target':soft_target,'reinforce_final_expected_reward':history[-1][2],'reinforce_samples':1500*64,'softmax_policies':{str(a):p.tolist() for a,p in zip(alphas,policies)},'scope':'Exact toy calculations and REINFORCE bandit; no PPO/SAC neural training or physical robot'}
(res/'summary.json').write_text(json.dumps(summary,indent=2));np.savetxt(res/'reinforce.csv',hh,delimiter=',',header='step,p_action1,expected_reward',comments='');np.savetxt(res/'baseline-variance.csv',np.c_[bs,variance],delimiter=',',header='baseline,variance',comments='');print(json.dumps(summary,indent=2))
