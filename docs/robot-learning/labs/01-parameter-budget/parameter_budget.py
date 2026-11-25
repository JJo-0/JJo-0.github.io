"""Original counting exercise; no model training or external dependencies."""
import json


def parameter_count(d: int, width: int, gated: bool = False, bias: bool = False) -> int:
    if type(d) is not int or type(width) is not int or min(d, width) <= 0:
        raise ValueError('dimensions must be positive integers')
    matrices = 3 if gated else 2
    return matrices * d * width + ((2 if gated else 1) * width + d if bias else 0)


if __name__ == '__main__':
    print(json.dumps({
        'ffn': parameter_count(64, 192),
        'gated_same_width': parameter_count(64, 192, gated=True),
        'gated_matched_width': parameter_count(64, 128, gated=True),
        'bias_included': [parameter_count(64, 192, bias=True), parameter_count(64, 128, gated=True, bias=True)],
        'training': False,
    }, indent=2))
