"""Compare executing one plan with re-planning after each measured position."""
from math import isclose


def simulate(goal, actual_gain, steps, replan):
    position = 0.0
    model_gain = 1.0
    plan = [(goal - position) / model_gain] + [0.0] * (steps - 1)
    positions = []
    for action in plan:
        if replan:
            action = (goal - position) / model_gain
        position += actual_gain * action
        positions.append(position)
    return positions


if __name__ == "__main__":
    for replan, expected in [(False, [0.8, 0.8, 0.8]), (True, [0.8, 0.96, 0.992])]:
        positions = simulate(goal=1.0, actual_gain=0.8, steps=3, replan=replan)
        assert all(isclose(x, y) for x, y in zip(positions, expected))
        print("replan" if replan else "open loop", [round(x, 3) for x in positions])
