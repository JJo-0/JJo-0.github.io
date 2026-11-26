"""Chapter 02: executable geometry/time-scaling checks and a Gymnasium rollout.
This is a fixed PD controller near upright, not reinforcement learning training.
"""
from pathlib import Path
import csv, hashlib, json, math, platform, os
os.environ.setdefault('MPLCONFIGDIR', '/private/tmp/jjo-rl-matplotlib')
os.environ.setdefault('SDL_VIDEODRIVER', 'dummy')
import numpy as np
import gymnasium as gym
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from PIL import Image

ROOT = Path(__file__).resolve().parent
OUT = ROOT / 'results'
OUT.mkdir(exist_ok=True)

def scale(s):
    return 10*s**3 - 15*s**4 + 6*s**5

def fk(q):
    a, b = q
    return np.array([math.cos(a)+math.cos(a+b), math.sin(a)+math.sin(a+b)])

def loss(q):
    return .5 * np.sum((fk(q)-np.array([1., 1.]))**2)

checks = {}
R = np.array([[0., -1.], [1., 0.]])
checks['rotation_orthogonal'] = bool(np.allclose(R.T@R, np.eye(2)))
checks['rotation_determinant_one'] = bool(np.isclose(np.linalg.det(R), 1.))
checks['transform_example'] = bool(np.allclose(R@np.array([1., 0.])+[1.,2.], [1.,3.]))
checks['two_ik_solutions_same_position'] = bool(np.allclose(fk([0,math.pi/2]), fk([math.pi/2,-math.pi/2])))
q = np.array([.3, .4]); a,b = q
J = np.array([[-math.sin(a)-math.sin(a+b), -math.sin(a+b)], [math.cos(a)+math.cos(a+b),math.cos(a+b)]])
grad = J.T@(fk(q)-[1.,1.]); eps=1e-6
grad_fd = np.array([(loss(q+np.eye(2)[i]*eps)-loss(q-np.eye(2)[i]*eps))/(2*eps) for i in range(2)])
checks['ik_gradient_finite_difference'] = bool(np.allclose(grad,grad_fd,atol=1e-8))
checks['ik_small_step_reduces_loss'] = bool(loss(q-.01*grad)<loss(q))
checks['quintic_end_positions'] = bool(np.allclose([scale(0),scale(1)],[0,1]))
checks['quintic_end_velocities'] = bool(np.allclose([30*s*s*(1-s)**2 for s in [0,1]],[0,0]))
checks['quintic_end_accelerations'] = bool(np.allclose([60*s-180*s*s+120*s**3 for s in [0,1]],[0,0]))
checks['quintic_peak_speed'] = bool(np.isclose(30*.5**2*(1-.5)**2,1.875))
checks['trajectory_probability'] = bool(np.isclose(.5*.8*.9*.6*.7,.1512))
checks['discounted_return'] = bool(np.isclose(sum(.9**i*r for i,r in enumerate([0,0,1])),.81))
checks['pid_example'] = bool(np.isclose(10*.1+.5*.2+2*((.1-.12)/.02),-.9))
assert all(checks.values()), checks

s=np.linspace(0,1,201)
fig,axes=plt.subplots(3,1,figsize=(8,7),sharex=True)
for ax,lin,qui,ylabel in zip(axes,[s,np.ones_like(s),np.zeros_like(s)],[scale(s),30*s*s*(1-s)**2,60*s-180*s*s+120*s**3],['Position (rad)','Velocity (rad/s)','Acceleration (rad/s2)']):
    ax.plot(s,lin,label='Linear',color='#d97706'); ax.plot(s,qui,label='Quintic',color='#2563eb'); ax.set_ylabel(ylabel); ax.grid(alpha=.2)
axes[0].legend();axes[-1].set_xlabel('Time (s), 0 to 1 rad in 1 second')
axes[1].scatter([0,1],[1,1],color='#d97706',s=24)
axes[2].text(.025,.08,'Linear: impulsive endpoint acceleration is not drawn',transform=axes[2].transAxes,fontsize=8)
fig.tight_layout();fig.savefig(OUT/'time-scaling.png',dpi=160);plt.close(fig)

rollouts={}
for kind in ['zero','pd']:
    env=gym.make('Pendulum-v1',render_mode='rgb_array')
    obs,_=env.reset(seed=7,options={'x_init':.2,'y_init':0.})
    initial=obs.tolist();rows=[];frames=[]
    for t in range(200):
        theta=math.atan2(float(obs[1]),float(obs[0])); velocity=float(obs[2])
        torque=0. if kind=='zero' else float(np.clip(-15*theta-3*velocity,-2,2))
        if t%5==0: frames.append(Image.fromarray(env.render()).resize((360,360)))
        nxt,reward,terminated,truncated,_=env.step(np.array([torque],dtype=np.float32))
        rows.append({'step':t,'theta_before_rad':theta,'velocity_before_rad_s':velocity,'torque_Nm':torque,'reward':float(reward),'terminated':bool(terminated),'truncated':bool(truncated)})
        obs=nxt
        if terminated or truncated:break
    with (OUT/f'pendulum-{kind}.csv').open('w') as f:
        writer=csv.DictWriter(f,fieldnames=rows[0]);writer.writeheader();writer.writerows(rows)
    frames[0].save(OUT/f'pendulum-{kind}.gif',save_all=True,append_images=frames[1:],duration=250,loop=0)
    rollouts[kind]={'seed':7,'initial_observation':initial,'steps':len(rows),'reward_sum':sum(x['reward'] for x in rows),'final_angle_rad':math.atan2(float(obs[1]),float(obs[0])),'final_velocity_rad_s':float(obs[2]),'terminated':rows[-1]['terminated'],'truncated':rows[-1]['truncated']}
    env.close()
assert rollouts['pd']['initial_observation']==rollouts['zero']['initial_observation']
assert rollouts['pd']['steps']==rollouts['zero']['steps']==200
summary={'python':platform.python_version(),'gymnasium':gym.__version__,'numpy':np.__version__,'matplotlib':matplotlib.__version__,'source_sha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),'kind':'fixed PD near-upright interface demonstration; no learning, no real robot','numeric_checks':checks,'numeric_checks_passed':len(checks),'rollouts':rollouts}
(OUT/'summary.json').write_text(json.dumps(summary,indent=2));print(json.dumps(summary,indent=2))
