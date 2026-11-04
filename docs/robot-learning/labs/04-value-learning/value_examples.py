"""Finite toy MDP: exact DP, sampled tabular Q-learning, max bias, and CEM.
Not an ETH assignment, Atari/DQN training, or a physical-robot benchmark.
"""
from pathlib import Path
import csv, hashlib, json, platform
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
ROOT=Path(__file__).resolve().parent
OUT=ROOT/'results'; OUT.mkdir(exist_ok=True)
ASSETS=ROOT.parents[3]/'spaceship-ui/site/assets/assets/posts/rl-robot-learning-ch04-value-learning'
ASSETS.mkdir(parents=True,exist_ok=True)
H,W=3,4; GAMMA=.9; GOAL=3; TRAP=7; WALL=5
STATES=[s for s in range(H*W) if s!=WALL]; TERMINAL={GOAL,TRAP}
MOVES=[(-1,0),(0,1),(1,0),(0,-1)]
P=np.zeros((12,4,12)); R=np.zeros_like(P)
for s in STATES:
 for a in range(4):
  if s in TERMINAL:P[s,a,s]=1;continue
  for b,prob in [(a,.8),((a-1)%4,.1),((a+1)%4,.1)]:
   y,x=divmod(s,W);dy,dx=MOVES[b];yy,xx=y+dy,x+dx
   nxt=yy*W+xx if 0<=yy<H and 0<=xx<W else s
   if nxt==WALL:nxt=s
   P[s,a,nxt]+=prob
  for sp in STATES:R[s,a,sp]=1 if sp==GOAL else -1 if sp==TRAP else 0
mask=np.array([s not in TERMINAL and s!=WALL for s in range(12)])
def backup(v):
 q=(P*(R+GAMMA*v[None,None,:])).sum(axis=2);q[~mask]=0;return q
v=np.zeros(12);history=[v.copy()]
for iteration in range(1000):
 nv=backup(v).max(axis=1);history.append(nv.copy())
 if np.max(np.abs(nv-v))<1e-12:v=nv;break
 v=nv
qstar=backup(v);pol=qstar.argmax(axis=1)
def evaluate(pi):
 rows=np.arange(12);pm=P[rows,pi].copy();rr=(pm*R[rows,pi]).sum(axis=1);pm[~mask]=0;rr[~mask]=0
 return np.linalg.solve(np.eye(12)-GAMMA*pm,rr)
pi=np.zeros(12,dtype=int);pi_values=[]
for k in range(100):
 vp=evaluate(pi);pi_values.append(vp.copy());q=backup(vp);new=q.argmax(axis=1)
 # Preserve previous actions on numerical ties to prevent arbitrary cycling.
 for s in np.flatnonzero(mask):
  if q[s,pi[s]]>=q[s].max()-1e-11:new[s]=pi[s]
 if np.array_equal(new,pi):break
 pi=new
rng=np.random.default_rng(7);q=np.zeros((12,4));counts=np.zeros((12,4),dtype=int);active=np.flatnonzero(mask)
# Generative toy-simulator access: uniformly sample a legal state/action, then a transition.
# This is coverage-controlled tabular learning, not an online-episode sample-efficiency benchmark.
for t in range(240000):
 s=int(rng.choice(active));a=int(rng.integers(4));sp=int(rng.choice(12,p=P[s,a]));rew=R[s,a,sp];counts[s,a]+=1
 alpha=counts[s,a]**(-.65);target=rew+(0 if sp in TERMINAL else GAMMA*q[sp].max());q[s,a]+=alpha*(target-q[s,a])
qerr=float(np.max(np.abs(q[mask]-qstar[mask])));learned=evaluate(q.argmax(axis=1));vgap=float(np.max(v[mask]-learned[mask]))
fig,axs=plt.subplots(1,4,figsize=(12,3.6),layout='constrained')
for ax,idx in zip(axs,[0,1,3,len(history)-1]):
 vals=history[idx].reshape(H,W).copy();vals[1,1]=np.nan;ax.imshow(vals,vmin=-1,vmax=1,cmap='RdYlGn');ax.set_title(f'Bellman sweep {idx}');ax.set_xticks([]);ax.set_yticks([])
 for s in STATES:
  yy,xx=divmod(s,W);label='GOAL\nterminal' if s==GOAL else 'TRAP\nterminal' if s==TRAP else f'{vals[yy,xx]:.3f}'
  ax.text(xx,yy,label,ha='center',va='center',fontsize=9)
 ax.text(1,1,'WALL',ha='center',va='center',fontsize=9)
fig.savefig(ASSETS/'bellman-grid.png',dpi=130);plt.close(fig)
rng=np.random.default_rng(19);noise=rng.normal(0,.5,(200000,2));independent=rng.normal(0,.5,(200000,2));sel=noise.argmax(axis=1);single=noise.max(axis=1);double=independent[np.arange(len(sel)),sel]
fig,ax=plt.subplots(figsize=(7.4,3.8),layout='constrained');ax.hist(single,bins=80,alpha=.6,density=True,label='same estimates select + evaluate');ax.hist(double,bins=80,alpha=.5,density=True,label='independent estimates evaluate');ax.axvline(0,color='black',ls='--',label='true action values = 0');ax.set_xlabel('Estimated value');ax.set_ylabel('Density');ax.legend(fontsize=9);fig.savefig(ASSETS/'max-bias.png',dpi=160);plt.close(fig)
def critic(a):return 1-(a-.65)**2
rng=np.random.default_rng(17);mu=-.5;sigma=.6;cem=[]
for k in range(5):
 candidates=np.clip(rng.normal(mu,sigma,64),-1,1);elite=candidates[np.argsort(critic(candidates))[-8:]];cem.extend((k,float(x),float(critic(x))) for x in candidates);mu=float(elite.mean());sigma=max(float(elite.std()),.02)
fig,ax=plt.subplots(figsize=(7.4,3.8),layout='constrained');xx=np.linspace(-1,1,400);ax.plot(xx,critic(xx),color='black',label='known quadratic critic (not learned)')
for k in range(5):
 xx=np.array([x for j,x,_ in cem if j==k]);ax.scatter(xx,critic(xx),s=12,alpha=.55,label=f'round {k+1}')
ax.axvline(mu,ls='--',color='black',label='final mean');ax.set_xlabel('Action');ax.set_ylabel('Q illustration');ax.legend(fontsize=8,ncol=2);fig.savefig(ASSETS/'cem-search.png',dpi=160);plt.close(fig)
# Single TD update, terminal handling, separate action selection/evaluation, and actor chain rule.
y_nonterminal=.2+.9*.8;y_terminal=.2;updated=.4+.25*(y_nonterminal-.4)
online=np.array([2.,1.]);target=np.array([.5,1.5]);dqn=target.max();ddqn=target[online.argmax()]
phi=.2;s=2.;action=phi*s;actor_gradient=(-2*(action-.65))*s;h=1e-6;finite=(critic((phi+h)*s)-critic((phi-h)*s))/(2*h)
checks={
 'transition_rows_sum_to_one':np.allclose(P[STATES].sum(axis=2),1),
 'terminal_reward_not_repeated':np.all(R[list(TERMINAL)]==0),
 'bellman_fixed_point':np.max(np.abs(backup(v).max(axis=1)-v))<1e-10,
 'policy_evaluation_linear_solve':np.max(np.abs(evaluate(pol)-v))<1e-9,
 'policy_iteration_matches_value_iteration':np.max(np.abs(vp-v))<1e-9,
 'policy_improvement_nondecreasing':all(np.all(b>=a-1e-10) for a,b in zip(pi_values,pi_values[1:])),
 'all_active_actions_visited':counts[mask].min()>1000,
 'sampled_q_error_below_0_12':qerr<.12,
 'sampled_policy_value_gap_below_0_03':vgap<.03,
 'single_TD_update':abs(updated-.53)<1e-12,
 'terminal_target_does_not_bootstrap':y_terminal==.2,
 'DQN_and_DoubleDQN_separate_selection':dqn==1.5 and ddqn==.5,
 'max_bias_matches_two_normal_expectation':abs(single.mean()-.5/np.sqrt(np.pi))<.005,
 'independent_evaluation_near_zero':abs(double.mean())<.005,
 'CEM_final_mean_near_known_optimum':abs(mu-.65)<.03,
 'actor_chain_rule_matches_finite_difference':abs(actor_gradient-finite)<1e-7,
 'Bernoulli_return_sign':abs(.1*(-1)+.9*(1)-.8)<1e-12,
 'candidate_hit_probability':abs((1-(1-.01)**100)-.6339676587267709)<1e-12}
checks={k:bool(z) for k,z in checks.items()};assert all(checks.values()),checks
with (OUT/'values.csv').open('w',newline='') as f:
 w=csv.writer(f);w.writerow(['state','optimal_value','learned_policy_value','learned_q_up','learned_q_right','learned_q_down','learned_q_left']);w.writerows([s,float(v[s]),float(learned[s]),*q[s]] for s in STATES)
with (OUT/'cem.csv').open('w',newline='') as f:
 w=csv.writer(f);w.writerow(['round','action','illustrative_Q']);w.writerows(cem)
result={'kind':'finite stochastic grid DP + coverage-controlled tabular Q-learning, synthetic bias/CEM/actor calculations','python':platform.python_version(),'numpy':np.__version__,'matplotlib':matplotlib.__version__,'seed_Q':7,'seed_bias':19,'seed_CEM':17,'gamma':GAMMA,'Q_sampled_transitions':240000,'minimum_state_action_visits':int(counts[mask].min()),'max_Q_error':qerr,'max_learned_policy_value_gap':vgap,'value_iteration_sweeps':len(history)-1,'policy_iteration_evaluations':len(pi_values),'optimal_values':v.tolist(),'TD_example':{'target':y_nonterminal,'new_value':updated,'terminal_target':y_terminal},'max_bias':{'same_estimates_mean':float(single.mean()),'independent_estimates_mean':float(double.mean()),'analytic_same_estimates_mean':float(.5/np.sqrt(np.pi))},'CEM':{'samples_per_round':64,'rounds':5,'elite_count':8,'final_mean':mu,'true_optimum':.65,'critic_learned':False},'actor_gradient':actor_gradient,'actor_finite_difference':float(finite),'official_homework_executed':False,'DQN_DDPG_or_robot_training':False,'checks':checks,'checks_passed':sum(checks.values()),'script_sha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest()}
(OUT/'summary.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result,indent=2))
