"""Small exact calculations; no pretrained tokenizer or robot policy run."""
from pathlib import Path
import json,csv,collections
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
root=Path(__file__).resolve().parents[4];out=Path(__file__).parent/'results';out.mkdir(exist_ok=True)
assets=root/'spaceship-ui/site/assets/assets/posts/rl-robot-learning-ch07-sequence-transformers';assets.mkdir(parents=True,exist_ok=True)
rng=np.random.default_rng(71);checks={}
def ck(n,v):
 checks[n]=bool(v)
 if not v:raise AssertionError(n)
def softmax(x):
 y=np.exp(x-np.max(x,axis=-1,keepdims=True));return y/y.sum(axis=-1,keepdims=True)
def attention(q,k,v,mask=None):
 s=q@k.T/np.sqrt(q.shape[-1]);s=s if mask is None else s+mask;w=softmax(s);return w@v,w
q=rng.normal(size=(6,4));k=rng.normal(size=(6,4));v=rng.normal(size=(6,3));mask=np.where(np.triu(np.ones((6,6)),1)>0,-np.inf,0.)
y,w=attention(q,k,v,mask);full,wfull=attention(q,k,v)
ck('attention_rows_sum_one',np.allclose(w.sum(1),1));ck('future_weights_zero',np.all(w[np.triu_indices(6,1)]==0));ck('self_is_visible',w[0,0]==1)
k2=k.copy();v2=v.copy();k2[4:]+=100;v2[4:]-=200;y2,_=attention(q,k2,v2,mask)
ck('future_changes_do_not_change_prefix',np.allclose(y[:4],y2[:4]));yn,_=attention(q,k2,v2);ck('unmasked_attention_sees_future',not np.allclose(full[:4],yn[:4]))
perm=np.array([2,0,4,1,5,3]);yp,_=attention(q[perm],k[perm],v[perm]);ck('attention_permutation_equivariance',np.allclose(yp,full[perm]))
x=rng.normal(size=(6,4));pos=np.arange(6)[:,None]*np.array([.1,.3,.7,1.]);yp,_=attention(x[perm]+pos,x[perm]+pos,x[perm]+pos);ybase,_=attention(x+pos,x+pos,x+pos);ck('absolute_position_changes_order_response',not np.allclose(yp,ybase[perm]))
fig,axs=plt.subplots(1,2,figsize=(9,3.6),layout='constrained')
for ax,a,title in zip(axs,[wfull,w],['Unmasked attention','Causal attention']):
 im=ax.imshow(a,vmin=0,vmax=1,cmap='Blues');ax.set(title=title,xlabel='Key position',ylabel='Query position');fig.colorbar(im,ax=ax,fraction=.045)
plt.savefig(assets/'attention-masks.png',dpi=150);plt.close()
p=np.array([.7,.8,.6]);loss=-np.log(p).mean();ck('teacher_forcing_joint_and_loss',np.isclose(np.exp(-3*loss),p.prod()));ck('probability_one_has_zero_CE',np.isclose(-np.log(1.),0.));ck('tiny_probability_large_loss',-np.log(.01)>-np.log(.8))
# A small character BPE, with explicit symbol merge tree and exact inversion.
corpus=[list('robot robot robots robot'),list('robotic robots robot')];merges={};sizes=[sum(map(len,corpus))]
for step in range(8):
 c=collections.Counter((a,b) for s in corpus for a,b in zip(s,s[1:]))
 if not c:break
 pair=sorted(c,key=lambda x:(-c[x],x))[0];token='@'+str(step);merges[token]=pair
 new=[]
 for s in corpus:
  t=[];j=0
  while j<len(s):
   if j+1<len(s) and (s[j],s[j+1])==pair:t.append(token);j+=2
   else:t.append(s[j]);j+=1
  new.append(t)
 corpus=new;sizes.append(sum(map(len,corpus)))
def expand(t):return ''.join(expand(x) for x in merges[t]) if t in merges else t
ck('BPE_exact_roundtrip',[''.join(expand(t) for t in s) for s in corpus]==['robot robot robots robot','robotic robots robot']);ck('BPE_token_count_decreases',all(b<a for a,b in zip(sizes,sizes[1:])))
# Distinct physical histories can end in the same image position.
ck('same_position_different_velocity',np.isclose((0-(-.1))/.1,1) and np.isclose((0-.1)/.1,-1))
lo=-.02;hi=.04
encode=lambda a:np.minimum(255,np.floor(256*np.clip((np.asarray(a)-lo)/(hi-lo),0,1))).astype(int)
decode=lambda b:lo+(np.asarray(b)+.5)*(hi-lo)/256
ck('quantizer_lower_endpoint',encode(lo)==0);ck('quantizer_upper_endpoint_clamped',encode(hi)==255);ck('quantizer_outlier_clipped',encode(10)==255)
a=np.linspace(lo,hi,10001);err=np.max(abs(decode(encode(a))-a));ck('in_range_half_bin_error',err<=(hi-lo)/512+1e-12)
ck('outside_range_can_have_large_error',abs(decode(encode(10))-10)>(hi-lo)/512)
# ACT paper: index0 is oldest prediction, NOT newest.
preds=np.array([1.,2.,3.]);weights=np.exp(-.5*np.arange(3));ensemble=(preds@weights)/weights.sum()
ck('ACT_oldest_has_largest_weight',weights[0]>weights[-1]);ck('ACT_ensemble_between_predictions',1<ensemble<2);ck('uniform_ensemble_mean',np.isclose(preds.mean(),2))
# Orthonormal type-II DCT implemented with a cosine matrix (not official FAST tokenizer).
H=100;j=np.arange(H);freq=np.arange(H)[:,None];D=np.sqrt(2/H)*np.cos(np.pi*(j+.5)*freq/H);D[0]/=np.sqrt(2)
ck('DCT_orthonormal',np.allclose(D@D.T,np.eye(H)))
smooth=.4+.6*np.cos(np.pi*(j+.5)/H);jump=np.where(j<50,-.7,.7);rows=[];fig,axs=plt.subplots(1,3,figsize=(12,3.6),layout='constrained')
for name,signal,color in [('smooth',smooth,'#166a6c'),('contact-like jump',jump,'#b96930')]:
 c=D@signal;back=D.T@c;quant=np.round(10*c)/10;restored=D.T@quant;rmse=np.sqrt(np.mean((restored-signal)**2));rows.append({'signal':name,'rmse':float(rmse),'nonzero_coeffs':int(np.count_nonzero(quant)),'energy_first_4':float(np.sum(c[:4]**2)/np.sum(c*c))})
 ck(name+'_DCT_inverse',np.allclose(back,signal));ck(name+'_energy_preserved',np.isclose(np.sum(c*c),np.sum(signal*signal)));ck(name+'_quantization_RMSE_bound',rmse<=.05+1e-12)
 axs[0].plot(j/50,signal,label=name,color=color);axs[1].plot(np.arange(20),np.abs(c[:20]),'o-',label=name,color=color);axs[2].plot(j/50,restored-signal,label=name,color=color)
ck('smooth_concentrates_low_frequency',rows[0]['energy_first_4']>.999);ck('jump_needs_more_coefficients',rows[1]['nonzero_coeffs']>rows[0]['nonzero_coeffs'])
for ax in axs:ax.legend(fontsize=7)
axs[0].set(title='Two action signals',xlabel='Physical time (s)',ylabel='Normalized action');axs[1].set(title='DCT coefficient magnitudes',xlabel='Frequency index',ylabel='Magnitude');axs[2].set(title='Rounding reconstruction error',xlabel='Physical time (s)',ylabel='Error');plt.savefig(assets/'dct-action-codec.png',dpi=150);plt.close()
# A target-return conditional lookup illustrates conditioning, not RL optimization.
records=[(1,'left'),(1,'right'),(5,'right'),(5,'right')];selected=[a for g,a in records if g==5];ck('return_condition_selects_data_behavior',selected.count('right')/len(selected)==1);ck('unseen_return_has_no_data_support',not any(g==100 for g,a in records))
with (out/'codec.csv').open('w') as f:w=csv.DictWriter(f,fieldnames=rows[0]);w.writeheader();w.writerows(rows)
summary={'seed':71,'passed':len(checks),'checks':checks,'CE_example':float(loss),'BPE_token_counts':sizes,'BPE_encoded':corpus,'ACT_example':{'predictions_old_to_new':preds.tolist(),'weights':weights.tolist(),'weighted_result':float(ensemble)},'binning_max_error_in_range':float(err),'codec':rows,'scope':'Exact NumPy calculations; toy character BPE; DCT quantization; no official FAST tokenizer, VLA training or robot simulation/hardware execution'}
(out/'summary.json').write_text(json.dumps(summary,indent=2)+'\n');print(json.dumps(summary,indent=2))
