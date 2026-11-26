"""Deterministic teaching example: feedback control, NOT RL training.

Units: position in m, velocity action in m/s, dt in s. Disturbance is a
one-step position offset in m. No physical robot is controlled.
Python 3.10+; standard library only.
"""
from __future__ import annotations

import argparse
import csv
import json
import math
from dataclasses import dataclass
from pathlib import Path
from typing import Callable


@dataclass(frozen=True)
class Config:
    goal: float = 1.0
    dt: float = 0.1
    max_speed: float = 0.5
    horizon: int = 60
    gain: float = 2.0
    disturbance_step: int = 10  # zero-based transition index
    disturbance: float = 0.4

    def __post_init__(self) -> None:
        for name in ('goal', 'dt', 'max_speed', 'gain', 'disturbance'):
            if not math.isfinite(getattr(self, name)):
                raise ValueError(f'{name} must be finite')
        if self.dt <= 0 or self.max_speed <= 0 or self.gain <= 0:
            raise ValueError('dt, max_speed and gain must be positive')
        if type(self.horizon) is not int or self.horizon <= 0:
            raise ValueError('horizon must be a positive integer')
        if type(self.disturbance_step) is not int or not 0 <= self.disturbance_step < self.horizon:
            raise ValueError('disturbance_step must be an integer in [0, horizon)')


class PointEnvironment:
    def __init__(self, config: Config) -> None:
        self.config = config
        self.position = 0.0
        self.steps = 0

    def reset(self) -> float:
        self.position, self.steps = 0.0, 0
        return self.position

    def step(self, action: float, disturbance: float = 0.0) -> dict:
        if self.steps >= self.config.horizon:
            raise RuntimeError('episode horizon reached; call reset()')
        if not math.isfinite(action) or not math.isfinite(disturbance):
            raise ValueError('action and disturbance must be finite')
        c = self.config
        applied = max(-c.max_speed, min(c.max_speed, action))
        previous = self.position
        self.position += c.dt * applied + disturbance
        self.steps += 1
        error = c.goal - self.position
        # Illustrative reward only; this is not a learned objective or safety guarantee.
        reward = -abs(error) - 0.01 * applied**2
        return {'step': self.steps - 1, 'observation': previous,
                'requested_action': action, 'applied_action': applied,
                'disturbance': disturbance, 'next_observation': self.position,
                'reward': reward, 'absolute_error': abs(error),
                'terminated': False, 'truncated': self.steps >= c.horizon}


Policy = Callable[[float, int, Config], float]


def open_loop_policy(observation: float, step: int, config: Config) -> float:
    """Nominal time-indexed plan from x0=0; ignores actual observation."""
    del observation
    nominal_position = math.copysign(
        min(abs(config.goal), step * config.dt * config.max_speed), config.goal
    )
    return (config.goal - nominal_position) / config.dt


def feedback_policy(observation: float, step: int, config: Config) -> float:
    """Hand-designed proportional controller; no weights are learned."""
    del step
    return config.gain * (config.goal - observation)


def rollout(policy: Policy, config: Config) -> list[dict]:
    env = PointEnvironment(config)
    observation = env.reset()
    rows = []
    for t in range(config.horizon):
        disturbance = config.disturbance if t == config.disturbance_step else 0.0
        row = env.step(policy(observation, t, config), disturbance)
        rows.append(row)
        observation = row['next_observation']
    return rows


def summarize(rows: list[dict]) -> dict:
    if not rows:
        raise ValueError('rows must not be empty')
    return {'steps': len(rows), 'final_position': rows[-1]['next_observation'],
            'final_absolute_error': rows[-1]['absolute_error'],
            'undiscounted_return': sum(row['reward'] for row in rows)}


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--out', type=Path, default=Path('results'))
    args = parser.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)
    output = {'experiment': 'deterministic-feedback-demo',
              'is_rl_training': False, 'physical_robot': False,
              'seed': None, 'seed_reason': 'No random operation is used.',
              'scenarios': {}}
    for label, amount in (('nominal', 0.0), ('disturbed', 0.4)):
        cfg = Config(disturbance=amount)
        output['scenarios'][label] = {}
        for name, policy in (('open_loop', open_loop_policy), ('feedback', feedback_policy)):
            rows = rollout(policy, cfg)
            with (args.out / f'{label}-{name}.csv').open('w', newline='', encoding='utf-8') as f:
                writer = csv.DictWriter(f, fieldnames=list(rows[0]))
                writer.writeheader()
                writer.writerows(rows)
            output['scenarios'][label][name] = summarize(rows)
    text = json.dumps(output, indent=2, ensure_ascii=False, allow_nan=False)
    (args.out / 'summary.json').write_text(text + '\n', encoding='utf-8')
    print(text)


if __name__ == '__main__':
    main()

