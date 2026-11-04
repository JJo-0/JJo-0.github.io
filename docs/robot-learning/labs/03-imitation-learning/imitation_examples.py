"""Small teaching examples: linear BC/data aggregation, modes, and an exact ELBO.

This is a scalar synthetic simulator, not an ETH homework or a robot benchmark.
"""
from pathlib import Path
import csv
import hashlib
import json
import platform
import numpy as np
import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "results"
OUT.mkdir(exist_ok=True)
ASSETS = Path(__file__).resolve().parents[4] / "spaceship-ui/site/assets/assets/posts/rl-robot-learning-ch03-imitation-learning"
ASSETS.mkdir(parents=True, exist_ok=True)


def expert(x):
    return float(np.clip(-0.8 * x, -1.0, 1.0))


def rollout(weight, seed, horizon=60):
    rng = np.random.default_rng(seed)
    x = float(rng.uniform(-0.4, 0.4))
    rows = []
    for step in range(horizon):
        action = float(np.clip(weight * x, -1.0, 1.0))
        disturbance = float(0.015 + rng.normal(0.0, 0.008))
        rows.append((step, x, action, expert(x), disturbance))
        x = x + action + disturbance
    return rows


def fit(data):
    xs = np.array([x for x, _ in data])
    ys = np.array([a for _, a in data])
    return float(np.linalg.lstsq(xs[:, None], ys, rcond=None)[0][0])


data = [(0.0, 0.0)] * 20
weights = [fit(data)]
history = [{"iteration": 0, "samples": len(data), "weight": weights[0]}]
for iteration in range(3):
    states = rollout(weights[-1], 7 + iteration)
    data.extend((x, label) for _, x, _, label, _ in states)
    weights.append(fit(data))
    history.append({"iteration": iteration + 1, "samples": len(data), "weight": weights[-1]})

metrics = []
all_rows = []
for name, weight in [("center_only_BC", weights[0]), ("aggregated_labels", weights[-1])]:
    runs = [rollout(weight, seed) for seed in range(1000, 1020)]
    rms = [float(np.sqrt(np.mean([x * x for _, x, *_ in run]))) for run in runs]
    metrics.append({"method": name, "weight": weight, "episodes": 20, "steps_each": 60,
                    "mean_RMS_state": float(np.mean(rms)), "std_RMS_state": float(np.std(rms, ddof=1))})
    for seed, run in zip(range(1000, 1020), runs):
        all_rows.extend((name, seed, *row) for row in run)
with (OUT / "rollouts.csv").open("w") as f:
    w = csv.writer(f)
    w.writerow(["method", "seed", "step", "state", "action", "expert_label", "disturbance"])
    w.writerows(all_rows)

plt.rcParams.update({"font.size": 12, "axes.spines.top": False, "axes.spines.right": False})
fig, ax = plt.subplots(figsize=(8.4, 4.5), constrained_layout=True)
for name, weight, color in [("Center-only BC", weights[0], "#a64b35"),
                             ("After aggregated expert labels", weights[-1], "#2c7059")]:
    rows = rollout(weight, 1000)
    ax.plot([r[0] for r in rows], [r[1] for r in rows], label=name, color=color, linewidth=2.5)
ax.axhline(0, color="#555", linestyle="--", linewidth=1)
ax.set(xlabel="Policy step", ylabel="Scalar lateral state x", title="Synthetic feedback example: one held-out rollout")
ax.legend()
fig.savefig(ASSETS / "data-aggregation.png", dpi=150)
plt.close(fig)

actions = np.array([-1.0] * 50 + [1.0] * 50)
mean = float(np.mean(actions))
sigma = 0.14
grid = np.linspace(-2, 2, 2001)
normal = lambda x, mu: np.exp(-0.5 * ((x - mu) / sigma) ** 2) / (sigma * np.sqrt(2 * np.pi))
left, right = 0.5 * normal(grid, -1), 0.5 * normal(grid, 1)
fig, ax = plt.subplots(figsize=(8.4, 4.2), constrained_layout=True)
ax.plot(grid, left + right, color="#2c7059", linewidth=2.5, label="Illustrative two-mode Gaussian mixture")
ax.fill_between(grid, left, alpha=0.2, color="#2c7059")
ax.fill_between(grid, right, alpha=0.2, color="#2c7059")
ax.axvline(mean, color="#a64b35", linewidth=2, linestyle="--", label="MSE-optimal constant prediction: 0")
ax.set(xlabel="Action", ylabel="Probability density", title="Two valid action modes need not have a valid average")
ax.legend(fontsize=10)
fig.savefig(ASSETS / "multimodal-mean.png", dpi=150)
plt.close(fig)

prior = np.array([0.6, 0.4])
likelihood = np.array([0.8, 0.2])
q = np.array([0.7, 0.3])
evidence = float(prior @ likelihood)
posterior = prior * likelihood / evidence
kl_q_prior = float(np.sum(q * np.log(q / prior)))
reconstruction = float(np.sum(q * np.log(likelihood)))
elbo = reconstruction - kl_q_prior
gap = float(np.sum(q * np.log(q / posterior)))
chain = np.array([[0.2, 0.3, 0.5], [0.6, 0.1, 0.3]])
first = np.array([0.4, 0.6])
joint = first[:, None] * chain
eps, horizon = 0.01, 20
exact_absorbing_cost = float(np.sum(1 - (1 - eps) ** np.arange(1, horizon + 1)))
union_bound = eps * horizon * (horizon + 1) / 2
checks = {
    "center_data_underdetermined_min_norm_zero": weights[0] == 0,
    "training_labels_not_saturated": max(abs(x) for x, _ in data) < 1.25,
    "expert_labels_fit_linear_feedback": np.isclose(weights[-1], -0.8),
    "aggregate_preserves_initial_samples": history[-1]["samples"] == 200,
    "held_out_RMS_reduced_in_this_setup": metrics[1]["mean_RMS_state"] < metrics[0]["mean_RMS_state"],
    "MSE_constant_mean_zero": mean == 0,
    "MSE_mean_better_than_either_mode_for_point_loss": np.mean((actions - mean) ** 2) < np.mean((actions - 1) ** 2),
    "mixture_density_normalizes": np.isclose(np.trapezoid(left + right, grid), 1, atol=1e-6),
    "mixture_modes_have_greater_density_than_average": normal(-1, -1) + normal(-1, 1) > normal(0, -1) + normal(0, 1),
    "autoregressive_joint_normalizes": np.isclose(joint.sum(), 1),
    "autoregressive_joint_marginal_matches": np.allclose(joint.sum(axis=1), first),
    "ELBO_is_lower_bound": elbo <= np.log(evidence),
    "ELBO_gap_equals_posterior_KL": np.isclose(np.log(evidence) - elbo, gap),
    "ELBO_tight_for_true_posterior": np.isclose(np.sum(posterior * np.log(prior * likelihood / posterior)), np.log(evidence)),
    "absorbing_example_cost_below_union_bound": exact_absorbing_cost <= union_bound,
}
assert all(checks.values()), checks
summary = {
    "kind": "Synthetic scalar simulator, least-squares BC and three aggregation rounds; analytic mixture and discrete-latent ELBO",
    "python": platform.python_version(), "numpy": np.__version__, "matplotlib": matplotlib.__version__,
    "RL_training": False, "robot_simulator": False, "official_homework_executed": False,
    "training_seed_start": 7, "test_seeds": [1000, 1019], "initial_dataset": "20 identical center-state/expert-action pairs (0,0)",
    "state_update": "x_next=x+clip(weight*x,-1,1)+0.015+Normal(0,0.008)",
    "expert": "clip(-0.8*x,-1,1)", "aggregation_history": history, "metrics": metrics,
    "MSE_action_example": {"labels": [-1, 1], "MSE_optimal_constant": mean, "MSE": float(np.mean(actions**2)),
                         "mixture": "Illustrative fixed parameters, not a trained GMM"},
    "ELBO_discrete_example": {"prior": prior.tolist(), "likelihood": likelihood.tolist(), "q": q.tolist(),
                             "posterior": posterior.tolist(), "marginal": evidence, "log_marginal": float(np.log(evidence)),
                             "reconstruction": reconstruction, "KL_q_prior": kl_q_prior, "ELBO": elbo, "posterior_KL": gap},
    "absorbing_error_example": {"epsilon": eps, "T": horizon, "exact_expected_cost": exact_absorbing_cost, "union_bound": union_bound},
    "checks": {k: bool(v) for k, v in checks.items()}, "checks_passed": len(checks),
    "script_sha256": hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
}
(OUT / "summary.json").write_text(json.dumps(summary, indent=2) + "\n")
print(json.dumps(summary, indent=2))
