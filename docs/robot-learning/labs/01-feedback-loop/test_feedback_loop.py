import math
import unittest
from feedback_loop import Config, PointEnvironment, feedback_policy, open_loop_policy, rollout, summarize


class FeedbackDemoTests(unittest.TestCase):
    def test_invalid_config(self):
        for kwargs in ({'dt': 0}, {'horizon': 0}, {'horizon': True}, {'gain': -1},
                       {'disturbance_step': 60}, {'goal': math.nan}):
            with self.subTest(kwargs=kwargs), self.assertRaises(ValueError):
                Config(**kwargs)

    def test_action_is_clipped(self):
        row = PointEnvironment(Config()).step(999)
        self.assertEqual(row['applied_action'], 0.5)
        self.assertAlmostEqual(row['next_observation'], 0.05)

    def test_invalid_action(self):
        for value in (math.nan, math.inf, -math.inf):
            with self.assertRaises(ValueError):
                PointEnvironment(Config()).step(value)

    def test_reward_uses_next_error(self):
        row = PointEnvironment(Config()).step(0.5)
        self.assertAlmostEqual(row['reward'], -0.95 - 0.0025)

    def test_goal_policy_returns_zero(self):
        self.assertEqual(feedback_policy(1.0, 0, Config()), 0.0)

    def test_horizon_and_reset(self):
        env = PointEnvironment(Config(horizon=1, disturbance_step=0))
        row = env.step(0)
        self.assertFalse(row['terminated'])
        self.assertTrue(row['truncated'])
        with self.assertRaises(RuntimeError):
            env.step(0)
        self.assertEqual(env.reset(), 0)
        self.assertEqual(env.steps, 0)

    def test_open_loop_ignores_observation(self):
        self.assertEqual(open_loop_policy(0, 2, Config()), open_loop_policy(100, 2, Config()))

    def test_disturbance_occurs_once(self):
        rows = rollout(feedback_policy, Config())
        self.assertEqual([r['step'] for r in rows if r['disturbance'] != 0], [10])

    def test_feedback_rejects_this_disturbance(self):
        cfg = Config()
        a, b = rollout(open_loop_policy, cfg), rollout(feedback_policy, cfg)
        self.assertAlmostEqual(summarize(a)['final_absolute_error'], 0.4)
        self.assertLess(summarize(b)['final_absolute_error'], 0.001)
        self.assertEqual(len(a), len(b))

    def test_deterministic_repeat(self):
        cfg = Config()
        self.assertEqual(rollout(feedback_policy, cfg), rollout(feedback_policy, cfg))

    def test_nominal_open_loop(self):
        rows = rollout(open_loop_policy, Config(disturbance=0))
        self.assertAlmostEqual(summarize(rows)['final_absolute_error'], 0)

    def test_negative_goal(self):
        rows = rollout(open_loop_policy, Config(goal=-1, disturbance=0))
        self.assertAlmostEqual(summarize(rows)['final_position'], -1)

    def test_summary_rejects_empty(self):
        with self.assertRaises(ValueError):
            summarize([])


if __name__ == '__main__':
    unittest.main()

