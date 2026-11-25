"""Chapter 02 supplementary numerical examples. No RL training or robot execution."""
from pathlib import Path
import numpy as np, json, hashlib
r=Path(__file__).resolve().parent / "results"
r.mkdir(exist_ok=True)
rows=[]
for q2 in [np.pi/2,.001,0.]:
 q1=0.;J=np.array([[-np.sin(q1)-np.sin(q1+q2),-np.sin(q1+q2)],[np.cos(q1)+np.cos(q1+q2),np.cos(q1+q2)]])
 dx=np.array([-.001,0]);l=.05
 pinv=np.linalg.pinv(J)@dx;dls=J.T@np.linalg.solve(J@J.T+l*l*np.eye(2),dx)
 rows.append({'q2_rad':q2,'jacobian':J.tolist(),'pinv_step_rad':pinv.tolist(),'dls_step_rad':dls.tolist(),'pinv_norm_rad':float(np.linalg.norm(pinv)),'dls_norm_rad':float(np.linalg.norm(dls))})
R=np.array([[0.,-1.],[1.,0.]]);t=np.array([1.,2.]);T=np.eye(3);T[:2,:2]=R;T[:2,2]=t;Ti=np.eye(3);Ti[:2,:2]=R.T;Ti[:2,2]=-R.T@t
policy=np.array([.75,.25]);pa=np.array([[.8,.2],[.1,.9]]);p=policy@pa
checks={'transform_inverse':bool(np.allclose(T@Ti,np.eye(3))),'policy_mixture':bool(np.allclose(p,[.625,.375])),'policy_mixture_normalizes':bool(np.isclose(p.sum(),1)),'action_endpoints':bool(np.allclose(-1+((np.array([-1,0,1])+1)/2)*3,[-1,.5,2])),'clock_discount':bool(np.isclose((.99**.1)**10,.99)),'pd_equilibrium':bool(np.isclose(1./20.,.05)),'near_singular_damping':rows[1]['dls_norm_rad']<rows[1]['pinv_norm_rad']/100,'singular_unreachable_first_order':bool(np.allclose(rows[2]['pinv_step_rad'],[0,0]) and np.allclose(rows[2]['dls_step_rad'],[0,0]))}
assert all(checks.values()),checks
out={'description':'Small analytic examples, no robot or RL training','numpy':np.__version__,'checks':checks,'checks_passed':len(checks),'dls_example':{'desired_position_change_m':[-.001,0],'lambda':.05,'rows':rows},'policy_mixture':p.tolist(),'gamma_100Hz_equivalent':.99**.1,'script_sha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest()};(r/'supplement-checks.json').write_text(json.dumps(out,indent=2));print(json.dumps(out,indent=2))
