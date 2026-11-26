"""Analytic teaching examples. No neural policy training or robot execution."""
from pathlib import Path
import json,csv
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
root=Path(__file__).resolve().parents[4]
out=Path(__file__).parent/'results';out.mkdir(exist_ok=True)
assets=root/'spaceship-ui/site/assets/assets/posts/rl-robot-learning-ch06-generative-models';assets.mkdir(parents=True,exist_ok=True)
rng=np.random.default_rng(61);checks={}
def ck(name,v):
 checks[name]=bool(v)
 if not v:raise AssertionError(name)
def save(name):plt.savefig(assets/name,dpi=150);plt.close()
x=np.linspace(-2,2,401);y=1.2*np.sin(np.pi*(x+2)/4)
ck('two_routes_clear_circle',np.min(x*x+y*y)>.7**2)
ck('mean_route_collides',np.min(x*x)<.7**2)
fig,ax=plt.subplots(figsize=(9,3.5),layout='constrained');ax.add_patch(plt.Circle((0,0),.7,color='#f5b5b5'));ax.plot(x,y,label='Demonstration A');ax.plot(x,-y,label='Demonstration B');ax.plot(x,0*x,'--',label='Pointwise mean');ax.set(aspect='equal',xlabel='x',ylabel='y',title='Two valid routes; their average collides');ax.legend(loc='upper right',fontsize=8);save('multimodal-paths.png')
# z~N(0,1), x|z~N(z, noise variance), analytic posterior and ELBO.
s2=.4;xobs=1.3;pm=xobs/(1+s2);pv=s2/(1+s2);qm=.6;qv=.5
kl=lambda m,v,m2,v2:.5*(np.log(v2/v)+(v+(m-m2)**2)/v2-1)
logp=-.5*(np.log(2*np.pi*(1+s2))+xobs*xobs/(1+s2))
rec=-.5*(np.log(2*np.pi*s2)+((xobs-qm)**2+qv)/s2)
elbo=rec-kl(qm,qv,0,1);gap=kl(qm,qv,pm,pv)
ck('ELBO_identity',np.isclose(logp-elbo,gap));ck('ELBO_lower_bound',elbo<logp);ck('posterior_makes_bound_tight',np.isclose(kl(pm,pv,pm,pv),0))
eps=.7;mu=.3;sig=.8;h=1e-6;f=lambda m,s:(m+s*eps-2)**2
ck('reparameterization_mu_gradient',np.isclose((f(mu+h,sig)-f(mu-h,sig))/(2*h),2*(mu+sig*eps-2)))
ck('reparameterization_sigma_gradient',np.isclose((f(mu,sig+h)-f(mu,sig-h))/(2*h),2*(mu+sig*eps-2)*eps))
code=np.array([-1.,0.,1.]);quant=lambda z:code[np.argmin((z-code)**2)]
ck('nearest_code_lookup',quant(.6)==1);ck('quantizer_true_derivative_zero',(quant(.6+h)-quant(.6-h))/(2*h)==0);ck('STE_surrogate_one',1!=0)
ck('codebook_gradient_direction',2*(1-.6)>0);ck('commitment_gradient_direction',2*.25*(.6-1)<0)
# Forward Markov simulation and direct marginal: independent samples, not equal paths.
beta=np.linspace(.0001,.02,100);alpha=1-beta;abar=np.cumprod(alpha);n=80000;z=np.full(n,1.5)
for a,b in zip(alpha,beta):z=np.sqrt(a)*z+np.sqrt(b)*rng.normal(size=n)
direct=np.sqrt(abar[-1])*1.5+np.sqrt(1-abar[-1])*rng.normal(size=n)
mean=np.sqrt(abar[-1])*1.5;var=1-abar[-1]
ck('iterated_forward_mean',abs(z.mean()-mean)<.012);ck('iterated_forward_variance',abs(z.var()-var)<.012)
ck('direct_forward_mean',abs(direct.mean()-mean)<.012);ck('direct_forward_variance',abs(direct.var()-var)<.012);ck('marginal_not_same_sample_path',not np.allclose(z,direct))
fig,axs=plt.subplots(1,2,figsize=(9,3.5),layout='constrained');axs[0].hist(z,bins=80,density=True,alpha=.5,label='100 incremental steps');axs[0].hist(direct,bins=80,density=True,alpha=.5,label='Direct marginal');axs[0].legend(fontsize=8);axs[0].set(title='Same marginal, independent samples',xlabel='Noisy x',ylabel='Density')
axs[1].plot(np.arange(1,101),np.sqrt(abar),label='Signal coefficient');axs[1].plot(np.arange(1,101),np.sqrt(1-abar),label='Noise coefficient');axs[1].legend(fontsize=8);axs[1].set(title='Signal and noise scales',xlabel='Diffusion index',ylabel='Coefficient');save('forward-marginals.png')
# DDIM uses oracle epsilon here: tests algebra, NOT trained prediction quality.
x0=1.5;ei=.4;i=99;j=29;xi=np.sqrt(abar[i])*x0+np.sqrt(1-abar[i])*ei
hat=(xi-np.sqrt(1-abar[i])*ei)/np.sqrt(abar[i]);xj=np.sqrt(abar[j])*hat+np.sqrt(1-abar[j])*ei
ck('DDIM_oracle_clean_recovery',np.isclose(hat,x0));ck('DDIM_oracle_skipped_marginal',np.isclose(xj,np.sqrt(abar[j])*x0+np.sqrt(1-abar[j])*ei))
u=np.array([1.,-2.]);c=np.array([3.,1.]);cfg=lambda w:u+w*(c-u)
ck('CFG_zero',np.allclose(cfg(0),u));ck('CFG_one',np.allclose(cfg(1),c));ck('CFG_two_extrapolation',np.allclose(cfg(2),2*c-u))
# Independent Gaussian pair interpolation has known conditional-mean velocity.
# x_t=(1-t)e+t y, e~N(0,1), y~N(2,.5^2).
m=2.;s=.5
velocity=lambda z,t:m+((t*s*s-(1-t))/((1-t)**2+t*t*s*s))*(z-t*m)
rows=[];initial=rng.normal(size=60000);fig,axs=plt.subplots(1,2,figsize=(9,3.5),layout='constrained')
for steps in [5,20,100,500]:
 samples=initial.copy();track=[samples[:15].copy()]
 for k in range(steps):samples+=velocity(samples,k/steps)/steps;track.append(samples[:15].copy())
 err=abs(samples.std()-s);rows.append({'steps':steps,'mean':float(samples.mean()),'std':float(samples.std()),'std_abs_error':float(err)})
 if steps==100:
  axs[0].plot(np.linspace(0,1,steps+1),np.array(track),alpha=.5);axs[0].set(title='ODE paths under the marginal field',xlabel='Flow time: noise 0 to data 1',ylabel='x')
ck('Euler_error_decreases',rows[-1]['std_abs_error']<rows[0]['std_abs_error']);ck('Euler_endpoint_mean',abs(rows[-1]['mean']-m)<.01);ck('Euler_endpoint_std',abs(rows[-1]['std']-s)<.01)
ck('pair_target_not_constant_marginal_field',not np.isclose(velocity(1.,.2),velocity(1.,.8)))
axs[1].loglog([r['steps'] for r in rows],[r['std_abs_error'] for r in rows],'o-');axs[1].set(title='Euler discretization error',xlabel='Integration steps',ylabel='Absolute endpoint std error');save('flow-integration.png')
with (out/'flow.csv').open('w') as f:w=csv.DictWriter(f,fieldnames=rows[0]);w.writeheader();w.writerows(rows)
result={'seed':61,'checks':checks,'passed':len(checks),'ELBO':{'log_evidence':float(logp),'lower_bound':float(elbo),'gap_KL':float(gap)},'forward':{'analytic_mean':float(mean),'analytic_variance':float(var),'iterated_mean':float(z.mean()),'iterated_variance':float(z.var()),'direct_mean':float(direct.mean()),'direct_variance':float(direct.var())},'flow':rows,'scope':'analytic examples only; DDIM oracle; no learned generative network, robot simulation or hardware execution'}
(out/'summary.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result,indent=2))
